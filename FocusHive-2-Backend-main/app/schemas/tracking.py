from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime

class TrackingSessionCreate(BaseModel):
    day_of_week: str = Field(..., min_length=1, max_length=20)
    hours: float = Field(..., gt=0, le=24)
    method: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None

class TrackingSessionResponse(BaseModel):
    session_id: int
    user_id: int
    day_of_week: str
    hours: float
    method: str
    description: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class WeeklyStatsResponse(BaseModel):
    total_hours: float
    sessions_count: int
    hours_by_day: Dict[str, float]
    method_stats: Dict[str, dict]
    most_used_method: Optional[str]

class UserPrefsUpdate(BaseModel):
    weekly_goal: Optional[float] = Field(None, gt=0, le=168)

class UserPrefsResponse(BaseModel):
    weekly_goal: float
    achievements: List[str]
    
    class Config:
        from_attributes = True