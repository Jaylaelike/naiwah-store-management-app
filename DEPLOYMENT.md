# NAIWAH Store App - Production Deployment Guide

## Overview

This guide covers deploying the NAIWAH Store App using Docker in a production environment.

**Stack:**
- **Next.js 16** - Frontend & API
- **SQLite** (via Prisma + better-sqlite3) - Database
- **PocketBase** - File storage for device images
- **Docker & Docker Compose** - Containerization

---

## Quick Start (Production Server)

```bash
# 1. Clone and navigate to project
git clone <your-repo-url>
cd store-app-antigrav

# 2. Create required directories
mkdir -p data pb_data backups

# 3. Create and configure .env file
cp .env.example .env
nano .env  # Configure all required variables (see below)

# 4. Create app-settings.json if not exists
echo '{"requireApproval":true,"allowSelfRegister":false}' > app-settings.json

# 5. Build and start containers
docker-compose up -d --build

# 6. Wait for containers to be healthy (30-60 seconds)
docker-compose ps

# 7. Initialize database
docker-compose exec app npx prisma db push

# 8. Create first admin user
docker-compose exec app npx prisma db seed

# 9. Setup PocketBase (see PocketBase Setup section below)
# Access: http://your-server-ip:8090/_/

# 10. Verify application is running
# Access: http://your-server-ip:3000/naiwah
```

**Default Admin Credentials (from seed):**
- Username: `admin`
- Password: `admin123`
- ⚠️ **Change this immediately after first login!**

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
nano .env
```

**Required variables for production:**

| Variable | Description | Production Value |
|----------|-------------|------------------|
| `DATABASE_URL` | SQLite database path | `file:./data/dev.db` (default, no change needed) |
| `AUTH_SECRET` | NextAuth.js secret | Generate: `openssl rand -base64 32` |
| `AUTH_URL` | **Production domain** | `https://your-domain.com/naiwah` |
| `NEXTAUTH_URL` | Same as AUTH_URL | `https://your-domain.com/naiwah` |
| `NEXT_PUBLIC_POCKETBASE_URL` | PocketBase internal URL | `http://pocketbase:8080` (default) |
| `NODE_ENV` | Environment | `production` |

**Important Notes for Prisma 7:**
- This project uses **Prisma 7** which has changed configuration requirements
- The `DATABASE_URL` is configured in both `prisma.config.ts` (for migrations) and environment variables (for runtime)
- The `url` field has been **removed** from `prisma/schema.prisma` as it's no longer supported in Prisma 7
- The runtime client uses the `@prisma/adapter-better-sqlite3` adapter pattern

### 3. Database Initialization

The SQLite database will be created at `./data/dev.db` inside the Docker container.

**Step-by-step initialization:**

```bash
# 1. Ensure Docker containers are running
docker-compose up -d

# 2. Check container status (wait until healthy)
docker-compose ps

# 3. Generate Prisma client and create database schema
docker-compose exec app npx prisma db push

# Expected output: "The database is now in sync with your schema."

# 4. Create first admin user (optional but recommended)
docker-compose exec app npx prisma db seed

# Expected output: "Admin user created: admin / admin123"

# 5. Verify database was created
ls -lh ./data/dev.db

# Should show a file with size > 50KB
```

**If database already exists and you need to migrate:**

```bash
# Apply schema changes without data loss
docker-compose exec app npx prisma db push

# Or reset database completely (⚠️ DELETES ALL DATA)
docker-compose exec app npx prisma migrate reset --force
```

**Troubleshooting:**

```bash
# If "Error: datasource property `url` is no longer supported"
# This is a Prisma 7 error - the url field should NOT be in schema.prisma
# Check that prisma/schema.prisma datasource block only has:
#   provider = "sqlite"
# The url is configured in prisma.config.ts instead

# If "Error: The datasource.url property is required"
# This means DATABASE_URL environment variable is not set
docker-compose restart app
docker-compose exec app env | grep DATABASE_URL
# Should show: DATABASE_URL=file:./data/dev.db

# If "Error: Can't reach database server"
docker-compose restart app
docker-compose logs app
```

### 4. PocketBase Setup

PocketBase is used for storing device images.

**Step-by-step first-time setup:**

```bash
# 1. Ensure PocketBase container is running
docker-compose ps pocketbase

# Should show "Up" status

# 2. Access PocketBase admin panel
# Open browser: http://your-server-ip:8090/_/
# Or with domain: https://your-domain.com:8090/_/
```

**3. Create Admin Account (First Visit Only):**

When you access PocketBase for the first time, you'll see a setup page:
- Email: `admin@example.com` (or your email)
- Password: Create a strong password
- Click "Create and Login"

**4. Create `device_images` Collection:**

a) Click **"Collections"** in sidebar → **"New Collection"**

**Initial build and deployment:**

