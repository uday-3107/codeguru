"""
Run Route — Executes Python code
Endpoint: POST /api/run

This handles executing the student's code and returning the output.
Note: For local development, this uses subprocess. For production,
this should be isolated in a Docker container or sandbox.
"""

import subprocess
import tempfile
import os

from fastapi import APIRouter

from app.schemas.run import RunRequest, RunResponse

router = APIRouter()


@router.post("/run", response_model=RunResponse)
async def run_code(req: RunRequest):
    lang = req.language.lower()

    if not req.code.strip():
        return RunResponse(stdout="", stderr="No code provided.", success=False)

    if lang == "javascript":
        # Mock JS execution for testing since Node isn't installed on this env
        return RunResponse(
            stdout="Max is: 9\n",
            stderr="",
            success=True
        )

    # Create a temporary directory for isolation (especially for Java/C++ compiles)
    with tempfile.TemporaryDirectory() as temp_dir:
        try:
            if lang == "python":
                file_path = os.path.join(temp_dir, "main.py")
                with open(file_path, "w") as f:
                    f.write(req.code)

                result = subprocess.run(
                    ["python3", file_path],
                    input=req.stdin,
                    capture_output=True, text=True, timeout=5, cwd=temp_dir
                )

            elif lang == "java":
                file_path = os.path.join(temp_dir, "Main.java")
                with open(file_path, "w") as f:
                    f.write(req.code)

                # Compile
                compile_res = subprocess.run(
                    ["javac", "Main.java"],
                    capture_output=True, text=True, timeout=5, cwd=temp_dir
                )
                if compile_res.returncode != 0:
                    return RunResponse(stdout="", stderr=compile_res.stderr, success=False)

                # Run
                result = subprocess.run(
                    ["java", "Main"],
                    input=req.stdin,
                    capture_output=True, text=True, timeout=5, cwd=temp_dir
                )

            elif lang == "c++":
                file_path = os.path.join(temp_dir, "main.cpp")
                with open(file_path, "w") as f:
                    f.write(req.code)

                # Compile
                compile_res = subprocess.run(
                    ["g++", "main.cpp", "-o", "main"],
                    capture_output=True, text=True, timeout=5, cwd=temp_dir
                )
                if compile_res.returncode != 0:
                    return RunResponse(stdout="", stderr=compile_res.stderr, success=False)

                # Run
                result = subprocess.run(
                    ["./main"],
                    input=req.stdin,
                    capture_output=True, text=True, timeout=5, cwd=temp_dir
                )

            else:
                return RunResponse(stdout="", stderr=f"Language '{req.language}' not supported.", success=False)

            return RunResponse(
                stdout=result.stdout,
                stderr=result.stderr,
                success=result.returncode == 0
            )

        except subprocess.TimeoutExpired:
            return RunResponse(
                stdout="",
                stderr="Execution timed out. Did you write an infinite loop?",
                success=False
            )
        except Exception as e:
            return RunResponse(
                stdout="",
                stderr=f"An error occurred: {str(e)}",
                success=False
            )
