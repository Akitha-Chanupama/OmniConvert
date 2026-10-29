from fastapi import APIRouter
from app.config import config
from app.schemas.conversion import HealthResponse

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("", response_model=HealthResponse)
async def check_health():
    """Returns application health and detected tool availability."""
    lo_path = config.libreoffice_path
    pandoc_path = config.pandoc_path
    ffmpeg_path = config.ffmpeg_path

    try:
        import pillow_heif
        has_heif = True
    except Exception:
        has_heif = False

    try:
        import pypdfium2
        has_pdfium = True
    except Exception:
        has_pdfium = False

    return HealthResponse(
        status="ok",
        version="1.0.0",
        mode="local",
        installed_tools={
            "pillow": True,
            "pillow_heif": has_heif,
            "pypdf": True,
            "pypdfium2": has_pdfium,
            "openpyxl": True,
            "pyyaml": True,
            "defusedxml": True,
            "libreoffice": lo_path is not None,
            "pandoc": pandoc_path is not None,
            "ffmpeg": ffmpeg_path is not None,
        },
        tool_paths={
            "libreoffice": lo_path,
            "pandoc": pandoc_path,
            "ffmpeg": ffmpeg_path,
        },
    )
