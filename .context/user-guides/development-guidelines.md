# ShopFlow Development Guidelines

## 🎯 Development Principles

### **Code Quality Standards**
- **TypeScript First**: ใช้ TypeScript ทุกที่เพื่อ type safety
- **Clean Code**: เขียนโค้ดที่อ่านง่ายและบำรุงรักษาได้
- **DRY Principle**: หลีกเลี่ยงการเขียนโค้ดซ้ำ
- **SOLID Principles**: ใช้หลักการ SOLID ในการออกแบบ

### **Naming Conventions**
```typescript
// Files and Folders
- components/ProductCard.tsx
- hooks/useProducts.ts
- services/productService.ts
- types/Product.ts

// Variables and Functions
const productList = []
const isLoading = false
const handleSubmit = () => {}
const fetchProducts = async () => {}

// Constants
const API_BASE_URL = 'https://api.example.com'
const MAX_RETRY_ATTEMPTS = 3

// Types and Interfaces
interface ProductData {}
type ProductStatus = 'active' | 'inactive'
```

## 🏗️ Project Structure Guidelines

### **Monorepo Organization**
```
packages/
├── api/           # Shared API services
├── types/         # TypeScript type definitions
├── ui/            # Reusable UI components
└── utils/         # Common utilities

apps/
├── cms-web/       # Admin dashboard
└── pos-frontend/  # POS terminal
```

### **Component Organization**
```
components/
├── ui/            # Basic UI components
├── forms/         # Form components
├── layout/        # Layout components
├── business/      # Business logic components
└── common/        # Shared components
```

## 🔧 TypeScript Guidelines

### **Type Definitions**
```typescript
// Use interfaces for object shapes
interface Product {
  id: string
  name: string
  price: number
  stock: number
}

// Use types for unions and primitives
type ProductStatus = 'active' | 'inactive' | 'discontinued'
type ApiResponse<T> = {
  data: T | null
  error: string | null
  success: boolean
}

// Use generics for reusable types
interface ApiService<T> {
  getAll(): Promise<ApiResponse<T[]>>
  getById(id: string): Promise<ApiResponse<T>>
  create(data: Partial<T>): Promise<ApiResponse<T>>
}
```

### **Avoid `any` Type**
```typescript
// ❌ Bad
const data: any = await fetchData()

// ✅ Good
const data: Product[] = await fetchData()
// or
const data = await fetchData() as Product[]
```

### **Error Handling**
```typescript
// Use proper error handling
try {
  const result = await productService.createProduct(data)
  if (!result.success) {
    throw new Error(result.error || 'Failed to create product')
  }
  return result.data
} catch (error) {
  console.error('Error creating product:', error)
  throw error
}
```

## 🎨 UI/UX Guidelines

### **Chakra UI Usage**
```typescript
// Use Chakra UI components consistently
import { Box, Button, Text, VStack } from '@chakra-ui/react'

// Custom theme usage
const theme = {
  colors: {
    brand: {
      50: '#f7fafc',
      500: '#3182ce',
      900: '#1a202c'
    }
  }
}

// Responsive design
<Box
  display={{ base: 'block', md: 'flex' }}
  p={{ base: 4, md: 8 }}
>
  Content
</Box>
```

### **Component Design**
```typescript
// Create reusable components
interface ProductCardProps {
  product: Product
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete
}) => {
  return (
    <Box p={4} borderWidth={1} borderRadius="md">
      <Text fontSize="lg" fontWeight="bold">{product.name}</Text>
      <Text color="gray.600">${product.price}</Text>
      <Text>Stock: {product.stock}</Text>
    </Box>
  )
}
```

## 🔌 API Integration Guidelines

### **Service Layer Pattern**
```typescript
// Create service classes for API calls
class ProductService {
  private baseUrl = '/api/products'
  
  async getAll(): Promise<ApiResponse<Product[]>> {
    try {
      const response = await fetch(this.baseUrl)
      const data = await response.json()
      return { data, error: null, success: true }
    } catch (error) {
      return { data: null, error: error.message, success: false }
    }
  }
  
  async create(product: CreateProductData): Promise<ApiResponse<Product>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      })
      const data = await response.json()
      return { data, error: null, success: true }
    } catch (error) {
      return { data: null, error: error.message, success: false }
    }
  }
}

export const productService = new ProductService()
```

