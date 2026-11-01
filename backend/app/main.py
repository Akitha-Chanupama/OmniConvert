import asyncio
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from app.api.conversions import router as conversions_router
from app.api.formats import router as formats_router
from app.api.health import router as health_router
from app.api.pdf_studio import router as pdf_studio_router
from app.config import config
from app.services.cleanup_service import cleanup_service

async def periodic_cleanup_worker():
    """Periodically purges expired conversion workspaces every CLEANUP_INTERVAL_MINUTES."""
    interval_seconds = max(config.CLEANUP_INTERVAL_MINUTES * 60, 60)
    while True:
        try:
            await asyncio.sleep(interval_seconds)
            purged = cleanup_service.purge_expired_workspaces()
            if purged > 0:
                print(f"[CleanupService] Automatically purged {purged} expired workspace(s).")
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"[CleanupService Error] {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure temp directory exists and purge any previous stale files
    config.TEMP_DIR.mkdir(parents=True, exist_ok=True)
    cleanup_service.purge_expired_workspaces()

    # Launch periodic background cleanup worker
    cleanup_task = asyncio.create_task(periodic_cleanup_worker())

    yield

    # Shutdown: cancel periodic task and run final purge
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass
    cleanup_service.purge_expired_workspaces()

app = FastAPI(
    title="OmniConvert API",
    description="Privacy-focused, local-first file conversion API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration - supports local development and hosted deployments
cors_origins = config.cors_origins
if "*" in cors_origins or os.getenv("ALLOW_ALL_ORIGINS", "").lower() in ("true", "1"):
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r".*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
    )

# Include API Routers under /api/v1
app.include_router(health_router, prefix="/api/v1")
app.include_router(formats_router, prefix="/api/v1")
app.include_router(conversions_router, prefix="/api/v1")
app.include_router(pdf_studio_router, prefix="/api/v1")

# Locate compiled frontend distribution if available (Single-Container & Hosted Deployment)
possible_dist_dirs = [
    Path(__file__).resolve().parent.parent / "frontend_dist",
    Path(__file__).resolve().parent.parent.parent / "frontend" / "dist",
]
FRONTEND_DIST: Optional[Path] = next(
    (d for d in possible_dist_dirs if d.is_dir() and (d / "index.html").is_file()),
    None,
)

if FRONTEND_DIST:
    # Mount Vite compiled assets
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    # SPA Fallback: Serves index.html or static files directly
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Never intercept API or OpenAPI docs
        if full_path.startswith("api/") or full_path in ("docs", "redoc", "openapi.json"):
            raise HTTPException(status_code=404, detail="API route not found")

        # Specific static file request (e.g. favicon.ico, logo.png, site.webmanifest)
        if full_path:
            file_path = FRONTEND_DIST / full_path
            if file_path.is_file():
                return FileResponse(file_path)

        # Single Page Application root index.html
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    @app.get("/")
    async def root():
        return {
            "app": "OmniConvert API",
            "status": "online",
            "mode": config.MODE,
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
