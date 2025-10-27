#!/usr/bin/env bash
# CI/CD Configuration Validation Script
# Usage: ./scripts/validate-ci-cd.sh

set -e

echo "🔍 Validating CI/CD Configuration..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0
PASSED=0

# Helper functions
error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ERRORS=$((ERRORS + 1))
}

warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    WARNINGS=$((WARNINGS + 1))
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
    PASSED=$((PASSED + 1))
}

# 1. Check workflow files exist
echo "📋 Checking workflow files..."
WORKFLOW_DIR=".github/workflows"

if [ ! -d "$WORKFLOW_DIR" ]; then
    error "Workflow directory not found: $WORKFLOW_DIR"
else
    success "Workflow directory exists"
fi

REQUIRED_WORKFLOWS="test.yml ci.yml codeql.yml dependency-review.yml cache-cleanup.yml dotenv_linter.yml"

for workflow in $REQUIRED_WORKFLOWS; do
    if [ -f "$WORKFLOW_DIR/$workflow" ]; then
        success "Found workflow: $workflow"
    else
        error "Missing workflow: $workflow"
    fi
done

echo ""

# 2. Validate YAML syntax
echo "🔍 Validating YAML syntax..."

if command -v yamllint &> /dev/null; then
    for workflow in "$WORKFLOW_DIR"/*.yml; do
        if yamllint -d relaxed "$workflow" &> /dev/null; then
            success "Valid YAML: $(basename "$workflow")"
        else
            warning "YAML issues in: $(basename "$workflow")"
        fi
    done
else
    warning "yamllint not installed, skipping YAML validation"
fi

echo ""

# 3. Check for required secrets
echo "🔐 Checking for required secrets documentation..."

if grep -q "CODECOV_TOKEN" "$WORKFLOW_DIR/test.yml"; then
    success "Codecov token documented in test.yml"
else
    warning "CODECOV_TOKEN not found in test.yml"
fi

echo ""

# 4. Verify caching configuration
echo "💾 Verifying caching configuration..."

if grep -r "cache: 'pnpm'" "$WORKFLOW_DIR" > /dev/null; then
    success "Found caching pattern: cache: 'pnpm'"
else
    warning "Missing caching pattern: cache: 'pnpm'"
fi

if grep -r "uses: actions/cache@" "$WORKFLOW_DIR" > /dev/null; then
    success "Found caching pattern: uses: actions/cache@"
else
    warning "Missing caching pattern: uses: actions/cache@"
fi

if grep -r "uses: pnpm/action-setup@" "$WORKFLOW_DIR" > /dev/null; then
    success "Found caching pattern: uses: pnpm/action-setup@"
else
    warning "Missing caching pattern: uses: pnpm/action-setup@"
fi

echo ""

# 5. Check concurrency configuration
echo "⚡ Checking concurrency configuration..."

if grep -r "concurrency:" "$WORKFLOW_DIR" > /dev/null; then
    success "Concurrency configuration found"
    
    if grep -r "cancel-in-progress:" "$WORKFLOW_DIR" > /dev/null; then
        success "Cancel-in-progress configured"
    else
        warning "Cancel-in-progress not configured"
    fi
else
    error "No concurrency configuration found"
fi

echo ""

# 6. Verify permissions
echo "🔒 Verifying permissions configuration..."

if grep -r "permissions:" "$WORKFLOW_DIR" > /dev/null; then
    success "Permissions configured in workflows"
else
    warning "No explicit permissions found (will use default)"
fi

echo ""

# 7. Check artifact retention
echo "📦 Checking artifact retention configuration..."

if grep -r "retention-days:" "$WORKFLOW_DIR" > /dev/null; then
    success "Artifact retention configured"
else
    warning "No artifact retention configuration found"
fi

echo ""

# 8. Verify Node/pnpm versions match
echo "🔧 Checking Node.js and pnpm version consistency..."

NODE_VERSION=$(grep -h "NODE_VERSION:" "$WORKFLOW_DIR"/*.yml | head -1 | awk '{print $2}' | tr -d "'\"")
PNPM_VERSION=$(grep -h "PNPM_VERSION:" "$WORKFLOW_DIR"/*.yml | head -1 | awk '{print $2}' | tr -d "'\"")

if [ -n "$NODE_VERSION" ]; then
    success "Node.js version: $NODE_VERSION"
else
    error "Node.js version not found in workflows"
fi

if [ -n "$PNPM_VERSION" ]; then
    success "pnpm version: $PNPM_VERSION"
else
    error "pnpm version not found in workflows"
fi

# Check package.json
if [ -f "package.json" ]; then
    PKG_PNPM=$(grep "packageManager" package.json | grep -o "pnpm@[0-9.]*" | cut -d@ -f2)
    if [ "$PKG_PNPM" = "$PNPM_VERSION" ]; then
        success "pnpm version matches package.json: $PKG_PNPM"
    else
        warning "pnpm version mismatch: CI=$PNPM_VERSION, package.json=$PKG_PNPM"
    fi
fi

echo ""

# 9. Check documentation
echo "📚 Checking documentation..."

DOCS="CI_CD_OPTIMIZATION.md CI_CD_QUICK_REFERENCE.md CI_CD_SUMMARY.md"

for doc in $DOCS; do
    if [ -f "$doc" ]; then
        success "Found documentation: $doc"
    else
        warning "Missing documentation: $doc"
    fi
done

echo ""

# 10. Validate test configuration
echo "🧪 Checking test configuration..."

if [ -f "vitest.config.ts" ]; then
    success "Vitest config found"
    
    if grep -q "projects:" "vitest.config.ts"; then
        success "Test projects configured"
    else
        warning "No test projects found in vitest.config.ts"
    fi
    
    if grep -q "pool: 'threads'" "vitest.config.ts"; then
        success "Thread pool configured"
    else
        warning "Thread pool not configured"
    fi
else
    error "vitest.config.ts not found"
fi

echo ""

# 11. Check GitHub CLI availability
echo "🔧 Checking GitHub CLI..."

if command -v gh &> /dev/null; then
    success "GitHub CLI installed"
    
    if gh auth status &> /dev/null; then
        success "GitHub CLI authenticated"
    else
        warning "GitHub CLI not authenticated (required for cache management)"
    fi
else
    warning "GitHub CLI not installed (recommended for cache management)"
fi

echo ""

# 12. Validate Dependabot configuration
echo "🤖 Checking Dependabot configuration..."

if [ -f ".github/dependabot.yml" ]; then
    success "Dependabot config found"
    
    if grep -q "npm" ".github/dependabot.yml"; then
        success "npm ecosystem configured"
    else
        warning "npm ecosystem not configured in Dependabot"
    fi
else
    warning "Dependabot config not found"
fi

echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Validation Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo -e "${RED}❌ Errors: $ERRORS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -gt 0 ]; then
    echo ""
    echo -e "${RED}❌ Validation failed with $ERRORS error(s)${NC}"
    echo "Please fix the errors above before proceeding."
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Validation passed with $WARNINGS warning(s)${NC}"
    echo "Consider addressing the warnings for optimal CI/CD performance."
    exit 0
else
    echo ""
    echo -e "${GREEN}🎉 All validation checks passed!${NC}"
    echo "Your CI/CD configuration is optimal."
    exit 0
fi
