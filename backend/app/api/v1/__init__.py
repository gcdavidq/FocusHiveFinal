from fastapi import APIRouter

from app.api.v1 import (
    auth,
    calendar,
    cornell,
    dashboard,
    diagnostic,
    feynman,
    flashcard_sessions,
    flashcards,
    methods,
    users,
)

api_router = APIRouter(prefix="/api/v1")
for module in (auth, users, methods, diagnostic, dashboard, flashcards, flashcard_sessions, feynman, cornell, calendar):
    api_router.include_router(module.router)

__all__ = ["api_router"]
