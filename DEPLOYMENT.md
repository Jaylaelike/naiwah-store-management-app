# NAIWAH Store App - Production Deployment Guide

## Overview

This guide covers deploying the NAIWAH Store App using Docker in a production environment.

**Stack:**
- **Next.js 16** - Frontend & API
- **SQLite** (via Prisma + better-sqlite3) - Database
- **PocketBase** - File storage for device images
- **Docker & Docker Compose** - Containerization

---

## Quick Start

```bash
# 1. Clone and navigate to project
cd store-app-antigrav

# 2. Run initialization script
chmod +x scripts/init-production.sh
./scripts/init-production.sh

# 3. Update .env file for production
nano .env  # Set AUTH_URL to your production domain

# 4. Build and start containers
docker-compose up -d --build

# 5. Access the app
# App: http://localhost:3000
# PocketBase Admin: http://localhost:8090/_/
```

---

## Detailed Setup

### 1. Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 2GB RAM minimum
- 10GB disk space

### 2. Environment Configuration

Copy and configure environment variables:

```bash
cp .env.example .env
```

**Required variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| `AUTH_SECRET` | NextAuth.js secret (auto-generated) | `openssl rand -base64 32` |
| `AUTH_URL` | Production URL | `https://naiwah.example.com` |
| `NEXT_PUBLIC_POCKETBASE_URL` | PocketBase URL | `http://pocketbase:8080` |

### 3. Database Initialization

The SQLite database will be created at `./data/dev.db`.

**To initialize/migrate the database:**

```bash
# Local (before Docker)
pnpm prisma generate
pnpm prisma db push

# Or run seed
pnpm prisma db seed
```

**To run migrations inside Docker:**

```bash
docker-compose exec app npx prisma db push
```

### 4. PocketBase Setup

PocketBase is used for storing device images.

**First-time setup:**

1. Access PocketBase admin: `http://localhost:8090/_/`
2. Create admin account (email + password)
3. Create the `device_images` collection:

   **Collection Settings:**
   - Name: `device_images`
   - Type: Base collection
   
   **Fields:**
   | Field | Type | Options |
   |-------|------|---------|
   | `image` | File | Max size: 5MB, Mime types: image/* |

4. Set collection rules:
   - List/Search: `@request.auth.id != ""`
   - View: `@request.auth.id != ""`
   - Create: `@request.auth.id != ""`
   - Update: `@request.auth.id != ""`
   - Delete: `@request.auth.id != ""`

### 5. Build & Run

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f app
docker-compose logs -f pocketbase
```

---

## Directory Structure

```
store-app-antigrav/
├── data/                    # SQLite database (mounted)
│   └── dev.db
├── pb_data/                 # PocketBase data (mounted)
├── pb_migrations/           # PocketBase migrations
├── pb_hooks/                # PocketBase hooks
├── app-settings.json        # App settings (mounted)
├── .env                     # Environment variables
├── docker-compose.yml       # Docker Compose config
├── Dockerfile               # Next.js Dockerfile
└── Dockerfile.pocketbase    # PocketBase Dockerfile
```

---

## Services

| Service | Port | Description |
|---------|------|-------------|
| `app` | 3000 | Next.js application |
| `pocketbase` | 8090 | File storage & admin |

---

## Management Commands

### Start/Stop

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

### Database

```bash
# Run Prisma migrations
docker-compose exec app npx prisma db push

# Open Prisma Studio (requires port mapping)
docker-compose exec app npx prisma studio

# Backup database
cp ./data/dev.db ./backups/dev-$(date +%Y%m%d).db

# Reset database
rm ./data/dev.db
docker-compose restart app
```

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f pocketbase

# Last 100 lines
docker-compose logs --tail=100 app
```

### Updates

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build
```

---

## Production Checklist

- [ ] Set `AUTH_SECRET` to a secure value
- [ ] Set `AUTH_URL` to production domain
- [ ] Configure reverse proxy (nginx/traefik) with SSL
- [ ] Set up automated backups for `./data/` and `./pb_data/`
- [ ] Configure firewall to expose only ports 80/443
- [ ] Set up monitoring and alerting
- [ ] Create PocketBase admin account and collection
- [ ] Test email notifications

---

## Reverse Proxy (nginx)

Example nginx configuration:

```nginx
server {
    listen 80;
    server_name naiwah.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name naiwah.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Next.js App
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # PocketBase (optional - for external access)
    location /pb/ {
        proxy_pass http://localhost:8090/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs app

# Check container status
docker-compose ps

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database errors

```bash
# Check database file exists
ls -la ./data/

# Fix permissions
chmod 644 ./data/dev.db
chown 1001:1001 ./data/dev.db

# Regenerate Prisma client
docker-compose exec app npx prisma generate
```

### PocketBase connection issues

```bash
# Check PocketBase is running
docker-compose logs pocketbase

# Test health endpoint
curl http://localhost:8090/api/health

# Check network
docker network inspect store-app-antigrav_naiwah-network
```

---

## Backup & Restore

### Backup

```bash
#!/bin/bash
BACKUP_DIR="./backups/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Database
cp ./data/dev.db $BACKUP_DIR/

# PocketBase data
tar -czf $BACKUP_DIR/pb_data.tar.gz ./pb_data/

# App settings
cp ./app-settings.json $BACKUP_DIR/

echo "Backup completed: $BACKUP_DIR"
```

### Restore

```bash
#!/bin/bash
BACKUP_DIR="./backups/20260208"  # Change to your backup date

# Stop services
docker-compose down

# Restore database
cp $BACKUP_DIR/dev.db ./data/

# Restore PocketBase
tar -xzf $BACKUP_DIR/pb_data.tar.gz -C ./

# Restore settings
cp $BACKUP_DIR/app-settings.json ./

# Start services
docker-compose up -d
```

---

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review this documentation
- Check GitHub issues
