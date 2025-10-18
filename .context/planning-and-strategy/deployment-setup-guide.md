# ShopFlow Deployment & Setup Guide

## 🎯 **Deployment Strategy**

### **Vision**
ให้ผู้ใช้สามารถ deploy ShopFlow บน server ของตัวเองได้อย่างง่ายดาย โดยใช้ Docker และ Supabase เพียงแค่กรอก API keys ก็สามารถใช้งานได้ทันที

### **Key Features**
- 🐳 **Docker Deployment** - Deploy ด้วย Docker Compose
- 🔧 **Easy Setup** - Setup wizard แบบ step-by-step
- 🗄️ **Auto Migration** - Database migration อัตโนมัติ
- 📦 **Self-Hosted** - ติดตั้งบน server ของตัวเอง
- 🔑 **Simple Configuration** - แค่กรอก Supabase keys

## 🏗️ **Architecture Overview**

```
┌─────────────────────────────────────────────────────┐
│                   User's Server                      │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │           Docker Compose                      │  │
│  │                                               │  │
│  │  ┌─────────────┐  ┌─────────────┐           │  │
│  │  │  CMS Web    │  │ POS Frontend│           │  │
│  │  │  (Port 3001)│  │ (Port 3000) │           │  │
│  │  └──────┬──────┘  └──────┬──────┘           │  │
│  │         │                 │                   │  │
│  │         └────────┬────────┘                   │  │
│  │                  │                            │  │
│  │         ┌────────▼────────┐                  │  │
│  │         │  Nginx Proxy    │                  │  │
│  │         │  (Port 80/443)  │                  │  │
│  │         └─────────────────┘                  │  │
│  │                                               │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│                      │ API Calls                    │
│                      ▼                              │
└──────────────────────┼──────────────────────────────┘
                       │
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────┐
│              Supabase Cloud/Self-Hosted             │
│  ┌──────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                         │  │
│  │  + Auth                                      │  │
│  │  + Storage                                   │  │
│  │  + Realtime                                  │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## 🐳 **Docker Configuration**

### **1. Docker Compose Structure**
```yaml
# docker-compose.yml
version: '3.8'

services:
  # CMS Web Application
  cms-web:
    build:
      context: .
      dockerfile: apps/cms-web/Dockerfile
    container_name: shopflow-cms
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    restart: unless-stopped
    networks:
      - shopflow-network
    depends_on:
      - setup-wizard

  # POS Frontend Application
  pos-frontend:
    build:
      context: .
      dockerfile: apps/pos-frontend/Dockerfile
    container_name: shopflow-pos
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    restart: unless-stopped
    networks:
      - shopflow-network
    depends_on:
      - setup-wizard

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: shopflow-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    networks:
      - shopflow-network
    depends_on:
      - cms-web
      - pos-frontend
    restart: unless-stopped

  # Setup Wizard (runs once on first start)
  setup-wizard:
    build:
      context: .
      dockerfile: setup/Dockerfile
    container_name: shopflow-setup
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
    volumes:
      - ./setup/data:/app/data
      - ./migrate:/app/migrate:ro
    networks:
      - shopflow-network
    command: node setup-wizard.js

networks:
  shopflow-network:
    driver: bridge

volumes:
  setup-data:
```

### **2. CMS Web Dockerfile**
```dockerfile
# apps/cms-web/Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/cms-web/package*.json ./apps/cms-web/
COPY packages ./packages

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build cms-web
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build:cms

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/apps/cms-web/public ./apps/cms-web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/cms-web/.next ./apps/cms-web/.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3001

ENV PORT 3001

CMD ["npm", "run", "start:cms"]
```

### **3. POS Frontend Dockerfile**
```dockerfile
# apps/pos-frontend/Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/pos-frontend/package*.json ./apps/pos-frontend/
COPY packages ./packages

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build pos-frontend
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build:pos

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/apps/pos-frontend/public ./apps/pos-frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/pos-frontend/.next ./apps/pos-frontend/.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["npm", "run", "start:pos"]
```

## 🧙‍♂️ **Setup Wizard**

### **1. Setup Wizard Script**
```javascript
// setup/setup-wizard.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

