from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import ProyectoSGC, RequisitoISO9001, RespuestaDiagnostico, EstadoProyecto
from app.schemas import (
    DiagnosticoSubmit,
    MetricaCapitulo,
    MetricasDiagnostico,
    RequisitoOut,
    RespuestaOut,
)
from app.seed_data import NOMBRES_CAPITULOS

router = APIRouter(prefix="/diagnostico", tags=["Diagnóstico"])


# ─────────────────────────────────────────────
# Requisitos ISO (cuestionario)
# ─────────────────────────────────────────────

@router.get("/requisitos", response_model=List[RequisitoOut])
def listar_requisitos(db: Session = Depends(get_db)):
    """HU-02: Retorna todas las preguntas agrupables por capítulo en el frontend."""
    return db.query(RequisitoISO9001).order_by(RequisitoISO9001.capitulo, RequisitoISO9001.id).all()


# ─────────────────────────────────────────────
# Envío de respuestas (HU-02)
# ─────────────────────────────────────────────

@router.post("/respuestas/", response_model=List[RespuestaOut], status_code=status.HTTP_201_CREATED)
def guardar_respuestas(payload: DiagnosticoSubmit, db: Session = Depends(get_db)):
    """
    HU-02: Guarda (o actualiza) todas las respuestas del cuestionario para un proyecto.
    Usa upsert manual: si la fila existe se actualiza, si no se crea.
    """
    proyecto = db.query(ProyectoSGC).filter(ProyectoSGC.id == payload.proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    # Validar que todos los requisito_id existen
    req_ids = [r.requisito_id for r in payload.respuestas]
    existentes = db.query(RequisitoISO9001.id).filter(RequisitoISO9001.id.in_(req_ids)).all()
    ids_existentes = {r.id for r in existentes}
    faltantes = set(req_ids) - ids_existentes
    if faltantes:
        raise HTTPException(
            status_code=422,
            detail=f"Requisitos no encontrados: {sorted(faltantes)}"
        )

    resultados: List[RespuestaDiagnostico] = []

    for item in payload.respuestas:
        respuesta = (
            db.query(RespuestaDiagnostico)
            .filter_by(proyecto_id=payload.proyecto_id, requisito_id=item.requisito_id)
            .first()
        )
        if respuesta:
            respuesta.cumple = item.cumple
            respuesta.evidencia = item.evidencia
        else:
            respuesta = RespuestaDiagnostico(
                proyecto_id=payload.proyecto_id,
                requisito_id=item.requisito_id,
                cumple=item.cumple,
                evidencia=item.evidencia,
            )
            db.add(respuesta)
        resultados.append(respuesta)

    # Actualizar estado del proyecto
    proyecto.estado = EstadoProyecto.EN_DIAGNOSTICO
    db.commit()
    for r in resultados:
        db.refresh(r)

    return resultados


# ─────────────────────────────────────────────
# Métricas de diagnóstico (HU-03)
# ─────────────────────────────────────────────

@router.get("/{proyecto_id}/metricas", response_model=MetricasDiagnostico)
def calcular_metricas(proyecto_id: int, db: Session = Depends(get_db)):
    """
    HU-03: Calcula el porcentaje de cumplimiento por capítulo ISO (4-10)
    y el porcentaje global para el gráfico de Radar.
    """
    proyecto = db.query(ProyectoSGC).filter(ProyectoSGC.id == proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    # Consulta agrupada: total y afirmativas por capítulo
    # CASE WHEN cumple=true THEN 1 ELSE 0 END es portable entre PostgreSQL y SQLite
    from sqlalchemy import case, Integer
    cumple_int = case((RespuestaDiagnostico.cumple == True, 1), else_=0)  # noqa: E712

    resultados_raw = (
        db.query(
            RequisitoISO9001.capitulo,
            func.count(RespuestaDiagnostico.id).label("total"),
            func.sum(cumple_int).label("afirmativas"),
        )
        .join(RespuestaDiagnostico, RequisitoISO9001.id == RespuestaDiagnostico.requisito_id)
        .filter(RespuestaDiagnostico.proyecto_id == proyecto_id)
        .group_by(RequisitoISO9001.capitulo)
        .order_by(RequisitoISO9001.capitulo)
        .all()
    )

    # Si no hay respuestas aún, calculamos con todos los requisitos disponibles
    if not resultados_raw:
        # Devolvemos métricas vacías (0%) por cada capítulo con requisitos semilla
        total_requisitos_por_cap = (
            db.query(RequisitoISO9001.capitulo, func.count(RequisitoISO9001.id).label("total"))
            .group_by(RequisitoISO9001.capitulo)
            .order_by(RequisitoISO9001.capitulo)
            .all()
        )
        capitulos_metricas = [
            MetricaCapitulo(
                capitulo=row.capitulo,
                nombre_capitulo=NOMBRES_CAPITULOS.get(row.capitulo, f"Capítulo {row.capitulo}"),
                total_preguntas=row.total,
                respuestas_afirmativas=0,
                porcentaje_cumplimiento=0.0,
            )
            for row in total_requisitos_por_cap
        ]
        total_preguntas = sum(c.total_preguntas for c in capitulos_metricas)
        return MetricasDiagnostico(
            proyecto_id=proyecto_id,
            nombre_empresa=proyecto.nombre_empresa,
            total_preguntas=total_preguntas,
            total_afirmativas=0,
            porcentaje_global=0.0,
            capitulos=capitulos_metricas,
        )

    capitulos_metricas: List[MetricaCapitulo] = []
    total_global_preguntas = 0
    total_global_afirmativas = 0

    for row in resultados_raw:
        total_cap = row.total or 0
        afirmativas_cap = int(row.afirmativas or 0)
        porcentaje = round((afirmativas_cap / total_cap * 100), 2) if total_cap > 0 else 0.0

        capitulos_metricas.append(
            MetricaCapitulo(
                capitulo=row.capitulo,
                nombre_capitulo=NOMBRES_CAPITULOS.get(row.capitulo, f"Capítulo {row.capitulo}"),
                total_preguntas=total_cap,
                respuestas_afirmativas=afirmativas_cap,
                porcentaje_cumplimiento=porcentaje,
            )
        )
        total_global_preguntas += total_cap
        total_global_afirmativas += afirmativas_cap

    porcentaje_global = round(
        (total_global_afirmativas / total_global_preguntas * 100), 2
    ) if total_global_preguntas > 0 else 0.0

    return MetricasDiagnostico(
        proyecto_id=proyecto_id,
        nombre_empresa=proyecto.nombre_empresa,
        total_preguntas=total_global_preguntas,
        total_afirmativas=total_global_afirmativas,
        porcentaje_global=porcentaje_global,
        capitulos=capitulos_metricas,
    )


@router.get("/{proyecto_id}/respuestas", response_model=List[RespuestaOut])
def obtener_respuestas_proyecto(proyecto_id: int, db: Session = Depends(get_db)):
    """Recupera respuestas previas para pre-cargar el formulario."""
    return (
        db.query(RespuestaDiagnostico)
        .filter(RespuestaDiagnostico.proyecto_id == proyecto_id)
        .all()
    )
