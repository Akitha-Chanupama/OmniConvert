# OmniConvert

> **Convert files. Keep it simple.**
> A personal-first, privacy-focused, zero-external-API file conversion web application.

OmniConvert allows you to upload files, select supported target formats, convert them locally using free open-source tools and Python libraries, preview results, and download converted outputs.

No paid subscriptions, no cloud uploads, no forced accounts, and no third-party conversion APIs. Everything runs on your machine.

---

## Table of Contents

- [Features](#features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Project Structure](#project-structure)
- [Supported Conversion Matrix](#supported-conversion-matrix)
- [System Requirements & Dependencies](#system-requirements--dependencies)
- [Quick Start (Windows)](#quick-start-windows)
- [Quick Start (Linux / macOS)](#quick-start-linux--macos)
- [API Reference](#api-reference)
- [Security & Privacy](#security--privacy)
- [Troubleshooting & Limitations](#troubleshooting--limitations)
- [Implementation Checklist](#implementation-checklist)

---

## Features

- **100% Local Processing**: Your files never leave `127.0.0.1`.
- **Dynamic Format Matrix**: The UI adapts dynamically to capabilities supported by installed backend tools.
- **Images**: Fast conversions between JPEG, PNG, WebP, BMP, TIFF, GIF, and ICO with transparency preservation, quality control, and dimensions detection.
- **Documents & Text**: TXT, Markdown, HTML, JSON, YAML, CSV, and Excel (XLSX).
- **PDF Suite**: Images-to-PDF, TXT-to-PDF, PDF page extraction, split, merge, rotation, and metadata extraction.
- **Office Conversion Ready**: Pluggable architecture supporting LibreOffice headless conversions (DOCX/XLSX to PDF).
- **Batch Processing & ZIP Download**: Convert multiple files in a single pass and download individual files or a merged ZIP.
- **Automatic Lifecycle Cleanup**: Isolated per-conversion working directories with automatic cleanup.

---

## Architecture & Tech Stack

OmniConvert is organized as a clean monorepo:

```
Browser UI (React + Vite + Tailwind)
       │
       ▼ (REST HTTP / Multipart)
FastAPI Backend (127.0.0.1:8000)
       │
       ▼
Conversion Registry (Capability & Engine Discovery)
       ├── Image Engine (Pillow)
       ├── Text / Data Engine (Python native, PyYAML, defusedxml)
       ├── Spreadsheet Engine (openpyxl, csv)
       ├── PDF Engine (pypdf, Pillow)
       └── Subprocess Adapters (LibreOffice, Pandoc, FFmpeg - detected dynamically)
       │
       ▼
Isolated Scratch Storage (backend/temp/{conversion_id})
       │
       ▼
Synchronous Return / Short-lived Download Endpoint
```

### Frontend
- **React 18/19** with **Vite**
- **TypeScript** (Strict Mode)
- **Tailwind CSS**
- **Lucide React** (Icons)

### Backend
- **Python 3.11+ / 3.12**
- **FastAPI** + **Uvicorn**
- **Pydantic v2**
- **Pillow** (Image conversions)
- **pypdf** (PDF manipulations & mergers)
- **openpyxl** (Excel spreadsheet processing)
- **PyYAML** (Safe YAML serialization/deserialization)
- **defusedxml** (Safe XML parsing)
- **pytest** & **httpx** (Automated testing suite)

---

## Project Structure

```text
omniconvert/
├── README.md
├── .gitignore
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── .env.example
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       │   ├── FileDropzone.tsx
│       │   ├── FileCard.tsx
│       │   ├── FormatSelector.tsx
│       │   ├── ConversionProgress.tsx
│       │   ├── ConversionResult.tsx
│       │   └── ErrorMessage.tsx
│       ├── pages/
│       │   ├── HomePage.tsx
│       │   ├── ToolsPage.tsx
│       │   └── SettingsPage.tsx
│       ├── services/
│       │   └── conversionApi.ts
│       ├── types/
│       └── utils/
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── api/
│   │   │   ├── health.py
│   │   │   ├── formats.py
│   │   │   └── conversions.py
│   │   ├── schemas/
│   │   │   └── conversion.py
│   │   ├── services/
│   │   │   ├── conversion_registry.py
│   │   │   ├── conversion_service.py
│   │   │   ├── file_validation.py
│   │   │   ├── file_storage.py
│   │   │   └── cleanup_service.py
│   │   └── converters/
│   │       ├── images.py
│   │       ├── pdf.py
│   │       ├── documents.py
│   │       ├── spreadsheets.py
│   │       ├── text.py
│   │       └── archives.py
│   ├── tests/
│   │   ├── test_images.py
│   │   ├── test_text_data.py
│   │   ├── test_spreadsheets.py
│   │   ├── test_pdf.py
│   │   └── test_api.py
│   └── temp/
└── scripts/
    ├── setup.ps1
    ├── setup.sh
    ├── start.ps1
    └── start.sh
```

---

## Supported Conversion Matrix

| Category | Source Format | Target Formats | Engine / Dependencies | Notes |
|----------|--------------|----------------|----------------------|-------|
| **Images** | JPG/JPEG | PNG, WebP, BMP, TIFF, GIF, PDF, ICO | Pillow | Preserves RGB, allows quality parameter |
| | PNG | JPG/JPEG, WebP, BMP, TIFF, GIF, PDF, ICO | Pillow | Alpha channel flattened to white on JPEG |
| | WebP | PNG, JPG/JPEG, BMP, TIFF, PDF | Pillow | |
| | BMP | PNG, JPG/JPEG, WebP, TIFF, PDF | Pillow | |
| | TIFF | PNG, JPG/JPEG, WebP, BMP, PDF | Pillow | |
| | GIF | PNG, JPG/JPEG, WebP | Pillow | Extracts frame/still |
| **Data & Text** | TXT | MD, HTML, PDF | Python / pypdf | Text formatted to document |
| | MD | HTML, TXT | Python (safe markdown) | Optional Pandoc for advanced render |
| | HTML | TXT | Python / html parser | Extracts clean plain text |
| | JSON | YAML, CSV | PyYAML, Python csv | Flattens list of dicts for CSV |
| | YAML | JSON | PyYAML | Safe YAML parsing |
| | XML | Formatted XML | defusedxml | Formats with indent, entity injection disabled |
| | CSV | JSON, XLSX | Python csv, openpyxl | Converts tabular rows |
| | XLSX | CSV, JSON, PDF | openpyxl, LibreOffice (PDF) | Extracts first sheet to CSV/JSON |
| **PDF** | PDF | TXT | pypdf | Extracts readable text per page |
| | PDF (Multiple) | PDF (Merged) | pypdf | Merges multiple files into one |
| | PDF (Single) | PDF (Split/Rotated) | pypdf | Page extraction and rotation |
| | DOCX | PDF, TXT | LibreOffice / Python | LibreOffice headless when installed |

---

## System Requirements & Dependencies

### Core Requirements
- **Node.js**: v18.0.0 or later (v22+ verified)
- **Python**: 3.11 or 3.12

### Optional Local Tools (Auto-detected)
- **LibreOffice (`soffice`)**: Enables DOCX $\to$ PDF, XLSX $\to$ PDF, and ODT conversions.
- **Pandoc (`pandoc`)**: Enables extended Markdown $\to$ PDF / DOCX conversions.
- **FFmpeg (`ffmpeg`)**: Reserved for audio/video conversion module.

If an optional tool is missing, OmniConvert automatically marks those conversions as disabled and informs the user with installation instructions.

---

## Quick Start (Windows)

### 1. Backend Setup
Open PowerShell in the project root:
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Frontend Setup
In a new PowerShell terminal:
```powershell
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## Quick Start (Linux / macOS)

### 1. Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
python3 -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## API Reference

- `GET /api/v1/health`
  - Returns backend health and list of detected optional tools (`libreoffice`, `pandoc`, `ffmpeg`).
- `GET /api/v1/formats`
  - Returns the list of supported input extensions and available output formats based on system capabilities.
- `POST /api/v1/convert`
  - Multipart form upload:
    - `files`: One or more files.
    - `target_format`: Extension string (e.g., `png`, `pdf`).
    - `options`: Optional JSON string containing options (e.g. `{"quality": 85, "width": 800}`).
  - Returns converted file directly or a ZIP file if multiple files converted.
- `GET /api/v1/convert/{conversion_id}/download`
  - Downloads previously processed files using temporary token.

---

## Security & Privacy

- **Localhost Binding**: Backend defaults to `127.0.0.1`.
- **CORS Restricted**: Permitted only to frontend origins (`http://localhost:5173`, `http://127.0.0.1:5173`).
- **Path Traversal Protection**: Filenames sanitized, converted inside unique UUID scratch directories.
- **Size Limits**: 50MB per file default limit.
- **No External Submissions**: Files are never relayed to external cloud services or LLMs.
- **Periodic Cleanup**: Background cleaner purges orphaned temporary directories older than 30 minutes.

---

## Troubleshooting & Limitations

- **"LibreOffice not found"**: Ensure `soffice` is in your Windows `PATH` if you wish to convert DOCX to PDF.
- **Large Excel sheets**: Converting very large workbooks to JSON or CSV may take a few seconds; conversion runs synchronously with streaming responses.
- **PDF Scans**: PDF to TXT extracts native text streams only (OCR is not included in initial release).

---

## Implementation Checklist

- [x] **Phase 0: Workspace inspection and project skeleton**
  - Inspected system runtimes (Node v22, Python 3.12 installed, Git 2.50).
  - Created monorepo structure with `frontend/`, `backend/`, and `scripts/`.
  - Configured root `.gitignore` and `README.md`.
- [x] **Phase 1: Core FastAPI backend and React frontend**
  - Implemented modular FastAPI application (`app/main.py`, config, API routes).
  - Implemented `ImageConverter` (Pillow) with quality compression, resizing, and transparency preservation.
  - Implemented `TextDataConverter` (TXT, Markdown, HTML, JSON, YAML, XML formatting, CSV).
  - Built modern React + Vite + TypeScript frontend with drag-and-drop zone and dynamic formats.
- [x] **Phase 2: PDF, office documents, and structured text converters**
  - Implemented `PDFConverter` (vector text generation from TXT, text extraction, merge, rotation, page ranges).
  - Implemented `SpreadsheetConverter` (CSV <-> XLSX, XLSX -> JSON with `openpyxl`).
  - Implemented `DocumentConverter` with native XML text extraction for DOCX and safe LibreOffice headless subprocess.
- [x] **Phase 3: Batch processing, ZIP packaging, and settings**
  - Implemented `ArchiveService` for batch multi-file packaging into `.zip`.
  - Implemented `ConversionSettings` component with contextual quality, resizing, rotation, and sheet options.
  - Implemented `SettingsPage` with real-time tool detection and system diagnostics.
  - Added session history with one-click re-downloads.
- [x] **Phase 4: Automated test suite verification & production build validation**
  - 21 automated backend tests passed (`pytest` 21/21 passed).
  - Production TypeScript & Vite bundle built with 0 errors (`npm run build`).
  - Live API verified with real conversion payloads on `127.0.0.1:8000`.

