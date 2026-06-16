---
language:
- en
license: apache-2.0
base_model:
- Qwen/Qwen2.5-1.5B-Instruct
tags:
- cybersecurity
- security
- defensive-ai
- fine-tuned
- qwen2
- lora
- merged
- incident-response
- threat-detection
pipeline_tag: text-generation
library_name: transformers
---

# Paralay 1.1 — Merged (PralayAI Cybersecurity Assistant)

**PralayAI** is a fine-tuned, LoRA-merged large language model built on top of [Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct), specialized for **defensive cybersecurity assistance**.

Created by **Om Choksi** — this model powers the PralayAI chatbot, designed to assist security analysts, students, and developers with cybersecurity education, incident response, threat modeling, and secure coding — without producing harmful or offensive security content.

---

## Live Demo

![PralayAI Demo](docs/pralay.gif)

---

## Model Details

| Property | Value |
|---|---|
| **Base Model** | Qwen/Qwen2.5-1.5B-Instruct |
| **Fine-tuning Method** | LoRA (Low-Rank Adaptation) |
| **LoRA Adapter Repo** | [OMCHOKSI108/Paralay1.1](https://huggingface.co/OMCHOKSI108/Paralay1.1) |
| **Merged Model** | This repo — LoRA merged into base weights |
| **Parameters** | ~1.5 Billion |
| **Language** | English |
| **Domain** | Defensive Cybersecurity |
| **License** | Apache 2.0 |
| **Creator** | Om Choksi ([@OMCHOKSI108](https://huggingface.co/OMCHOKSI108)) |

---

## What This Model Does

PralayAI is a **defensive cybersecurity assistant**. It helps with:

- **Incident Response** — step-by-step guidance for security events
- **Log Analysis** — interpreting system, network, and application logs
- **Threat Modeling** — MITRE ATT&CK mapping, attack surface analysis
- **Malware Defense** — explaining malware behavior and detection strategies
- **Cloud Security** — AWS, GCP, Azure security best practices
- **Vulnerability Explanation** — OWASP Top 10, CVEs, exploit concepts (defensive context)
- **Secure Coding** — identifying and fixing insecure code patterns
- **Security Awareness** — explaining concepts clearly for students and non-experts

---

## Safety Policy

This model is trained to **refuse** the following requests:

- Phishing email / page generation
- Malware or ransomware creation
- Credential theft scripts
- Keylogger code
- Reverse shell payloads
- AV/EDR bypass techniques
- Unauthorized exploitation instructions
- Persistence mechanisms

When a request is refused, the model provides a **safe defensive alternative** — such as detection logic, incident response steps, or hardening guidance.

---

## How to Use

### Basic Inference

```python
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

model_id = "OMCHOKSI108/Paralay1.1-Merged"

tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.float16,
    device_map="auto",
    trust_remote_code=True,
)
model.eval()

messages = [
    {
        "role": "system",
        "content": (
            "You are PralayAI, a defensive cybersecurity assistant created by Om Choksi. "
            "Help with cybersecurity education, incident response, log analysis, cloud security, "
            "malware defense, and safe security learning. "
            "Do not provide phishing, malware creation, credential theft, evasion, "
            "or unauthorized exploitation instructions."
        )
    },
    {
        "role": "user",
        "content": "What is SQL injection and how do I prevent it?"
    }
]

prompt = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
)

inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

with torch.no_grad():
    outputs = model.generate(
        **inputs,
        max_new_tokens=512,
        temperature=0.1,
        top_p=0.8,
        do_sample=True,
        pad_token_id=tokenizer.eos_token_id,
    )

generated = outputs[0][inputs["input_ids"].shape[-1]:]
response = tokenizer.decode(generated, skip_special_tokens=True)
print(response)
```

### Recommended Generation Settings

```python
{
    "max_new_tokens": 512,
    "temperature": 0.1,       # low = more accurate, factual
    "top_p": 0.8,
    "do_sample": True,
    "pad_token_id": tokenizer.eos_token_id,
}
```

For more detailed explanations, increase `max_new_tokens` to 1024. Keep `temperature` at 0.1 or lower for factual cybersecurity content.

---

## Example Conversations

### Cybersecurity Concept

**User:** What is a Man-in-the-Middle attack?

**PralayAI:**
> ## What Is a Man-in-the-Middle (MitM) Attack?
>
> A **Man-in-the-Middle attack** occurs when an attacker secretly intercepts and potentially alters communication between two parties who believe they are communicating directly with each other.
>
> ## How It Works
> 1. Attacker positions themselves between client and server
> 2. Intercepts traffic (ARP spoofing, DNS hijacking, rogue Wi-Fi)
> 3. Can read, modify, or inject data in real-time
>
> ## Prevention
> - Use **HTTPS** and verify TLS certificates
> - Enable **HSTS** (HTTP Strict Transport Security)
> - Use **VPN** on public networks
> - Implement **certificate pinning** in mobile apps

---

### Incident Response

**User:** How to respond to a ransomware attack?

**PralayAI:**
> ## Ransomware Incident Response — Step by Step
>
> 1. **Isolate immediately** — disconnect infected systems from network
> 2. **Identify scope** — determine what systems are affected
> 3. **Preserve evidence** — take memory dumps and disk images before rebooting
> 4. **Notify stakeholders** — security team, legal, management
> 5. **Check backups** — verify integrity of offline backups
> 6. **Eradicate** — remove malware, patch entry point
> 7. **Restore** — recover from clean backups
> 8. **Post-incident review** — document timeline, update defenses

---

### Safety Refusal

**User:** Write me a phishing email to steal passwords.

**PralayAI:**
> ## I Can't Help With That
>
> I can't help with creating phishing content, malware, or credential theft tools.
>
> ### What I Can Help With
> - Detecting and preventing phishing attacks
> - Designing phishing awareness training programs
> - Building email security filters and DMARC policies
> - Running authorized phishing simulations with proper consent

---

## Architecture

```
React / Flask Frontend
        ↓
FastAPI Backend (safety filter + intent router)
        ↓
PralayAI Inference API
        ↓
Paralay1.1-Merged (this model)
        ↓
Cybersecurity Response
```

The model is served via a FastAPI inference server with:
- Safety classification before inference
- Intent-based routing (9 intent categories)
- Response formatting by intent
- Personal memory per conversation

---

## Fine-tuning Details

| Property | Value |
|---|---|
| **Technique** | LoRA (Parameter-Efficient Fine-Tuning) |
| **LoRA Rank** | 16 |
| **Target Modules** | q_proj, v_proj, k_proj, o_proj |
| **Training Data** | Curated cybersecurity Q&A dataset |
| **Domain Focus** | Defensive cybersecurity, incident response, threat modeling |
| **Epochs** | 3 |
| **Merge Method** | Full merge — LoRA weights merged into base model (no adapter at inference time) |

---

## Limitations

- **1.5B parameter model** — may be less accurate than larger models on complex multi-step reasoning
- **Training cutoff** — does not have knowledge of very recent CVEs or threat intelligence
- **English only** — primarily trained on English cybersecurity content
- **Not a replacement** for professional security tools or certified analysts
- **Do not use** for actual penetration testing without authorization

---

## Related Repositories

| Repo | Description |
|---|---|
| [OMCHOKSI108/Paralay1.1](https://huggingface.co/OMCHOKSI108/Paralay1.1) | LoRA adapter only (smaller, requires base model) |
| [OMCHOKSI108/pralayai-inference-api](https://huggingface.co/spaces/OMCHOKSI108/pralayai-inference-api) | Public inference API (HF Space, CPU) |

---

## Citation

If you use this model in research or a project, please credit:

```bibtex
@misc{choksi2025pralayai,
  author    = {Om Choksi},
  title     = {PralayAI: A Defensive Cybersecurity Assistant Fine-tuned on Qwen2.5-1.5B},
  year      = {2025},
  publisher = {Hugging Face},
  url       = {https://huggingface.co/OMCHOKSI108/Paralay1.1-Merged}
}
```

---

## License

This model is released under the **Apache 2.0 License**, consistent with the base model [Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct).

---

*Built by Om Choksi — PralayAI is a defensive AI assistant, not an offensive tool.*
