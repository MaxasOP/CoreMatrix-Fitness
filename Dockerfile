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
CMD ["node", "server.js"]
