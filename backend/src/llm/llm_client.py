import os
import logging
from src.config import settings

# Suppress informational AFC (Automatic Function Calling) advisory logs from Google GenAI SDK
logging.getLogger("google.genai").setLevel(logging.ERROR)
logging.getLogger("google_genai").setLevel(logging.ERROR)

class GeminiWrapper:
    """
    Wrapper around ChatGoogleGenerativeAI to normalize response.content
    from Google GenAI list-of-dicts format to standard string format.
    """
    def __init__(self, model_instance):
        self._model = model_instance

    def __getattr__(self, name):
        return getattr(self._model, name)

    def _clean_content(self, res):
        if hasattr(res, "content") and isinstance(res.content, list):
            text_parts = [
                item.get("text", "") if isinstance(item, dict) else str(item)
                for item in res.content
            ]
            res.content = "".join(text_parts)
        return res

    def invoke(self, *args, **kwargs):
        res = self._model.invoke(*args, **kwargs)
        return self._clean_content(res)

    async def ainvoke(self, *args, **kwargs):
        res = await self._model.ainvoke(*args, **kwargs)
        return self._clean_content(res)

def get_llm():
    """
    Primary LLM factory configured via backend/.env.
    Configured strictly for Google Gemini API (gemini-3.6-flash).
    """
    api_key = (
        settings.GEMINI_API_KEY
        or settings.LLM_API_KEY
        or os.getenv("GEMINI_API_KEY")
        or os.getenv("LLM_API_KEY")
    )
    
    gemini_model = (
        getattr(settings, "GEMINI_MODEL", None)
        or settings.LLM_MODEL
        or os.getenv("GEMINI_MODEL")
        or "gemini-3.6-flash"
    )

    # Normalize any typos in model name from .env
    if "3.5-flash-light" in gemini_model or "1.5-flash" in gemini_model or "2.0-flash" in gemini_model:
        gemini_model = "gemini-3.6-flash"

    from langchain_google_genai import ChatGoogleGenerativeAI
    base_instance = ChatGoogleGenerativeAI(
        model=gemini_model,
        google_api_key=api_key
    )
    return GeminiWrapper(base_instance)
