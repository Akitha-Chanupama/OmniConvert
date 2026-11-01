# OmniConvert

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live_Demo-omniconvert--jzx7.onrender.com-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://omniconvert-jzx7.onrender.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![React 19](https://img.shields.io/badge/Frontend-React_19_•_Vite_•_Tailwind-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_•_Python_3.12-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Docker Ready](https://img.shields.io/badge/Deployment-Docker_Multi--Stage-2496ED?style=for-the-badge&logo=docker&logoColor=white)](Dockerfile)
[![PWA Installable](https://img.shields.io/badge/PWA-Desktop_App_Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://omniconvert-jzx7.onrender.com/)

<br />

**Convert files. Keep it simple.**  
*A high-performance, privacy-focused file conversion suite with zero cloud tracking and zero forced subscriptions.*

[**Explore Live Demo**](https://omniconvert-jzx7.onrender.com/) • [**Report Bug**](https://github.com/Akitha-Chanupama/OmniConvert/issues) • [**Request Feature**](https://github.com/Akitha-Chanupama/OmniConvert/issues)

</div>

---

## Overview

**OmniConvert** is an all-in-one local-first file converter and PDF visual studio. It allows you to convert images, documents, spreadsheets, data structures, and PDFs quickly and securely.

- **Zero Cloud APIs**: No data ever leaves your control. No third-party conversion APIs or paid credit limits.
- **Single-Container Architecture**: Node 20 Vite frontend + Python 3.12 FastAPI backend compiled into a single Docker image with embedded native conversion engines (`libreoffice-nogui`, `pandoc`, `ffmpeg`, `poppler-utils`).
- **Live Production Deployment**: Hosted 100% free on Render at **[https://omniconvert-jzx7.onrender.com/](https://omniconvert-jzx7.onrender.com/)**.

---

## Features at a Glance

### 🖼️ Image Conversion & Optimization
- Converts between **JPG**, **PNG**, **WebP**, **BMP**, **TIFF**, **GIF**, and **ICO**.
- Transparent alpha channel handling (flattens PNG/WebP with customizable matte background for JPG).
- Interactive quality compression slider with **real-time estimated output file size**.
- Dimension resizing with aspect-ratio locking.
- Interactive **before-and-after visual preview** with side-by-side and split-comparison sliders.

### 📄 PDF Visual Studio
- Dedicated PDF workspace (`/pdf-studio`) with visual page cards rendered via PDFium.
- **Drag-and-drop page reordering** with instant position updates.
- **Per-page rotation** (90° CW / CCW) and bulk rotation.
- **Page exclusion/deletion** with one-click restore.
- Export as merged PDF or extract every page as a high-resolution JPG packaged in a ZIP.

### ⚡ Power Tools & Productivity
- **Instant Snippet Paste**: Convert raw Markdown, JSON, CSV, or plain text to PDF/CSV/HTML directly from your clipboard without saving files to disk first.
- **Conversion History Drawer**: Slide-over drawer tracking your last 50 conversions in browser `localStorage` with instant re-download links.
- **Audio Completion Chimes**: Subtle, harmonic major-chord synthesizer cues on batch completion (customizable in Settings).
- **Progressive Web App (PWA)**: Installable as a standalone native desktop app on Chrome, Edge, and Safari with offline caching shell.
- **Command Palette (`Ctrl + K` or `/`)**: Quick-switch formats, jump to PDF Studio, search tools, or trigger conversions via keyboard shortcuts.
- **Smooth Dark / Light Modes**: Flawless system-adaptive theme toggle with smooth CSS-based color transitions.

### 📊 Documents, Spreadsheets & Data
- **Office Documents**: Headless LibreOffice integration converts DOCX $\to$ PDF/TXT and XLSX $\to$ PDF.
- **Spreadsheets**: Bi-directional conversion between XLSX, CSV, and JSON table structures.
- **Data Formats**: Structured conversions between JSON, YAML, and XML with safe indentation and entity injection protection.
- **Batch Processing**: Parallel file upload with ZIP packaging or individual downloads.

---

## Live Production Deployment

OmniConvert is deployed live and hosted on Render:

🔗 **[https://omniconvert-jzx7.onrender.com/](https://omniconvert-jzx7.onrender.com/)**

### 1-Click Render Blueprint
The repository includes [`render.yaml`](render.yaml) for automated Blueprint deployment:
1. Fork or push this repository to your GitHub account.
2. In [Render Dashboard](https://dashboard.render.com), click **New +** $\to$ **Blueprint**.
3. Select your repository. Render automatically provisions the Docker container on its Free Tier with automated health checks at `/api/v1/health`.

### 24/7 Keep-Alive (Zero Cold Starts)
Render's free tier spins down instances after 15 minutes of inactivity. To ensure 0-second instant response times:
- **Built-in GitHub Action**: A scheduled workflow [`.github/workflows/keep-alive.yml`](.github/workflows/keep-alive.yml) runs every 14 minutes to ping the `/api/v1/health` endpoint.
- **External Free Pingers**: You can also add `https://omniconvert-jzx7.onrender.com/api/v1/health` to a free monitoring service like [UptimeRobot](https://uptimerobot.com) or [Cron-Job.org](https://cron-job.org) set to a 10-minute interval.

---

## Architecture & Tech Stack

```text
Browser UI (React 19 + Vite + Tailwind CSS)
       │
       ▼ (REST HTTP / Multipart Form)
FastAPI Backend (Uvicorn / Python 3.12)
       │
       ├── Capabilities & Registry Discovery
       │      ├── Image Engine (Pillow, pillow-heif)
       │      ├── PDF Engine (PyMuPDF, pypdf, pypdfium2)
       │      ├── Document & Data (openpyxl, PyYAML, defusedxml)
       │      └── Native System CLI Adapters (LibreOffice, Pandoc, FFmpeg)
       │
       ▼
Isolated Temporary Storage (`backend/temp/{uuid}`)
       │
       ▼
Streaming File / Batch ZIP Download
```

### Frontend Stack
- **React 19** & **TypeScript** (Strict Mode)
- **Vite** with `@vitejs/plugin-react`
- **Tailwind CSS v4** & custom theme tokens
- **Lucide React** (modern iconography)
- **Service Worker** (`sw.js`) for PWA desktop installation

### Backend Stack
- **FastAPI** + **Uvicorn**
- **Pydantic v2** for type-safe validation schemas
- **PyMuPDF (`fitz`)** for high-fidelity text-to-PDF generation
- **pypdf** & **pypdfium2** for PDF rendering and manipulation
- **Pillow** & **pillow-heif** for image operations
- **openpyxl** for Excel workbook parsing
- **PyYAML** & **defusedxml** for safe structured data

---

## Local Development Quick Start

### Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **Python**: 3.11 or 3.12
- Optional: LibreOffice (`soffice`), Pandoc, or FFmpeg in your system `PATH`.

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
# Windows:
python -m venv .venv
.\.venv\Scripts\Activate.ps1
# Linux / macOS:
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server on port 8000
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Frontend Setup

In a separate terminal:

```bash
# Navigate to frontend
cd frontend

# Install packages
npm install

# Start Vite dev server
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## Running with Docker (Local or VPS)

Build and run the unified single-container production image locally:

```bash
# Build Docker image
docker build -t omniconvert .

# Run on port 8000
docker run -p 8000:8000 omniconvert
```

Access the app at `http://localhost:8000`.

---

## API Reference

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/v1/health` | `GET` | Health check returning status, version, and detected native tools |
| `/api/v1/formats` | `GET` | Matrix of supported source $\to$ target formats based on installed tools |
| `/api/v1/convert` | `POST` | Multipart upload for file conversions (single or batch) |
| `/api/v1/convert/{id}/download` | `GET` | Download processed file or batch ZIP archive |
| `/api/v1/pdf-studio/info` | `POST` | Inspects uploaded PDF and returns page count and dimensions |
| `/api/v1/pdf-studio/render-page` | `POST` | Renders a specific PDF page to high-res JPG for studio preview |
| `/api/v1/pdf-studio/export` | `POST` | Exports reordered, rotated, or filtered PDF |

---

## Testing & Quality Assurance

Run the automated backend test suite:

```bash
cd backend
.\.venv\Scripts\pytest -v
```

Run frontend typecheck and build validation:

```bash
cd frontend
npm run build
```

---

## License

Distributed under the **MIT License**. See `LICENSE` for details.
