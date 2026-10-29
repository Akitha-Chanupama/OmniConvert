import json
from pathlib import Path
import pytest
from app.converters.text import TextDataConverter
from app.schemas.conversion import ConversionOptions

@pytest.fixture
def temp_dir(tmp_path: Path):
    return tmp_path

def test_json_to_yaml_and_back(temp_dir: Path):
    converter = TextDataConverter()
    json_path = temp_dir / "sample.json"
    data = {"name": "OmniConvert", "features": ["local", "fast"], "version": 1}
    json_path.write_text(json.dumps(data), encoding="utf-8")

    yaml_path = temp_dir / "sample.yaml"
    converter.convert(json_path, yaml_path)

    assert yaml_path.exists()
    assert "OmniConvert" in yaml_path.read_text(encoding="utf-8")

    # Convert back to JSON
    json_out = temp_dir / "back.json"
    converter.convert(yaml_path, json_out)
    assert json_out.exists()
    restored = json.loads(json_out.read_text(encoding="utf-8"))
    assert restored["name"] == "OmniConvert"

def test_json_to_csv_flattening(temp_dir: Path):
    converter = TextDataConverter()
    json_path = temp_dir / "records.json"
    records = [
        {"id": 1, "name": "Alpha", "meta": {"role": "admin"}},
        {"id": 2, "name": "Beta", "active": True},
    ]
    json_path.write_text(json.dumps(records), encoding="utf-8")

    csv_path = temp_dir / "records.csv"
    converter.convert(json_path, csv_path)

    assert csv_path.exists()
    content = csv_path.read_text(encoding="utf-8")
    assert "Alpha" in content
    assert "Beta" in content

def test_csv_to_json(temp_dir: Path):
    converter = TextDataConverter()
    csv_path = temp_dir / "data.csv"
    csv_path.write_text("id,city\n101,Tokyo\n102,Paris\n", encoding="utf-8")

    json_path = temp_dir / "data.json"
    converter.convert(csv_path, json_path)

    assert json_path.exists()
    parsed = json.loads(json_path.read_text(encoding="utf-8"))
    assert len(parsed) == 2
    assert parsed[0]["city"] == "Tokyo"

def test_md_to_html_and_txt(temp_dir: Path):
    converter = TextDataConverter()
    md_path = temp_dir / "doc.md"
    md_path.write_text("# Hello World\n\nThis is **bold** text.", encoding="utf-8")

    html_path = temp_dir / "doc.html"
    converter.convert(md_path, html_path)
    assert html_path.exists()
    assert "<h1>Hello World</h1>" in html_path.read_text(encoding="utf-8")

    txt_path = temp_dir / "doc.txt"
    converter.convert(md_path, txt_path)
    assert txt_path.exists()
    assert "bold" in txt_path.read_text(encoding="utf-8")

def test_malformed_json_raises_error(temp_dir: Path):
    converter = TextDataConverter()
    bad_json = temp_dir / "bad.json"
    bad_json.write_text("{ unquoted_key: 123 ", encoding="utf-8")

    out_yaml = temp_dir / "bad.yaml"
    with pytest.raises(ValueError):
        converter.convert(bad_json, out_yaml)
