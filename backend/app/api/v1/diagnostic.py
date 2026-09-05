from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import Usuario
from app.schemas.diagnostic import (
    DiagnosticQuestionsResponse,
    DiagnosticResultResponse,
    DiagnosticStatusSchema,
    SubmitDiagnosticSchema,
)
from app.services.diagnostic_service import DiagnosticService

router = APIRouter(prefix="/diagnostic", tags=["Diagnóstico"])


@router.get("/status", response_model=DiagnosticStatusSchema, summary="Estado del diagnóstico")
def get_status(current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    return DiagnosticService.check_diagnostic_status(db, current_user)


@router.get("/questions", response_model=DiagnosticQuestionsResponse, summary="Preguntas del diagnóstico")
def get_questions(_: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    questions = DiagnosticService.get_all_questions(db)
    return DiagnosticQuestionsResponse(total_questions=len(questions), questions=questions)


@router.post("/submit", response_model=DiagnosticResultResponse, summary="Enviar respuestas")
def submit_diagnostic(
    data: SubmitDiagnosticSchema,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Procesa las respuestas y devuelve el método recomendado (y uno secundario si queda cerca en puntaje)."""
    result = DiagnosticService.process_diagnostic(db, current_user, data.answers)
    return DiagnosticResultResponse(message="Diagnóstico completado exitosamente", **result)


@router.get("/result", response_model=DiagnosticResultResponse, summary="Resultado guardado")
def get_result(current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    result = DiagnosticService.get_user_result(db, current_user)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No has completado el diagnóstico")
    return DiagnosticResultResponse(message="Resultado obtenido", **result)
