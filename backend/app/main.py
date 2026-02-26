from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.models import RequisitoISO9001  # noqa: F401
from app.routers import diagnostico, proyectos
from app.seed_data import REQUISITOS_SEMILLA

def _seed_requisitos(db) -> None:
    """Inserta los requisitos ISO si la tabla está vacía."""
    if db.query(RequisitoISO9001).count() == 0:
        db.bulk_insert_mappings(RequisitoISO9001, REQUISITOS_SEMILLA)
        db.commit()
        print(f"✅ Insertados {len(REQUISITOS_SEMILLA)} requisitos ISO 9001:2015")
    else:
        print("ℹ️ Requisitos ISO ya existentes, omitiendo seed.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Crear tablas y semillas
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        _seed_requisitos(db)
    yield

# --- INICIO DE LA APP ---
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="API para el MVP de Gestión de Calidad ISO 9001:2015 - Ciclo PHVA",
    lifespan=lifespan,
)

# Configuración de CORS corregida
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Esto permite que tu frontend en Render se conecte sin problemas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(proyectos.router)
app.include_router(diagnostico.router)

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.VERSION}
