# ShopFlow Deployment Guide

## 🚀 Deployment Overview

ShopFlow รองรับการ deploy ในหลายรูปแบบ โดยใช้ Docker เป็นหลักสำหรับการ deploy ที่ง่ายและสม่ำเสมอ

## 🐳 Docker Deployment (Recommended)

### **Prerequisites**
- Docker และ Docker Compose
- Supabase account และ credentials
- Domain name (optional)

### **Quick Start**
```bash
# Clone repository
git clone https://github.com/your-org/ShopFlow.git
cd ShopFlow

# Set up environment variables
cp apps/cms-web/.env.example apps/cms-web/.env.local
cp apps/pos-frontend/.env.example apps/pos-frontend/.env.local

# Edit environment files with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Build and run with Docker Compose
docker-compose up -d

# Access applications
# CMS Dashboard: http://localhost:3001
# POS Terminal: http://localhost:3000
```

### **Production Deployment**
```bash
# Use production configuration
docker-compose -f docker-compose.production.yml up -d

# With custom domain and SSL
# Update nginx/conf.d/pos.conf and nginx/conf.d/cms.conf
# with your domain names
```

## 🌐 Nginx Configuration

### **Domain Setup**
```nginx
# pos.conf
server {
    listen 80;
    server_name pos.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name pos.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/pos.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pos.yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://pos-frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **SSL Certificate Setup**
```bash
# Install Certbot
sudo apt-get install certbot

# Generate SSL certificate
sudo certbot certonly --standalone -d pos.yourdomain.com
sudo certbot certonly --standalone -d cms.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## ☁️ Cloud Deployment Options

### **AWS Deployment**
```yaml
# docker-compose.aws.yml
version: '3.8'
services:
  pos-frontend:
    image: your-ecr-repo/shopflow-pos:latest
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    ports:
      - "3000:3000"
  
  cms-web:
    image: your-ecr-repo/shopflow-cms:latest
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    ports:
      - "3001:3000"
```

### **Google Cloud Platform**
```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/shopflow-pos', './apps/pos-frontend']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/shopflow-cms', './apps/cms-web']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/shopflow-pos']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/shopflow-cms']
```

### **DigitalOcean App Platform**
```yaml
# .do/app.yaml
name: shopflow
services:
- name: pos-frontend
  source_dir: apps/pos-frontend
  github:
    repo: your-org/ShopFlow
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NEXT_PUBLIC_SUPABASE_URL
    value: ${SUPABASE_URL}
  - key: NEXT_PUBLIC_SUPABASE_ANON_KEY
    value: ${SUPABASE_ANON_KEY}

- name: cms-web
  source_dir: apps/cms-web
  github:
    repo: your-org/ShopFlow
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NEXT_PUBLIC_SUPABASE_URL
    value: ${SUPABASE_URL}
  - key: NEXT_PUBLIC_SUPABASE_ANON_KEY
    value: ${SUPABASE_ANON_KEY}
```

## 📦 Static Export Deployment

### **Build for Static Export**
```bash
# Build CMS Web
cd apps/cms-web
npm run build
npm run export

# Build POS Frontend
cd apps/pos-frontend
npm run build
npm run export

# Static files will be in ./out/ directory
```

### **Deploy Static Files**
```bash
# Deploy to Netlify
netlify deploy --dir=apps/cms-web/out
netlify deploy --dir=apps/pos-frontend/out

# Deploy to Vercel
vercel --cwd apps/cms-web
vercel --cwd apps/pos-frontend

# Deploy to AWS S3
aws s3 sync apps/cms-web/out s3://your-cms-bucket
aws s3 sync apps/pos-frontend/out s3://your-pos-bucket
```

## 🔧 Environment Configuration

### **Environment Variables**
```bash
# Required for all deployments
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional configuration
NEXT_PUBLIC_APP_NAME=ShopFlow
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Production specific
NODE_ENV=production
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### **Supabase Configuration**
```sql
-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view products" ON products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view orders from their branch" ON orders
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND branch_id = orders.branch_id
    )
  );
```

## 🔍 Monitoring & Logging

### **Application Monitoring**
```typescript
// Add monitoring to your application
import { Analytics } from '@vercel/analytics'

// Track custom events
Analytics.track('product_created', {
  product_id: product.id,
  category: product.category
})

// Error tracking
window.addEventListener('error', (event) => {
  console.error('Application Error:', event.error)
  // Send to monitoring service
})
```

### **Docker Logging**
```bash
# View application logs
docker-compose logs -f pos-frontend
docker-compose logs -f cms-web
docker-compose logs -f nginx

# Log rotation
docker-compose exec nginx sh -c 'logrotate /etc/logrotate.d/nginx'
```

## 🔒 Security Configuration

### **Nginx Security Headers**
```nginx
# Add security headers
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'";

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20 nodelay;
```

### **Docker Security**
```dockerfile
# Use non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Remove unnecessary packages
RUN apk del .build-deps

# Use specific base image
FROM node:18-alpine
```

## 📊 Performance Optimization

### **Docker Optimization**
```dockerfile
# Multi-stage build
FROM node:18-alpine AS base
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

# Build stage
FROM base AS builder
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

# Production stage
FROM base AS runner
COPY --from=builder /app/out ./out
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

### **Nginx Optimization**
```nginx
# Enable gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Cache API responses
location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_use_stale error timeout updating;
}
```

## 🔄 CI/CD Pipeline

### **GitHub Actions**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build applications
      run: npm run build
    
    - name: Build Docker images
      run: |
        docker build -t shopflow-pos ./apps/pos-frontend
        docker build -t shopflow-cms ./apps/cms-web
    
    - name: Deploy to production
      run: |
        docker-compose -f docker-compose.production.yml up -d
```

### **GitLab CI**
```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - deploy

build:
  stage: build
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - apps/*/out/

deploy:
  stage: deploy
  script:
    - docker-compose -f docker-compose.production.yml up -d
  only:
    - main
```

## 🚨 Troubleshooting

### **Common Issues**

#### **Application Won't Start**
```bash
# Check logs
docker-compose logs pos-frontend
docker-compose logs cms-web

# Check environment variables
docker-compose exec pos-frontend env | grep NEXT_PUBLIC

# Restart services
docker-compose restart
```

#### **Database Connection Issues**
```bash
# Test Supabase connection
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     "https://YOUR_PROJECT.supabase.co/rest/v1/products"

# Check RLS policies
# Go to Supabase Dashboard > Authentication > Policies
```

#### **Nginx Configuration Issues**
```bash
# Test nginx configuration
docker-compose exec nginx nginx -t

# Reload nginx
docker-compose exec nginx nginx -s reload

# Check nginx logs
docker-compose logs nginx
```

### **Performance Issues**
```bash
# Check resource usage
docker stats

# Monitor application performance
docker-compose exec pos-frontend npm run analyze

# Check database performance
# Go to Supabase Dashboard > Database > Performance
```

## 📋 Deployment Checklist

### **Pre-deployment**
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] Backup strategy in place

### **Post-deployment**
- [ ] Applications accessible
- [ ] Database connections working
- [ ] Authentication functioning
- [ ] Real-time updates working
- [ ] Monitoring configured
- [ ] Logs being collected

### **Monitoring**
- [ ] Application health checks
- [ ] Database performance monitoring
- [ ] Error tracking configured
- [ ] Uptime monitoring
- [ ] Security scanning enabled

---

*เอกสารนี้เป็นส่วนหนึ่งของ Context Engineering สำหรับ ShopFlow Project*
