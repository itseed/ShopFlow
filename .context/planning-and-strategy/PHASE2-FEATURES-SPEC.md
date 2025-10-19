# Phase 2 Features Specification
**Phase:** Business Features (Months 4-6)  
**Created:** January 18, 2025

---

## 🎯 **Overview**

Phase 2 เพิ่มฟีเจอร์ทางธุรกิจที่จำเป็นสำหรับการบริหารจัดการร้านค้า ประกอบด้วย 4 ระบบหลัก

---

## 📦 **1. Advanced Inventory Management**

### **1.1 Supplier Management**

**Purpose:** จัดการข้อมูลซัพพลายเออร์และการสั่งซื้อสินค้า

**Features:**
- ข้อมูลซัพพลายเออร์ (ชื่อ, ที่อยู่, เบอร์โทร, เงื่อนไขการชำระ)
- ประวัติการสั่งซื้อ
- ประเมินประสิทธิภาพซัพพลายเออร์
- สินค้าจากแต่ละซัพพลายเออร์

**UI Screens:**
```
CMS Web:
├── /catalog/suppliers - รายการซัพพลายเออร์
├── /catalog/suppliers/[id] - รายละเอียดซัพพลายเออร์
└── /catalog/suppliers/new - เพิ่มซัพพลายเออร์ใหม่
```

**Database:**
```sql
suppliers (id, name, contact_person, phone, email, address, 
          tax_id, payment_terms, notes, is_active)
```

---

### **1.2 Purchase Order System**

**Purpose:** ระบบสั่งซื้อสินค้าจากซัพพลายเออร์

**Features:**
- สร้างใบสั่งซื้อ (PO)
- รับสินค้าเข้าระบบ
- ตรวจสอบความถูกต้อง (Reconciliation)
- อัพเดต stock อัตโนมัติ
- ติดตาม PO status

**Workflow:**
```
1. Create PO
   ├── Select supplier
   ├── Add products & quantities
   ├── Set expected date
   └── Submit for approval

2. Receive PO
   ├── Scan/enter received quantities
   ├── Check quality
   ├── Update stock levels
   └── Mark as received/partial

3. Track
   ├── Pending POs
   ├── Partially received
   └── Completed POs
```

**UI Screens:**
```
CMS Web:
├── /inventory/purchase-orders - รายการ PO
├── /inventory/purchase-orders/new - สร้าง PO ใหม่
├── /inventory/purchase-orders/[id] - รายละเอียด PO
└── /inventory/purchase-orders/[id]/receive - รับสินค้า
```

**Database:**
```sql
purchase_orders (id, po_number, supplier_id, branch_id, 
                order_date, expected_date, received_date,
                status, subtotal, tax, total_amount)

purchase_order_items (id, purchase_order_id, product_id,
                     quantity, received_quantity, unit_cost)
```

---

### **1.3 Stock Transfers**

**Purpose:** โอนสินค้าระหว่างสาขา

**Features:**
- สร้างใบโอนสินค้า
- อนุมัติการโอน (Approval workflow)
- รับสินค้าที่สาขาปลายทาง
- อัพเดต stock ทั้งสองสาขา

**Workflow:**
```
1. Create Transfer
   ├── From: Branch A
   ├── To: Branch B
   ├── Select products
   └── Submit

2. Approve
   ├── Manager reviews
   └── Approves/Rejects

3. Ship
   ├── Deduct from Branch A
   └── Status: In Transit

4. Receive
   ├── Add to Branch B
   └── Status: Completed
```

**UI Screens:**
```
CMS Web:
├── /inventory/transfers - รายการ transfers
├── /inventory/transfers/new - สร้าง transfer
├── /inventory/transfers/[id] - รายละเอียด
└── /inventory/transfers/[id]/receive - รับสินค้า
```

**Database:**
```sql
stock_transfers (id, transfer_number, from_branch_id, to_branch_id,
                transfer_date, status, notes, created_by, approved_by)

stock_transfer_items (id, transfer_id, product_id,
                     quantity, received_quantity)
```

