from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from app.models import EstadoProyecto


# ─────────────────────────────────────────────
# ProyectoSGC
# ─────────────────────────────────────────────

class ProyectoCreate(BaseModel):
    nombre_empresa: str = Field(..., min_length=2, max_length=255)
    sector: Optional[str] = Field(None, max_length=100)
    contacto_nombre: Optional[str] = Field(None, max_length=150)
    contacto_email: Optional[str] = Field(None, max_length=150)


class ProyectoUpdate(BaseModel):
    nombre_empresa: Optional[str] = Field(None, min_length=2, max_length=255)
    sector: Optional[str] = None
    contacto_nombre: Optional[str] = None
    contacto_email: Optional[str] = None
    estado: Optional[EstadoProyecto] = None


class ProyectoOut(BaseModel):
    id: int
    nombre_empresa: str
    sector: Optional[str]
    contacto_nombre: Optional[str]
    contacto_email: Optional[str]
    estado: EstadoProyecto
    fecha_creacion: datetime
    fecha_actualizacion: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────
# RequisitoISO9001
# ─────────────────────────────────────────────

class RequisitoOut(BaseModel):
    id: int
    capitulo: int
    numeral: str
    pregunta_texto: str
    descripcion_ayuda: Optional[str]

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────
# RespuestaDiagnostico
# ─────────────────────────────────────────────

class RespuestaItem(BaseModel):
    requisito_id: int
    cumple: bool
    evidencia: Optional[str] = None


class DiagnosticoSubmit(BaseModel):
    proyecto_id: int
    respuestas: list[RespuestaItem]


class RespuestaOut(BaseModel):
    id: int
    proyecto_id: int
    requisito_id: int
    cumple: bool
    evidencia: Optional[str]
    fecha_respuesta: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────
# Métricas / Resultados
# ─────────────────────────────────────────────

class MetricaCapitulo(BaseModel):
    capitulo: int
    nombre_capitulo: str
    total_preguntas: int
    respuestas_afirmativas: int
    porcentaje_cumplimiento: float


class MetricasDiagnostico(BaseModel):
    proyecto_id: int
    nombre_empresa: str
    total_preguntas: int
    total_afirmativas: int
    porcentaje_global: float
    capitulos: list[MetricaCapitulo]
