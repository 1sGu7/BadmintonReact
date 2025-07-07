# 🚀 Hướng dẫn cài đặt và cấu hình Jenkins

## 📋 Tổng quan

Hướng dẫn chi tiết cách cài đặt Jenkins trên EC2 và cấu hình pipeline để tự động deploy Badminton Web App.

## 🎯 Mục tiêu

- ✅ Cài đặt Jenkins trên EC2
- ✅ Cấu hình Jenkins Credentials cho MongoDB Atlas và Cloudinary
- ✅ Tạo Jenkins pipeline job
- ✅ Cấu hình GitHub webhook (optional)
- ✅ Chạy pipeline và deploy ứng dụng

## 🛠️ Bước 1: Cài đặt Jenkins

### 1.1 Chuẩn bị EC2 Instance

```bash
# Kết nối SSH
ssh -i your-key.pem ubuntu@your-ec2-ip

# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y
```

### 1.2 Cài đặt Java (Required cho Jenkins)

```bash
# Cài đặt OpenJDK 17
sudo apt install -y openjdk-17-jdk

# Kiểm tra cài đặt
java -version
```

### 1.3 Cài đặt Jenkins

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

# Kiểm tra trạng thái
sudo systemctl status jenkins
```

### 1.4 Lấy Initial Admin Password

```bash
# Lấy initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### 1.5 Truy cập Jenkins

1. **Mở browser** và truy cập: `http://your-ec2-ip:8080`
2. **Nhập initial password** từ bước trước
3. **Cài đặt suggested plugins**
4. **Tạo admin user**

## 🔧 Bước 2: Cài đặt Jenkins Plugins

### 2.1 Cài đặt Required Plugins

Vào **Manage Jenkins > Manage Plugins > Available** và cài đặt:

#### Core Plugins
- ✅ **Docker Pipeline** - Docker integration
- ✅ **Docker plugin** - Docker support
- ✅ **GitHub Integration** - GitHub integration
- ✅ **Pipeline: GitHub** - GitHub pipeline support

#### Credentials Plugins
- ✅ **Credentials Binding** - Bind credentials to variables
- ✅ **Environment Injector** - Inject environment variables
- ✅ **Parameterized Trigger** - Parameterized builds

#### Additional Plugins
- ✅ **Pipeline Utility Steps** - Utility steps for pipelines
- ✅ **Workspace Cleanup** - Clean workspace after build
- ✅ **Timestamper** - Add timestamps to console output

### 2.2 Restart Jenkins

```bash
# Restart Jenkins để áp dụng plugins
sudo systemctl restart jenkins

# Kiểm tra trạng thái
sudo systemctl status jenkins
```

## 🔐 Bước 3: Cấu hình Jenkins Credentials

### 3.1 Tạo GitHub Credentials

1. **Vào Manage Jenkins > Manage Credentials**
2. **Click "System" > "Global credentials" > "Add Credentials"**
3. **Cấu hình**:
   ```
   Kind: Username with password
   Scope: Global
   Username: your-github-username
   Password: your-github-personal-access-token
   ID: github-credentials
   Description: GitHub credentials for repository access
   ```

### 3.2 Tạo MongoDB Atlas Credentials

1. **Add Credentials**
2. **Cấu hình**:
   ```
   Kind: Secret text
   Scope: Global
   Secret: mongodb+srv://username:password@cluster.mongodb.net/database
   ID: mongodb-uri
   Description: MongoDB Atlas connection string
   ```

### 3.3 Tạo JWT Secret

1. **Add Credentials**
2. **Cấu hình**:
   ```
   Kind: Secret text
   Scope: Global
   Secret: your-super-secret-jwt-key-min-32-characters
   ID: jwt-secret
   Description: JWT secret for authentication
   ```

### 3.4 Tạo Cloudinary Credentials

1. **Add Credentials**
2. **Cấu hình**:
   ```
   Kind: Username with password
   Scope: Global
   Username: your-cloudinary-cloud-name
   Password: your-cloudinary-api-secret
   ID: cloudinary-credentials
   Description: Cloudinary credentials
   ```

### 3.5 Tạo Cloudinary API Key

1. **Add Credentials**
2. **Cấu hình**:
   ```
   Kind: Secret text
   Scope: Global
   Secret: your-cloudinary-api-key
   ID: cloudinary-api-key
   Description: Cloudinary API key
   ```

## 🌍 Bước 4: Cấu hình Jenkins Environment Variables

### 4.1 Thêm Global Environment Variables

1. **Vào Manage Jenkins > Configure System**
2. **Tìm section "Global properties"**
3. **Check "Environment variables"**
4. **Thêm các biến sau**:

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

### 4.2 Lưu cấu hình

Click **"Save"** để lưu cấu hình.

## 🚀 Bước 5: Tạo Jenkins Pipeline Job

### 5.1 Tạo Pipeline Job

1. **Vào Jenkins Dashboard**
2. **Click "New Item"**
3. **Đặt tên**: `badminton-web-pipeline`
4. **Chọn "Pipeline"**
5. **Click "OK"**

### 5.2 Cấu hình Pipeline

#### General Settings
- **Description**: `Badminton Web App CI/CD Pipeline`
- **Discard old builds**: ✓
  - Keep only the last 10 builds

#### Build Triggers
- **Poll SCM**: `H/5 * * * *` (poll every 5 minutes)
- Hoặc **GitHub hook trigger for GITScm polling** (nếu dùng webhook)

