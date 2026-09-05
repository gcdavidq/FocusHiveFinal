from fastapi import HTTPException, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.models.method import Metodo
from app.models.study_session import SesionEstudio
from app.models.user import Usuario
from app.models.user_method import UsuarioMetodo
from app.schemas.dashboard import CreateStudySessionSchema, PreferencesUpdateSchema
from app.services.achievements_service import AchievementsService
from app.utils.dashboard_utils import DashboardCalculator

MINUTES_PER_LEVEL = 600  # el usuario sube de nivel cada 10 horas de estudio


def _refresh_level(user: Usuario) -> None:
    user.level = 1 + max(user.total_studied_time, 0) // MINUTES_PER_LEVEL


class DashboardService:
    """Sesiones de estudio, métricas de progreso, meta semanal y logros."""

    @staticmethod
    def resolve_method(db: Session, metodo_id: int | None, metodo_nombre: str | None) -> Metodo:
        method = None
        if metodo_id is not None:
            method = db.get(Metodo, metodo_id)
        elif metodo_nombre:
            method = db.query(Metodo).filter(Metodo.nombre == metodo_nombre.lower().strip()).first()
        if method is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Método de estudio no encontrado")
        return method

    @staticmethod
    def get_session(db: Session, user_id: int, session_id: int) -> SesionEstudio:
        session = (
            db.query(SesionEstudio)
            .filter(SesionEstudio.session_id == session_id, SesionEstudio.user_id == user_id)
            .first()
        )
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sesión no encontrada")
        return session

    @staticmethod
    def create_study_session(db: Session, user: Usuario, data: CreateStudySessionSchema) -> tuple[SesionEstudio, list[str]]:
        """Crea la sesión, actualiza tiempo total y nivel, marca el método como usado y evalúa logros."""
        method = DashboardService.resolve_method(db, data.metodo_id, data.metodo)

        session = SesionEstudio(
            user_id=user.user_id,
            metodo_id=method.metodo_id,
            fecha_inicio=data.fecha_inicio,
            duracion_minutos=data.duracion_minutos,
            fue_completada=data.fue_completada,
            descripcion=data.descripcion,
        )
        db.add(session)

        user.total_studied_time += data.duracion_minutos
        _refresh_level(user)

        link = db.get(UsuarioMetodo, (user.user_id, method.metodo_id))
        if link:
            link.es_utilizado = True
        else:
            db.add(UsuarioMetodo(user_id=user.user_id, metodo_id=method.metodo_id, es_utilizado=True))
        db.flush()

        new_achievements = AchievementsService.evaluate(db, user)
        db.commit()
        db.refresh(session)
        return session, new_achievements

    @staticmethod
    def update_session(db: Session, user: Usuario, session_id: int, data: CreateStudySessionSchema) -> SesionEstudio:
        session = DashboardService.get_session(db, user.user_id, session_id)
        method = DashboardService.resolve_method(db, data.metodo_id, data.metodo)

        user.total_studied_time = max(0, user.total_studied_time - session.duracion_minutos + data.duracion_minutos)
        _refresh_level(user)

        session.metodo_id = method.metodo_id
        session.fecha_inicio = data.fecha_inicio
        session.duracion_minutos = data.duracion_minutos
        session.fue_completada = data.fue_completada
        session.descripcion = data.descripcion
        db.commit()
        db.refresh(session)
        return session

    @staticmethod
    def delete_session(db: Session, user: Usuario, session_id: int) -> None:
        session = DashboardService.get_session(db, user.user_id, session_id)
        user.total_studied_time = max(0, user.total_studied_time - session.duracion_minutos)
        _refresh_level(user)
        db.delete(session)
        db.commit()

    @staticmethod
    def get_session_history(db: Session, user_id: int, skip: int, limit: int) -> dict:
        base = db.query(SesionEstudio).filter(SesionEstudio.user_id == user_id)
        total = base.count()
        sessions = base.order_by(desc(SesionEstudio.fecha_inicio), desc(SesionEstudio.session_id)).offset(skip).limit(limit).all()
        return {
            "sessions": sessions,
            "total_count": total,
            "page": skip // limit + 1,
            "pages": max(1, (total + limit - 1) // limit),
        }

    @staticmethod
    def get_dashboard_summary(db: Session, user: Usuario) -> dict:
        calc = DashboardCalculator
        today_start, today_end = calc.get_date_range("today")
        week_start, week_end = calc.get_date_range("week")

        today = calc.range_totals(db, user.user_id, today_start, today_end)
        week = calc.range_totals(db, user.user_id, week_start, week_end)
        methods_usage = calc.get_method_usage(db, user.user_id)
        prefs = AchievementsService.get_or_create_preferences(db, user.user_id)
        db.commit()

        recommended_link = (
            db.query(UsuarioMetodo)
            .filter(UsuarioMetodo.user_id == user.user_id, UsuarioMetodo.es_recomendado.is_(True))
            .first()
        )
        recommended = None
        if recommended_link:
            method = recommended_link.method
            recommended = next((m for m in methods_usage if m["metodo_id"] == method.metodo_id), None) or {
                "metodo_id": method.metodo_id,
                "metodo_nombre": method.nombre,
                "metodo_titulo": method.titulo,
                "total_sessions": 0,
                "total_minutes": 0,
                "total_hours": 0.0,
                "percentage": 0.0,
            }

        goal_minutes = prefs.weekly_goal_hours * 60
        week_hours = round(week["total_minutes"] / 60, 2)
        return {
            "user_id": user.user_id,
            "username": user.username,
            "level": user.level,
            "total_studied_time": user.total_studied_time,
            "today_minutes": today["total_minutes"],
            "today_sessions": today["total_sessions"],
            "week_minutes": week["total_minutes"],
            "week_hours": week_hours,
            "weekly_goal_hours": prefs.weekly_goal_hours,
            "week_goal_progress": round(min(week["total_minutes"] / goal_minutes * 100, 100), 2) if goal_minutes else 0.0,
            "recommended_method": recommended,
            "most_used_method": methods_usage[0] if methods_usage else None,
            "study_streak": calc.calculate_study_streak(db, user.user_id),
            "weekly_progress": {
                "week_start": week_start.date(),
                "week_end": (week_end.date() - __import__("datetime").timedelta(days=1)),
                "total_minutes": week["total_minutes"],
                "total_hours": week_hours,
                "total_sessions": week["total_sessions"],
                "completed_sessions": week["completed_sessions"],
                "daily_breakdown": calc.get_daily_breakdown(db, user.user_id, week_start, week_end),
            },
            "methods_usage": methods_usage,
            "achievements": list(prefs.achievements or []),
        }

    @staticmethod
    def get_today_progress(db: Session, user_id: int) -> dict:
        start, end = DashboardCalculator.get_date_range("today")
        totals = DashboardCalculator.range_totals(db, user_id, start, end)
        return {"date": start.date(), "total_hours": round(totals["total_minutes"] / 60, 2), **totals}

    @staticmethod
    def get_weekly_progress(db: Session, user_id: int) -> dict:
        from datetime import timedelta

        start, end = DashboardCalculator.get_date_range("week")
        totals = DashboardCalculator.range_totals(db, user_id, start, end)
        return {
            "week_start": start.date(),
            "week_end": end.date() - timedelta(days=1),
            "total_minutes": totals["total_minutes"],
            "total_hours": round(totals["total_minutes"] / 60, 2),
            "total_sessions": totals["total_sessions"],
            "completed_sessions": totals["completed_sessions"],
            "daily_breakdown": DashboardCalculator.get_daily_breakdown(db, user_id, start, end),
        }

    @staticmethod
    def get_method_statistics(db: Session, user_id: int) -> dict:
        usage = DashboardCalculator.get_method_usage(db, user_id)
        return {"methods": usage, "total_methods_used": len(usage)}

    @staticmethod
    def get_monthly_stats(db: Session, user_id: int, month: int, year: int) -> dict:
        start, end = DashboardCalculator.month_range(month, year)
        totals = DashboardCalculator.range_totals(db, user_id, start, end)
        sessions = totals["total_sessions"]
        return {
            "month": month,
            "year": year,
            "total_minutes": totals["total_minutes"],
            "total_hours": round(totals["total_minutes"] / 60, 2),
            "total_sessions": sessions,
            "average_session_duration": round(totals["total_minutes"] / sessions, 2) if sessions else 0.0,
            "most_productive_day": DashboardCalculator.get_most_productive_day(db, user_id, month, year),
        }

    @staticmethod
    def get_preferences(db: Session, user_id: int) -> dict:
        prefs = AchievementsService.get_or_create_preferences(db, user_id)
        db.commit()
        return {"weekly_goal_hours": prefs.weekly_goal_hours, "achievements": list(prefs.achievements or [])}

    @staticmethod
    def update_preferences(db: Session, user: Usuario, data: PreferencesUpdateSchema) -> dict:
        prefs = AchievementsService.get_or_create_preferences(db, user.user_id)
        prefs.weekly_goal_hours = data.weekly_goal_hours
        db.flush()
        AchievementsService.evaluate(db, user)
        db.commit()
        return {"weekly_goal_hours": prefs.weekly_goal_hours, "achievements": list(prefs.achievements or [])}
