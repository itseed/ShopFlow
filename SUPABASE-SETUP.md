# Supabase Setup Guide

คู่มือตั้งค่า Supabase สำหรับ ShopFlow

## 📋 สารบัญ

1. [Supabase Cloud Setup](#supabase-cloud-setup)
2. [Supabase Local Setup](#supabase-local-setup)
3. [Database Migration](#database-migration)
4. [Environment Variables](#environment-variables)
5. [Troubleshooting](#troubleshooting)

## Supabase Cloud Setup

### ขั้นตอนที่ 1: สร้าง Supabase Project

1. ไปที่ [supabase.com](https://supabase.com)
2. สร้าง account (ฟรี)
3. คลิก **New Project**
4. กรอกข้อมูล:
   - **Name**: ShopFlow (หรือชื่อที่ต้องการ)
   - **Database Password**: ตั้งรหัสผ่านที่แข็งแรง
   - **Region**: เลือก region ที่ใกล้ที่สุด
5. คลิก **Create new project**
6. รอให้ project สร้างเสร็จ (ประมาณ 2 นาที)

### ขั้นตอนที่ 2: รับ API Keys

1. ไปที่ **Settings > API**
2. คัดลอกข้อมูลต่อไปนี้:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...`
   - **service_role key**: `eyJhbGc...` (⚠️ เก็บเป็นความลับ!)

### ขั้นตอนที่ 3: ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` ใน root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### ขั้นตอนที่ 4: รัน Database Migration

1. ไปที่ **SQL Editor** ใน Supabase Dashboard
2. เปิดไฟล์ `migrate/init.sql`
3. คัดลอก SQL ทั้งหมด
4. วางใน SQL Editor
5. คลิก **Run** หรือกด `Ctrl+Enter`
6. รอให้ migration เสร็จ

### ขั้นตอนที่ 5: ตรวจสอบ

```bash
# ทดสอบ connection
npm run dev:cms
# เปิด http://localhost:3001
```

## Supabase Local Setup

### Prerequisites

- Docker และ Docker Compose
- Port 5432 ว่าง

### ขั้นตอนที่ 1: ใช้ Setup Script

```bash
./scripts/setup-supabase.sh
# เลือกตัวเลือก 2 (Supabase Local)
```

### ขั้นตอนที่ 2: Manual Setup

```bash
# Start Supabase container
docker-compose -f docker-compose.production.yml up -d supabase

# รอให้ database พร้อม (ประมาณ 10 วินาที)
sleep 10

# รัน migration
./scripts/init-db.sh
```

### ขั้นตอนที่ 3: ตั้งค่า Environment Variables

สำหรับ Local Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
POSTGRES_DB=shopflow
POSTGRES_USER=postgres
POSTGRES_PASSWORD=shopflow123
```

## Database Migration

### รัน Migration

#### วิธีที่ 1: ใช้ Script (แนะนำ)

```bash
./scripts/init-db.sh
```

#### วิธีที่ 2: Manual

**สำหรับ Supabase Cloud:**
1. ไปที่ SQL Editor
2. เปิดไฟล์ `migrate/init.sql`
3. คัดลอกและรัน

**สำหรับ Supabase Local:**
```bash
psql -h localhost -U postgres -d shopflow -f migrate/init.sql
```

### ตรวจสอบ Migration

```sql
-- ตรวจสอบ tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- ควรเห็น tables:
-- branches, categories, customers, orders, order_items, 
-- payments, products, system_settings, user_profiles, etc.
```

## Environment Variables

### สำหรับ CMS Web

```bash
# apps/cms-web/.env.local
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### สำหรับ POS Frontend

```bash
# apps/pos-frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Security Notes

⚠️ **สำคัญ**:
- อย่า commit `.env.local` ลง Git
- `SUPABASE_SERVICE_ROLE_KEY` มีสิทธิ์ admin - เก็บเป็นความลับ!
- ใช้ `anon key` สำหรับ client-side code เท่านั้น

## Troubleshooting

### ปัญหา: Cannot connect to Supabase

**ตรวจสอบ**:
1. Environment variables ถูกต้องหรือไม่
2. Supabase project ยัง active อยู่หรือไม่
3. Network connection ทำงานหรือไม่

**วิธีแก้**:
```bash
# ทดสอบ connection
curl https://your-project.supabase.co/rest/v1/
```

### ปัญหา: Migration fails

**สาเหตุ**: 
- Tables มีอยู่แล้ว
- Foreign key constraints
- Permission issues

**วิธีแก้**:
```sql
-- ตรวจสอบ existing tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Drop และสร้างใหม่ (ระวัง! จะลบข้อมูลทั้งหมด)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

### ปัญหา: RLS (Row Level Security) errors

**สาเหตุ**: Supabase มี RLS enabled โดย default

**วิธีแก้**:
```sql
-- ตรวจสอบ RLS policies
SELECT * FROM pg_policies WHERE tablename = 'products';

-- Disable RLS (สำหรับ development เท่านั้น)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- หรือสร้าง policies ที่เหมาะสม
CREATE POLICY "Enable read access for all users" 
ON products FOR SELECT 
USING (true);
```

### ปัญหา: Port 5432 already in use

**สาเหตุ**: มี PostgreSQL หรือ Supabase instance อื่นรันอยู่

**วิธีแก้**:
```bash
# หา process ที่ใช้ port 5432
lsof -i :5432

# หยุด process
kill -9 <PID>

# หรือเปลี่ยน port ใน docker-compose.yml
POSTGRES_PORT=5433
```

## Best Practices

1. **Development**: ใช้ Supabase Local
2. **Production**: ใช้ Supabase Cloud
3. **Backup**: Backup database เป็นประจำ
4. **Migration**: ทดสอบ migration ใน development ก่อน
5. **Security**: ใช้ environment variables สำหรับ secrets

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [ShopFlow Database Schema](./DATABASE-SCHEMA.md)

---

**Happy Coding! 🚀**

