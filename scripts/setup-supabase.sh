#!/bin/bash

# ShopFlow Supabase Setup Script
# This script helps set up Supabase (Cloud or Local)

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

print_status "ShopFlow Supabase Setup"
echo ""

# Ask user which Supabase setup they want
echo "Select Supabase setup:"
echo "1) Supabase Cloud (Production)"
echo "2) Supabase Local (Development with Docker)"
read -p "Enter your choice (1-2): " choice

case $choice in
    1)
        print_status "Setting up Supabase Cloud..."
        echo ""
        echo "To use Supabase Cloud:"
        echo "1. Go to https://supabase.com and create a new project"
        echo "2. Go to Settings > API"
        echo "3. Copy your Project URL and anon key"
        echo ""
        read -p "Enter your Supabase Project URL: " SUPABASE_URL
        read -p "Enter your Supabase anon key: " SUPABASE_ANON_KEY
        read -p "Enter your Supabase service role key (optional): " SUPABASE_SERVICE_KEY
        
        # Create .env.local files
        if [ -f ".env.local" ]; then
            print_warning ".env.local already exists. Backing up to .env.local.backup"
            cp .env.local .env.local.backup
        fi
        
        cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY
EOF
        
        # Copy to app directories
        cp .env.local apps/cms-web/.env.local
        cp .env.local apps/pos-frontend/.env.local
        
        print_success "Environment variables configured!"
        print_status "Next steps:"
        echo "1. Run the database migration in Supabase SQL Editor:"
        echo "   - Go to SQL Editor in Supabase Dashboard"
        echo "   - Copy and paste the contents of migrate/init.sql"
        echo "   - Run the migration"
        echo ""
        echo "2. Start the applications:"
        echo "   npm run dev:cms  # For CMS"
        echo "   npm run dev:pos  # For POS"
        ;;
    2)
        print_status "Setting up Supabase Local with Docker..."
        
        # Check if Docker is installed
        if ! command -v docker &> /dev/null; then
            print_error "Docker is not installed. Please install Docker first."
            exit 1
        fi
        
        # Check if docker-compose is available
        if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
            print_error "docker-compose is not installed. Please install docker-compose first."
            exit 1
        fi
        
        print_status "Starting Supabase Local with Docker Compose..."
        
        # Set default values for local Supabase
        export POSTGRES_DB=shopflow
        export POSTGRES_USER=postgres
        export POSTGRES_PASSWORD=shopflow123
        export NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
        export NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
        
        # Create .env.local for local development
        cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
POSTGRES_DB=$POSTGRES_DB
POSTGRES_USER=$POSTGRES_USER
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
EOF
        
        cp .env.local apps/cms-web/.env.local
        cp .env.local apps/pos-frontend/.env.local
        
        print_status "Starting Supabase PostgreSQL container..."
        docker-compose -f docker-compose.production.yml up -d supabase
        
        print_status "Waiting for database to be ready..."
        sleep 10
        
        print_status "Running database migration..."
        ./scripts/init-db.sh
        
        print_success "Supabase Local setup complete!"
        print_status "Database is running on localhost:5432"
        print_status "You can now start the applications:"
        echo "   npm run dev:cms  # For CMS"
        echo "   npm run dev:pos  # For POS"
        ;;
    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

print_success "🎉 Supabase setup complete!"

