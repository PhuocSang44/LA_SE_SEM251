# 🚀 HCMUT TSS - VPS + Vercel Deployment Guide

**VPS Info:**
- **IP:** 103.20.96.46
- **RAM:** 1GB (optimized configuration)
- **Architecture:** Backend trên VPS + Frontend trên Vercel

---

## 📋 CHECKLIST TRƯỚC KHI DEPLOY

### ✅ Thông tin cần chuẩn bị:

1. **VPS Access**
   - [x] IP: 103.20.96.46
   - [x] SSH User: root  
   - [x] SSH Password: `TssProject@2025!`

2. **GitHub Repository**
   - [x] Repository: https://github.com/MinhTrinhh/LA_SE_SEM251.git (PRIVATE)
   - [x] Branch deploy: `deploy-conf` (hiện tại)
   - [x] Personal Access Token: `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`

3. **Vercel Account**
   - [x] Đã tạo account tại: https://vercel.com
   - [x] Link với GitHub account

4. **Database Password**
   - [x] MySQL Password: `10diemSEHK251@`

---

## 🎯 PHASE 1: SETUP VPS BACKEND (30 phút)

### Step 1: Kết nối VPS
```bash
# Kết nối SSH
ssh root@103.20.96.46

# Kiểm tra tài nguyên hiện tại
free -m   # Kiểm tra RAM
df -h     # Kiểm tra disk space
```

### Step 2: Chạy script setup tự động
```bash
# Tải script setup
curl -o setup-vps.sh https://raw.githubusercontent.com/MinhTrinhh/LA_SE_SEM251/deploy-conf/deploy-vps-commands.sh

# Chạy script
bash setup-vps.sh

# Script sẽ cài đặt:
# - Docker + Docker Compose
# - Firewall (UFW)
# - Swap file 2GB (quan trọng cho 1GB RAM)
# - Git và các tool cần thiết
```

### Step 3: Clone repository
```bash
# Di chuyển đến thư mục app
cd /opt/hcmut-tss

# Clone repository 
git clone https://github.com/MinhTrinhh/LA_SE_SEM251.git
cd LA_SE_SEM251

# Checkout branch deploy
git checkout deploy-conf

# Kiểm tra files
ls -la
```

### Step 4: Tạo file environment
```bash
# Copy file .env production
cp .env.production .env

# Chỉnh sửa nếu cần
nano .env

# Nội dung cần thiết:
# MYSQL_ROOT_PASSWORD=HcmutTss2025!@#
# CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
```

### Step 5: Deploy backend services
```bash
# Build và start tất cả services
docker-compose -f docker-compose.prod.yaml up -d --build

# Đợi 2-3 phút để các service khởi động
sleep 180

# Kiểm tra trạng thái containers
docker ps

# Kiểm tra logs
docker-compose -f docker-compose.prod.yaml logs -f

# Test health check
curl http://localhost:8080/actuator/health
```

### Step 6: Kiểm tra memory usage
```bash
# Kiểm tra RAM usage
free -m

# Kiểm tra container memory usage
docker stats

# Expected usage (~800MB total):
# - MySQL: ~200MB
# - TSS Backend: ~300MB  
# - SSO Mimic: ~150MB
# - Datacore Mimic: ~150MB
# - Library Mimic: ~150MB
# - Redis: ~50MB
```

---

## 🌐 PHASE 2: DEPLOY FRONTEND VERCEL (15 phút)

### Step 1: Chuẩn bị Repository
```bash
# Đảm bảo files cần thiết đã được push
# - HCMUT-TSS-Frontend/.env.production
# - HCMUT-TSS-Frontend/vercel.json

# Commit và push nếu cần
git add .
git commit -m "Add production config for Vercel"
git push origin deploy-conf
```

### Step 2: Deploy với Vercel Web Interface

1. **Truy cập:** https://vercel.com/dashboard
2. **Nhấn "Add New..."** → **Project**
3. **Import Git Repository:** chọn `LA_SE_SEM251`
4. **Configure Project:**
   - **Project Name:** `hcmut-tss`
   - **Framework Preset:** Vite
   - **Root Directory:** `HCMUT-TSS-Frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. **Environment Variables** (quan trọng):
   ```
   VITE_API_BASE_URL = http://103.20.96.46:8080
   VITE_SSO_URL = http://103.20.96.46:8081
   VITE_DATACORE_URL = http://103.20.96.46:8082
   VITE_LIBRARY_URL = http://103.20.96.46:8083
   ```

6. **Deploy** → đợi 2-3 phút

### Step 3: Lấy Frontend URL
```bash
# Vercel sẽ tạo URL kiểu:
# https://hcmut-tss-abc123.vercel.app
# hoặc
# https://your-app.vercel.app