---

### **1.4 Product Variants**

**Purpose:** รองรับสินค้าหลายแบบ (Size, Color, etc.)

**Features:**
- กำหนด variants (Size: S/M/L, Color: Red/Blue)
- ราคาต่าง variant
- Stock แยกตาม variant
- Barcode แยกตาม variant

**Example:**
```
Product: T-Shirt
├── Variant: Small-Red (SKU: TSH-S-R, Stock: 10)
├── Variant: Small-Blue (SKU: TSH-S-B, Stock: 15)
├── Variant: Medium-Red (SKU: TSH-M-R, Stock: 20)
└── Variant: Large-Blue (SKU: TSH-L-B, Stock: 5)
```

**UI Screens:**
```
CMS Web:
└── /catalog/products/[id]
    └── Variants Tab
        ├── Add variant
        ├── Edit variant
        └── Stock per variant

POS:
└── Product selection
    └── Variant selector popup
```

**Database:**
```sql
product_variants (id, product_id, variant_name, sku,
                 price, stock_quantity, barcode)
```

---

## 👤 **2. Customer & Loyalty System**

### **2.1 Customer Groups**

**Purpose:** จัดกลุ่มลูกค้าและกำหนดส่วนลด

**Features:**
- สร้างกลุ่มลูกค้า (VIP, Wholesale, Regular)
- กำหนดส่วนลดต่อกลุ่ม
- มอบหมายลูกค้าเข้ากลุ่ม
- ส่วนลดอัตโนมัติตอนขาย

**Groups Example:**
```
VIP Group
├── Discount: 10%
├── Benefits: Free shipping, Priority support
└── Members: 150 customers

Wholesale Group
├── Discount: 15%
├── Benefits: Bulk pricing
└── Members: 25 customers

Regular Group
├── Discount: 0%
└── Members: 500 customers
```

**UI Screens:**
```
CMS Web:
├── /customers/groups - จัดการกลุ่ม
├── /customers - แสดงกลุ่มในรายการ
└── /customers/[id] - มอบหมายกลุ่ม
```

---

### **2.2 Loyalty Program Enhancement**

**Purpose:** ปรับปรุงระบบสะสมแต้มให้ทรงพลังขึ้น

**Current (From Phase 1):**
- ✅ Phone lookup
- ✅ Auto points (1 baht = 1 point)
- ✅ 4 Tiers (Bronze, Silver, Gold, Platinum)
- ✅ Points display

**Phase 2 Enhancements:**
```typescript
// Points Redemption
- Redeem points for discounts
- Points redemption catalog
- Minimum redemption amount
- Points to cash conversion

// Tier Benefits
- Tier-specific discounts
- Birthday bonus points (2x, 3x)
- Exclusive promotions
- Priority customer service

// Analytics
- Points earned vs redeemed
- Tier distribution
- Program effectiveness
- ROI calculation
```

**UI Screens:**
```
CMS Web:
├── /customers/loyalty-program - Program settings
├── /customers/loyalty-analytics - Analytics dashboard
└── /customers/redemption-catalog - Redemption items

POS:
├── Point Redemption button in checkout
└── Tier benefits display
```

---

### **2.3 Customer Analytics**

**Purpose:** วิเคราะห์พฤติกรรมและมูลค่าลูกค้า

**RFM Analysis:**
```
Recency: เมื่อไหร่ที่ซื้อล่าสุด
Frequency: ซื้อบ่อยแค่ไหน
Monetary: ใช้จ่ายเท่าไหร่

Segments:
├── Champions (High R, F, M) - ลูกค้าดีที่สุด
├── Loyal Customers (High F, M)
├── At Risk (Low R) - เสี่ยงจะหายไป
├── Lost Customers (Very Low R)
└── New Customers (High R, Low F)
```

