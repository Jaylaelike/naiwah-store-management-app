# Database Migration Guide

การย้ายฐานข้อมูลเมื่อย้ายโปรเจกต์ไปที่ใหม่

## Overview

| Item | Detail |
|------|--------|
| Database | SQLite (`dev.db` in project root) |
| ORM | Prisma 7 with `better-sqlite3` adapter |
| Seed data | `master_data.csv` (~13,600 devices) |
| Script | `scripts/setup_database.sh` |

---

## Quick Start (ย้ายโปรเจกต์)

### Option A: Move with existing data

```bash
# 1. On OLD server — backup
./scripts/setup_database.sh --backup

# 2. Copy project to new location (include dev.db & backups/)
scp -r store-app-antigrav/ user@new-server:/path/to/

# 3. On NEW server — install & migrate
cd /path/to/store-app-antigrav
npm install
npx prisma generate
npx prisma migrate deploy    # apply any pending schema changes
npm run build
```

### Option B: Fresh install (re-seed from CSV)

```bash
# 1. Copy project WITHOUT dev.db
cd /path/to/store-app-antigrav
./scripts/setup_database.sh   # full setup: .env, install, migrate, seed
```

---

## Script Commands

```bash
./scripts/setup_database.sh              # Full setup (fresh)
./scripts/setup_database.sh --backup     # Backup → backups/dev_YYYYMMDD_HHMMSS.db
./scripts/setup_database.sh --restore    # Restore latest backup
./scripts/setup_database.sh --reset      # Clear devices → re-seed from CSV
./scripts/setup_database.sh --migrate    # Apply pending Prisma migrations
```

---

## Manual Steps

### Backup Database

```bash
# Simple copy
cp dev.db dev.db.bak

# Or with timestamp
cp dev.db "backups/dev_$(date +%Y%m%d_%H%M%S).db"
```

### Apply Schema Changes After Migration

```bash
# If migrations exist
npx prisma migrate deploy

# If no migrations (sync schema directly)
npx prisma db push

# Always regenerate client after schema changes
npx prisma generate
```

### Re-seed from CSV

```bash
# 1. Clear existing device data (keeps users)
npx tsx scripts/clear_database.ts

# 2. Seed from master_data.csv
npx tsx scripts/seed_old_database.ts
```

### Reset Everything

```bash
# Delete database and start fresh
rm dev.db dev.db-wal dev.db-shm 2>/dev/null
npx prisma db push
npx prisma generate
npx tsx scripts/seed_old_database.ts
```

---

## Docker Deployment

```bash
# Build and start
docker-compose up -d --build

# The database is stored in a Docker volume
# To backup from Docker:
docker cp naiwah-app:/app/dev.db ./backups/

# To restore to Docker:
docker cp ./backups/dev_latest.db naiwah-app:/app/dev.db
docker restart naiwah-app
```

---

## Important Files

| File | Purpose |
|------|---------|
| `dev.db` | SQLite database file |
| `prisma/schema.prisma` | Database schema definition |
| `prisma/migrations/` | Migration history |
| `master_data.csv` | Source data for seeding |
| `scripts/setup_database.sh` | Setup & migration script |
| `scripts/seed_old_database.ts` | CSV → database seeder |
| `scripts/clear_database.ts` | Clear device data |
| `.env` | `DATABASE_URL=file:./dev.db` |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `database is locked` | Stop the app first, then run script |
| `table not found` | Run `npx prisma db push` |
| Prisma type errors after migration | Run `npx prisma generate` and restart TS server |
| Seed skips rows | Rows with `assetId = "--"` are inserted with `null` (expected) |
| `.env` missing | Copy from `.env.example` or run `./scripts/setup_database.sh` |
