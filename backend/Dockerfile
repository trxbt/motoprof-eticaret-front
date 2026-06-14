FROM python:3.11-slim

WORKDIR /app

# Sistem bağımlılıkları
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc curl libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Bağımlılıkları önce kopyala (Docker layer cache)
COPY requirements.prod.txt .
RUN pip install --no-cache-dir -r requirements.prod.txt

# Tüm uygulama kodunu kopyala (modüler yapı)
COPY . .

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:8001/api/ || exit 1

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "2"]
