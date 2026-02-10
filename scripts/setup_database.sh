#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# NAIWAH Store App - Database Setup & Migration Script
# ─────────────────────────────────────────────────────────────────────────────
# Usage:
#   ./scripts/setup_database.sh              # Full setup (fresh install)
#   ./scripts/setup_database.sh --backup     # Backup current database
#   ./scripts/setup_database.sh --restore    # Restore from latest backup
#   ./scripts/setup_database.sh --reset      # Reset & re-seed from CSV
#   ./scripts/setup_database.sh --migrate    # Run pending Prisma migrations
# ─────────────────────────────────────────────────────────────────────────────

set -e

# ── Configuration ────────────────────────────────────────────────────────────
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DB_FILE="$PROJECT_DIR/dev.db"
BACKUP_DIR="$PROJECT_DIR/backups"
CSV_FILE="$PROJECT_DIR/master_data.csv"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info()  { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_ok()    { echo -e "${GREEN}✅ $1${NC}"; }
log_warn()  { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

cd "$PROJECT_DIR"

# ── Helper: detect package manager ───────────────────────────────────────────
run_cmd() {
    if command -v pnpm &> /dev/null; then
        pnpm "$@"
    elif command -v npm &> /dev/null; then
        npx "$@"
    else
        log_error "No package manager found (pnpm or npm required)"
        exit 1
    fi
}

# ── Backup ───────────────────────────────────────────────────────────────────
do_backup() {
    if [ ! -f "$DB_FILE" ]; then
        log_warn "No database file found at $DB_FILE — nothing to backup"
        return 1
    fi

    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/dev_${TIMESTAMP}.db"
    cp "$DB_FILE" "$BACKUP_FILE"

    # Also backup WAL/SHM if they exist (SQLite journal files)
    [ -f "$DB_FILE-wal" ] && cp "$DB_FILE-wal" "$BACKUP_FILE-wal"
    [ -f "$DB_FILE-shm" ] && cp "$DB_FILE-shm" "$BACKUP_FILE-shm"

    log_ok "Database backed up to: $BACKUP_FILE"
    
    # Show backup size
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log_info "Backup size: $SIZE"
    
    # Clean old backups (keep last 5)
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/dev_*.db 2>/dev/null | wc -l | tr -d ' ')
    if [ "$BACKUP_COUNT" -gt 5 ]; then
        log_info "Cleaning old backups (keeping last 5)..."
        ls -1t "$BACKUP_DIR"/dev_*.db | tail -n +6 | while read f; do
            rm -f "$f" "${f}-wal" "${f}-shm"
            log_info "  Removed: $(basename "$f")"
        done
    fi
}

# ── Restore ──────────────────────────────────────────────────────────────────
do_restore() {
    if [ ! -d "$BACKUP_DIR" ]; then
        log_error "No backup directory found"
        exit 1
    fi

    # Find latest backup
    LATEST=$(ls -1t "$BACKUP_DIR"/dev_*.db 2>/dev/null | head -1)
    if [ -z "$LATEST" ]; then
        log_error "No backup files found in $BACKUP_DIR"
        exit 1
    fi

    echo ""
    log_info "Available backups:"
    ls -1t "$BACKUP_DIR"/dev_*.db | while read f; do
        SIZE=$(du -h "$f" | cut -f1)
        echo "  $(basename "$f") ($SIZE)"
    done

    echo ""
    log_info "Restoring from: $(basename "$LATEST")"
    
    # Backup current before restore
    if [ -f "$DB_FILE" ]; then
        PRERESTORE="$BACKUP_DIR/dev_pre_restore_${TIMESTAMP}.db"
        cp "$DB_FILE" "$PRERESTORE"
        log_info "Current DB saved to: $(basename "$PRERESTORE")"
    fi

    cp "$LATEST" "$DB_FILE"
    [ -f "$LATEST-wal" ] && cp "$LATEST-wal" "$DB_FILE-wal"
    [ -f "$LATEST-shm" ] && cp "$LATEST-shm" "$DB_FILE-shm"

    log_ok "Database restored from: $(basename "$LATEST")"
    
    # Regenerate Prisma client
    log_info "Regenerating Prisma client..."
    run_cmd prisma generate
    log_ok "Prisma client regenerated"
}

# ── Reset & Re-seed ─────────────────────────────────────────────────────────
do_reset() {
    echo ""
    log_warn "This will DELETE all data and re-seed from master_data.csv"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cancelled"
        exit 0
    fi

    # Backup first
    do_backup || true

    # Clear devices (keep users)
    log_info "Clearing device data..."
    run_cmd tsx scripts/clear_database.ts

    # Re-seed from CSV
    if [ -f "$CSV_FILE" ]; then
        log_info "Seeding from master_data.csv..."
        run_cmd tsx scripts/seed_old_database.ts
        log_ok "Database re-seeded"
    else
        log_warn "master_data.csv not found — skipping seed"
        log_info "Place master_data.csv in project root and re-run"
    fi
}

# ── Migrate ──────────────────────────────────────────────────────────────────
do_migrate() {
    log_info "Running Prisma migrations..."
    
    # Backup before migration
    do_backup || true
    
    run_cmd prisma migrate deploy
    run_cmd prisma generate
    
    log_ok "Migrations applied and Prisma client regenerated"
}

# ── Full Setup (fresh install) ───────────────────────────────────────────────
do_full_setup() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  🚀 NAIWAH Store App — Database Setup"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    # Step 1: Check .env
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            log_info "Creating .env from .env.example..."
            cp .env.example .env
            
            # Generate AUTH_SECRET
            AUTH_SECRET=$(openssl rand -base64 32)
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s|AUTH_SECRET=your-secret-key-here|AUTH_SECRET=$AUTH_SECRET|g" .env
            else
                sed -i "s|AUTH_SECRET=your-secret-key-here|AUTH_SECRET=$AUTH_SECRET|g" .env
            fi
            log_ok "Created .env with generated AUTH_SECRET"
            log_warn "Review .env and update AUTH_URL for your environment"
        else
            log_error ".env.example not found — create .env manually"
            exit 1
        fi
    else
        log_ok ".env exists"
    fi

    # Step 2: Install dependencies
    log_info "Installing dependencies..."
    if command -v pnpm &> /dev/null; then
        pnpm install
    else
        npm install
    fi
    log_ok "Dependencies installed"

    # Step 3: Create directories
    log_info "Creating data directories..."
    mkdir -p data backups pb_data pb_migrations pb_hooks
    log_ok "Directories created"

    # Step 4: Generate Prisma client
    log_info "Generating Prisma client..."
    run_cmd prisma generate
    log_ok "Prisma client generated"

    # Step 5: Push schema to database (creates if not exists)
    if [ -f "$DB_FILE" ]; then
        log_info "Database file exists — running migrations..."
        run_cmd prisma migrate deploy 2>/dev/null || run_cmd prisma db push
    else
        log_info "Creating new database..."
        run_cmd prisma db push
    fi
    log_ok "Database schema ready"

    # Step 6: Seed from CSV if available
    if [ -f "$CSV_FILE" ]; then
        # Check if Device table has data
        DEVICE_COUNT=$(run_cmd tsx -e "
            import Database from 'better-sqlite3';
            const db = new Database('dev.db');
            const r = db.prepare('SELECT count(*) as c FROM Device').get() as any;
            console.log(r.c);
            db.close();
        " 2>/dev/null || echo "0")

        if [ "$DEVICE_COUNT" = "0" ]; then
            log_info "Seeding database from master_data.csv..."
            run_cmd tsx scripts/seed_old_database.ts
            log_ok "Database seeded"
        else
            log_ok "Database already has $DEVICE_COUNT devices — skipping seed"
        fi
    else
        log_warn "master_data.csv not found — skipping seed"
    fi

    # Summary
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_ok "Setup complete!"
    echo ""
    echo "  Next steps:"
    echo "    npm run dev        # Start development server"
    echo "    npm run build      # Build for production"
    echo ""
    echo "  Database commands:"
    echo "    ./scripts/setup_database.sh --backup   # Backup DB"
    echo "    ./scripts/setup_database.sh --restore  # Restore DB"
    echo "    ./scripts/setup_database.sh --reset    # Clear & re-seed"
    echo "    ./scripts/setup_database.sh --migrate  # Apply migrations"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# ── Main ─────────────────────────────────────────────────────────────────────
case "${1:-}" in
    --backup)
        do_backup
        ;;
    --restore)
        do_restore
        ;;
    --reset)
        do_reset
        ;;
    --migrate)
        do_migrate
        ;;
    --help|-h)
        echo "Usage: ./scripts/setup_database.sh [OPTION]"
        echo ""
        echo "Options:"
        echo "  (none)       Full setup (fresh install)"
        echo "  --backup     Backup current database"
        echo "  --restore    Restore from latest backup"
        echo "  --reset      Clear devices & re-seed from CSV"
        echo "  --migrate    Run pending Prisma migrations"
        echo "  --help       Show this help"
        ;;
    *)
        do_full_setup
        ;;
esac
