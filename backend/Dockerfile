FROM python:3.11-slim

WORKDIR /app

# libsndfile1: required by soundfile; ffmpeg: demucs / audio tooling; build-essential: some wheels compile extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 \
    ffmpeg \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip && pip install --no-cache-dir -r requirements.txt

COPY . /app/

ENV PORT=8000
EXPOSE 8000

# Use $PORT if set by Cloud Run, fallback to 8000 for local
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}"]
