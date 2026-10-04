import json
import logging
import requests
from app.core.config import settings

logger = logging.getLogger(__name__)

def query_ollama_llm(prompt: str, system_prompt: str = "") -> str:
    """
    Queries local Ollama instance running Llama 3 model.
    Falls back gracefully if Ollama is not running locally.
    """
    url = f"{settings.OLLAMA_BASE_URL}/api/generate"
    payload = {
        "model": settings.DEFAULT_LLM_MODEL,
        "prompt": prompt,
        "system": system_prompt or "You are a professional legal contract analysis AI assistant.",
        "stream": False,
        "options": {
            "temperature": 0.2
        }
    }

    try:
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return data.get("response", "").strip()
    except Exception as e:
        logger.info(f"Ollama LLM call failed or offline ({str(e)}). Using deterministic rule-based reasoner.")

    return ""

def analyze_risks_with_llm(clauses):
    """
    Uses Llama 3 reasoning to refine and enhance risk findings.
    """
    prompt = f"Analyze the following contract clauses for legal and business risks:\n{json.dumps([c['clause_text'] for c in clauses[:5]])}"
    llm_output = query_ollama_llm(prompt)
    return llm_output
