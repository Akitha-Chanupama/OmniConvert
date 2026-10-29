from pathlib import Path
import pytest
from app.converters.spreadsheets import SpreadsheetConverter

@pytest.fixture
def temp_dir(tmp_path: Path):
    return tmp_path

def test_csv_to_xlsx_and_back(temp_dir: Path):
    converter = SpreadsheetConverter()
    csv_in = temp_dir / "input.csv"
    csv_in.write_text("item,qty,price\nApple,10,1.5\nBanana,20,0.8\n", encoding="utf-8")

    xlsx_out = temp_dir / "output.xlsx"
    converter.convert(csv_in, xlsx_out)

    assert xlsx_out.exists()
    assert xlsx_out.stat().st_size > 0

    csv_restored = temp_dir / "restored.csv"
    converter.convert(xlsx_out, csv_restored)

    assert csv_restored.exists()
    content = csv_restored.read_text(encoding="utf-8")
    assert "Apple" in content
    assert "Banana" in content

def test_xlsx_to_json(temp_dir: Path):
    converter = SpreadsheetConverter()
    csv_in = temp_dir / "table.csv"
    csv_in.write_text("name,score\nAlice,95\nBob,88\n", encoding="utf-8")

    xlsx_temp = temp_dir / "table.xlsx"
    converter.convert(csv_in, xlsx_temp)

    json_out = temp_dir / "table.json"
    converter.convert(xlsx_temp, json_out)

    assert json_out.exists()
    content = json_out.read_text(encoding="utf-8")
    assert "Alice" in content
    assert "95" in content
