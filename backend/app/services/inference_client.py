import logging

import requests

from app.config import settings

logger = logging.getLogger("pralayai.inference")


class InferenceClientError(Exception):
    pass


def call_inference_api(
    message: str,
    max_new_tokens: int = 300,
    temperature: float = 0.7,
    top_p: float = 0.9,
) -> dict:
    payload = {
        "prompt": message,
        "max_new_tokens": max_new_tokens,
        "temperature": temperature,
        "top_p": top_p,
    }

    logger.info("Inference request: url=%s max_tokens=%s temp=%s top_p=%s msg_len=%s",
                settings.INFERENCE_API_URL, max_new_tokens, temperature, top_p, len(message))

    try:
        response = requests.post(
            settings.INFERENCE_API_URL,
            json=payload,
            timeout=settings.REQUEST_TIMEOUT_SECONDS,
        )

        response.raise_for_status()
        data = response.json()

        resp_text = data.get("response", "")
        latency = float(data.get("latency_seconds", 0))
        model = data.get("model", "unknown")
        device = data.get("device", "unknown")

        logger.info("Inference response: model=%s device=%s latency=%ss resp_len=%s",
                    model, device, latency, len(resp_text))

        return {
            "response": resp_text,
            "latency_seconds": latency,
            "model": model,
            "device": device,
            "source": settings.INFERENCE_API_URL,
        }

    except requests.exceptions.Timeout as error:
        logger.error("Inference API timeout after %ss", settings.REQUEST_TIMEOUT_SECONDS)
        raise InferenceClientError(
            f"Inference API timeout after {settings.REQUEST_TIMEOUT_SECONDS} seconds"
        ) from error

    except requests.exceptions.RequestException as error:
        logger.error("Inference API request failed: %s", str(error))
        raise InferenceClientError(
            f"Inference API request failed: {str(error)}"
        ) from error

    except ValueError as error:
        logger.error("Inference API returned invalid JSON")
        raise InferenceClientError(
            "Inference API returned invalid JSON"
        ) from error
