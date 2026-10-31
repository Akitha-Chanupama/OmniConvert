from typing import List, Optional
from pydantic import BaseModel, Field

class PdfPageThumbnail(BaseModel):
    page_index: int = Field(..., description="0-based original index of the page")
    page_number: int = Field(..., description="1-based user facing page number")
    width: int
    height: int
    rotation: int = 0
    thumbnail_url: str = Field(..., description="Data URL or relative URL of the rendered thumbnail")

class PdfInspectResponse(BaseModel):
    session_id: str
    filename: str
    file_size_bytes: int
    page_count: int
    pages: List[PdfPageThumbnail]

class PdfPageOperation(BaseModel):
    page_index: int = Field(..., description="0-based original page index")
    rotation: int = Field(0, description="Additional rotation degrees (0, 90, 180, 270)")

class PdfCompileRequest(BaseModel):
    session_id: str
    filename: str
    pages: List[PdfPageOperation]
    export_type: str = Field("pdf", description="'pdf' or 'images_zip'")

class PdfCompileResponse(BaseModel):
    success: bool
    message: str
    download_url: str
    filename: str
    file_size_bytes: int
    page_count: int

