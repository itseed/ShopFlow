# Database Field Name Fixes

## 🔧 ปัญหาที่พบ

### **Error Message:**
```
HTTP 400 Bad Request
{
    "code": "42703",
    "message": "column orders_1.total_amount does not exist"
}
```

### **Request URL:**
```
http://localhost:8000/rest/v1/customers?select=*,orders!inner(id,total_amount,created_at)
```

---

## 🎯 สาเหตุ

**Database Schema:**
ใน table `orders` มีฟิลด์:
- ✅ `total` - จำนวนเงินรวม
- ✅ `final_amount` - จำนวนเงินสุทธิ
- ❌ `total_amount` - **ไม่มีฟิลด์นี้**

**API Service:**
`customerService.ts` ใช้ `total_amount` ซึ่งไม่มีใน database

---

## ✅ การแก้ไข

### **ไฟล์:** `packages/api/src/services/customerService.ts`

**เปลี่ยนจาก:**
```typescript
select(`
  *,
  orders!inner(
    id,
    total_amount,  // ❌ ไม่มีใน database
    created_at
  )
`)

// และ
order.total_amount  // ❌
```

**เป็น:**
```typescript
select(`
  *,
  orders!inner(
    id,
    total,         // ✅ ถูกต้อง
    created_at
  )
`)

// และ
order.total        // ✅
```

---

## 📊 การเปลี่ยนแปลง (6 จุด)

### **1. getAll() Method - Line 77**
```typescript
// Before
orders!inner(id, total_amount, created_at)

// After
orders!inner(id, total, created_at)  // ✅
```

### **2. getAll() Calculation - Line 145**
```typescript
// Before
sum + (order.total_amount || 0)

// After
sum + (order.total || 0)  // ✅
```

### **3. getById() Method - Line 198**
```typescript
// Before
orders(id, total_amount, created_at, status)

// After
orders(id, total, created_at, status)  // ✅
```

### **4. getById() Calculation - Line 219**
```typescript
// Before
sum + (order.total_amount || 0)

// After
sum + (order.total || 0)  // ✅
```

### **5. getCustomerSummary() Select - Line 486**
```typescript
// Before
.select("total_amount")

// After
.select("total")  // ✅
```

### **6. getCustomerSummary() Calculation - Line 494**
```typescript
// Before
sum + (order.total_amount || 0)

// After
sum + (order.total || 0)  // ✅
```

---

## 🗄️ Database Schema Reference

### **orders Table Fields:**
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  order_number TEXT,
  customer_id UUID,
  subtotal DECIMAL(12,2),
  discount_amount DECIMAL(12,2),
  tax DECIMAL(12,2),
  delivery_fee DECIMAL(12,2),
  total DECIMAL(12,2),           -- ✅ ใช้ field นี้
  final_amount DECIMAL(12,2),     -- Alternative
  -- ไม่มี total_amount
);
```

---

## ✅ ผลลัพธ์

**Before:**
- ❌ HTTP 400 Bad Request
- ❌ Column does not exist error
- ❌ Customer page ไม่ทำงาน

**After:**
- ✅ API request สำเร็จ
- ✅ Customer data โหลดได้
- ✅ Statistics คำนวณถูกต้อง

---

## 🔍 วิธีตรวจสอบ Field Names

### **ใช้ Supabase SQL Editor:**
```sql
-- ดู columns ทั้งหมดใน table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders';
```

### **ใช้ Supabase API:**
```bash
curl "http://localhost:8000/rest/v1/orders?select=*&limit=1"
```

### **ตรวจสอบ Schema File:**
```bash
cat migrate/database_schema.sql | grep "CREATE TABLE orders"
```

---

## 💡 Best Practices

### **1. ใช้ชื่อ Field ที่สอดคล้องกัน**
```typescript
// Good
total, subtotal, final_amount

// Avoid
total_amount (ambiguous)
```

### **2. ตรวจสอบ Schema ก่อนเขียน Query**
```typescript
// Always verify field exists in database
const { data } = await supabase
  .from("orders")
  .select("total")  // ✅ Check schema first
```

### **3. ใช้ TypeScript Types**
```typescript
// Define types based on actual database
interface Order {
  total: number;           // Match database exactly
  final_amount: number;
  // Not: total_amount
}
```

---

## 🎯 ข้อควรระวัง

### **Common Field Name Patterns:**

| Database | API | Notes |
|----------|-----|-------|
| `total` | `total` | ✅ รวมทั้งหมด |
| `final_amount` | `final_amount` | ✅ ยอดสุทธิ |
| `subtotal` | `subtotal` | ✅ ยอดก่อนภาษี |
| ~~`total_amount`~~ | - | ❌ ไม่มีใน schema |

---

*แก้ไขเมื่อ: $(date)*
*ไฟล์: packages/api/src/services/customerService.ts*

