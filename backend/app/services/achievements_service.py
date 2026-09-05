"""Logros del usuario, calculados a partir de sus sesiones de estudio."""
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.study_session import SesionEstudio
from app.models.user import Usuario
from app.models.user_preferences import UserPreferences
from app.utils.dashboard_utils import DashboardCalculator

ACHIEVEMENTS: list[dict] = [
    {"code": "first_session", "name": "Primera sesión", "description": "Registra tu primera sesión de estudio", "icon": "🎯"},
    {"code": "week_goal", "name": "Meta semanal", "description": "Cumple tu meta semanal de horas", "icon": "⭐"},
    {"code": "streak_3", "name": "3 días seguidos", "description": "Estudia 3 días consecutivos", "icon": "🔥"},
    {"code": "total_20h", "name": "20 horas totales", "description": "Acumula 20 horas de estudio", "icon": "💪"},
    {"code": "all_methods", "name": "Explorador", "description": "Usa los cuatro métodos de estudio", "icon": "🧩"},
    {"code": "streak_7", "name": "Semana perfecta", "description": "Estudia 7 días consecutivos", "icon": "👑"},
]

DEFAULT_WEEKLY_GOAL_HOURS = 10.0


class AchievementsService:
    @staticmethod
    def get_or_create_preferences(db: Session, user_id: int) -> UserPreferences:
        prefs = db.get(UserPreferences, user_id)
        if prefs is None:
            prefs = UserPreferences(user_id=user_id, weekly_goal_hours=DEFAULT_WEEKLY_GOAL_HOURS, achievements=[])
            db.add(prefs)
            db.flush()
        return prefs

    @staticmethod
    def evaluate(db: Session, user: Usuario) -> list[str]:
        """Revisa los logros y guarda los nuevos. Devuelve los códigos recién desbloqueados (sin commit)."""
        prefs = AchievementsService.get_or_create_preferences(db, user.user_id)
        unlocked = set(prefs.achievements or [])
        earned: set[str] = set()

        total_sessions = db.query(func.count(SesionEstudio.session_id)).filter(SesionEstudio.user_id == user.user_id).scalar()
        if total_sessions >= 1:
            earned.add("first_session")

        if user.total_studied_time >= 20 * 60:
            earned.add("total_20h")

        week_start, week_end = DashboardCalculator.get_date_range("week")
        week_minutes = DashboardCalculator.range_totals(db, user.user_id, week_start, week_end)["total_minutes"]
        if week_minutes >= prefs.weekly_goal_hours * 60:
            earned.add("week_goal")

        methods_used = (
            db.query(func.count(func.distinct(SesionEstudio.metodo_id))).filter(SesionEstudio.user_id == user.user_id).scalar()
        )
        if methods_used >= 4:
            earned.add("all_methods")

        streak = DashboardCalculator.calculate_study_streak(db, user.user_id)
        if streak["longest_streak"] >= 3:
            earned.add("streak_3")
        if streak["longest_streak"] >= 7:
            earned.add("streak_7")

        new_codes = [a["code"] for a in ACHIEVEMENTS if a["code"] in earned and a["code"] not in unlocked]
        if new_codes:
            prefs.achievements = [a["code"] for a in ACHIEVEMENTS if a["code"] in (unlocked | earned)]
        return new_codes
