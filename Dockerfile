# Production image: static build served by nginx. Local development still uses
# `npm run dev` (Vite dev server); this Dockerfile is not used for local dev.
#
# Vite bakes VITE_* variables into the JS bundle at build time, not at container
# runtime — the production API URL must be supplied as a build arg:
#   docker build --build-arg VITE_API_BASE_URL=https://api.your-production-domain .

FROM node:20-slim AS builder
WORKDIR /build

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY --from=builder /build/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
