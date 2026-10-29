from abc import ABC, abstractmethod
from pathlib import Path
from typing import List, Optional
from app.schemas.conversion import ConversionOptions

class BaseConverter(ABC):
    @abstractmethod
    def can_convert(self, source_ext: str, target_ext: str) -> bool:
        """Check if this converter can handle the requested conversion."""
        pass

    @abstractmethod
    def convert(
        self,
        input_path: Path,
        output_path: Path,
        options: Optional[ConversionOptions] = None,
    ) -> Path:
        """
        Perform conversion from input_path to output_path.
        Must not overwrite original file.
        Must validate that output exists and has nonzero size.
        """
        pass
