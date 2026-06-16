import os
import time
import torch
from typing import List, Optional, Literal
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from transformers import AutoModelForCausalLM, AutoTokenizer


# ============================================================
# Load environment variables
# ============================================================

load_dotenv()

APP_NAME = os.getenv("APP_NAME", "PralayAI Inference API")
APP_HOST = os.getenv("APP_HOST", "0.0.0.0")
APP_PORT = int(os.getenv("APP_PORT", "5000"))

HF_TOKEN = os.getenv("HF_TOKEN")
HF_MODEL_REPO = os.getenv("HF_MODEL_REPO", "OMCHOKSI108/Paralay1.1-Merged")

MAX_NEW_TOKENS = int(os.getenv("MAX_NEW_TOKENS", "512"))
DEFAULT_TEMPERATURE = float(os.getenv("DEFAULT_TEMPERATURE", "0.1"))
DEFAULT_TOP_P = float(os.getenv("DEFAULT_TOP_P", "0.8"))

CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173",
)

SYSTEM_PROMPT = os.getenv(
    "SYSTEM_PROMPT",
    (
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
    ),
)


# ============================================================
# Global model objects
# ============================================================

tokenizer = None
model = None
device_info = None


# ============================================================
# Request / Response Schemas
# ============================================================

class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class GenerateRequest(BaseModel):
    prompt: Optional[str] = Field(default=None, description="Simple single prompt")
    messages: Optional[List[ChatMessage]] = Field(default=None, description="Chat-style messages")

    max_new_tokens: int = Field(default=MAX_NEW_TOKENS, ge=1, le=2048)
    temperature: float = Field(default=DEFAULT_TEMPERATURE, ge=0.0, le=2.0)
    top_p: float = Field(default=DEFAULT_TOP_P, ge=0.0, le=1.0)
    do_sample: bool = True


class GenerateResponse(BaseModel):
    model: str
    response: str
    latency_seconds: float
    device: str


# ============================================================
# Model Loading
# ============================================================

def get_dtype_and_device():
    if torch.cuda.is_available():
        return torch.float16, "auto", "cuda"

    return torch.float32, None, "cpu"


def load_model():
    global tokenizer, model, device_info

    if not HF_TOKEN:
        print("WARNING: HF_TOKEN is missing. Public model download may still work if repo is public.")

    dtype, device_map, device_label = get_dtype_and_device()
    device_info = device_label

    print("=" * 80)
    print(f"Loading model: {HF_MODEL_REPO}")
    print(f"Device: {device_label}")
    print(f"Dtype: {dtype}")
    print("=" * 80)

    tokenizer = AutoTokenizer.from_pretrained(
        HF_MODEL_REPO,
        token=HF_TOKEN,
        trust_remote_code=True,
    )

    load_kwargs = {
        "torch_dtype": dtype,
        "trust_remote_code": True,
        "low_cpu_mem_usage": True,
        "token": HF_TOKEN,
    }

    if device_map is not None:
        load_kwargs["device_map"] = device_map

    model = AutoModelForCausalLM.from_pretrained(
        HF_MODEL_REPO,
        **load_kwargs,
    )

    model.eval()

    print("=" * 80)
    print("Model loaded successfully.")
    print("=" * 80)


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model()
    yield


# ============================================================
# FastAPI App
# ============================================================

app = FastAPI(
    title=APP_NAME,
    version="1.0.0",
    description="PralayAI local / Render inference API using Hugging Face merged model.",
    lifespan=lifespan,
)

origins = [origin.strip() for origin in CORS_ORIGINS.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Prompt Formatting
# ============================================================

def build_prompt(request: GenerateRequest) -> str:
    if request.messages:
        messages = [msg.model_dump() for msg in request.messages]

        has_system = any(msg["role"] == "system" for msg in messages)

        if not has_system:
            messages.insert(
                0,
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
            )

        return tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )

    if request.prompt:
        messages = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": request.prompt,
            },
        ]

        return tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )

    raise HTTPException(
        status_code=400,
        detail="Either 'prompt' or 'messages' is required.",
    )


# ============================================================
# Routes
# ============================================================

@app.get("/")
def root():
    return {
        "name": APP_NAME,
        "status": "running",
        "model": HF_MODEL_REPO,
        "device": device_info,
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None and tokenizer is not None,
        "model": HF_MODEL_REPO,
        "device": device_info,
    }


@app.post("/generate", response_model=GenerateResponse)
def generate(request: GenerateRequest):
    if model is None or tokenizer is None:
        raise HTTPException(
            status_code=503,
            detail="Model is not loaded yet.",
        )

    started_at = time.time()

    try:
        prompt = build_prompt(request)

        inputs = tokenizer(
            prompt,
            return_tensors="pt",
        )

        if torch.cuda.is_available():
            inputs = inputs.to(model.device)

        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=request.max_new_tokens,
                temperature=request.temperature,
                top_p=request.top_p,
                do_sample=request.do_sample,
                pad_token_id=tokenizer.eos_token_id,
            )

        generated_tokens = outputs[0][inputs["input_ids"].shape[-1]:]

        response = tokenizer.decode(
            generated_tokens,
            skip_special_tokens=True,
        ).strip()

        latency = round(time.time() - started_at, 3)

        return GenerateResponse(
            model=HF_MODEL_REPO,
            response=response,
            latency_seconds=latency,
            device=device_info or "unknown",
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Inference failed: {str(error)}",
        )


@app.post("/chat", response_model=GenerateResponse)
def chat(request: GenerateRequest):
    return generate(request)


# ============================================================
# Local runner
# ============================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.inference:app",
        host=APP_HOST,
        port=APP_PORT,
        reload=False,
    )