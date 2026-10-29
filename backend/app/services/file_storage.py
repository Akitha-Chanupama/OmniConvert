import uuid
from pathlib import Path
from typing import Optional
from app.config import config
from app.services.file_validation import FileValidator

class FileStorageManager:
    def __init__(self, base_temp_dir: Optional[Path] = None):
        self.base_dir = base_temp_dir or config.TEMP_DIR
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def create_conversion_workspace(self, conversion_id: Optional[str] = None) -> tuple[str, Path, Path]:
        """
        Creates isolated input and output scratch directories for a conversion.
        Returns (conversion_id, input_dir, output_dir).
        """
        cid = conversion_id or str(uuid.uuid4())
        workspace = self.base_dir / cid
        input_dir = workspace / "input"
        output_dir = workspace / "output"

        input_dir.mkdir(parents=True, exist_ok=True)
        output_dir.mkdir(parents=True, exist_ok=True)

        return cid, input_dir, output_dir

    def get_output_file(self, conversion_id: str, filename: Optional[str] = None) -> Optional[Path]:
        """
        Retrieves an output file for download safely without path traversal.
        """
        # Validate conversion_id format (alphanumeric with hyphens)
        if not conversion_id or not all(c.isalnum() or c == "-" for c in conversion_id):
            return None

        output_dir = self.base_dir / conversion_id / "output"
        if not output_dir.exists():
            return None

        if filename:
            safe_name = FileValidator.sanitize_filename(filename)
            candidate = output_dir / safe_name
            if candidate.exists() and candidate.is_file():
                return candidate
            return None

        # Return single file or zip in output dir
        files = [f for f in output_dir.iterdir() if f.is_file()]
        if len(files) == 1:
            return files[0]
        # Look for zip
        zips = [f for f in files if f.suffix.lower() == ".zip"]
        if zips:
            return zips[0]
        if files:
            return files[0]

        return None

storage_manager = FileStorageManager()
