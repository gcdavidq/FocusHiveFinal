from fastapi import HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app.models.diagnostic import DiagnosticOption, DiagnosticQuestion, DiagnosticResponse
from app.models.method import Metodo
from app.models.user import Usuario
from app.models.user_method import UsuarioMetodo
from app.schemas.diagnostic import UserAnswerSchema
from app.utils.diagnostic_algorithm import DiagnosticAlgorithm


class DiagnosticService:
    @staticmethod
    def get_all_questions(db: Session) -> list[DiagnosticQuestion]:
        questions = (
            db.query(DiagnosticQuestion)
            .options(selectinload(DiagnosticQuestion.options))
            .order_by(DiagnosticQuestion.question_order)
            .all()
        )
        if not questions:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No hay preguntas disponibles. Ejecuta el seed de la base de datos.",
            )
        return questions

    @staticmethod
    def check_diagnostic_status(db: Session, user: Usuario) -> dict:
        recommended = (
            db.query(UsuarioMetodo)
            .filter(UsuarioMetodo.user_id == user.user_id, UsuarioMetodo.es_recomendado.is_(True))
            .first()
        )
        return {
            "diagnostic_completed": bool(user.diagnostic_completed),
            "has_recommended_method": recommended is not None,
            "recommended_method_id": recommended.metodo_id if recommended else None,
            "recommended_method_name": recommended.method.nombre if recommended else None,
        }

    @staticmethod
    def _validate_answers(db: Session, answers: list[UserAnswerSchema]) -> None:
        total_questions = db.query(DiagnosticQuestion).count()
        if len(answers) != total_questions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Debes responder todas las preguntas ({total_questions})",
            )
        option_ids = [a.option_id for a in answers]
        options = {
            o.option_id: o
            for o in db.query(DiagnosticOption).filter(DiagnosticOption.option_id.in_(option_ids)).all()
        }
        for answer in answers:
            option = options.get(answer.option_id)
            if option is None or option.question_id != answer.question_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Opción {answer.option_id} no válida para la pregunta {answer.question_id}",
                )

    @staticmethod
    def process_diagnostic(db: Session, user: Usuario, answers: list[UserAnswerSchema]) -> dict:
        """Guarda las respuestas, calcula el método recomendado y lo marca en usuario_metodo."""
        DiagnosticService._validate_answers(db, answers)

        db.query(DiagnosticResponse).filter(DiagnosticResponse.user_id == user.user_id).delete()
        for answer in answers:
            db.add(DiagnosticResponse(user_id=user.user_id, question_id=answer.question_id, option_id=answer.option_id))

        scores = DiagnosticAlgorithm.calculate_scores(db, [a.option_id for a in answers])
        primary_name, secondary_name = DiagnosticAlgorithm.get_recommended_method(scores)
        methods = DiagnosticService._methods_by_name(db, [primary_name, secondary_name])
        primary = methods.get(primary_name)
        if primary is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"El método '{primary_name}' no existe en la base de datos. Ejecuta el seed.",
            )

        # Solo el método principal queda marcado como recomendado
        db.query(UsuarioMetodo).filter(UsuarioMetodo.user_id == user.user_id).update({"es_recomendado": False})
        link = db.get(UsuarioMetodo, (user.user_id, primary.metodo_id))
        if link:
            link.es_recomendado = True
        else:
            db.add(UsuarioMetodo(user_id=user.user_id, metodo_id=primary.metodo_id, es_recomendado=True))

        user.diagnostic_completed = True
        db.commit()

        return DiagnosticService._build_result(scores, primary, methods.get(secondary_name) if secondary_name else None)

    @staticmethod
    def get_user_result(db: Session, user: Usuario) -> dict | None:
        """Reconstruye el resultado a partir de las respuestas guardadas."""
        if not user.diagnostic_completed:
            return None
        option_ids = [
            r.option_id
            for r in db.query(DiagnosticResponse.option_id).filter(DiagnosticResponse.user_id == user.user_id).all()
        ]
        if not option_ids:
            return None
        scores = DiagnosticAlgorithm.calculate_scores(db, option_ids)
        primary_name, secondary_name = DiagnosticAlgorithm.get_recommended_method(scores)
        methods = DiagnosticService._methods_by_name(db, [primary_name, secondary_name])
        primary = methods.get(primary_name)
        if primary is None:
            return None
        return DiagnosticService._build_result(scores, primary, methods.get(secondary_name) if secondary_name else None)

    @staticmethod
    def _methods_by_name(db: Session, names: list[str | None]) -> dict[str, Metodo]:
        wanted = [n for n in names if n]
        return {m.nombre: m for m in db.query(Metodo).filter(Metodo.nombre.in_(wanted)).all()}

    @staticmethod
    def _build_result(scores: dict[str, int], primary: Metodo, secondary: Metodo | None) -> dict:
        def info(method: Metodo) -> dict:
            return {
                "method_id": method.metodo_id,
                "method_name": method.nombre,
                "score": scores.get(method.nombre, 0),
                **DiagnosticAlgorithm.get_method_recommendations(method.nombre),
            }

        return {
            "primary_method": info(primary),
            "secondary_method": info(secondary) if secondary else None,
            "all_scores": scores,
        }
