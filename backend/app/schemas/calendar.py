from datetime import datetime, time
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_serializer, model_validator

DayOfWeek = Literal["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]


class CalendarBlockCreate(BaseModel):
    day_of_week: DayOfWeek
    start_time: time = Field(..., description="Hora de inicio, formato HH:MM")
    end_time: time = Field(..., description="Hora de fin, formato HH:MM")
    method: str = Field(..., min_length=1, max_length=45, description="Nombre del método (pomodoro, feynman, ...)")
    subject: str | None = Field(None, max_length=100)
    notes: str | None = Field(None, max_length=500)

    @model_validator(mode="after")
    def _end_after_start(self):
        if self.end_time <= self.start_time:
            raise ValueError("La hora de fin debe ser posterior a la de inicio")
        return self


class CalendarBlockUpdate(BaseModel):
    day_of_week: DayOfWeek | None = None
    start_time: time | None = None
    end_time: time | None = None
    method: str | None = Field(None, min_length=1, max_length=45)
    subject: str | None = Field(None, max_length=100)
    notes: str | None = Field(None, max_length=500)

    @model_validator(mode="after")
    def _end_after_start(self):
        if self.start_time and self.end_time and self.end_time <= self.start_time:
            raise ValueError("La hora de fin debe ser posterior a la de inicio")
        return self


class CalendarBlockResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    block_id: int
    user_id: int
    day_of_week: str
    start_time: time
    end_time: time
    method: str
    subject: str | None = None
    notes: str | None = None
    created_at: datetime | None = None

    @field_serializer("start_time", "end_time")
    def _hhmm(self, value: time) -> str:
        return value.strftime("%H:%M")
