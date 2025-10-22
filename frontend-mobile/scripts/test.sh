#!/bin/bash

# MalPay Mobile App Test Runner
# This script runs all tests for the MalPay mobile application

echo "🧪 Starting MalPay Mobile App Tests..."
echo "======================================"

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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    npm install
fi

# Run type checking
print_status "Running TypeScript type checking..."
npm run type-check
if [ $? -eq 0 ]; then
    print_success "Type checking passed"
else
    print_error "Type checking failed"
    exit 1
fi

# Run linting
print_status "Running ESLint..."
npm run lint
if [ $? -eq 0 ]; then
    print_success "Linting passed"
else
    print_warning "Linting issues found (non-blocking)"
fi

# Run unit tests
print_status "Running unit tests..."
npm run test:ci
if [ $? -eq 0 ]; then
    print_success "Unit tests passed"
else
    print_error "Unit tests failed"
    exit 1
fi

# Run tests with coverage
print_status "Running tests with coverage..."
npm run test:coverage
if [ $? -eq 0 ]; then
    print_success "Coverage tests passed"
else
    print_error "Coverage tests failed"
    exit 1
fi

# Check coverage thresholds
print_status "Checking coverage thresholds..."
COVERAGE_REPORT="coverage/lcov-report/index.html"
if [ -f "$COVERAGE_REPORT" ]; then
    print_success "Coverage report generated at $COVERAGE_REPORT"
else
    print_warning "Coverage report not found"
fi

# Run integration tests
print_status "Running integration tests..."
npm test -- --testPathPattern="integration" --verbose
if [ $? -eq 0 ]; then
    print_success "Integration tests passed"
else
    print_error "Integration tests failed"
    exit 1
fi

# Run end-to-end tests
print_status "Running end-to-end tests..."
npm test -- --testPathPattern="e2e" --verbose
if [ $? -eq 0 ]; then
    print_success "End-to-end tests passed"
else
    print_error "End-to-end tests failed"
    exit 1
fi

# Summary
echo ""
echo "======================================"
print_success "All tests completed successfully! 🎉"
echo ""
print_status "Test Summary:"
echo "  ✅ Type checking"
echo "  ✅ Unit tests"
echo "  ✅ Integration tests"
echo "  ✅ End-to-end tests"
echo "  ✅ Coverage report"
echo ""
print_status "The MalPay mobile app is ready for production! 🚀"
echo ""

# Optional: Open coverage report
if command -v open &> /dev/null; then
    read -p "Would you like to open the coverage report? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "$COVERAGE_REPORT"
    fi
fi
