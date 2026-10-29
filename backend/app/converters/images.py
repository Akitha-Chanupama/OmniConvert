from pathlib import Path
from typing import Optional, Set
from PIL import Image
from app.converters.base import BaseConverter
from app.schemas.conversion import ConversionOptions

class ImageConverter(BaseConverter):
    SUPPORTED_INPUTS: Set[str] = {"jpg", "jpeg", "png", "webp", "bmp", "tiff", "tif", "gif", "ico"}
    SUPPORTED_OUTPUTS: Set[str] = {"jpg", "jpeg", "png", "webp", "bmp", "tiff", "gif", "ico", "pdf"}

    def can_convert(self, source_ext: str, target_ext: str) -> bool:
        s = source_ext.lower().lstrip(".")
        t = target_ext.lower().lstrip(".")
        if s == "jpeg":
            s = "jpg"
        if t == "jpeg":
            t = "jpg"
        if s == t:
            return True
        return s in self.SUPPORTED_INPUTS and t in self.SUPPORTED_OUTPUTS

    def convert(
        self,
        input_path: Path,
        output_path: Path,
        options: Optional[ConversionOptions] = None,
    ) -> Path:
        target_ext = output_path.suffix.lower().lstrip(".")
        if target_ext == "jpeg":
            target_ext = "jpg"

        with Image.open(input_path) as img:
            # Handle animation / multi-frame: extract first frame for static target formats
            if getattr(img, "is_animated", False) and target_ext != "gif":
                img.seek(0)

            # Copy or convert to an editable image object
            current_img = img.copy()

            # Apply rotation if specified in options
            if options and options.rotate_degrees:
                # PIL rotates counter-clockwise by default, so -options.rotate_degrees rotates clockwise
                current_img = current_img.rotate(-options.rotate_degrees, expand=True)

            # Apply resizing if specified
            if options and (options.width or options.height):
                orig_w, orig_h = current_img.size
                target_w = options.width or orig_w
                target_h = options.height or orig_h

                if options.preserve_aspect_ratio:
                    if options.width and not options.height:
                        target_h = int(orig_h * (options.width / orig_w))
                    elif options.height and not options.width:
                        target_w = int(orig_w * (options.height / orig_h))
                    else:
                        # fit within target dimensions while preserving ratio
                        current_img.thumbnail((target_w, target_h), Image.Resampling.LANCZOS)
                        target_w, target_h = current_img.size

                if current_img.size != (target_w, target_h):
                    current_img = current_img.resize((target_w, target_h), Image.Resampling.LANCZOS)

            # Mode handling and transparency preservation
            # When writing to JPEG, alpha channels cannot be saved directly:
            if target_ext in ("jpg", "bmp"):
                if current_img.mode in ("RGBA", "LA") or (current_img.mode == "P" and "transparency" in current_img.info):
                    # Composite over white background to preserve transparent areas
                    rgba_img = current_img.convert("RGBA")
                    background = Image.new("RGBA", rgba_img.size, (255, 255, 255, 255))
                    alpha_composite = Image.alpha_composite(background, rgba_img)
                    current_img = alpha_composite.convert("RGB")
                elif current_img.mode != "RGB":
                    current_img = current_img.convert("RGB")
            elif target_ext == "ico":
                # ICO supports standard sizes like 16, 32, 48, 64, 128, 256
                if current_img.mode != "RGBA":
                    current_img = current_img.convert("RGBA")
                # Ensure it doesn't exceed 256x256
                if current_img.width > 256 or current_img.height > 256:
                    current_img.thumbnail((256, 256), Image.Resampling.LANCZOS)
            elif target_ext == "pdf":
                if current_img.mode in ("RGBA", "LA"):
                    rgba_img = current_img.convert("RGBA")
                    background = Image.new("RGBA", rgba_img.size, (255, 255, 255, 255))
                    alpha_composite = Image.alpha_composite(background, rgba_img)
                    current_img = alpha_composite.convert("RGB")
                elif current_img.mode != "RGB":
                    current_img = current_img.convert("RGB")

            # Output save parameters
            save_kwargs = {}
            quality = options.quality if (options and options.quality) else 90

            pil_format_map = {
                "jpg": "JPEG",
                "png": "PNG",
                "webp": "WEBP",
                "bmp": "BMP",
                "tiff": "TIFF",
                "gif": "GIF",
                "ico": "ICO",
                "pdf": "PDF",
            }

            pil_format = pil_format_map.get(target_ext, target_ext.upper())

            if target_ext in ("jpg", "webp"):
                save_kwargs["quality"] = quality
                if target_ext == "jpg":
                    save_kwargs["optimize"] = True

            output_path.parent.mkdir(parents=True, exist_ok=True)
            current_img.save(output_path, format=pil_format, **save_kwargs)

        # Output validation
        if not output_path.exists() or output_path.stat().st_size == 0:
            raise RuntimeError(f"Image conversion to {target_ext} failed: generated output is missing or empty.")

        return output_path
