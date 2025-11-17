# Development Scripts

This folder contains automation scripts to simplify development workflow for LA_SE_SEM251 project.

## 📁 Files in this folder

- **`dev-menu.ps1`** - Interactive development menu (⭐ Start here!)
- **`start-all.ps1`** - Start all 4 services at once
- **`stop-all.ps1`** - Stop all running services
- **`check-status.ps1`** - Check if services are running
- **`restart-service.ps1`** - Restart a single service
- **`view-logs.ps1`** - View service logs helper
- **`DEV_GUIDE.md`** - Complete development guide
- **`AUTOMATION_SUMMARY.md`** - Technical implementation details

## 🚀 Quick Start

### Recommended: Use Dev Menu
```powershell
cd scripts
.\dev-menu.ps1
```

### Or start all services directly
```powershell
cd scripts
.\start-all.ps1
```

## 📚 Documentation

See **[DEV_GUIDE.md](DEV_GUIDE.md)** for complete usage instructions.

## 💡 Running from Project Root

You can also run scripts from the project root directory:
```powershell
# From project root
.\scripts\dev-menu.ps1
.\scripts\start-all.ps1
.\scripts\check-status.ps1
```

All path handling is automatic!
