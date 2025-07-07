# Hướng dẫn Deploy Badminton Web App lên EC2 Ubuntu 24.04 LTS

## Mục lục
1. [Chuẩn bị EC2 Instance](#chuẩn-bị-ec2-instance)
2. [Cài đặt các công cụ cần thiết](#cài-đặt-các-công-cụ-cần-thiết)
3. [Cấu hình Jenkins](#cấu-hình-jenkins)
4. [Cấu hình GitHub Webhook](#cấu-hình-github-webhook)
5. [Thiết lập biến môi trường trong Jenkins](#thiết-lập-biến-môi-trường-trong-jenkins)
6. [Deploy ứng dụng](#deploy-ứng-dụng)
7. [Monitoring và Troubleshooting](#monitoring-và-troubleshooting)

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

### 4. Cài đặt Nginx (Optional)
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. Cài đặt Java (Required cho Jenkins)
```bash
sudo apt install -y openjdk-17-jdk
java -version
```

## Cấu hình Jenkins

### 1. Truy cập Jenkins
- Mở browser và truy cập: `http://your-ec2-ip:8080`
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
   - Payload URL: `http://your-ec2-ip:8080/github-webhook/`
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
FRONTEND_URL=http://your-domain.com
```

#### Frontend Variables
```
NEXT_PUBLIC_API_URL=http://your-domain.com:5000
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
FRONTEND_NEXT_PUBLIC_API_URL=http://your-domain.com:5000
```

#### Optional Variables
```
DOCKER_REGISTRY=your-docker-registry-url
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

### 2. Cấu hình Jenkins Job
1. Vào Jenkins job `badminton-web-pipeline`
2. Configure > Pipeline
3. Script Path: `Jenkinsfile`
4. Lightweight checkout: ✓

### 3. Chạy Pipeline lần đầu
1. Vào job và click **Build Now**
2. Theo dõi build log để đảm bảo không có lỗi

### 4. Kiểm tra ứng dụng
```bash
# Kiểm tra containers
docker ps

# Kiểm tra logs
docker-compose logs -f

# Kiểm tra health
curl http://localhost:5000/api/health
curl http://localhost:3000
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

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

### 4. Troubleshooting Commands
```bash
# Xem logs Jenkins
sudo tail -f /var/log/jenkins/jenkins.log

# Xem logs Docker
docker-compose logs -f

# Restart services
sudo systemctl restart jenkins
docker-compose restart

# Clean Docker
docker system prune -f
docker volume prune -f

# Check disk space
df -h
du -sh /var/lib/docker

# Check memory
free -h
```

### 5. Security Checklist
- [ ] Firewall configured
- [ ] SSH key authentication only
- [ ] Jenkins admin password changed
- [ ] Environment variables secured
- [ ] Docker images scanned
- [ ] Regular backups configured
- [ ] SSL certificate installed (if using domain)

## Tối ưu hóa cho EC2 Free Tier

### 1. Resource Limits
```yaml
# Trong docker-compose.yml
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
- ✅ GitHub integration
- ✅ Environment variables security
- ✅ Monitoring và backup
- ✅ Tối ưu cho EC2 Free Tier

### URLs sau khi deploy:
- **Frontend**: http://your-ec2-ip:3000
- **Backend API**: http://your-ec2-ip:5000
- **Jenkins**: http://your-ec2-ip:8080
- **Nginx** (nếu cấu hình): http://your-ec2-ip

### Lưu ý quan trọng:
1. Thay đổi tất cả passwords và secrets trong production
2. Cấu hình SSL certificate cho domain
3. Thiết lập monitoring và alerting
4. Backup dữ liệu định kỳ
5. Cập nhật security patches thường xuyên 