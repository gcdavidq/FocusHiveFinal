from pydantic import BaseModel, ConfigDict


class MethodResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    metodo_id: int
    nombre: str
    titulo: str
    descripcion: str
    tipo_aprendizaje_compatible: str
