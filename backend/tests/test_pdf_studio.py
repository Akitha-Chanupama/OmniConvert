from pathlib import Path
from fastapi.testclient import TestClient
from pypdf import PdfWriter, PdfReader
import pytest
from app.main import app

client = TestClient(app)

@pytest.fixture
def sample_pdf(tmp_path: Path) -> Path:
    """Creates a 3-page test PDF file."""
    pdf_path = tmp_path / "sample_doc.pdf"
    writer = PdfWriter()
    for _ in range(3):
        writer.add_blank_page(width=612, height=792)
    with open(pdf_path, "wb") as f:
        writer.write(f)
    return pdf_path

def test_inspect_pdf_success(sample_pdf: Path):
    with open(sample_pdf, "rb") as f:
        response = client.post(
            "/api/v1/pdf-studio/inspect",
            files={"file": ("sample_doc.pdf", f, "application/pdf")},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "sample_doc.pdf"
    assert data["page_count"] == 3
    assert len(data["pages"]) == 3
    assert data["pages"][0]["page_number"] == 1
    assert data["pages"][0]["thumbnail_url"].startswith("data:image/webp;base64,")
    assert "session_id" in data

def test_inspect_pdf_invalid_format():
    response = client.post(
        "/api/v1/pdf-studio/inspect",
        files={"file": ("notes.txt", b"Hello world", "text/plain")},
    )
    assert response.status_code == 400
    assert "Only PDF files are supported" in response.json()["detail"]

def test_compile_pdf_reorder_and_rotate(sample_pdf: Path):
    # 1. Inspect first
    with open(sample_pdf, "rb") as f:
        inspect_res = client.post(
            "/api/v1/pdf-studio/inspect",
            files={"file": ("sample_doc.pdf", f, "application/pdf")},
        )
    assert inspect_res.status_code == 200
    session_id = inspect_res.json()["session_id"]

    # 2. Compile: take page 2, then page 0 rotated 90 deg (dropping page 1)
    payload = {
        "session_id": session_id,
        "filename": "sample_doc.pdf",
        "export_type": "pdf",
        "pages": [
            {"page_index": 2, "rotation": 0},
            {"page_index": 0, "rotation": 90},
        ],
    }
    compile_res = client.post("/api/v1/pdf-studio/compile", json=payload)
    assert compile_res.status_code == 200
    comp_data = compile_res.json()
    assert comp_data["success"] is True
    assert comp_data["page_count"] == 2
    assert comp_data["filename"] == "sample_doc_organized.pdf"

    # 3. Verify download
    dl_url = comp_data["download_url"]
    dl_res = client.get(dl_url)
    assert dl_res.status_code == 200
    assert dl_res.headers["content-type"] == "application/pdf"

    # Verify page count of downloaded PDF
    import io
    reader = PdfReader(io.BytesIO(dl_res.content))
    assert len(reader.pages) == 2
    assert reader.pages[1].rotation == 90

def test_compile_pdf_to_images_zip(sample_pdf: Path):
    with open(sample_pdf, "rb") as f:
        inspect_res = client.post(
            "/api/v1/pdf-studio/inspect",
            files={"file": ("sample_doc.pdf", f, "application/pdf")},
        )
    session_id = inspect_res.json()["session_id"]

    payload = {
        "session_id": session_id,
        "filename": "sample_doc.pdf",
        "export_type": "images_zip",
        "pages": [
            {"page_index": 0, "rotation": 0},
            {"page_index": 1, "rotation": 180},
        ],
    }
    compile_res = client.post("/api/v1/pdf-studio/compile", json=payload)
    assert compile_res.status_code == 200
    comp_data = compile_res.json()
    assert comp_data["success"] is True
    assert comp_data["filename"].endswith(".zip")
    assert comp_data["page_count"] == 2

    # Download ZIP
    dl_res = client.get(comp_data["download_url"])
    assert dl_res.status_code == 200
    assert dl_res.headers["content-type"] == "application/zip"
