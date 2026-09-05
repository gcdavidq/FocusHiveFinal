from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import Usuario
from app.schemas.dashboard import (
    AchievementSchema,
    CreateSessionResponse,
    CreateStudySessionSchema,
    DashboardSummarySchema,
    MethodStatsResponse,
    MonthlyStatsSchema,
    PreferencesSchema,
    PreferencesUpdateSchema,
    SessionHistorySchema,
    StudySessionResponse,
    TodayProgressSchema,
    WeeklyProgressSchema,
)
from app.services.achievements_service import ACHIEVEMENTS
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard y sesiones de estudio"])


@router.post("/sessions", response_model=CreateSessionResponse, status_code=status.HTTP_201_CREATED, summary="Registrar sesión")
def create_study_session(
    data: CreateStudySessionSchema,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Registra una sesión terminada (Pomodoro, Feynman, Cornell o Flashcards). Actualiza tiempo total, nivel y logros."""
    session, new_achievements = DashboardService.create_study_session(db, current_user, data)
    return CreateSessionResponse(
        message="Sesión de estudio registrada exitosamente",
        session=StudySessionResponse.from_session(session),
        new_achievements=new_achievements,
    )


@router.get("/summary", response_model=DashboardSummarySchema, summary="Resumen del dashboard")
def get_dashboard_summary(current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    """Métricas de hoy y de la semana, racha, método recomendado vs. más usado, meta semanal y logros."""
    return DashboardService.get_dashboard_summary(db, current_user)


@router.get("/sessions/history", response_model=SessionHistorySchema, summary="Historial de sesiones")
def get_session_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    history = DashboardService.get_session_history(db, current_user.user_id, skip, limit)
    history["sessions"] = [StudySessionResponse.from_session(s) for s in history["sessions"]]
    return history


@router.get("/sessions/{session_id}", response_model=StudySessionResponse, summary="Detalle de sesión")
def get_session_by_id(session_id: int, current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    return StudySessionResponse.from_session(DashboardService.get_session(db, current_user.user_id, session_id))


@router.put("/sessions/{session_id}", response_model=StudySessionResponse, summary="Actualizar sesión")
def update_study_session(
    session_id: int,
    data: CreateStudySessionSchema,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return StudySessionResponse.from_session(DashboardService.update_session(db, current_user, session_id, data))


@router.delete("/sessions/{session_id}", summary="Eliminar sesión")
def delete_study_session(session_id: int, current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    DashboardService.delete_session(db, current_user, session_id)
    return {"message": "Sesión eliminada exitosamente", "session_id": session_id}


@router.get("/stats/monthly", response_model=MonthlyStatsSchema, summary="Estadísticas mensuales")
def get_monthly_stats(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2020, le=2100),
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return DashboardService.get_monthly_stats(db, current_user.user_id, month, year)


@router.get("/stats/methods", response_model=MethodStatsResponse, summary="Uso por método")
def get_method_statistics(current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    return DashboardService.get_method_statistics(db, current_user.user_id)


@router.get("/progress/today", response_model=TodayProgressSchema, summary="Progreso de hoy")
def get_today_progress(current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    return DashboardService.get_today_progress(db, current_user.user_id)


@router.get("/progress/weekly", response_model=WeeklyProgressSchema, summary="Progreso semanal")
def get_weekly_progress(current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    return DashboardService.get_weekly_progress(db, current_user.user_id)


@router.get("/preferences", response_model=PreferencesSchema, summary="Meta semanal y logros")
def get_preferences(current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    return DashboardService.get_preferences(db, current_user.user_id)


@router.put("/preferences", response_model=PreferencesSchema, summary="Actualizar meta semanal")
def update_preferences(
    data: PreferencesUpdateSchema,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return DashboardService.update_preferences(db, current_user, data)


@router.get("/achievements", response_model=list[AchievementSchema], summary="Catálogo de logros")
def list_achievements():
    return ACHIEVEMENTS
