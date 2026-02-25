from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import EstadoProyecto, ProyectoSGC
from app.schemas import ProyectoCreate, ProyectoOut, ProyectoUpdate

router = APIRouter(prefix="/proyectos", tags=["Proyectos"])


@router.get("/", response_model=List[ProyectoOut])
def listar_proyectos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """HU-01: Lista todos los proyectos SGC para el dashboard principal."""
    proyectos = db.query(ProyectoSGC).offset(skip).limit(limit).all()
    return proyectos


@router.get("/{proyecto_id}", response_model=ProyectoOut)
def obtener_proyecto(proyecto_id: int, db: Session = Depends(get_db)):
    proyecto = db.query(ProyectoSGC).filter(ProyectoSGC.id == proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return proyecto


@router.post("/", response_model=ProyectoOut, status_code=status.HTTP_201_CREATED)
def crear_proyecto(payload: ProyectoCreate, db: Session = Depends(get_db)):
    proyecto = ProyectoSGC(**payload.model_dump())
    db.add(proyecto)
    db.commit()
    db.refresh(proyecto)
    return proyecto


@router.put("/{proyecto_id}", response_model=ProyectoOut)
def actualizar_proyecto(
    proyecto_id: int, payload: ProyectoUpdate, db: Session = Depends(get_db)
):
    proyecto = db.query(ProyectoSGC).filter(ProyectoSGC.id == proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(proyecto, field, value)
    db.commit()
    db.refresh(proyecto)
    return proyecto


@router.delete("/{proyecto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_proyecto(proyecto_id: int, db: Session = Depends(get_db)):
    proyecto = db.query(ProyectoSGC).filter(ProyectoSGC.id == proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    db.delete(proyecto)
    db.commit()