**Customer Lifetime Value (LTV):**
```
LTV = Average Order Value × Purchase Frequency × Customer Lifespan

Example:
├── Average Order: ฿500
├── Frequency: 2 times/month
├── Lifespan: 12 months
└── LTV = ฿500 × 2 × 12 = ฿12,000
```

**UI Screens:**
```
CMS Web:
├── /reports/customers - Customer analytics
├── /reports/rfm-analysis - RFM segmentation
└── /reports/customer-ltv - Lifetime value
```

---

## 🏢 **3. Multi-Branch Operations**

### **3.1 Branch Switching**

**Purpose:** เปลี่ยนสาขาได้ง่ายใน POS และ CMS

**Features:**
- Branch selector dropdown
- Auto-save current branch
- Branch-specific data filtering
- Permission-based branch access

**UI:**
```
Header Component:
┌─────────────────────────────────┐
│ ShopFlow    [Branch: Main ▼]  │
│                                 │
│ Select Branch:                  │
│ ✓ Main Branch                   │
│   Branch 2                      │
│   Branch 3                      │
└─────────────────────────────────┘
```

---

### **3.2 Cross-Branch Inventory**

**Purpose:** ดูสินค้าทุกสาขาจากที่เดียว

**Features:**
- แสดง stock ทุกสาขา
- ค้นหาสินค้าข้ามสาขา
- แนะนำโอนสินค้าอัตโนมัติ
- ดู stock movement ทุกสาขา

**UI:**
```
Product Detail:
┌────────────────────────────────┐
│ Product: iPhone 15 Pro         │
├────────────────────────────────┤
│ Stock by Branch:               │
│ ├── Main Branch:    25 units   │
│ ├── Branch 2:       10 units   │
│ └── Branch 3:        5 units   │
│ Total:              40 units   │
└────────────────────────────────┘
```

---

### **3.3 Branch Comparison Reports**

**Purpose:** เปรียบเทียบผลงานระหว่างสาขา

**Reports:**
```typescript
// Sales Comparison
- Revenue by branch
- Orders by branch
- Average order value
- Growth rate

// Inventory Comparison
- Stock levels
- Turnover rate
- Dead stock
- Stockout frequency

// Staff Comparison
- Sales per staff
- Orders processed
- Customer satisfaction
```

**UI:**
```
/reports/branch-comparison
├── Sales charts (bar, line)
├── Inventory metrics
├── Staff performance
└── Export functionality
```

---

## 📊 **4. Advanced Reporting**

### **4.1 Sales Analytics**

**Reports:**
```
1. Sales Trends
   ├── Daily/Weekly/Monthly trends
   ├── Year-over-year comparison
   ├── Forecasting
   └── Seasonal analysis

2. Top Products
   ├── Best sellers
   ├── Revenue by product
   ├── Profit margin
   └── Category performance

3. Sales by Time
   ├── Peak hours
   ├── Day of week analysis
   └── Monthly patterns

4. Sales by Method
   ├── Cash vs Card vs QR
   ├── Payment method trends
   └── Transaction sizes
```

---

### **4.2 Customer Analytics**

**Reports:**
```
1. Customer Lifetime Value
   ├── Top customers by LTV
   ├── Average LTV by segment
   └── LTV trends

2. Purchase Behavior
   ├── Average basket size
   ├── Purchase frequency
   ├── Category preferences
   └── Cross-sell opportunities

3. Customer Retention
   ├── Retention rate
   ├── Churn rate
   ├── At-risk customers
   └── Win-back campaigns
```

---

### **4.3 Inventory Analytics**

**Reports:**
```
1. Stock Turnover
   ├── Turnover rate by product
   ├── Turnover rate by category
   ├── Days to sell
   └── Slow-moving items

2. Stock Value
   ├── Total inventory value
   ├── Value by category
   ├── Value by branch
   └── Dead stock value

3. Reorder Analysis
   ├── Products to reorder
   ├── Optimal order quantity
   ├── Order frequency
   └── Stockout prevention
```

---

