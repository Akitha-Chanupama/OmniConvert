import os
import shutil
from pathlib import Path
from typing import List
from pydantic import BaseModel, Field

class AppConfig(BaseModel):
    HOST: str = Field(default_factory=lambda: os.getenv("HOST", "0.0.0.0"))
    PORT: int = Field(default_factory=lambda: int(os.getenv("PORT", "8000")))
    MODE: str = Field(default_factory=lambda: os.getenv("APP_MODE", "hosted"))
    MAX_UPLOAD_SIZE_MB: int = Field(default_factory=lambda: int(os.getenv("MAX_UPLOAD_SIZE_MB", "50")))
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    TEMP_DIR: Path = Path(__file__).resolve().parent.parent / "temp"
    CLEANUP_INTERVAL_MINUTES: int = Field(default_factory=lambda: int(os.getenv("CLEANUP_INTERVAL_MINUTES", "15")))
    CLEANUP_MAX_AGE_MINUTES: int = Field(default_factory=lambda: int(os.getenv("CLEANUP_MAX_AGE_MINUTES", "30")))

    @property
    def cors_origins(self) -> List[str]:
        env_origins = os.getenv("CORS_ORIGINS")
        if env_origins:
            if env_origins.strip() == "*":
                return ["*"]
            return [o.strip() for o in env_origins.split(",") if o.strip()]
        return self.CORS_ORIGINS

    @property
    def max_upload_size_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    def find_executable(self, name: str, fallback_paths: List[str] = None) -> str | None:
        """Finds executable in system PATH or common system installation directories."""
        found = shutil.which(name)
        if found:
            return found
        if fallback_paths:
            for p in fallback_paths:
                expanded = os.path.expandvars(p)
                if os.path.isfile(expanded) and os.access(expanded, os.X_OK):
                    return expanded
        return None

    @property
    def libreoffice_path(self) -> str | None:
        return self.find_executable(
            "soffice",
            [
                r"C:\Program Files\LibreOffice\program\soffice.exe",
                r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
                "/usr/bin/soffice",
                "/usr/bin/libreoffice",
                "/Applications/LibreOffice.app/Contents/MacOS/soffice",
            ],
        )

    @property
    def pandoc_path(self) -> str | None:
        return self.find_executable(
            "pandoc",
            [
                r"C:\Program Files\Pandoc\pandoc.exe",
                r"%LOCALAPPDATA%\Pandoc\pandoc.exe",
                "/usr/bin/pandoc",
                "/usr/local/bin/pandoc",
            ],
        )

    @property
    def ffmpeg_path(self) -> str | None:
        return self.find_executable("ffmpeg")

config = AppConfig()
config.TEMP_DIR.mkdir(parents=True, exist_ok=True)
