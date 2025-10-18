# ShopFlow Troubleshooting Guide

## 🚨 Common Issues & Solutions

คู่มือนี้รวบรวมปัญหาที่พบบ่อยใน ShopFlow และวิธีแก้ไข

## 🔧 Build Issues

### **TypeScript Compilation Errors**

#### **Problem**: `Unexpected any. Specify a different type`
```typescript
// ❌ Error
const data: any = await fetchData()

// ✅ Solution
const data: Product[] = await fetchData()
// or
const data = await fetchData() as Product[]
```

#### **Problem**: `Property 'X' does not exist on type 'Y'`
```typescript
// ❌ Error
const product = await productService.getProduct(id)
console.log(product.name) // Error: Property 'name' does not exist

// ✅ Solution
const response = await productService.getProduct(id)
if (response.success && response.data) {
  console.log(response.data.name)
}
```

#### **Problem**: `Unused variable 'X'`
```typescript
// ❌ Error
const unusedVariable = 'value'

// ✅ Solution
// Remove unused variable or prefix with underscore
const _unusedVariable = 'value'
```

### **Missing Dependencies in useEffect**
```typescript
// ❌ Error
useEffect(() => {
  fetchData(userId)
}, []) // Missing userId dependency

// ✅ Solution
useEffect(() => {
  fetchData(userId)
}, [userId]) // Include all dependencies
```

## 🗄️ Database Issues

### **Supabase Connection Problems**

#### **Problem**: `Invalid API key`
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Verify in Supabase Dashboard
# Settings > API > Project URL and anon key
```

#### **Problem**: `Row Level Security policy violation`
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'products';

-- Disable RLS temporarily for testing
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
```

#### **Problem**: `Foreign key constraint violation`
```sql
-- Check foreign key constraints
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY';
```

### **Database Performance Issues**

#### **Problem**: Slow queries
```sql
-- Check query performance
EXPLAIN ANALYZE SELECT * FROM products WHERE category_id = '123';

-- Add indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
```

#### **Problem**: Connection timeouts
```typescript
// Increase timeout in Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: true,
    },
    global: {
      headers: {
        'Connection': 'keep-alive',
      },
    },
  }
)
```

## 🎨 UI/UX Issues

### **Chakra UI Problems**

#### **Problem**: `ChakraProvider` not found
```typescript
// ❌ Error
import { Button } from '@chakra-ui/react'

// ✅ Solution
import { ChakraProvider, Button } from '@chakra-ui/react'

function App() {
  return (
    <ChakraProvider>
      <Button>Click me</Button>
    </ChakraProvider>
  )
}
```

#### **Problem**: Theme not applied
```typescript
// ❌ Error
const theme = {
  colors: {
    brand: {
      500: '#3182ce'
    }
  }
}

// ✅ Solution
import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    brand: {
      500: '#3182ce'
    }
  }
})

export default theme
```

### **Responsive Design Issues**

#### **Problem**: Layout breaks on mobile
```typescript
// ❌ Error
<Box width="300px" height="200px">
  Content
</Box>

// ✅ Solution
<Box 
  width={{ base: "100%", md: "300px" }}
  height={{ base: "auto", md: "200px" }}
>
  Content
</Box>
```

## 🔌 API Integration Issues

### **Service Layer Problems**

#### **Problem**: `Cannot read property 'data' of null`
```typescript
// ❌ Error
const products = await productService.getAll()
console.log(products.data.length) // Error if products.data is null

// ✅ Solution
const response = await productService.getAll()
if (response.success && response.data) {
  console.log(response.data.length)
} else {
  console.error('Failed to fetch products:', response.error)
}
```

#### **Problem**: Network request failed
```typescript
// Add error handling
try {
  const response = await productService.getAll()
  if (!response.success) {
    throw new Error(response.error || 'API request failed')
  }
  return response.data
} catch (error) {
  console.error('Network error:', error)
  // Handle error appropriately
  throw error
}
```

### **Real-time Subscription Issues**

#### **Problem**: Real-time updates not working
```typescript
// Check Supabase real-time configuration
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
)

// Verify RLS policies for real-time
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable real-time for products" ON products
  FOR ALL USING (auth.role() = 'authenticated');
```

## 🐳 Docker Issues

### **Container Problems**

#### **Problem**: Container won't start
```bash
# Check logs
docker-compose logs pos-frontend
docker-compose logs cms-web

# Check container status
docker-compose ps

# Restart services
docker-compose restart
```

#### **Problem**: Port conflicts
```bash
# Check port usage
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001

# Kill processes using ports
sudo kill -9 $(lsof -t -i:3000)
sudo kill -9 $(lsof -t -i:3001)
```

