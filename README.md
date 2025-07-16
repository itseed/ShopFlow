# ShopFlow - POS & CMS System

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Chakra UI](https://img.shields.io/badge/Chakra%20UI-v2-teal)](https://chakra-ui.com/)
[![License: Educational](https://img.shields.io/badge/License-Educational%20Use-green)](https://github.com/itseed/ShopFlow)
[![Support](https://img.shields.io/badge/☕-Buy%20me%20a%20coffee-yellow)](https://coff.ee/chaykr)

A comprehensive Point of Sale (POS) and Content Management System (CMS) built with Next.js, TypeScript, and Chakra UI. This monorepo contains both the customer-facing POS frontend and the admin CMS dashboard.

> **🎓 Educational Project**: This is a free, open-source project for learning purposes only. Commercial use and redistribution are not permitted. If you find it helpful, consider [supporting the developer](https://coff.ee/chaykr) ☕

## 🚀 Features

### CMS Web Application
- **📊 Dashboard** - Real-time sales analytics and business insights
- **🛍️ Product Management** - Full CRUD operations for products and categories
- **📦 Order Management** - Order processing and tracking
- **👥 Customer Management** - Customer data and relationship management
- **📈 Reports System** - Comprehensive reporting including:
  - Sales reports
  - Profit & Loss analysis
  - Popular products analytics
  - Branch comparison
  - Daily sales tracking
  - Inventory management
- **⚙️ Settings** - System configuration, user management, and security
- **🔐 Authentication** - Role-based access control
- **📱 Responsive Design** - Mobile-friendly interface

### POS Frontend Application
- **🛒 Point of Sale Interface** - Intuitive checkout system
- **📱 Mobile Optimized** - Touch-friendly POS terminal
- **🔄 Real-time Updates** - Live inventory and pricing

## 🏗️ Project Structure

```
ShopFlow/
├── apps/
│   ├── cms-web/                    # Admin CMS Dashboard
│   │   ├── pages/
│   │   │   ├── catalog/            # Product & Category Management
│   │   │   ├── customers/          # Customer Management
│   │   │   ├── dashboard/          # Analytics Dashboard
│   │   │   ├── orders/             # Order Management
│   │   │   ├── reports/            # Business Reports
│   │   │   └── settings/           # System Settings
│   │   ├── components/             # React Components
│   │   ├── lib/                    # Utilities & Auth
│   │   └── out/                    # Static Export Output
│   └── pos-frontend/               # POS Terminal Interface
│       ├── pages/
│       ├── components/
│       └── lib/
├── packages/
│   ├── ui/                         # Shared UI Components
│   ├── types/                      # TypeScript Definitions
│   └── utils/                      # Shared Utilities
└── README.md
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Framework**: Chakra UI v2
- **Charts**: Recharts
- **Icons**: React Icons (Feather)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom auth with role-based access
- **Styling**: Emotion, Framer Motion
- **Build**: Static export for easy deployment

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/ShopFlow.git
cd ShopFlow
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Copy environment template
cp apps/cms-web/.env.example apps/cms-web/.env.local
cp apps/pos-frontend/.env.example apps/pos-frontend/.env.local

# Edit the files with your Supabase credentials
```

4. **Start development servers**
```bash
# Start CMS Web (runs on port 3001)
cd apps/cms-web
npm run dev

# Start POS Frontend (runs on port 3000)
cd apps/pos-frontend  
npm run dev
```

### 🔧 Environment Variables

Create `.env.local` files in each app directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
NEXT_PUBLIC_APP_NAME=ShopFlow
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 📦 Build & Deployment

### Build for Production
```bash
# Build CMS Web
cd apps/cms-web
npm run build

# Build POS Frontend
cd apps/pos-frontend
npm run build
```

### Static Export
Both applications are configured for static export:
```bash
npm run build
# Static files will be in ./out/ directory
```

### Deploy Options
- **Vercel**: Direct deployment from Git
- **Netlify**: Drag & drop the `out/` folder
- **AWS S3**: Upload static files
- **Any CDN**: Serve the static files

## 🎯 Key Features Implemented

### ✅ CMS Dashboard
- [x] Complete product management with image upload
- [x] Category organization system
- [x] Order processing and tracking
- [x] Customer relationship management
- [x] Comprehensive reporting suite
- [x] Profit & Loss analysis
- [x] Branch comparison analytics
- [x] User authentication & authorization
- [x] Responsive design for all devices
- [x] Export functionality for reports

### ✅ Technical Features
- [x] TypeScript for type safety
- [x] Monorepo structure with shared packages
- [x] Static export for fast deployment
- [x] Modern React patterns (hooks, context)
- [x] Optimized build process
- [x] Clean code architecture

## 📊 Business Intelligence

The CMS includes a powerful reporting system:
- **Sales Analytics**: Track revenue, trends, and performance
- **Inventory Reports**: Monitor stock levels and movement
- **Customer Insights**: Analyze customer behavior and preferences
- **Financial Reports**: Profit margins and expense tracking
- **Operational Metrics**: Efficiency and productivity measures

## 🔒 Security Features

- Role-based authentication (Admin, Staff, Manager)
- Protected routes and API endpoints
- Input validation and sanitization
- Secure session management
- Environment-based configuration

## 🎨 Design System

Built with Chakra UI for consistent, accessible design:
- Responsive grid system
- Dark/light mode support
- Accessible components
- Consistent spacing and typography
- Custom Thai font support

## 🤝 Contributing

We welcome contributions from the community! This project is free and open source for educational purposes.

### How to Contribute
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 💝 Show Your Support
If you like this project, please:
- ⭐ Star the repository
- 🐛 Report bugs and issues
- 💡 Suggest new features
- ☕ [Buy me a coffee](https://coff.ee/chaykr) to support development

### 📝 Code of Conduct
- Be respectful and constructive
- Follow the existing code style
- Write clear commit messages
- Test your changes before submitting

## 📄 License & Usage

This project is **free and open source** for educational and personal use only.

### ⚠️ Important Notice
- **✅ Allowed**: Learning, studying, personal projects, contributions
- **❌ Not Allowed**: Commercial sale, redistribution for profit, claiming as your own work
- **📚 Educational Use**: Feel free to learn from the code and use it for educational purposes

### 🔒 Commercial Use
For commercial licensing or enterprise usage, please contact the development team.

## 💖 Support the Project

If you find this project helpful, consider supporting the development:

[![Buy me a coffee](https://img.shields.io/badge/☕-Buy%20me%20a%20coffee-yellow.svg)](https://coff.ee/chaykr)

**Support**: [coff.ee/chaykr](https://coff.ee/chaykr)

Your support helps maintain and improve this project for the community! 🙏

## 🆘 Support & Help

For support, please open an issue in the GitHub repository or contact the development team.

### 📞 Contact
- **GitHub Issues**: For bug reports and feature requests
- **Discussions**: For general questions and community support
- **Email**: For commercial inquiries and licensing

---

**Built with ❤️ for efficient business operations**

*Free for educational use • Support open source development*
