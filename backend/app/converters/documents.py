import shutil
import subprocess
import zipfile
from pathlib import Path
from typing import List, Optional, Set
import defusedxml.minidom
from app.config import config
from app.converters.base import BaseConverter
from app.schemas.conversion import ConversionOptions

class DocumentConverter(BaseConverter):
    SUPPORTED_INPUTS: Set[str] = {"docx", "odt", "rtf", "xlsx"}
    SUPPORTED_OUTPUTS: Set[str] = {"pdf", "txt", "html"}

    def can_convert(self, source_ext: str, target_ext: str) -> bool:
        s = source_ext.lower().lstrip(".")
        t = target_ext.lower().lstrip(".")

        # Native DOCX -> TXT is always supported via XML parsing
        if s == "docx" and t == "txt":
            return True

        # External LibreOffice routes
        libreoffice_available = config.libreoffice_path is not None
        if libreoffice_available:
            if s in ("docx", "odt", "rtf", "xlsx") and t == "pdf":
                return True
            if s in ("docx", "odt", "rtf") and t in ("txt", "html"):
                return True

        return False

    def convert_docx_to_txt_native(self, input_path: Path, output_path: Path) -> Path:
        """Native extraction of text from DOCX package using defusedxml."""
        paragraphs: List[str] = []
        try:
            with zipfile.ZipFile(input_path, "r") as z:
                if "word/document.xml" not in z.namelist():
                    raise ValueError("Invalid DOCX format: word/document.xml not found.")
                xml_data = z.read("word/document.xml")
                dom = defusedxml.minidom.parseString(xml_data)

                # Paragraphs are w:p, text nodes are w:t
                for p in dom.getElementsByTagName("w:p"):
                    p_texts = []
                    for t in p.getElementsByTagName("w:t"):
                        for child in t.childNodes:
                            if child.nodeType == child.TEXT_NODE:
                                p_texts.append(child.data)
                    line = "".join(p_texts).strip()
                    if line:
                        paragraphs.append(line)
        except Exception as e:
            raise ValueError(f"Failed to read DOCX document: {e}")

        text_content = "\n\n".join(paragraphs)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(text_content)
        return output_path

    def convert_with_libreoffice(
        self,
        input_path: Path,
        output_path: Path,
        target_format: str,
    ) -> Path:
        """Converts office documents using headless LibreOffice via safe subprocess argument array."""
        soffice_bin = config.libreoffice_path
        if not soffice_bin:
            raise RuntimeError(
                "LibreOffice is not installed or not found in PATH. "
                "To enable office document conversions (DOCX/XLSX -> PDF), "
                "please install LibreOffice from https://www.libreoffice.org/"
            )

        temp_outdir = output_path.parent
        # Executable arguments array - never shell string interpolation
        cmd = [
            soffice_bin,
            "--headless",
            "--convert-to",
            target_format,
            "--outdir",
            str(temp_outdir),
            str(input_path),
        ]

        try:
            res = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=60,
                check=False,
            )
            if res.returncode != 0:
                raise RuntimeError(f"LibreOffice conversion error (code {res.returncode}): {res.stderr}")
        except subprocess.TimeoutExpired:
            raise RuntimeError("LibreOffice conversion timed out after 60 seconds.")

        # LibreOffice names the output file with the input base name and target format
        expected_lo_output = temp_outdir / f"{input_path.stem}.{target_format}"
        if expected_lo_output.exists():
            if expected_lo_output != output_path:
                shutil.move(str(expected_lo_output), str(output_path))
        elif not output_path.exists():
            raise RuntimeError(
                f"LibreOffice succeeded but expected output file {output_path.name} was not generated."
            )

        return output_path

    def convert(
        self,
        input_path: Path,
        output_path: Path,
        options: Optional[ConversionOptions] = None,
    ) -> Path:
        s = input_path.suffix.lower().lstrip(".")
        t = output_path.suffix.lower().lstrip(".")

        if s == "docx" and t == "txt":
            # Prefer fast native extraction without spawning soffice
            return self.convert_docx_to_txt_native(input_path, output_path)

        if t in ("pdf", "html", "txt"):
            return self.convert_with_libreoffice(input_path, output_path, t)

        raise ValueError(f"Unsupported office document conversion: {s} -> {t}")
