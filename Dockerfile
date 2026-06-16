# Multi-stage Dockerfile: run Express backend

### Build backend image
FROM node:18-alpine AS backend
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm install --production
COPY backend/ ./backend

# Create empty client build directory to satisfy express fallback checks
RUN mkdir -p /app/client/build

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
