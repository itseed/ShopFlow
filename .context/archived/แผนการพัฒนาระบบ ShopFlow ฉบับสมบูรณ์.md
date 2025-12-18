## วัตถุประสงค์และผลลัพธ์
- ยกระดับสถาปัตยกรรมให้เรียบง่าย ใช้ซ้ำได้ และตรวจสอบได้
- รวมโดเมนโลจิกไว้ใน shared packages เพื่อลดความซ้ำซ้อน
- เพิ่มคุณภาพด้วยการทดสอบครบถ้วน, ปรับปรุงประสิทธิภาพและความปลอดภัย
- รองรับการดีพลอยแบบ Docker/Nginx และการตั้งค่าแยกสภาพแวดล้อม

## ขอบเขตระบบ
- แอป Frontend 2 ตัว: CMS Dashboard (`apps/cms-web`) และ POS (`apps/pos-frontend`)
- Shared packages: `@shopflow/api`, `@shopflow/types`, `@shopflow/hooks`, `@shopflow/ui`, `@shopflow/utils`
- ฐานข้อมูลและ Auth: Supabase (สคีมา/นโยบาย RLS ใน `migrate/` และ `database-design/`)

## สถาปัตยกรรม
- Monorepo ด้วยโครงสร้าง apps + packages
- Frontend: Next.js 14 + React 18 + React Query v5
- Data Layer: Supabase client แบบ single-instance (`packages/api/src/supabase.ts`)
- Shared Types: `packages/types` เป็นแหล่งความจริงเดียวของชนิดข้อมูล
- UI: คอมโพเนนต์ใช้ซ้ำจาก `packages/ui` ติดตั้ง transpile ในทั้งสองแอป (ดู `apps/*/next.config.js`)

## มาตรฐานโค้ดและการแชร์
- บังคับใช้การอิมพอร์ตผ่าน shared packages แทนบริการเฉพาะแอป
- เปิดใช้ TypeScript strict และตรวจสอบชนิดจาก `@shopflow/types`
- ปรับ hooks ให้ใช้ `@shopflow/hooks` เป็น default data access layer
- ตั้ง guideline การตั้งชื่อ, โครงสร้างโฟลเดอร์, และการจัดการ state ด้วย React Query cache

## แบบจำลองข้อมูลและไมเกรต
- ตรวจทาน schema v2 (`database-design/migration-v2.sql`) และ script rollout (`migrate/database-migration.sql`)
- ปิดช่องโหว่เขตข้อมูลที่ขาด (เช่นใน Orders: email/address/delivery/notes ฯลฯ ดู `database-design/schema-analysis.md`)
- วางขั้นตอนไมเกรตแบบปลอดภัย: สำรองข้อมูล, รันฟังก์ชัน/ทริกเกอร์ใหม่, ตรวจสอบ RLS
- สร้างตัวอย่างข้อมูลและสคริปต์ seed ที่สอดคล้องกับ UI flows

## ความปลอดภัยและสิทธิ์
- จัดการ secrets ผ่าน env; ยกเลิก fallback anon key ใน `packages/api/src/supabase.ts`
- ปรับนโยบาย RLS ให้ครอบคลุมฟีเจอร์ใหม่ และยืนยันด้วย integration tests
- ใช้ Guards ใน CMS (`apps/cms-web/components/auth/*`) ให้สอดคล้องบทบาท/สิทธิ์

## CMS Web
- ย้าย services แยก (เช่น `lib/services/*`) ไปใช้ `@shopflow/api` ให้หมด
- ปรับหน้า Orders/Reports/Settings ให้ใช้ hooks จาก `@shopflow/hooks` และ UI จาก `@shopflow/ui`
- บูรณาการอัปโหลดรูป/Storage, การแจ้งเตือนระบบ, และแดชบอร์ดสถานะเรียลไทม์
- เพิ่ม ErrorBoundary และมาตรวัดประสิทธิภาพในหน้าหนัก (รายงาน/ออเดอร์)