### **Custom Hooks**
```typescript
// Create custom hooks for data fetching
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await productService.getAll()
      if (response.success) {
        setProducts(response.data || [])
      } else {
        setError(response.error || 'Failed to fetch products')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchProducts()
  }, [])
  
  return { products, loading, error, refetch: fetchProducts }
}
```

## 🧪 Testing Guidelines

### **Unit Testing**
```typescript
// Test service functions
describe('ProductService', () => {
  it('should create a product', async () => {
    const productData = {
      name: 'Test Product',
      price: 100,
      stock: 10
    }
    
    const result = await productService.create(productData)
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
  })
})

// Test React components
import { render, screen } from '@testing-library/react'
import { ProductCard } from './ProductCard'

describe('ProductCard', () => {
  it('should render product information', () => {
    const product = {
      id: '1',
      name: 'Test Product',
      price: 100,
      stock: 10
    }
    
    render(<ProductCard product={product} />)
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('$100')).toBeInTheDocument()
  })
})
```

## 🔒 Security Guidelines

### **Input Validation**
```typescript
// Validate user input
const validateProduct = (data: any): CreateProductData => {
  if (!data.name || typeof data.name !== 'string') {
    throw new Error('Product name is required')
  }
  
  if (!data.price || typeof data.price !== 'number' || data.price < 0) {
    throw new Error('Valid price is required')
  }
  
  return {
    name: data.name.trim(),
    price: data.price,
    stock: data.stock || 0
  }
}
```

### **Authentication**
```typescript
// Use authentication guards
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { user, loading } = useAuth()
  
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" />
  
  return <>{children}</>
}
```

## 📱 Responsive Design Guidelines

### **Mobile First Approach**
```typescript
// Design for mobile first
<Box
  width={{ base: '100%', md: '50%', lg: '33%' }}
  p={{ base: 2, md: 4, lg: 6 }}
>
  Content
</Box>

// Touch-friendly buttons
<Button
  size={{ base: 'lg', md: 'md' }}
  minHeight="44px" // Minimum touch target
  width={{ base: '100%', md: 'auto' }}
>
  Action
</Button>
```

### **Breakpoints**
```typescript
// Use consistent breakpoints
const breakpoints = {
  base: '0px',
  sm: '480px',
  md: '768px',
  lg: '992px',
  xl: '1280px',
  '2xl': '1536px'
}
```

## 🚀 Performance Guidelines

### **Code Splitting**
```typescript
// Use dynamic imports for code splitting
const ProductManagement = lazy(() => import('./ProductManagement'))

// Use Suspense for loading states
<Suspense fallback={<Spinner />}>
  <ProductManagement />
</Suspense>
```

### **Memoization**
```typescript
// Use React.memo for expensive components
export const ProductList = React.memo<ProductListProps>(({ products }) => {
  return (
    <VStack>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </VStack>
  )
})

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return products.reduce((sum, product) => sum + product.price, 0)
}, [products])
```

## 📝 Documentation Guidelines

### **Code Comments**
```typescript
/**
 * Creates a new product in the system
 * @param productData - The product data to create
 * @returns Promise resolving to the created product
 * @throws Error if product creation fails
 */
export const createProduct = async (productData: CreateProductData): Promise<Product> => {
  // Validate input data
  if (!productData.name) {
    throw new Error('Product name is required')
  }
  
  // Create product via API
  const response = await productService.create(productData)
  
  if (!response.success) {
    throw new Error(response.error || 'Failed to create product')
  }
  
  return response.data!
}
```

### **README Files**
```markdown
# Component Name

Brief description of what this component does.

## Usage

```typescript
import { ComponentName } from './ComponentName'

<ComponentName prop1="value" prop2={123} />
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| prop1 | string | Yes | Description of prop1 |
| prop2 | number | No | Description of prop2 |

## Examples

### Basic Usage
[Example code]

### Advanced Usage
[Example code]
```

## 🔄 Git Workflow

### **Branch Naming**
```
feature/product-management
bugfix/payment-processing
hotfix/critical-security-issue
refactor/api-services
```

### **Commit Messages**
```
feat: add product search functionality
fix: resolve payment processing error
docs: update API documentation
refactor: improve error handling
test: add unit tests for product service
```

### **Pull Request Template**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
```

---

*เอกสารนี้เป็นส่วนหนึ่งของ Context Engineering สำหรับ ShopFlow Project*
