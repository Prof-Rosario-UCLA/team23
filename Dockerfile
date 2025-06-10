# ── Stage 1: build frontend ─────────────────────
FROM node:18-alpine AS frontend-builder
WORKDIR /frontend
COPY flashmind-ui/package*.json ./
RUN npm ci
COPY flashmind-ui/ .
RUN npm run build

# ── Stage 2: build/backend & copy frontend ──────
FROM node:18-alpine AS backend
WORKDIR /app
COPY flashmind-app/package*.json ./
RUN npm ci --production
COPY flashmind-app/ .
# copy built frontend into backend container
COPY --from=frontend-builder /frontend/dist ./frontend/dist

RUN npm run build       # tsc → dist/

# ── Final image ────────────────────────────────
FROM node:18-alpine
WORKDIR /app
COPY --from=backend /app/package*.json ./
COPY --from=backend /app/dist ./dist
COPY --from=backend /app/frontend/dist ./frontend/dist
RUN npm ci --production
EXPOSE 3001
CMD ["node", "dist/server.js"]
