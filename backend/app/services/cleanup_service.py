import shutil
import time
from pathlib import Path
from typing import Optional
from app.config import config

class CleanupService:
    def __init__(self, temp_dir: Optional[Path] = None, max_age_minutes: Optional[int] = None):
        self.temp_dir = temp_dir or config.TEMP_DIR
        self.max_age_seconds = (max_age_minutes or config.CLEANUP_MAX_AGE_MINUTES) * 60

    def purge_expired_workspaces(self) -> int:
        """
        Deletes conversion scratch directories older than max_age_seconds.
        Returns the number of cleaned up workspaces.
        """
        if not self.temp_dir.exists():
            return 0

        now = time.time()
        purged_count = 0

        for item in self.temp_dir.iterdir():
            # Never delete .gitkeep
            if item.name == ".gitkeep":
                continue

            if item.is_dir():
                try:
                    mtime = item.stat().st_mtime
                    if (now - mtime) > self.max_age_seconds:
                        shutil.rmtree(item, ignore_errors=True)
                        purged_count += 1
                except Exception:
                    pass

        return purged_count

cleanup_service = CleanupService()
