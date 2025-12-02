#!/bin/bash
# HCMUT TSS VPS Deployment Script
# VPS: 103.20.96.46 (1GB RAM)

echo "🚀 Starting VPS deployment for HCMUT TSS..."

# 1. Update system
echo "📦 Updating system..."
apt update && apt upgrade -y

# 2. Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install docker-compose -y

# 3. Create swap file (important for 1GB RAM)
echo "💾 Creating swap file for memory optimization..."
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab

# 4. Setup firewall
echo "🔒 Configuring firewall..."
apt install ufw -y
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw allow 8080/tcp # Backend (temporary for testing)
ufw --force enable

# 5. Create application directory
echo "📁 Setting up application directory..."
mkdir -p /opt/hcmut-tss
cd /opt/hcmut-tss

# 6. Install Git
apt install git -y

# 7. Clone repository (NEEDS MANUAL INPUT)
echo "📥 Cloning repository..."
echo "MANUAL STEP REQUIRED:"
echo "Run: git clone https://github.com/MinhTrinhh/LA_SE_SEM251.git"
echo "If private repo, use: git clone https://TOKEN@github.com/MinhTrinhh/LA_SE_SEM251.git"

# 8. Verify installation
echo "✅ Installation verification..."
docker --version
docker-compose --version
free -m  # Check memory + swap
df -h    # Check disk space

echo "🎉 VPS setup completed!"
echo "Next steps:"
echo "1. Clone your repository to /opt/hcmut-tss/"
echo "2. Create .env file with your settings"
echo "3. Run docker-compose up"