class SetupWizard {
  constructor() {
    this.config = {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    };
    this.supabase = null;
    this.setupDataPath = path.join(__dirname, 'data', 'setup-status.json');
  }

  // Check if setup has already been completed
  isSetupCompleted() {
    if (fs.existsSync(this.setupDataPath)) {
      const setupData = JSON.parse(fs.readFileSync(this.setupDataPath, 'utf8'));
      return setupData.completed === true;
    }
    return false;
  }

  // Validate Supabase credentials
  async validateCredentials() {
    console.log('🔍 Validating Supabase credentials...');
    
    if (!this.config.supabaseUrl || !this.config.supabaseAnonKey) {
      throw new Error('Missing Supabase credentials. Please provide SUPABASE_URL and SUPABASE_ANON_KEY');
    }

    try {
      this.supabase = createClient(
        this.config.supabaseUrl,
        this.config.supabaseServiceKey || this.config.supabaseAnonKey
      );

      // Test connection
      const { data, error } = await this.supabase.from('_migrations').select('*').limit(1);
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 = table doesn't exist, which is fine for first run
        if (error.code !== '42P01') {
          throw error;
        }
      }

      console.log('✅ Supabase credentials validated');
      return true;
    } catch (error) {
      console.error('❌ Failed to validate credentials:', error.message);
      throw error;
    }
  }

  // Run database migrations
  async runMigrations() {
    console.log('\n🗄️  Running database migrations...');
    
    const migrationsDir = path.join(__dirname, '..', 'migrate');
    const migrations = [
      { name: 'Core Schema', file: 'database_schema.sql', required: true },
      { name: 'Sample Data', file: 'sample_data.sql', required: false },
      { name: 'Loyalty Program', file: 'loyalty_program_enhancement.sql', required: true },
      { name: 'System Settings', file: 'add_system_settings_table.sql', required: false },
      { name: 'Low Stock View', file: 'create_low_stock_view.sql', required: false },
    ];

    for (const migration of migrations) {
      try {
        console.log(`\n📝 Running migration: ${migration.name}...`);
        
        const migrationPath = path.join(migrationsDir, migration.file);
        if (!fs.existsSync(migrationPath)) {
          if (migration.required) {
            throw new Error(`Required migration file not found: ${migration.file}`);
          }
          console.log(`⚠️  Optional migration file not found: ${migration.file}, skipping...`);
          continue;
        }

        const sql = fs.readFileSync(migrationPath, 'utf8');
        
        // Execute migration using Supabase SQL
        const { error } = await this.supabase.rpc('exec_sql', { sql_query: sql });
        
        if (error) {
          console.error(`❌ Migration failed: ${migration.name}`, error);
          if (migration.required) {
            throw error;
          }
        } else {
          console.log(`✅ Migration completed: ${migration.name}`);
        }

        // Record migration in database
        await this.recordMigration(migration.name, migration.file);
      } catch (error) {
        console.error(`❌ Error running migration ${migration.name}:`, error.message);
        if (migration.required) {
          throw error;
        }
      }
    }

    console.log('\n✅ All migrations completed successfully');
  }

  // Record migration in database
  async recordMigration(name, file) {
    try {
      await this.supabase.from('_migrations').insert({
        name: name,
        file: file,
        executed_at: new Date().toISOString(),
      });
    } catch (error) {
      // Ignore error if table doesn't exist yet
      if (error.code !== '42P01') {
        console.warn('⚠️  Could not record migration:', error.message);
      }
    }
  }

  // Create default admin user
  async createDefaultAdmin() {
    console.log('\n👤 Creating default admin user...');
    
    const defaultAdmin = {
      email: 'admin@shopflow.local',
      password: 'admin123', // Should be changed on first login
      role: 'admin',
    };

    try {
      // Check if admin already exists
      const { data: existingUser } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'admin')
        .limit(1);

      if (existingUser && existingUser.length > 0) {
        console.log('ℹ️  Admin user already exists, skipping...');
        return;
      }

      // Create admin user
      const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
        email: defaultAdmin.email,
        password: defaultAdmin.password,
        email_confirm: true,
      });

      if (authError) throw authError;

      // Create user profile
      const { error: profileError } = await this.supabase.from('user_profiles').insert({
        user_id: authData.user.id,
        email: defaultAdmin.email,
        role: defaultAdmin.role,
        full_name: 'System Administrator',
        is_active: true,
      });

      if (profileError) throw profileError;

      console.log('✅ Default admin user created');
      console.log(`   Email: ${defaultAdmin.email}`);
      console.log(`   Password: ${defaultAdmin.password}`);
      console.log('   ⚠️  Please change the password after first login!');
    } catch (error) {
      console.error('❌ Failed to create admin user:', error.message);
      throw error;
    }
  }

  // Create default branch
  async createDefaultBranch() {
    console.log('\n🏢 Creating default branch...');
    
    try {
      // Check if branch already exists
      const { data: existingBranch } = await this.supabase
        .from('branches')
        .select('*')
        .limit(1);

      if (existingBranch && existingBranch.length > 0) {
        console.log('ℹ️  Branch already exists, skipping...');
        return;
      }

      // Create default branch
      const { data: branch, error: branchError } = await this.supabase
        .from('branches')
        .insert({
          name: 'Main Branch',
          code: 'MAIN',
          address: 'Please update branch address',
          phone: '',
          is_active: true,
        })
        .select()
        .single();

      if (branchError) throw branchError;

      // Create default branch settings
      const { error: settingsError } = await this.supabase
        .from('branch_settings')
        .insert({
          branch_id: branch.id,
          // Default values will be applied by database
        });

      if (settingsError) throw settingsError;

      console.log('✅ Default branch created');
      console.log(`   Name: Main Branch`);
      console.log(`   Code: MAIN`);
    } catch (error) {
      console.error('❌ Failed to create default branch:', error.message);
      throw error;
    }
  }

  // Mark setup as completed
  async markSetupCompleted() {
    const setupData = {
      completed: true,
      completedAt: new Date().toISOString(),
      version: '1.0.0',
    };

    fs.mkdirSync(path.dirname(this.setupDataPath), { recursive: true });
    fs.writeFileSync(this.setupDataPath, JSON.stringify(setupData, null, 2));
    
    console.log('\n✅ Setup completed successfully!');
  }

  // Main setup process
  async run() {
    try {
      console.log('🚀 ShopFlow Setup Wizard\n');
      console.log('═══════════════════════════════════════\n');

      // Check if setup is already completed
      if (this.isSetupCompleted()) {
        console.log('✅ Setup has already been completed');
        console.log('ℹ️  If you want to re-run setup, delete: setup/data/setup-status.json');
        return;
      }

      // Step 1: Validate credentials
      await this.validateCredentials();

      // Step 2: Run migrations
      await this.runMigrations();

      // Step 3: Create default admin
      await this.createDefaultAdmin();

      // Step 4: Create default branch
      await this.createDefaultBranch();

      // Step 5: Mark setup as completed
      await this.markSetupCompleted();

      console.log('\n═══════════════════════════════════════');
      console.log('🎉 ShopFlow is ready to use!');
      console.log('');
      console.log('🌐 CMS Web: http://localhost:3001');
      console.log('🛒 POS Frontend: http://localhost:3000');
      console.log('');
      console.log('👤 Default Admin Credentials:');
      console.log('   Email: admin@shopflow.local');
      console.log('   Password: admin123');
      console.log('   ⚠️  Change password after first login!');
      console.log('═══════════════════════════════════════\n');

    } catch (error) {
      console.error('\n❌ Setup failed:', error.message);
      console.error('');
      console.error('Please check your Supabase credentials and try again.');
      console.error('');
      process.exit(1);
    }
  }
}

