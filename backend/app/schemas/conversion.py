from typing import Dict, List, Optional
from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
    mode: str = "local"
    installed_tools: Dict[str, bool]
    tool_paths: Dict[str, Optional[str]]

class FormatCapability(BaseModel):
    source_format: str
    category: str
    supported_targets: List[str]
    requires_tool: Optional[str] = None
    is_enabled: bool = True
    limitations: Optional[str] = None
    description: Optional[str] = None

class FormatsResponse(BaseModel):
    formats: Dict[str, List[str]]
    capabilities: List[FormatCapability]

class ConversionOptions(BaseModel):
    quality: Optional[int] = Field(None, ge=1, le=100, description="Quality for lossy formats (1-100)")
    width: Optional[int] = Field(None, ge=1, le=8000, description="Target width for images")
    height: Optional[int] = Field(None, ge=1, le=8000, description="Target height for images")
    preserve_aspect_ratio: Optional[bool] = True
    sheet_name: Optional[str] = Field(None, description="Specific sheet for spreadsheet conversions")
    page_range: Optional[str] = Field(None, description="Page range for PDF extraction (e.g., '1-3' or 'all')")
    rotate_degrees: Optional[int] = Field(None, description="Rotation angle for PDF or images (90, 180, 270)")
    indent: Optional[int] = Field(2, ge=0, le=8, description="Indentation for JSON, YAML, XML")

class ConvertedFileInfo(BaseModel):
    conversion_id: str
    original_filename: str
    converted_filename: str
    target_format: str
    file_size_bytes: int
    download_url: str

class BatchConversionResponse(BaseModel):
    success: bool
    message: str
    conversion_id: str
    is_zip: bool
    download_url: str
    items: List[ConvertedFileInfo]
