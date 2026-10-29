import json
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from app.schemas.conversion import BatchConversionResponse, ConversionOptions
from app.services.conversion_service import conversion_service
from app.services.file_storage import storage_manager

router = APIRouter(prefix="/convert", tags=["Conversions"])

@router.post("", response_model=BatchConversionResponse)
async def convert_files(
    files: List[UploadFile] = File(...),
    target_format: str = Form(...),
    options: Optional[str] = Form(None),
    merge_pdf: Optional[bool] = Form(False),
):
    """
    Accepts one or more files and converts them locally to target_format.
    Supports options such as quality, dimensions, rotation, and PDF merging.
    """
    parsed_options = None
    if options:
        try:
            opt_dict = json.loads(options)
            parsed_options = ConversionOptions(**opt_dict)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid conversion options payload: {str(e)}",
            )

    try:
        response = await conversion_service.process_conversion(
            files=files,
            target_format=target_format,
            options=parsed_options,
            merge_pdf=bool(merge_pdf),
        )
        return response
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Conversion error: {str(e)}",
        )

@router.get("/{conversion_id}/download")
async def download_converted_file(conversion_id: str, filename: Optional[str] = None):
    """
    Downloads converted file or batch ZIP archive by conversion_id.
    Prevents path traversal and validates file existence.
    """
    target_file = storage_manager.get_output_file(conversion_id, filename)
    if not target_file or not target_file.exists() or not target_file.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requested file not found or download session has expired.",
        )

    # Determine media type based on extension
    ext = target_file.suffix.lower()
    media_types = {
        ".pdf": "application/pdf",
        ".zip": "application/zip",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".gif": "image/gif",
        ".bmp": "image/bmp",
        ".txt": "text/plain; charset=utf-8",
        ".md": "text/markdown; charset=utf-8",
        ".html": "text/html; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".yaml": "text/yaml; charset=utf-8",
        ".csv": "text/csv; charset=utf-8",
        ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
    media_type = media_types.get(ext, "application/octet-stream")

    return FileResponse(
        path=target_file,
        media_type=media_type,
        filename=target_file.name,
    )
