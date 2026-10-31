import base64
import io
from pathlib import Path
from typing import List, Optional
from pypdf import PdfReader, PdfWriter
import pypdfium2 as pdfium
from app.converters.archives import ArchiveService
from app.schemas.pdf_studio import (
    PdfCompileRequest,
    PdfCompileResponse,
    PdfInspectResponse,
    PdfPageOperation,
    PdfPageThumbnail,
)
from app.services.file_storage import storage_manager
from app.services.file_validation import FileValidator

class PdfStudioService:
    def inspect_pdf(self, file_bytes: bytes, filename: str) -> PdfInspectResponse:
        """
        Ingests a PDF file into a workspace and generates crisp thumbnails for every page.
        """
        safe_name = FileValidator.sanitize_filename(filename)
        cid, input_dir, output_dir = storage_manager.create_conversion_workspace()
        input_path = input_dir / safe_name

        with open(input_path, "wb") as f:
            f.write(file_bytes)

        # Open with pypdfium2 for instant page rendering
        pdf = pdfium.PdfDocument(str(input_path))
        page_count = len(pdf)
        pages: List[PdfPageThumbnail] = []

        for idx in range(page_count):
            page = pdf[idx]
            width, height = page.get_size()

            # Render at scale 0.75 for fast, crisp thumbnail (approx 450x600 px)
            pil_img = page.render(scale=0.75).to_pil()
            if pil_img.mode in ("RGBA", "P"):
                pil_img = pil_img.convert("RGB")

            # Encode as WebP for optimal quality/compression
            buf = io.BytesIO()
            pil_img.save(buf, format="WEBP", quality=75)
            b64_str = base64.b64encode(buf.getvalue()).decode("ascii")
            thumb_data_url = f"data:image/webp;base64,{b64_str}"

            pages.append(
                PdfPageThumbnail(
                    page_index=idx,
                    page_number=idx + 1,
                    width=int(width),
                    height=int(height),
                    rotation=0,
                    thumbnail_url=thumb_data_url,
                )
            )

        return PdfInspectResponse(
            session_id=cid,
            filename=safe_name,
            file_size_bytes=len(file_bytes),
            page_count=page_count,
            pages=pages,
        )

    def compile_pdf(self, request: PdfCompileRequest) -> PdfCompileResponse:
        """
        Reorders, rotates, and exports pages from the session workspace to PDF or Images ZIP.
        """
        cid = request.session_id
        safe_name = FileValidator.sanitize_filename(request.filename)
        workspace = storage_manager.base_dir / cid
        input_path = workspace / "input" / safe_name
        output_dir = workspace / "output"
        output_dir.mkdir(parents=True, exist_ok=True)

        if not input_path.exists():
            # Try to find any PDF in input dir
            pdf_candidates = list((workspace / "input").glob("*.pdf"))
            if pdf_candidates:
                input_path = pdf_candidates[0]
            else:
                raise FileNotFoundError(f"PDF workspace or file {safe_name} not found.")

        if not request.pages:
            raise ValueError("At least one page must be included in the compilation.")

        stem = input_path.stem

        if request.export_type.lower() == "images_zip":
            # Export individual pages as high-res images in a ZIP
            pdf = pdfium.PdfDocument(str(input_path))
            image_paths: List[Path] = []

            for rank, page_spec in enumerate(request.pages, start=1):
                idx = page_spec.page_index
                if idx < 0 or idx >= len(pdf):
                    continue

                page = pdf[idx]
                pil_img = page.render(scale=2.0).to_pil()
                if pil_img.mode in ("RGBA", "P"):
                    pil_img = pil_img.convert("RGB")

                # Apply user rotation
                if page_spec.rotation:
                    rot = page_spec.rotation % 360
                    if rot != 0:
                        pil_img = pil_img.rotate(-rot, expand=True)

                out_img_path = output_dir / f"{stem}_page_{rank}.jpg"
                pil_img.save(out_img_path, format="JPEG", quality=90)
                image_paths.append(out_img_path)

            zip_filename = f"{stem}_extracted_pages.zip"
            zip_dest = output_dir / zip_filename
            ArchiveService.create_zip(image_paths, zip_dest)

            return PdfCompileResponse(
                success=True,
                message=f"Exported {len(image_paths)} pages to ZIP archive.",
                download_url=f"/api/v1/convert/{cid}/download?filename={zip_filename}",
                filename=zip_filename,
                file_size_bytes=zip_dest.stat().st_size,
                page_count=len(image_paths),
            )
        else:
            # Standard PDF reorganization
            reader = PdfReader(str(input_path))
            writer = PdfWriter()
            total_source_pages = len(reader.pages)

            for page_spec in request.pages:
                idx = page_spec.page_index
                if idx < 0 or idx >= total_source_pages:
                    continue

                page = reader.pages[idx]
                rot = page_spec.rotation % 360
                if rot != 0:
                    page.rotate(rot)
                writer.add_page(page)

            out_pdf_filename = f"{stem}_organized.pdf"
            out_pdf_path = output_dir / out_pdf_filename

            with open(out_pdf_path, "wb") as f_out:
                writer.write(f_out)

            return PdfCompileResponse(
                success=True,
                message=f"Successfully organized and compiled {len(writer.pages)} pages.",
                download_url=f"/api/v1/convert/{cid}/download?filename={out_pdf_filename}",
                filename=out_pdf_filename,
                file_size_bytes=out_pdf_path.stat().st_size,
                page_count=len(writer.pages),
            )

pdf_studio_service = PdfStudioService()
