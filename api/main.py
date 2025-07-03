# api/main.py

from fastapi import FastAPI
from .routes import router as api_router
from .ws import router as ws_router

app = FastAPI(
    title="AI-OS Enhanced Process Manager API with Live WS",
    version="0.1.0"
)

# HTTP routes
app.include_router(api_router)

# WebSocket routes
app.include_router(ws_router)
