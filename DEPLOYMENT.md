# Hướng dẫn Deploy Badminton Shop lên EC2 Ubuntu 24.04 LTS Free Tier

## Yêu cầu hệ thống

- **EC2 Instance**: Ubuntu 24.04 LTS (t2.micro free tier)
- **RAM**: 1GB (tối thiểu)
- **Storage**: 8GB (tối thiểu)
- **Security Groups**: Mở port 22 (SSH), 80 (HTTP), 443 (HTTPS), 8080 (Jenkins)

## Bước 1: Thiết lập EC2 Instance

### 1.1 Tạo EC2 Instance
```bash
# Kết nối SSH vào EC2
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 1.2 Cập nhật hệ thống
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip
```

### 1.3 Cài đặt Docker
```bash
# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Cài đặt Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Khởi động lại để áp dụng group changes
sudo reboot
```

### 1.4 Cài đặt Jenkins
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

# Khởi động Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Lấy initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

## Bước 2: Cấu hình Jenkins

### 2.1 Truy cập Jenkins
- Mở browser: `http://your-ec2-ip:8080`
- Nhập initial admin password
- Cài đặt suggested plugins

### 2.2 Cấu hình Jenkins cho Docker
```bash
# Thêm jenkins user vào docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### 2.3 Tạo Jenkins Pipeline
1. Tạo New Item → Pipeline
2. Name: `badminton-shop-pipeline`
3. Configure → Pipeline → Definition: Pipeline script from SCM
4. SCM: Git
5. Repository URL: `your-github-repo-url`
6. Script Path: `Jenkinsfile`

## Bước 3: Deploy Application

### 3.1 Clone Repository
```bash
cd /home/ubuntu
git clone https://github.com/your-username/badminton-web.git
cd badminton-web
```

### 3.2 Cấu hình Environment Variables
```bash
# Tạo file .env
cp env.example .env

# Chỉnh sửa .env với thông tin thực tế
nano .env
```

### 3.3 Build và Deploy
```bash
# Build và chạy với Docker Compose
docker-compose up -d --build

# Kiểm tra status
docker-compose ps
docker-compose logs -f
```

## Bước 4: Backup và Restore Database

### 4.1 Backup MongoDB
```bash
# Tạo thư mục backup
mkdir -p /home/ubuntu/backup

# Backup toàn bộ database
docker exec badminton_mongodb mongodump --username admin --password badminton123 --authenticationDatabase admin --db badminton_shop --out /backup/$(date +%Y%m%d_%H%M%S)

# Backup với tên file cụ thể
docker exec badminton_mongodb mongodump --username admin --password badminton123 --authenticationDatabase admin --db badminton_shop --out /backup/badminton_backup_$(date +%Y%m%d_%H%M%S)
```

### 4.2 Restore MongoDB
```bash
# Restore từ backup
docker exec -i badminton_mongodb mongorestore --username admin --password badminton123 --authenticationDatabase admin --db badminton_shop /backup/backup_folder_name

# Restore từ file backup cụ thể
docker exec -i badminton_mongodb mongorestore --username admin --password badminton123 --authenticationDatabase admin --db badminton_shop /backup/badminton_backup_20241201_143000
```

### 4.3 Script Backup Tự động
```bash
# Tạo script backup tự động
cat > /home/ubuntu/backup_script.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backup"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="badminton_backup_$DATE"

# Tạo backup
docker exec badminton_mongodb mongodump --username admin --password badminton123 --authenticationDatabase admin --db badminton_shop --out /backup/$BACKUP_NAME

# Nén backup
cd /home/ubuntu/backup
tar -czf $BACKUP_NAME.tar.gz $BACKUP_NAME
rm -rf $BACKUP_NAME

# Xóa backup cũ (giữ lại 7 ngày)
find /home/ubuntu/backup -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_NAME.tar.gz"
EOF

# Cấp quyền thực thi
chmod +x /home/ubuntu/backup_script.sh

# Thêm vào crontab (backup hàng ngày lúc 2:00 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/backup_script.sh") | crontab -
```

## Bước 5: Monitoring và Maintenance

### 5.1 Kiểm tra tài nguyên
```bash
# Kiểm tra RAM và CPU
htop
free -h
df -h

# Kiểm tra Docker containers
docker stats
docker-compose ps
```

### 5.2 Logs
```bash
# Xem logs của tất cả services
docker-compose logs -f

# Xem logs của service cụ thể
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### 5.3 Restart Services
```bash
# Restart tất cả services
docker-compose restart

# Restart service cụ thể
docker-compose restart backend
docker-compose restart frontend
```

## Bước 6: Tối ưu cho EC2 Free Tier

### 6.1 Giới hạn tài nguyên
```bash
# Kiểm tra và điều chỉnh limits trong docker-compose.yml
# Đảm bảo tổng RAM sử dụng < 1GB
# Đảm bảo tổng CPU sử dụng < 1 vCPU
```

### 6.2 Cleanup
```bash
# Xóa unused Docker images
docker image prune -f

# Xóa unused Docker volumes
docker volume prune -f

# Xóa unused Docker networks
docker network prune -f
```

## Bước 7: Troubleshooting

### 7.1 Container không start
```bash
# Kiểm tra logs
docker-compose logs service_name

# Kiểm tra resource usage
docker stats

# Restart container
docker-compose restart service_name
```

### 7.2 Database connection error
```bash
# Kiểm tra MongoDB status
docker exec badminton_mongodb mongosh --username admin --password badminton123 --authenticationDatabase admin

# Kiểm tra network
docker network ls
docker network inspect badminton_network
```

### 7.3 Memory issues
```bash
# Kiểm tra memory usage
free -h
docker stats

# Restart services nếu cần
docker-compose restart
```

## Bước 8: Security

### 8.1 Firewall
```bash
# Cấu hình UFW
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 8080
sudo ufw enable
```

### 8.2 SSL/HTTPS (Optional)
```bash
# Cài đặt Certbot
sudo apt install -y certbot python3-certbot-nginx

# Tạo SSL certificate
sudo certbot --nginx -d your-domain.com
```

## Bước 9: Performance Monitoring

### 9.1 Setup monitoring script
```bash
cat > /home/ubuntu/monitor.sh << 'EOF'
#!/bin/bash
echo "=== System Resources ==="
echo "Memory:"
free -h
echo "Disk:"
df -h
echo "Docker Stats:"
docker stats --no-stream
echo "Container Status:"
docker-compose ps
EOF

chmod +x /home/ubuntu/monitor.sh
```

### 9.2 Cron job cho monitoring
```bash
# Thêm vào crontab (chạy mỗi 5 phút)
(crontab -l 2>/dev/null; echo "*/5 * * * * /home/ubuntu/monitor.sh >> /home/ubuntu/monitor.log") | crontab -
```

## Lưu ý quan trọng cho EC2 Free Tier

1. **RAM**: Giới hạn 1GB - đảm bảo tổng RAM sử dụng < 900MB
2. **CPU**: Giới hạn 1 vCPU - tránh chạy nhiều process cùng lúc
3. **Storage**: Giới hạn 8GB - thường xuyên cleanup
4. **Network**: Giới hạn bandwidth - tối ưu image size
5. **Cost**: Theo dõi usage để tránh vượt free tier

## Liên hệ hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra logs: `docker-compose logs -f`
2. Kiểm tra resources: `htop`, `df -h`
3. Restart services: `docker-compose restart`
4. Rebuild nếu cần: `docker-compose up -d --build` 