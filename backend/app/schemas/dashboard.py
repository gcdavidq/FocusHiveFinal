from datetime import date, datetime, timedelta, timezone

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.models.study_session import SesionEstudio
from app.utils.dashboard_utils import utc_now


class CreateStudySessionSchema(BaseModel):
    """Registro de una sesión de estudio. Indica el método por id o por nombre (pomodoro, feynman...)."""

    metodo_id: int | None = Field(None, gt=0)
    metodo: str | None = Field(None, min_length=3, max_length=45, description="Nombre del método")
    fecha_inicio: datetime
    duracion_minutos: int = Field(..., ge=1, le=1440, description="Duración en minutos (máximo 24 horas)")
    fue_completada: bool = True
    descripcion: str | None = Field(None, max_length=500)

    @field_validator("fecha_inicio")
    @classmethod
    def _normalize_date(cls, value: datetime) -> datetime:
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        if value > utc_now() + timedelta(minutes=5):
            raise ValueError("La fecha de inicio no puede ser en el futuro")
        return value

    @model_validator(mode="after")
    def _method_required(self):
        if self.metodo_id is None and not self.metodo:
            raise ValueError("Indica metodo_id o metodo")
        return self


class StudySessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_id: int
    user_id: int
    metodo_id: int
    metodo_nombre: str
    metodo_titulo: str
    fecha_inicio: datetime
    duracion_minutos: int
    fue_completada: bool
    descripcion: str | None = None

    @classmethod
    def from_session(cls, session: SesionEstudio) -> "StudySessionResponse":
        return cls(
            session_id=session.session_id,
            user_id=session.user_id,
            metodo_id=session.metodo_id,
            metodo_nombre=session.method.nombre,
            metodo_titulo=session.method.titulo,
            fecha_inicio=session.fecha_inicio,
            duracion_minutos=session.duracion_minutos,
            fue_completada=session.fue_completada,
            descripcion=session.descripcion,
        )


class CreateSessionResponse(BaseModel):
    message: str
    session: StudySessionResponse
    new_achievements: list[str] = []


class DailyProgressSchema(BaseModel):
    date: date
    total_minutes: int
    total_sessions: int
    completed_sessions: int
    completion_rate: float


class WeeklyProgressSchema(BaseModel):
    week_start: date
    week_end: date
    total_minutes: int
    total_hours: float
    total_sessions: int
    completed_sessions: int
    daily_breakdown: list[DailyProgressSchema]


class MethodUsageSchema(BaseModel):
    metodo_id: int
    metodo_nombre: str
    metodo_titulo: str
    total_sessions: int
    total_minutes: int
    total_hours: float
    percentage: float


class StudyStreakSchema(BaseModel):
    current_streak: int
    longest_streak: int
    last_study_date: date | None = None


class SessionHistorySchema(BaseModel):
    sessions: list[StudySessionResponse]
    total_count: int
    page: int
    pages: int


class DashboardSummarySchema(BaseModel):
    user_id: int
    username: str
    level: int
    total_studied_time: int
    today_minutes: int
    today_sessions: int
    week_minutes: int
    week_hours: float
    weekly_goal_hours: float
    week_goal_progress: float = Field(..., description="Porcentaje de la meta semanal alcanzado")
    recommended_method: MethodUsageSchema | None = None
    most_used_method: MethodUsageSchema | None = None
    study_streak: StudyStreakSchema
    weekly_progress: WeeklyProgressSchema
    methods_usage: list[MethodUsageSchema]
    achievements: list[str]


class MonthlyStatsSchema(BaseModel):
    month: int
    year: int
    total_minutes: int
    total_hours: float
    total_sessions: int
    average_session_duration: float
    most_productive_day: str | None = None


class TodayProgressSchema(BaseModel):
    date: date
    total_minutes: int
    total_hours: float
    total_sessions: int
    completed_sessions: int
    completion_rate: float


class MethodStatsResponse(BaseModel):
    methods: list[MethodUsageSchema]
    total_methods_used: int


class PreferencesSchema(BaseModel):
    weekly_goal_hours: float
    achievements: list[str]


class PreferencesUpdateSchema(BaseModel):
    weekly_goal_hours: float = Field(..., gt=0, le=168)


class AchievementSchema(BaseModel):
    code: str
    name: str
    description: str
    icon: str
