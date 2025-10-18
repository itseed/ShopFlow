# ShopFlow API Reference

## 🔌 API Services Overview

ShopFlow ใช้ **@shopflow/api** package ที่ประกอบด้วย 14 services หลักสำหรับจัดการข้อมูลและธุรกรรมต่างๆ

## 📦 Available Services

### **Core Services**

#### 1. **productService**
```typescript
// Product management operations
- getAllProducts(filters?: ProductFilters): Promise<ApiResponse<Product[]>>
- getProductById(id: string): Promise<ApiResponse<Product>>
- createProduct(data: CreateProductData): Promise<ApiResponse<Product>>
- updateProduct(id: string, data: UpdateProductData): Promise<ApiResponse<Product>>
- deleteProduct(id: string): Promise<ApiResponse<void>>
- updateStock(id: string, data: StockUpdateData): Promise<ApiResponse<Product>>
```

#### 2. **categoryService**
```typescript
// Category management operations
- getAllCategories(filters?: CategoryFilters): Promise<ApiResponse<Category[]>>
- getCategoryById(id: string): Promise<ApiResponse<Category>>
- createCategory(data: CreateCategoryData): Promise<ApiResponse<Category>>
- updateCategory(id: string, data: UpdateCategoryData): Promise<ApiResponse<Category>>
- deleteCategory(id: string): Promise<ApiResponse<void>>
```

#### 3. **orderService**
```typescript
// Order management operations
- getAllOrders(filters?: OrderFilters): Promise<ApiResponse<Order[]>>
- getOrderById(id: string): Promise<ApiResponse<Order>>
- createOrder(data: CreateOrderData): Promise<ApiResponse<Order>>
- updateOrder(id: string, data: UpdateOrderData): Promise<ApiResponse<Order>>
- cancelOrder(id: string): Promise<ApiResponse<Order>>
- getOrderStats(): Promise<ApiResponse<OrderStats>>
```

#### 4. **customerService**
```typescript
// Customer management operations
- getAllCustomers(filters?: CustomerFilters): Promise<ApiResponse<Customer[]>>
- getCustomerById(id: string): Promise<ApiResponse<Customer>>
- createCustomer(data: CreateCustomerData): Promise<ApiResponse<Customer>>
- updateCustomer(id: string, data: UpdateCustomerData): Promise<ApiResponse<Customer>>
- deleteCustomer(id: string): Promise<ApiResponse<void>>
```

### **Business Services**

#### 5. **supplierService**
```typescript
// Supplier management operations
- getAllSuppliers(filters?: SupplierFilters): Promise<ApiResponse<Supplier[]>>
- getSupplierById(id: string): Promise<ApiResponse<Supplier>>
- createSupplier(data: CreateSupplierData): Promise<ApiResponse<Supplier>>
- updateSupplier(id: string, data: UpdateSupplierData): Promise<ApiResponse<Supplier>>
- deleteSupplier(id: string): Promise<ApiResponse<void>>
- getSupplierStats(id: string): Promise<ApiResponse<SupplierWithStats>>
```

#### 6. **inventoryService**
```typescript
// Inventory management operations
- getInventorySummary(): Promise<ApiResponse<InventorySummary[]>>
- getProductInventoryStatus(productId: string): Promise<ApiResponse<ProductInventoryStatus>>
- createInventoryAdjustment(data: CreateInventoryAdjustment): Promise<ApiResponse<InventoryAdjustment>>
- getLowStockAlerts(): Promise<ApiResponse<LowStockAlert[]>>
```

#### 7. **stockMovementService**
```typescript
// Stock movement operations
- getAllStockMovements(filters?: StockMovementFilters): Promise<ApiResponse<StockMovement[]>>
- getProductStockMovements(productId: string): Promise<ApiResponse<StockMovement[]>>
- createStockMovement(data: CreateStockMovement): Promise<ApiResponse<StockMovement>>
- updateStockMovement(id: string, data: Partial<StockMovement>): Promise<ApiResponse<StockMovement>>
```

#### 8. **purchaseOrderService**
```typescript
// Purchase order operations
- getAllPurchaseOrders(filters?: PurchaseOrderFilters): Promise<ApiResponse<PurchaseOrder[]>>
- getPurchaseOrderById(id: string): Promise<ApiResponse<PurchaseOrder>>
- createPurchaseOrder(data: PurchaseOrderFormData): Promise<ApiResponse<PurchaseOrder>>
- updatePurchaseOrderStatus(id: string, status: UpdatePurchaseOrderStatus): Promise<ApiResponse<PurchaseOrder>>
- receivePurchaseOrderItem(orderId: string, itemId: string, data: ReceivePurchaseOrderItem): Promise<ApiResponse<void>>
```

### **Financial Services**

#### 9. **paymentTransactionService**
```typescript
// Payment transaction operations
- getAllPaymentTransactions(filters?: PaymentFilters): Promise<ApiResponse<Payment[]>>
- getPaymentTransactionById(id: string): Promise<ApiResponse<Payment>>
- createPaymentTransaction(data: CreatePaymentData): Promise<ApiResponse<Payment>>
- updatePaymentTransaction(id: string, data: UpdatePaymentData): Promise<ApiResponse<Payment>>
- refundPaymentTransaction(id: string, amount: number): Promise<ApiResponse<Payment>>
```

