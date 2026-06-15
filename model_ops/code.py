from pathlib import Path
import textwrap

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SPACE_DIR = PROJECT_ROOT / "model_ops" / "hf_space_inference_api"


def write_file(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(textwrap.dedent(content).strip() + "\n", encoding="utf-8")
    print(f"Created: {path}")


def main():
    SPACE_DIR.mkdir(parents=True, exist_ok=True)

    # ------------------------------------------------------------
    # File 1: README.md
    # ------------------------------------------------------------
    write_file(
        SPACE_DIR / "README.md",
        """
        ---
        title: PralayAI Inference API
        emoji: 🛡️
        colorFrom: blue
        colorTo: gray
        sdk: docker
        app_port: 7860
        pinned: false
        license: apache-2.0
        ---

        # PralayAI Inference API

        FastAPI Docker Space for serving the merged PralayAI model.

        ## Endpoints

        - `GET /`
        - `GET /health`
        - `POST /generate`
        - `POST /chat`

        ## Example Request

        ```bash
        curl -X POST https://OMCHOKSI108-pralayai-inference-api.hf.space/generate \\
          -H "Content-Type: application/json" \\
          -d '{"prompt":"Explain incident response in 5 defensive steps.","max_new_tokens":200}'
        ```
        """,
    )

    # ------------------------------------------------------------
    # File 2: requirements.txt
    # ------------------------------------------------------------
    write_file(
        SPACE_DIR / "requirements.txt",
        """
        fastapi
        uvicorn[standard]
        torch
        transformers
        accelerate
        safetensors
        sentencepiece
        protobuf
        pydantic
        """,
    )

    # ------------------------------------------------------------
    # File 3: Dockerfile
    # ------------------------------------------------------------
    write_file(
        SPACE_DIR / "Dockerfile",
        """
        FROM python:3.11-slim

        WORKDIR /app

        ENV PYTHONUNBUFFERED=1
        ENV HF_HOME=/data/.huggingface
        ENV TRANSFORMERS_CACHE=/data/.huggingface/transformers

        RUN apt-get update && apt-get install -y --no-install-recommends \\
            git \\
            && rm -rf /var/lib/apt/lists/*

        COPY requirements.txt .

        RUN pip install --no-cache-dir --upgrade pip && \\
            pip install --no-cache-dir -r requirements.txt

        COPY app.py .

        EXPOSE 7860

        CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
        """,
    )

    # ------------------------------------------------------------
    # File 4: .gitignore
    # ------------------------------------------------------------
    write_file(
        SPACE_DIR / ".gitignore",
        """
        __pycache__/
        *.pyc
        .env
        .cache/
        """,
    )

    # ------------------------------------------------------------
    # File 5: app.py
    # ------------------------------------------------------------
    write_file(
        SPACE_DIR / "app.py",
        """
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

        MAX_NEW_TOKENS = int(os.getenv("MAX_NEW_TOKENS", "256"))
        DEFAULT_TEMPERATURE = float(os.getenv("DEFAULT_TEMPERATURE", "0.7"))
        DEFAULT_TOP_P = float(os.getenv("DEFAULT_TOP_P", "0.9"))

        SYSTEM_PROMPT = (
            "You are PralayAI, a defensive cybersecurity assistant created by Om Choksi. "
            "You help with cybersecurity education, incident response, log analysis, "
            "cloud security, malware defense, and safe security learning. "
            "Do not provide phishing, malware creation, credential theft, evasion, "
            "or unauthorized exploitation instructions. "
            "If a request is unsafe, refuse briefly and provide a safe defensive alternative."
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
                return "\\n".join(m.content for m in req.messages if m.role == "user")

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
        """,
    )

    # ------------------------------------------------------------
    # File 6: deploy_space.py
    # ------------------------------------------------------------
    write_file(
        PROJECT_ROOT / "model_ops" / "deploy_space.py",
        """
        import os
        from pathlib import Path

        from dotenv import load_dotenv
        from huggingface_hub import HfApi, create_repo, whoami


        PROJECT_ROOT = Path(__file__).resolve().parents[1]
        SPACE_DIR = PROJECT_ROOT / "model_ops" / "hf_space_inference_api"

        load_dotenv(PROJECT_ROOT / ".env")

        HF_TOKEN = os.getenv("HF_TOKEN")
        HF_MODEL_REPO = os.getenv("HF_MODEL_REPO", "OMCHOKSI108/Paralay1.1-Merged")
        HF_SPACE_REPO = os.getenv("HF_SPACE_REPO", "OMCHOKSI108/pralayai-inference-api")


        def main():
            if not HF_TOKEN:
                raise RuntimeError("HF_TOKEN missing in root .env")

            if not SPACE_DIR.exists():
                raise RuntimeError(f"Space folder not found: {SPACE_DIR}. Run python model_ops/code.py first.")

            api = HfApi(token=HF_TOKEN)

            print("Checking Hugging Face account...")
            print(whoami(token=HF_TOKEN))

            print(f"Creating Docker Space if not exists: {HF_SPACE_REPO}")

            create_repo(
                repo_id=HF_SPACE_REPO,
                repo_type="space",
                space_sdk="docker",
                exist_ok=True,
                token=HF_TOKEN,
                private=False,
            )

            print("Setting Space secrets/variables...")

            try:
                api.add_space_secret(
                    repo_id=HF_SPACE_REPO,
                    key="HF_TOKEN",
                    value=HF_TOKEN,
                )
            except Exception as error:
                print(f"Warning: could not set HF_TOKEN secret automatically: {error}")

            try:
                api.add_space_variable(
                    repo_id=HF_SPACE_REPO,
                    key="HF_MODEL_REPO",
                    value=HF_MODEL_REPO,
                )
                api.add_space_variable(
                    repo_id=HF_SPACE_REPO,
                    key="MAX_NEW_TOKENS",
                    value="256",
                )
            except Exception as error:
                print(f"Warning: could not set Space variables automatically: {error}")

            print(f"Uploading files from: {SPACE_DIR}")

            api.upload_folder(
                folder_path=str(SPACE_DIR),
                repo_id=HF_SPACE_REPO,
                repo_type="space",
                commit_message="Deploy PralayAI FastAPI Docker inference API",
            )

            username, space_name = HF_SPACE_REPO.split("/", 1)
            public_url = f"https://{username}-{space_name}.hf.space"

            print("\\n" + "=" * 90)
            print("DEPLOYMENT UPLOADED")
            print("=" * 90)
            print(f"Space repo: https://huggingface.co/spaces/{HF_SPACE_REPO}")
            print(f"Public API base URL: {public_url}")
            print(f"Docs URL: {public_url}/docs")
            print(f"Generate API: {public_url}/generate")
            print(f"Chat API: {public_url}/chat")
            print("\\nTest after build completes:")
            print(f'''curl -X POST {public_url}/generate \\\\
  -H "Content-Type: application/json" \\\\
  -d '{{"prompt":"Explain incident response in 5 defensive steps.","max_new_tokens":200}}' ''')
            print("=" * 90)


        if __name__ == "__main__":
            main()
        """,
    )

    print("\nDONE.")
    print(f"Generated Hugging Face Space files inside: {SPACE_DIR}")
    print("\nNext run:")
    print("python model_ops/deploy_space.py")


if __name__ == "__main__":
    main()