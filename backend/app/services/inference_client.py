import requests

from app.config import settings


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

    try:
        response = requests.post(
            settings.INFERENCE_API_URL,
            json=payload,
            timeout=settings.REQUEST_TIMEOUT_SECONDS,
        )

        response.raise_for_status()
        data = response.json()

        return {
            "response": data.get("response", ""),
            "latency_seconds": float(data.get("latency_seconds", 0)),
            "model": data.get("model", "unknown"),
            "device": data.get("device", "unknown"),
            "source": settings.INFERENCE_API_URL,
        }

    except requests.exceptions.Timeout as error:
        raise InferenceClientError(
            f"Inference API timeout after {settings.REQUEST_TIMEOUT_SECONDS} seconds"
        ) from error

    except requests.exceptions.RequestException as error:
        raise InferenceClientError(
            f"Inference API request failed: {str(error)}"
        ) from error

    except ValueError as error:
        raise InferenceClientError(
            "Inference API returned invalid JSON"
        ) from error
