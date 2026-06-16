import os
import time
import torch
from typing import List, Optional, Literal
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from transformers import AutoModelForCausalLM, AutoTokenizer


HF_TOKEN = os.getenv("HF_TOKEN")
HF_MODEL_REPO = os.getenv("HF_MODEL_REPO", "OMCHOKSI108/Paralay1.1-Merged")

MAX_NEW_TOKENS = int(os.getenv("MAX_NEW_TOKENS", "512"))
DEFAULT_TEMPERATURE = float(os.getenv("DEFAULT_TEMPERATURE", "0.1"))
DEFAULT_TOP_P = float(os.getenv("DEFAULT_TOP_P", "0.8"))

SYSTEM_PROMPT = (
    "You are PralayAI, a defensive cybersecurity assistant created by Om Choksi.\n\n"
    "DOMAIN & SCOPE:\n"
    "- You help with: cybersecurity education, incident response, log analysis,\n"
    "  cloud security, malware defense, secure coding, network security,\n"
    "  cryptography, OSINT, threat modeling, digital forensics, and general\n"
    "  technology concepts (programming, math, science).\n"
    "- If a question falls OUTSIDE these domains, politely state that the topic\n"
    "  is outside your scope and decline to answer.\n\n"
    "ENTITY DISCLAIMER:\n"
    "- You do NOT have verified information about specific companies,\n"
    "  organizations, or individuals unless provided via RAG context or web\n"
    "  search results.\n"
    "- If asked about a company, person, or organization without verified\n"
    "  sources, respond with: \"I do not have verified information about that\n"
    "  specific entity.\"\n"
    "- NEVER fabricate threat intelligence narratives, breach details, or\n"
    "  security incidents about any entity.\n\n"
    "THREAT INTELLIGENCE NARRATIVE PREVENTION (CRITICAL):\n"
    "- Never generate threat intelligence reports, APT attribution,\n"
    "  state-sponsored actor narratives, or detailed breach timelines unless\n"
    "  directly supported by provided context.\n"
    "- When asked about a topic you don't have verified information on, say so\n"
    "  directly. Do not make up details.\n"
    "- Avoid specific claims like \"state-sponsored\", \"APT28\", \"Fancy Bear\",\n"
    "  \"Lazarus Group\", etc. unless they are part of well-established\n"
    "  cybersecurity education.\n"
    "- If the user mentions a company, person, or group name in a non-cyber\n"
    "  context, do NOT pivot to a threat intelligence narrative about them.\n\n"
    "SAFETY & REFUSAL:\n"
    "- Do NOT provide instructions for: phishing, malware creation, credential\n"
    "  theft, evasion, unauthorized access, or exploitation.\n"
    "- If a request is unsafe, refuse briefly and offer a defensive alternative.\n\n"
    "PERSONALITY & STYLE:\n"
    "- Respond in clear, well-structured language.\n"
    "- Be concise but thorough. Prefer educational explanations.\n"
    "- If you're unsure, state your uncertainty.\n"
    "- Do NOT use emoji.\n"
    "- Do NOT impersonate or roleplay as a different entity.\n\n"
    "CITATION RULES:\n"
    "- Do NOT cite sources that were not provided to you.\n"
    "- Do not fabricate URLs or reference documents that were not provided.\n"
    "- If no sources are provided, answer from general knowledge and note that."
)

tokenizer = None
model = None


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class GenerateRequest(BaseModel):
    prompt: Optional[str] = None
    messages: Optional[List[ChatMessage]] = None
    max_new_tokens: int = Field(default=MAX_NEW_TOKENS, ge=1, le=768)
    temperature: float = Field(default=DEFAULT_TEMPERATURE, ge=0.0, le=2.0)
    top_p: float = Field(default=DEFAULT_TOP_P, ge=0.0, le=1.0)
    do_sample: bool = True


BLOCKED_PATTERNS = [
    "write phishing email",
    "create phishing email",
    "make phishing page",
    "steal password",
    "dump password",
    "credential theft",
    "keylogger code",
    "create keylogger",
    "write malware",
    "create malware",
    "ransomware code",
    "reverse shell payload",
    "bypass antivirus",
    "evade detection",
    "persistence malware",
    "unauthorized access",
]


def is_unsafe(text: str) -> bool:
    lowered = text.lower()
    return any(pattern in lowered for pattern in BLOCKED_PATTERNS)


def safe_refusal() -> str:
    return (
        "I can’t help with creating phishing, malware, credential theft, evasion, "
        "or unauthorized exploitation content. I can help with defensive alternatives "
        "such as detection logic, incident response steps, log analysis, hardening, "
        "security awareness, or threat prevention."
    )


def load_model():
    global tokenizer, model

    print("=" * 80)
    print(f"Loading model: {HF_MODEL_REPO}")
    print("Device: CPU Space")
    print("=" * 80)

    tokenizer = AutoTokenizer.from_pretrained(
        HF_MODEL_REPO,
        token=HF_TOKEN,
        trust_remote_code=True,
    )

    model = AutoModelForCausalLM.from_pretrained(
        HF_MODEL_REPO,
        token=HF_TOKEN,
        trust_remote_code=True,
        torch_dtype=torch.float32,
        low_cpu_mem_usage=True,
    )

    model.eval()

    print("=" * 80)
    print("Model loaded successfully.")
    print("=" * 80)


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model()
    yield


app = FastAPI(
    title="PralayAI Inference API",
    version="1.0.0",
    description="Free Hugging Face Space CPU inference API for PralayAI.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def extract_user_text(req: GenerateRequest) -> str:
    if req.prompt:
        return req.prompt

    if req.messages:
        return "\n".join(m.content for m in req.messages if m.role == "user")

    return ""


def build_prompt(req: GenerateRequest) -> str:
    if req.messages:
        messages = [m.model_dump() for m in req.messages]

        if not any(m["role"] == "system" for m in messages):
            messages.insert(0, {"role": "system", "content": SYSTEM_PROMPT})

        return tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )

    if req.prompt:
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": req.prompt},
        ]

        return tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )

    raise HTTPException(status_code=400, detail="Either prompt or messages is required.")


@app.get("/")
def root():
    return {
        "name": "PralayAI Inference API",
        "status": "running",
        "model": HF_MODEL_REPO,
        "device": "cpu",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None and tokenizer is not None,
        "model": HF_MODEL_REPO,
        "device": "cpu",
    }


@app.post("/generate")
def generate(req: GenerateRequest):
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Model is not loaded yet.")

    user_text = extract_user_text(req)

    if is_unsafe(user_text):
        return {
            "model": HF_MODEL_REPO,
            "response": safe_refusal(),
            "latency_seconds": 0,
            "device": "cpu",
        }

    started = time.time()

    try:
        prompt = build_prompt(req)
        inputs = tokenizer(prompt, return_tensors="pt")

        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=req.max_new_tokens,
                temperature=req.temperature,
                top_p=req.top_p,
                do_sample=req.do_sample,
                pad_token_id=tokenizer.eos_token_id,
            )

        generated_tokens = outputs[0][inputs["input_ids"].shape[-1]:]
        response = tokenizer.decode(generated_tokens, skip_special_tokens=True).strip()

        return {
            "model": HF_MODEL_REPO,
            "response": response,
            "latency_seconds": round(time.time() - started, 3),
            "device": "cpu",
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(error)}")


@app.post("/chat")
def chat(req: GenerateRequest):
    return generate(req)
