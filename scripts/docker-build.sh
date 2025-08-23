#!/bin/bash

# ShopFlow Docker Build and Deploy Script
# This script builds and deploys both CMS and POS applications

set -e

echo "🚀 Starting ShopFlow Docker Build Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_warning ".env.local not found. Creating from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        print_warning "Please update .env.local with your Supabase credentials"
    else
        print_error ".env.example not found. Please create .env.local manually"
        exit 1
    fi
fi

# Load environment variables
export $(grep -v '^#' .env.local | xargs)

# Build mode selection
echo "Select build mode:"
echo "1) Build CMS Web only"
echo "2) Build POS Frontend only" 
echo "3) Build both applications"
echo "4) Build with local Supabase"
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        print_status "Building CMS Web application..."
        docker build -f Dockerfile.optimized --build-arg APP_NAME=cms-web -t shopflow-cms:latest .
        print_success "CMS Web built successfully!"
        ;;
    2)
        print_status "Building POS Frontend application..."
        docker build -f Dockerfile.optimized --build-arg APP_NAME=pos-frontend -t shopflow-pos:latest .
        print_success "POS Frontend built successfully!"
        ;;
    3)
        print_status "Building both applications..."
        docker build -f Dockerfile.optimized --build-arg APP_NAME=cms-web -t shopflow-cms:latest . &
        docker build -f Dockerfile.optimized --build-arg APP_NAME=pos-frontend -t shopflow-pos:latest . &
        wait
        print_success "Both applications built successfully!"
        ;;
    4)
        print_status "Building with local Supabase..."
        docker-compose -f docker-compose.production.yml up --build -d
        print_success "Full stack deployed with local Supabase!"
        print_status "CMS Web: http://localhost:3001"
        print_status "POS Frontend: http://localhost:3000"
        print_status "Database: localhost:5432"
        ;;
    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

# Run database migrations if building with Supabase
if [ "$choice" = "4" ]; then
    print_status "Waiting for database to be ready..."
    sleep 10
    
    print_status "Running database migrations..."
    docker exec shopflow-supabase psql -U postgres -d shopflow -f /docker-entrypoint-initdb.d/database-migration.sql
    print_success "Database migrations completed!"
fi

print_success "🎉 ShopFlow deployment completed successfully!"

# Show running containers
echo ""
print_status "Running containers:"
docker ps --filter "name=shopflow" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Show logs command
echo ""
print_status "To view logs, use:"
echo "docker-compose -f docker-compose.production.yml logs -f [service-name]"

# Show cleanup command
echo ""
print_status "To stop all services:"
echo "docker-compose -f docker-compose.production.yml down"