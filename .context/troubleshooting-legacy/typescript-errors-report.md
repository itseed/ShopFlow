# TypeScript Errors Report - CMS Web

## 📊 สรุปปัญหา: 68+ TypeScript Errors

### **สถานะ:** 🔴 CRITICAL - ต้องแก้ไขก่อน production

---

## 🎯 หมวดหมู่ปัญหาและวิธีแก้ไข

### **1. API Service Issues (1 error)** ✅ FIXED

#### **Problem:**
```typescript
// useProducts.ts:192
Property 'search' does not exist on type 'ProductService'
```

#### **Solution:** ✅ แก้แล้ว
ใช้ `productService.getAll({ search: query })` แทน `productService.search()`

---

### **2. Dashboard Summary Types (3 errors)** 🔴 CRITICAL

#### **Problems:**
```typescript
// pages/catalog/index.tsx:66,67,69
Property 'totalSuppliers' does not exist
Property 'outOfStockProducts' does not exist  
Property 'featuredProducts' does not exist
```

#### **Current Dashboard Type:**
```typescript
{
  todaySales: number
  todayOrders: number
  totalProducts: number
  lowStockCount: number
  topSellingProduct: string
  salesGrowth: number
  orderGrowth: number
}
```

#### **Solution:** ต้องเพิ่ม fields ใน Dashboard type
```typescript
// ใน packages/types หรือ cms-web
interface DashboardSummary {
  // Existing
  todaySales: number
  todayOrders: number
  totalProducts: number
  lowStockCount: number
  topSellingProduct: string
  salesGrowth: number
  orderGrowth: number
  // Missing - ต้องเพิ่ม
  totalSuppliers?: number
  outOfStockProducts?: number
  featuredProducts?: number
}
```

---

### **3. Category Type Issues (11 errors)** 🔴 HIGH

#### **Problems:**
- `status` property ไม่อยู่ใน Category type
- `image` property ไม่อยู่ใน Category type

#### **Current Category Type:**
```typescript
interface Category {
  id: string
  name: string
  description?: string
  // Missing: status, image
}
```

#### **Solution:**
```typescript
interface Category {
  id: string
  name: string
  description?: string | null
  status?: 'active' | 'inactive'  // เพิ่ม
  image?: string | null             // เพิ่ม
  display_order?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}
```

---

### **4. Customer & Mutation Issues (15 errors)** 🔴 HIGH

#### **Problems:**

**A. `isLoading` ไม่มีใน UseMutationResult**
```typescript
// Error: Property 'isLoading' does not exist
createMutation.isLoading  // ❌ ผิด
```

**Solution:**
```typescript
// ใช้ isPending แทน (React Query v5)
createMutation.isPending  // ✅ ถูก
```

**B. Missing NumberInput Component**
```typescript
// Error: Cannot find name 'NumberInput'
<NumberInput>  // ❌
```

**Solution:**
```typescript
import { NumberInput, NumberInputField } from "@chakra-ui/react"
```

**C. Customer FormData Type Mismatch**
```typescript
// Error: Property 'name' is missing
createCustomer(formData)  // formData ไม่มี name field
```

---

### **5. Order CustomerType Mismatch (18 errors)** 🔴 CRITICAL

#### **Problem:**
มี 2 types ที่ conflict กัน:

```typescript
// Type 1: OrderCustomerType (ใน Order)
type OrderCustomerType = 
  | "registered" 
  | "walk_in" 
  | "phone_order" 
  | "repeat_customer"

// Type 2: CustomerType (ใน Customer)
type CustomerType = 
  | "regular"
  | "vip"
  | "wholesale"
```

#### **Solution:**
ต้องแยกเป็น 2 types แยกกัน หรือรวมกัน:

**Option 1:** ใช้ Union Type
```typescript
type CustomerType = 
  | "regular"
  | "vip"
  | "wholesale"
  | "registered"
  | "walk_in"
  | "phone_order"
  | "repeat_customer"
```

**Option 2:** แยก Type ชัดเจน
```typescript
type CustomerType = "regular" | "vip" | "wholesale"
type OrderCustomerType = "registered" | "walk_in" | "phone_order" | "repeat_customer"
```

#### **Missing Order.branch Field:**
```typescript
interface Order {
  // ... existing fields
  branch?: Branch        // เพิ่ม
  branch_id?: string     // หรือใช้อันนี้
}
```

---

### **6. Supplier Type Conflicts (8 errors)** 🔴 MEDIUM

#### **Problem:**
```typescript
// supplier_code type conflict
// packages/api: string | null
// packages/types: string | undefined
```

#### **Solution:**
ต้อง sync types ระหว่าง packages:

```typescript
// ใน packages/types/src/Supplier.ts
interface Supplier {
  // ...
  supplier_code?: string | null  // รวม both
}
```

