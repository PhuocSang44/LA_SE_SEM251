# 🚀 HCMUT TSS - Production Deployment Guide

## 📋 Overview

This guide covers deploying the HCMUT Tutoring Support System with:
- **Backend Services**: VPS with Docker (60k VNĐ/tháng)
- **Frontend**: Vercel/Netlify (MIỄN PHÍ)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│  VPS (your-vps-ip:80)                          │
│  ├─ Nginx (Reverse Proxy)                      │
│  ├─ MySQL Database                              │
│  ├─ Redis Cache                                 │
│  ├─ SSO Service (8081)                          │
│  ├─ Datacore Service (8082)                     │
│  ├─ Library Service (8083)                      │
│  └─ TSS Backend (8080)                          │
└─────────────────────────────────────────────────┘
                    ▲
                    │ HTTPS API Calls
                    │
┌─────────────────────────────────────────────────┐
│  Vercel/Netlify                                 │
│  https://your-app.vercel.app                    │
│  (React Vite Frontend)                          │
└─────────────────────────────────────────────────┘
```

---

## 💰 Cost Breakdown

| Service | Provider | Cost | Purpose |
|---------|----------|------|---------|
| **VPS** | Azdigi/Vultr/DO | 60-120k VNĐ/tháng | Backend + DB |
| **Frontend** | Vercel/Netlify | **FREE** | Static hosting |
| **Domain** | Tenten/Matbao | 150k VNĐ/năm (optional) | Custom domain |
| **SSL** | Let's Encrypt | **FREE** | HTTPS |
| **TOTAL** | | **60-120k VNĐ/tháng** | |

---

## 📦 Part 1: VPS Setup (Backend Services)

### Step 1: Choose VPS Provider

**Recommended for Vietnam:**
```bash
# Option 1: Azdigi (Vietnam - low latency)
- VPS SSD 1: 60k VNĐ/tháng
- 1 vCPU, 2GB RAM, 30GB SSD
- Location: Vietnam
- Website: azdigi.com

# Option 2: Vultr (Global)
- $5/month (120k VNĐ)
- 1 vCPU, 1GB RAM, 25GB SSD
- Location: Singapore/Japan
- Website: vultr.com

# Option 3: DigitalOcean
- $4/month (96k VNĐ)
- 1 vCPU, 512MB RAM, 10GB SSD
- Location: Singapore
- Website: digitalocean.com
```

### Step 2: Initial VPS Setup

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Verify installation
docker --version
docker-compose --version

# Create swap file (if RAM < 2GB)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
```

### Step 3: Setup Firewall

```bash
# Install UFW (Uncomplicated Firewall)
apt install ufw -y

# Allow SSH (IMPORTANT: do this first!)
ufw allow 22/tcp

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow backend ports (for testing - remove in production)
ufw allow 8080/tcp
ufw allow 8081/tcp
ufw allow 8082/tcp
ufw allow 8083/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

### Step 4: Clone Repository to VPS

```bash
# Install Git
apt install git -y

# Create app directory
mkdir -p /opt/hcmut-tss
cd /opt/hcmut-tss

# Clone your repository
git clone https://github.com/YourUsername/LA_SE_SEM251.git
cd LA_SE_SEM251

# Create .env file
cp .env.example .env
nano .env
```

**Edit `.env` file:**
```bash
MYSQL_ROOT_PASSWORD=YourSecurePassword123!
BACKEND_URL=http://your-vps-ip:8080
FRONTEND_URL=https://your-app.vercel.app
```

### Step 5: Create Dockerfiles for Each Service

**Already created:** `HCMUT-TSS-Backend/Dockerfile`

**Copy same Dockerfile to other services:**
```bash
# Copy Dockerfile to mimic services
cp HCMUT-TSS-Backend/Dockerfile HCMUT-SSO-MIMIC/
cp HCMUT-TSS-Backend/Dockerfile HCMUT-DATACORE-MIMIC/
cp HCMUT-TSS-Backend/Dockerfile HCMUT-LIBRARY-MIMIC/
```

### Step 6: Update Backend Configuration for Production

**HCMUT-TSS-Backend/src/main/resources/application-prod.properties:**
```properties
# Server Configuration
server.port=8080
spring.application.name=HCMUT-TSS-Backend

# Database Configuration (using Docker service name)
spring.datasource.url=jdbc:mysql://db:3306/hcmut-tss-mysql-db-main?createDatabaseIfNotExist=true&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=${MYSQL_ROOT_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# Redis Configuration
spring.data.redis.host=redis
spring.data.redis.port=6379

# CORS Configuration (allow frontend)
cors.allowed-origins=${FRONTEND_URL}

# Logging
logging.level.root=INFO
logging.level.org.minhtrinh=DEBUG

# Actuator (health check)
management.endpoints.web.exposure.include=health,info
management.endpoint.health.show-details=always
```

### Step 7: Deploy with Docker Compose

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yaml up -d --build

# Check logs
docker-compose -f docker-compose.prod.yaml logs -f

# Check running containers
docker ps

# Check specific service logs
docker logs hcmut-tss-backend
docker logs hcmut-sso-mimic
```

### Step 8: Test Backend APIs

```bash
# Health check
curl http://localhost:8080/actuator/health
curl http://your-vps-ip:8080/actuator/health

# Test SSO
curl http://localhost:8081/api/sso/test

# Test API endpoint
curl http://localhost:8080/api/courses
```

---

