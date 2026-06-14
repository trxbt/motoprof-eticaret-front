# ── Aşama 1: Build ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN yarn install --network-timeout 300000

COPY . .

# Build sırasında REACT_APP_BACKEND_URL inject et
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Build cache invalidation - her push'ta yeni build
ARG BUILD_TIMESTAMP=unknown
RUN echo "Build timestamp: $BUILD_TIMESTAMP" && \
    yarn build && \
    echo "Build completed at $(date)" && \
    ls -la /app/build/ | head -20

# ── Aşama 2: Nginx ile serv et ──────────────────────────────────
FROM nginx:1.25-alpine

# Build artifact'ını kopyala - force invalidation
COPY --from=builder /app/build /usr/share/nginx/html/

# Verification: Build folder kontrolü
RUN echo "=== Checking build artifacts ===" && \
    ls -la /usr/share/nginx/html/ && \
    echo "=== Checking index.html ===" && \
    [ -f /usr/share/nginx/html/index.html ] && echo "✓ index.html found" || (echo "✗ ERROR: index.html NOT FOUND" && exit 1) && \
    echo "=== File permissions ===" && \
    stat /usr/share/nginx/html/index.html

# Nginx konfigürasyonunu kopyala
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx logs'ları stdout/stderr'e yönlendir
RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

# Dosya izinleri kontrol ve düzelt
RUN find /usr/share/nginx/html -type f -exec chmod 644 {} \; && \
    find /usr/share/nginx/html -type d -exec chmod 755 {} \; && \
    echo "✓ File permissions fixed"

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s \
    CMD wget -q --spider http://localhost || exit 1

CMD ["nginx", "-g", "daemon off;"]
