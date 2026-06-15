import os
import shutil
import subprocess
import time
from pathlib import Path

import torch
from dotenv import load_dotenv
from huggingface_hub import HfApi, login, create_repo
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel


PROJECT_ROOT = Path(__file__).resolve().parents[1]
ENV_PATH = PROJECT_ROOT / ".env"

load_dotenv(ENV_PATH)

HF_TOKEN = os.getenv("HF_TOKEN")
ADAPTER_REPO = os.getenv("ADAPTER_REPO", "OMCHOKSI108/Paralay1.1")
BASE_MODEL = os.getenv("BASE_MODEL", "Qwen/Qwen2.5-1.5B-Instruct")
MERGED_REPO = os.getenv("MERGED_REPO", "OMCHOKSI108/Paralay1.1-Merged")

LOCAL_ADAPTER_DIR = PROJECT_ROOT / os.getenv("LOCAL_ADAPTER_DIR", "model_ops/adapter_repo")
LOCAL_MERGED_DIR = PROJECT_ROOT / os.getenv("LOCAL_MERGED_DIR", "model_ops/merged_model_local")
HF_HOME = PROJECT_ROOT / os.getenv("HF_HOME", "model_ops/hf_cache")

os.environ["HF_HOME"] = str(HF_HOME)


def run_command(command: list[str]) -> None:
    print(f"\n$ {' '.join(command)}")
    subprocess.run(command, check=True)


def check_requirements() -> None:
    if not HF_TOKEN:
        raise RuntimeError("HF_TOKEN is missing in root .env")

    if "/" not in MERGED_REPO:
        raise RuntimeError("MERGED_REPO must look like username/repo-name")

    print("Configuration:")
    print(f"  Adapter repo : {ADAPTER_REPO}")
    print(f"  Base model   : {BASE_MODEL}")
    print(f"  Merged repo  : {MERGED_REPO}")
    print(f"  Adapter dir  : {LOCAL_ADAPTER_DIR}")
    print(f"  Merged dir   : {LOCAL_MERGED_DIR}")
    print(f"  HF cache     : {HF_HOME}")


def clone_adapter_repo() -> None:
    if LOCAL_ADAPTER_DIR.exists():
        print(f"\nRemoving old adapter repo: {LOCAL_ADAPTER_DIR}")
        shutil.rmtree(LOCAL_ADAPTER_DIR)

    LOCAL_ADAPTER_DIR.parent.mkdir(parents=True, exist_ok=True)

    print(f"\nCloning adapter repo: {ADAPTER_REPO}")
    run_command([
        "git",
        "clone",
        f"https://huggingface.co/{ADAPTER_REPO}",
        str(LOCAL_ADAPTER_DIR),
    ])

    required_files = [
        LOCAL_ADAPTER_DIR / "adapter_config.json",
        LOCAL_ADAPTER_DIR / "adapter_model.safetensors",
    ]

    missing = [str(file) for file in required_files if not file.exists()]
    if missing:
        raise RuntimeError(f"Adapter repo is missing required files: {missing}")


def get_dtype_and_device_map():
    cuda_available = torch.cuda.is_available()

    if cuda_available:
        print("\nCUDA detected. Using float16 with device_map='auto'.")
        return torch.float16, "auto"

    print("\nCUDA not detected. Using float32 on CPU. This can be slow.")
    return torch.float32, None