### **4.4 Financial Reports**

**Reports:**
```
1. Profit & Loss
   ├── Revenue
   ├── Cost of goods sold
   ├── Gross profit
   ├── Operating expenses
   └── Net profit

2. Margin Analysis
   ├── Gross margin by product
   ├── Gross margin by category
   ├── Margin trends
   └── Low margin alerts

3. Tax Reports
   ├── VAT summary (7%)
   ├── VAT by period
   ├── Tax compliance reports
   └── Export for accountant
```

---

### **4.5 Export Features**

**Formats:**
```typescript
// Excel Export
- Formatted tables
- Charts included
- Multiple sheets
- Formulas preserved

// PDF Export
- Professional layout
- Charts and graphs
- Company header/footer
- Page numbers

// CSV Export
- Raw data
- For further analysis
- Import to other tools

// Scheduled Reports
- Daily/Weekly/Monthly
- Email delivery
- Auto-generate
- Custom recipients
```

---

## 🎨 **UI/UX Design**

### **Design Principles**

1. **Progressive Disclosure**
   - Show basic info first
   - Advanced features in tabs/accordions
   - Minimal clicks to common tasks

2. **Guided Workflows**
   - Wizard for complex processes
   - Step indicators
   - Validation at each step
   - Save draft functionality

3. **Data Visualization**
   - Charts for trends
   - Gauges for metrics
   - Color-coded indicators
   - Responsive tables

4. **Mobile-Friendly**
   - Touch-friendly buttons (48px min)
   - Responsive layouts
   - Simplified mobile views
   - Swipe gestures

---

## 🔌 **API Structure**

### **New Service: inventoryService.ts**

```typescript
/**
 * Inventory Service - Advanced Inventory Management
 * Phase 2: Business Features
 */

export const inventoryService = {
  // Suppliers
  suppliers: {
    getAll(params),
    getById(id),
    create(supplier),
    update(id, updates),
    delete(id),
    getProducts(supplierId),
    getPerformance(supplierId, dateRange),
  },
  
  // Purchase Orders
  purchaseOrders: {
    getAll(params),
    getById(id),
    create(poData),
    update(id, updates),
    receive(id, items),
    cancel(id, reason),
    getItems(id),
    getBySupplier(supplierId),
    getPending(branchId),
  },
  
  // Stock Transfers
  stockTransfers: {
    getAll(params),
    getById(id),
    create(transferData),
    approve(id, approverId),
    receive(id, items),
    cancel(id, reason),
    getItems(id),
    getPendingApproval(branchId),
    getInTransit(branchId),
  },
  
  // Product Variants
  variants: {
    getByProduct(productId),
    getById(id),
    create(variant),
    update(id, updates),
    delete(id),
    updateStock(id, quantity, movementType),
    getBySku(sku),
    getByBarcode(barcode),
  },
};
```

### **Service Extensions**

```typescript
// Extend coreService.ts
export const inventory = {
  ...existing,
  getReorderAlerts(branchId),
  getExpiringProducts(branchId, days),
  getStockByBranch(productId),
  getStockValue(branchId),
  getStockTurnover(params),
  getDeadStock(params),
};

// Extend orderService.ts
export const customers = {
  ...existing,
  getByGroup(groupId),
  assignToGroup(customerId, groupId),
  getSegmentation(params),
  getLifetimeValue(customerId),
  getRFMScore(customerId),
  getAtRisk(params),
};

export const customerGroups = {
  getAll(),
  getById(id),
  create(group),
  update(id, updates),
  delete(id),
  getMembers(groupId),
  getStats(groupId),
};

// Extend reportService.ts
export const advanced = {
  // Sales
  salesTrends(params),
  topProducts(params),
  salesByHour(params),
  salesByStaff(params),
  
  // Customer
  customerLTV(params),
  customerSegmentation(),
  rfmAnalysis(params),
  purchaseBehavior(params),
  
  // Inventory
  stockTurnover(params),
  deadStock(params),
  fastMoving(params),
  reorderAnalysis(params),
  
  // Financial
  profitLoss(params),
  revenueBreakdown(params),
  marginAnalysis(params),
  taxReports(params),
};

export const exports = {
  toExcel(reportData, options),
  toPDF(reportData, options),
  toCSV(data),
  schedule(config),
  unschedule(scheduleId),
  getScheduled(),
};
```

