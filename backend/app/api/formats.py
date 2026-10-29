from fastapi import APIRouter
from app.schemas.conversion import FormatsResponse
from app.services.conversion_registry import conversion_registry

router = APIRouter(prefix="/formats", tags=["Formats"])

@router.get("", response_model=FormatsResponse)
async def get_formats():
    """Returns valid target formats and capabilities based on actual installed capabilities."""
    return conversion_registry.get_formats_response()