```bash
# 1. Build and start all services
docker-compose up -d --build

# Expected output:
# Creating network "store-app-antigrav_naiwah-network"
# Creating store-app-antigrav_pocketbase_1 ... done
# Creating store-app-antigrav_app_1        ... done

# 2. Monitor build progress and logs
docker-compose logs -f

# Press Ctrl+C to stop following logs (containers keep running)

# 3. Check container health status
docker-compose ps

# Both containers should show "Up" status

# 4. View specific service logs
docker-compose logs -f app          # Next.js application logs
docker-compose logs -f pocketbase   # PocketBase logs

# 5. Test application is responding
curl http://localhost:3005/naiwah   # Should return HTML

# Or open browser:
# http://your-server-ip:3005/naiwah
```

**Common startup issues:**

```bash
# If "port already in use"
docker-compose down
sudo lsof -i :3005   # Check what's using port 3005
sudo lsof -i :8090   # Check what's using port 8090

# If containers keep restarting
docker-compose logs app | tail -50

# If "permission denied" on data/
sudo chown -R 1001:1001 ./data ./pb_data
chmod -R 755 ./data ./pb_data
docker-compose restart
     - ☑ Required
     - Max Select: `1`
     - Max Size: `5242880` (5MB)
     - Mime Types: `image/jpeg, image/png, image/jpg, image/gif, image/webp`
   - Click **"Save"**

d) **Set API Rules (IMPORTANT):**
   
   Click on **"API Rules"** tab and set for each operation:
   
   | Operation | Rule |
   |-----------|------|
   | **List/Search** | `@request.auth.id != ""` |
   | **View** | `@request.auth.id != ""` |
   | **Create** | `@request.auth.id != ""` |
   | **Update** | `@request.auth.id != ""` |
   | **Delete** | `@request.auth.id != ""` |
   
   These rules mean: "Only authenticated users can access"

e) Click **"Save changes"** at top right

**5. Verify Setup:**

```bash
# Test API endpoint
curl http://localhost:8090/api/collections/device_images/records

# Should return: {"items":[],"page":1,"perPage":30,"totalItems":0,"totalPages":0}
```

**Security Notes:**
- Store PocketBase admin credentials securely
- Consider changing the default port 8090 if exposed publicly
- Enable HTTPS for production (via reverse proxy)
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

### Pre-Deployment
- [ ] Docker and Docker Compose installed on server
- [ ] `.env` file created with all required variables
- [ ] `AUTH_SECRET` generated with `openssl rand -base64 32`
- [ ] `AUTH_URL` set to production domain (including `/naiwah` basePath)
- [ ] Firewall configured (ports 80, 443, 8090 if needed)
- [ ] Domain DNS configured (A record pointing to server)
- [ ] SSL certificates ready (for nginx/traefik)

### Deployment
- [ ] Code cloned/pulled to server
- [ ] Directories created: `data/`, `pb_data/`, `backups/`
- [ ] `docker-compose up -d --build` executed successfully
- [ ] Both containers running (`docker-compose ps` shows "Up")
- [ ] Database initialized (`docker-compose exec app npx prisma db push`)
- [ ] First admin user created (`docker-compose exec app npx prisma db seed`)
- [ ] PocketBase admin account created
- [ ] `device_images` collection created in PocketBase
- [ ] PocketBase API rules configured

### Post-Deployment
- [ ] Application accessible via browser
- [ ] Login working with admin credentials
- [ ] Changed default admin password
- [ ] Reverse proxy configured with SSL
- [ ] Automated backups configured
- [ ] Monitoring and alerting set up
- [ ] Email notifications tested (if configured)
- [ ] Created additional user accounts
- [ ] Tested device creation and image upload

---

## Complete Production Deployment Workflow

### On Production Server:

```bash
# ============================================
# STEP 1: Install Prerequisites
# ============================================
# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Log out and back in for group changes

# Docker Compose (if not included)
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Verify installation
docker --version
docker compose version


# ============================================
# STEP 2: Clone Repository
# ============================================
cd /opt  # or your preferred location
git clone <your-repo-url> store-app-antigrav
cd store-app-antigrav


# ============================================
# STEP 3: Create Required Directories
# ============================================
mkdir -p data pb_data backups
chmod 755 data pb_data backups


# ============================================
# STEP 4: Configure Environment
# ============================================
# Generate AUTH_SECRET
AUTH_SECRET=$(openssl rand -base64 32)
echo "Generated AUTH_SECRET: $AUTH_SECRET"

# Create .env file
cat > .env << EOF
DATABASE_URL="file:./data/dev.db"
AUTH_SECRET="$AUTH_SECRET"
AUTH_URL="https://your-domain.com/naiwah"
NEXTAUTH_URL="https://your-domain.com/naiwah"
NEXT_PUBLIC_POCKETBASE_URL="http://pocketbase:8080"
NODE_ENV="production"
EOF

