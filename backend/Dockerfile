# ============================================================
# Stage 1: Build
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source
COPY tsconfig.json ./
COPY src/ ./src/

# Build TypeScript
RUN npx tsc

# ============================================================
# Stage 2: Production
# ============================================================
FROM node:20-alpine AS production

WORKDIR /app

# Install only production dependencies
COPY package.json ./
RUN npm install --omit=dev

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Copy .sequelizerc and migration files
COPY .sequelizerc ./
COPY src/config/config.js ./src/config/config.js
COPY src/migrations/ ./src/migrations/
COPY src/seeders/ ./src/seeders/

EXPOSE 3000

CMD ["node", "dist/server.js"]