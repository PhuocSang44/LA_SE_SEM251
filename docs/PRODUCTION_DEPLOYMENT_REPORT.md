# HCMUT-TSS Production Deployment Report

## Executive Summary

This document provides a comprehensive technical overview of the production deployment architecture for the HCMUT Tutoring Support System (HCMUT-TSS). The system is deployed using a hybrid cloud architecture:

- **Backend Infrastructure**: VPS-based deployment with Docker containerization
- **Frontend Application**: Vercel edge network deployment with GitHub integration
- **Domain & SSL**: Custom domain (10diemse251.online) with Let's Encrypt SSL/TLS certificates
- **Reverse Proxy**: Nginx for HTTPS termination, load balancing, and routing

---

## 1. Production Architecture Overview

### 1.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Internet Users                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   DNS: 10diemse251.online     │
         │   - A Record → 103.20.96.46   │
         │   - CNAME app → Vercel        │
         └───────────────┬───────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌────────────────┐              ┌────────────────┐
│  Frontend SPA  │              │  VPS Backend   │
│  (Vercel CDN)  │              │ 103.20.96.46   │
│                │              │                │
│ • React + TS   │◄─────API─────┤ • Docker Host  │
│ • Vite Build   │   Calls      │ • Ubuntu       │
│ • Global Edge  │              │ • Nginx Proxy  │
└────────────────┘              └────┬───────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
           ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
           │   Nginx     │  │   Backend   │  │  Database   │
           │   :80/443   │  │   Services  │  │   Cluster   │
           │             │  │             │  │             │
           │ • SSL Term  │  │ • TSS       │  │ • MySQL 8.1 │
           │ • Routing   │  │ • SSO       │  │ • Redis 7   │
           │ • Headers   │  │ • Datacore  │  │             │
           └─────────────┘  │ • Library   │  └─────────────┘
                            └─────────────┘
```

### 1.2 Technology Stack

**Frontend (Vercel)**
- Framework: React 18 + TypeScript
- Build Tool: Vite 6
- UI Library: shadcn/ui + Tailwind CSS
- Deployment: Vercel Edge Network
- CDN: Global distribution with edge caching

**Backend (VPS)**
- Runtime: Docker Compose v1.29.2
- Web Server: Nginx Alpine (reverse proxy)
- Application: Spring Boot 3.5.7 (Java 17)
- Database: MySQL 8.1
- Cache: Redis 7-alpine
- SSL: Let's Encrypt (Certbot)

**Infrastructure**
- VPS Provider: Custom VPS (1GB RAM, Ubuntu)
- Domain Registrar: 10diemse251.online
- SSL Certificate: Let's Encrypt (valid until 2026-03-03)
- DNS: Custom nameservers with A/CNAME records

---

## 2. Frontend Deployment (Vercel)

### 2.1 Deployment Configuration

**Domain Setup:**
- Primary: `app.10diemse251.online` (CNAME → cname.vercel-dns.com)
- Legacy: `la-se-sem251.vercel.app` (Vercel default subdomain)

**Build Configuration:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

**Environment Variables:**
```env
VITE_API_BASE_URL=https://10diemse251.online
VITE_SSO_BASE_URL=https://10diemse251.online
VITE_DATACORE_BASE_URL=https://10diemse251.online
VITE_LIBRARY_BASE_URL=https://10diemse251.online
```

### 2.2 CI/CD Pipeline

**GitHub Integration:**
1. **Production Deployments**: Every push to `main` branch triggers automatic build and deployment
2. **Preview Deployments**: Each pull request creates isolated preview environment
3. **Build Process**:
   - Install dependencies via npm
   - Run Vite build with production optimizations
   - Deploy static assets to Vercel Edge Network
   - Invalidate CDN cache for updated assets

**Optimization Features:**
- Code splitting & lazy loading
- Tree-shaking for minimal bundle size
- Automatic image optimization
- Brotli/Gzip compression
- HTTP/2 server push
- Cache-Control headers for static assets

### 2.3 Edge Network Distribution

**Global PoPs (Points of Presence):**
- Assets served from nearest edge location to users
- Latency reduction through geographic distribution
- Automatic failover between edge nodes

**CDN Caching Strategy:**
- JavaScript/CSS: Long-term cache (immutable)
- HTML: No-cache (always fresh)
- Images: Cache with revalidation
- API calls: Proxied to backend (no caching)

### 2.4 Security Headers

```nginx
# Vercel automatically applies:
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
```

---

## 3. Backend Infrastructure (VPS)

### 3.1 VPS Specifications

**Hardware:**
- CPU: 1 vCore
- RAM: 1GB (with 2GB swap)
- Storage: 25GB SSD
- Network: 1Gbps port
- IPv4: 103.20.96.46

**Operating System:**
- Distribution: Ubuntu 20.04/22.04 LTS
- Kernel: Linux 5.x
- Firewall: UFW (Uncomplicated Firewall)

### 3.2 Docker Architecture

**Container Orchestration:**
```yaml
services:
  nginx:           # Reverse proxy & SSL termination
  tss-backend:     # Main Spring Boot application
  sso-mimic:       # OAuth2 Authorization Server
  datacore-mimic:  # Academic data provider
  library-mimic:   # Digital library system
  db:              # MySQL 8.1 database
  redis:           # Session cache & Redis store
