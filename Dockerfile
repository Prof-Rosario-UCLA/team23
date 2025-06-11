# ── Stage 1: build frontend ─────────────────────
FROM node:18-alpine AS frontend-builder
WORKDIR /frontend
COPY flashmind-ui/package*.json ./
RUN npm ci
COPY flashmind-ui/ .
RUN npm run build

# ── Stage 2: build/backend & copy frontend ──────
FROM node:18-alpine AS backend-builder
WORKDIR /app
# install *all* deps so we can build
COPY flashmind-app/package*.json ./
RUN npm ci
COPY flashmind-app/ .
# copy built frontend assets into the backend source tree
COPY --from=frontend-builder /frontend/dist ./frontend/dist
# run TS compile (now tsc is available)
RUN npm run build   # emits /app/dist

# ── Stage 3: production image ───────────────────
FROM node:18-alpine
WORKDIR /app
# only install prod deps
COPY flashmind-app/package*.json ./
RUN npm ci --production
# copy compiled server and static frontend
COPY --from=backend-builder /app/dist        ./dist
COPY --from=backend-builder /app/frontend/dist ./frontend/dist
EXPOSE 3001
CMD ["node", "dist/server.js"]