# Review and edit if needed
nano .env


# ============================================
# STEP 5: Create App Settings
# ============================================
cat > app-settings.json << EOF
{
  "requireApproval": true,
  "allowSelfRegister": false
}
EOF


# ============================================
# STEP 6: Build and Start Containers
# ============================================
docker-compose up -d --build

# Wait for containers to be healthy (30-60 seconds)
sleep 30
docker-compose ps


# ============================================
# STEP 7: Initialize Database
# ============================================
# Create schema
docker-compose exec app npx prisma db push

# Create first admin user (username: admin, password: admin123)
docker-compose exec app npx prisma db seed

# Verify database created
ls -lh ./data/dev.db


# ============================================
# STEP 8: Setup PocketBase
# ============================================
echo "
==============================================
POCKETBASE SETUP REQUIRED
==============================================
1. Open browser: http://$(hostname -I | awk '{print $1}'):8090/_/
2. Create admin account (email + password)
3. Create 'device_images' collection:
   - Type: Base collection
   - Field: 'image' (File, Max 5MB)
   - API Rules: @request.auth.id != \"\" for all operations
4. Save and note down admin credentials
==============================================
"


# ============================================
# STEP 9: Verify Application
# ============================================
echo "Testing application..."
curl -I http://localhost:3005/naiwah/login

echo "
==============================================
DEPLOYMENT COMPLETE
==============================================
Application URL: http://$(hostname -I | awk '{print $1}'):3005/naiwah
PocketBase Admin: http://$(hostname -I | awk '{print $1}'):8090/_/

Default Login:
  Username: admin
  Password: admin123
  
⚠️  IMPORTANT: Change admin password immediately!

Next Steps:
1. Configure reverse proxy (nginx/traefik) with SSL
2. Setup automated backups
3. Configure monitoring
==============================================
"


# ============================================
# STEP 10: Check Logs
# ============================================
docker-compose logs -f
# Press Ctrl+C to exit
```

### Configure Reverse Proxy (nginx + SSL):

```bash
# Install nginx and certbot
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx

# Create nginx config
sudo cat > /etc/nginx/sites-available/naiwah << 'EOF'
server {
    listen 80;
    server_name your-domain.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL certificates (will be added by certbot)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Next.js App (with /naiwah basePath)
    location /naiwah {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Optional: PocketBase admin (restrict access)
    location /pb/ {
        # Restrict to specific IP if needed
        # allow 123.123.123.123;
        # deny all;
        
        proxy_pass http://localhost:8090/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/naiwah /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Setup Automated Backups:

```bash
# Create backup script
cat > /opt/store-app-antigrav/backup.sh << 'EOF'
#!/bin/bash
BACKUP_ROOT="/opt/store-app-antigrav/backups"
BACKUP_DIR="$BACKUP_ROOT/$(date +%Y%m%d_%H%M%S)"
APP_DIR="/opt/store-app-antigrav"

mkdir -p "$BACKUP_DIR"

# Backup database
cp "$APP_DIR/data/dev.db" "$BACKUP_DIR/"

# Backup PocketBase data
tar -czf "$BACKUP_DIR/pb_data.tar.gz" -C "$APP_DIR" pb_data/

# Backup app settings
cp "$APP_DIR/app-settings.json" "$BACKUP_DIR/"

# Keep only last 7 days of backups
find "$BACKUP_ROOT" -type d -mtime +7 -exec rm -rf {} +

echo "Backup completed: $BACKUP_DIR"
EOF

chmod +x /opt/store-app-antigrav/backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/store-app-antigrav/backup.sh >> /var/log/naiwah-backup.log 2>&1") | crontab -

# Test backup
/opt/store-app-antigrav/backup.sh
ls -la /opt/store-app-antigrav/backups/
```

---

## Post-Deployment Tasks

### 1. Change Default Admin Password

```bash
# Login to application: https://your-domain.com/naiwah/login
# Username: admin
# Password: admin123

# Go to Settings or User Profile
# Change password to a strong password
# Save changes
```

### 2. Create Additional Users

```bash
# Option 1: Via UI (if self-register enabled)
# Navigate to /naiwah/register

# Option 2: Via Admin Panel
# Login as admin → Admin → Users → Add User

# Option 3: Directly via database
docker-compose exec app npx prisma studio
# Access via http://your-server-ip:5555
# Navigate to User table → Add record
```

### 3. Monitor Application

```bash
# View real-time logs
docker-compose logs -f

# Check resource usage
docker stats

# Check disk space
df -h

# Check running containers
docker-compose ps
```

### 4. Update Application

```bash
cd /opt/store-app-antigrav

# Pull latest changes
git pull

# Backup before update
./backup.sh

# Rebuild and restart
docker-compose up -d --build

# Run any new migrations
docker-compose exec app npx prisma db push

# Check logs
docker-compose logs -f app
```

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
