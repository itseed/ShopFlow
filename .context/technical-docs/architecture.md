# ShopFlow Architecture Documentation

## 🏗️ สถาปัตยกรรมระบบ

ShopFlow ใช้ **Monorepo Architecture** ที่ประกอบด้วยหลายแอปพลิเคชันและ packages ร่วมกัน

## 📁 โครงสร้างโปรเจ็ค

```
ShopFlow/
├── apps/                          # แอปพลิเคชันหลัก
│   ├── cms-web/                   # CMS Dashboard (Port 3001)
│   └── pos-frontend/              # POS Terminal (Port 3000)
├── packages/                      # Packages ร่วม
│   ├── api/                       # API Services
│   ├── types/                     # TypeScript Types
│   ├── ui/                        # UI Components
│   └── utils/                     # Utilities
├── migrate/                       # Database Migrations
├── nginx/                         # Nginx Configuration
├── docs/                          # Documentation
└── scripts/                       # Build Scripts
```

## 🔄 Monorepo Structure

### **Apps Layer**
- **cms-web**: Admin dashboard สำหรับจัดการธุรกิจ
- **pos-frontend**: POS terminal สำหรับพนักงานขาย

### **Packages Layer**
- **@shopflow/api**: Shared API services และ database operations
- **@shopflow/types**: TypeScript type definitions
- **@shopflow/ui**: Reusable UI components
- **@shopflow/utils**: Common utilities และ helper functions

## 🌐 Application Architecture

### **CMS Web Application**
```
┌─────────────────────────────────────┐
│           CMS Web (3001)            │
├─────────────────────────────────────┤
│  Pages:                              │
│  ├── dashboard/                     │
│  ├── catalog/ (products, categories)│
│  ├── orders/                        │
│  ├── customers/                     │
│  ├── reports/                       │
│  └── settings/                      │
├─────────────────────────────────────┤
│  Components:                        │
│  ├── auth/ (guards)                 │
│  ├── orders/                        │
│  ├── reports/                       │
│  └── realtime/                      │
├─────────────────────────────────────┤
│  Lib:                               │
│  ├── hooks/ (custom hooks)          │
│  ├── services/ (API calls)          │
│  └── utils/ (utilities)             │
└─────────────────────────────────────┘
```

### **POS Frontend Application**
```
┌─────────────────────────────────────┐
│        POS Frontend (3000)          │
├─────────────────────────────────────┤
│  Pages:                              │
│  ├── sales/ (main POS interface)    │
│  ├── products/                      │
│  ├── orders/                        │
│  ├── inventory/                     │
│  ├── customers/                     │
│  ├── reports/                       │
│  └── settings/                      │
├─────────────────────────────────────┤
│  Components:                        │
│  ├── auth/                          │
│  ├── payment/                       │
│  ├── orders/                        │
│  ├── layout/                        │
│  └── ui/                            │
├─────────────────────────────────────┤
│  Contexts:                          │
│  ├── AuthContext                    │
│  └── SalesContext                   │
├─────────────────────────────────────┤
│  Hooks:                             │
│  ├── useBarcodeScanner              │
│  ├── useCustomers                  │
│  ├── useReports                    │
│  └── useStockAlerts                │
└─────────────────────────────────────┘
```

## 🔌 API Architecture

### **@shopflow/api Package**
```
┌─────────────────────────────────────┐
│           @shopflow/api             │
├─────────────────────────────────────┤
│  Services:                          │
│  ├── productService                 │
│  ├── categoryService                │
│  ├── orderService                   │
│  ├── customerService                │
│  ├── supplierService                │
│  ├── inventoryService               │
│  ├── reportService                  │
│  ├── stockMovementService           │
│  ├── purchaseOrderService           │
│  ├── paymentTransactionService      │
│  ├── userService                    │
│  ├── branchService                  │
│  └── realtimeService                │
├─────────────────────────────────────┤
│  Types:                             │
│  ├── ApiResponse                    │
│  ├── Pagination                     │
│  └── Filters                        │
├─────────────────────────────────────┤
│  Supabase:                          │
│  ├── Database connection            │
│  ├── Authentication                │
│  └── Real-time subscriptions       │
└─────────────────────────────────────┘
```

