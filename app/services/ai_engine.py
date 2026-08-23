"""
AI ENGINE — FALLBACK CHAIN

This is the brain of CodeGuru. It tries each AI provider in order.
If one hits a rate limit or fails, it automatically switches to the
next one — seamlessly.

Order: Gemini → Groq → Cerebras → Mistral → OpenRouter
"""

import httpx

from app.core.config import (
    GEMINI_API_KEY, GEMINI_MODEL,
    GROQ_API_KEY, GROQ_MODEL,
    CEREBRAS_API_KEY, CEREBRAS_MODEL,
    MISTRAL_API_KEY, MISTRAL_MODEL,
    OPENROUTER_API_KEY, OPENROUTER_MODEL,
    FALLBACK_ORDER, MAX_TOKENS, TEMPERATURE, REQUEST_TIMEOUT
)

# ── Language → System prompt instruction map ───────────────────
LANGUAGE_INSTRUCTIONS = {
    "hindi":   "Respond in Hindi (Devanagari script). Explain like a patient teacher to a beginner student.",
    "telugu":  "Respond in Telugu script. Explain like a patient teacher to a beginner student.",
    "tamil":   "Respond in Tamil script. Explain like a patient teacher to a beginner student.",
    "marathi": "Respond in Marathi (Devanagari). Explain like a patient teacher to a beginner student.",
    "hinglish":"Respond in Hinglish (mix of Hindi and English). Use simple words. Explain like a friend.",
    "english": "Respond in simple English. Explain like a patient teacher to a beginner student.",
}

# ── Mode → Behaviour instruction map ──────────────────────────
MODE_INSTRUCTIONS = {
    "explain": """
        You are CodeGuru, an AI coding teacher for Indian CS students.
        Your job is to EXPLAIN code like a patient teacher — not just fix it.
        - First tell WHAT the code does in simple words
        - Then explain each important line
        - Use simple analogies from daily Indian life where possible
        - End with one key takeaway the student should remember
    """,

    "debug": """
        You are CodeGuru, an AI debugger for Indian CS students.
        Your job is to find and fix errors like a helpful senior student.
        - Identify the exact error and which line it is on
        - Explain WHY that error happens in simple words
        - Show the corrected code clearly
        - Tell the student how to avoid this mistake in future
    """,

    "generate": """
        You are CodeGuru, an AI coding assistant for Indian CS students.
        Your job is to write clean, well-commented code.
        - Write code that a student can read and understand
        - Add comments in simple English on important lines
        - After the code, explain what it does in 2-3 simple lines
        - Keep it simple — no complex shortcuts or one-liners
    """,

    "socratic": """
        You are CodeGuru, using the Socratic teaching method.
        DO NOT give the answer directly. Instead:
        - Ask the student a guiding question to help them think
        - Give a small hint if they seem stuck
        - Praise their thinking and guide them step by step
        - Only reveal the answer after 2-3 guiding questions
        This builds real understanding, not copy-paste habit.
    """,

    "chat": """
        You are CodeGuru, a friendly AI coding teacher for Indian CS students.
        Answer coding doubts clearly and encouragingly.
        - Be friendly and supportive — no student is too basic
        - Use simple language, relatable analogies
        - If the question is unclear, ask for clarification kindly
        - Always end with encouragement
    """,
}


# ══════════════════════════════════════════════════════════════
#  INDIVIDUAL API CALLERS
# ══════════════════════════════════════════════════════════════


