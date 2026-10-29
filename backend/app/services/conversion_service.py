import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import UploadFile
from app.converters.archives import ArchiveService
from app.converters.pdf import PDFConverter
from app.schemas.conversion import BatchConversionResponse, ConversionOptions, ConvertedFileInfo
from app.services.cleanup_service import cleanup_service
from app.services.conversion_registry import conversion_registry
from app.services.file_storage import storage_manager
from app.services.file_validation import FileValidator

class ConversionService:
    def __init__(self):
        self.registry = conversion_registry
        self.storage = storage_manager

    async def process_conversion(
        self,
        files: List[UploadFile],
        target_format: str,
        options: Optional[ConversionOptions] = None,
        merge_pdf: bool = False,
    ) -> BatchConversionResponse:
        # Trigger cleanup of expired scratch directories
        cleanup_service.purge_expired_workspaces()

        if not files:
            raise ValueError("No files provided for conversion.")

        target_ext = target_format.lower().lstrip(".")
        if target_ext == "jpeg":
            target_ext = "jpg"

        cid, input_dir, output_dir = self.storage.create_conversion_workspace()

        saved_input_paths: List[Path] = []
        original_filenames: List[str] = []

        try:
            # 1. Save and validate all input files
            for idx, file in enumerate(files):
                raw_filename = file.filename or f"file_{idx}"
                sanitized_name = FileValidator.sanitize_filename(raw_filename)
                target_input_path = input_dir / f"{idx}_{sanitized_name}"

                content = await file.read()
                FileValidator.validate_size(len(content))

                with open(target_input_path, "wb") as f_out:
                    f_out.write(content)

                saved_input_paths.append(target_input_path)
                original_filenames.append(sanitized_name)

            # Special case: PDF Merge
            if merge_pdf or (len(files) > 1 and target_ext == "pdf" and all(p.suffix.lower() == ".pdf" for p in saved_input_paths)):
                merged_output_path = output_dir / "merged.pdf"
                pdf_conv = PDFConverter()
                pdf_conv.merge_pdfs(saved_input_paths, merged_output_path)

                file_info = ConvertedFileInfo(
                    conversion_id=cid,
                    original_filename=", ".join(original_filenames),
                    converted_filename=merged_output_path.name,
                    target_format="pdf",
                    file_size_bytes=merged_output_path.stat().st_size,
                    download_url=f"/api/v1/convert/{cid}/download?filename={merged_output_path.name}",
                )

                return BatchConversionResponse(
                    success=True,
                    message="PDFs merged successfully.",
                    conversion_id=cid,
                    is_zip=False,
                    download_url=file_info.download_url,
                    items=[file_info],
                )

            # 2. Standard Conversion
            converted_items: List[ConvertedFileInfo] = []
            output_paths: List[Path] = []

            for input_path, orig_name in zip(saved_input_paths, original_filenames):
                src_ext = Path(orig_name).suffix.lower().lstrip(".")
                if not src_ext:
                    # Detect format from file content header
                    with open(input_path, "rb") as f_head:
                        src_ext = FileValidator.detect_format_by_content(f_head.read(32), "txt")

                converter = self.registry.find_converter(src_ext, target_ext)
                if not converter:
                    raise ValueError(
                        f"Conversion from '{src_ext}' to '{target_ext}' is not supported on this system."
                    )

                base_stem = Path(orig_name).stem
                out_filename = f"{base_stem}.{target_ext}"
                out_path = output_dir / out_filename

                # Avoid name collision in output dir
                collision_idx = 1
                while out_path.exists():
                    out_path = output_dir / f"{base_stem}_{collision_idx}.{target_ext}"
                    collision_idx += 1

                # Execute conversion
                converter.convert(input_path, out_path, options)

                # Validate output
                if not out_path.exists() or out_path.stat().st_size == 0:
                    raise RuntimeError(f"Conversion for {orig_name} failed: output file is empty or missing.")

                output_paths.append(out_path)
                converted_items.append(
                    ConvertedFileInfo(
                        conversion_id=cid,
                        original_filename=orig_name,
                        converted_filename=out_path.name,
                        target_format=target_ext,
                        file_size_bytes=out_path.stat().st_size,
                        download_url=f"/api/v1/convert/{cid}/download?filename={out_path.name}",
                    )
                )

            # 3. Handle multiple outputs (create ZIP archive)
            if len(output_paths) > 1:
                zip_path = output_dir / "converted_files.zip"
                ArchiveService.create_zip(output_paths, zip_path)
                zip_download_url = f"/api/v1/convert/{cid}/download?filename=converted_files.zip"

                return BatchConversionResponse(
                    success=True,
                    message=f"Successfully converted {len(output_paths)} files.",
                    conversion_id=cid,
                    is_zip=True,
                    download_url=zip_download_url,
                    items=converted_items,
                )
            else:
                single_info = converted_items[0]
                return BatchConversionResponse(
                    success=True,
                    message="File converted successfully.",
                    conversion_id=cid,
                    is_zip=False,
                    download_url=single_info.download_url,
                    items=converted_items,
                )

        except Exception as e:
            # Clean up on failure
            try:
                shutil.rmtree(input_dir.parent, ignore_errors=True)
            except Exception:
                pass
            raise e

conversion_service = ConversionService()
