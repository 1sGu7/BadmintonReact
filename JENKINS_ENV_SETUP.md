# Hướng dẫn cấu hình biến môi trường trong Jenkins

## Tổng quan
Hướng dẫn này sẽ giúp bạn cấu hình tất cả các biến môi trường cần thiết trong Jenkins để deploy ứng dụng Badminton Web một cách an toàn và bảo mật.

## Bước 1: Truy cập Jenkins Credentials

1. Đăng nhập vào Jenkins
2. Vào **Manage Jenkins**
3. Chọn **Manage Credentials**
4. Chọn **System**
5. Chọn **Global credentials (unrestricted)**
6. Click **Add Credentials**

## Bước 2: Tạo Credentials cho GitHub

### GitHub Personal Access Token
1. **Kind**: Username with password
2. **Scope**: Global
3. **Username**: `your-github-username`
4. **Password**: `your-github-personal-access-token`
5. **ID**: `github-credentials`
6. **Description**: `GitHub credentials for repository access`

### Cách tạo GitHub Personal Access Token:
1. Vào GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click **Generate new token (classic)**
3. Đặt tên: `Jenkins Badminton Web`
4. Chọn scopes:
   - `repo` (Full control of private repositories)
   - `admin:repo_hook` (Full control of repository hooks)
5. Click **Generate token**
6. Copy token và lưu an toàn

## Bước 3: Tạo Secret Text cho các thông tin nhạy cảm

### 1. JWT Secret
1. **Kind**: Secret text
2. **Scope**: Global
3. **Secret**: `your-super-secret-jwt-key-min-32-characters-long`
4. **ID**: `jwt-secret`
5. **Description**: `JWT secret for authentication`

### 2. Encryption Key
1. **Kind**: Secret text
2. **Scope**: Global
3. **Secret**: `your-64-character-hex-encryption-key-for-aes-256`
4. **ID**: `encryption-key`
5. **Description**: `Encryption key for data security`

### 3. MongoDB Password
1. **Kind**: Secret text
2. **Scope**: Global
3. **Secret**: `your-secure-mongodb-password`
4. **ID**: `mongodb-password`
5. **Description**: `MongoDB root password`

### 4. Cloudinary API Secret
1. **Kind**: Secret text
2. **Scope**: Global
3. **Secret**: `your-cloudinary-api-secret`
4. **ID**: `cloudinary-secret`
5. **Description**: `Cloudinary API secret for image upload`

## Bước 4: Cấu hình Environment Variables

### Truy cập Global Properties
1. Vào **Manage Jenkins**
2. Chọn **Configure System**
3. Cuộn xuống phần **Global properties**
4. Tick vào **Environment variables**
5. Click **Add**

### Thêm các biến môi trường

#### Backend Variables
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://your-mongodb-connection-string
JWT_SECRET=${jwt-secret}
ENCRYPTION_KEY=${encryption-key}
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=${cloudinary-secret}
FRONTEND_URL=http://your-domain.com
```

#### Frontend Variables
```
NEXT_PUBLIC_API_URL=http://your-domain.com:5000
```

#### Docker Compose Variables
```
MONGODB_ROOT_USERNAME=admin
MONGODB_ROOT_PASSWORD=${mongodb-password}
MONGODB_DATABASE=badminton_shop
BACKEND_JWT_SECRET=${jwt-secret}
BACKEND_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
BACKEND_CLOUDINARY_API_KEY=your-cloudinary-api-key
BACKEND_CLOUDINARY_API_SECRET=${cloudinary-secret}
FRONTEND_NEXT_PUBLIC_API_URL=http://your-domain.com:5000
```

#### Optional Variables
```
DOCKER_REGISTRY=your-docker-registry-url
```

## Bước 5: Cấu hình GitHub Integration

### 1. Cấu hình GitHub Server
1. Vào **Manage Jenkins** → **Configure System**
2. Tìm phần **GitHub**
3. Click **Add GitHub Server**
4. Điền thông tin:
   - **Name**: `GitHub`
   - **API URL**: `https://api.github.com`
   - **Credentials**: Chọn `github-credentials` đã tạo
   - **Manage hooks**: ✓