async def call_gemini(system_prompt: str, user_message: str) -> str:
    """Call Google Gemini API — primary provider, best multilingual"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

    # Gemini 2.5 Flash — combine system + user into single user message
    combined_message = f"{system_prompt}\n\n{user_message}"

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": combined_message}]
            }
        ],
        "generationConfig": {
            "maxOutputTokens": MAX_TOKENS,
            "temperature":     TEMPERATURE,
        }
    }

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        response = await client.post(
            url,
            json   = payload,
            params = {"key": GEMINI_API_KEY}
        )
        response.raise_for_status()
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]


async def call_groq(system_prompt: str, user_message: str) -> str:
    """Call Groq API — secondary provider, fastest responses"""

    url = "https://api.groq.com/openai/v1/chat/completions"

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system",  "content": system_prompt},
            {"role": "user",    "content": user_message},
        ],
        "max_tokens":  MAX_TOKENS,
        "temperature": TEMPERATURE,
    }

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type":  "application/json",
    }

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


async def call_cerebras(system_prompt: str, user_message: str) -> str:
    """Call Cerebras API — tertiary provider, ultra fast 2100 tokens/sec"""

    url = "https://api.cerebras.ai/v1/chat/completions"

    payload = {
        "model": CEREBRAS_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_message},
        ],
        "max_tokens":  MAX_TOKENS,
        "temperature": TEMPERATURE,
    }

    headers = {
        "Authorization": f"Bearer {CEREBRAS_API_KEY}",
        "Content-Type":  "application/json",
    }

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


async def call_mistral(system_prompt: str, user_message: str) -> str:
    """Call Mistral API — quaternary provider, best for code tasks (Codestral)"""

    url = "https://api.mistral.ai/v1/chat/completions"

    payload = {
        "model": MISTRAL_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_message},
        ],
        "max_tokens":  MAX_TOKENS,
        "temperature": TEMPERATURE,
    }

    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type":  "application/json",
    }

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


async def call_openrouter(system_prompt: str, user_message: str) -> str:
    """Call OpenRouter API — last resort, routes to any available free model"""

    url = "https://openrouter.ai/api/v1/chat/completions"

    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_message},
        ],
        "max_tokens":  MAX_TOKENS,
        "temperature": TEMPERATURE,
    }

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type":  "application/json",
        "X-Title":       "CodeGuru",     # Shows your app name in OpenRouter dashboard
    }

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


# ── Map provider name → function ──────────────────────────────
API_CALLERS = {
    "gemini":     call_gemini,
    "groq":       call_groq,
    "cerebras":   call_cerebras,
    "mistral":    call_mistral,
    "openrouter": call_openrouter,
}


# ══════════════════════════════════════════════════════════════
#  MAIN FUNCTION — FALLBACK CHAIN ENGINE
#  This is what all routes call. It handles everything.
# ══════════════════════════════════════════════════════════════

async def ask_ai(
    user_message : str,
    mode         : str = "chat",
    language     : str = "english",
    code         : str = "",
) -> dict:
    """
    Main AI calling function with automatic fallback chain.

    Parameters:
        user_message : What the student asked / typed
        mode         : 'chat' | 'explain' | 'debug' | 'generate' | 'socratic'
        language     : 'hindi' | 'telugu' | 'tamil' | 'hinglish' | 'english'
        code         : The student's code (optional, paste it here)

    Returns:
        {
            "response": "AI's answer",
            "provider": "gemini",        # Which API actually answered
            "success":  True
        }
    """

    # ── Build system prompt ────────────────────────────────────
    mode_instruction     = MODE_INSTRUCTIONS.get(mode, MODE_INSTRUCTIONS["chat"])
    language_instruction = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["english"])

    system_prompt = f"""
{mode_instruction}

LANGUAGE RULE (IMPORTANT):
{language_instruction}

ABOUT YOU:
- You are CodeGuru — an AI coding teacher built specifically for Indian CS students
- You know the JNTU, Anna University, VTU, and Mumbai University syllabi
- You never make students feel stupid for asking basic questions
- You always encourage and motivate
- Keep responses concise and clear — students read on mobile
    """.strip()

    # ── Build full user message (include code if provided) ─────
    full_message = user_message
    if code.strip():
        full_message = f"""
Student's code:
```
{code}
```

Student's question: {user_message}
        """.strip()

    # ── Try each provider in fallback order ───────────────────
    errors = []

    for provider in FALLBACK_ORDER:
        caller = API_CALLERS.get(provider)
        if not caller:
            continue

        try:
            print(f"[CodeGuru] Trying {provider}...")
            response_text = await caller(system_prompt, full_message)

            print(f"[CodeGuru] OK: success with {provider}")
            return {
                "response": response_text,
                "provider": provider,
                "success":  True,
            }

        except httpx.HTTPStatusError as e:
            # 429 = Rate limit hit — try next provider
            # 401 = Bad API key — skip this provider
            status = e.response.status_code
            reason = f"{provider} HTTP {status}"
            print(f"[CodeGuru] FAIL: {reason} - trying next...")
            errors.append(reason)
            continue

        except httpx.TimeoutException:
            reason = f"{provider} timed out"
            print(f"[CodeGuru] FAIL: {reason} - trying next...")
            errors.append(reason)
            continue

        except Exception as e:
            reason = f"{provider} error: {str(e)}"
            print(f"[CodeGuru] FAIL: {reason} - trying next...")
            errors.append(reason)
            continue

    # ── All providers failed ───────────────────────────────────
    print(f"[CodeGuru] FAIL: all providers failed: {errors}")
    return {
        "response": "Sorry, all AI services are temporarily busy. Please try again in a minute.",
        "provider": "none",
        "success":  False,
        "errors":   errors,
    }