```

**Network Configuration:**
```yaml
networks:
  tss-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.18.0.0/16
```

**Volume Mounts:**
```yaml
volumes:
  mysql-data:        # Database persistence
  library-storage:   # Library files
  tss-uploads:       # User-uploaded materials
  ssl-certs:         # Let's Encrypt certificates
```

### 3.3 Port Allocation

| Service | Internal Port | External Port | Protocol |
|---------|--------------|---------------|----------|
| Nginx | 80/443 | 80/443 | HTTP/HTTPS |
| TSS Backend | 10001 | 10001 | HTTP |
| SSO Mimic | 10003 | 10003 | HTTP |
| Datacore Mimic | 10005 | 10005 | HTTP |
| Library Mimic | 10006 | 10006 | HTTP |
| MySQL | 3306 | 3306 | TCP |
| Redis | 6379 | 6379 | TCP |

**Firewall Rules (UFW):**
```bash
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw enable
```

### 3.4 Resource Limits

**Memory Allocation:**
```yaml
tss-backend:
  deploy:
    resources:
      limits:
        memory: 300M
      reservations:
        memory: 200M
        
db:
  deploy:
    resources:
      limits:
        memory: 200M
      reservations:
        memory: 150M
```

**JVM Configuration:**
```bash
# TSS Backend
JAVA_OPTS: -Xmx256m -Xms128m -XX:+UseG1GC -XX:MaxGCPauseMillis=200

# SSO/Datacore/Library
JAVA_OPTS: -Xmx128m -Xms64m -XX:+UseG1GC
```

**MySQL Optimization:**
```sql
--innodb-buffer-pool-size=128M
--max-connections=50
--thread-cache-size=8
```

---

## 4. Nginx Reverse Proxy Configuration

### 4.1 SSL/TLS Configuration

**Certificate Setup:**
```bash
# Let's Encrypt with Certbot
certbot certonly --standalone \
  -d 10diemse251.online \
  -d www.10diemse251.online \
  --agree-tos \
  --email admin@example.com
```

**Certificate Locations:**
```
/etc/letsencrypt/live/10diemse251.online/
├── fullchain.pem      # Certificate + Intermediate CA
├── privkey.pem        # Private key
├── cert.pem           # Certificate only
└── chain.pem          # Intermediate CA only
```

**Nginx SSL Configuration:**
```nginx
ssl_certificate /etc/nginx/ssl/fullchain.pem;
ssl_certificate_key /etc/nginx/ssl/privkey.pem;

ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

### 4.2 HTTP to HTTPS Redirect

```nginx
server {
    listen 80;
    server_name 10diemse251.online www.10diemse251.online;
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}
```

### 4.3 Reverse Proxy Rules

**Backend API Routing:**
```nginx
location /api/ {
    proxy_pass http://tss-backend:10001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

**OAuth2 Flow Routing:**
```nginx
# Client-side OAuth2 endpoints (backend)
location /oauth2/authorization/ {
    proxy_pass http://tss-backend:10001;
    proxy_cookie_path / /;
}

location /login/oauth2/code/ {
    proxy_pass http://tss-backend:10001;
    proxy_cookie_path / /;
}

# SSO Authorization Server endpoints
location /oauth2/authorize {
    proxy_pass http://sso-mimic:10003;
    proxy_cookie_path / /;
}

location /oauth2/token {
    proxy_pass http://sso-mimic:10003;
}

location /.well-known/openid-configuration {
    proxy_pass http://sso-mimic:10003;
}
```

**Authentication Endpoint:**
```nginx
location /auth/me {
    proxy_pass http://tss-backend:10001;
    proxy_set_header X-Requested-With XMLHttpRequest;
}
```

### 4.4 File Upload Configuration

```nginx
http {
    # Allow large file uploads (50MB)
    client_max_body_size 50M;
    client_body_buffer_size 128k;
    
    # Upload timeout
    client_body_timeout 300s;
}
```

### 4.5 Security Headers

```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### 4.6 Rate Limiting

