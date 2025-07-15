# apps/pos-frontend/Dockerfile (ใช้เหมือนกันสำหรับ apps/cms-web/Dockerfile โดยเปลี่ยน path และ workspace)

# --- Stage 1: Build the Next.js application ---
# ใช้ Node.js เวอร์ชัน 18 (alpine เป็นเวอร์ชันที่เบา) สำหรับการ Build
FROM node:18-alpine AS builder

# กำหนด Working Directory ภายใน Container
WORKDIR /app

# Copy ไฟล์ package manager ที่ Root ของ Monorepo (npm, yarn, pnpm)
# ปรับตาม Package Manager ที่คุณใช้
COPY package.json yarn.lock* pnpm-lock.yaml* ./
COPY tsconfig.json ./

# Copy ไฟล์และโค้ดของ Application เฉพาะ
# สำหรับ apps/pos-frontend/Dockerfile:
COPY apps/pos-frontend/package.json ./apps/pos-frontend/
COPY apps/pos-frontend/tsconfig.json ./apps/pos-frontend/
COPY apps/pos-frontend/next.config.js ./apps/pos-frontend/
COPY apps/pos-frontend/src ./apps/pos-frontend/src
COPY apps/pos-frontend/public ./apps/pos-frontend/public

# Copy Shared Packages (ตามโครงสร้าง packages/ ที่เราคุยกัน)
# ตรวจสอบให้แน่ใจว่าได้ Copy ทุก packages ที่ app นี้ใช้งาน
COPY packages/ui ./packages/ui
COPY packages/types ./packages/types
COPY packages/utils ./packages/utils
# หากมี packages อื่นๆ เพิ่มเติม ให้ Copy ที่นี่ด้วย:
# COPY packages/<your-other-package> ./packages/<your-other-package>

# ติดตั้ง Dependencies ที่ Root (ใช้สำหรับ Monorepo Workspaces)
RUN npm install

# Build Next.js Application ที่เฉพาะเจาะจง (POS หรือ CMS)
WORKDIR /app/apps/pos-frontend # *** เปลี่ยนเป็น /app/apps/cms-web สำหรับ CMS Dockerfile ***
RUN npm run build

# --- Stage 2: Run the Next.js application (Leaner Image for Production) ---
# ใช้ Node.js เวอร์ชันเดิม แต่ Image ที่เบากว่าสำหรับรันจริง
FROM node:18-alpine AS runner

# กำหนด Working Directory ภายใน Container
WORKDIR /app

# Copy ไฟล์ที่จำเป็นสำหรับการรันจาก Stage 'builder'
COPY --from=builder /app/apps/pos-frontend/.next ./apps/pos-frontend/.next # *** เปลี่ยน path สำหรับ CMS ***
COPY --from=builder /app/apps/pos-frontend/node_modules ./apps/pos-frontend/node_modules # *** เปลี่ยน path สำหรับ CMS ***
COPY --from=builder /app/apps/pos-frontend/package.json ./apps/pos-frontend/package.json # *** เปลี่ยน path สำหรับ CMS ***
COPY --from=builder /app/apps/pos-frontend/public ./apps/pos-frontend/public # *** เปลี่ยน path สำหรับ CMS ***

# ตั้งค่า Environment Variables สำหรับ Production
ENV NODE_ENV production
ENV PORT 3000 # Next.js จะ listen ที่พอร์ตนี้ภายใน Container

# Expose พอร์ตที่ Next.js App รันอยู่
EXPOSE 3000

# คำสั่งสำหรับรัน Next.js App ใน Production Mode
CMD ["npm", "start", "--workspace", "apps/pos-frontend"] # *** เปลี่ยนเป็น apps/cms-web สำหรับ CMS Dockerfile ***