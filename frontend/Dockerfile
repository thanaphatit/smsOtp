# ============================================================
# Stage 1: Build frontend assets
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source
COPY . .

# Build
RUN npm run build

# ============================================================
# Stage 2: Just hold the built assets
# ============================================================
FROM alpine:3.19 AS production

# We only need the dist output
COPY --from=builder /app/dist /app/dist

# This container just holds the built assets
VOLUME /app/dist