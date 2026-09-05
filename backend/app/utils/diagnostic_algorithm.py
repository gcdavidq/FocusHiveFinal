"""Algoritmo del diagnóstico: suma puntos por método y elige el principal y un secundario cercano."""
from sqlalchemy.orm import Session

from app.models.diagnostic import DiagnosticOption

# Umbral: el secundario se muestra si alcanza al menos este porcentaje del puntaje del principal
SECONDARY_THRESHOLD = 0.8

METHOD_INFO: dict[str, dict] = {
    "pomodoro": {
        "title": "Técnica Pomodoro",
        "description": "Gestión del tiempo en bloques de 25 minutos con descansos programados.",
        "tips": [
            "Estudia en bloques de 25 minutos (pomodoros)",
            "Toma descansos de 5 minutos entre pomodoros",
            "Después de 4 pomodoros, descansa 15 a 30 minutos",
            "Usa un temporizador y elimina distracciones antes de empezar",
        ],
        "best_for": "Concentración, constancia y manejo del tiempo",
    },
    "feynman": {
        "title": "Técnica Feynman",
        "description": "Aprender explicando el concepto con palabras simples.",
        "tips": [
            "Elige un concepto y explícalo como si enseñaras a un niño",
            "Usa lenguaje simple, sin tecnicismos",
            "Identifica dónde te trabas: ahí están tus vacíos",
            "Vuelve al material y profundiza esas áreas",
            "Repite hasta explicarlo con fluidez",
        ],
        "best_for": "Comprensión profunda de conceptos",
    },
    "cornell": {
        "title": "Método Cornell",
        "description": "Sistema organizado de toma de notas en tres secciones.",
        "tips": [
            "Divide la página: notas (derecha), palabras clave (izquierda), resumen (abajo)",
            "Toma notas durante la clase en la sección principal",
            "Escribe preguntas y palabras clave a la izquierda",
            "Resume toda la página al final",
            "Repasa cubriendo las notas y respondiendo con las palabras clave",
        ],
        "best_for": "Organización y repaso efectivo",
    },
    "flashcards": {
        "title": "Flashcards",
        "description": "Tarjetas de memoria con repetición activa.",
        "tips": [
            "Crea tarjetas con la pregunta adelante y la respuesta atrás",
            "Repasa a diario las tarjetas nuevas",
            "Clasifícalas en fácil, medio y difícil",
            "Repasa las difíciles con más frecuencia",
        ],
        "best_for": "Memorización y retención a largo plazo",
    },
}


class DiagnosticAlgorithm:
    @staticmethod
    def calculate_scores(db: Session, option_ids: list[int]) -> dict[str, int]:
        """Suma los puntos de las opciones elegidas agrupados por método (una sola consulta)."""
        scores = {name: 0 for name in METHOD_INFO}
        if not option_ids:
            return scores
        options = db.query(DiagnosticOption).filter(DiagnosticOption.option_id.in_(option_ids)).all()
        for option in options:
            method_name = option.method.nombre.lower()
            scores[method_name] = scores.get(method_name, 0) + option.points
        return scores

    @staticmethod
    def get_recommended_method(scores: dict[str, int]) -> tuple[str, str | None]:
        """Devuelve (principal, secundario). El secundario solo si está cerca del principal."""
        ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
        primary, primary_score = ranked[0]
        secondary = None
        if len(ranked) > 1 and primary_score > 0:
            candidate, candidate_score = ranked[1]
            if candidate_score >= primary_score * SECONDARY_THRESHOLD:
                secondary = candidate
        return primary, secondary

    @staticmethod
    def get_method_recommendations(method_name: str) -> dict:
        return METHOD_INFO.get(method_name.lower(), METHOD_INFO["pomodoro"])