#### **Problem**: Environment variables not loaded
```bash
# Check environment variables
docker-compose exec pos-frontend env | grep NEXT_PUBLIC

# Verify .env.local files exist
ls -la apps/pos-frontend/.env.local
ls -la apps/cms-web/.env.local
```

### **Nginx Issues**

#### **Problem**: 502 Bad Gateway
```bash
# Check nginx configuration
docker-compose exec nginx nginx -t

# Check if backend services are running
docker-compose exec nginx ping pos-frontend
docker-compose exec nginx ping cms-web

# Check nginx logs
docker-compose logs nginx
```

#### **Problem**: SSL certificate issues
```bash
# Check SSL certificate
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem -text -noout

# Renew certificate
sudo certbot renew --dry-run
sudo certbot renew
```

## 🔐 Authentication Issues

### **Login Problems**

#### **Problem**: User cannot login
```typescript
// Check authentication state
const { user, loading } = useAuth()

if (loading) return <Spinner />
if (!user) return <LoginForm />

// Verify user profile exists
const { data: profile } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', user.id)
  .single()
```

#### **Problem**: Role-based access not working
```typescript
// Check user role
const { data: profile } = await supabase
  .from('user_profiles')
  .select('role, branch_id')
  .eq('id', user.id)
  .single()

if (profile?.role !== 'admin') {
  return <AccessDenied />
}
```

### **Session Management**

#### **Problem**: Session expires unexpectedly
```typescript
// Configure session persistence
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)
```

## 📱 Mobile Issues

### **Touch Interface Problems**

#### **Problem**: Buttons too small for touch
```typescript
// ❌ Error
<Button size="sm">Action</Button>

// ✅ Solution
<Button 
  size={{ base: "lg", md: "md" }}
  minHeight="44px"
  minWidth="44px"
>
  Action
</Button>
```

#### **Problem**: Scrolling issues on mobile
```typescript
// Add touch-friendly scrolling
<Box
  overflowY="auto"
  css={{
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#f1f1f1',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#c1c1c1',
      borderRadius: '4px',
    },
  }}
>
  Content
</Box>
```

## 🔍 Debugging Tools

### **Browser DevTools**
```typescript
// Add debugging helpers
if (process.env.NODE_ENV === 'development') {
  window.debug = {
    supabase,
    productService,
    orderService,
    // Add other services for debugging
  }
}
```

### **Console Logging**
```typescript
// Structured logging
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data)
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error)
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data)
  }
}
```

### **Network Monitoring**
```typescript
// Monitor API calls
const originalFetch = window.fetch
window.fetch = async (...args) => {
  console.log('API Call:', args[0])
  const response = await originalFetch(...args)
  console.log('API Response:', response.status, response.statusText)
  return response
}
```

## 📊 Performance Issues

### **Slow Loading**

#### **Problem**: Large bundle size
```bash
# Analyze bundle size
npm run analyze

# Check for unused dependencies
npx depcheck

# Remove unused imports
npx unimported
```

#### **Problem**: Slow database queries
```sql
-- Check slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### **Memory Leaks**

#### **Problem**: Memory usage keeps growing
```typescript
// Clean up subscriptions
useEffect(() => {
  const subscription = realtimeService.subscribeToProductUpdates(callback)
  
  return () => {
    subscription() // Cleanup function
  }
}, [])

// Clean up event listeners
useEffect(() => {
  const handleResize = () => {
    // Handle resize
  }
  
  window.addEventListener('resize', handleResize)
  
  return () => {
    window.removeEventListener('resize', handleResize)
  }
}, [])
```

## 🆘 Getting Help

### **Log Collection**
```bash
# Collect logs for debugging
docker-compose logs --tail=100 pos-frontend > pos-logs.txt
docker-compose logs --tail=100 cms-web > cms-logs.txt
docker-compose logs --tail=100 nginx > nginx-logs.txt

# System information
uname -a > system-info.txt
docker version >> system-info.txt
docker-compose version >> system-info.txt
```

### **Error Reporting**
```typescript
// Error reporting service
const reportError = async (error: Error, context?: any) => {
  try {
    await fetch('/api/error-reporting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    })
  } catch (reportingError) {
    console.error('Failed to report error:', reportingError)
  }
}
```

### **Common Solutions Checklist**

- [ ] Check environment variables
- [ ] Verify database connection
- [ ] Check RLS policies
- [ ] Restart Docker containers
- [ ] Clear browser cache
- [ ] Check network connectivity
- [ ] Verify SSL certificates
- [ ] Check user permissions
- [ ] Review error logs
- [ ] Test in incognito mode

---

*เอกสารนี้เป็นส่วนหนึ่งของ Context Engineering สำหรับ ShopFlow Project*