# Copy URL này để cập nhật CORS
```

---

## 🔧 PHASE 3: CẬP NHẬT CORS (5 phút)

### Step 1: Cập nhật .env trên VPS
```bash
# SSH vào VPS
ssh root@103.20.96.46
cd /opt/hcmut-tss/LA_SE_SEM251

# Sửa file .env
nano .env

# Cập nhật dòng CORS_ALLOWED_ORIGINS với URL thực từ Vercel
CORS_ALLOWED_ORIGINS=https://hcmut-tss-abc123.vercel.app,http://localhost:3000

# Lưu file (Ctrl+X, Y, Enter)
```

### Step 2: Restart backend services
```bash
# Restart để áp dụng CORS mới
docker-compose -f docker-compose.prod.yaml restart tss-backend

# Kiểm tra logs
docker logs hcmut-tss-backend --tail 50 -f
```

---

## ✅ PHASE 4: KIỂM TRA TOÀN BỘ HỆ THỐNG

### Step 1: Test Backend APIs
```bash
# Health check
curl http://103.20.96.46:8080/actuator/health

# Test CORS
curl -H "Origin: https://your-vercel-url.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://103.20.96.46:8080/api/courses
```

### Step 2: Test Frontend
1. Mở **https://your-vercel-url.vercel.app**
2. Kiểm tra:
   - [ ] Trang load thành công
   - [ ] Console không có CORS errors
   - [ ] Có thể login (nếu có)
   - [ ] API calls hoạt động

### Step 3: Test toàn bộ workflow
1. **Frontend:** Thực hiện action cần API
2. **Network Tab:** Kiểm tra request/response  
3. **Backend Logs:** `docker logs hcmut-tss-backend -f`

---

## 📊 MONITORING & MAINTENANCE

### Commands hữu ích:
```bash
# Kiểm tra memory usage
free -m
docker stats

# Kiểm tra logs
docker-compose logs -f

# Restart service cụ thể
docker-compose restart tss-backend

# Update code
git pull origin deploy-conf
docker-compose up -d --build

# Backup database
docker exec hcmut-tss-mysql-db mysqldump -u root -pHcmutTss2025!@# hcmut-tss-mysql-db-main > backup.sql
```

### Performance Tips cho 1GB RAM:
```bash
# Monitor memory
watch -n 5 'free -m'

# Nếu out of memory, restart services từng cái một
docker-compose restart sso-mimic
sleep 30
docker-compose restart datacore-mimic
# ...
```

---

## 🚨 TROUBLESHOOTING

### Frontend không connect được Backend:
1. Kiểm tra firewall VPS: `ufw status`
2. Test API trực tiếp: `curl http://103.20.96.46:8080/actuator/health`
3. Kiểm tra CORS settings trong .env

### Backend out of memory:
1. Kiểm tra: `docker stats`
2. Restart services: `docker-compose restart`
3. Tăng swap nếu cần: `swapon -s`

### Vercel deployment fail:
1. Kiểm tra build logs trong Vercel dashboard
2. Verify package.json scripts
3. Kiểm tra environment variables

---

## 💰 CHI PHÍ VẬN HÀNH

| Service | Cost | Note |
|---------|------|------|
| **VPS** | 60k VNĐ/tháng | Backend + Database |
| **Vercel** | **MIỄN PHÍ** | Frontend hosting |
| **Domain** | 150k VNĐ/năm | Optional |
| **SSL** | **MIỄN PHÍ** | Let's Encrypt |
| **TOTAL** | **60k VNĐ/tháng** | |

---

## 🎉 KẾT QUẢ CUỐI CÙNG

**Frontend URL:** https://your-app.vercel.app
**Backend API:** http://103.20.96.46:8080
**Admin Panel:** http://103.20.96.46:8080/admin (if available)

**Performance:**
- ⚡ Frontend: CDN toàn cầu, load < 2s
- 🚀 Backend: VPS Vietnam, latency < 50ms
- 💾 Database: Local MySQL, không limit

**Scalability:**
- Frontend: Auto-scale với Vercel
- Backend: Có thể upgrade VPS khi cần