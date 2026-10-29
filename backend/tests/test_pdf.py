from pathlib import Path
from pypdf import PdfReader
import pytest
from app.converters.pdf import PDFConverter
from app.schemas.conversion import ConversionOptions

@pytest.fixture
def temp_dir(tmp_path: Path):
    return tmp_path

def test_txt_to_pdf_and_text_extraction(temp_dir: Path):
    converter = PDFConverter()
    txt_path = temp_dir / "sample.txt"
    txt_path.write_text("Hello OmniConvert!\nTesting PDF generation.\nLine 3 of document.", encoding="utf-8")

    pdf_path = temp_dir / "sample.pdf"
    converter.convert(txt_path, pdf_path)

    assert pdf_path.exists()
    assert pdf_path.stat().st_size > 0

    reader = PdfReader(str(pdf_path))
    assert len(reader.pages) == 1

    # Extract back to TXT
    extracted_txt = temp_dir / "extracted.txt"
    converter.convert(pdf_path, extracted_txt)
    assert extracted_txt.exists()
    extracted_content = extracted_txt.read_text(encoding="utf-8")
    assert "OmniConvert" in extracted_content

def test_pdf_merge(temp_dir: Path):
    converter = PDFConverter()
    # Create 2 simple PDFs
    t1 = temp_dir / "doc1.txt"
    t1.write_text("Document One", encoding="utf-8")
    p1 = temp_dir / "doc1.pdf"
    converter.convert(t1, p1)

    t2 = temp_dir / "doc2.txt"
    t2.write_text("Document Two", encoding="utf-8")
    p2 = temp_dir / "doc2.pdf"
    converter.convert(t2, p2)

    merged_pdf = temp_dir / "merged.pdf"
    converter.merge_pdfs([p1, p2], merged_pdf)

    assert merged_pdf.exists()
    reader = PdfReader(str(merged_pdf))
    assert len(reader.pages) == 2

def test_pdf_rotation(temp_dir: Path):
    converter = PDFConverter()
    t = temp_dir / "rotate.txt"
    t.write_text("Rotate test", encoding="utf-8")
    p = temp_dir / "orig.pdf"
    converter.convert(t, p)

    rotated_pdf = temp_dir / "rotated.pdf"
    options = ConversionOptions(rotate_degrees=90)
    converter.convert(p, rotated_pdf, options)

    assert rotated_pdf.exists()
    reader = PdfReader(str(rotated_pdf))
    assert reader.pages[0].rotation == 90

def test_invalid_pdf_raises_error(temp_dir: Path):
    converter = PDFConverter()
    bad_pdf = temp_dir / "bad.pdf"
    bad_pdf.write_text("not a pdf")

    out_txt = temp_dir / "out.txt"
    with pytest.raises(Exception):
        converter.convert(bad_pdf, out_txt)

def test_pdf_split(temp_dir: Path):
    converter = PDFConverter()
    # Create a 2-page PDF
    t1 = temp_dir / "p1.txt"
    t1.write_text("Page 1 content")
    p1 = temp_dir / "p1.pdf"
    converter.convert(t1, p1)

    t2 = temp_dir / "p2.txt"
    t2.write_text("Page 2 content")
    p2 = temp_dir / "p2.pdf"
    converter.convert(t2, p2)

    merged = temp_dir / "twopage.pdf"
    converter.merge_pdfs([p1, p2], merged)

    split_dir = temp_dir / "split_output"
    split_files = converter.split_pdf(merged, split_dir)

    assert len(split_files) == 2
    assert all(f.exists() for f in split_files)
    assert split_files[0].name == "twopage_page_1.pdf"
    assert split_files[1].name == "twopage_page_2.pdf"

def test_pdf_to_images(temp_dir: Path):
    converter = PDFConverter()
    t = temp_dir / "render.txt"
    t.write_text("Rendering page test")
    p = temp_dir / "render.pdf"
    converter.convert(t, p)

    img_dir = temp_dir / "rendered_images"
    images = converter.convert_pdf_to_images(p, img_dir, target_format="png")

    assert len(images) == 1
    assert images[0].exists()
    assert images[0].name == "render_page_1.png"

def test_pdf_to_markdown(temp_dir: Path):
    converter = PDFConverter()
    t = temp_dir / "doc_for_md.txt"
    t.write_text("Introduction to OmniConvert\n\nThis is paragraph one.\n\nKey features:\n- Privacy first\n- Fast conversion", encoding="utf-8")
    p = temp_dir / "doc_for_md.pdf"
    converter.convert(t, p)

    assert p.exists()
    assert converter.can_convert("pdf", "md") is True

    md_out = temp_dir / "converted.md"
    result = converter.convert(p, md_out)

    assert result.exists()
    assert result.stat().st_size > 0
    content = result.read_text(encoding="utf-8")
    assert "OmniConvert" in content

def test_markdown_to_pdf(temp_dir: Path):
    converter = PDFConverter()
    md_file = temp_dir / "sample.md"
    md_content = """# OmniConvert Local Studio

OmniConvert performs 100% offline conversions.

## Features
- **Zero Cloud Leakage**: Everything runs on localhost.
- **Fast Execution**: High-performance libraries.

| Column A | Column B |
| --- | --- |
| Val 1 | Val 2 |
"""
    md_file.write_text(md_content, encoding="utf-8")

    assert converter.can_convert("md", "pdf") is True

    pdf_out = temp_dir / "rendered.pdf"
    result = converter.convert(md_file, pdf_out)

    assert result.exists()
    assert result.stat().st_size > 0

    reader = PdfReader(str(result))
    assert len(reader.pages) >= 1
    extracted = reader.pages[0].extract_text()
    assert "OmniConvert" in extracted
