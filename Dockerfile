# ==========================================
# OmniConvert Production Multi-Stage Dockerfile
# Combines React Frontend & FastAPI Engine into
# a high-performance, single-container deployment.
# ==========================================

# --- Stage 1: Build Frontend Assets ---
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# --- Stage 2: Production Python Engine ---
FROM python:3.12-slim
WORKDIR /app

# Prevent Python from writing .pyc files & enable unbuffered stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install native system binaries & converter engines
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libreoffice-nogui \
    pandoc \
    poppler-utils \
    ffmpeg \
    libcairo2 \
    libpango-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    libffi-dev \
    libgl1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend Application source
COPY backend/ ./

# Copy compiled frontend from Stage 1 into frontend_dist
COPY --from=frontend-builder /app/frontend/dist ./frontend_dist

# Default Production Configuration
ENV HOST=0.0.0.0
ENV PORT=8000
ENV APP_MODE=hosted
ENV ALLOW_ALL_ORIGINS=true

EXPOSE 8000

# Healthcheck for container orchestrators (Railway, Render, Docker Swarm, K8s)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8000}/api/v1/health || exit 1

# Start Uvicorn bound to dynamic cloud $PORT
CMD ["sh", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