#### Pipeline Configuration
- **Definition**: Pipeline script from SCM
- **SCM**: Git
- **Repository URL**: `https://github.com/your-username/badminton-web.git`
- **Credentials**: `github-credentials`
- **Branch Specifier**: `*/main`
- **Script Path**: `Jenkinsfile`

#### Advanced Settings
- **Lightweight checkout**: ✓
- **Changelog to branch**: ✓

### 5.3 Lưu Pipeline

Click **"Save"** để lưu pipeline configuration.

## 🔗 Bước 6: Cấu hình GitHub Webhook (Optional)

### 6.1 Tạo GitHub Personal Access Token

1. **Vào GitHub Settings > Developer settings > Personal access tokens**
2. **Click "Generate new token (classic)"**
3. **Chọn scopes**:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `admin:repo_hook` (Full control of repository hooks)
4. **Generate token** và copy

### 6.2 Cấu hình Webhook

1. **Vào GitHub repository Settings > Webhooks**
2. **Click "Add webhook"**
3. **Cấu hình**:
   - **Payload URL**: `http://your-ec2-ip:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Secret**: (để trống hoặc tạo secret)
   - **Events**: `Just the push event`
   - **Active**: ✓

### 6.3 Test Webhook

1. **Click "Add webhook"**
2. **Test webhook** bằng cách push code
3. **Kiểm tra webhook delivery** trong GitHub

## 🏃‍♂️ Bước 7: Chạy Pipeline

### 7.1 Chạy Pipeline lần đầu

1. **Vào Jenkins job** `badminton-web-pipeline`
2. **Click "Build Now"**
3. **Theo dõi build log**

### 7.2 Kiểm tra Build Log

1. **Click vào build number** (ví dụ: #1)
2. **Click "Console Output"**
3. **Theo dõi từng stage**:
   - ✅ Checkout
   - ✅ Environment Setup
   - ✅ Install Dependencies
   - ✅ Security Scan
   - ✅ Build & Test
   - ✅ Docker Build
   - ✅ Deploy
   - ✅ Health Check
   - ✅ Cleanup

### 7.3 Kiểm tra kết quả

Sau khi pipeline thành công:

```bash
# Kiểm tra containers
docker ps

# Kiểm tra ứng dụng
curl http://localhost
curl http://localhost/health

# Kiểm tra logs
docker-compose -f /opt/badminton-web/docker-compose.prod.yml logs -f
```

## 🔍 Bước 8: Troubleshooting

### 8.1 Jenkins Issues

```bash
# Kiểm tra Jenkins status
sudo systemctl status jenkins

# Xem Jenkins logs
sudo tail -f /var/log/jenkins/jenkins.log

# Restart Jenkins
sudo systemctl restart jenkins
```

### 8.2 Docker Issues

```bash
# Kiểm tra Docker status
sudo systemctl status docker

# Kiểm tra Docker permissions
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# Kiểm tra containers
docker ps -a
```

### 8.3 Pipeline Issues

#### Credentials Issues
1. **Kiểm tra Jenkins Credentials**: Manage Jenkins > Manage Credentials
2. **Verify credential IDs** trong Jenkinsfile
3. **Test credentials** bằng cách tạo test job

#### Environment Variables Issues
1. **Kiểm tra Global Environment Variables**: Manage Jenkins > Configure System
2. **Verify variable names** trong Jenkinsfile
3. **Test variables** trong pipeline script

#### Git Issues
1. **Kiểm tra repository URL**
2. **Verify GitHub credentials**
3. **Test Git access** từ Jenkins server

### 8.4 Common Error Messages

#### "Permission denied"
```bash
# Fix Docker permissions
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

#### "Docker not found"
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

#### "Nginx configuration failed"
```bash
# Test Nginx config
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx
```

## 📊 Bước 9: Monitoring và Maintenance

### 9.1 Jenkins Monitoring

```bash
# Check Jenkins disk usage
df -h /var/lib/jenkins

# Check Jenkins memory usage
free -h

# Check Jenkins logs
sudo tail -f /var/log/jenkins/jenkins.log
```

### 9.2 Application Monitoring

```bash
# Check application health
curl http://localhost/health

# Check Docker containers
docker ps

# Check application logs
docker-compose -f /opt/badminton-web/docker-compose.prod.yml logs -f
```

### 9.3 Backup Jenkins Configuration

```bash
# Backup Jenkins home directory
sudo tar -czf jenkins-backup-$(date +%Y%m%d).tar.gz /var/lib/jenkins

# Backup Jenkins configuration
sudo cp /var/lib/jenkins/config.xml jenkins-config-backup.xml
```

## 🎯 Kết quả mong đợi

Sau khi hoàn thành tất cả các bước, bạn sẽ có:

✅ **Jenkins** chạy trên port 8080  
✅ **Pipeline job** tự động build và deploy  
✅ **Docker containers** chạy ứng dụng  
✅ **Nginx** serve frontend trên port 80  
✅ **MongoDB Atlas** connection hoạt động  
✅ **Cloudinary** integration hoạt động  
✅ **GitHub webhook** trigger pipeline tự động  
✅ **Health checks** và monitoring  

## 📚 Tài liệu tham khảo

- [Jenkins Installation Guide](https://www.jenkins.io/doc/book/installing/)
- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Jenkins Credentials Documentation](https://www.jenkins.io/doc/book/using/using-credentials/)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

**Lưu ý quan trọng**: Đảm bảo thay đổi tất cả passwords và secrets trong production environment! 