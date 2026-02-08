#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# NAIWAH Store App - Production Initialization Script
# ─────────────────────────────────────────────────────────────────────────────

set -e

echo "🚀 NAIWAH Store App - Production Setup"
echo "────────────────────────────────────────"

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    
    # Generate AUTH_SECRET
    AUTH_SECRET=$(openssl rand -base64 32)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|AUTH_SECRET=your-secret-key-here|AUTH_SECRET=$AUTH_SECRET|g" .env
    else
        sed -i "s|AUTH_SECRET=your-secret-key-here|AUTH_SECRET=$AUTH_SECRET|g" .env
    fi
    echo "✅ Generated AUTH_SECRET"
    echo "⚠️  Please review .env and update AUTH_URL for production"
else
    echo "✅ .env file exists"
fi

# Create necessary directories
echo "📁 Creating data directories..."
mkdir -p data
mkdir -p pb_data
mkdir -p pb_migrations
mkdir -p pb_hooks

# Initialize database if not exists
if [ ! -f data/dev.db ]; then
    echo "🗃️  Initializing SQLite database..."
    
    # Check if running in Docker or locally
    if command -v pnpm &> /dev/null; then
        pnpm prisma generate
        pnpm prisma db push
        echo "✅ Database initialized"
        
        # Run seed if seed file exists
        if [ -f prisma/seed.ts ]; then
            echo "🌱 Seeding database..."
            pnpm prisma db seed || echo "⚠️  Seed skipped or failed"
        fi
    else
        echo "⚠️  pnpm not found. Database will be initialized when container starts."
    fi
else
    echo "✅ Database already exists"
fi

echo ""
echo "────────────────────────────────────────"
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Review .env file and update for production"
echo "  2. Run: docker-compose up -d --build"
echo "  3. Access app at: http://localhost:3000"
echo "  4. Access PocketBase admin at: http://localhost:8090/_/"
echo ""
echo "To initialize PocketBase admin:"
echo "  1. Go to http://localhost:8090/_/"
echo "  2. Create admin account on first visit"
echo "  3. Create 'device_images' collection"
echo ""
