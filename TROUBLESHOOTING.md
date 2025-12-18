# ShopFlow Troubleshooting Guide

คู่มือแก้ไขปัญหาที่พบบ่อยใน ShopFlow

## 📋 สารบัญ

1. [Build Issues](#build-issues)
2. [Database Issues](#database-issues)
3. [Runtime Errors](#runtime-errors)
4. [Docker Issues](#docker-issues)
5. [Performance Issues](#performance-issues)

## Build Issues

### TypeScript Compilation Errors

**อาการ**: `npm run build` หรือ `npm run type-check` fails

**วิธีแก้**:
```bash
# 1. Clear TypeScript cache
rm -rf apps/*/tsconfig.tsbuildinfo
rm -rf packages/*/tsconfig.tsbuildinfo

# 2. Rebuild packages
npm run build --workspace=packages/api
npm run build --workspace=packages/types

# 3. Run type check
npm run type-check --workspaces
```

**ปัญหาที่พบบ่อย**:
- `Property 'X' does not exist on type 'Y'` → ตรวจสอบ type definitions
- `Cannot find module '@shopflow/api'` → รัน `npm install` ใหม่
- `Unexpected any` → แก้ไข type annotations

### ESLint Errors

**อาการ**: `npm run lint` fails

**วิธีแก้**:
```bash
# Auto-fix (ถ้าเป็นไปได้)
npm run lint --workspaces -- --fix

# ตรวจสอบ errors
npm run lint --workspaces
```

**ปัญหาที่พบบ่อย**:
- `Unused variable` → ลบหรือ prefix ด้วย `_`
- `Missing dependencies in useEffect` → เพิ่ม dependencies
- `Prefer const` → เปลี่ยน `let` เป็น `const`

### Build Fails

**อาการ**: `npm run build` fails

**วิธีแก้**:
```bash
# 1. Clean build
rm -rf apps/*/.next
rm -rf apps/*/dist
rm -rf packages/*/dist

# 2. Reinstall dependencies
rm -rf node_modules
npm install
npm install --workspaces

# 3. Build again
npm run build --workspaces
```

## Database Issues

### Cannot Connect to Database

**อาการ**: `Error: Failed to connect to database`

**วิธีแก้**:
1. ตรวจสอบ environment variables:
```bash
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

2. ทดสอบ connection:
```bash
# สำหรับ Supabase Cloud
curl https://your-project.supabase.co/rest/v1/

# สำหรับ Supabase Local
psql -h localhost -U postgres -d shopflow -c "SELECT 1;"
```

3. ตรวจสอบ network/firewall

### Row Level Security (RLS) Errors

**อาการ**: `new row violates row-level security policy`

**วิธีแก้**:
```sql
-- ตรวจสอบ policies
SELECT * FROM pg_policies WHERE tablename = 'products';

-- Disable RLS (development only)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- หรือสร้าง policy
CREATE POLICY "Enable all operations for authenticated users"
ON products FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

### Migration Errors

**อาการ**: Migration script fails

**วิธีแก้**:
1. ตรวจสอบว่า tables มีอยู่แล้วหรือไม่:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

2. ใช้ `IF NOT EXISTS` ใน migration scripts

3. รัน migration ทีละส่วน

## Runtime Errors

### Application Crashes on Start

**อาการ**: Application ไม่ start หรือ crash ทันที

**วิธีแก้**:
1. ตรวจสอบ logs:
```bash
# Docker
docker-compose logs cms-web
docker-compose logs pos-frontend

# Development
npm run dev:cms 2>&1 | tee cms.log
```

2. ตรวจสอบ environment variables

3. ตรวจสอบ database connection

### API Errors

**อาการ**: API calls return errors

**วิธีแก้**:
1. ตรวจสอบ network tab ใน browser DevTools
2. ตรวจสอบ Supabase logs:
   - Supabase Dashboard > Logs > API Logs
3. ตรวจสอบ RLS policies

### Authentication Errors

**อาการ**: Cannot login หรือ session expires

**วิธีแก้**:
1. ตรวจสอบ Supabase Auth settings
2. ตรวจสอบ environment variables
3. Clear browser cache และ cookies
4. ตรวจสอบ session storage

## Docker Issues

### Containers Won't Start

**อาการ**: `docker-compose up` fails

**วิธีแก้**:
```bash
# 1. ตรวจสอบ logs
docker-compose logs

# 2. Rebuild containers
docker-compose build --no-cache

# 3. Remove และสร้างใหม่
docker-compose down -v
docker-compose up --build
```

### Port Already in Use

**อาการ**: `Error: port is already allocated`

**วิธีแก้**:
```bash
# หา process ที่ใช้ port
lsof -i :3000
lsof -i :3001
lsof -i :5432

# หยุด process
kill -9 <PID>

# หรือเปลี่ยน port ใน docker-compose.yml
```

### Health Check Fails

**อาการ**: Container health check fails

**วิธีแก้**:
1. ตรวจสอบว่า application start แล้ว:
```bash
docker exec shopflow-cms curl http://localhost:3001/api/health
```

2. ตรวจสอบ logs:
```bash
docker-compose logs cms-web
```

3. เพิ่ม start_period ใน healthcheck

## Performance Issues

### Slow Page Load

**อาการ**: หน้าเว็บโหลดช้า

**วิธีแก้**:
1. ตรวจสอบ database queries:
   - ใช้ indexes
   - Optimize queries
   - ใช้ pagination

2. ตรวจสอบ bundle size:
```bash
npm run build
# ดูขนาดไฟล์ใน .next/
```

3. ใช้ code splitting และ lazy loading

### High Memory Usage

**อาการ**: Application ใช้ memory มาก

**วิธีแก้**:
1. ตรวจสอบ memory leaks:
   - ใช้ React DevTools Profiler
   - ตรวจสอบ event listeners
   - ตรวจสอบ subscriptions

2. Optimize images และ assets

3. ใช้ pagination สำหรับ large lists

## Getting Help

หากยังแก้ปัญหาไม่ได้:

1. **ตรวจสอบ Logs**:
   - Application logs
   - Docker logs
   - Browser console
   - Supabase logs

2. **Search Issues**:
   - GitHub Issues
   - Stack Overflow
   - Supabase Community

3. **Create Issue**:
   - ระบุ error message
   - ระบุ steps to reproduce
   - ระบุ environment (OS, Node version, etc.)
   - ระบุ logs และ screenshots

## Common Commands

```bash
# Type checking
npm run type-check --workspaces

# Linting
npm run lint --workspaces

# Building
npm run build --workspaces

# Docker
docker-compose up -d
docker-compose logs -f
docker-compose down

# Database
./scripts/init-db.sh
psql -h localhost -U postgres -d shopflow

# Validation
./scripts/validate-code.sh
```

---

**Need more help? Check the [Installation Guide](./INSTALLATION.md) or [Supabase Setup Guide](./SUPABASE-SETUP.md)**

