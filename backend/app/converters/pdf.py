import io
import re
from pathlib import Path
from typing import Dict, List, Optional, Set
from pypdf import PdfReader, PdfWriter
from pypdf.generic import (
    ArrayObject,
    DecodedStreamObject,
    DictionaryObject,
    NameObject,
    NumberObject,
)
from app.converters.base import BaseConverter
from app.schemas.conversion import ConversionOptions

class PDFConverter(BaseConverter):
    SUPPORTED_INPUTS: Set[str] = {"pdf", "txt"}
    SUPPORTED_OUTPUTS: Set[str] = {"pdf", "txt"}

    def can_convert(self, source_ext: str, target_ext: str) -> bool:
        s = source_ext.lower().lstrip(".")
        t = target_ext.lower().lstrip(".")
        valid_pairs = {
            ("pdf", "txt"),
            ("txt", "pdf"),
            ("pdf", "pdf"),  # for rotate, split, merge, page range
        }
        return (s, t) in valid_pairs

    def get_pdf_metadata(self, pdf_path: Path) -> Dict[str, any]:
        """Extracts page count and metadata from a PDF file."""
        reader = PdfReader(str(pdf_path))
        info = reader.metadata
        return {
            "page_count": len(reader.pages),
            "title": str(info.title) if (info and info.title) else None,
            "author": str(info.author) if (info and info.author) else None,
            "creator": str(info.creator) if (info and info.creator) else None,
        }

    def convert_txt_to_pdf(self, input_path: Path, output_path: Path) -> Path:
        """Converts plain text file to searchable vector PDF with auto-pagination."""
        with open(input_path, "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()

        writer = PdfWriter()
        page_width = 612   # Standard Letter
        page_height = 792
        margin_left = 54
        margin_top = 54
        line_height = 14
        lines_per_page = int((page_height - margin_top * 2) / line_height)

        # Split long lines so they wrap cleanly
        wrapped_lines: List[str] = []
        max_chars_per_line = 80
        for line in lines:
            line_str = line.rstrip("\r\n")
            if not line_str:
                wrapped_lines.append("")
                continue
            while len(line_str) > max_chars_per_line:
                split_idx = line_str.rfind(" ", 0, max_chars_per_line)
                if split_idx == -1:
                    split_idx = max_chars_per_line
                wrapped_lines.append(line_str[:split_idx])
                line_str = line_str[split_idx:].lstrip()
            wrapped_lines.append(line_str)

        # Chunk into pages
        if not wrapped_lines:
            wrapped_lines = [""]

        page_chunks = [
            wrapped_lines[i : i + lines_per_page]
            for i in range(0, len(wrapped_lines), lines_per_page)
        ]

        for chunk in page_chunks:
            page = writer.add_blank_page(width=page_width, height=page_height)
            stream_commands = ["BT", "/F1 10 Tf", f"{line_height} TL"]
            start_y = page_height - margin_top
            stream_commands.append(f"{margin_left} {start_y} Td")

            is_first = True
            for l in chunk:
                # Escape parentheses and backslashes for PDF string literal
                escaped = l.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
                # Filter out characters outside ascii printable for standard Type1 Helvetica
                safe_ascii = "".join(c if 32 <= ord(c) < 127 else "?" for c in escaped)
                if is_first:
                    stream_commands.append(f"({safe_ascii}) Tj")
                    is_first = False
                else:
                    stream_commands.append(f"T* ({safe_ascii}) Tj")

            stream_commands.append("ET")
            stream_content = "\n".join(stream_commands).encode("latin-1", errors="replace")

            # Add Font dictionary to page resources
            font_dict = DictionaryObject({
                NameObject("/Type"): NameObject("/Font"),
                NameObject("/Subtype"): NameObject("/Type1"),
                NameObject("/BaseFont"): NameObject("/Helvetica"),
            })
            if "/Resources" not in page:
                page[NameObject("/Resources")] = DictionaryObject()
            if "/Font" not in page["/Resources"]:
                page["/Resources"][NameObject("/Font")] = DictionaryObject()
            page["/Resources"]["/Font"][NameObject("/F1")] = font_dict

            # Create stream object
            content_stream = DecodedStreamObject()
            content_stream.set_data(stream_content)
            page[NameObject("/Contents")] = content_stream

        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "wb") as f_out:
            writer.write(f_out)

        return output_path

    def convert_pdf_to_txt(self, input_path: Path, output_path: Path) -> Path:
        """Extracts text content from PDF file."""
        reader = PdfReader(str(input_path))
        extracted_pages: List[str] = []
        for idx, page in enumerate(reader.pages, start=1):
            text = page.extract_text() or ""
            extracted_pages.append(f"--- Page {idx} ---\n{text.strip()}")

        full_text = "\n\n".join(extracted_pages).strip()
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(full_text)
        return output_path

    def parse_page_range(self, range_str: str, total_pages: int) -> List[int]:
        """Parses page ranges like '1-3, 5, 7-9' (1-indexed) into list of 0-indexed page indices."""
        pages = set()
        cleaned = range_str.strip().lower()
        if cleaned in ("all", "*", ""):
            return list(range(total_pages))

        parts = cleaned.split(",")
        for part in parts:
            part = part.strip()
            if not part:
                continue
            if "-" in part:
                tokens = part.split("-")
                start_p = int(tokens[0])
                end_p = int(tokens[1])
                for p in range(max(1, start_p), min(total_pages, end_p) + 1):
                    pages.add(p - 1)
            else:
                p = int(part)
                if 1 <= p <= total_pages:
                    pages.add(p - 1)
        return sorted(list(pages))

    def rotate_or_extract_pdf(
        self,
        input_path: Path,
        output_path: Path,
        options: Optional[ConversionOptions] = None,
    ) -> Path:
        """Handles PDF rotation and page range filtering."""
        reader = PdfReader(str(input_path))
        total_pages = len(reader.pages)
        writer = PdfWriter()

        selected_indices = list(range(total_pages))
        if options and options.page_range:
            selected_indices = self.parse_page_range(options.page_range, total_pages)

        rotation_angle = options.rotate_degrees if (options and options.rotate_degrees) else 0

        for idx in selected_indices:
            page = reader.pages[idx]
            if rotation_angle:
                page.rotate(rotation_angle)
            writer.add_page(page)

        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "wb") as f_out:
            writer.write(f_out)
        return output_path

    def merge_pdfs(self, pdf_paths: List[Path], output_path: Path) -> Path:
        """Merges multiple PDF files into one in order."""
        writer = PdfWriter()
        for p in pdf_paths:
            reader = PdfReader(str(p))
            for page in reader.pages:
                writer.add_page(page)

        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "wb") as f_out:
            writer.write(f_out)
        return output_path

    def convert(
        self,
        input_path: Path,
        output_path: Path,
        options: Optional[ConversionOptions] = None,
    ) -> Path:
        s = input_path.suffix.lower().lstrip(".")
        t = output_path.suffix.lower().lstrip(".")

        if s == "txt" and t == "pdf":
            self.convert_txt_to_pdf(input_path, output_path)
        elif s == "pdf" and t == "txt":
            self.convert_pdf_to_txt(input_path, output_path)
        elif s == "pdf" and t == "pdf":
            self.rotate_or_extract_pdf(input_path, output_path, options)
        else:
            raise ValueError(f"Unsupported PDF conversion route: {s} -> {t}")

        if not output_path.exists() or output_path.stat().st_size == 0:
            raise RuntimeError(f"PDF conversion failed: output {output_path.name} is missing or empty.")

        return output_path
