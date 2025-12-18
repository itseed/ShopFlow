## เกณฑ์ความสำเร็จ
- CMS และ POS รันได้ครบทุกหน้า ไม่มี TypeScript error
- Build `@shopflow/api`/`@shopflow/types` ผ่าน และสอดคล้องสคีมาจริง
- Flow สำคัญทำงานครบ: จัดการสินค้า/หมวดหมู่, สร้างออเดอร์, ชำระเงิน, รายงาน, การตั้งค่าระบบ
- ทดสอบครอบคลุม: unit + integration + E2E ผ่าน พร้อมตรวจวัดประสิทธิภาพและความปลอดภัย

## ช่องว่างปัจจุบัน
- CMS มี 275 TS errors: React Query v5 options (`cacheTime`) และ `unknown`/implicit `any` ในหลาย hooks/pages เช่น `lib/hooks/useReportsSystem.ts:616`, `components/reports/ReportsDashboard.tsx:683`, `pages/reports/sales.tsx:143`
- อิมพอร์ตจาก `@shopflow/api` ที่ root ไม่ได้ส่งออก (`CreateSupplierData`, `UpdateSupplierData`, `SupplierFilters`) เช่น `apps/cms-web/pages/catalog/suppliers/index.tsx:86`
- บางบริการ/API ใช้ฟิลด์/ตารางไม่ตรงกับชนิด (เช่น stock/inventory_movements/payments) — 已แก้และ build API ผ่านแล้ว

## แผนปฏิบัติการ
### 1) จัดระเบียบ API ให้ใช้ได้จริงใน CMS
- ส่งออกจาก root ของ `@shopflow/api`: `supplierService` และ `type { SupplierFilters, CreateSupplierData, UpdateSupplierData }`
- เปลี่ยนอิมพอร์ตใน CMS ให้ใช้งาน root/subpath ที่ถูกต้อง
- ตรวจสอบ movement API: ใช้ `coreService.inventory.getMovements` หรือ `reportService.inventory.movements`

### 2) ปรับ React Query v5 และชนิดผลลัพธ์
- ลบ `cacheTime` และใช้ `staleTime`/`gcTime` แทน
  - ตัวอย่าง: `apps/cms-web/lib/hooks/useCategories.ts:92`, `lib/hooks/useReportsSystem.ts:616`
- ใส่ generic ใน `useQuery<TData, TError>` เพื่อเลิก `unknown` และแก้ implicit `any`
- กำหนดชนิดชัดเจนให้ตัวแปรใน `.map/.reduce` บนหน้า Reports/Orders/Catalog

### 3) กำหนดชนิดสำหรับ UI/Charts
- กำหนด `salesData` เป็น array ที่มีฟิลด์ตรงกับ Chart (`pages/reports/sales.tsx:143-168,429`)
- กำหนดชนิด `productReports`, `inventoryReports`, `branchReports` ใน `components/reports/ReportsDashboard.tsx:683` และจุด `.map`
- ปรับ data mapping ให้เป็น `any[]` หรือชนิดที่ Recharts รับได้

### 4) ทดสอบและยืนยันฟังก์ชันสำคัญ
- Unit tests: `@shopflow/api` services (products, orders, reports, system)
- Integration: Query สำคัญกับ Supabase รวม RLS
- E2E: 
  - CMS: เพิ่ม/แก้ไขสินค้าและหมวดหมู่ → สร้างออเดอร์ → รายงานยอดขาย
  - POS: สแกน/ค้นหา → เพิ่มตะกร้า → ชำระเงิน → พิมพ์ใบเสร็จ

### 5) ประสิทธิภาพและความปลอดภัย
- ใช้ React Query cache/prefetch/pagination ในรายการใหญ่
- ตรวจ/ลบ fallback keys ทั้งหมด และใช้ env เท่านั้น (`packages/api/src/supabase.ts:4-14` 已บังคับใช้)
- ตรวจ Guards/Role ใน CMS (`apps/cms-web/components/auth/*`) และปรับให้ตรงบทบาท

### 6) CI/CD และคุณภาพ
- ตั้ง pipeline: lint, type-check, build, tests, bundle-size checks
- Docker/Nginx สำหรับ production และจัดการ secrets ต่อ environment

## วิธีตรวจสอบความสำเร็จ
- `npm run build` และ `npm run type-check` ผ่านในทุก workspace
- รายงานผลทดสอบ (unit/integration/E2E) ผ่านครบ และ bundle/performance อยู่ในเกณฑ์
- Smoke test manual: เปิดทุกหน้า CMS/POS ตรวจ flow สำคัญแบบ end-to-end

## เริ่มดำเนินการเมื่อยืนยัน
- เพิ่ม root exports ใน `@shopflow/api` แล้วแก้อิมพอร์ตใน CMS
- แก้ hooks/pages ตามรายการ เพื่อให้ `npm run type-check` ของ CMS ผ่าน
- เพิ่มชุดทดสอบและรันตรวจสอบ พร้อมรายงานผล