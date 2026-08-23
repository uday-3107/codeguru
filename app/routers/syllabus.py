from typing import Dict

from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["Syllabus"])

SYLLABUS_DATA = {
    "JNTU Hyderabad": {
        "Computer Science": {
            "Year 1": ["Programming for Problem Solving", "Engineering Graphics"],
            "Year 2": ["Data Structures", "Discrete Mathematics", "Operating Systems", "Computer Organization"],
            "Year 3": ["Design and Analysis of Algorithms", "Software Engineering", "Computer Networks"],
            "Year 4": ["Cloud Computing", "Artificial Intelligence", "Blockchain Technologies"]
        }
    },
    "Anna University": {
        "Computer Science": {
            "Year 1": ["Problem Solving and Python Programming", "Engineering Physics"],
            "Year 2": ["Database Management Systems", "Microprocessors", "Design and Analysis of Algorithms"],
            "Year 3": ["Compiler Design", "Internet Programming", "Theory of Computation"],
            "Year 4": ["Distributed Systems", "Professional Ethics", "Total Quality Management"]
        }
    },
    "VTU Belgaum": {
        "Computer Science": {
            "Year 1": ["C Programming for Problem Solving"],
            "Year 2": ["Object Oriented Programming with C++", "Computer Organization", "Unix and Shell Programming"],
            "Year 3": ["Management and Entrepreneurship", "Dot Net Framework", "System Software and Compiler Design"]
        }
    }
}


@router.get("/syllabus/universities")
async def get_universities():
    return list(SYLLABUS_DATA.keys())


@router.get("/syllabus/{university}")
async def get_university_syllabus(university: str):
    if university not in SYLLABUS_DATA:
        raise HTTPException(status_code=404, detail="University not found")
    return SYLLABUS_DATA[university]
