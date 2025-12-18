#!/bin/bash

# ShopFlow Code Validation Script
# Validates TypeScript, ESLint, and Build for all packages and apps

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
    ((WARNINGS++))
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
    ((ERRORS++))
}

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# Run type check
check_types() {
    print_header "TypeScript Type Checking"
    
    local failed=0
    
    # Check packages
    for pkg in packages/*/; do
        if [ -f "$pkg/package.json" ] && grep -q '"type-check"' "$pkg/package.json"; then
            pkg_name=$(basename "$pkg")
            print_status "Checking types in $pkg_name..."
            if npm run type-check --workspace="$pkg" > /tmp/typecheck_${pkg_name}.log 2>&1; then
                print_success "$pkg_name: No type errors"
            else
                print_error "$pkg_name: Type errors found"
                cat /tmp/typecheck_${pkg_name}.log | tail -20
                failed=1
            fi
        fi
    done
    
    # Check apps
    for app in apps/*/; do
        if [ -f "$app/package.json" ] && grep -q '"type-check"' "$app/package.json"; then
            app_name=$(basename "$app")
            print_status "Checking types in $app_name..."
            if npm run type-check --workspace="$app" > /tmp/typecheck_${app_name}.log 2>&1; then
                print_success "$app_name: No type errors"
            else
                print_error "$app_name: Type errors found"
                cat /tmp/typecheck_${app_name}.log | tail -20
                failed=1
            fi
        fi
    done
    
    if [ $failed -eq 1 ]; then
        return 1
    fi
    return 0
}

# Run lint check
check_lint() {
    print_header "ESLint Checking"
    
    local failed=0
    
    # Check packages
    for pkg in packages/*/; do
        if [ -f "$pkg/package.json" ] && grep -q '"lint"' "$pkg/package.json"; then
            pkg_name=$(basename "$pkg")
            print_status "Linting $pkg_name..."
            if npm run lint --workspace="$pkg" > /tmp/lint_${pkg_name}.log 2>&1; then
                print_success "$pkg_name: No lint errors"
            else
                print_error "$pkg_name: Lint errors found"
                cat /tmp/lint_${pkg_name}.log | tail -20
                failed=1
            fi
        fi
    done
    
    # Check apps
    for app in apps/*/; do
        if [ -f "$app/package.json" ] && grep -q '"lint"' "$app/package.json"; then
            app_name=$(basename "$app")
            print_status "Linting $app_name..."
            if npm run lint --workspace="$app" > /tmp/lint_${app_name}.log 2>&1; then
                print_success "$app_name: No lint errors"
            else
                print_error "$app_name: Lint errors found"
                cat /tmp/lint_${app_name}.log | tail -20
                failed=1
            fi
        fi
    done
    
    if [ $failed -eq 1 ]; then
        return 1
    fi
    return 0
}

# Run build check
check_build() {
    print_header "Build Checking"
    
    local failed=0
    
    # Check packages that need building
    for pkg in packages/*/; do
        if [ -f "$pkg/package.json" ] && grep -q '"build"' "$pkg/package.json"; then
            pkg_name=$(basename "$pkg")
            print_status "Building $pkg_name..."
            if npm run build --workspace="$pkg" > /tmp/build_${pkg_name}.log 2>&1; then
                print_success "$pkg_name: Build successful"
            else
                print_error "$pkg_name: Build failed"
                cat /tmp/build_${pkg_name}.log | tail -20
                failed=1
            fi
        fi
    done
    
    if [ $failed -eq 1 ]; then
        return 1
    fi
    return 0
}

# Generate report
generate_report() {
    print_header "Validation Report"
    
    echo "Summary:"
    echo "  Errors:   $ERRORS"
    echo "  Warnings: $WARNINGS"
    echo ""
    
    if [ $ERRORS -eq 0 ]; then
        print_success "All validations passed!"
        return 0
    else
        print_error "Validation failed with $ERRORS error(s)"
        return 1
    fi
}

# Main
main() {
    print_header "ShopFlow Code Validation"
    
    local check_types_result=0
    local check_lint_result=0
    local check_build_result=0
    
    # Run checks
    check_types || check_types_result=1
    check_lint || check_lint_result=1
    check_build || check_build_result=1
    
    # Generate report
    generate_report
    
    # Exit with appropriate code
    if [ $check_types_result -eq 0 ] && [ $check_lint_result -eq 0 ] && [ $check_build_result -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Run if executed directly
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main
fi

