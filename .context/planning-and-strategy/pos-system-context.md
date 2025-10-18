# ShopFlow POS System - Context Engineering

## 🎯 **Project Overview**

### **Vision**
สร้างระบบ POS ที่คนทั่วไปสามารถใช้งานได้ทันที โดยมี CMS Web สำหรับจัดการข้อมูลและตั้งค่าต่างๆ รองรับการขยายธุรกิจและความต้องการที่หลากหลาย

### **Target Users**
- **Primary**: เจ้าของร้านค้า/ร้านอาหารขนาดเล็ก-กลาง
- **Secondary**: พนักงานขายที่ต้องการระบบที่ใช้งานง่าย
- **Tertiary**: ผู้จัดการที่ต้องการรายงานและข้อมูลธุรกิจ

### **Core Value Proposition**
- **Simplicity**: ใช้งานได้ทันทีโดยไม่ต้องฝึกอบรม
- **Affordability**: ราคาที่เหมาะสมกับธุรกิจขนาดเล็ก-กลาง
- **Scalability**: ขยายได้ตามการเติบโตของธุรกิจ
- **Reliability**: ระบบที่เสถียรและไม่ล่ม

## 🏗️ **System Architecture**

### **Monorepo Structure**
```
ShopFlow/
├── apps/
│   ├── cms-web/          # CMS Web Management
│   └── pos-frontend/     # POS Terminal
├── packages/
│   ├── api/              # API Services
│   ├── types/            # TypeScript Types
│   ├── ui/               # Shared UI Components
│   └── utils/            # Utility Functions
├── database-design/      # Database Schema
├── migrate/              # Database Migrations
└── docs/                 # Documentation
```

### **Technology Stack**
- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **UI Framework**: Chakra UI
- **State Management**: React Query
- **Payment**: Stripe, PromptPay API
- **Hosting**: Vercel, Supabase Cloud

### **Database Schema**
```sql
Core Tables (12 tables):
- users (authentication & roles)
- branches (multi-branch support)
- products (inventory management)
- categories (product organization)
- customers (customer management)
- orders (sales transactions)
- order_items (order details)
- payments (payment processing)
- inventory_movements (stock tracking)
- promotions (discount system)
- settings (system configuration)
- audit_logs (security tracking)
```

## 🎨 **User Interface Design**

### **Design Principles**
1. **Mobile-First**: ออกแบบสำหรับมือถือเป็นหลัก
2. **Touch-Friendly**: ปุ่มและพื้นที่สัมผัสที่เหมาะสม
3. **Consistent**: ใช้ design system ที่สม่ำเสมอ
4. **Accessible**: รองรับผู้ใช้ทุกกลุ่ม
5. **Fast**: โหลดเร็วและตอบสนองทันที

### **POS Terminal Interface**
```typescript
// Layout Structure
┌─────────────────────────────────────┐
│ Header: Branch | User | Time | Status │
├─────────────────────────────────────┤
│ Product Search & Categories          │
├─────────────────────────────────────┤
│ Product Grid (Touch-friendly)       │
├─────────────────────────────────────┤
│ Shopping Cart & Customer Info        │
├─────────────────────────────────────┤
│ Payment Options & Total              │
└─────────────────────────────────────┘
```

### **CMS Web Interface**
```typescript
// Layout Structure
┌─────────────────────────────────────┐
│ Navigation Sidebar                   │
├─────────────────────────────────────┤
│ Main Content Area                    │
│ - Dashboard                          │
│ - Product Management                 │
│ - Order Management                   │
│ - Customer Management                │
│ - Reports & Analytics                │
│ - Settings & Configuration          │
└─────────────────────────────────────┘
```

## 💼 **Business Logic**

### **Core Workflows**

#### **1. POS Sales Workflow**
```typescript
1. Product Selection
   - Search products by name/barcode
   - Browse categories
   - Add to cart
   
2. Customer Lookup (Optional)
   - Search by phone number
   - Create new customer
   - Apply loyalty points
   
3. Payment Processing
   - Select payment method
   - Process payment
   - Generate receipt
   
4. Order Completion
   - Update inventory
   - Record transaction
   - Send notifications
```

#### **2. Inventory Management Workflow**
```typescript
1. Stock Tracking
   - Monitor stock levels
   - Set low stock alerts
   - Track stock movements
   
2. Product Management
   - Add/edit products
   - Manage variants
   - Set pricing
   
3. Supplier Management
   - Manage suppliers
   - Track purchase orders
   - Monitor deliveries
```

#### **3. Customer Management Workflow**
```typescript
1. Customer Registration
   - Collect basic info
   - Assign loyalty program
   - Set preferences
   
2. Loyalty Program
   - Earn points on purchases
   - Redeem points for discounts
   - Track customer history
   
3. Customer Analytics
   - Purchase patterns
   - Spending analysis
   - Retention metrics
```

### **Business Rules**

#### **Pricing Rules**
```typescript
- Base price + tax calculation
- Volume discounts
- Customer-specific pricing
- Time-based promotions
- Loyalty point discounts
```

#### **Inventory Rules**
```typescript
- Automatic stock deduction on sale
- Low stock alerts
- Stock adjustment tracking
- Multi-location inventory
- Expiry date management
```

#### **Payment Rules**
```typescript
- Multiple payment methods
- Partial payments
- Refund processing
- Payment validation
- Receipt generation
```

## 🔧 **Technical Implementation**

### **API Services Architecture**
```typescript
// Core Services (4 services)
- coreService.ts
  - Products management
  - Categories management
  - Inventory tracking
  - Supplier management

- orderService.ts
  - Order processing
  - Payment handling
  - Customer management
  - Loyalty program

- reportService.ts
  - Sales analytics
  - Inventory reports
  - Customer analytics
  - Financial reports

- systemService.ts
  - User management
  - Branch management
  - Settings configuration
  - Audit logging
```

