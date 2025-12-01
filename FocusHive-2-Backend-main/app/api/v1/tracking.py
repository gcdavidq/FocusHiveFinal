from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
import json

from app.database.connection import get_db
from app.models.tracking_session import TrackingSession
from app.models.user_tracking_prefs import UserTrackingPrefs
from app.schemas.tracking import (
    TrackingSessionCreate, 
    TrackingSessionResponse, 
    WeeklyStatsResponse,
    UserPrefsUpdate,
    UserPrefsResponse
)
from app.api.v1.auth import get_current_user
from app.models.user import Usuario

router = APIRouter(
    prefix="/progress/tracking",
    tags=["Seguimiento"]
)

# =============================================
# SESIONES DE SEGUIMIENTO
# =============================================

@router.post("/sessions", response_model=TrackingSessionResponse, status_code=status.HTTP_201_CREATED)
def create_tracking_session(
    session_data: TrackingSessionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Crear una nueva sesión de seguimiento"""
    new_session = TrackingSession(
        user_id=current_user.user_id,
        day_of_week=session_data.day_of_week,
        hours=session_data.hours,
        method=session_data.method,
        description=session_data.description
    )
    
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    
    # Verificar logros después de agregar sesión
    check_and_update_achievements(db, current_user.user_id)
    
    return new_session

@router.get("/sessions", response_model=List[TrackingSessionResponse])
def get_tracking_sessions(
    days: int = 7,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener sesiones de seguimiento (últimos N días)"""
    cutoff_date = datetime.now() - timedelta(days=days)
    
    sessions = db.query(TrackingSession).filter(
        TrackingSession.user_id == current_user.user_id,
        TrackingSession.created_at >= cutoff_date
    ).order_by(TrackingSession.created_at.desc()).offset(skip).limit(limit).all()
    
    return sessions

@router.get("/stats", response_model=WeeklyStatsResponse)
def get_weekly_stats(
    days: int = 7,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener estadísticas semanales"""
    cutoff_date = datetime.now() - timedelta(days=days)
    
    sessions = db.query(TrackingSession).filter(
        TrackingSession.user_id == current_user.user_id,
        TrackingSession.created_at >= cutoff_date
    ).all()
    
    total_hours = sum(s.hours for s in sessions)
    sessions_count = len(sessions)
    
    hours_by_day = {}
    for s in sessions:
        hours_by_day[s.day_of_week] = hours_by_day.get(s.day_of_week, 0) + s.hours
    
    method_stats = {}
    for s in sessions:
        if s.method not in method_stats:
            method_stats[s.method] = {"count": 0, "hours": 0}
        method_stats[s.method]["count"] += 1
        method_stats[s.method]["hours"] += s.hours
    
    for method in method_stats:
        if sessions_count > 0:
            method_stats[method]["percentage"] = round(
                (method_stats[method]["count"] / sessions_count) * 100
            )
        else:
            method_stats[method]["percentage"] = 0
    
    most_used_method = None
    if method_stats:
        most_used_method = max(method_stats, key=lambda m: method_stats[m]["count"])
    
    return WeeklyStatsResponse(
        total_hours=round(total_hours, 1),
        sessions_count=sessions_count,
        hours_by_day=hours_by_day,
        method_stats=method_stats,
        most_used_method=most_used_method
    )

@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tracking_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Eliminar una sesión de seguimiento"""
    session = db.query(TrackingSession).filter(
        TrackingSession.session_id == session_id,
        TrackingSession.user_id == current_user.user_id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sesión no encontrada"
        )
    
    db.delete(session)
    db.commit()
    
    return None

@router.delete("/sessions", status_code=status.HTTP_204_NO_CONTENT)
def reset_week(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Reiniciar semana - eliminar todas las sesiones"""
    db.query(TrackingSession).filter(
        TrackingSession.user_id == current_user.user_id
    ).delete()
    db.commit()
    
    return None

# =============================================
# PREFERENCIAS DE USUARIO (META Y LOGROS)
# =============================================

def get_or_create_prefs(db: Session, user_id: int) -> UserTrackingPrefs:
    """Obtener o crear preferencias del usuario"""
    prefs = db.query(UserTrackingPrefs).filter(
        UserTrackingPrefs.user_id == user_id
    ).first()
    
    if not prefs:
        prefs = UserTrackingPrefs(user_id=user_id, weekly_goal=20.0, achievements="[]")
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
    
    return prefs

def check_and_update_achievements(db: Session, user_id: int):
    """Verificar y actualizar logros"""
    prefs = get_or_create_prefs(db, user_id)
    achievements = json.loads(prefs.achievements)
    
    # Obtener todas las sesiones del usuario
    sessions = db.query(TrackingSession).filter(
        TrackingSession.user_id == user_id
    ).all()
    
    total_hours = sum(s.hours for s in sessions)
    used_methods = set(s.method for s in sessions)
    studied_days = set(s.day_of_week for s in sessions)
    
    # Primera sesión
    if len(sessions) >= 1 and "first_session" not in achievements:
        achievements.append("first_session")
    
    # Meta semanal
    if total_hours >= prefs.weekly_goal and "week_goal" not in achievements:
        achievements.append("week_goal")
    
    # 20 horas totales
    if total_hours >= 20 and "total_20h" not in achievements:
        achievements.append("total_20h")
    
    # Todos los métodos
    if len(used_methods) >= 4 and "all_methods" not in achievements:
        achievements.append("all_methods")
    
    # Semana perfecta
    if len(studied_days) >= 7 and "streak_7" not in achievements:
        achievements.append("streak_7")
    
    # Guardar
    prefs.achievements = json.dumps(achievements)
    db.commit()

@router.get("/preferences", response_model=UserPrefsResponse)
def get_user_prefs(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener preferencias del usuario (meta y logros)"""
    prefs = get_or_create_prefs(db, current_user.user_id)
    
    return UserPrefsResponse(
        weekly_goal=prefs.weekly_goal,
        achievements=json.loads(prefs.achievements)
    )

@router.put("/preferences", response_model=UserPrefsResponse)
def update_user_prefs(
    prefs_data: UserPrefsUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Actualizar meta semanal"""
    prefs = get_or_create_prefs(db, current_user.user_id)
    
    if prefs_data.weekly_goal is not None:
        prefs.weekly_goal = prefs_data.weekly_goal
    
    db.commit()
    db.refresh(prefs)
    
    return UserPrefsResponse(
        weekly_goal=prefs.weekly_goal,
        achievements=json.loads(prefs.achievements)
    )