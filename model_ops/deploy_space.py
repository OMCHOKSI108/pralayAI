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

    print("\n" + "=" * 90)
    print("DEPLOYMENT UPLOADED")
    print("=" * 90)
    print(f"Space repo: https://huggingface.co/spaces/{HF_SPACE_REPO}")
    print(f"Public API base URL: {public_url}")
    print(f"Docs URL: {public_url}/docs")
    print(f"Generate API: {public_url}/generate")
    print(f"Chat API: {public_url}/chat")
    print("\nTest after build completes:")
    print(f'''curl -X POST {public_url}/generate \\
-H "Content-Type: application/json" \\
-d '{{"prompt":"Explain incident response in 5 defensive steps.","max_new_tokens":200}}' ''')
    print("=" * 90)


if __name__ == "__main__":
    main()
