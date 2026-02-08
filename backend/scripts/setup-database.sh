#!/bin/bash

# ArcStock Database Setup Script
# This script creates the PostgreSQL database and runs migrations

set -e  # Exit on error

echo "🚀 ArcStock Database Setup"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed${NC}"
    echo "Please install PostgreSQL first:"
    echo "  macOS: brew install postgresql@14"
    echo "  Ubuntu: sudo apt install postgresql postgresql-contrib"
    exit 1
fi

echo -e "${GREEN}✓ PostgreSQL is installed${NC}"

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo -e "${YELLOW}⚠️  PostgreSQL is not running${NC}"
    echo "Starting PostgreSQL..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start postgresql@14
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo systemctl start postgresql
    fi
    sleep 2
fi

echo -e "${GREEN}✓ PostgreSQL is running${NC}"

# Database configuration
DB_NAME="${1:-arcstock}"
DB_USER="${2:-$USER}"
MIGRATION_FILE="src/database/migrations/001_initial_schema.sql"

echo ""
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# Create database if it doesn't exist
echo "📦 Creating database..."
psql postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database already exists"

# Run migration
echo "📋 Running migrations..."
if [ -f "$MIGRATION_FILE" ]; then
    psql "$DB_NAME" < "$MIGRATION_FILE"
    echo -e "${GREEN}✓ Migrations completed${NC}"
else
    echo -e "${RED}❌ Migration file not found: $MIGRATION_FILE${NC}"
    exit 1
fi

# Verify tables
echo ""
echo "🔍 Verifying tables..."
TABLE_COUNT=$(psql "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")

if [ "$TABLE_COUNT" -ge 5 ]; then
    echo -e "${GREEN}✓ Found $TABLE_COUNT tables${NC}"
    echo ""
    psql "$DB_NAME" -c "\dt"
else
    echo -e "${RED}❌ Expected at least 5 tables, found $TABLE_COUNT${NC}"
    exit 1
fi

# Update .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env

    # Update DATABASE_URL
    if [[ "$OSTYPE" == "darwin"* ]] || [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=\"postgresql://localhost:5432/$DB_NAME\"|g" .env
        rm .env.bak
    fi

    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Don't forget to add your API keys:${NC}"
    echo "   - GEMINI_API_KEY (get from https://ai.google.dev/)"
    echo "   - STORK_AUTH_TOKEN (optional)"
    echo "   - PRIVATE_KEY (your wallet private key)"
else
    echo -e "${YELLOW}⚠️  .env file already exists, skipping${NC}"
fi

echo ""
echo -e "${GREEN}✅ Database setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update .env with your API keys"
echo "2. Run: npm run dev"
echo "3. Enable agent: curl -X POST http://localhost:3001/api/agent/config -H 'Content-Type: application/json' -d '{\"companyId\": 1, \"isEnabled\": true, \"walletAddress\": \"0x...\"}'"
echo ""
