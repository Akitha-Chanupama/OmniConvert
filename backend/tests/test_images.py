from pathlib import Path
from PIL import Image
import pytest
from app.converters.images import ImageConverter
from app.schemas.conversion import ConversionOptions

@pytest.fixture
def temp_dir(tmp_path: Path):
    return tmp_path

def test_png_to_jpg_transparency(temp_dir: Path):
    # Create RGBA image with transparent pixels
    input_path = temp_dir / "test_trans.png"
    img = Image.new("RGBA", (100, 100), (255, 0, 0, 0))  # Fully transparent red
    img.save(input_path)

    converter = ImageConverter()
    output_path = temp_dir / "output.jpg"
    converter.convert(input_path, output_path)

    assert output_path.exists()
    assert output_path.stat().st_size > 0

    with Image.open(output_path) as res:
        assert res.mode == "RGB"
        # Transparent converted to white
        assert res.getpixel((50, 50)) == (255, 255, 255)

def test_jpg_to_webp_quality_resize(temp_dir: Path):
    input_path = temp_dir / "test.jpg"
    img = Image.new("RGB", (200, 100), (0, 128, 255))
    img.save(input_path)

    converter = ImageConverter()
    output_path = temp_dir / "output.webp"
    options = ConversionOptions(quality=75, width=100, preserve_aspect_ratio=True)
    converter.convert(input_path, output_path, options)

    assert output_path.exists()
    assert output_path.stat().st_size > 0
    with Image.open(output_path) as res:
        assert res.size == (100, 50)

def test_png_to_ico(temp_dir: Path):
    input_path = temp_dir / "icon.png"
    img = Image.new("RGBA", (64, 64), (10, 20, 30, 255))
    img.save(input_path)

    converter = ImageConverter()
    output_path = temp_dir / "icon.ico"
    converter.convert(input_path, output_path)

    assert output_path.exists()
    assert output_path.stat().st_size > 0

def test_invalid_image_raises_error(temp_dir: Path):
    input_path = temp_dir / "corrupted.png"
    input_path.write_text("not a real image")

    converter = ImageConverter()
    output_path = temp_dir / "corrupted_out.jpg"
    with pytest.raises(Exception):
        converter.convert(input_path, output_path)

def test_multiple_images_to_pdf(temp_dir: Path):
    img1_path = temp_dir / "img1.png"
    img2_path = temp_dir / "img2.jpg"
    Image.new("RGB", (100, 100), (255, 0, 0)).save(img1_path)
    Image.new("RGB", (120, 120), (0, 255, 0)).save(img2_path)

    pdf_out = temp_dir / "combined.pdf"
    ImageConverter.convert_multiple_to_pdf([img1_path, img2_path], pdf_out)

    assert pdf_out.exists()
    assert pdf_out.stat().st_size > 0
    from pypdf import PdfReader
    reader = PdfReader(str(pdf_out))
    assert len(reader.pages) == 2

def test_heic_to_jpg(temp_dir: Path):
    try:
        import pillow_heif
        pillow_heif.register_heif_opener()
    except ImportError:
        pytest.skip("pillow-heif not installed")

    heic_path = temp_dir / "photo.heic"
    Image.new("RGB", (100, 100), (0, 100, 200)).save(heic_path, format="HEIF")

    converter = ImageConverter()
    jpg_out = temp_dir / "photo.jpg"
    converter.convert(heic_path, jpg_out)

    assert jpg_out.exists()
    assert jpg_out.stat().st_size > 0
    with Image.open(jpg_out) as res:
        assert res.size == (100, 100)

