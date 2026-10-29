from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.conversions import router as conversions_router
from app.api.formats import router as formats_router
from app.api.health import router as health_router
from app.config import config
from app.services.cleanup_service import cleanup_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure temp directory exists and purge any previous stale files
    config.TEMP_DIR.mkdir(parents=True, exist_ok=True)
    cleanup_service.purge_expired_workspaces()
    yield
    # Shutdown: run final cleanup
    cleanup_service.purge_expired_workspaces()

app = FastAPI(
    title="OmniConvert API",
    description="Privacy-focused, local-first file conversion API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration - restricted to local development origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Include API Routers under /api/v1
app.include_router(health_router, prefix="/api/v1")
app.include_router(formats_router, prefix="/api/v1")
app.include_router(conversions_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "app": "OmniConvert API",
        "status": "online",
        "mode": "local",
        "docs_url": "/docs",
        "endpoints": {
            "health": "/api/v1/health",
            "formats": "/api/v1/formats",
            "convert": "/api/v1/convert",
        },
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
    )
