from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# =========================================================
# --- MÓDULOS DE GIAN (Sesiones, Flashcards, Comunidad) ---
# =========================================================

# --- Schemas para Sesiones ---
class SessionBase(BaseModel):
    user_id: int
    metodo_id: int

class SessionCreate(SessionBase):
    fecha_inicio: datetime = datetime.now()
    descripcion: Optional[str] = None

class SessionUpdate(BaseModel):
    duracion_minutos: Optional[int] = None
    fue_completada: Optional[bool] = None
    descripcion: Optional[str] = None

class SessionOut(SessionBase):
    session_id: int
    fecha_inicio: datetime
    duracion_minutos: int
    fue_completada: bool
    descripcion: Optional[str] = None

    class Config:
        from_attributes = True


# --- Schemas para Flashcards ---
class FlashcardBase(BaseModel):
    question: str
    answer: str
    is_reversed: bool = False
    flashcard_color: Optional[str] = None

class FlashcardCreate(FlashcardBase):
    # card_user se obtiene del token, no se envía en el body
    pass

class FlashcardOut(FlashcardBase):
    card_id: int
    is_active: bool
    card_user: int
    collection: int

    class Config:
        from_attributes = True


# --- Schemas para Colecciones (MODIFICADO: agregado user_id) ---
class CollectionBase(BaseModel):
    collection_name: str
    collection_color: str

class CollectionCreate(CollectionBase):
    is_active: bool = True
    # ✅ NOTA: user_id se obtiene del token, no se envía en el body

class CollectionOut(CollectionBase):
    collection_id: int
    user_id: int  # ✅ NUEVO
    is_active: bool

    class Config:
        from_attributes = True

class CollectionOutWithCards(CollectionOut):
    flashcards: List[FlashcardOut] = []

    class Config:
        from_attributes = True


# --- Schemas para Comunidad (Posts y Likes) ---
class LikeBase(BaseModel):
    user_id: int 

class LikeCreate(LikeBase):
    pass

class LikeOut(LikeBase):
    like_id: int
    post_id: int
    like_date: datetime
    
    class Config:
        from_attributes = True

class PostBase(BaseModel):
    image_url: str
    description: Optional[str] = None

class PostCreate(PostBase):
    user_id: int

class PostUpdate(BaseModel):
    description: Optional[str] = None
    active: Optional[bool] = None

class PostOut(PostBase):
    post_id: int
    user_id: int
    active: bool
    publish_date: datetime
    
    class Config:
        from_attributes = True

class PostOutWithLikes(PostOut):
    likes: List[LikeOut] = []
    
    class Config:
        from_attributes = True


# =========================================================
# --- MÓDULOS DE FLORIAN (Auth, Perfil, Métodos, Diagnóstico) ---
# =========================================================

# --- Schemas para Usuario y Autenticación ---

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class UserRegister(UserBase):
    password: str

class UserLogin(BaseModel):
    identifier: str
    password: str

class UserOut(UserBase):
    user_id: int
    is_premium: Optional[bool] = None
    level: int
    total_studied_time: int
    diagnostic_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    
class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str


# --- Schemas para Métodos de Estudio ---

class MetodoOut(BaseModel):
    metodo_id: int
    nombre: str
    descripcion: str
    tipo_aprendizaje_compatible: str

    class Config:
        from_attributes = True

class UsuarioMetodoOut(BaseModel):
    user_id: int
    metodo_id: int
    es_recomendado: bool
    es_utilizado: bool
    
    class Config:
        from_attributes = True


# --- Schemas para Diagnóstico ---

class DiagnosticOptionOut(BaseModel):
    option_id: int
    option_text: str
    
    class Config:
        from_attributes = True

class DiagnosticQuestionOut(BaseModel):
    question_id: int
    question_text: str
    question_order: int
    options: List[DiagnosticOptionOut] = []
    
    class Config:
        from_attributes = True

class DiagnosticResponseIn(BaseModel):
    question_id: int
    option_id: int

class DiagnosticFormIn(BaseModel):
    responses: List[DiagnosticResponseIn]

class DiagnosticResultOut(BaseModel):
    message: str
    method_recommendation: MetodoOut
    diagnostic_completed: bool