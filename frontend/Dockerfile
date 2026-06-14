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
RUN echo "Build timestamp: $BUILD_TIMESTAMP" && yarn build

# ── Aşama 2: Nginx ile serv et ──────────────────────────────────
FROM nginx:1.25-alpine

# Build artifact'ını kopyala
COPY --from=builder /app/build /usr/share/nginx/html/

# Nginx konfigürasyonunu kopyala
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx logs'ları stdout/stderr'e yönlendir (container logs'ta görünsün)
RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

# Nginx config'i validate et
RUN nginx -t

# Build folder'ın varlığını kontrol et
RUN ls -la /usr/share/nginx/html/ && \
    [ -f /usr/share/nginx/html/index.html ] || (echo "ERROR: index.html not found!" && exit 1)

# Dosya izinleri kontrol et
RUN find /usr/share/nginx/html -type f -exec chmod 644 {} \; && \
    find /usr/share/nginx/html -type d -exec chmod 755 {} \;

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s \
    CMD wget -q --spider http://localhost || exit 1

CMD ["nginx", "-g", "daemon off;"]
