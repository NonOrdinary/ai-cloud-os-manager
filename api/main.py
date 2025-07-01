# api/main.py

from fastapi import FastAPI
from .routes import router

app = FastAPI(
    title="AI-OS Process Manager API",
    description="Submit jobs and fetch scheduling metrics",
    version="0.1.0"
)

app.include_router(router)
