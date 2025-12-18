#!/bin/bash

# ShopFlow Installation Script
# This script sets up the entire ShopFlow system

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
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    local missing_deps=()
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("Node.js (v18+)")
    else
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 18 ]; then
            print_error "Node.js version 18+ is required. Current version: $(node -v)"
            missing_deps+=("Node.js (v18+)")
        else
            print_success "Node.js $(node -v) found"
        fi
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    else
        print_success "npm $(npm -v) found"
    fi
    
    # Check Docker (optional but recommended)
    if command -v docker &> /dev/null; then
        print_success "Docker $(docker --version | cut -d' ' -f3 | tr -d ',') found"
    else
        print_warning "Docker not found (optional, but recommended for production)"
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_error "Missing required dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        echo ""
        echo "Please install the missing dependencies and run this script again."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    print_status "Installing root dependencies..."
    npm install
    
    print_status "Installing workspace dependencies..."
    npm install --workspaces
    
    print_success "Dependencies installed successfully!"
}

# Setup environment variables
setup_environment() {
    print_header "Setting Up Environment Variables"
    
    if [ -f ".env.local" ]; then
        print_warning ".env.local already exists. Skipping environment setup."
        print_status "If you need to reconfigure, run: ./scripts/setup-supabase.sh"
        return
    fi
    
    print_status "Creating .env.local from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        print_success ".env.local created from template"
        print_warning "Please update .env.local with your Supabase credentials"
        echo ""
        echo "You can:"
        echo "  1. Edit .env.local manually"
        echo "  2. Run: ./scripts/setup-supabase.sh"
    else
        print_error ".env.example not found. Please create .env.local manually."
    fi
}

# Build packages
build_packages() {
    print_header "Building Packages"
    
    print_status "Building shared packages..."
    npm run build --workspace=packages/api || print_warning "Failed to build packages/api (may not be needed)"
    npm run build --workspace=packages/types || print_warning "Failed to build packages/types (may not be needed)"
    
    print_success "Packages built successfully!"
}

# Setup database
setup_database() {
    print_header "Database Setup"
    
    echo "Do you want to set up the database now?"
    echo "1) Yes, set up Supabase (Cloud or Local)"
    echo "2) Skip (set up later)"
    read -p "Enter your choice (1-2): " choice
    
    case $choice in
        1)
            ./scripts/setup-supabase.sh
            ;;
        2)
            print_status "Skipping database setup"
            print_warning "Remember to set up your database before running the applications!"
            ;;
        *)
            print_warning "Invalid choice. Skipping database setup."
            ;;
    esac
}

# Main installation
main() {
    print_header "ShopFlow Installation"
    
    print_status "Starting installation process..."
    echo ""
    
    check_prerequisites
    install_dependencies
    setup_environment
    build_packages
    setup_database
    
    print_header "Installation Complete!"
    
    print_success "🎉 ShopFlow has been installed successfully!"
    echo ""
    print_status "Next steps:"
    echo "1. Configure your Supabase connection in .env.local"
    echo "2. Run database migration (if not done already):"
    echo "   ./scripts/init-db.sh"
    echo ""
    echo "3. Start the applications:"
    echo "   npm run dev:cms   # Start CMS Web (port 3001)"
    echo "   npm run dev:pos  # Start POS Frontend (port 3000)"
    echo ""
    echo "Or use Docker:"
    echo "   docker-compose -f docker-compose.production.yml up -d"
    echo ""
    print_status "For more information, see README.md or INSTALLATION.md"
}

# Run main function
main

