# Hướng dẫn Deploy Badminton Web App lên EC2 Ubuntu 24.04 LTS với Nginx

## Mục lục
1. [Chuẩn bị EC2 Instance](#chuẩn-bị-ec2-instance)
2. [Cấu hình Elastic IP](#cấu-hình-elastic-ip)
3. [Cài đặt các công cụ cần thiết](#cài-đặt-các-công-cụ-cần-thiết)
4. [Cấu hình Nginx cho Frontend](#cấu-hình-nginx-cho-frontend)
5. [Cấu hình Jenkins](#cấu-hình-jenkins)
6. [Cấu hình GitHub Webhook](#cấu-hình-github-webhook)
7. [Thiết lập biến môi trường trong Jenkins](#thiết-lập-biến-môi-trường-trong-jenkins)
8. [Deploy ứng dụng](#deploy-ứng-dụng)
9. [Cấu hình DNS động (Optional)](#cấu-hình-dns-động-optional)
10. [Monitoring và Troubleshooting](#monitoring-và-troubleshooting)

## Chuẩn bị EC2 Instance

### 1. Tạo EC2 Instance
```bash
# Thông số khuyến nghị cho EC2
- Instance Type: t3.medium (2 vCPU, 4GB RAM)
- OS: Ubuntu 24.04 LTS
- Storage: 20GB GP3
- Security Group: Mở ports 22, 80, 443, 8080, 5000, 3000
```

### 2. Kết nối SSH
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 3. Cập nhật hệ thống
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
```

## Cấu hình Elastic IP

### 1. Tạo Elastic IP
```bash
# Trong AWS Console hoặc AWS CLI
aws ec2 allocate-address --domain vpc
# Ghi lại Allocation ID và Public IP
```

### 2. Gán Elastic IP cho EC2 Instance
```bash
# Thay thế YOUR_INSTANCE_ID và YOUR_ALLOCATION_ID
aws ec2 associate-address --instance-id YOUR_INSTANCE_ID --allocation-id YOUR_ALLOCATION_ID
```

### 3. Cập nhật Security Group
```bash
# Mở port 80 và 443 cho Elastic IP
aws ec2 authorize-security-group-ingress \
    --group-id YOUR_SECURITY_GROUP_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id YOUR_SECURITY_GROUP_ID \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0
```

## Cài đặt các công cụ cần thiết

### 1. Cài đặt Docker
```bash
# Thêm Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Thêm Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Cài đặt Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Thêm user ubuntu vào docker group
sudo usermod -aG docker ubuntu

# Khởi động Docker
sudo systemctl start docker
sudo systemctl enable docker

# Kiểm tra Docker
docker --version
docker-compose --version
```

### 2. Cài đặt Node.js và NPM
```bash
# Cài đặt Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Kiểm tra cài đặt
node --version
npm --version
```

### 3. Cài đặt Jenkins
```bash
# Thêm Jenkins repository
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Cài đặt Jenkins
sudo apt update
sudo apt install -y jenkins

# Thêm jenkins user vào docker group
sudo usermod -aG docker jenkins

# Khởi động Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Lấy initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### 4. Cài đặt Java (Required cho Jenkins)
```bash
sudo apt install -y openjdk-17-jdk
java -version
```

## Cấu hình Nginx cho Frontend

### 1. Cài đặt Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. Tạo cấu hình Nginx cho Badminton Web
Tạo file `/etc/nginx/sites-available/badminton-web`:

```bash
sudo nano /etc/nginx/sites-available/badminton-web
```

Nội dung file:
```nginx
# Cấu hình Nginx cho Badminton Web App
server {
    listen 80;
    server_name _;  # Chấp nhận tất cả domain/IP
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Frontend routes - serve static files from Next.js build
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
        proxy_read_timeout 86400;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            proxy_pass http://localhost:3000;
        }
    }

    # Backend API routes
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
        
        # Rate limiting cho API
        limit_req zone=api burst=10 nodelay;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Nginx status (optional)
    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        deny all;
    }
}

# Rate limiting configuration
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;
```

### 3. Kích hoạt cấu hình Nginx
```bash
# Tạo symbolic link
sudo ln -s /etc/nginx/sites-available/badminton-web /etc/nginx/sites-enabled/

# Xóa cấu hình mặc định
sudo rm /etc/nginx/sites-enabled/default

# Test cấu hình Nginx
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 4. Cấu hình Nginx cho production (Optional)
Tạo file `/etc/nginx/conf.d/gzip.conf`:
```bash
sudo nano /etc/nginx/conf.d/gzip.conf
```

Nội dung:
```nginx
# Gzip Settings
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_proxied any;
gzip_comp_level 6;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/json
    application/javascript
    application/xml+rss
    application/atom+xml
    image/svg+xml;
```

### 5. Cấu hình SSL (Optional - cho domain)
```bash
# Cài đặt Certbot
sudo apt install -y certbot python3-certbot-nginx

# Tạo SSL certificate (thay your-domain.com)
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Thêm dòng: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Cấu hình Jenkins

### 1. Truy cập Jenkins
- Mở browser và truy cập: `http://your-elastic-ip:8080`
- Nhập initial admin password từ bước trước
- Cài đặt suggested plugins

### 2. Cài đặt Jenkins Plugins
Vào **Manage Jenkins > Manage Plugins > Available** và cài đặt:
- Docker Pipeline
- Docker plugin
- GitHub Integration
- Pipeline: GitHub
- Credentials Binding
- Environment Injector
- Parameterized Trigger

### 3. Cấu hình Docker trong Jenkins
```bash
# Restart Jenkins để áp dụng docker group
sudo systemctl restart jenkins

# Kiểm tra Docker trong Jenkins
sudo -u jenkins docker --version
```

### 4. Tạo Jenkins Pipeline Job
1. Vào **New Item**
2. Chọn **Pipeline**
3. Đặt tên: `badminton-web-pipeline`
4. Trong **Pipeline** section:
   - Definition: Pipeline script from SCM
   - SCM: Git
   - Repository URL: `https://github.com/your-username/badminton-web.git`
   - Credentials: Add your GitHub credentials
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`

## Cấu hình GitHub Webhook

### 1. Tạo GitHub Personal Access Token
1. Vào GitHub Settings > Developer settings > Personal access tokens
2. Generate new token với quyền: `repo`, `admin:repo_hook`
3. Copy token

### 2. Cấu hình Webhook trong GitHub Repository
1. Vào repository Settings > Webhooks
2. Add webhook:
   - Payload URL: `http://your-elastic-ip:8080/github-webhook/`
   - Content type: `application/json`
   - Events: `Just the push event`
   - Active: ✓

### 3. Cấu hình Jenkins cho GitHub Webhook
1. Vào **Manage Jenkins > Configure System**
2. Tìm **GitHub** section
3. Add GitHub Server:
   - Name: `GitHub`
   - API URL: `https://api.github.com`
   - Credentials: Add GitHub token

## Thiết lập biến môi trường trong Jenkins

### 1. Tạo Credentials
Vào **Manage Jenkins > Manage Credentials > System > Global credentials > Add Credentials**

#### A. GitHub Credentials
- Kind: Username with password
- Scope: Global
- Username: your-github-username
- Password: your-github-token
- ID: `github-credentials`

#### B. Docker Registry Credentials (nếu cần)
- Kind: Username with password
- Scope: Global
- Username: your-docker-username
- Password: your-docker-password
- ID: `docker-credentials`

### 2. Cấu hình Environment Variables
Vào **Manage Jenkins > Configure System > Global properties > Environment variables**

Thêm các biến sau:

#### Backend Variables
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
ENCRYPTION_KEY=your-64-character-hex-encryption-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
FRONTEND_URL=http://your-elastic-ip
```

#### Frontend Variables
```
NEXT_PUBLIC_API_URL=http://your-elastic-ip/api
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

#### Docker Compose Variables
```
MONGODB_ROOT_USERNAME=admin
MONGODB_ROOT_PASSWORD=your-secure-mongodb-password
MONGODB_DATABASE=badminton_shop
BACKEND_JWT_SECRET=your-super-secret-jwt-key-min-32-characters
BACKEND_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
BACKEND_CLOUDINARY_API_KEY=your-cloudinary-api-key
BACKEND_CLOUDINARY_API_SECRET=your-cloudinary-api-secret
FRONTEND_NEXT_PUBLIC_API_URL=http://your-elastic-ip/api
```

### 3. Tạo Secret Text cho các thông tin nhạy cảm
Vào **Manage Jenkins > Manage Credentials > System > Global credentials > Add Credentials**

Tạo các secret text cho:
- JWT_SECRET
- ENCRYPTION_KEY
- CLOUDINARY_API_SECRET
- MONGODB_ROOT_PASSWORD

## Deploy ứng dụng

### 1. Clone Repository
```bash
# Tạo thư mục cho project
sudo mkdir -p /opt/badminton-web
sudo chown jenkins:jenkins /opt/badminton-web

# Clone repository
sudo -u jenkins git clone https://github.com/your-username/badminton-web.git /opt/badminton-web
```

### 2. Cập nhật cấu hình Frontend
Tạo file `/opt/badminton-web/frontend/next.config.js` mới:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Tối ưu cho production
  images: {
    domains: ['res.cloudinary.com', 'localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/:path*`,
      },
    ];
  },
  // Tối ưu cho Nginx
  trailingSlash: false,
  poweredByHeader: false,
};

module.exports = nextConfig;
```

### 3. Cập nhật Docker Compose
Tạo file `/opt/badminton-web/docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  # MongoDB Database
  mongodb:
    image: mongo:6.0
    container_name: badminton_mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGODB_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGODB_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: ${MONGODB_DATABASE}
    volumes:
      - mongodb_data:/data/db
      - ./backup:/backup
    networks:
      - badminton_network
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: badminton_backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://${MONGODB_ROOT_USERNAME}:${MONGODB_ROOT_PASSWORD}@mongodb:27017/${MONGODB_DATABASE}?authSource=admin
      JWT_SECRET: ${BACKEND_JWT_SECRET}
      CLOUDINARY_CLOUD_NAME: ${BACKEND_CLOUDINARY_CLOUD_NAME}
      CLOUDINARY_API_KEY: ${BACKEND_CLOUDINARY_API_KEY}
      CLOUDINARY_API_SECRET: ${BACKEND_CLOUDINARY_API_SECRET}
      PORT: 5000
    ports:
      - "127.0.0.1:5000:5000"  # Chỉ bind localhost
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - badminton_network
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Frontend Next.js
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: badminton_frontend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: ${FRONTEND_NEXT_PUBLIC_API_URL}
      NEXT_TELEMETRY_DISABLED: 1
    ports:
      - "127.0.0.1:3000:3000"  # Chỉ bind localhost
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - badminton_network
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.75'
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

volumes:
  mongodb_data:
    driver: local

networks:
  badminton_network:
    driver: bridge
```

### 4. Cấu hình Jenkins Job
1. Vào Jenkins job `badminton-web-pipeline`
2. Configure > Pipeline
3. Script Path: `Jenkinsfile`
4. Lightweight checkout: ✓

### 5. Chạy Pipeline lần đầu
1. Vào job và click **Build Now**
2. Theo dõi build log để đảm bảo không có lỗi

### 6. Kiểm tra ứng dụng
```bash
# Kiểm tra containers
docker ps

# Kiểm tra logs
docker-compose -f docker-compose.prod.yml logs -f

# Kiểm tra health
curl http://localhost:5000/api/health
curl http://localhost:3000

# Kiểm tra Nginx
curl http://your-elastic-ip
```

## Cấu hình DNS động (Optional)

### 1. Sử dụng No-IP hoặc DuckDNS
```bash
# Cài đặt ddclient
sudo apt install -y ddclient

# Cấu hình ddclient
sudo nano /etc/ddclient.conf
```

Nội dung file ddclient.conf:
```
# Cấu hình cho No-IP
protocol=noip
use=web
server=dynupdate.no-ip.com
login=your-username
password=your-password
your-domain.no-ip.org

# Hoặc cho DuckDNS
protocol=duckdns
use=web
server=www.duckdns.org
login=your-token
your-domain.duckdns.org
```

### 2. Cấu hình ddclient service
```bash
# Cấu hình ddclient
sudo ddclient -daemon=300 -syslog

# Test cấu hình
sudo ddclient -force

# Tạo systemd service
sudo nano /etc/systemd/system/ddclient.service
```

Nội dung service:
```ini
[Unit]
Description=DDClient Dynamic DNS Client
After=network.target

[Service]
Type=forking
ExecStart=/usr/sbin/ddclient -daemon=300 -syslog
Restart=always

[Install]
WantedBy=multi-user.target
```

### 3. Kích hoạt service
```bash
sudo systemctl enable ddclient
sudo systemctl start ddclient
sudo systemctl status ddclient
```

## Monitoring và Troubleshooting

### 1. Monitoring Scripts
Tạo file `/opt/badminton-web/scripts/monitor.sh`:
```bash
#!/bin/bash

# Health check script
echo "=== Health Check $(date) ==="

# Check Docker containers
echo "Docker containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check disk usage
echo "Disk usage:"
df -h

# Check memory usage
echo "Memory usage:"
free -h

# Check application health
echo "Application health:"
curl -f http://localhost:5000/api/health && echo "Backend: OK" || echo "Backend: FAILED"
curl -f http://localhost:3000 && echo "Frontend: OK" || echo "Frontend: FAILED"
curl -f http://localhost && echo "Nginx: OK" || echo "Nginx: FAILED"

# Check Nginx status
echo "Nginx status:"
sudo systemctl status nginx --no-pager -l

# Check Elastic IP
echo "Current IP:"
curl -s http://checkip.amazonaws.com/
```

### 2. Log Rotation
Tạo file `/etc/logrotate.d/badminton-web`:
```
/opt/badminton-web/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 jenkins jenkins
}

/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 www-data adm
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
```

### 3. Backup Script
Tạo file `/opt/badminton-web/scripts/backup.sh`:
```bash
#!/bin/bash

BACKUP_DIR="/opt/backups/badminton-web"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup MongoDB
docker exec badminton_mongodb mongodump --out /backup/$DATE

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /opt/badminton-web

# Backup Nginx config
tar -czf $BACKUP_DIR/nginx_$DATE.tar.gz /etc/nginx

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

### 4. Troubleshooting Commands
```bash
# Xem logs Jenkins
sudo tail -f /var/log/jenkins/jenkins.log

# Xem logs Docker
docker-compose -f docker-compose.prod.yml logs -f

# Xem logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Restart services
sudo systemctl restart jenkins
sudo systemctl restart nginx
docker-compose -f docker-compose.prod.yml restart

# Clean Docker
docker system prune -f
docker volume prune -f

# Check disk space
df -h
du -sh /var/lib/docker

# Check memory
free -h

# Test Nginx config
sudo nginx -t

# Check ports
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :5000
```

### 5. Security Checklist
- [ ] Firewall configured
- [ ] SSH key authentication only
- [ ] Jenkins admin password changed
- [ ] Environment variables secured
- [ ] Docker images scanned
- [ ] Regular backups configured
- [ ] SSL certificate installed (if using domain)
- [ ] Nginx security headers configured
- [ ] Rate limiting enabled
- [ ] Elastic IP configured

## Tối ưu hóa cho EC2 Free Tier

### 1. Resource Limits
```yaml
# Trong docker-compose.prod.yml
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
```

### 2. Auto-scaling (Optional)
```bash
# Tạo script monitor resource
#!/bin/bash
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.2f", $3/$2 * 100.0)}')
if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
    echo "High memory usage: $MEMORY_USAGE%"
    docker system prune -f
fi
```

## Kết luận

Sau khi hoàn thành các bước trên, ứng dụng Badminton Web sẽ được deploy thành công trên EC2 với:
- ✅ Jenkins CI/CD pipeline
- ✅ Docker containerization
- ✅ Nginx reverse proxy
- ✅ Elastic IP configuration
- ✅ GitHub integration
- ✅ Environment variables security
- ✅ Monitoring và backup
- ✅ Tối ưu cho EC2 Free Tier

### URLs sau khi deploy:
- **Frontend (via Nginx)**: http://your-elastic-ip
- **Backend API**: http://your-elastic-ip/api
- **Jenkins**: http://your-elastic-ip:8080
- **Health Check**: http://your-elastic-ip/health

### Lưu ý quan trọng:
1. Thay đổi tất cả passwords và secrets trong production
2. Cấu hình SSL certificate cho domain
3. Thiết lập monitoring và alerting
4. Backup dữ liệu định kỳ
5. Cập nhật security patches thường xuyên
6. Sử dụng Elastic IP để tránh thay đổi IP khi restart
7. Cấu hình DNS động nếu cần 