// Run setup wizard
const wizard = new SetupWizard();
wizard.run().catch(console.error);
```

### **2. Setup Wizard Dockerfile**
```dockerfile
# setup/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache postgresql-client

# Copy setup files
COPY setup/package*.json ./
RUN npm ci --only=production

# Copy setup wizard
COPY setup/setup-wizard.js ./
COPY migrate ./migrate

CMD ["node", "setup-wizard.js"]
```

## 📝 **Environment Configuration**

### **1. .env.example**
```bash
# ShopFlow Environment Configuration

# ============================================
# Supabase Configuration
# ============================================
# Get these from your Supabase project settings
# https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here

# ============================================
# Application Configuration
# ============================================
NODE_ENV=production

# CMS Web Port (default: 3001)
CMS_PORT=3001

# POS Frontend Port (default: 3000)
POS_PORT=3000

# ============================================
# Nginx Configuration
# ============================================
# Domain names (optional, for SSL)
CMS_DOMAIN=cms.yourdomain.com
POS_DOMAIN=pos.yourdomain.com

# ============================================
# Optional: Custom Database Migration
# ============================================
# Set to 'false' to skip sample data
INSTALL_SAMPLE_DATA=true
```

### **2. Interactive Setup Script**
```bash
#!/bin/bash
# setup.sh - Interactive setup script

