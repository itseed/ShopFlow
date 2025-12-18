# ShopFlow Quick Start Guide

คู่มือเริ่มต้นใช้งาน ShopFlow อย่างรวดเร็ว

## ⚡ Quick Start (5 นาที)

### วิธีที่เร็วที่สุด: Docker

```bash
# 1. Clone repository
git clone https://github.com/your-org/ShopFlow.git
cd ShopFlow

# 2. Quick start
./scripts/quick-start.sh
# เลือกตัวเลือก 1 (Docker)

# 3. เปิด browser
# CMS: http://localhost:3001
# POS: http://localhost:3000
```

เสร็จแล้ว! 🎉

## 📝 ขั้นตอนแบบละเอียด

### 1. Prerequisites

ตรวจสอบว่ามี:
- ✅ Node.js 18+
- ✅ Docker (สำหรับ quick start)
- ✅ Git

### 2. Clone & Install

```bash
git clone https://github.com/your-org/ShopFlow.git
cd ShopFlow
npm install
```

### 3. Setup Environment

```bash
# ใช้ setup script
./scripts/setup-supabase.sh

# หรือสร้าง .env.local เอง
cp .env.example .env.local
# แก้ไข .env.local ด้วย Supabase credentials
```

### 4. Initialize Database

```bash
# รัน database migration
./scripts/init-db.sh
```

### 5. Build (สำหรับ Production เท่านั้น)

```bash
# Build ทั้งหมด
npm run build --workspaces

# หรือ build แยก
npm run build --workspace=cms-web
npm run build --workspace=pos-frontend
```

### 6. Start Applications

```bash
# วิธีที่ 1: Docker (แนะนำสำหรับ Production)
docker-compose -f docker-compose.production.yml up -d

# วิธีที่ 2: Development mode
npm run dev:cms   # Terminal 1
npm run dev:pos  # Terminal 2

# วิธีที่ 3: Production mode (หลัง build)
npm run start --workspace=cms-web   # Terminal 1
npm run start --workspace=pos-frontend  # Terminal 2
```

### 6. Access Applications

- **CMS Web**: http://localhost:3001
- **POS Frontend**: http://localhost:3000

## 🎯 Next Steps

1. **Login**: ใช้ admin account ที่สร้างใน Supabase
2. **Setup Branch**: สร้าง branch แรก
3. **Add Products**: เพิ่มสินค้าและหมวดหมู่
4. **Test POS**: ทดสอบการขาย

## 🆘 Need Help?

- 📖 [Full Installation Guide](./INSTALLATION.md)
- 🔧 [Troubleshooting](./TROUBLESHOOTING.md)
- 📚 [Documentation](./README.md#-documentation)

---

**Ready to go! 🚀**

