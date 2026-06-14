# ── Aşama 1: Build ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN yarn install --network-timeout 300000

COPY . .

# Build sırasında REACT_APP_BACKEND_URL inject et
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

RUN yarn build

# ── Aşama 2: Nginx ile serv et ──────────────────────────────────
FROM nginx:1.25-alpine

# Build artifact'ını kopyala
COPY --from=builder /app/build /usr/share/nginx/html/

# Nginx konfigürasyonunu kopyala
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build folder'ın varlığını kontrol et
RUN ls -la /usr/share/nginx/html/ && \
    [ -f /usr/share/nginx/html/index.html ] || (echo "ERROR: index.html not found!" && exit 1)

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s \
    CMD wget -q --spider http://localhost || exit 1

CMD ["nginx", "-g", "daemon off;"]
