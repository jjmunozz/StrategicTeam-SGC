from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from typing import List
import os

load_dotenv()

class Settings(BaseSettings):
    # Conexión
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    
    # Metadatos de la App
    APP_NAME: str = "StrategicTeam SGC"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Seguridad y CORS (La lista de invitados)
    # Aquí permitimos que tu React (puerto 5173) y el backend mismo hablen entre sí
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
    ]
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "clavedeprueba123")

    class Config:
        case_sensitive = True

settings = Settings()