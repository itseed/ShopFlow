#!/bin/bash
# Runtime Functionality Test Script for ShopFlow

set -e

echo "=== ShopFlow Runtime Functionality Test ==="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $name... "
    
    if command -v curl > /dev/null 2>&1; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
        if [ "$response" = "$expected_status" ]; then
            echo -e "${GREEN}✓ PASSED${NC}"
            ((PASSED++))
            return 0
        else
            echo -e "${RED}✗ FAILED (Status: $response)${NC}"
            ((FAILED++))
            return 1
        fi
    else
        echo -e "${YELLOW}⚠ SKIPPED (curl not available)${NC}"
        return 2
    fi
}

# Check if servers are running
check_server() {
    local port=$1
    local name=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✓ $name is running on port $port${NC}"
        return 0
    else
        echo -e "${RED}✗ $name is NOT running on port $port${NC}"
        return 1
    fi
}

echo "1. Checking Server Status..."
echo ""

if check_server 3000 "POS Frontend"; then
    echo ""
    echo "2. Testing POS Frontend Endpoints..."
    test_endpoint "Health Check" "http://localhost:3000/api/health" 200
    echo ""
else
    echo -e "${YELLOW}⚠ POS Frontend server not running. Start with: npm run dev:pos${NC}"
    echo ""
fi

if check_server 3001 "CMS Web"; then
    echo ""
    echo "3. Testing CMS Web Endpoints..."
    test_endpoint "Health Check" "http://localhost:3001/api/health" 200
    echo ""
else
    echo -e "${YELLOW}⚠ CMS Web server not running. Start with: npm run dev:cms${NC}"
    echo ""
fi

echo "=== Test Summary ==="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed.${NC}"
    exit 1
fi