```nginx
http {
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    
    server {
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
        }
    }
}
```

### 4.7 Compression

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript 
           text/xml application/xml application/xml+rss text/javascript;
gzip_comp_level 6;
gzip_min_length 1000;
```

---

## 5. Backend Services Configuration

### 5.1 Spring Boot Application Properties

**Profile: Production (`application-prod.properties`)**

```properties
spring.application.name=HCMUT-TSS-Backend
server.port=10001

# Forward headers support for Nginx proxy
server.forward-headers-strategy=NATIVE
server.tomcat.remoteip.remote-ip-header=x-forwarded-for
server.tomcat.remoteip.protocol-header=x-forwarded-proto

# Database Configuration
spring.datasource.url=jdbc:mysql://db:3306/hcmut-tss-mysql-db-main?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=${MYSQL_ROOT_PASSWORD}
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

# Redis Session Store
spring.data.redis.host=redis
spring.data.redis.port=6379
spring.session.store-type=redis

# OAuth2 Client Configuration
spring.security.oauth2.client.registration.sso-server.client-id=tss-backend
spring.security.oauth2.client.registration.sso-server.client-secret=secret
spring.security.oauth2.client.registration.sso-server.scope=openid,profile,email
spring.security.oauth2.client.registration.sso-server.redirect-uri=https://10diemse251.online/login/oauth2/code/sso-server
spring.security.oauth2.client.provider.sso-server.issuer-uri=https://10diemse251.online

# Session Cookie Configuration (Cross-domain support)
server.servlet.session.cookie.name=SESSION
server.servlet.session.cookie.same-site=none
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.domain=10diemse251.online

# Service URLs
frontend.url=https://app.10diemse251.online
datacore.url=http://datacore-mimic:10005
library.base-url=http://library-mimic:10006

