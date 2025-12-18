## ภาพรวมปัญหา
- พบ 275 TypeScript errors ใน CMS ส่วนใหญ่เกิดจาก:
  - ใช้ React Query v5 แต่ยังมี options เก่า (`cacheTime`), ชนิดผลลัพธ์ `unknown`, และ implicit `any`
  - อิมพอร์ตประเภทจาก `@shopflow/api` ที่ไม่ได้ส่งออกจาก root (เช่น `CreateSupplierData`, `UpdateSupplierData`) หรือบริการที่ชื่อไม่ตรง
  - โค้ดหน้า Reports/Orders ใช้ `.map/.reduce` กับค่าที่ไม่กำหนดชนิดชัดเจน

## เป้าหมาย
- ทำให้ CMS `npm run type-check` ผ่านโดยไม่มี error
- จัด API exports ให้สอดคล้องกับการใช้งานในแอป
- ลดโค้ดซ้ำและเพิ่มความเข้มแข็งด้านชนิดข้อมูล

## แผนการแก้ตามหมวด
### 1) ปรับ API exports ให้ตรงกับการใช้งาน
- แก้ `packages/api/src/index.ts`:
  - ส่งออกจาก root: `supplierService`, `type { SupplierFilters, CreateSupplierData, UpdateSupplierData }` จาก `services/supplierService`
  - หากมีการอ้าง `stockMovementService` ใน CMS: สร้าง/ส่งออกบริการที่เทียบเคียง หรือชี้ให้ใช้ `coreService.inventory.getMovements` ที่มีอยู่
- ตรวจสอบว่า build ของ `@shopflow/api` ยังผ่านหลังเพิ่ม exports

### 2) ปรับอิมพอร์ตใน CMS ให้ใช้งานได้
- `apps/cms-web/lib/hooks/useSuppliers.ts`, `pages/catalog/suppliers/index.tsx`:
  - เปลี่ยนอิมพอร์ตเป็นจาก root ที่ส่งออกใหม่ หรือใช้ subpath `@shopflow/api/services/supplierService` ถ้าต้องการระบุชัด
- `apps/cms-web/lib/hooks/useStockMovements.ts`:
  - เปลี่ยนจาก `stockMovementService` เป็นการเรียก `@shopflow/api` ที่รองรับ (เช่น `reportService.inventory.movements` หรือเมธอดใน core)
- ลบ/ปรับไฟล์ `apps/cms-web/types/shopflow-api.d.ts` หลัง root exports ครอบคลุม เพื่อเลิกพึ่งประกาศชั่วคราว

### 3) ปรับ React Query v5 options และชนิดผลลัพธ์
- แก้ทุก `useQuery` ที่ใช้ `cacheTime` เป็น:
  - ใช้ `staleTime` (เวลา data ถือว่ายังใหม่) และ/หรือ `gcTime` (เวลาเก็บใน cache ก่อนถูกเก็บกวาด)
- เพิ่ม generic ใน `useQuery<TData, TError>` และกำหนดชนิดชัดเจนให้ค่าคืน (`categoriesData`, `salesData`, ฯลฯ) เพื่อเลิก `unknown`
- ตัวอย่างจุดที่ต้องแก้:
  - `apps/cms-web/lib/hooks/useCategories.ts:92` – ลบ `cacheTime`, เพิ่ม generic `Category[]`
  - `apps/cms-web/lib/hooks/useReportsSystem.ts:616, 978, 1003` – ลบ `cacheTime`, แก้ชนิดของพารามิเตอร์ (เช่นเปลี่ยน object ให้เข้ากับ filters ที่รองรับ)
  - Hooks อื่นๆ ในรายการ error (Employees, Dashboard, Orders, Products, Realtime)

### 4) กำจัด implicit any และจัดชนิดสำหรับการแสดงผล
- เพิ่มชนิดให้ตัวแปร list ที่ถูก `.map`/`.reduce`:
  - `components/reports/ReportsDashboard.tsx` – กำหนด `productReports: ProductReport[]`, `inventoryReports: InventoryReport[]`, `branchReports: BranchReport[]`
  - `pages/reports/sales.tsx` – กำหนดชนิด `salesData: Array<{ date: string; totalSales: number; totalOrders: number; ... }>` ตามผลจาก `@shopflow/api` และจัด mapping ให้ชัดเจนก่อนส่งให้ Chart
  - `pages/catalog/products.tsx` – กำหนด `categories: Category[]`, `products: Product[]`
  - `pages/catalog/suppliers/index.tsx` – ใช้ชนิดจาก `@shopflow/types` สำหรับ `Supplier`
- แก้จุด implicit any ที่พบในรายงาน (ตัวแปร `product`, `index`, `item`, `order`, ฯลฯ) ให้มีชนิดที่เหมาะสม

### 5) ตรวจสอบการใช้ข้อมูลกับ UI libraries
- Recharts: ตรวจว่า prop `data` เป็น `any[]` หรือชนิดที่ library รับได้ ไม่ใช่ `unknown`
- ใส่การจัดรูปข้อมูลชั้นกลางก่อนส่งให้ chart เพื่อความชัดเจนและลด implicit any

### 6) เดินทดสอบและยืนยันผล
- รัน `npm run build` ใน `packages/api` ยืนยันว่าไม่มี error หลังเพิ่ม exports
- รัน `npm run type-check` ใน `apps/cms-web` จนผ่าน
- เผยแพร่สรุปไฟล์ที่แก้และผลการตรวจสอบ

## ลำดับการทำงาน
1. เพิ่ม/ปรับ exports ใน `@shopflow/api` (supplier และ movement)
2. ปรับอิมพอร์ตใน CMS hooks/pages ให้ตรงกับ exports ใหม่
3. ปรับ React Query v5 options และ generic types ใน hooks
4. ใส่ชนิดให้ค่าที่ถูก `.map/.reduce` บนหน้า Reports/Orders/Catalog
5. ตรวจสอบ Recharts และ data mapping
6. รันตรวจสอบและแก้รอบสุดท้าย

## เกณฑ์สำเร็จ
- 0 TypeScript errors ใน CMS (type-check ผ่าน)
- Build ของ `@shopflow/api` ผ่าน พร้อม root exports ครบตามการใช้งาน
- ไม่มีการพึ่งไฟล์ประกาศชนิดชั่วคราว (`shopflow-api.d.ts`) ใน CMS

## พร้อมดำเนินการ
- เมื่อยืนยัน จะเริ่มปรับ API exports และดำเนินการแก้ hooks/pages ตามรายการ พร้อมรายงานผลการตรวจสอบเป็นลำดับ