echo "🚀 ShopFlow Interactive Setup"
echo "================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if .env file exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists"
    read -p "Do you want to reconfigure? (y/N): " reconfigure
    if [ "$reconfigure" != "y" ] && [ "$reconfigure" != "Y" ]; then
        echo "Using existing configuration..."
    else
        rm .env
    fi
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Configuring Supabase..."
    echo ""
    
    read -p "Enter your Supabase URL: " supabase_url
    read -p "Enter your Supabase Anon Key: " supabase_anon_key
    read -p "Enter your Supabase Service Key (optional, press Enter to skip): " supabase_service_key
    
    echo ""
    read -p "Do you want to install sample data? (Y/n): " install_sample
    if [ "$install_sample" == "n" ] || [ "$install_sample" == "N" ]; then
        sample_data="false"
    else
        sample_data="true"
    fi
    
    # Create .env file
    cat > .env << EOF
# ShopFlow Configuration
SUPABASE_URL=$supabase_url
SUPABASE_ANON_KEY=$supabase_anon_key
SUPABASE_SERVICE_KEY=$supabase_service_key
NODE_ENV=production
INSTALL_SAMPLE_DATA=$sample_data
CMS_PORT=3001
POS_PORT=3000
EOF
    
    echo "✅ Configuration saved to .env"
fi

echo ""
echo "🐳 Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting ShopFlow..."
docker-compose up -d

echo ""
echo "⏳ Waiting for setup wizard to complete..."
docker-compose logs -f setup-wizard

echo ""
echo "✅ ShopFlow is starting..."
echo ""
echo "🌐 CMS Web: http://localhost:3001"
echo "🛒 POS Frontend: http://localhost:3000"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
echo ""
```

## 📦 **Package.json Scripts**

```json
{
  "scripts": {
    "build:cms": "cd apps/cms-web && npm run build",
    "build:pos": "cd apps/pos-frontend && npm run build",
    "start:cms": "cd apps/cms-web && npm start",
    "start:pos": "cd apps/pos-frontend && npm start",
    "docker:build": "docker-compose build",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    "setup": "bash setup.sh"
  }
}
```

## 🎯 **User Installation Steps**

### **Step 1: Download ShopFlow**
```bash
# Clone or download ShopFlow
git clone https://github.com/your-org/shopflow.git
cd shopflow
```

### **Step 2: Run Setup Script**
```bash
# Make setup script executable
chmod +x setup.sh