### **React Hooks Architecture**
```typescript
// Core Hooks (5 hooks)
- useCoreData.ts
  - useProducts()
  - useCategories()
  - useInventory()
  - useSuppliers()

- useOrders.ts
  - useOrders()
  - usePayments()
  - useCustomers()
  - useLoyalty()

- useReports.ts
  - useSalesReports()
  - useInventoryReports()
  - useCustomerReports()
  - useFinancialReports()

- useSystem.ts
  - useUsers()
  - useBranches()
  - useSettings()
  - useAuditLogs()

- useAuth.ts
  - useAuth()
  - usePermissions()
  - useRoles()
```

### **Component Architecture**
```typescript
// Component Structure
src/
├── components/
│   ├── common/
│   │   ├── Layout/
│   │   ├── Navigation/
│   │   ├── Forms/
│   │   └── Charts/
│   ├── pos/
│   │   ├── ProductGrid/
│   │   ├── ShoppingCart/
│   │   ├── Payment/
│   │   └── Receipt/
│   ├── cms/
│   │   ├── Dashboard/
│   │   ├── ProductManagement/
│   │   ├── OrderManagement/
│   │   └── Reports/
│   └── forms/
│       ├── ProductForm/
│       ├── CustomerForm/
│       └── OrderForm/
```

## 📊 **Data Models**

### **Core Entities**

#### **Product**
```typescript
interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  category_id: string;
  price: number;
  cost_price: number;
  stock_quantity: number;
  min_stock_level: number;
  is_active: boolean;
  variants?: ProductVariant[];
  created_at: string;
  updated_at: string;
}
```

#### **Order**
```typescript
interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  branch_id: string;
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;
  updated_at: string;
}
```

#### **Customer**
```typescript
interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  customer_type: 'walk_in' | 'registered';
  loyalty_points: number;
  total_spent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### **Business Logic Models**

#### **Loyalty Program**
```typescript
interface LoyaltyProgram {
  id: string;
  name: string;
  points_per_baht: number;
  minimum_points_to_redeem: number;
  redemption_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

#### **Payment Transaction**
```typescript
interface PaymentTransaction {
  id: string;
  order_id: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  transaction_id?: string;
  created_at: string;
}
```

## 🔒 **Security & Compliance**

### **Authentication & Authorization**
```typescript
// User Roles
- Super Admin: Full system access
- Branch Manager: Branch-specific access
- Cashier: POS terminal access only
- Staff: Limited CMS access

// Permissions
- Read: View data
- Write: Create/Update data
- Delete: Remove data
- Admin: System configuration
```

### **Data Security**
```typescript
// Security Measures
- Row Level Security (RLS)
- Data encryption at rest
- Secure API endpoints
- Input validation
- SQL injection prevention
- XSS protection
```

### **Compliance Requirements**
```typescript
// Thai Business Compliance
- VAT calculation (7%)
- Receipt requirements
- Customer data protection
- Financial reporting
- Audit trail maintenance
```

## 📈 **Performance & Scalability**

### **Performance Targets**
```typescript
// Performance Metrics
- Page load time: < 2 seconds
- API response time: < 500ms
- Database query time: < 100ms
- Bundle size: < 500KB
- Memory usage: < 100MB
```

### **Scalability Considerations**
```typescript
// Scaling Strategy
- Horizontal scaling (multiple instances)
- Database optimization (indexing, query optimization)
- Caching strategies (Redis, CDN)
- Load balancing
- Microservices architecture (future)
```

### **Monitoring & Analytics**
```typescript
// Monitoring Tools
- Application performance monitoring
- Error tracking and logging
- User analytics
- Business metrics tracking
- System health monitoring
```

## 🚀 **Deployment & DevOps**

### **Deployment Strategy**
```typescript
// Deployment Pipeline
1. Development Environment
   - Local development
   - Feature branches
   - Unit testing

2. Staging Environment
   - Integration testing
   - User acceptance testing
   - Performance testing

3. Production Environment
   - Blue-green deployment
   - Rollback capability
   - Monitoring and alerting
```

### **CI/CD Pipeline**
```typescript
// Continuous Integration
- Code quality checks
- Automated testing
- Security scanning
- Performance testing
- Deployment automation
```

### **Infrastructure**
```typescript
// Infrastructure Stack
- Frontend: Vercel (Next.js)
- Backend: Supabase Cloud
- Database: PostgreSQL
- CDN: Vercel Edge Network
- Monitoring: Vercel Analytics
```

## 📚 **Documentation & Training**

### **Technical Documentation**
```typescript
// Documentation Structure
- API Documentation
- Database Schema
- Component Library
- Deployment Guide
- Troubleshooting Guide
```

### **User Documentation**
```typescript
// User Guides
- POS Terminal User Guide
- CMS Web User Guide
- Administrator Guide
- Troubleshooting Guide
- Video Tutorials
```

### **Training Materials**
```typescript
// Training Resources
- Online tutorials
- Video demonstrations
- Interactive guides
- FAQ section
- Support contact information
```

## 🔄 **Maintenance & Updates**

### **Maintenance Schedule**
```typescript
// Regular Maintenance
- Daily: System health checks
- Weekly: Performance monitoring
- Monthly: Security updates
- Quarterly: Feature updates
- Annually: Major version updates
```

### **Update Strategy**
```typescript
// Update Process
- Feature flag system
- Gradual rollout
- A/B testing
- User feedback collection
- Rollback capability
```

---

**This context engineering document provides comprehensive information about the ShopFlow POS system, enabling developers and stakeholders to understand the system architecture, business logic, and implementation details.**
