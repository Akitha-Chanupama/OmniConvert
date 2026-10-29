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