## 🗄️ Database Architecture

### **Supabase (PostgreSQL)**
```
┌─────────────────────────────────────┐
│           Supabase Database         │
├─────────────────────────────────────┤
│  Core Tables:                       │
│  ├── branches                       │
│  ├── user_profiles                  │
│  ├── categories                     │
│  ├── products                       │
│  ├── orders                         │
│  ├── order_items                    │
│  ├── customers                      │
│  ├── suppliers                      │
│  ├── stock_movements                │
│  ├── purchase_orders                │
│  └── payment_transactions           │
├─────────────────────────────────────┤
│  Views:                             │
│  ├── low_stock_view                 │
│  └── inventory_summary              │
├─────────────────────────────────────┤
│  Functions:                         │
│  ├── update_stock()                 │
│  ├── refund_order()                 │
│  └── update_order_payment_status()  │
└─────────────────────────────────────┘
```

## 🔄 Data Flow

### **POS Sales Flow**
```
User Input → POS Frontend → @shopflow/api → Supabase → Real-time Update → CMS Dashboard
```

### **Product Management Flow**
```
CMS Dashboard → @shopflow/api → Supabase → Real-time Update → POS Frontend
```

### **Inventory Management Flow**
```
Stock Movement → Supabase → Real-time Update → Both Applications
```

## 🐳 Deployment Architecture

### **Docker Compose Setup**
```
┌─────────────────┐    ┌─────────────────┐
│   POS Frontend  │    │    CMS Web      │
│   (Port 3000)   │    │   (Port 3001)   │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
            ┌─────────────────┐
            │     Nginx        │
            │  Reverse Proxy  │
            │  (Port 80/443)  │
            └─────────────────┘
                     │
            ┌─────────────────┐
            │    Supabase     │
            │   (External)    │
            └─────────────────┘
```

### **Nginx Configuration**
- **pos.yourdomain.com** → POS Frontend (Port 3000)
- **cms.yourdomain.com** → CMS Web (Port 3001)
- **SSL/HTTPS** support
- **Load balancing** ready

## 🔐 Security Architecture

### **Authentication Flow**
```
User Login → Supabase Auth → JWT Token → Protected Routes
```

### **Authorization Levels**
- **Admin**: Full access to all features
- **Manager**: Access to reports and settings
- **Staff**: Limited access to POS and basic features

### **Data Protection**
- **Row Level Security (RLS)** in Supabase
- **Input validation** on all forms
- **SQL injection** protection
- **XSS protection** with proper headers

## 📱 Real-time Architecture

### **Supabase Real-time**
```
Database Changes → Supabase Realtime → WebSocket → Frontend Updates
```

### **Supported Real-time Events**
- Product updates
- Order status changes
- Inventory movements
- Customer updates

## 🎨 UI/UX Architecture

### **Design System**
- **Chakra UI v2** - Primary component library
- **Tailwind CSS** - Utility classes (POS only)
- **Framer Motion** - Animations
- **Custom Themes** - Brand-specific styling

### **Responsive Design**
- **Mobile First** approach
- **Touch-friendly** interfaces
- **Progressive Web App** capabilities
- **Cross-platform** compatibility

## 🔧 Development Architecture

### **Build Process**
```
Source Code → TypeScript Compilation → Next.js Build → Static Export → Docker Image
```

### **Development Workflow**
1. **Local Development** - Hot reloading with Next.js
2. **Type Checking** - TypeScript compilation
3. **Linting** - ESLint for code quality
4. **Testing** - Jest for unit tests
5. **Build** - Production build
6. **Deploy** - Docker deployment

## 📊 Monitoring & Analytics

### **Application Monitoring**
- **Error Tracking** - Error boundaries
- **Performance Monitoring** - Core Web Vitals
- **User Analytics** - Usage patterns
- **Business Metrics** - Sales and inventory data

---

*เอกสารนี้เป็นส่วนหนึ่งของ Context Engineering สำหรับ ShopFlow Project*
