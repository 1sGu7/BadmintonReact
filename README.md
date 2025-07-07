# 🏸 Badminton Web App - Jenkins Pipeline Deployment

Ứng dụng web bán cầu lông với Next.js frontend, Node.js backend, và MongoDB, được triển khai tự động thông qua Jenkins CI/CD pipeline trên AWS EC2.

## 🎯 Tính năng

- **Frontend**: Next.js với TypeScript và Tailwind CSS
- **Backend**: Node.js với Express và MongoDB Atlas
- **Database**: MongoDB Atlas (cloud database)
- **File Storage**: Cloudinary (cloud image storage)
- **Reverse Proxy**: Nginx với caching và security headers
- **CI/CD**: Jenkins pipeline tự động
- **Containerization**: Docker với Docker Compose
- **Infrastructure**: AWS EC2 với Elastic IP

## 🚀 Triển khai nhanh

### Bước 1: Chuẩn bị EC2 Instance

```bash
# Thông số khuyến nghị
- Instance Type: t3.medium (2 vCPU, 4GB RAM)
- OS: Ubuntu 24.04 LTS
- Storage: 20GB GP3
- Security Group: Mở ports 22, 80, 443, 8080
```

### Bước 2: Cài đặt Jenkins

```bash
# Kết nối SSH
ssh -i your-key.pem ubuntu@your-ec2-ip

# Cài đặt Java (required cho Jenkins)
sudo apt update
sudo apt install -y openjdk-17-jdk

# Cài đặt Jenkins
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt update
sudo apt install -y jenkins

# Khởi động Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Lấy initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### Bước 3: Cấu hình Jenkins

1. **Truy cập Jenkins**: `http://your-ec2-ip:8080`
2. **Nhập initial password** từ bước trước
3. **Cài đặt suggested plugins**
4. **Tạo admin user**

### Bước 4: Cài đặt Jenkins Plugins

Vào **Manage Jenkins > Manage Plugins > Available** và cài đặt:

- ✅ Docker Pipeline
- ✅ Docker plugin
- ✅ GitHub Integration
- ✅ Pipeline: GitHub
- ✅ Credentials Binding
- ✅ Environment Injector
- ✅ Parameterized Trigger

### Bước 5: Cấu hình Jenkins Credentials

Vào **Manage Jenkins > Manage Credentials > System > Global credentials > Add Credentials**

#### A. GitHub Credentials
```
Kind: Username with password
Scope: Global
Username: your-github-username
Password: your-github-token
ID: github-credentials
```

#### B. MongoDB Atlas Credentials
```
Kind: Secret text
Scope: Global
Secret: mongodb+srv://username:password@cluster.mongodb.net/database
ID: mongodb-uri
```

#### C. JWT Secret
```
Kind: Secret text
Scope: Global
Secret: your-super-secret-jwt-key-min-32-characters
ID: jwt-secret
```

#### D. Cloudinary Credentials
```
Kind: Username with password
Scope: Global
Username: your-cloudinary-cloud-name
Password: your-cloudinary-api-secret
ID: cloudinary-credentials
```

#### E. Cloudinary API Key
```
Kind: Secret text
Scope: Global
Secret: your-cloudinary-api-key
ID: cloudinary-api-key
```

### Bước 6: Cấu hình Jenkins Environment Variables

Vào **Manage Jenkins > Configure System > Global properties > Environment variables**

Thêm các biến sau:

```bash
# MongoDB Configuration
MONGODB_URI=${MONGODB_URI}
MONGODB_DATABASE=badminton_shop

# JWT Configuration
JWT_SECRET=${JWT_SECRET}

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Bước 7: Tạo Jenkins Pipeline Job

1. **Vào Jenkins Dashboard**
2. **Click "New Item"**
3. **Chọn "Pipeline"**
4. **Đặt tên**: `badminton-web-pipeline`
5. **Trong Pipeline section**:
   - Definition: Pipeline script from SCM
   - SCM: Git
   - Repository URL: `https://github.com/your-username/badminton-web.git`
   - Credentials: `github-credentials`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`

### Bước 8: Cấu hình GitHub Webhook (Optional)

1. **Vào GitHub repository Settings > Webhooks**
2. **Add webhook**:
   - Payload URL: `http://your-ec2-ip:8080/github-webhook/`
   - Content type: `application/json`
   - Events: `Just the push event`
   - Active: ✓

### Bước 9: Chạy Pipeline

1. **Vào Jenkins job** `badminton-web-pipeline`
2. **Click "Build Now"**
3. **Theo dõi build log**