## 🌐 Part 2: Frontend Deployment (Vercel - FREE)

### Step 1: Prepare Frontend for Production

**Update API URLs in frontend:**

**HCMUT-TSS-Frontend/.env.production:**
```bash
# Create this file
VITE_API_BASE_URL=http://your-vps-ip:8080
VITE_SSO_URL=http://your-vps-ip:8081
VITE_DATACORE_URL=http://your-vps-ip:8082
VITE_LIBRARY_URL=http://your-vps-ip:8083
```

**Update `vite.config.ts` if needed:**
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 10004,
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable for production
  },
  define: {
    'process.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL),
  },
})
```

### Step 2: Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd HCMUT-TSS-Frontend

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? hcmut-tss
# - Directory? ./
# - Build command? npm run build
# - Output directory? dist
```

**Option B: Using Vercel Web Interface**
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your repository
5. Configure:
   - Framework Preset: **Vite**
   - Root Directory: **HCMUT-TSS-Frontend**
   - Build Command: **npm run build**
   - Output Directory: **dist**
6. Add Environment Variables:
   ```
   VITE_API_BASE_URL=http://your-vps-ip:8080
   ```
7. Click "Deploy"

**Your app will be live at:** `https://your-app.vercel.app`

### Step 3: Alternative - Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Navigate to frontend
cd HCMUT-TSS-Frontend

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist

# Follow prompts and authorize
```

---

## 🔒 Part 3: Setup HTTPS & Domain (Optional)

### Option 1: Free Domain with Vercel

Vercel automatically provides:
- **Free subdomain:** `your-app.vercel.app`
- **Auto HTTPS:** SSL certificate included
- **CDN:** Global edge network

### Option 2: Custom Domain

**Buy domain from:**
- Tenten.vn: ~150k VNĐ/năm (.com)
- Matbao.net: ~200k VNĐ/năm (.vn)

**Configure DNS:**
```bash
# Point your domain to Vercel
A record: @ -> 76.76.21.21
CNAME record: www -> cname.vercel-dns.com

# Or point to VPS for backend
A record: api.yourdomain.com -> your-vps-ip
```

### Option 3: SSL for VPS with Let's Encrypt

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
# Test renewal
certbot renew --dry-run
```

---

## 🔧 Part 4: Maintenance & Monitoring

### Update Application

```bash
# SSH to VPS
ssh root@your-vps-ip
cd /opt/hcmut-tss/LA_SE_SEM251

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yaml up -d --build

# Check logs
docker-compose -f docker-compose.prod.yaml logs -f
```

### Monitoring Commands

```bash
# Check disk space
df -h

# Check memory usage
free -m

# Check Docker containers
docker ps
docker stats

# View logs
docker logs hcmut-tss-backend --tail 100 -f

# Restart specific service
docker-compose -f docker-compose.prod.yaml restart tss-backend
```

### Backup Database

```bash
# Backup MySQL
docker exec hcmut-tss-mysql-db mysqldump -u root -p hcmut-tss-mysql-db-main > backup.sql

# Restore
docker exec -i hcmut-tss-mysql-db mysql -u root -p hcmut-tss-mysql-db-main < backup.sql
```

---

## 🐛 Troubleshooting

### Backend not starting
```bash
# Check logs
docker logs hcmut-tss-backend

# Common issues:
# 1. Database not ready -> Wait 30s and restart
# 2. Port already in use -> Change port in docker-compose
# 3. Out of memory -> Add swap file
```

### CORS errors
```bash
# Update application.properties
cors.allowed-origins=https://your-app.vercel.app

# Rebuild backend
docker-compose -f docker-compose.prod.yaml up -d --build tss-backend
```

### Frontend can't connect to backend
```bash
# Check if backend is accessible
curl http://your-vps-ip:8080/actuator/health

# Update frontend env variables on Vercel
# Redeploy frontend
```

---

## 📊 Performance Tips

### 1. Database Optimization
```sql
-- Add indexes to frequently queried columns
CREATE INDEX idx_user_email ON User(email);
CREATE INDEX idx_course_code ON Course(code);
```

### 2. Redis Caching
Enable in Spring Boot config:
```properties
spring.cache.type=redis
spring.cache.redis.time-to-live=3600000
```

### 3. Frontend Optimization
```bash
# Enable compression in Vite build
npm run build

# Analyze bundle size
npm run build -- --report
```

---

## 🎯 Final Checklist

- [ ] VPS provisioned and SSH configured
- [ ] Docker & Docker Compose installed
- [ ] Firewall configured (UFW)
- [ ] Repository cloned to VPS
- [ ] `.env` file configured
- [ ] Dockerfiles created for all services
- [ ] `docker-compose.prod.yaml` configured
- [ ] All services running (`docker ps`)
- [ ] Backend health check passing
- [ ] Frontend deployed to Vercel
- [ ] CORS configured correctly
- [ ] Frontend can connect to backend
- [ ] (Optional) Domain configured
- [ ] (Optional) SSL certificate installed
- [ ] Backup script configured

---

## 📞 Support

If you encounter issues:
1. Check logs: `docker-compose logs -f`
2. Verify network: `docker network ls`
3. Test connectivity: `curl http://localhost:8080/actuator/health`
4. Check firewall: `ufw status`

---

**Total Cost:** ~60-120k VNĐ/tháng (VPS only, Frontend FREE)

**Deployment Time:** 1-2 hours for first setup

**Maintenance:** 5-10 minutes per update
