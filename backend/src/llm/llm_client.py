import os
from src.config import settings

def get_llm():
    provider = (settings.LLM_PROVIDER or "mistralai").lower().strip()
    api_key = (
        settings.LLM_API_KEY
        or settings.MISTRAL_API_KEY
        or settings.GROQ_API_KEY
        or settings.OPENAI_API_KEY
        or settings.GEMINI_API_KEY
        or os.getenv("LLM_API_KEY")
        or os.getenv("MISTRAL_API_KEY")
        or os.getenv("GROQ_API_KEY")
        or os.getenv("OPENAI_API_KEY")
        or "placeholder_key"
    )
    
    # 1. Mistral AI
    if provider in ["mistral", "mistralai"]:
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=settings.LLM_MODEL or "mistral-small-2506",
            api_key=api_key,
            base_url=settings.LLM_BASE_URL or "https://api.mistral.ai/v1",
            temperature=settings.LLM_TEMPERATURE
        )

    # 2. Groq
    elif provider == "groq":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=settings.LLM_MODEL or "llama-3.3-70b-versatile",
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1",
            temperature=settings.LLM_TEMPERATURE
        )

    # 3. Google Gemini
    elif provider in ["google", "gemini", "google_genai"]:
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            model=settings.LLM_MODEL or "gemini-1.5-flash",
            google_api_key=api_key,
            temperature=settings.LLM_TEMPERATURE
        )
        
    # 4. Anthropic Claude
    elif provider in ["anthropic", "claude"]:
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            model=settings.LLM_MODEL or "claude-3-5-sonnet-20240620",
            api_key=api_key,
            temperature=settings.LLM_TEMPERATURE
        )
        
    # 5. Ollama / Local / Custom OpenAI Compatible Endpoints
    elif provider in ["ollama", "local", "custom", "openrouter", "vllm"]:
        from langchain_openai import ChatOpenAI
        base_url = settings.LLM_BASE_URL or "http://localhost:11434/v1"
        return ChatOpenAI(
            model=settings.LLM_MODEL or "llama3",
            api_key=api_key if api_key != "placeholder_key" else "ollama",
            base_url=base_url,
            temperature=settings.LLM_TEMPERATURE
        )
        
    # 6. Default: OpenAI
    else:
        from langchain_openai import ChatOpenAI
        kwargs = {
            "model": settings.LLM_MODEL or "gpt-4o-mini",
            "api_key": api_key,
            "temperature": settings.LLM_TEMPERATURE
        }
        if settings.LLM_BASE_URL:
            kwargs["base_url"] = settings.LLM_BASE_URL
        return ChatOpenAI(**kwargs)
