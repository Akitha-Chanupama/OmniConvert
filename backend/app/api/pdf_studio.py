from fastapi import APIRouter, File, HTTPException, UploadFile, status
from app.schemas.pdf_studio import (
    PdfCompileRequest,
    PdfCompileResponse,
    PdfInspectResponse,
)
from app.services.pdf_studio_service import pdf_studio_service

router = APIRouter(prefix="/pdf-studio", tags=["PDF Studio"])

@router.post("/inspect", response_model=PdfInspectResponse)
async def inspect_pdf(file: UploadFile = File(...)):
    """
    Accepts a PDF upload, extracts all page metadata, and returns
    lightweight, high-resolution thumbnail images for each page.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported for PDF Studio inspection.",
        )

    try:
        content = await file.read()
        if not content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty.",
            )

        return pdf_studio_service.inspect_pdf(content, file.filename)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to inspect PDF: {str(e)}",
        )

@router.post("/compile", response_model=PdfCompileResponse)
async def compile_pdf(request: PdfCompileRequest):
    """
    Applies page reordering, rotations, exclusions, and exports
    the final document as an organized PDF or extracted Images ZIP.
    """
    try:
        return pdf_studio_service.compile_pdf(request)
    except FileNotFoundError as fnf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(fnf),
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compile PDF: {str(e)}",
        )
