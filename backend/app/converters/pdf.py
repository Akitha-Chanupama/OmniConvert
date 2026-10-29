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

try:
    import pypdfium2 as pdfium
    HAS_PDFIUM = True
except Exception:
    HAS_PDFIUM = False

class PDFConverter(BaseConverter):
    SUPPORTED_INPUTS: Set[str] = {"pdf", "txt", "md"}
    SUPPORTED_OUTPUTS: Set[str] = {"pdf", "txt", "jpg", "jpeg", "png", "webp", "md"}

    def can_convert(self, source_ext: str, target_ext: str) -> bool:
        s = source_ext.lower().lstrip(".")
        t = target_ext.lower().lstrip(".")
        if t == "jpeg":
            t = "jpg"
        if s == "pdf" and t in {"jpg", "png", "webp"}:
            return HAS_PDFIUM
        valid_pairs = {
            ("pdf", "txt"),
            ("pdf", "md"),
            ("txt", "pdf"),
            ("md", "pdf"),
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

    def convert_md_to_pdf(
        self,
        input_path: Path,
        output_path: Path,
        options: Optional[ConversionOptions] = None,
    ) -> Path:
        """Converts Markdown file to a styled multi-page PDF document using PyMuPDF Story."""
        with open(input_path, "r", encoding="utf-8", errors="replace") as f:
            md_content = f.read()

        try:
            import markdown
            html_body = markdown.markdown(
                md_content,
                extensions=["tables", "fenced_code", "nl2br"]
            )
        except Exception:
            escaped = (
                md_content.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
            )
            paragraphs = escaped.split("\n\n")
            html_body = "\n".join(f"<p>{p.replace('\n', '<br>')}</p>" for p in paragraphs if p.strip())

        styled_html = f"""
        <style>
        body {{ font-family: Helvetica, Arial, sans-serif; font-size: 10pt; line-height: 1.6; color: #1e293b; }}
        h1 {{ font-size: 18pt; color: #0f172a; margin-bottom: 10pt; border-bottom: 1.5pt solid #cbd5e1; padding-bottom: 4pt; }}
        h2 {{ font-size: 13pt; color: #1e293b; margin-top: 12pt; margin-bottom: 6pt; }}
        h3 {{ font-size: 11pt; color: #334155; margin-top: 10pt; margin-bottom: 4pt; }}
        p {{ margin-bottom: 6pt; }}
        ul, ol {{ margin-top: 2pt; margin-bottom: 6pt; padding-left: 18pt; }}
        li {{ margin-bottom: 3pt; }}
        code {{ font-family: Courier, monospace; font-size: 9pt; background-color: #f1f5f9; padding: 1pt 3pt; }}
        pre {{ background-color: #0f172a; color: #f8fafc; padding: 8pt; font-family: Courier, monospace; font-size: 8.5pt; line-height: 1.4; margin-bottom: 8pt; }}
        table {{ border-collapse: collapse; width: 100%; margin-top: 6pt; margin-bottom: 8pt; font-size: 9pt; }}
        th {{ background-color: #f1f5f9; font-weight: bold; text-align: left; padding: 4pt 6pt; border: 1pt solid #cbd5e1; }}
        td {{ padding: 4pt 6pt; border: 1pt solid #e2e8f0; }}
        blockquote {{ border-left: 3pt solid #6366f1; padding-left: 8pt; color: #475569; font-style: italic; margin: 6pt 0; }}
        hr {{ border: none; border-top: 1pt solid #e2e8f0; margin: 10pt 0; }}
        </style>
        {html_body}
        """

        output_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            import pymupdf
            doc_writer = pymupdf.DocumentWriter(str(output_path))
            story = pymupdf.Story(html=styled_html)
            page_rect = pymupdf.Rect(0, 0, 612, 792)  # Standard Letter
            story_rect = pymupdf.Rect(54, 54, 558, 738)  # 0.75in margins
            more = 1
            page_count = 0
            while more and page_count < 200:
                dev = doc_writer.begin_page(page_rect)
                more, _ = story.place(story_rect)
                story.draw(dev)
                doc_writer.end_page()
                page_count += 1
            doc_writer.close()
        except Exception:
            self.convert_txt_to_pdf(input_path, output_path)

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

    def convert_pdf_to_md(
        self,
        input_path: Path,
        output_path: Path,
        options: Optional[ConversionOptions] = None,
    ) -> Path:
        """Extracts structured Markdown from PDF using pymupdf4llm, falling back to pypdf."""
        md_text = ""
        # 1. Attempt high-fidelity PyMuPDF4LLM extraction
        try:
            import pymupdf4llm
            md_text = pymupdf4llm.to_markdown(str(input_path))
        except Exception:
            md_text = ""

        # 2. Fallback to pypdf extraction if pymupdf4llm returned nothing or failed
        if not md_text or not md_text.strip():
            reader = PdfReader(str(input_path))
            total_pages = len(reader.pages)
            selected_indices = list(range(total_pages))
            if options and options.page_range:
                selected_indices = self.parse_page_range(options.page_range, total_pages)

            lines: List[str] = []
            for idx in selected_indices:
                page_text = reader.pages[idx].extract_text() or ""
                lines.append(f"## Page {idx + 1}\n\n{page_text.strip()}\n")
            md_text = "\n\n".join(lines).strip()

        if not md_text:
            md_text = f"# {input_path.stem}\n\n*(No text content could be extracted from this PDF)*\n"

        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(md_text)

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

    def split_pdf(
        self,
        input_path: Path,
        output_dir: Path,
        options: Optional[ConversionOptions] = None,
    ) -> List[Path]:
        """Splits every page of a PDF into individual PDF files."""
        reader = PdfReader(str(input_path))
        total_pages = len(reader.pages)
        selected_indices = list(range(total_pages))
        if options and options.page_range:
            selected_indices = self.parse_page_range(options.page_range, total_pages)

        out_paths: List[Path] = []
        base_stem = input_path.stem
        output_dir.mkdir(parents=True, exist_ok=True)

        for idx in selected_indices:
            writer = PdfWriter()
            page = reader.pages[idx]
            if options and options.rotate_degrees:
                page.rotate(options.rotate_degrees)
            writer.add_page(page)

            out_file = output_dir / f"{base_stem}_page_{idx + 1}.pdf"
            with open(out_file, "wb") as f_out:
                writer.write(f_out)
            out_paths.append(out_file)

        return out_paths

    def convert_pdf_to_images(
        self,
        input_path: Path,
        output_dir: Path,
        target_format: str = "jpg",
        options: Optional[ConversionOptions] = None,
    ) -> List[Path]:
        """Renders pages of a PDF to high-resolution PIL images."""
        if not HAS_PDFIUM:
            raise RuntimeError("pypdfium2 is required for rendering PDF pages to images.")

        pdf = pdfium.PdfDocument(str(input_path))
        total_pages = len(pdf)
        selected_indices = list(range(total_pages))
        if options and options.page_range:
            selected_indices = self.parse_page_range(options.page_range, total_pages)

        out_paths: List[Path] = []
        base_stem = input_path.stem
        output_dir.mkdir(parents=True, exist_ok=True)

        target_ext = target_format.lower().lstrip(".")
        if target_ext == "jpeg":
            target_ext = "jpg"

        for idx in selected_indices:
            page = pdf[idx]
            # Render at scale 2 (144 dpi) for crisp readable images
            pil_image = page.render(scale=2).to_pil()
            out_file = output_dir / f"{base_stem}_page_{idx + 1}.{target_ext}"
            if target_ext in ("jpg", "jpeg") and pil_image.mode in ("RGBA", "P"):
                pil_image = pil_image.convert("RGB")

            save_kwargs = {}
            if target_ext in ("jpg", "jpeg", "webp") and options and options.quality:
                save_kwargs["quality"] = options.quality

            pil_image.save(out_file, **save_kwargs)
            out_paths.append(out_file)

        return out_paths

    def convert(
        self,
        input_path: Path,
        output_path: Path,
        options: Optional[ConversionOptions] = None,
    ) -> Path:
        s = input_path.suffix.lower().lstrip(".")
        t = output_path.suffix.lower().lstrip(".")
        if t == "jpeg":
            t = "jpg"

        if s == "txt" and t == "pdf":
            self.convert_txt_to_pdf(input_path, output_path)
        elif s == "md" and t == "pdf":
            self.convert_md_to_pdf(input_path, output_path, options)
        elif s == "pdf" and t == "txt":
            self.convert_pdf_to_txt(input_path, output_path)
        elif s == "pdf" and t == "md":
            self.convert_pdf_to_md(input_path, output_path, options)
        elif s == "pdf" and t == "pdf":
            self.rotate_or_extract_pdf(input_path, output_path, options)
        elif s == "pdf" and t in {"jpg", "png", "webp"}:
            images = self.convert_pdf_to_images(input_path, output_path.parent, t, options)
            if images:
                if images[0] != output_path and images[0].exists():
                    images[0].replace(output_path)
            else:
                raise RuntimeError("No pages extracted from PDF.")
        else:
            raise ValueError(f"Unsupported PDF conversion route: {s} -> {t}")

        if not output_path.exists() or output_path.stat().st_size == 0:
            raise RuntimeError(f"PDF conversion failed: output {output_path.name} is missing or empty.")

        return output_path
