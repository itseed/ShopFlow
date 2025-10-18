# ShopFlow Context Engineering

## 📚 **Documentation Structure**

Context engineering สำหรับ ShopFlow จัดระเบียบเป็นหมวดหมู่เพื่อความเข้าใจที่ง่ายและรวดเร็ว

```
.context/
├── README.md                          # เอกสารนี้
├── index.md                           # ภาพรวมและ Quick Reference
│
├── planning-and-strategy/                      # แผนและกลยุทธ์การพัฒนา
│   ├── COMPREHENSIVE_IMPROVEMENT_PLAN.md      # แผนการปรับปรุงหลัก (ใหม่)
│   ├── pos-system-context.md                  # Context ระบบ POS ครบวงจร
│   ├── feature-roadmap.md                     # แผนการพัฒนา features (12 เดือน)
│   ├── technical-specifications.md            # รายละเอียดเทคนิคของ core features
│   ├── pos-settings-system.md                 # ระบบตั้งค่า POS และ Branch
│   └── deployment-setup-guide.md              # คู่มือการติดตั้งและ Deploy
│
├── technical-docs/                    # เอกสารเทคนิค
│   ├── database-schema.md            # โครงสร้างฐานข้อมูล
│   ├── loyalty-program-system.md     # ระบบสะสมแต้ม
│   ├── architecture.md               # สถาปัตยกรรมระบบ
│   └── api-reference.md              # API services และ endpoints
│
├── user-guides/                       # คู่มือผู้ใช้
│   ├── project-overview.md           # ภาพรวมโปรเจ็ค
│   ├── development-guidelines.md     # แนวทางการพัฒนา
│   ├── deployment-guide.md           # คู่มือการ deploy (เก่า)
│   └── troubleshooting.md            # แก้ไขปัญหาทั่วไป
│
├── troubleshooting-legacy/            # เอกสารแก้ไขปัญหา (Legacy)
│   ├── reports-troubleshooting.md
│   ├── reports-fix-summary.md
│   ├── chart-fix-summary.md
│   ├── websocket-fix-summary.md
│   ├── api-infinite-loop-fix.md
│   └── ... (อื่นๆ)
│
├── archived/                          # เอกสารเก่า (Historical)
│   ├── COMPREHENSIVE_DEVELOPMENT_PLAN.md  # แผนเก่า (v3.0)
│   └── DEVELOPMENT_PLAN.md                # แผนเก่าสุด
│
└── recent-changes.md                  # การเปลี่ยนแปลงล่าสุด
```

## 🎯 **Quick Navigation**

### **สำหรับ Developer ใหม่**
1. เริ่มที่ [`index.md`](./index.md) - ภาพรวมและ Quick Start
2. อ่าน [`user-guides/project-overview.md`](./user-guides/project-overview.md) - ทำความเข้าใจโปรเจ็ค
3. ศึกษา [`technical-docs/architecture.md`](./technical-docs/architecture.md) - สถาปัตยกรรมระบบ
4. ดู [`user-guides/development-guidelines.md`](./user-guides/development-guidelines.md) - วิธีการพัฒนา

### **สำหรับการวางแผน**
1. [`planning-and-strategy/pos-system-context.md`](./planning-and-strategy/pos-system-context.md) - Context ระบบ POS
2. [`planning-and-strategy/feature-roadmap.md`](./planning-and-strategy/feature-roadmap.md) - Roadmap 12 เดือน
3. [`planning-and-strategy/technical-specifications.md`](./planning-and-strategy/technical-specifications.md) - Technical Specs

### **สำหรับการติดตั้ง**
1. [`planning-and-strategy/deployment-setup-guide.md`](./planning-and-strategy/deployment-setup-guide.md) - Setup Wizard
2. [`user-guides/deployment-guide.md`](./user-guides/deployment-guide.md) - Deployment ทั่วไป

### **สำหรับการพัฒนา Feature**
1. [`technical-docs/database-schema.md`](./technical-docs/database-schema.md) - Database Schema
2. [`technical-docs/api-reference.md`](./technical-docs/api-reference.md) - API Services
3. [`technical-docs/loyalty-program-system.md`](./technical-docs/loyalty-program-system.md) - Loyalty System

## 📋 **Document Categories**

### **1. Planning & Strategy** 
แผนการพัฒนาและกลยุทธ์ระยะยาว

| Document | Description | Status |
|----------|-------------|--------|
| **Comprehensive Improvement Plan** | **แผนการปรับปรุงหลัก** | ✅ **Current** |
| POS System Context | Context ระบบ POS ครบวงจร | ✅ Current |
| Feature Roadmap | แผนการพัฒนา 4 phases (12 เดือน) | ✅ Current |
| Technical Specifications | รายละเอียดเทคนิค core features | ✅ Current |
| POS Settings System | ระบบตั้งค่า Branch และ POS | ✅ Current |
| Deployment Setup Guide | คู่มือติดตั้งแบบ step-by-step | ✅ Current |

### **2. Technical Documentation**
เอกสารเทคนิคสำหรับการพัฒนา

| Document | Description | Status |
|----------|-------------|--------|
| Database Schema | โครงสร้าง DB และ relationships | ✅ Current |
| Loyalty Program System | ระบบสะสมแต้มครบวงจร | ✅ Current |
| Architecture | สถาปัตยกรรมระบบ | ✅ Current |
| API Reference | API services และ endpoints | ✅ Current |