### 2. Test GitHub Connection
1. Click **Test connection**
2. Đảm bảo hiển thị "Credentials verified for user your-username"

## Bước 6: Cấu hình Pipeline Job

### 1. Tạo Pipeline Job
1. Vào **New Item**
2. Chọn **Pipeline**
3. Đặt tên: `badminton-web-pipeline`
4. Click **OK**

### 2. Cấu hình Pipeline
1. **Description**: `Badminton Web Application CI/CD Pipeline`
2. **Pipeline** section:
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: `https://github.com/your-username/badminton-web.git`
   - **Credentials**: Chọn `github-credentials`
   - **Branch Specifier**: `*/main`
   - **Script Path**: `Jenkinsfile`
   - **Lightweight checkout**: ✓

### 3. Cấu hình Build Triggers
1. **GitHub hook trigger for GITScm polling**: ✓
2. **Poll SCM**: Không tick (sử dụng webhook)

## Bước 7: Cấu hình Webhook trong GitHub

### 1. Tạo Webhook
1. Vào GitHub repository → Settings → Webhooks
2. Click **Add webhook**
3. Điền thông tin:
   - **Payload URL**: `http://your-ec2-ip:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Secret**: (để trống)
   - **Events**: Chọn `Just the push event`
   - **Active**: ✓

### 2. Test Webhook
1. Click **Add webhook**
2. Click **Recent Deliveries**
3. Click **Redeliver** để test

## Bước 8: Kiểm tra cấu hình

### 1. Test Pipeline
1. Vào Jenkins job `badminton-web-pipeline`
2. Click **Build Now**
3. Theo dõi build log
4. Đảm bảo không có lỗi

### 2. Test Webhook
1. Push một commit lên GitHub
2. Kiểm tra Jenkins có tự động trigger build không
3. Theo dõi build log

## Bước 9: Monitoring và Troubleshooting

### 1. Kiểm tra Environment Variables
```bash
# Trong Jenkins build log, thêm echo để debug
echo "PORT: $PORT"
echo "NODE_ENV: $NODE_ENV"
echo "MONGODB_URI: $MONGODB_URI"
```

### 2. Kiểm tra Credentials
```bash
# Test Docker login (nếu sử dụng private registry)
docker login -u your-username -p your-password your-registry
```

### 3. Common Issues và Solutions

#### Issue: Environment variables không được inject
**Solution**: 
- Kiểm tra ID của credentials có đúng không
- Restart Jenkins: `sudo systemctl restart jenkins`

#### Issue: GitHub webhook không trigger
**Solution**:
- Kiểm tra firewall: `sudo ufw status`
- Kiểm tra Jenkins logs: `sudo tail -f /var/log/jenkins/jenkins.log`

#### Issue: Docker build fail
**Solution**:
- Kiểm tra Docker daemon: `sudo systemctl status docker`
- Kiểm tra disk space: `df -h`
- Clean Docker: `docker system prune -f`

## Bước 10: Security Best Practices

### 1. Rotate Secrets
- Thay đổi JWT secret mỗi 90 ngày
- Thay đổi MongoDB password mỗi 6 tháng
- Thay đổi GitHub token mỗi 1 năm

### 2. Access Control
- Tạo Jenkins user riêng cho deployment
- Sử dụng role-based access control
- Audit logs thường xuyên

### 3. Backup Credentials
- Export Jenkins credentials định kỳ
- Backup Jenkins configuration
- Lưu trữ secrets an toàn

## Kết luận

Sau khi hoàn thành các bước trên, Jenkins sẽ được cấu hình đầy đủ với:
- ✅ Secure credentials management
- ✅ Environment variables injection
- ✅ GitHub integration
- ✅ Automated CI/CD pipeline
- ✅ Security best practices

### Lưu ý quan trọng:
1. **KHÔNG BAO GIỜ** commit secrets vào Git
2. Sử dụng strong passwords và secrets
3. Rotate credentials định kỳ
4. Monitor Jenkins logs thường xuyên
5. Backup configuration và credentials 