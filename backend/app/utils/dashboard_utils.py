"""Cálculos del dashboard de progreso. Todas las fechas se manejan en UTC."""
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import case, extract, func
from sqlalchemy.orm import Session

from app.models.method import Metodo
from app.models.study_session import SesionEstudio

DAY_NAMES_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _to_date(value) -> date:
    """Normaliza el resultado de func.date(): PostgreSQL devuelve date, SQLite devuelve str."""
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    return date.fromisoformat(str(value)[:10])


def _start_of_day(d: date) -> datetime:
    return datetime(d.year, d.month, d.day, tzinfo=timezone.utc)


class DashboardCalculator:
    @staticmethod
    def get_date_range(period: str, now: datetime | None = None) -> tuple[datetime, datetime]:
        """Rango [inicio, fin) para 'today', 'week' (lunes a domingo), 'month' o 'year'."""
        now = now or utc_now()
        today = now.date()
        if period == "today":
            start = _start_of_day(today)
            end = start + timedelta(days=1)
        elif period == "week":
            start = _start_of_day(today - timedelta(days=today.weekday()))
            end = start + timedelta(days=7)
        elif period == "month":
            start = _start_of_day(today.replace(day=1))
            next_month = start.replace(year=start.year + 1, month=1) if start.month == 12 else start.replace(month=start.month + 1)
            end = next_month
        elif period == "year":
            start = _start_of_day(today.replace(month=1, day=1))
            end = start.replace(year=start.year + 1)
        else:
            raise ValueError(f"Período desconocido: {period}")
        return start, end

    @staticmethod
    def month_range(month: int, year: int) -> tuple[datetime, datetime]:
        start = datetime(year, month, 1, tzinfo=timezone.utc)
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc) if month == 12 else datetime(year, month + 1, 1, tzinfo=timezone.utc)
        return start, end

    @staticmethod
    def range_totals(db: Session, user_id: int, start: datetime, end: datetime) -> dict:
        """Minutos, sesiones y sesiones completadas del período en una sola consulta."""
        row = (
            db.query(
                func.coalesce(func.sum(SesionEstudio.duracion_minutos), 0),
                func.count(SesionEstudio.session_id),
                func.coalesce(func.sum(case((SesionEstudio.fue_completada.is_(True), 1), else_=0)), 0),
            )
            .filter(
                SesionEstudio.user_id == user_id,
                SesionEstudio.fecha_inicio >= start,
                SesionEstudio.fecha_inicio < end,
            )
            .one()
        )
        total_minutes, total_sessions, completed = int(row[0]), int(row[1]), int(row[2])
        completion_rate = round(completed / total_sessions * 100, 2) if total_sessions else 0.0
        return {
            "total_minutes": total_minutes,
            "total_sessions": total_sessions,
            "completed_sessions": completed,
            "completion_rate": completion_rate,
        }

    @staticmethod
    def get_daily_breakdown(db: Session, user_id: int, start: datetime, end: datetime) -> list[dict]:
        """Desglose por día del período, incluyendo los días sin sesiones (una consulta agrupada)."""
        day_expr = func.date(SesionEstudio.fecha_inicio)
        rows = (
            db.query(
                day_expr.label("day"),
                func.sum(SesionEstudio.duracion_minutos),
                func.count(SesionEstudio.session_id),
                func.sum(case((SesionEstudio.fue_completada.is_(True), 1), else_=0)),
            )
            .filter(
                SesionEstudio.user_id == user_id,
                SesionEstudio.fecha_inicio >= start,
                SesionEstudio.fecha_inicio < end,
            )
            .group_by(day_expr)
            .all()
        )
        by_day = {_to_date(r[0]): (int(r[1] or 0), int(r[2] or 0), int(r[3] or 0)) for r in rows}

        breakdown = []
        current = start.date()
        last = (end - timedelta(seconds=1)).date()
        while current <= last:
            minutes, sessions, completed = by_day.get(current, (0, 0, 0))
            breakdown.append(
                {
                    "date": current,
                    "total_minutes": minutes,
                    "total_sessions": sessions,
                    "completed_sessions": completed,
                    "completion_rate": round(completed / sessions * 100, 2) if sessions else 0.0,
                }
            )
            current += timedelta(days=1)
        return breakdown

    @staticmethod
    def get_method_usage(
        db: Session, user_id: int, start: datetime | None = None, end: datetime | None = None
    ) -> list[dict]:
        """Uso de cada método (sesiones, minutos y porcentaje), ordenado por minutos."""
        query = (
            db.query(
                SesionEstudio.metodo_id,
                Metodo.nombre,
                Metodo.titulo,
                func.count(SesionEstudio.session_id),
                func.coalesce(func.sum(SesionEstudio.duracion_minutos), 0),
            )
            .join(Metodo, SesionEstudio.metodo_id == Metodo.metodo_id)
            .filter(SesionEstudio.user_id == user_id)
        )
        if start and end:
            query = query.filter(SesionEstudio.fecha_inicio >= start, SesionEstudio.fecha_inicio < end)
        rows = query.group_by(SesionEstudio.metodo_id, Metodo.nombre, Metodo.titulo).all()

        total_minutes = sum(int(r[4]) for r in rows)
        usage = []
        for metodo_id, nombre, titulo, sessions, minutes in rows:
            minutes = int(minutes)
            usage.append(
                {
                    "metodo_id": metodo_id,
                    "metodo_nombre": nombre,
                    "metodo_titulo": titulo,
                    "total_sessions": int(sessions),
                    "total_minutes": minutes,
                    "total_hours": round(minutes / 60, 2),
                    "percentage": round(minutes / total_minutes * 100, 2) if total_minutes else 0.0,
                }
            )
        usage.sort(key=lambda item: item["total_minutes"], reverse=True)
        return usage

    @staticmethod
    def calculate_study_streak(db: Session, user_id: int, today: date | None = None) -> dict:
        """Racha actual y más larga de días consecutivos con al menos una sesión."""
        day_expr = func.date(SesionEstudio.fecha_inicio)
        rows = (
            db.query(day_expr)
            .filter(SesionEstudio.user_id == user_id)
            .distinct()
            .order_by(day_expr.desc())
            .all()
        )
        if not rows:
            return {"current_streak": 0, "longest_streak": 0, "last_study_date": None}

        study_dates = sorted({_to_date(r[0]) for r in rows}, reverse=True)
        today = today or utc_now().date()
        last_study_date = study_dates[0]

        current_streak = 0
        if last_study_date >= today - timedelta(days=1):
            current_streak = 1
            expected = last_study_date - timedelta(days=1)
            for study_date in study_dates[1:]:
                if study_date != expected:
                    break
                current_streak += 1
                expected -= timedelta(days=1)

        longest_streak = temp = 1
        for previous, current in zip(study_dates, study_dates[1:]):
            temp = temp + 1 if (previous - current).days == 1 else 1
            longest_streak = max(longest_streak, temp)

        return {
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "last_study_date": last_study_date,
        }

    @staticmethod
    def get_most_productive_day(db: Session, user_id: int, month: int, year: int) -> str | None:
        """Nombre del día de la semana con más minutos en el mes indicado."""
        start, end = DashboardCalculator.month_range(month, year)
        dow = extract("dow", SesionEstudio.fecha_inicio)  # 0 = domingo en PostgreSQL y SQLite
        row = (
            db.query(dow.label("dow"), func.sum(SesionEstudio.duracion_minutos).label("minutes"))
            .filter(
                SesionEstudio.user_id == user_id,
                SesionEstudio.fecha_inicio >= start,
                SesionEstudio.fecha_inicio < end,
            )
            .group_by(dow)
            .order_by(func.sum(SesionEstudio.duracion_minutos).desc())
            .first()
        )
        if not row:
            return None
        return DAY_NAMES_ES[int(row[0]) % 7]
