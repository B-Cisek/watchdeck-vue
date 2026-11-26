# syntax=docker/dockerfile:1

# ---- build ----
FROM node:24-slim AS build
WORKDIR /app
# bun installs deps (bun.lock); node runs vite / vue-tsc.
COPY --from=oven/bun:1 /usr/local/bin/bun /usr/local/bin/bun

# Dependencies first, so this layer is cached until the lockfile changes.
COPY package.json bun.lock ./
RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# Vite inlines VITE_* at build time. The API sits on the same origin under /api
# (Traefik routes it to the backend), so session cookies work without CORS.
ENV VITE_APP_ENV=production \
    VITE_API_URL=/api

COPY . .
RUN bun run build

# ---- runtime ----
FROM nginxinc/nginx-unprivileged:1-alpine AS runtime
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
