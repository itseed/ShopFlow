#!/bin/bash

# ShopFlow Database Initialization Script
# This script initializes the database with the consolidated schema

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

# Check if running in Docker or locally
if [ -f /.dockerenv ]; then
    # Running inside Docker container
    DB_HOST="${POSTGRES_HOST:-localhost}"
    DB_PORT="${POSTGRES_PORT:-5432}"
    DB_NAME="${POSTGRES_DB:-shopflow}"
    DB_USER="${POSTGRES_USER:-postgres}"
    DB_PASSWORD="${POSTGRES_PASSWORD:-shopflow123}"
    MIGRATION_FILE="/docker-entrypoint-initdb.d/init.sql"
else
    # Running locally
    DB_HOST="${POSTGRES_HOST:-localhost}"
    DB_PORT="${POSTGRES_PORT:-5432}"
    DB_NAME="${POSTGRES_DB:-shopflow}"
    DB_USER="${POSTGRES_USER:-postgres}"
    MIGRATION_FILE="$(dirname "$0")/../migrate/init.sql"
fi

print_status "Initializing ShopFlow database..."
print_status "Database: $DB_NAME"
print_status "Host: $DB_HOST:$DB_PORT"
print_status "User: $DB_USER"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    print_error "psql command not found. Please install PostgreSQL client tools."
    exit 1
fi

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    print_error "Migration file not found: $MIGRATION_FILE"
    exit 1
fi

# Set PGPASSWORD if provided
if [ -n "$DB_PASSWORD" ]; then
    export PGPASSWORD="$DB_PASSWORD"
fi

# Test database connection
print_status "Testing database connection..."
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    print_success "Database connection successful"
else
    print_error "Cannot connect to database. Please check your connection settings."
    exit 1
fi

# Run migration
print_status "Running database migration..."
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATION_FILE"; then
    print_success "Database migration completed successfully!"
else
    print_error "Database migration failed!"
    exit 1
fi

# Verify tables were created
print_status "Verifying database schema..."
TABLE_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')

if [ "$TABLE_COUNT" -gt 0 ]; then
    print_success "Database initialized with $TABLE_COUNT tables"
else
    print_warning "No tables found. Migration may have failed."
    exit 1
fi

print_success "🎉 Database initialization complete!"
print_status "You can now start the ShopFlow applications."

