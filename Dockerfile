# Multi-stage Dockerfile: build React client and run Express backend

### Build client
FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm install
COPY client/ ./
RUN npm run build

### Build backend image
FROM node:18-alpine AS backend
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm install --production
COPY backend/ ./backend

# copy built client into backend for static serving
COPY --from=client-builder /app/client/build ./backend/client/build

WORKDIR /app/backend
ENV NODE_ENV=production
EXPOSE 4000
LABEL org.opencontainers.image.source="https://github.com/maxasop/CoreMatrix-Fitness"
LABEL org.opencontainers.image.license="MIT"

# Create a non-root user and run as that user
RUN addgroup -S app && adduser -S app -G app
RUN chown -R app:app /app
USER app

# Healthcheck: verifies the API is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
	CMD wget -qO- --no-check-certificate http://localhost:4000/api/health || exit 1

CMD ["node", "server.js"]
