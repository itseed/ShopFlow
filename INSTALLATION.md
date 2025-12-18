# คู่มือติดตั้ง ShopFlow

คู่มือติดตั้งระบบ POS และ CMS สำหรับ ShopFlow

## 📋 สารบัญ

1. [ความต้องการของระบบ](#ความต้องการของระบบ)
2. [การติดตั้งแบบรวดเร็ว](#การติดตั้งแบบรวดเร็ว)
3. [การติดตั้งแบบละเอียด](#การติดตั้งแบบละเอียด)
4. [การตั้งค่า Supabase](#การตั้งค่า-supabase)
5. [การรันระบบ](#การรันระบบ)
6. [การแก้ไขปัญหา](#การแก้ไขปัญหา)

## ความต้องการของระบบ

### ความต้องการขั้นต่ำ

- **Node.js**: เวอร์ชัน 18 หรือสูงกว่า
- **npm**: เวอร์ชัน 9 หรือสูงกว่า
- **Docker**: เวอร์ชัน 20 หรือสูงกว่า (แนะนำสำหรับ production)
- **Git**: สำหรับ clone repository

### สำหรับ Development

- **Supabase Account**: สำหรับใช้ Supabase Cloud (ฟรี)
- หรือ **Docker**: สำหรับรัน Supabase Local

## การติดตั้งแบบรวดเร็ว

### วิธีที่ 1: ใช้ Docker (แนะนำ)

```bash
# Clone repository
git clone https://github.com/your-org/ShopFlow.git
cd ShopFlow

# Quick start with Docker
./scripts/quick-start.sh
# เลือกตัวเลือก 1 (Docker)

# ระบบจะรันที่:
# - CMS Web: http://localhost:3001
# - POS Frontend: http://localhost:3000
```

### วิธีที่ 2: ใช้ Installation Script

```bash
# Clone repository
git clone https://github.com/your-org/ShopFlow.git
cd ShopFlow

# รัน installation script
./scripts/install.sh

# ตามคำแนะนำบนหน้าจอ
```

## การติดตั้งแบบละเอียด

### ขั้นตอนที่ 1: Clone Repository

```bash
git clone https://github.com/your-org/ShopFlow.git
cd ShopFlow
```

### ขั้นตอนที่ 2: ติดตั้ง Dependencies

```bash
# ติดตั้ง dependencies ทั้งหมด
npm install

# ติดตั้ง dependencies สำหรับทุก workspace
npm install --workspaces
```

### ขั้นตอนที่ 3: ตั้งค่า Environment Variables

#### สำหรับ CMS Web

```bash
# คัดลอก template
cp apps/cms-web/.env.example apps/cms-web/.env.local

# แก้ไขไฟล์ .env.local ด้วย Supabase credentials ของคุณ
nano apps/cms-web/.env.local
```

#### สำหรับ POS Frontend

```bash
# คัดลอก template
cp apps/pos-frontend/.env.example apps/pos-frontend/.env.local

# แก้ไขไฟล์ .env.local ด้วย Supabase credentials ของคุณ
nano apps/pos-frontend/.env.local
```

### ขั้นตอนที่ 4: ตั้งค่า Supabase

ดูรายละเอียดใน [การตั้งค่า Supabase](#การตั้งค่า-supabase)

### ขั้นตอนที่ 5: Build Packages (สำหรับ Production)

```bash
# Build ทั้งหมด
npm run build --workspaces

# หรือ build แยก
npm run build --workspace=@shopflow/api
npm run build --workspace=cms-web
npm run build --workspace=pos-frontend
```

**หมายเหตุ**: สำหรับ development ไม่จำเป็นต้อง build ก่อน สามารถรัน `npm run dev` ได้เลย

## การตั้งค่า Supabase

### ตัวเลือกที่ 1: Supabase Cloud (แนะนำสำหรับ Production)

1. สร้าง account ที่ [supabase.com](https://supabase.com)
2. สร้าง project ใหม่
3. ไปที่ **Settings > API**
4. คัดลอก **Project URL** และ **anon key**
5. ไปที่ **SQL Editor**
6. เปิดไฟล์ `migrate/init.sql` และรัน SQL ทั้งหมด
7. ตั้งค่า environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### ตัวเลือกที่ 2: Supabase Local (แนะนำสำหรับ Development)

```bash
# ใช้ setup script
./scripts/setup-supabase.sh
# เลือกตัวเลือก 2 (Supabase Local)

# หรือใช้ Docker Compose
docker-compose -f docker-compose.production.yml up -d supabase

# รัน database migration
./scripts/init-db.sh
```

## การรันระบบ

### Development Mode

```bash
# รัน CMS Web (port 3001)
npm run dev:cms

# รัน POS Frontend (port 3000)
npm run dev:pos

# หรือรันทั้งสองพร้อมกัน (ใน terminal แยกกัน)
```

### Production Mode (Docker)

```bash
# Build และ start containers
docker-compose -f docker-compose.production.yml up --build -d

# ดู logs
docker-compose -f docker-compose.production.yml logs -f

# หยุด containers
docker-compose -f docker-compose.production.yml down
```

### Production Mode (Manual)

```bash
# Build applications
npm run build:cms
npm run build:pos

# Start applications
cd apps/cms-web && npm start
cd apps/pos-frontend && npm start
```

## การแก้ไขปัญหา

### ปัญหา: Cannot connect to database

**สาเหตุ**: Environment variables ไม่ถูกต้องหรือ database ยังไม่ได้ setup

**วิธีแก้**:
1. ตรวจสอบ `.env.local` ว่ามี Supabase URL และ key ถูกต้อง
2. ตรวจสอบว่า database migration รันแล้ว
3. ตรวจสอบ network connection

### ปัญหา: TypeScript errors

**สาเหตุ**: Type definitions ไม่ตรงกัน

**วิธีแก้**:
```bash
# รัน type check
npm run type-check --workspaces

# Build packages ใหม่
npm run build --workspace=packages/api
npm run build --workspace=packages/types
```

### ปัญหา: Build fails

**สาเหตุ**: Dependencies ไม่ครบหรือ version ไม่ตรงกัน

**วิธีแก้**:
```bash
# ลบ node_modules และติดตั้งใหม่
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
npm install --workspaces
```

### ปัญหา: Docker containers ไม่ start

**สาเหตุ**: Ports ถูกใช้งานแล้วหรือ Docker daemon ไม่ทำงาน

**วิธีแก้**:
1. ตรวจสอบว่า ports 3000, 3001, 5432 ว่าง
2. ตรวจสอบว่า Docker daemon ทำงานอยู่
3. ดู logs: `docker-compose -f docker-compose.production.yml logs`

## ขั้นตอนถัดไป

หลังจากติดตั้งเสร็จ:

1. **ตั้งค่า User Account**: สร้าง admin user ใน Supabase
2. **ตั้งค่า Branch**: สร้าง branch แรกในระบบ
3. **เพิ่ม Products**: เพิ่มสินค้าและหมวดหมู่
4. **ทดสอบ POS**: ทดสอบการขายและชำระเงิน

## ข้อมูลเพิ่มเติม

- [Quick Start Guide](./QUICK-START.md)
- [Supabase Setup Guide](./SUPABASE-SETUP.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [README](./README.md)

## การสนับสนุน

หากพบปัญหาหรือมีคำถาม:

1. ตรวจสอบ [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. เปิด issue ใน GitHub repository
3. ดู documentation เพิ่มเติม:
   - [Supabase Setup Guide](./SUPABASE-SETUP.md)
   - [Database Schema](./DATABASE-SCHEMA.md)
   - [Troubleshooting Guide](./TROUBLESHOOTING.md)

---

**Happy Coding! 🚀**