## 🔧 Cấu hình chi tiết

### Environment Variables

Tất cả biến môi trường được quản lý qua Jenkins:

#### MongoDB Atlas
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
MONGODB_DATABASE=badminton_shop
```

#### JWT Authentication
```bash
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
```

#### Cloudinary
```bash
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

#### Application
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Jenkinsfile Pipeline Stages

Pipeline tự động thực hiện các bước sau:

1. **Checkout**: Clone source code từ Git
2. **Environment Setup**: Tạo thư mục và file cấu hình
3. **Install Dependencies**: Cài đặt Docker, Nginx nếu chưa có
4. **Security Scan**: Chạy npm audit
5. **Build & Test**: Build frontend và backend
6. **Docker Build**: Build Docker images
7. **Deploy**: Cấu hình Nginx và chạy containers
8. **Health Check**: Kiểm tra ứng dụng
9. **Cleanup**: Dọn dẹp resources

### Docker Configuration

#### Frontend Dockerfile
- Multi-stage build với Node.js 18
- Standalone output cho production
- Optimized cho Nginx

#### Backend Dockerfile
- Node.js 18 với Express
- Health checks
- Non-root user

#### Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
  
  backend:
    build: ./backend
    ports:
      - "127.0.0.1:5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
      - CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
      - CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
```

### Nginx Configuration

Nginx được cấu hình tự động với:

- **Frontend proxy**: `http://localhost:3000`
- **Backend proxy**: `http://localhost:5000`
- **Static asset caching**
- **Rate limiting**
- **Security headers**
- **Gzip compression**

## 🌐 URLs sau khi deploy

- **Frontend**: `http://your-ec2-ip` (port 80)
- **Backend API**: `http://your-ec2-ip/api`
- **Jenkins**: `http://your-ec2-ip:8080`
- **Health Check**: `http://your-ec2-ip/health`

## 🔒 Security

### Security Headers (Nginx)
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### Rate Limiting
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;
```

### Environment Variables
- Tất cả secrets trong Jenkins Credentials
- Không commit secrets vào Git
- Backup Jenkins configuration

## 📊 Monitoring

### Health Checks
- Backend: `curl http://localhost:5000/api/health`
- Frontend: `curl http://localhost:3000`
- Nginx: `curl http://localhost/health`

### Jenkins Pipeline Logs
- Vào Jenkins job > Build number > Console Output
- Xem logs chi tiết của từng stage

### Docker Logs
```bash
# Frontend logs
docker logs badminton-frontend

# Backend logs
docker logs badminton-backend

# All containers
docker-compose -f /opt/badminton-web/docker-compose.prod.yml logs -f
```

## 🚨 Troubleshooting

### Jenkins Issues
```bash
# Check Jenkins status
sudo systemctl status jenkins

# View Jenkins logs
sudo tail -f /var/log/jenkins/jenkins.log

# Restart Jenkins
sudo systemctl restart jenkins
```

### Docker Issues
```bash
# Check Docker status
sudo systemctl status docker

# Check containers
docker ps -a

# View container logs
docker logs <container-name>

# Restart containers
docker-compose -f /opt/badminton-web/docker-compose.prod.yml restart
```

### Nginx Issues
```bash
# Check Nginx status
sudo systemctl status nginx

# Test Nginx config
sudo nginx -t

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Reload Nginx
sudo systemctl reload nginx
```

### Pipeline Issues
1. **Check Jenkins Credentials**: Đảm bảo tất cả credentials được cấu hình đúng
2. **Check Environment Variables**: Kiểm tra biến môi trường trong Jenkins
3. **Check Git Repository**: Đảm bảo repository URL và credentials đúng
4. **Check Docker**: Đảm bảo Docker được cài đặt và Jenkins có quyền truy cập

## 🔄 Auto-restart Configuration

### Docker Containers
```yaml
# Trong docker-compose.prod.yml
restart: unless-stopped
```

### Nginx Service
```bash
# Enable Nginx auto-start
sudo systemctl enable nginx
```

### Jenkins Service
```bash
# Enable Jenkins auto-start
sudo systemctl enable jenkins
```

## 📚 Tài liệu tham khảo

- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 📞 Hỗ trợ

- **Issues**: Tạo issue trên GitHub
- **Documentation**: Xem các file markdown trong repository
- **Jenkins**: Kiểm tra Jenkins logs và pipeline status

---

**Lưu ý quan trọng**: Đảm bảo thay đổi tất cả passwords và secrets trong production environment!