# File Upload Settings
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB
material.file-storage.dir=uploads/materials
```

### 5.2 CORS Configuration

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Value("${frontend.url}")
    private String frontendUrl;
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(frontendUrl)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### 5.3 Security Configuration

```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf
                .ignoringRequestMatchers(
                    "/auth/logout",
                    "/api/classes/**",
                    "/api/course-registrations/**",
                    "/api/feedback/**",
                    "/api/sessions/**",
                    "/api/session-enrollments/**",
                    "/api/courses/*/materials/**",
                    "/api/materials/**",
                    "/api/library/**",
                    "/api/admin/**",
                    "/api/forums/**",
                    "/api/evaluation/**"
                )
            )
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/oauth2/authorization/**").permitAll()
                .requestMatchers("/login/oauth2/code/*").permitAll()
                .requestMatchers("/auth/me").authenticated()
                .requestMatchers("/error").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler(customSuccessHandler())
            )
            .oauth2Client(Customizer.withDefaults());
            
        return http.build();
    }
}
```

### 5.4 Session Management

**Redis Session Configuration:**
```java
@EnableRedisHttpSession(maxInactiveIntervalInSeconds = 3600)
public class RedisSessionConfig {
    @Bean
    public CookieSerializer cookieSerializer() {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setCookieName("SESSION");
        serializer.setSameSite("None");
        serializer.setUseSecureCookie(true);
        serializer.setUseHttpOnlyCookie(true);
        serializer.setCookiePath("/");
        serializer.setDomainName("10diemse251.online");
        return serializer;
    }
}
```

### 5.5 Health Checks

**Spring Boot Actuator:**
```properties
management.endpoints.web.exposure.include=health,info
management.endpoint.health.show-details=always
```

**Docker Health Check:**
```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:10001/actuator/health"]
  interval: 30s
  timeout: 10s
  start_period: 60s
  retries: 3
```

---

## 6. Database Configuration

### 6.1 MySQL Setup

**Docker Configuration:**
```yaml
db:
  image: mysql:8.1
  environment:
    MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
    MYSQL_DATABASE: hcmut-tss-mysql-db-main
  command: >
    --default-authentication-plugin=mysql_native_password
    --innodb-buffer-pool-size=128M
    --max-connections=50
    --thread-cache-size=8
  volumes:
    - mysql-data:/var/lib/mysql
```

**Schema Management:**
- **Migration Tool**: Flyway
- **Migration Scripts**: Located in `src/main/resources/db/migration/`
- **Versioning**: V1__initial_schema.sql, V2__add_materials.sql, etc.

### 6.2 Redis Cache

**Configuration:**
```yaml
redis:
  image: redis:7-alpine
  command: >
    redis-server
    --save ""
    --appendonly no
    --maxmemory 50mb
    --maxmemory-policy allkeys-lru
```

**Use Cases:**
1. Session storage (Spring Session)
2. Caching frequently accessed data
3. Rate limiting counters
4. Temporary data storage

---

## 7. OAuth2 Authentication Flow

### 7.1 SSO Integration

**Authorization Code Flow:**
```
┌─────────┐                                  ┌─────────┐
│ Browser │                                  │ Backend │
└────┬────┘                                  └────┬────┘
     │                                            │
     │ 1. GET /auth/me (unauthenticated)         │
     ├───────────────────────────────────────────>│
     │                                            │
     │ 2. 302 Redirect to /oauth2/authorization/sso-server
     │<───────────────────────────────────────────┤
     │                                            │
     │ 3. GET /oauth2/authorization/sso-server    │
     ├───────────────────────────────────────────>│
     │                                            │
     │ 4. 302 Redirect to SSO login page          │
     │<───────────────────────────────────────────┤
     │                                            │
┌────▼────┐
│   SSO   │
│  Server │
└────┬────┘
     │ 5. User enters credentials
     │
     │ 6. 302 Redirect with authorization code
     ├──────────────────────────────────────────>
     │                                            │
     │ 7. GET /login/oauth2/code/sso-server?code=...
     ├───────────────────────────────────────────>│
     │                                            │
     │                         8. Exchange code for tokens
     │                         ├──────────────────>│
     │                         │                   SSO
     │                         │<──────────────────┤
     │                                            │
     │                         9. Create session (Redis)
     │                                            │
     │ 10. 302 Redirect to frontend with SESSION cookie
     │<───────────────────────────────────────────┤
     │                                            │
     │ 11. GET /auth/me (with SESSION cookie)    │
     ├───────────────────────────────────────────>│
     │                                            │
     │ 12. 200 OK {userId, email, role, ...}     │
     │<───────────────────────────────────────────┤
```

### 7.2 Session Cookie Configuration

**Cookie Attributes:**
```
Set-Cookie: SESSION=<session-id>;
  Domain=10diemse251.online;
  Path=/;
  Secure;
  HttpOnly;
  SameSite=None
```

**Cross-Domain Support:**
- Frontend: `app.10diemse251.online`
- Backend: `10diemse251.online`
- Cookie domain: `10diemse251.online` (without leading dot)
- Browsers automatically apply to subdomains

---

## 8. Deployment Process

### 8.1 Frontend Deployment (Vercel)

**Automated Workflow:**
```bash
# Local development
git add .
git commit -m "Feature: Add new component"
git push origin main

# Vercel automatically:
# 1. Detects push to main branch
# 2. Clones repository
# 3. Installs dependencies (npm install)
# 4. Builds project (npm run build)
# 5. Deploys to production
# 6. Invalidates CDN cache
# 7. Updates DNS (if needed)
```

**Build Output:**
```
✓ Building...
✓ Optimizing assets (minification, tree-shaking)
✓ Generating static files
✓ Uploading to CDN
✓ Deployment complete
Production: https://app.10diemse251.online
```

### 8.2 Backend Deployment (VPS)

**Manual Deployment Process:**

```bash
# 1. SSH into VPS
ssh root@103.20.96.46

# 2. Navigate to project directory
cd /root/LA-SE-251/LA_SE_SEM251

# 3. Pull latest code
git pull origin main

# 4. Stop containers (if needed)
docker-compose -f docker-compose.prod.yaml down

# 5. Rebuild changed services
docker-compose -f docker-compose.prod.yaml build tss-backend

# 6. Start all services
docker-compose -f docker-compose.prod.yaml up -d

# 7. Verify deployment
docker-compose -f docker-compose.prod.yaml ps
docker-compose -f docker-compose.prod.yaml logs -f tss-backend
```

**Common Deployment Scenarios:**

**A. Code Changes Only (Backend):**
```bash
git pull
docker-compose -f docker-compose.prod.yaml up -d --build tss-backend
```

**B. Configuration Changes (Nginx):**
```bash
git pull
docker-compose -f docker-compose.prod.yaml restart nginx
```

**C. Database Schema Changes:**
```bash
git pull
# Flyway migrations run automatically on startup
docker-compose -f docker-compose.prod.yaml restart tss-backend
```

**D. Full System Restart:**
```bash
docker-compose -f docker-compose.prod.yaml down
docker-compose -f docker-compose.prod.yaml up -d
```

**E. Clean Deployment (Remove all data):**
```bash
docker-compose -f docker-compose.prod.yaml down -v
docker-compose -f docker-compose.prod.yaml up -d
```

### 8.3 SSL Certificate Renewal

**Automatic Renewal (Certbot):**
```bash
# Certbot auto-renewal (runs twice daily)
systemctl status certbot.timer

# Manual renewal
certbot renew

# Reload Nginx after renewal
docker-compose -f docker-compose.prod.yaml restart nginx
```

### 8.4 Rollback Procedure

**Frontend Rollback (Vercel):**
1. Go to Vercel dashboard
2. Navigate to Deployments
3. Select previous deployment
4. Click "Promote to Production"

**Backend Rollback (VPS):**
```bash
# Revert to previous commit
git log --oneline
git checkout <previous-commit-hash>

# Rebuild and restart
docker-compose -f docker-compose.prod.yaml up -d --build
```

---

## 9. Monitoring & Logging

### 9.1 Container Logs

**View Real-time Logs:**
```bash
# All services
docker-compose -f docker-compose.prod.yaml logs -f

# Specific service
docker-compose -f docker-compose.prod.yaml logs -f tss-backend
docker-compose -f docker-compose.prod.yaml logs -f nginx

# Last 100 lines
docker-compose -f docker-compose.prod.yaml logs --tail=100 tss-backend
```

### 9.2 System Monitoring

**Container Status:**
```bash
# Check all containers
docker ps -a

# Check resource usage
docker stats

# Check disk usage
df -h
docker system df
```

**Health Checks:**
```bash
# Backend health
curl -i https://10diemse251.online/actuator/health

# SSO health
curl -i https://10diemse251.online/.well-known/openid-configuration

# Nginx status
docker exec nginx nginx -t
```

### 9.3 Database Monitoring

**MySQL Queries:**
```bash
# Connect to MySQL
docker exec -it hcmut-tss-mysql-db mysql -uroot -p

# Check connections
SHOW PROCESSLIST;

# Check slow queries
SHOW VARIABLES LIKE 'slow_query_log%';
```

**Redis Monitoring:**
```bash
# Connect to Redis CLI
docker exec -it hcmut-tss-redis redis-cli

# Check memory usage
INFO memory

# Check connected clients
CLIENT LIST

# Monitor commands
MONITOR
```

---

## 10. Troubleshooting Guide

### 10.1 Common Issues

**Issue 1: Frontend can't reach backend (CORS error)**

**Symptoms:**
```
Access to fetch at 'https://10diemse251.online/api/...' from origin 
'https://app.10diemse251.online' has been blocked by CORS policy
```

**Solution:**
1. Check `CORS_ALLOWED_ORIGINS` in backend
2. Verify `frontend.url` in `application-prod.properties`
3. Restart backend: `docker-compose -f docker-compose.prod.yaml restart tss-backend`

---

**Issue 2: 502 Bad Gateway**

**Symptoms:**
```
nginx | [error] connect() failed (113: Host is unreachable)
```

**Causes:**
- Backend container crashed
- Backend not started yet
- Network issue between Nginx and backend

**Solution:**
```bash
# Check container status
docker ps -a

# Check backend logs
docker-compose -f docker-compose.prod.yaml logs --tail=50 tss-backend

# Restart backend
docker-compose -f docker-compose.prod.yaml restart tss-backend

# Restart Nginx (to refresh DNS cache)
docker-compose -f docker-compose.prod.yaml restart nginx
```

---

**Issue 3: 403 Forbidden (CSRF error)**

**Symptoms:**
```
POST https://10diemse251.online/api/... 403 (Forbidden)
```

**Causes:**
- Endpoint not in CSRF ignore list
- Cookie not being sent

**Solution:**
1. Add endpoint to `SecurityConfig.csrf().ignoringRequestMatchers()`
2. Verify cookie settings (SameSite=None, Secure=true)
3. Rebuild backend

---

**Issue 4: 413 Content Too Large**

**Symptoms:**
```
POST https://10diemse251.online/api/courses/.../materials/upload 413
```

**Solution:**
Add to `nginx.conf`:
```nginx
http {
    client_max_body_size 50M;
}
```
Restart Nginx: `docker-compose -f docker-compose.prod.yaml restart nginx`

---

**Issue 5: Session not persisting (login loop)**

**Symptoms:**
- User logs in but immediately redirected to login again
- `/auth/me` returns 401 after successful login

**Causes:**
- Cookie domain mismatch
- Third-party cookies blocked
- Redis connection issue

**Solution:**
```bash
# Check Redis connection
docker exec -it hcmut-tss-redis redis-cli ping

# Flush Redis sessions
docker exec -it hcmut-tss-redis redis-cli FLUSHALL

# Verify cookie domain
curl -i https://10diemse251.online/auth/me
# Should see: Set-Cookie: SESSION=...; Domain=10diemse251.online
```

---

**Issue 6: File upload fails (500 Internal Server Error)**

**Causes:**
- Upload directory doesn't exist
- Permission denied in Docker container

**Solution:**
```bash
# Check if volume exists
docker volume ls | grep tss-uploads

# Recreate volume with proper permissions
docker-compose -f docker-compose.prod.yaml down
docker volume rm la_se_sem251_tss-uploads
docker-compose -f docker-compose.prod.yaml up -d --build tss-backend
```

---

**Issue 7: Database connection refused**

**Symptoms:**
```
Cannot create PoolableConnectionFactory 
(Communications link failure)
```

**Solution:**
```bash
# Check MySQL container
docker ps | grep mysql

# Check MySQL logs
docker-compose -f docker-compose.prod.yaml logs db

# Wait for healthy status
docker-compose -f docker-compose.prod.yaml ps db
# Should show "healthy" in STATUS column
```

---

### 10.2 Debugging Commands

**Container Debugging:**
```bash
# Enter container shell
docker exec -it hcmut-tss-backend sh

# Check environment variables
docker exec hcmut-tss-backend env

# Check file permissions
docker exec hcmut-tss-backend ls -la /app/uploads

# Check network connectivity
docker exec hcmut-tss-backend ping db
docker exec hcmut-tss-backend wget http://redis:6379
```

**Network Debugging:**
```bash
# Check Docker network
docker network ls
docker network inspect la_se_sem251_tss-network

# Check listening ports
netstat -tulnp | grep LISTEN

# Test SSL certificate
openssl s_client -connect 10diemse251.online:443
```

---

## 11. Security Considerations

### 11.1 SSL/TLS Security

**Certificate Management:**
- Provider: Let's Encrypt (free, automated)
- Renewal: Auto-renewal via Certbot every 60 days
- Protocol: TLS 1.2 and TLS 1.3 only
- Cipher Suite: Modern, secure ciphers only

**Best Practices:**
- HSTS header with 1-year max-age
- Perfect Forward Secrecy (PFS) enabled
- Certificate pinning for mobile apps (if applicable)

### 11.2 Application Security

**CORS Policy:**
- Strict origin checking
- Credentials allowed only for trusted origins
- Pre-flight caching to reduce overhead

**CSRF Protection:**
- Enabled for state-changing operations
- Exceptions only for API endpoints with alternative protection
- Double-submit cookie pattern for SPA

**Session Security:**
- HttpOnly cookies (prevent XSS)
- Secure flag (HTTPS only)
- SameSite=None (cross-domain support)
- Session timeout: 1 hour

**Authentication:**
- OAuth2 Authorization Code flow
- Token rotation for refresh tokens
- Secure token storage (HttpOnly cookies)

### 11.3 Infrastructure Security

**Firewall Configuration:**
```bash
# UFW rules
ufw status verbose

# Only allow necessary ports:
# - 22 (SSH)
# - 80 (HTTP redirect)
# - 443 (HTTPS)
```

**Docker Security:**
- Non-root user in containers
- Read-only filesystem where possible
- Resource limits to prevent DoS
- Private Docker network (bridge mode)

**Database Security:**
- Strong root password
- No external access (internal network only)
- Regular backups
- Encrypted connections (TLS)

### 11.4 Secrets Management

**Environment Variables:**
```bash
# Stored in .env file (not committed to Git)
MYSQL_ROOT_PASSWORD=<strong-password>
CORS_ALLOWED_ORIGINS=https://app.10diemse251.online
```

**Production Secrets:**
- Database credentials via environment variables
- OAuth2 client secrets in application properties
- API keys for external services (if any)

---

## 12. Performance Optimization

### 12.1 Frontend Optimization

**Vite Build Optimizations:**
- Code splitting by route
- Lazy loading for heavy components
- Tree-shaking unused code
- Minification (Terser for JS, cssnano for CSS)

**Vercel Edge Features:**
- Brotli compression
- HTTP/2 multiplexing
- Edge caching with stale-while-revalidate
- Image optimization (automatic WebP conversion)

**Bundle Size:**
```
dist/assets/index-[hash].js     ~200KB (gzipped)
dist/assets/vendor-[hash].js    ~150KB (gzipped)
dist/assets/index-[hash].css    ~20KB (gzipped)
```

### 12.2 Backend Optimization

**Connection Pooling:**
```properties
# HikariCP (default in Spring Boot)
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
```

**Caching Strategy:**
- Redis for session data
- Application-level caching for reference data
- HTTP caching headers for static resources

**JVM Tuning:**
```bash
# G1GC for low-latency
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200

# Heap size
-Xms128m -Xmx256m
```

### 12.3 Database Optimization

**Indexing:**
```sql
-- Frequently queried columns
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_session_class_id ON sessions(class_id);
CREATE INDEX idx_material_course_id ON materials(course_id);
```

**Query Optimization:**
- Use JPA projections for read-only queries
- Batch fetch for N+1 problem
- Connection pooling to reduce overhead

### 12.4 Nginx Optimization

**Worker Configuration:**
```nginx
worker_processes auto;
worker_connections 1024;
```

**Caching:**
```nginx
# Static asset caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

**Gzip Compression:**
```nginx
gzip on;
gzip_comp_level 6;
gzip_min_length 1000;
gzip_types text/plain text/css application/json application/javascript;
```

---

## 13. Backup & Disaster Recovery

### 13.1 Database Backups

**Automated Backup Script:**
```bash
#!/bin/bash
# /root/scripts/backup-mysql.sh

BACKUP_DIR=/backups/mysql
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="hcmut-tss-backup-$DATE.sql.gz"

docker exec hcmut-tss-mysql-db mysqldump \
  -uroot -p${MYSQL_ROOT_PASSWORD} \
  --all-databases \
  --single-transaction \
  --quick \
  --lock-tables=false \
  | gzip > "$BACKUP_DIR/$FILENAME"

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
```

**Cron Schedule:**
```bash
# Run daily at 2 AM
0 2 * * * /root/scripts/backup-mysql.sh
```

### 13.2 Volume Backups

**Docker Volume Backup:**
```bash
# Backup tss-uploads volume
docker run --rm \
  -v la_se_sem251_tss-uploads:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/tss-uploads-$(date +%F).tar.gz /data
```

### 13.3 Restore Procedures

**Restore Database:**
```bash
# Stop backend
docker-compose -f docker-compose.prod.yaml stop tss-backend

# Restore from backup
gunzip < hcmut-tss-backup-20251204.sql.gz | \
docker exec -i hcmut-tss-mysql-db mysql -uroot -p${MYSQL_ROOT_PASSWORD}

# Start backend
docker-compose -f docker-compose.prod.yaml start tss-backend
```

**Restore Volume:**
```bash
docker run --rm \
  -v la_se_sem251_tss-uploads:/data \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/tss-uploads-2025-12-04.tar.gz -C /
```

---

## 14. Scalability Considerations

### 14.1 Horizontal Scaling

**Frontend Scaling:**
- Already scaled via Vercel edge network
- No additional configuration needed
- Auto-scales based on traffic

**Backend Scaling:**
- Add multiple backend instances behind Nginx load balancer
- Share session state via Redis
- Use read replicas for MySQL (future enhancement)

**Load Balancer Configuration:**
```nginx
upstream backend_pool {
    least_conn;
    server tss-backend-1:10001;
    server tss-backend-2:10001;
    server tss-backend-3:10001;
}

server {
    location /api/ {
        proxy_pass http://backend_pool;
    }
}
```

### 14.2 Vertical Scaling

**VPS Upgrade Path:**
- Current: 1GB RAM, 1 vCore
- Recommended: 2GB RAM, 2 vCores (for 100+ concurrent users)
- Upgrade process: Create snapshot → Resize VPS → Restore

**Container Resource Adjustment:**
```yaml
tss-backend:
  deploy:
    resources:
      limits:
        memory: 512M  # Increased from 300M
        cpus: '1.0'   # Allow full CPU core
```

### 14.3 Caching Strategy

**Multi-Level Caching:**
1. **CDN (Vercel)**: Static assets
2. **Nginx**: Reverse proxy caching
3. **Redis**: Session + application data
4. **Spring Boot**: In-memory cache (@Cacheable)

---

## 15. Cost Analysis

### 15.1 Infrastructure Costs

| Component | Provider | Cost | Billing Cycle |
|-----------|----------|------|---------------|
| VPS Hosting | Custom VPS | ~$5-10/month | Monthly |
| Domain Name | 10diemse251.online | 36,000 VND (~$1.50) | Annual |
| SSL Certificate | Let's Encrypt | Free | N/A |
| Frontend Hosting | Vercel | Free (Hobby plan) | N/A |
| DNS | Domain provider | Included | N/A |

**Total Monthly Cost: ~$5-10**
**Total Annual Cost: ~$60-120 + $1.50 (domain)**

### 15.2 Cost Optimization

**Vercel Free Tier Limits:**
- Bandwidth: 100GB/month
- Build executions: Unlimited
- Function executions: 100GB-hrs
- Serverless functions: 100 hours

**VPS Optimization:**
- Docker resource limits to prevent OOM
- Aggressive caching to reduce CPU usage
- Database query optimization
- Log rotation to save disk space

---

## 16. Future Enhancements

### 16.1 Infrastructure Improvements

**High Availability:**
- Multi-region deployment
- Database replication (Master-Slave)
- Auto-failover for backend services
- CDN for user-uploaded files

**Monitoring & Alerting:**
- Grafana + Prometheus for metrics
- ELK Stack for centralized logging
- Uptime monitoring (UptimeRobot)
- Error tracking (Sentry)

### 16.2 Security Enhancements

**Advanced Protection:**
- Web Application Firewall (WAF)
- DDoS protection (Cloudflare)
- API rate limiting per user
- Two-factor authentication (2FA)

### 16.3 Performance Enhancements

**Optimization:**
- GraphQL for efficient data fetching
- WebSocket for real-time notifications
- Server-Side Rendering (SSR) for SEO
- Progressive Web App (PWA) features

---

## 17. Conclusion

The HCMUT-TSS production deployment successfully combines modern cloud infrastructure (Vercel) with traditional VPS hosting to create a scalable, secure, and cost-effective solution. Key achievements include:

✅ **High Availability**: Vercel CDN ensures 99.99% uptime for frontend  
✅ **Security**: End-to-end HTTPS with Let's Encrypt SSL  
✅ **Performance**: Global edge network + optimized backend  
✅ **Scalability**: Horizontal scaling ready via load balancing  
✅ **Cost-Effective**: <$10/month operational cost  
✅ **Developer-Friendly**: Automated CI/CD with GitHub integration  
✅ **Production-Ready**: Comprehensive monitoring and rollback procedures  

The hybrid architecture leverages the strengths of both platforms: Vercel's edge network for static content delivery and VPS for full control over backend services, databases, and custom configurations.

---

## 18. Appendix

### 18.1 Environment Variables Reference

**Frontend (.env.production):**
```env
VITE_API_BASE_URL=https://10diemse251.online
VITE_SSO_BASE_URL=https://10diemse251.online
VITE_DATACORE_BASE_URL=https://10diemse251.online
VITE_LIBRARY_BASE_URL=https://10diemse251.online
```

**Backend (docker-compose.prod.yaml):**
```env
SPRING_PROFILES_ACTIVE=prod
MYSQL_ROOT_PASSWORD=<secret>
CORS_ALLOWED_ORIGINS=https://app.10diemse251.online
SPRING_SECURITY_OAUTH2_AUTHORIZATIONSERVER_ISSUER=https://10diemse251.online
BACKEND_URL=https://10diemse251.online
```

### 18.2 Port Reference

| Port | Service | Protocol | External Access |
|------|---------|----------|-----------------|
| 80 | Nginx (HTTP) | HTTP | Yes |
| 443 | Nginx (HTTPS) | HTTPS | Yes |
| 10001 | TSS Backend | HTTP | Via Nginx |
| 10003 | SSO Mimic | HTTP | Via Nginx |
| 10005 | Datacore Mimic | HTTP | Via Nginx |
| 10006 | Library Mimic | HTTP | Via Nginx |
| 3306 | MySQL | TCP | No (internal) |
| 6379 | Redis | TCP | No (internal) |

### 18.3 Key Files

**Configuration Files:**
- `nginx.conf` - Nginx reverse proxy configuration
- `docker-compose.prod.yaml` - Container orchestration
- `application-prod.properties` - Spring Boot production config
- `.env.production` - Frontend production environment variables

**Deployment Scripts:**
- `deploy-vps-commands.sh` - VPS deployment automation
- `DEPLOYMENT_GUIDE.md` - Step-by-step deployment guide
- `VPS_VERCEL_DEPLOYMENT_GUIDE.md` - Hybrid deployment guide

**Documentation:**
- `README.md` - Project overview
- `SESSION_ACTIVITY_LOGGING_SUMMARY.md` - Deployment session logs
- `PRODUCTION_DEPLOYMENT_REPORT.md` - This document

---

**Document Version:** 1.0  
**Last Updated:** December 6, 2025  
**Deployment Status:** ✅ Production Active  
**System URL:** https://app.10diemse251.online  
**API Endpoint:** https://10diemse251.online/api/  

---
