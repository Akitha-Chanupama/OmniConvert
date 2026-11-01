# Implementation Plan: Production Hosting Readiness

## Overview
Prepare OmniConvert for public production hosting on modern container platforms (Railway, Render, Fly.io, or VPS) with unified single-container serving, periodic disk cleanup, upload size safeguards, React error boundary, Open Graph SEO metadata, and Docker infrastructure.

---

## Architecture & Work Breakdown

### Task 1: Docker & Container Infrastructure
- Create multi-stage `Dockerfile`:
  - **Stage 1 (Frontend Builder)**: Node.js 20/22 alpine/slim, builds Vite frontend to `/app/frontend/dist`.
  - **Stage 2 (Runtime Server)**: Python 3.12-slim with Debian binary dependencies:
    - `libreoffice-nogui` (for DOCX/XLSX/PPT conversions)
    - `pandoc` (for document/markdown engine)
    - `poppler-utils` (`pdftoppm` for PDF page extraction)
    - `libcairo2`, `libpango-1.0-0`, `libgdk-pixbuf-2.0-0`, `libffi-dev` (for WeasyPrint)
    - `libgl1` (for OpenCV/Pillow raster operations)
  - Copy frontend build into `/app/frontend_dist`.
  - Set default environment variables and run `uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}`.
- Create `docker-compose.yml` for local container testing and VPS orchestration.
- Create `.dockerignore` to ignore node_modules, .venv, temp, and cache.

### Task 2: Backend Unified Static Asset & SPA Serving
- In `backend/app/main.py`:
  - Support serving static files when `frontend_dist` (or `../frontend/dist`) exists.
  - Mount `/assets` static folder.
  - Add catch-all SPA route `/{full_path:path}` that serves `index.html` for any client route (`/tools`, `/settings`, `/pdf-studio`), while leaving all `/api/*` and `/docs` untouched.

### Task 3: Continuous Background Cleanup Loop in FastAPI Lifespan
- In `backend/app/main.py`:
  - In `lifespan(app: FastAPI)`:
    - Spawn a background `asyncio.Task` that sleeps for `CLEANUP_INTERVAL_MINUTES` and executes `cleanup_service.purge_expired_workspaces()`.
    - Gracefully cancel the background task during shutdown.

### Task 4: Upload Size Validation in PDF Studio
- In `backend/app/api/pdf_studio.py`:
  - Check file size against `config.max_upload_size_bytes` before extracting thumbnails.
  - Reject oversized uploads with `413 Request Entity Too Large` or `400 Bad Request`.

### Task 5: React Error Boundary
- Create `frontend/src/components/ErrorBoundary.tsx`:
  - Catches runtime rendering errors.
  - Displays user-friendly recovery UI with "Try Again", "Reload Application", and "Back to Dashboard" buttons.
  - Shows collapsible error stack in development mode.
- Wrap `<App />` with `<ErrorBoundary>` in `frontend/src/main.tsx`.

### Task 6: Open Graph (OG), Twitter Card & Theme Meta Tags
- Update `frontend/index.html`:
  - Add `og:title`, `og:description`, `og:image`, `og:url`, `og:type="website"`.
  - Add `twitter:card="summary_large_image"`, `twitter:title`, `twitter:description`.
  - Add dynamic `theme-color` meta tags for light (`#f8fafc`) and dark (`#070b16`) modes.

### Task 7: Production Configuration & Deployment Guide
- Create root `.env.example` documenting all configuration options (`PORT`, `HOST`, `APP_MODE`, `MAX_UPLOAD_SIZE_MB`, `CORS_ORIGINS`).
- Update `README.md` with a clean "Production Deployment" section covering Railway, Render, and Docker Compose.

---

## Verification Plan
1. Backend pytest suite passes 100% (`cd backend; pytest`).
2. Frontend production build passes with 0 errors (`cd frontend; npm run build`).
3. Verify SPA fallback routing and static file serving.
4. Verify ErrorBoundary rendering in React.
5. Create GitHub PR targeting `dev`, merge to `dev`, and sync to `main`.
