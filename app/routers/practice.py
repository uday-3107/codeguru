import json
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["Practice"])

# Project root = <root>/app/routers/practice.py -> parents[2]
PROJECT_ROOT = Path(__file__).resolve().parents[2]
PROBLEMS_PATH = PROJECT_ROOT / "data" / "problems.json"


def load_problems():
    if PROBLEMS_PATH.exists():
        with open(PROBLEMS_PATH, "r") as f:
            return json.load(f)
    return []


PROBLEMS = load_problems()


@router.get("/practice/problems")
async def get_problems(category: Optional[str] = None):
    if not PROBLEMS:
        return {"error": "No problems found. Ensure data/problems.json exists."}
    if category:
        return [p for p in PROBLEMS if p["category"].lower() == category.lower()]
    return PROBLEMS


@router.get("/practice/problems/{problem_id}")
async def get_problem(problem_id: str):
    problem = next((p for p in PROBLEMS if p["id"] == problem_id), None)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem
