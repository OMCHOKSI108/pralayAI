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
DEFAULT_TEMPERATURE = float(os.getenv("DEFAULT_TEMPERATURE", "0.7"))
DEFAULT_TOP_P = float(os.getenv("DEFAULT_TOP_P", "0.9"))

CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173",
)

SYSTEM_PROMPT = os.getenv(
    "SYSTEM_PROMPT",
    (
        "You are PralayAI, a defensive cybersecurity assistant created by Om Choksi. "
        "You help with cybersecurity education, incident response, log analysis, "
        "cloud security, malware defense, and safe security learning. "
        "Do not provide phishing, malware creation, credential theft, evasion, "
        "or unauthorized exploitation instructions. "
        "If a request is unsafe, refuse briefly and provide a safe defensive alternative."
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
# Safety Layer
# ============================================================

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


def extract_user_text(request: GenerateRequest) -> str:
    if request.prompt:
        return request.prompt

    if request.messages:
        return "\n".join(
            msg.content for msg in request.messages if msg.role == "user"
        )

    return ""


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

    user_text = extract_user_text(request)

    if is_unsafe(user_text):
        return GenerateResponse(
            model=HF_MODEL_REPO,
            response=safe_refusal(),
            latency_seconds=0.0,
            device=device_info or "unknown",
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