# Context Engineering Documentation

โฟลเดอร์นี้เก็บเอกสารสำหรับการพัฒนาและอ้างอิงภายในทีม

## 📁 โครงสร้างโฟลเดอร์

### 📚 Root Documentation (สำหรับผู้ใช้)
เอกสารหลักที่ผู้ใช้ทั่วไปควรอ่าน:
- `../README.md` - เอกสารหลักของโปรเจกต์
- `../INSTALLATION.md` - คู่มือติดตั้ง
- `../QUICK-START.md` - คู่มือเริ่มต้นใช้งาน
- `../TROUBLESHOOTING.md` - คู่มือแก้ปัญหา
- `../SUPABASE-SETUP.md` - คู่มือตั้งค่า Supabase
- `../DATABASE-SCHEMA.md` - เอกสารโครงสร้างฐานข้อมูล

### 📂 .context/ Structure

#### `archived/`
เอกสารที่เก็บไว้เพื่ออ้างอิง (archived documents)
- Development plans เก่า
- แผนการพัฒนาที่ไม่ใช้งานแล้ว

#### `historical-docs/`
เอกสารประวัติศาสตร์ของ Phase 1
- CHANGELOG-PHASE1.md
- PHASE1-SUMMARY.md
- PHASE1-COMPLETE.md
- PHASE1-CHANGES.md
- MIGRATION-GUIDE.md

#### `planning-and-strategy/`
แผนการพัฒนาและกลยุทธ์
- COMPREHENSIVE_IMPROVEMENT_PLAN.md
- feature-roadmap.md
- PHASE1-IMPLEMENTATION-PLAN.md
- PHASE2-* (Phase 2 planning documents)
- technical-specifications.md

#### `technical-docs/`
เอกสารเทคนิคสำหรับ developers
- architecture.md
- api-reference.md
- database-schema.md
- CODE-REVIEW-CHECKLIST.md
- VALIDATION-REPORT.md
- loyalty-program-system.md

#### `troubleshooting-legacy/`
เอกสารแก้ไขปัญหาที่เกิดขึ้นในอดีต
- cms-fixes-summary.md
- typescript-errors-report.md
- reports-loop-fix-summary.md
- และอื่นๆ

#### `user-guides/`
คู่มือสำหรับผู้ใช้และ developers
- deployment-guide.md
- development-guidelines.md
- project-overview.md
- troubleshooting.md

## 📋 การใช้งาน

### สำหรับผู้ใช้ทั่วไป
อ่านเอกสารใน root directory:
- เริ่มจาก `../README.md`
- ตามด้วย `../QUICK-START.md` หรือ `../INSTALLATION.md`

### สำหรับ Developers
- **Architecture**: `technical-docs/architecture.md`
- **API Reference**: `technical-docs/api-reference.md`
- **Code Review**: `technical-docs/CODE-REVIEW-CHECKLIST.md`
- **Development Guidelines**: `user-guides/development-guidelines.md`

### สำหรับ Project Managers
- **Roadmap**: `planning-and-strategy/feature-roadmap.md`
- **Implementation Plans**: `planning-and-strategy/PHASE*-IMPLEMENTATION-PLAN.md`

## 🔍 การค้นหาเอกสาร

```bash
# ค้นหาเอกสารทั้งหมด
find .context -name "*.md" -type f

# ค้นหาตาม keyword
grep -r "keyword" .context --include="*.md"
```

## 📝 หมายเหตุ

- เอกสารใน `.context/` เป็นเอกสารสำหรับอ้างอิงภายใน
- เอกสารใน root เป็นเอกสารสำหรับผู้ใช้ทั่วไป
- เอกสารใน `archived/` และ `historical-docs/` เป็นเอกสารประวัติศาสตร์

---

**Last Updated**: 2025-01-18
