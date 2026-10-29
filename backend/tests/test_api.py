import io
import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"
        assert "installed_tools" in data
        assert data["installed_tools"]["pillow"] is True
        assert data["installed_tools"]["pypdf"] is True

@pytest.mark.asyncio
async def test_formats_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/formats")
        assert res.status_code == 200
        data = res.json()
        assert "formats" in data
        assert "png" in data["formats"]
        assert "jpg" in data["formats"]["png"]
        assert "capabilities" in data

@pytest.mark.asyncio
async def test_convert_single_file_and_download():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        file_payload = ("test.txt", io.BytesIO(b"Hello World"), "text/plain")
        res = await client.post(
            "/api/v1/convert",
            data={"target_format": "html"},
            files={"files": file_payload},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert len(data["items"]) == 1
        cid = data["conversion_id"]
        filename = data["items"][0]["converted_filename"]
        assert filename == "test.html"

        # Test download
        dl_res = await client.get(f"/api/v1/convert/{cid}/download?filename={filename}")
        assert dl_res.status_code == 200
        assert "<p>Hello World</p>" in dl_res.text

@pytest.mark.asyncio
async def test_convert_batch_files_creates_zip():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        f1 = ("doc1.txt", io.BytesIO(b"Doc 1"), "text/plain")
        f2 = ("doc2.txt", io.BytesIO(b"Doc 2"), "text/plain")
        res = await client.post(
            "/api/v1/convert",
            data={"target_format": "md"},
            files=[("files", f1), ("files", f2)],
        )
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["is_zip"] is True
        assert len(data["items"]) == 2

        cid = data["conversion_id"]
        dl_res = await client.get(f"/api/v1/convert/{cid}/download?filename=converted_files.zip")
        assert dl_res.status_code == 200
        assert dl_res.headers["content-type"] == "application/zip"

@pytest.mark.asyncio
async def test_convert_unsupported_format_returns_400():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        file_payload = ("sample.txt", io.BytesIO(b"Text content"), "text/plain")
        res = await client.post(
            "/api/v1/convert",
            data={"target_format": "unsupported_xyz"},
            files={"files": file_payload},
        )
        assert res.status_code == 400

@pytest.mark.asyncio
async def test_download_nonexistent_returns_404():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/convert/fake-uuid-not-found/download")
        assert res.status_code == 404
