import zipfile
from pathlib import Path
from typing import List

class ArchiveService:
    @staticmethod
    def create_zip(files_to_pack: List[Path], zip_destination: Path) -> Path:
        """
        Packs multiple output files into a single safe ZIP archive.
        Ensures file names are sanitized and no path traversal occurs.
        """
        zip_destination.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(zip_destination, "w", zipfile.ZIP_DEFLATED) as zipf:
            for file_path in files_to_pack:
                if file_path.exists() and file_path.is_file():
                    # Arcname is just the file's own name, no directory hierarchy
                    zipf.write(file_path, arcname=file_path.name)

        if not zip_destination.exists() or zip_destination.stat().st_size == 0:
            raise RuntimeError(f"Failed to create ZIP archive {zip_destination.name}")

        return zip_destination