## POS Frontend
- ทำให้ Cart/Checkout ใช้ชนิดจาก `@shopflow/types` และบริการจาก `@shopflow/api`
- ปรับปรุง flow การค้นหา/สแกนสินค้า, สรุปยอด, และการชำระเงินให้สอดคล้องสคีมาใหม่
- จัดการ Session/Auth ผ่าน Context + Supabase และตั้งค่า `output: "export"` ให้เหมาะสมกับฟีเจอร์ (พิจารณาเปลี่ยนเมื่อมี server-side จำเป็น)
- เพิ่มโมดูลแจ้งเตือนสต็อกและคืนสินค้าด้วย hooks ที่รวมศูนย์

## API/Services
- รวม Core/Orders/Reports/System services ไว้ใน `@shopflow/api` (ดู `packages/api/src/services/*`)
- กำหนดสัญญา API ที่คงที่, เอกสารการใช้งานสั้นใน package README
- จัดทำกลยุทธ์ cache, pagination, และ error handling มาตรฐาน

## การทดสอบ
- Unit tests: services, utils, hooks (Jest, ts-jest)
- Integration tests: Supabase queries และ RLS policies ด้วย test DB
- E2E tests: flows สำคัญ CMS/POS (เช่น สร้างออเดอร์ → จ่ายเงิน → ออกรายงาน)
- สร้างชุดข้อมูลทดสอบและ mock utilities สำหรับ POS

## ประสิทธิภาพ
- ใช้ React Query cache + prefetch + pagination ในหน้ารายการใหญ่
- ลด bundle: optimize package imports (`lucide-react`), เปิดโหมด tree-shaking ใน UI package
- ปรับ Next config สำหรับภาพ/asset และตรวจวัด TTI/FCP หน้าแสดงข้อมูลมาก

## การติดตามและสังเกตการณ์
- เพิ่ม ErrorBoundary/UI feedback ในทั้งสองแอป
- ผนวก logging/analytics ชั้น frontend และสถานะ realtime (Supabase) สำหรับแดชบอร์ด

## DevOps และดีพลอย
- ใช้ Docker images แบบ optimized (`Dockerfile.optimized`) และ Compose production (`docker-compose.production.yml`)
- ตั้งค่า Nginx reverse proxy, แยกพอร์ต CMS/ POS และบริการฐานข้อมูล
- กำหนด pipeline CI สำหรับ build, lint, test, และตรวจสอบขนาดบันเดิล
- จัดการ secrets ด้วย environment files ต่อสภาพแวดล้อม

## ลดหนี้เทคนิค
- อัปเดตทุกอิมพอร์ตให้ใช้ `@shopflow/api/hooks/ui/types` แทนบริการเฉพาะแอป
- ลบ fallback anon key และจัดการ env ให้เข้มงวด
- ลบ service/hook/component เก่าที่ซ้ำกับ shared packages

## เกณฑ์ความสำเร็จ
- ลด services/hooks ซ้ำให้เหลือใช้จาก shared packages เป็นหลัก (สอดคล้อง `PHASE1-CHANGES.md`)
- ครอบคลุม unit/integration/E2E tests สำหรับฟีเจอร์หลัก
- ปรับปรุงประสิทธิภาพหน้า heavy lists และรายงาน
- ดีพลอยผ่าน Docker พร้อมสำเร็จรูปใช้งานได้

## ขั้นตอนถัดไป
- เลือกชุดงานเริ่ม: 1) รวม services ของ CMS ไปใช้ `@shopflow/api`, 2) ปรับ POS Cart/Checkout ไปใช้ชนิดและบริการ shared, 3) ปิด fallback anon key และ update env
- เมื่อยืนยัน จะเริ่มลงมือปรับโค้ดแบบเป็นขั้นตอน พร้อมทดสอบและรายงานผล