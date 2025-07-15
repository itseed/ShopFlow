# CMS Web Application

Content Management System สำหรับระบบ POS และ E-commerce

## 🚀 Quick Start

### ติดตั้ง Dependencies

```bash
# จาก root ของ monorepo
npm install

# หรือติดตั้งเฉพาะ CMS web
cd apps/cms-web
npm install
```

### ตั้งค่า Environment Variables

```bash
# คัดลอกไฟล์ environment
cp ../../.env.example ../../.env.local

# แก้ไขค่าต่างๆ ให้ตรงกับการตั้งค่า Supabase ของคุณ
```

### รันในโหมด Development

```bash
# จาก root ของ monorepo
npm run dev:cms

# หรือจากโฟลเดอร์ cms-web
npm run dev
```

เปิด [http://localhost:3001](http://localhost:3001) ในเบราว์เซอร์

## 📁 โครงสร้างโฟลเดอร์

```
apps/cms-web/
├── components/           # React components
│   ├── Layout.tsx       # หน้าจอหลัก layout
│   └── ErrorBoundary.tsx # การจัดการ error
├── lib/                 # Utilities และ API
│   ├── supabase.ts     # Supabase client
│   └── api.ts          # API functions
├── pages/              # Next.js pages
│   ├── _app.tsx        # Global app configuration
│   ├── _document.tsx   # Custom document
│   ├── index.tsx       # หน้าแดชบอร์ด
│   └── products.tsx    # หน้าจัดการสินค้า
├── styles/             # CSS styles
│   └── globals.css     # Global styles
└── public/             # Static assets
```

## 🛠️ เทคโนโลยีที่ใช้

- **Framework**: Next.js 14 (Static Export)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **UI Components**: Custom components + Shared UI package
- **State Management**: React hooks
- **Forms**: React Hook Form (prepared)
- **Notifications**: React Hot Toast (prepared)

## 📋 Features

### ✅ พร้อมใช้งาน

- ✅ โครงสร้างพื้นฐาน Next.js + TypeScript
- ✅ Responsive layout design
- ✅ Navigation system
- ✅ Error boundary handling
- ✅ Tailwind CSS styling system
- ✅ Supabase integration setup
- ✅ Product management interface
- ✅ Dashboard with statistics

### 🚧 อยู่ในขั้นตอนการพัฒนา

- 🚧 Form components
- 🚧 Authentication system
- 🚧 CRUD operations
- 🚧 Image upload
- 🚧 Search and filtering
- 🚧 Internationalization (i18n)

### 📝 คำแนะนำในการพัฒนาต่อ

1. **ติดตั้ง Dependencies ที่ขาดหาย**
   ```bash
   npm install react-hook-form react-hot-toast lucide-react
   ```

2. **ตั้งค่า Supabase Database**
   - สร้างตาราง `products`, `orders`, `customers`
   - ตั้งค่า Row Level Security (RLS)
   - สร้าง API functions ตามต้องการ

3. **เชื่อมต่อ Shared Packages**
   - ตรวจสอบให้แน่ใจว่า import paths ถูกต้อง
   - อัพเดต Product interface ใน @shopflow/types

4. **เพิ่ม Feature หน้าใหม่**
   - Orders management
   - Customer management
   - Settings page
   - Authentication

## 🐛 การแก้ไขปัญหา

### Import Errors

หากพบ error เกี่ยวกับ import packages:

```bash
# ติดตั้ง dependencies ที่ขาดหาย
npm install @shopflow/ui @shopflow/types @shopflow/utils

# หรือ build packages ก่อน
cd ../../packages/ui && npm run build
cd ../../packages/types && npm run build
```

### CSS Errors

หาก Tailwind CSS ไม่ทำงาน:

```bash
# ติดตั้ง Tailwind และ dependencies
npm install tailwindcss autoprefixer postcss

# รีสตาร์ท development server
npm run dev
```

### Supabase Connection

หากไม่สามารถเชื่อมต่อ Supabase:

1. ตรวจสอบ `.env.local` ว่ามีค่าที่ถูกต้อง
2. ตรวจสอบ Supabase project ว่าเปิดใช้งานอยู่
3. ตรวจสอบ API keys และ URL

## 🚀 การ Deploy

### Static Export

```bash
npm run build
```

ไฟล์ที่ build แล้วจะอยู่ในโฟลเดอร์ `out/`

### Docker (ในอนาคต)

```bash
docker build -t shopflow-cms .
docker run -p 3001:3001 shopflow-cms
```

## 📝 License

Private project for ShopFlow team.