#### **Missing useSupplierStats:**
```typescript
// pages/catalog/suppliers/index.tsx:8
import { useSupplierStats } from "../../lib/hooks/useSuppliers"  // ❌ ไม่มี
```

**Solution:** ลบ import หรือสร้าง hook

---

### **7. Product Type Issues (3 errors)** 🔴 MEDIUM

#### **Problem A: min_stock possibly undefined**
```typescript
product.min_stock  // Error: possibly undefined
```

**Solution:**
```typescript
product.min_stock ?? 0  // ใช้ nullish coalescing
```

#### **Problem B: ProductStatus type**
```typescript
const status: ProductStatus = "some_string"  // Error
```

**Solution:** ใช้ type assertion
```typescript
const status = selectedStatus as ProductStatus
```

#### **Problem C: Dimensions Type**
```typescript
dimensions: {
  length?: number    // Type mismatch
  width?: number
  height?: number
}
```

**Solution:**
```typescript
dimensions: length && width && height ? {
  length: parseFloat(length),
  width: parseFloat(width),
  height: parseFloat(height)
} : undefined
```

---

### **8. System Service Issues (2 errors)** 🔴 LOW

```typescript
// lib/services/systemService.ts:119
Expected 3 arguments, but got 2
```

**Solution:** ตรวจสอบและแก้ไข function call

---

## 📋 Action Plan - ลำดับความสำคัญ

### **CRITICAL (ต้องแก้ก่อน)** 🔴

1. ✅ **Fix productService.search** - DONE
2. ⏳ **Fix CustomerType mismatch** (18 errors)
   - แยก OrderCustomerType vs CustomerType
3. ⏳ **Fix Category types** (11 errors)
   - เพิ่ม status และ image fields
4. ⏳ **Fix Dashboard types** (3 errors)
   - เพิ่ม missing fields

### **HIGH Priority** 🟡

5. ⏳ **Fix Customer mutations** (15 errors)
   - เปลี่ยน `isLoading` → `isPending`
   - เพิ่ม NumberInput import
6. ⏳ **Fix Supplier types** (8 errors)
   - Sync supplier_code type

### **MEDIUM Priority** 🟢

7. ⏳ **Fix Product types** (3 errors)
8. ⏳ **Fix System service** (2 errors)

---

## 🛠️ วิธีการแก้ไขอย่างเป็นระบบ

### **Phase 1: Fix Core Types (packages/types)**
```bash
# แก้ไข base types ใน packages/types/src/
- Category.ts
- Customer.ts
- Order.ts
- Supplier.ts
- Product.ts
```

### **Phase 2: Fix Hooks (apps/cms-web/lib/hooks)**
```bash
# แก้ไข hooks ให้ใช้ isPending แทน isLoading
- useCustomers.ts
- useSuppliers.ts
```

### **Phase 3: Fix Pages (apps/cms-web/pages)**
```bash
# แก้ไข pages ตามลำดับความสำคัญ
1. pages/catalog/index.tsx
2. pages/catalog/categories.tsx
3. pages/catalog/products.tsx
4. pages/customers/*.tsx
5. pages/orders/*.tsx
6. pages/catalog/suppliers/*.tsx
```

---

## ✅ สิ่งที่ทำแล้ว

1. ✅ แยกไฟล์ useDatabase.ts (2,117 บรรทัด → 8 ไฟล์เล็ก)
2. ✅ แก้ไข Page Data Size (5.33 MB → ~100 KB)
3. ✅ Update import paths (6 ไฟล์)
4. ✅ แก้ไข productService.search

---

## 📊 Progress Summary

| Category | Errors | Status |
|----------|--------|--------|
| API Service | 1 | ✅ FIXED |
| Dashboard Types | 3 | ⏳ PENDING |
| Category Types | 11 | ⏳ PENDING |
| Customer/Mutations | 15 | ⏳ PENDING |
| Order Types | 18 | ⏳ PENDING |
| Supplier Types | 8 | ⏳ PENDING |
| Product Types | 3 | ⏳ PENDING |
| System Service | 2 | ⏳ PENDING |
| **TOTAL** | **61** | **1 FIXED, 60 PENDING** |

---

## 💡 Recommendations

1. **แก้ types ใน packages/types ก่อน** - จะแก้ปัญหาหลายๆ จุดพร้อมกัน
2. **ใช้ React Query v5 API** - `isPending` แทน `isLoading`
3. **Sync types ระหว่าง packages** - ป้องกัน type conflicts
4. **Add missing imports** - NumberInput, etc.
5. **Use optional chaining** - `?.` และ nullish coalescing `??`

---

*รายงานนี้สร้างขึ้นเพื่อติดตามและแก้ไข TypeScript errors อย่างเป็นระบบ*

