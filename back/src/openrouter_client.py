from openrouter import OpenRouter
from openrouter.errors import NoResponseError, OpenRouterDefaultError, ResponseValidationError

from src.config import get_settings

DEFAULT_MODEL = "openrouter/owl-alpha"


class OpenRouterConfigurationError(RuntimeError):
    """API key missing or OPENROUTER is not usable."""


class OpenRouterUpstreamError(RuntimeError):
    """HTTP or unexpected payload from OpenRouter."""


class OpenRouterBadResponse(RuntimeError):
    """Response JSON shape is not as expected."""


def openrouter_chat_completion(user_prompt: str) -> str:
    settings = get_settings()
    api_key = (settings.openrouter_api_key or "").strip()
    if not api_key:
        raise OpenRouterConfigurationError(
            'Set OPENROUTER_API_KEY in the environment or in a ".env" file beside the process cwd.'
        )

    try:
        with OpenRouter(api_key=api_key, timeout_ms=120_000) as client:
            response = client.chat.send(
                model=DEFAULT_MODEL,
                messages=[{"role": "user", "content": user_prompt}],
            )
    except OpenRouterDefaultError as e:
        raise OpenRouterUpstreamError(f"OpenRouter API error: {e}") from e
    except (NoResponseError, ResponseValidationError) as e:
        raise OpenRouterUpstreamError(f"OpenRouter request failed: {e}") from e

    try:
        content = response.choices[0].message.content
        if content is None:
            raise KeyError("empty content")
        if isinstance(content, list):
            # SDK can return structured parts for some models; join text parts.
            content = "".join(getattr(part, "text", "") for part in content)
        return content.strip()
    except (AttributeError, IndexError, KeyError, TypeError) as e:
        raise OpenRouterBadResponse("OpenRouter response missing choices/message/content") from e
