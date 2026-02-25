from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import (
    Boolean, Column, DateTime, Enum, ForeignKey,
    Integer, String, Text, UniqueConstraint
)
from sqlalchemy.orm import relationship

from app.database import Base


class EstadoProyecto(str, PyEnum):
    ACTIVO = "ACTIVO"
    EN_DIAGNOSTICO = "EN_DIAGNOSTICO"
    COMPLETADO = "COMPLETADO"
    PAUSADO = "PAUSADO"


class ProyectoSGC(Base):
    __tablename__ = "proyectos_sgc"

    id = Column(Integer, primary_key=True, index=True)
    nombre_empresa = Column(String(255), nullable=False)
    sector = Column(String(100), nullable=True)
    contacto_nombre = Column(String(150), nullable=True)
    contacto_email = Column(String(150), nullable=True)
    estado = Column(
        Enum(EstadoProyecto),
        default=EstadoProyecto.ACTIVO,
        nullable=False
    )
    fecha_creacion = Column(DateTime, default=datetime.utcnow, nullable=False)
    fecha_actualizacion = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    respuestas = relationship(
        "RespuestaDiagnostico", back_populates="proyecto", cascade="all, delete-orphan"
    )


class RequisitoISO9001(Base):
    __tablename__ = "requisitos_iso9001"

    id = Column(Integer, primary_key=True, index=True)
    capitulo = Column(Integer, nullable=False, index=True)  # 4 al 10
    numeral = Column(String(20), nullable=False)             # e.g. "4.1", "6.2.1"
    pregunta_texto = Column(Text, nullable=False)
    descripcion_ayuda = Column(Text, nullable=True)

    respuestas = relationship("RespuestaDiagnostico", back_populates="requisito")


class RespuestaDiagnostico(Base):
    __tablename__ = "respuestas_diagnostico"

    id = Column(Integer, primary_key=True, index=True)
    proyecto_id = Column(
        Integer, ForeignKey("proyectos_sgc.id", ondelete="CASCADE"), nullable=False, index=True
    )
    requisito_id = Column(
        Integer, ForeignKey("requisitos_iso9001.id", ondelete="CASCADE"), nullable=False
    )
    cumple = Column(Boolean, nullable=False, default=False)
    evidencia = Column(Text, nullable=True)
    fecha_respuesta = Column(DateTime, default=datetime.utcnow, nullable=False)

    proyecto = relationship("ProyectoSGC", back_populates="respuestas")
    requisito = relationship("RequisitoISO9001", back_populates="respuestas")

    __table_args__ = (
        UniqueConstraint("proyecto_id", "requisito_id", name="uq_proyecto_requisito"),
    )
