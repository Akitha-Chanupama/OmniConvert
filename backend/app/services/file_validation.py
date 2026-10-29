import os
import re
from pathlib import Path
from typing import Optional, Tuple
from app.config import config

MAGIC_NUMBERS = {
    "png": [b"\x89PNG\r\n\x1a\n"],
    "jpg": [b"\xff\xd8\xff"],
    "jpeg": [b"\xff\xd8\xff"],
    "gif": [b"GIF87a", b"GIF89a"],
    "webp": [b"RIFF"],
    "bmp": [b"BM"],
    "pdf": [b"%PDF"],
    "docx": [b"PK\x03\x04"],
    "xlsx": [b"PK\x03\x04"],
}

class FileValidator:
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """Removes directory paths, null bytes, and unsafe characters."""
        # Strip path traversal elements
        base = os.path.basename(filename)
        # Remove null bytes
        base = base.replace("\x00", "")
        # Remove any leading dots or slashes
        base = base.lstrip("./\\")
        # Keep letters, numbers, hyphens, underscores, dots
        cleaned = re.sub(r"[^\w\s\.-]", "_", base).strip()
        return cleaned or "unnamed_file"

    @staticmethod
    def validate_size(size_in_bytes: int) -> None:
        """Verifies that uploaded file size does not exceed configured maximum."""
        if size_in_bytes > config.max_upload_size_bytes:
            raise ValueError(
                f"File size ({size_in_bytes / (1024 * 1024):.1f} MB) exceeds maximum allowed "
                f"limit of {config.MAX_UPLOAD_SIZE_MB} MB."
            )
        if size_in_bytes == 0:
            raise ValueError("Uploaded file is empty (0 bytes).")

    @staticmethod
    def detect_format_by_content(header_bytes: bytes, fallback_ext: str) -> str:
        """Inspects magic header bytes to verify or detect actual file type."""
        ext = fallback_ext.lower().lstrip(".")
        if ext == "jpeg":
            ext = "jpg"

        # Check known signatures
        for fmt, signatures in MAGIC_NUMBERS.items():
            for sig in signatures:
                if header_bytes.startswith(sig):
                    if fmt == "webp" and b"WEBP" in header_bytes[:16]:
                        return "webp"
                    if fmt in ("jpg", "jpeg"):
                        return "jpg"
                    return fmt

        # If it's plain text / json / yaml / xml / csv / markdown, verify utf-8 decode
        try:
            sample = header_bytes[:512].decode("utf-8")
            if ext in ("json", "yaml", "yml", "xml", "csv", "md", "txt", "html"):
                return ext
            return "txt"
        except UnicodeDecodeError:
            pass

        return ext
