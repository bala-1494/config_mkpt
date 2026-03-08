"""
Google ADK entry point.
Run with: uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

from fastapi import FastAPI
from agents import root_agent  # noqa: F401 — registers agent on import
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Config MKPT — ADK Service")


@app.get("/health")
async def health():
    return {"status": "ok"}


# Mount ADK's built-in web UI / REST interface when available
try:
    from google.adk.cli.fast_api import get_fast_api_app  # type: ignore

    adk_app = get_fast_api_app(agent=root_agent)
    app.mount("/adk", adk_app)
except ImportError:
    pass  # ADK web UI not available in this version; use CLI instead