#### 10. **reportService**
```typescript
// Reporting operations
- getSalesReport(filters: ReportFilters): Promise<ApiResponse<SalesReport>>
- getProductReport(filters: ReportFilters): Promise<ApiResponse<ProductReport>>
- getCustomerReport(filters: ReportFilters): Promise<ApiResponse<CustomerReport>>
- getInventoryReport(filters: ReportFilters): Promise<ApiResponse<InventoryReport>>
- getProfitLossReport(filters: ReportFilters): Promise<ApiResponse<ProfitLossReport>>
- getBranchComparisonReport(filters: ReportFilters): Promise<ApiResponse<BranchComparisonReport>>
```

### **System Services**

#### 11. **userService**
```typescript
// User management operations
- getAllUsers(filters?: UserFilters): Promise<ApiResponse<User[]>>
- getUserById(id: string): Promise<ApiResponse<User>>
- createUser(data: CreateUserData): Promise<ApiResponse<User>>
- updateUser(id: string, data: UpdateUserData): Promise<ApiResponse<User>>
- deleteUser(id: string): Promise<ApiResponse<void>>
- getUserProfile(id: string): Promise<ApiResponse<UserProfile>>
```

#### 12. **branchService**
```typescript
// Branch management operations
- getAllBranches(filters?: BranchFilters): Promise<ApiResponse<Branch[]>>
- getBranchById(id: string): Promise<ApiResponse<Branch>>
- createBranch(data: CreateBranchData): Promise<ApiResponse<Branch>>
- updateBranch(id: string, data: UpdateBranchData): Promise<ApiResponse<Branch>>
- deleteBranch(id: string): Promise<ApiResponse<void>>
- getBranchStats(id: string): Promise<ApiResponse<BranchStats>>
- getBranchPerformance(id: string): Promise<ApiResponse<BranchPerformance>>
```

#### 13. **realtimeService**
```typescript
// Real-time operations
- subscribeToProductUpdates(callback: ProductRealtimeCallback): () => void
- subscribeToOrderUpdates(callback: OrderRealtimeCallback): () => void
- subscribeToOrderItemUpdates(callback: OrderItemRealtimeCallback): () => void
- subscribeToInventoryUpdates(callback: InventoryRealtimeCallback): () => void
- unsubscribeFromAll(): void
```

## 🔧 API Configuration

### **Supabase Connection**
```typescript
// Database connection setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### **Authentication**
```typescript
// User authentication
- getCurrentUser(): Promise<User | null>
- getCurrentSession(): Promise<Session | null>
- onAuthStateChange(callback: (event: string, session: Session | null) => void): () => void
```

## 📊 Data Types

### **Core Types**
```typescript
// API Response wrapper
interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

// Pagination
interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Filters
interface ProductFilters {
  category?: string
  status?: ProductStatus
  search?: string
  minPrice?: number
  maxPrice?: number
  lowStock?: boolean
}
```

### **Business Types**
```typescript
// Product types
interface Product {
  id: string
  sku: string
  name: string
  description?: string
  price: number
  discountPrice?: number
  stock: number
  minStock: number
  categoryId: string
  supplierId?: string
  status: ProductStatus
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

// Order types
interface Order {
  id: string
  orderNumber: string
  customerId?: string
  branchId: string
  userId: string
  status: OrderStatus
  totalAmount: number
  discountAmount: number
  finalAmount: number
  paymentStatus: PaymentStatus
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}
```

## 🔄 Real-time Subscriptions

### **Product Updates**
```typescript
// Subscribe to product changes
const unsubscribe = realtimeService.subscribeToProductUpdates((product) => {
  console.log('Product updated:', product)
  // Update UI with new product data
})
```

### **Order Updates**
```typescript
// Subscribe to order changes
const unsubscribe = realtimeService.subscribeToOrderUpdates((order) => {
  console.log('Order updated:', order)
  // Update order status in UI
})
```

### **Inventory Updates**
```typescript
// Subscribe to inventory changes
const unsubscribe = realtimeService.subscribeToInventoryUpdates((inventory) => {
  console.log('Inventory updated:', inventory)
  // Update stock levels in UI
})
```

## 🛡️ Error Handling

### **Standard Error Response**
```typescript
interface ApiError {
  message: string
  code: string
  details?: any
}

// Example usage
try {
  const response = await productService.getAllProducts()
  if (!response.success) {
    console.error('API Error:', response.error)
  }
} catch (error) {
  console.error('Network Error:', error)
}
```

## 📝 Usage Examples

### **Creating a Product**
```typescript
import { productService } from '@shopflow/api'

const newProduct = await productService.createProduct({
  sku: 'PROD-001',
  name: 'Sample Product',
  description: 'A sample product',
  price: 100.00,
  stock: 50,
  minStock: 5,
  categoryId: 'cat-123',
  supplierId: 'sup-456'
})
```

### **Getting Sales Report**
```typescript
import { reportService } from '@shopflow/api'

const salesReport = await reportService.getSalesReport({
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  branchId: 'branch-123'
})
```

### **Real-time Inventory Updates**
```typescript
import { realtimeService } from '@shopflow/api'

// Subscribe to inventory changes
const unsubscribe = realtimeService.subscribeToInventoryUpdates((inventory) => {
  // Update UI with new inventory data
  setInventoryData(inventory)
})

// Cleanup subscription
useEffect(() => {
  return () => unsubscribe()
}, [])
```

## 🔍 Testing

### **Unit Tests**
```typescript
// Example test for productService
describe('productService', () => {
  it('should create a product', async () => {
    const productData = {
      sku: 'TEST-001',
      name: 'Test Product',
      price: 50.00,
      stock: 10
    }
    
    const result = await productService.createProduct(productData)
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
  })
})
```

---

*เอกสารนี้เป็นส่วนหนึ่งของ Context Engineering สำหรับ ShopFlow Project*
