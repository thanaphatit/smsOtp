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
# Stage 2: Serve the built assets with Nginx
# ============================================================
FROM nginx:alpine AS production

# นำไฟล์ที่ Build เสร็จแล้วจาก Stage 1 มาใส่ในโฟลเดอร์สำหรับให้บริการเว็บของ Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# เปิดพอร์ต 80 ภายใน Container
EXPOSE 80

# สั่งให้ Nginx รันค้างไว้เบื้องหลัง
CMD ["nginx", "-g", "daemon off;"]