def merge_model() -> None:
    if LOCAL_MERGED_DIR.exists():
        print(f"\nRemoving old merged output: {LOCAL_MERGED_DIR}")
        shutil.rmtree(LOCAL_MERGED_DIR)

    LOCAL_MERGED_DIR.mkdir(parents=True, exist_ok=True)

    dtype, device_map = get_dtype_and_device_map()

    print("\nLoading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(
        BASE_MODEL,
        trust_remote_code=True,
        token=HF_TOKEN,
    )

    print("\nLoading base model...")
    load_kwargs = {
        "torch_dtype": dtype,
        "trust_remote_code": True,
        "token": HF_TOKEN,
        "low_cpu_mem_usage": True,
    }

    if device_map is not None:
        load_kwargs["device_map"] = device_map

    base_model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL,
        **load_kwargs,
    )

    print("\nLoading LoRA adapter from local cloned repo...")
    model = PeftModel.from_pretrained(
        base_model,
        str(LOCAL_ADAPTER_DIR),
        token=HF_TOKEN,
    )

    print("\nMerging LoRA adapter into base model...")
    model = model.merge_and_unload()

    print("\nSaving merged model locally...")
    model.save_pretrained(
        LOCAL_MERGED_DIR,
        safe_serialization=True,
        max_shard_size="2GB",
    )
    tokenizer.save_pretrained(LOCAL_MERGED_DIR)

    print(f"\nMerged model saved at: {LOCAL_MERGED_DIR}")


def test_local_model() -> None:
    print("\nTesting merged model locally with a small prompt...")

    dtype, device_map = get_dtype_and_device_map()

    tokenizer = AutoTokenizer.from_pretrained(
        LOCAL_MERGED_DIR,
        trust_remote_code=True,
    )

    load_kwargs = {
        "torch_dtype": dtype,
        "trust_remote_code": True,
        "low_cpu_mem_usage": True,
    }

    if device_map is not None:
        load_kwargs["device_map"] = device_map

    model = AutoModelForCausalLM.from_pretrained(
        LOCAL_MERGED_DIR,
        **load_kwargs,
    )

    messages = [
        {
            "role": "system",
            "content": (
                "You are PralayAI, a defensive cybersecurity assistant created by Om Choksi. "
                "You only help with safe and defensive cybersecurity education."
            ),
        },
        {
            "role": "user",
            "content": "Explain incident response in 5 defensive steps.",
        },
    ]

    prompt = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
    )

    inputs = tokenizer(prompt, return_tensors="pt")

    if torch.cuda.is_available():
        inputs = inputs.to(model.device)

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=180,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
        )

    response = tokenizer.decode(
        outputs[0][inputs["input_ids"].shape[-1]:],
        skip_special_tokens=True,
    )

    print("\nLocal test response:")
    print("-" * 80)
    print(response.strip())
    print("-" * 80)


def push_to_huggingface() -> None:
    print("\nLogging into Hugging Face...")
    login(token=HF_TOKEN, add_to_git_credential=True)

    print(f"\nCreating repo if it does not exist: {MERGED_REPO}")
    create_repo(
        repo_id=MERGED_REPO,
        repo_type="model",
        exist_ok=True,
        token=HF_TOKEN,
    )

    print("\nUploading merged model folder to Hugging Face...")
    api = HfApi(token=HF_TOKEN)

    api.upload_folder(
        folder_path=str(LOCAL_MERGED_DIR),
        repo_id=MERGED_REPO,
        repo_type="model",
        commit_message="Upload merged PralayAI model",
    )

    print("\nUpload complete.")


def print_final_notes() -> None:
    model_url = f"https://huggingface.co/{MERGED_REPO}"

    print("\n" + "=" * 90)
    print("SUCCESS: Merged model pushed to Hugging Face")
    print("=" * 90)
    print(f"Model repo URL: {model_url}")

    print("\nImportant:")
    print("This script cannot create a free dedicated Hugging Face Inference Endpoint.")
    print("Dedicated Inference Endpoints require billing/payment setup on Hugging Face.")
    print("For free usage, use local inference first or temporary Colab inference.")

    print("\nYour backend .env should use this for now:")
    print(f"HF_MODEL_REPO={MERGED_REPO}")
    print("HF_ENDPOINT_URL=")

    print("\nIf later you create paid HF Inference Endpoint, then set:")
    print("HF_ENDPOINT_URL=https://xxxxxxxx.region.aws.endpoints.huggingface.cloud")
    print("=" * 90)


def main() -> None:
    start = time.time()

    check_requirements()
    clone_adapter_repo()
    merge_model()
    test_local_model()
    push_to_huggingface()
    print_final_notes()

    total = round(time.time() - start, 2)
    print(f"\nTotal runtime: {total} seconds")


if __name__ == "__main__":
    main()