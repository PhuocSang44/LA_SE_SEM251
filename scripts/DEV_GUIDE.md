# 🚀 Development Scripts Guide

## Interactive Menu (Recommended!)

### Launch Development Control Panel
```powershell
.\dev-menu.ps1
```

This opens an interactive menu with all available commands:
- Start/Stop all services
- Restart individual services
- Check service status
- View logs
- Clean Maven builds
- Open development guide
- Open service URLs in browser

---

## Individual Scripts

### Start All Services
```powershell
.\start-all.ps1
```

This will open **4 separate terminal windows**, each running one service:
- **SSO Server** (Port 10003) - Authentication service
- **Datacore Server** (Port 10005) - Mock data provider
- **TSS Backend** (Port 10001) - Main backend API
- **TSS Frontend** (Port 10004) - React frontend

### Check Service Status
```powershell
.\check-status.ps1
```

### Stop All Services
```powershell
.\stop-all.ps1
```

Or simply close the individual terminal windows.

---

## Service Details

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| TSS Backend | 10001 | http://localhost:10001 | Main API server |
| SSO Server | 10003 | http://localhost:10003 | Authentication |
| TSS Frontend | 10004 | http://localhost:10004 | Web interface |
| Datacore | 10005 | http://localhost:10005 | Mock data API |

---

## Development Workflow

### 1. First Time Setup
```powershell
# Install frontend dependencies
cd HCMUT-TSS-Frontend
npm install

# Make sure MySQL is running on port 10000
# Make sure Redis is running on port 10002
```

### 2. Daily Development
```powershell
# Start all services
.\start-all.ps1

# Check if everything is running
.\check-status.ps1

# Do your development work...
# Hot reload works for both Java (spring-boot-devtools) and React (Vite)

# When done, stop all services
.\stop-all.ps1
```

### 3. Testing with Postman
- All backend services run locally with hot-reload
- No need to rebuild JARs
- Same speed as running `mvnw spring-boot:run` manually
- API endpoints available at:
  - Backend API: `http://localhost:10001/api/*`
  - SSO: `http://localhost:10003/*`
  - Datacore: `http://localhost:10005/*`

---

## Advantages Over Docker

✅ **Faster startup** - No container overhead  
✅ **Hot reload** - Code changes apply immediately  
✅ **Easy debugging** - Attach debugger directly  
✅ **Native performance** - No virtualization  
✅ **Simple logs** - Each service in its own window  

---

## Troubleshooting

### Port Already in Use
```powershell
# Check what's using a port
netstat -ano | findstr :10001

# Kill the process
taskkill /PID <PID> /F
```

### Service Won't Start
1. Check if dependencies (MySQL, Redis) are running
2. Check application.properties for correct configuration
3. Look at the terminal window for error messages

### Maven Issues
```powershell
# Clean and reinstall dependencies
cd HCMUT-TSS-Backend
.\mvnw clean install
```

### Frontend Issues
```powershell
# Reinstall node modules
cd HCMUT-TSS-Frontend
rm -rf node_modules
npm install
```

---

## Manual Start (Alternative)

If you prefer to start services manually:

```powershell
# Terminal 1 - SSO
cd HCMUT-SSO-MIMIC
.\mvnw spring-boot:run

# Terminal 2 - Datacore
cd HCMUT-DATACORE-MIMIC
.\mvnw spring-boot:run

# Terminal 3 - Backend
cd HCMUT-TSS-Backend
.\mvnw spring-boot:run

# Terminal 4 - Frontend
cd HCMUT-TSS-Frontend
npm run dev
```

---

## Docker Alternative (Production Only)

For production deployment, you can use Docker Compose:

```powershell
docker-compose up --build
```

⚠️ **Not recommended for development** due to slower rebuild times and no hot-reload.

---

## Notes

- Scripts are designed for Windows PowerShell
- For Linux/Mac, create equivalent bash scripts
- Hot reload requires spring-boot-devtools in pom.xml (already configured)
- Frontend uses Vite's built-in hot module replacement (HMR)
