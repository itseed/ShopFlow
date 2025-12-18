#!/bin/bash

# ShopFlow Quick Start Script
# Fastest way to get ShopFlow running

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

print_header() {
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   ShopFlow Quick Start            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════╝${NC}"
    echo ""
}

# Check if Docker is available
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is required for quick start"
        print_status "Please install Docker first, or use: ./scripts/install.sh"
        exit 1
    fi
    
    if ! docker ps &> /dev/null; then
        print_error "Docker daemon is not running"
        print_status "Please start Docker and try again"
        exit 1
    fi
}

# Quick start with Docker
quick_start_docker() {
    print_header
    
    print_status "Starting ShopFlow with Docker..."
    echo ""
    
    # Check if .env.local exists
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local not found. Creating from template..."
        if [ -f ".env.example" ]; then
            cp .env.example .env.local
            print_warning "Please update .env.local with your Supabase credentials"
            echo ""
            read -p "Press Enter to continue with default values (for local Supabase)..."
        else
            print_error ".env.example not found. Cannot proceed."
            exit 1
        fi
    fi
    
    # Load environment variables
    export $(grep -v '^#' .env.local | xargs)
    
    # Set defaults for local Supabase if not set
    export POSTGRES_DB=${POSTGRES_DB:-shopflow}
    export POSTGRES_USER=${POSTGRES_USER:-postgres}
    export POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-shopflow123}
    
    print_status "Building and starting containers..."
    docker-compose -f docker-compose.production.yml up --build -d
    
    print_status "Waiting for services to be ready..."
    sleep 15
    
    # Check if database needs initialization
    print_status "Checking database..."
    if docker exec shopflow-supabase psql -U postgres -d shopflow -c "SELECT 1 FROM branches LIMIT 1;" &> /dev/null; then
        print_success "Database already initialized"
    else
        print_status "Initializing database..."
        docker exec shopflow-supabase psql -U postgres -d shopflow -f /docker-entrypoint-initdb.d/init.sql || {
            print_warning "Migration may have already run. Continuing..."
        }
    fi
    
    print_success "🎉 ShopFlow is now running!"
    echo ""
    print_status "Access the applications:"
    echo "  📊 CMS Web:    http://localhost:3001"
    echo "  🛒 POS Frontend: http://localhost:3000"
    echo "  🗄️  Database:    localhost:5432"
    echo ""
    print_status "To view logs:"
    echo "  docker-compose -f docker-compose.production.yml logs -f"
    echo ""
    print_status "To stop:"
    echo "  docker-compose -f docker-compose.production.yml down"
}

# Quick start without Docker
quick_start_local() {
    print_header
    
    print_status "Starting ShopFlow locally (without Docker)..."
    echo ""
    
    # Check prerequisites
    if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
        print_error "Node.js and npm are required"
        exit 1
    fi
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm install
        npm install --workspaces
    fi
    
    # Check environment
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local not found"
        print_status "Please set up your Supabase connection first:"
        echo "  ./scripts/setup-supabase.sh"
        exit 1
    fi
    
    print_status "Starting applications..."
    echo ""
    echo "Starting CMS Web on port 3001..."
    echo "Starting POS Frontend on port 3000..."
    echo ""
    
    # Start both apps in background
    npm run dev:cms &
    CMS_PID=$!
    
    sleep 3
    
    npm run dev:pos &
    POS_PID=$!
    
    print_success "🎉 ShopFlow is now running!"
    echo ""
    print_status "Access the applications:"
    echo "  📊 CMS Web:    http://localhost:3001"
    echo "  🛒 POS Frontend: http://localhost:3000"
    echo ""
    print_status "Press Ctrl+C to stop all services"
    
    # Wait for user interrupt
    trap "kill $CMS_PID $POS_PID 2>/dev/null; exit" INT TERM
    wait
}

# Main
main() {
    echo "Select quick start method:"
    echo "1) Docker (Recommended - includes database)"
    echo "2) Local (Requires Node.js and Supabase setup)"
    read -p "Enter your choice (1-2): " choice
    
    case $choice in
        1)
            check_docker
            quick_start_docker
            ;;
        2)
            quick_start_local
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
}

main

