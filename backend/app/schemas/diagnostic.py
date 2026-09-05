from pydantic import BaseModel, ConfigDict, Field, field_validator


class DiagnosticOptionSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    option_id: int
    option_text: str


class DiagnosticQuestionSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    question_id: int
    question_text: str
    question_order: int
    options: list[DiagnosticOptionSchema]


class DiagnosticQuestionsResponse(BaseModel):
    total_questions: int
    questions: list[DiagnosticQuestionSchema]


class UserAnswerSchema(BaseModel):
    question_id: int = Field(..., gt=0)
    option_id: int = Field(..., gt=0)


class SubmitDiagnosticSchema(BaseModel):
    answers: list[UserAnswerSchema] = Field(..., min_length=1)

    @field_validator("answers")
    @classmethod
    def _unique_questions(cls, value: list[UserAnswerSchema]) -> list[UserAnswerSchema]:
        question_ids = [answer.question_id for answer in value]
        if len(question_ids) != len(set(question_ids)):
            raise ValueError("No puedes responder la misma pregunta dos veces")
        return value


class MethodInfoSchema(BaseModel):
    method_id: int
    method_name: str
    score: int | None = None
    title: str
    description: str
    tips: list[str]
    best_for: str


class DiagnosticResultResponse(BaseModel):
    message: str
    primary_method: MethodInfoSchema
    secondary_method: MethodInfoSchema | None = None
    all_scores: dict[str, int] | None = None


class DiagnosticStatusSchema(BaseModel):
    diagnostic_completed: bool
    has_recommended_method: bool
    recommended_method_id: int | None = None
    recommended_method_name: str | None = None