# Run interactive setup
./setup.sh
```

### **Step 3: Follow Setup Wizard**
```
🚀 ShopFlow Interactive Setup
================================

✅ Docker and Docker Compose are installed

📝 Configuring Supabase...

Enter your Supabase URL: https://xxxxx.supabase.co
Enter your Supabase Anon Key: eyJhbGci...
Enter your Supabase Service Key (optional): eyJhbGci...
Do you want to install sample data? (Y/n): Y

✅ Configuration saved

🐳 Building Docker images...
🚀 Starting ShopFlow...
⏳ Running database migrations...

✅ Setup completed successfully!

🌐 CMS Web: http://localhost:3001
🛒 POS Frontend: http://localhost:3000

👤 Default Admin:
   Email: admin@shopflow.local
   Password: admin123
```

### **Step 4: Access Applications**
```bash
# CMS Web
http://localhost:3001

# POS Frontend  
http://localhost:3000

# Login with default credentials
Email: admin@shopflow.local
Password: admin123
```

## 🔧 **Advanced Configuration**

### **Custom Domain Setup**
```nginx
# nginx/conf.d/shopflow.conf
server {
    listen 80;
    server_name cms.yourdomain.com;

    location / {
        proxy_pass http://cms-web:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name pos.yourdomain.com;

    location / {
        proxy_pass http://pos-frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### **SSL Certificate Setup**
```bash
# Using Certbot for Let's Encrypt
docker run -it --rm -v $(pwd)/nginx/ssl:/etc/letsencrypt certbot/certbot certonly --webroot -w /var/www/certbot -d cms.yourdomain.com -d pos.yourdomain.com
```

## 📊 **Migration System**

### **Migration Tracking Table**
```sql
CREATE TABLE IF NOT EXISTS _migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  file VARCHAR(255) NOT NULL,
  executed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(file)
);
```

### **Migration Order**
```javascript
const migrations = [
  { order: 1, name: 'Core Schema', file: 'database_schema.sql', required: true },
  { order: 2, name: 'Sample Data', file: 'sample_data.sql', required: false },
  { order: 3, name: 'Loyalty Program', file: 'loyalty_program_enhancement.sql', required: true },
  { order: 4, name: 'Branch Settings', file: 'add_branch_settings_table.sql', required: true },
  { order: 5, name: 'System Settings', file: 'add_system_settings_table.sql', required: false },
  { order: 6, name: 'Low Stock View', file: 'create_low_stock_view.sql', required: false },
];
```

## 🚀 **Deployment Checklist**

### **Pre-Deployment**
- [ ] Supabase project created
- [ ] API keys obtained
- [ ] Docker installed
- [ ] Server resources checked (2GB+ RAM recommended)

### **Deployment**
- [ ] Run setup script
- [ ] Verify database migrations
- [ ] Access CMS and POS
- [ ] Change default admin password
- [ ] Configure branch settings

### **Post-Deployment**
- [ ] Setup SSL certificates (if using custom domain)
- [ ] Configure backups
- [ ] Setup monitoring
- [ ] Test all functionality

## 📖 **Troubleshooting**

### **Common Issues**

#### **1. Setup Wizard Fails**
```bash
# Check logs
docker-compose logs setup-wizard

# Verify Supabase credentials
# Re-run setup
docker-compose down
rm setup/data/setup-status.json
./setup.sh
```

#### **2. Database Migration Fails**
```bash
# Check Supabase connection
# Verify service key has admin permissions
# Check migration files exist in /migrate folder
```

#### **3. Cannot Access Applications**
```bash
# Check if containers are running
docker-compose ps

# Check logs
docker-compose logs cms-web
docker-compose logs pos-frontend

# Verify ports are not in use
netstat -an | grep 3000
netstat -an | grep 3001
```

---

**This deployment system makes ShopFlow easy to install and configure, allowing users to get up and running in minutes!** 🚀
