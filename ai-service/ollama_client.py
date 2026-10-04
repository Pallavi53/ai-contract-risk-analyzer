import requests
import json
import os

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")

def check_ollama_status():
    """Checks if local Ollama server is running and reachable."""
    try:
        res = requests.get(f"{OLLAMA_URL}/api/tags", timeout=2)
        if res.status_code == 200:
            models = [m.get("name") for m in res.json().get("models", [])]
            return {"available": True, "models": models}
    except Exception:
        pass
    return {"available": False, "models": []}

def generate_summary_with_ollama(contract_title: str, full_text: str, risk_summary: str):
    """
    Uses Ollama Llama 3 model to generate a clear summary if available.
    Otherwise returns a deterministic, document-grounded summary.
    """
    status = check_ollama_status()
    if status["available"]:
        try:
            prompt = f"Summarize this legal contract in 2 simple English sentences, focusing on key obligations and main risk areas:\n\n{full_text[:3000]}"
            payload = {
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            }
            res = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=10)
            if res.status_code == 200:
                return res.json().get("response", "").strip()
        except Exception as e:
            print(f"[Ollama Call Warning] Ollama request failed: {e}")

    # Document-grounded deterministic summary fallback
    first_lines = [line for line in full_text.splitlines() if len(line.strip()) > 10][:3]
    doc_intro = " ".join(first_lines)[:150]
    return f"This agreement relates to {contract_title}. Key identified provisions include: {risk_summary}."