### **3. User Guides**
คู่มือสำหรับผู้ใช้และ Developer

| Document | Description | Status |
|----------|-------------|--------|
| Project Overview | ภาพรวมโปรเจ็ค | ✅ Current |
| Development Guidelines | แนวทางการพัฒนา | ✅ Current |
| Deployment Guide | คู่มือ Deploy (เวอร์ชันเก่า) | ⚠️ Legacy |
| Troubleshooting | แก้ไขปัญหาทั่วไป | ✅ Current |

### **4. Troubleshooting Legacy**
เอกสารแก้ไขปัญหาที่เกิดขึ้นในอดีต (เก็บไว้เป็น reference)

| Document | Description | Status |
|----------|-------------|--------|
| Reports Troubleshooting | แก้ปัญหา Reports | 📦 Archived |
| Infinite Loop Fixes | แก้ Infinite Loop ต่างๆ | 📦 Archived |
| TypeScript Errors | แก้ TypeScript Errors | 📦 Archived |
| CMS Fixes | แก้ไข CMS Web | 📦 Archived |

## 🚀 **Getting Started**

### **สำหรับ Developer ใหม่**
```bash
# 1. อ่านเอกสารหลัก
- index.md                    # เริ่มที่นี่
- user-guides/project-overview.md
- technical-docs/architecture.md

# 2. ศึกษา Technical Docs
- technical-docs/database-schema.md
- technical-docs/api-reference.md

# 3. ดู Development Guidelines
- user-guides/development-guidelines.md
```

### **สำหรับการวางแผน Feature ใหม่**
```bash
# 1. ดู Roadmap และ Specifications
- planning-and-strategy/feature-roadmap.md
- planning-and-strategy/technical-specifications.md

# 2. ศึกษา Existing Features
- technical-docs/loyalty-program-system.md
- planning-and-strategy/pos-settings-system.md

# 3. วางแผนตาม Context
- planning-and-strategy/pos-system-context.md
```

### **สำหรับการ Deploy**
```bash
# 1. ใช้ Setup Wizard (แนะนำ)
- planning-and-strategy/deployment-setup-guide.md

# 2. หรือ Manual Deploy
- user-guides/deployment-guide.md

# 3. แก้ไขปัญหา
- user-guides/troubleshooting.md
```

## 📊 **Documentation Status**

### **✅ Current & Active**
เอกสารที่ใช้งานอยู่และอัพเดตล่าสุด:
- Planning & Strategy (5 docs)
- Technical Documentation (4 docs)
- User Guides (4 docs)
- Recent Changes (1 doc)

### **📦 Archived**
เอกสารที่ย้ายไปเก็บใน `troubleshooting-legacy/`:
- Reports fixes (7 docs)
- Infinite loop fixes (5 docs)
- TypeScript fixes (4 docs)
- CMS fixes (4 docs)

### **🗑️ Removed**
เอกสารที่ลบออกเพราะล้าสมัย:
- None (เก็บไว้ทั้งหมดใน troubleshooting-legacy/)

## 🔄 **Update Policy**

### **เอกสารที่อัพเดตบ่อย**
- `recent-changes.md` - ทุกครั้งที่มีการเปลี่ยนแปลงสำคัญ
- `planning-and-strategy/feature-roadmap.md` - ทุกเดือน
- `technical-docs/api-reference.md` - เมื่อมี API ใหม่

### **เอกสารที่อัพเดตเป็นครั้งคราว**
- `technical-docs/database-schema.md` - เมื่อมี migration ใหม่
- `planning-and-strategy/technical-specifications.md` - เมื่อมี feature ใหม่
- `user-guides/troubleshooting.md` - เมื่อพบปัญหาใหม่

### **เอกสารที่ค่อนข้างคงที่**
- `planning-and-strategy/pos-system-context.md`
- `technical-docs/architecture.md`
- `user-guides/project-overview.md`

## 🎯 **Best Practices**

### **การใช้งาน Context Engineering**
1. **เริ่มจาก `index.md`** - ดูภาพรวมก่อนเสมอ
2. **ใช้ Quick Navigation** - หา document ที่ต้องการได้เร็ว
3. **อ่าน Recent Changes** - รู้ว่ามีอะไรเปลี่ยนไป
4. **ตรวจสอบ Status** - ดูว่า document ยังใช้ได้หรือล้าสมัย

### **การอัพเดต Documentation**
1. **อัพเดต Recent Changes** - บันทึกการเปลี่ยนแปลง
2. **อัพเดตวันที่** - ใส่วันที่อัพเดตท้าย document
3. **เก็บ Legacy** - ย้ายเอกสารเก่าไป troubleshooting-legacy/
4. **อัพเดต Index** - แก้ index.md ให้ตรงกับโครงสร้างใหม่

## 📞 **Support**

หากมีคำถามหรือต้องการข้อมูลเพิ่มเติม:

1. **ดูที่ `troubleshooting.md`** - ปัญหาที่พบบ่อย
2. **ค้นหาใน `troubleshooting-legacy/`** - ปัญหาที่เคยเจอ
3. **อ่าน `recent-changes.md`** - การเปลี่ยนแปลงล่าสุด
4. **ดูใน GitHub Issues** - ปัญหาที่รายงานไว้

---

**Last Updated:** October 18, 2025  
**Version:** 2.0  
**Maintainer:** ShopFlow Development Team
