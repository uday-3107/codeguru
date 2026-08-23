import sys
from pathlib import Path

# Allow running from anywhere: adds project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import httpx, asyncio
from app.core.config import *

async def check_all():

    # 1. GEMINI
    print("\nGEMINI MODELS:")
    try:
        r = httpx.get(
            "https://generativelanguage.googleapis.com/v1beta/models",
            params={"key": GEMINI_API_KEY}
        )
        models = r.json().get("models", [])
        for m in models:
            print(" •", m["name"])
    except Exception as e:
        print(" Error:", e)

    # 2. GROQ
    print("\nGROQ MODELS:")
    try:
        r = httpx.get(
            "https://api.groq.com/openai/v1/models",
            headers={"Authorization": f"Bearer {GROQ_API_KEY}"}
        )
        for m in r.json().get("data", []):
            print(" •", m["id"])
    except Exception as e:
        print(" Error:", e)

    # 3. CEREBRAS
    print("\nCEREBRAS MODELS:")
    try:
        r = httpx.get(
            "https://api.cerebras.ai/v1/models",
            headers={"Authorization": f"Bearer {CEREBRAS_API_KEY}"}
        )
        for m in r.json().get("data", []):
            print(" •", m["id"])
    except Exception as e:
        print(" Error:", e)

    # 4. MISTRAL
    print("\nMISTRAL MODELS:")
    try:
        r = httpx.get(
            "https://api.mistral.ai/v1/models",
            headers={"Authorization": f"Bearer {MISTRAL_API_KEY}"}
        )
        for m in r.json().get("data", []):
            print(" •", m["id"])
    except Exception as e:
        print(" Error:", e)

    # 5. OPENROUTER — free models only
    print("\nOPENROUTER FREE MODELS:")
    try:
        r = httpx.get("https://openrouter.ai/api/v1/models")
        models = r.json().get("data", [])
        free = [m for m in models if ":free" in m["id"]]
        for m in free[:15]:   # show first 15
            print(" •", m["id"])
        print(f" ... and {len(free)-15} more free models")
    except Exception as e:
        print(" Error:", e)

asyncio.run(check_all())
