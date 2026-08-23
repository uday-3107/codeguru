import sys
from pathlib import Path

# Allow running from anywhere: adds project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import httpx
from app.core.config import GEMINI_API_KEY, GEMINI_MODEL

url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

payload = {
    "contents": [
        {
            "role": "user",
            "parts": [{"text": "Say hello in Telugu"}]
        }
    ],
    "generationConfig": {
        "maxOutputTokens": 100,
        "temperature": 0.7,
    }
}

try:
    r = httpx.post(url, json=payload, params={"key": GEMINI_API_KEY}, timeout=30)
    print("Status:", r.status_code)
    print("Response:", r.json())
except Exception as e:
    print("Error:", e)
