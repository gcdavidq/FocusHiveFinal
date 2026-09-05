"""Datos semilla: los cuatro métodos de estudio y el cuestionario diagnóstico.

Uso:
    python -m app.database.seed          # inserta solo si las tablas están vacías
    python -m app.database.seed --force  # borra preguntas/opciones y las vuelve a insertar
"""
from __future__ import annotations

import logging
import sys

from sqlalchemy.orm import Session

from app.models.diagnostic import DiagnosticOption, DiagnosticQuestion, DiagnosticResponse
from app.models.method import Metodo

logger = logging.getLogger(__name__)

METHODS: list[dict] = [
    {
        "nombre": "pomodoro",
        "titulo": "Técnica Pomodoro",
        "descripcion": "Gestión del tiempo en bloques de 25 minutos de concentración con descansos cortos programados.",
        "tipo_aprendizaje_compatible": "Disciplinado / gestión del tiempo",
    },
    {
        "nombre": "feynman",
        "titulo": "Técnica Feynman",
        "descripcion": "Aprender explicando un concepto con palabras simples para detectar y llenar vacíos de comprensión.",
        "tipo_aprendizaje_compatible": "Reflexivo / conceptual",
    },
    {
        "nombre": "cornell",
        "titulo": "Método Cornell",
        "descripcion": "Sistema de apuntes en tres secciones: notas, palabras clave y resumen, pensado para el repaso activo.",
        "tipo_aprendizaje_compatible": "Estructurado / visual",
    },
    {
        "nombre": "flashcards",
        "titulo": "Flashcards",
        "descripcion": "Tarjetas de pregunta y respuesta con repetición activa para memorizar a largo plazo.",
        "tipo_aprendizaje_compatible": "Memorístico / práctico",
    },
]

# Cada opción apunta al método que favorece. Los puntos permiten ponderar respuestas.
QUESTIONS: list[dict] = [
    {
        "text": "Cuando tienes que estudiar un tema nuevo, ¿qué haces primero?",
        "options": [
            ("Organizo mi tiempo en bloques y empiezo de inmediato", "pomodoro", 2),
            ("Intento explicarlo con mis palabras para ver qué entiendo", "feynman", 2),
            ("Tomo apuntes ordenados mientras leo", "cornell", 2),
            ("Extraigo los conceptos clave para memorizarlos", "flashcards", 2),
        ],
    },
    {
        "text": "¿Cuál es tu mayor dificultad al estudiar?",
        "options": [
            ("Me distraigo y pierdo la noción del tiempo", "pomodoro", 3),
            ("Creo que entiendo, pero luego no sé explicarlo", "feynman", 3),
            ("Mis apuntes son un caos y no me sirven para repasar", "cornell", 3),
            ("Se me olvidan definiciones, fechas y fórmulas", "flashcards", 3),
        ],
    },
    {
        "text": "¿Cómo prefieres repasar antes de un examen?",
        "options": [
            ("Sesiones cortas e intensas con descansos", "pomodoro", 2),
            ("Explicándole el tema a alguien o a mí mismo", "feynman", 2),
            ("Releyendo mis apuntes y resúmenes", "cornell", 2),
            ("Con preguntas y respuestas rápidas", "flashcards", 2),
        ],
    },
    {
        "text": "¿Qué tipo de contenido estudias con más frecuencia?",
        "options": [
            ("Tareas largas o proyectos que exigen constancia", "pomodoro", 2),
            ("Conceptos abstractos que hay que comprender a fondo", "feynman", 2),
            ("Clases teóricas con mucha información", "cornell", 2),
            ("Vocabulario, fórmulas o datos concretos", "flashcards", 2),
        ],
    },
    {
        "text": "¿Cómo te llevas con los descansos durante el estudio?",
        "options": [
            ("Los necesito programados o no rindo", "pomodoro", 3),
            ("Prefiero seguir hasta poder explicar la idea completa", "feynman", 2),
            ("Descanso cuando termino de organizar un tema", "cornell", 2),
            ("Hago pausas cortas entre rondas de repaso", "flashcards", 2),
        ],
    },
    {
        "text": "¿Qué te da más satisfacción al terminar de estudiar?",
        "options": [
            ("Ver cuántos bloques de tiempo completé", "pomodoro", 2),
            ("Poder explicar el tema con palabras simples", "feynman", 3),
            ("Tener apuntes limpios y un buen resumen", "cornell", 3),
            ("Responder todas mis tarjetas sin fallar", "flashcards", 3),
        ],
    },
    {
        "text": "Cuando algo no te queda claro, ¿qué haces?",
        "options": [
            ("Le dedico un bloque de tiempo específico", "pomodoro", 2),
            ("Busco ejemplos sencillos y lo reformulo", "feynman", 2),
            ("Anoto una pregunta al margen para resolverla después", "cornell", 2),
            ("Creo una tarjeta para repasarlo varias veces", "flashcards", 2),
        ],
    },
    {
        "text": "¿Cómo describirías tu forma de aprender?",
        "options": [
            ("Disciplinada y orientada a la gestión del tiempo", "pomodoro", 2),
            ("Reflexiva: necesito entender el porqué", "feynman", 2),
            ("Estructurada y visual", "cornell", 2),
            ("Repetitiva y práctica", "flashcards", 2),
        ],
    },
]


def seed_methods(db: Session) -> dict[str, Metodo]:
    """Crea los métodos que falten y devuelve un mapa nombre -> Metodo."""
    existing = {m.nombre: m for m in db.query(Metodo).all()}
    for data in METHODS:
        if data["nombre"] not in existing:
            method = Metodo(**data)
            db.add(method)
            existing[data["nombre"]] = method
    db.flush()
    return existing


def seed_questions(db: Session, methods: dict[str, Metodo], force: bool = False) -> int:
    """Inserta el cuestionario. Devuelve la cantidad de preguntas insertadas."""
    if db.query(DiagnosticQuestion).count() > 0:
        if not force:
            return 0
        db.query(DiagnosticResponse).delete()
        db.query(DiagnosticOption).delete()
        db.query(DiagnosticQuestion).delete()
        db.flush()

    for order, q in enumerate(QUESTIONS, start=1):
        question = DiagnosticQuestion(question_text=q["text"], question_order=order)
        for text, method_name, points in q["options"]:
            question.options.append(
                DiagnosticOption(option_text=text, method_id=methods[method_name].metodo_id, points=points)
            )
        db.add(question)
    db.flush()
    return len(QUESTIONS)


def run_seed(db: Session, force: bool = False) -> None:
    methods = seed_methods(db)
    inserted = seed_questions(db, methods, force=force)
    db.commit()
    logger.info("Seed listo: %d métodos, %d preguntas insertadas", len(methods), inserted)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    from app.database.connection import Base, SessionLocal, engine

    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        run_seed(session, force="--force" in sys.argv)
