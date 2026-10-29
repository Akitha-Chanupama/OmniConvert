from typing import Dict, List, Optional
from app.config import config
from app.converters.base import BaseConverter
from app.converters.documents import DocumentConverter
from app.converters.images import ImageConverter, HAS_HEIF
from app.converters.pdf import PDFConverter, HAS_PDFIUM
from app.converters.spreadsheets import SpreadsheetConverter
from app.converters.text import TextDataConverter
from app.schemas.conversion import FormatCapability, FormatsResponse

class ConversionRegistry:
    def __init__(self):
        self.image_converter = ImageConverter()
        self.text_converter = TextDataConverter()
        self.spreadsheet_converter = SpreadsheetConverter()
        self.pdf_converter = PDFConverter()
        self.document_converter = DocumentConverter()

    def get_capabilities(self) -> List[FormatCapability]:
        has_libreoffice = config.libreoffice_path is not None
        has_pandoc = config.pandoc_path is not None

        capabilities: List[FormatCapability] = [
            # Images
            FormatCapability(
                source_format="jpg",
                category="image",
                supported_targets=["png", "webp", "bmp", "tiff", "gif", "pdf", "ico"],
                is_enabled=True,
                description="JPEG Image with quality and resize options",
            ),
            FormatCapability(
                source_format="jpeg",
                category="image",
                supported_targets=["png", "webp", "bmp", "tiff", "gif", "pdf", "ico"],
                is_enabled=True,
                description="JPEG Image with quality and resize options",
            ),
            FormatCapability(
                source_format="png",
                category="image",
                supported_targets=["jpg", "webp", "bmp", "tiff", "gif", "pdf", "ico"],
                is_enabled=True,
                description="PNG Image with transparency preservation",
            ),
            FormatCapability(
                source_format="webp",
                category="image",
                supported_targets=["png", "jpg", "bmp", "tiff", "pdf"],
                is_enabled=True,
                description="WebP Image with quality compression",
            ),
            FormatCapability(
                source_format="bmp",
                category="image",
                supported_targets=["png", "jpg", "webp", "tiff", "pdf"],
                is_enabled=True,
                description="Bitmap Image",
            ),
            FormatCapability(
                source_format="tiff",
                category="image",
                supported_targets=["png", "jpg", "webp", "bmp", "pdf"],
                is_enabled=True,
                description="Tagged Image File",
            ),
            FormatCapability(
                source_format="gif",
                category="image",
                supported_targets=["png", "jpg", "webp"],
                is_enabled=True,
                limitations="Still-frame extraction for static targets",
                description="Graphics Interchange Format",
            ),
            FormatCapability(
                source_format="ico",
                category="image",
                supported_targets=["png", "jpg", "webp"],
                is_enabled=True,
                description="Windows Icon file",
            ),
            FormatCapability(
                source_format="heic",
                category="image",
                supported_targets=["jpg", "png", "webp", "pdf"],
                is_enabled=HAS_HEIF,
                description="Apple HEIC Photo to JPEG/PNG",
            ),
            FormatCapability(
                source_format="heif",
                category="image",
                supported_targets=["jpg", "png", "webp", "pdf"],
                is_enabled=HAS_HEIF,
                description="High Efficiency Image Format",
            ),
            # Text & Structured Data
            FormatCapability(
                source_format="txt",
                category="text",
                supported_targets=["md", "html", "pdf"],
                is_enabled=True,
                description="Plain Text file",
            ),
            FormatCapability(
                source_format="md",
                category="text",
                supported_targets=["html", "txt"],
                is_enabled=True,
                description="Markdown Document",
            ),
            FormatCapability(
                source_format="html",
                category="text",
                supported_targets=["txt"],
                is_enabled=True,
                description="HTML Document to plain text",
            ),
            FormatCapability(
                source_format="json",
                category="data",
                supported_targets=["yaml", "csv", "json"],
                is_enabled=True,
                description="JSON Structured Data (formatting, YAML, flat CSV)",
            ),
            FormatCapability(
                source_format="yaml",
                category="data",
                supported_targets=["json"],
                is_enabled=True,
                description="YAML Data to JSON",
            ),
            FormatCapability(
                source_format="yml",
                category="data",
                supported_targets=["json"],
                is_enabled=True,
                description="YAML Data to JSON",
            ),
            FormatCapability(
                source_format="xml",
                category="data",
                supported_targets=["xml"],
                is_enabled=True,
                description="XML Formatting & Validation (safe entity parser)",
            ),
            FormatCapability(
                source_format="csv",
                category="spreadsheet",
                supported_targets=["json", "xlsx"],
                is_enabled=True,
                description="Comma-Separated Values",
            ),
            FormatCapability(
                source_format="xlsx",
                category="spreadsheet",
                supported_targets=["csv", "json"] + (["pdf"] if has_libreoffice else []),
                is_enabled=True,
                limitations=None if has_libreoffice else "PDF target requires LibreOffice",
                description="Excel Spreadsheet",
            ),
            # PDF Operations
            FormatCapability(
                source_format="pdf",
                category="pdf",
                supported_targets=["txt", "pdf", "md"] + (["jpg", "png", "webp"] if HAS_PDFIUM else []),
                is_enabled=True,
                description="PDF Document (text extraction, markdown conversion, page rendering, split, rotate, merge)",
            ),
            # Office Documents
            FormatCapability(
                source_format="docx",
                category="document",
                supported_targets=["txt"] + (["pdf", "html"] if has_libreoffice else []),
                is_enabled=True,
                limitations=None if has_libreoffice else "PDF and HTML output requires LibreOffice installation",
                requires_tool="LibreOffice" if not has_libreoffice else None,
                description="Word Document",
            ),
            FormatCapability(
                source_format="odt",
                category="document",
                supported_targets=["pdf", "txt"] if has_libreoffice else [],
                is_enabled=has_libreoffice,
                limitations=None if has_libreoffice else "ODT conversion requires LibreOffice",
                requires_tool="LibreOffice",
                description="OpenDocument Text",
            ),
            FormatCapability(
                source_format="rtf",
                category="document",
                supported_targets=["pdf", "txt"] if has_libreoffice else [],
                is_enabled=has_libreoffice,
                limitations=None if has_libreoffice else "RTF conversion requires LibreOffice",
                requires_tool="LibreOffice",
                description="Rich Text Format",
            ),
        ]
        return capabilities

    def get_formats_response(self) -> FormatsResponse:
        caps = self.get_capabilities()
        formats_map: Dict[str, List[str]] = {}
        for cap in caps:
            if cap.is_enabled and cap.supported_targets:
                formats_map[cap.source_format] = cap.supported_targets

        return FormatsResponse(formats=formats_map, capabilities=caps)

    def find_converter(self, source_ext: str, target_ext: str) -> Optional[BaseConverter]:
        """Dispatches to the appropriate converter engine."""
        converters: List[BaseConverter] = [
            self.image_converter,
            self.text_converter,
            self.spreadsheet_converter,
            self.pdf_converter,
            self.document_converter,
        ]
        for c in converters:
            if c.can_convert(source_ext, target_ext):
                return c
        return None

conversion_registry = ConversionRegistry()
