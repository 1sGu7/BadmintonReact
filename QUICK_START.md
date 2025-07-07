# 🚀 Hướng dẫn nhanh - Deploy Badminton Web App

## 📋 Tóm tắt

Đây là hướng dẫn nhanh để deploy Badminton Web App lên AWS EC2 với Nginx reverse proxy và Elastic IP.

## 🎯 Mục tiêu

- ✅ Frontend chạy ổn định trên Nginx (port 80)
- ✅ Backend API proxy qua Nginx
- ✅ Elastic IP tự động cập nhật
- ✅ Jenkins CI/CD pipeline
- ✅ Monitoring và troubleshooting

## ⚡ Triển khai nhanh

### Bước 1: Tạo EC2 Instance

```bash
# Thông số khuyến nghị
- Instance Type: t3.medium (2 vCPU, 4GB RAM)
- OS: Ubuntu 24.04 LTS
- Storage: 20GB GP3
- Security Group: Mở ports 22, 80, 443, 8080
```

### Bước 2: Kết nối và setup

```bash
# Kết nối SSH
ssh -i your-key.pem ubuntu@your-ec2-ip

# Chạy setup script
curl -fsSL https://raw.githubusercontent.com/your-username/badminton-web/main/scripts/setup-ec2.sh | bash
```

### Bước 3: Cấu hình Elastic IP

```bash
# Cài đặt AWS CLI
sudo apt install awscli
aws configure

# Cấu hình Elastic IP
/opt/badminton-web/scripts/configure-elastic-ip.sh
```

### Bước 4: Deploy ứng dụng

```bash
# Clone repository
cd /opt/badminton-web
git clone https://github.com/your-username/badminton-web.git .

# Tạo file .env
cp .env.example .env
nano .env

# Khởi động ứng dụng
/opt/badminton-web/scripts/start-app.sh start
```

## 🔧 Cấu hình chi tiết

### Environment Variables (.env)

```bash
# MongoDB
MONGODB_ROOT_USERNAME=admin
MONGODB_ROOT_PASSWORD=your-secure-password
MONGODB_DATABASE=badminton_shop

# Backend
BACKEND_JWT_SECRET=your-super-secret-jwt-key-min-32-characters
BACKEND_CLOUDINARY_CLOUD_NAME=your-cloudinary-name
BACKEND_CLOUDINARY_API_KEY=your-cloudinary-key
BACKEND_CLOUDINARY_API_SECRET=your-cloudinary-secret

# Frontend
FRONTEND_NEXT_PUBLIC_API_URL=http://your-elastic-ip/api
```

### Nginx Configuration

Nginx được cấu hình tự động với:
- Frontend proxy: `http://localhost:3000`
- Backend proxy: `http://localhost:5000`
- Static asset caching
- Rate limiting
- Security headers
- Gzip compression

### Docker Compose

Sử dụng `docker-compose.prod.yml`:
- MongoDB: port 27017 (internal)
- Backend: port 5000 (localhost only)
- Frontend: port 3000 (localhost only)
- Nginx: port 80 (public)

## 🌐 URLs sau khi deploy

- **Frontend**: http://your-elastic-ip
- **Backend API**: http://your-elastic-ip/api
- **Jenkins**: http://your-elastic-ip:8080
- **Health Check**: http://your-elastic-ip/health
- **Nginx Status**: http://your-elastic-ip/nginx_status

## 🔧 Scripts hữu ích

### Khởi động và quản lý

```bash
# Khởi động ứng dụng
/opt/badminton-web/scripts/start-app.sh start

# Kiểm tra trạng thái
/opt/badminton-web/scripts/start-app.sh status

# Restart services
/opt/badminton-web/scripts/start-app.sh restart

# Xem logs
/opt/badminton-web/scripts/start-app.sh logs
```

### Troubleshooting

```bash
# Kiểm tra sức khỏe hệ thống
/opt/badminton-web/scripts/troubleshoot.sh all

# Kiểm tra từng thành phần
/opt/badminton-web/scripts/troubleshoot.sh health
/opt/badminton-web/scripts/troubleshoot.sh docker
/opt/badminton-web/scripts/troubleshoot.sh logs
```

### Monitoring

```bash
# Kiểm tra trạng thái
/opt/badminton-web/scripts/monitor.sh

# Backup dữ liệu
/opt/badminton-web/scripts/backup.sh
```

## 🚨 Troubleshooting nhanh

### Nginx không start
```bash
sudo nginx -t
sudo systemctl status nginx
sudo systemctl restart nginx
```

### Docker containers không start
```bash
docker-compose -f /opt/badminton-web/docker-compose.prod.yml logs
docker system prune -f
/opt/badminton-web/scripts/start-app.sh restart
```

### Elastic IP không hoạt động
```bash
/opt/badminton-web/scripts/configure-elastic-ip.sh
```

### Jenkins không accessible
```bash
sudo systemctl status jenkins
sudo tail -f /var/log/jenkins/jenkins.log
sudo systemctl restart jenkins
```

## 📊 Monitoring

### Health Checks
- Backend: `curl http://localhost:5000/api/health`
- Frontend: `curl http://localhost:3000`
- Nginx: `curl http://localhost/health`

### Logs
- Nginx: `sudo tail -f /var/log/nginx/error.log`
- Docker: `docker-compose -f docker-compose.prod.yml logs -f`
- Jenkins: `sudo tail -f /var/log/jenkins/jenkins.log`

### Performance
- Disk: `df -h`
- Memory: `free -h`
- Docker: `docker system df`

## 🔒 Security

### Security Headers (Nginx)
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Content-Security-Policy: default-src 'self'

### Rate Limiting
- API: 10 requests/second
- General: 30 requests/second

### Environment Variables
- Tất cả secrets trong file `.env`
- Không commit `.env` vào Git
- Backup `.env` định kỳ

## 📚 Tài liệu tham khảo

- [EC2 Deployment Guide](EC2_DEPLOYMENT_GUIDE.md) - Hướng dẫn chi tiết
- [Jenkins Environment Setup](JENKINS_ENV_SETUP.md) - Cấu hình Jenkins
- [Security Guidelines](SECURITY.md) - Hướng dẫn bảo mật
- [Troubleshooting Guide](TROUBLESHOOTING.md) - Khắc phục sự cố

## 🎯 Kết quả mong đợi

Sau khi hoàn thành, bạn sẽ có:

✅ **Frontend** chạy ổn định trên `http://your-elastic-ip`  
✅ **Backend API** accessible qua `http://your-elastic-ip/api`  
✅ **Jenkins CI/CD** tại `http://your-elastic-ip:8080`  
✅ **Elastic IP** tự động cập nhật khi restart  
✅ **Nginx** reverse proxy với caching và security  
✅ **Monitoring** và troubleshooting scripts  
✅ **Backup** và recovery procedures  

---

**Lưu ý quan trọng**: Đảm bảo thay đổi tất cả passwords và secrets trong production environment! 