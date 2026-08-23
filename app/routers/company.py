from fastapi import APIRouter

router = APIRouter(tags=["Company Prep"])

COMPANY_DATA = {
    "TCS": {
        "pattern": "NQT (National Qualifier Test)",
        "rounds": [
            {"name": "Numerical Ability", "count": 26, "duration": "40 mins"},
            {"name": "Verbal Ability", "count": 24, "duration": "30 mins"},
            {"name": "Reasoning Ability", "count": 30, "duration": "50 mins"},
            {"name": "Programming Logic", "count": 10, "duration": "15 mins"},
            {"name": "Hands-on Coding", "count": 2, "duration": "45 mins"}
        ],
        "common_questions": ["Reverse a string", "Fibonacci Series", "Prime Numbers"]
    },
    "Infosys": {
        "pattern": "Infosys Certification / InfyTQ",
        "rounds": [
            {"name": "Java/Python Hands-on", "count": 2, "duration": "180 mins"},
            {"name": "MCQs", "count": 20, "duration": "part of 3 hrs"}
        ],
        "common_questions": ["Knapsack Problem", "Matrix Rotation", "String Manipulation"]
    },
    "Wipro": {
        "pattern": "Elite NLTH",
        "rounds": [
            {"name": "Aptitude", "count": 48, "duration": "48 mins"},
            {"name": "Written English Test", "count": 1, "duration": "20 mins"},
            {"name": "Coding", "count": 2, "duration": "60 mins"}
        ],
        "common_questions": ["Bubble Sort", "Palindrome Check", "Anagrams"]
    },
    "Amazon": {
        "pattern": "SDE-1 Hiring",
        "rounds": [
            {"name": "Online Assessment", "count": 2, "duration": "90 mins"},
            {"name": "Technical Interview 1", "name_type": "DSA"},
            {"name": "Technical Interview 2", "name_type": "System Design"},
            {"name": "Bar Raiser Round", "name_type": "Leadership Principles"}
        ],
        "common_questions": ["Lru Cache", "Word Ladder", "Number of Islands"]
    }
}


@router.get("/company/list")
async def get_companies():
    return list(COMPANY_DATA.keys())


@router.get("/company/{name}")
async def get_company_prep(name: str):
    if name not in COMPANY_DATA:
        return {"error": "Company not found"}
    return COMPANY_DATA[name]
