# api/main.py

from fastapi import FastAPI
from .routes import router as api_router
from .ws import router as ws_router
from fastapi.middleware.cors import CORSMiddleware




app = FastAPI(
    title="AI-OS Enhanced Process Manager API with Live WS",
    version="0.1.0"
)

# Add CORS middleware
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # or ["*"] to allow all
    allow_credentials=True,
    allow_methods=["*"],        # GET, POST, OPTIONS, etc.
    allow_headers=["*"],
)

# HTTP routes
app.include_router(api_router)

# WebSocket routes
app.include_router(ws_router)