---

## 🎣 **React Hooks Additions**

### **Add to useCoreData.ts**
```typescript
// Suppliers
export function useSuppliers(params);
export function useSupplier(id);
export function useCreateSupplier();
export function useSupplierProducts(supplierId);
export function useSupplierPerformance(supplierId);

// Purchase Orders
export function usePurchaseOrders(params);
export function usePurchaseOrder(id);
export function useCreatePurchaseOrder();
export function useReceivePurchaseOrder();
export function usePendingPurchaseOrders(branchId);

// Stock Transfers
export function useStockTransfers(params);
export function useStockTransfer(id);
export function useCreateStockTransfer();
export function useApproveStockTransfer();
export function useReceiveStockTransfer();

// Product Variants
export function useProductVariants(productId);
export function useVariant(id);
export function useCreateVariant();
export function useUpdateVariantStock();
```

### **Add to useOrders.ts**
```typescript
// Customer Groups
export function useCustomerGroups();
export function useCustomerGroup(id);
export function useCreateCustomerGroup();
export function useAssignCustomerToGroup();
export function useCustomersByGroup(groupId);

// Customer Analytics
export function useCustomerLifetimeValue(customerId);
export function useCustomerRFMScore(customerId);
export function useCustomerSegmentation();
export function useAtRiskCustomers();
```

### **Add to useReports.ts**
```typescript
// Advanced Sales Reports
export function useSalesTrends(params);
export function useTopProducts(params);
export function useSalesByHour(params);
export function useSalesByStaff(params);

// Customer Reports
export function useCustomerLTVReport();
export function useRFMAnalysis();
export function usePurchaseBehaviorReport();

// Inventory Reports
export function useStockTurnoverReport();
export function useDeadStockReport();
export function useFastMovingReport();

// Financial Reports
export function useProfitLossReport(params);
export function useMarginAnalysisReport();
export function useTaxReport(params);

// Export
export function useExportReport();
export function useScheduleReport();
```

---

## 🎯 **Success Metrics**

### **Technical Metrics**
- Database performance: < 100ms
- API response: < 500ms
- Report generation: < 10 seconds
- Export generation: < 30 seconds
- Real-time sync: < 2 seconds

### **Business Metrics**
- Stock accuracy: 99%+
- Inventory turnover: +20%
- Customer registration: 70% of transactions
- Loyalty enrollment: 60% of customers
- Multi-branch adoption: 100%
- Report usage: 80% of managers

### **User Experience**
- Feature adoption: 75%+
- User satisfaction: 4.5+ stars
- Training time: < 1 hour
- Error rate: < 1%
- Support tickets: < 10/week

---

## 📦 **Deliverables**

### **Database**
- 7 new tables
- Enhanced existing tables
- Migration scripts
- Rollback procedures

### **API Services**
- 1 new service (inventoryService)
- Extended 3 existing services
- ~3,000 lines of new code

### **React Hooks**
- ~25 new hooks
- Enhanced existing hooks
- Optimized caching

### **UI Components**
- ~15 new pages
- ~20 new components
- Enhanced existing components

### **Documentation**
- Service documentation
- User guides
- API reference
- Migration guides

---

## 🚀 **Next Steps**

1. Review and approve Phase 2 plan
2. Merge Phase 1 to main
3. Create Phase 2 branch
4. Start Month 4: Inventory Management

---

**Plan Status:** ✅ Ready for Review  
**Dependencies:** Phase 1 Complete  
**Start Date:** TBD (After Phase 1 merge)  
**Created:** January 18, 2025

