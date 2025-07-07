# Changelog

## [2.0.0] - 2024-12-19

### Added
- ✅ **Jenkins CI/CD Pipeline**: Tích hợp Jenkins cho automated deployment
- ✅ **Environment Variables Security**: Tất cả biến môi trường được quản lý trong Jenkins
- ✅ **Docker Optimization**: Cải thiện Docker images cho production
- ✅ **GitHub Webhook Integration**: Tự động trigger build khi push code
- ✅ **Security Enhancements**: Loại bỏ hardcoded secrets khỏi codebase
- ✅ **Monitoring Scripts**: Health check và backup automation
- ✅ **EC2 Deployment Guide**: Hướng dẫn chi tiết deploy lên EC2 Ubuntu 24.04 LTS
- ✅ **Jenkins Environment Setup**: Hướng dẫn cấu hình biến môi trường trong Jenkins

### Changed
- 🔄 **Jenkinsfile**: Cập nhật pipeline với environment setup stage
- 🔄 **docker-compose.yml**: Sử dụng biến môi trường thay vì hardcode
- 🔄 **.gitignore**: Thêm patterns để loại trừ file nhạy cảm
- 🔄 **env.example**: Loại bỏ thông tin nhạy cảm, chỉ giữ placeholder
- 🔄 **README.md**: Cập nhật với thông tin Jenkins CI/CD

### Security
- 🔒 **Secrets Management**: Tất cả secrets được quản lý trong Jenkins Credentials
- 🔒 **Environment Variables**: Không commit .env files vào Git
- 🔒 **Docker Security**: Non-root user trong containers
- 🔒 **Firewall Configuration**: UFW rules cho production

### DevOps
- 🚀 **Automated Setup**: Script tự động cài đặt tools trên EC2
- 🚀 **Health Monitoring**: Automated health checks
- 🚀 **Backup System**: Automated backup scripts
- 🚀 **Resource Management**: Docker cleanup và optimization

### Documentation
- 📚 **EC2_DEPLOYMENT_GUIDE.md**: Hướng dẫn chi tiết deploy lên EC2
- 📚 **JENKINS_ENV_SETUP.md**: Hướng dẫn cấu hình Jenkins
- 📚 **Updated README.md**: Thông tin CI/CD và deployment
- 📚 **Scripts Documentation**: Monitoring và backup scripts

## [1.0.0] - 2024-12-18

### Added
- ✅ **Backend API**: Node.js Express server với MongoDB
- ✅ **Frontend**: Next.js app với TypeScript
- ✅ **Authentication**: JWT-based auth system
- ✅ **Product Management**: CRUD operations cho products
- ✅ **Shopping Cart**: Cart functionality
- ✅ **Order System**: Order management
- ✅ **Admin Dashboard**: Admin interface
- ✅ **Image Upload**: Cloudinary integration
- ✅ **Docker Support**: Containerization với docker-compose

### Features
- 🎯 **User Authentication**: Register, login, profile management
- 🎯 **Product Catalog**: Browse, search, filter products
- 🎯 **Shopping Cart**: Add, remove, update cart items
- 🎯 **Order Processing**: Create and manage orders
- 🎯 **Admin Panel**: Product and order management
- 🎯 **Responsive Design**: Mobile-friendly interface
- 🎯 **Image Management**: Upload and manage product images

### Tech Stack
- **Backend**: Node.js, Express.js, MongoDB, JWT
- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary
- **Containerization**: Docker & Docker Compose

---

## Migration Guide từ v1.0.0 sang v2.0.0

### 1. Environment Variables
```bash
# V1.0.0: Hardcoded trong env.example
JWT_SECRET=badminton_shop_jwt_secret_key_2024

# V2.0.0: Quản lý trong Jenkins
JWT_SECRET=${jwt-secret}
```

### 2. Deployment Process
```bash
# V1.0.0: Manual deployment
npm install
npm run build
docker-compose up

# V2.0.0: Automated CI/CD
git push origin main
# Jenkins tự động build và deploy
```

### 3. Security Improvements
```bash
# V1.0.0: Secrets trong code
CLOUDINARY_API_SECRET=hRX1IngYwZmMKxmk6hgSwnL66FM

# V2.0.0: Secrets trong Jenkins Credentials
CLOUDINARY_API_SECRET=${cloudinary-secret}
```

### 4. Monitoring
```bash
# V1.0.0: Manual monitoring
docker ps
curl http://localhost:5000/api/health

# V2.0.0: Automated monitoring
/opt/badminton-web/scripts/monitor.sh
# Automated health checks mỗi 5 phút
```

---

## Breaking Changes

### 1. Environment Variables
- Tất cả biến môi trường phải được cấu hình trong Jenkins
- Không còn sử dụng file .env local

### 2. Deployment
- Deployment chỉ thông qua Jenkins pipeline
- Không còn manual deployment

### 3. Security
- Secrets được quản lý trong Jenkins Credentials
- Không commit secrets vào Git

---

## Upgrade Instructions

### 1. Backup Data
```bash
# Backup database
mongodump --out backup_$(date +%Y%m%d)

# Backup application files
tar -czf app_backup_$(date +%Y%m%d).tar.gz /path/to/app
```

### 2. Setup Jenkins
1. Follow [EC2_DEPLOYMENT_GUIDE.md](./EC2_DEPLOYMENT_GUIDE.md)
2. Configure Jenkins environment variables
3. Set up GitHub webhook

### 3. Migrate Secrets
1. Create Jenkins credentials for all secrets
2. Update environment variables in Jenkins
3. Remove hardcoded secrets from codebase

### 4. Deploy
1. Push code to GitHub
2. Jenkins will automatically build and deploy
3. Verify deployment with health checks

---

## Support

- **Documentation**: [EC2_DEPLOYMENT_GUIDE.md](./EC2_DEPLOYMENT_GUIDE.md)
- **Jenkins Setup**: [JENKINS_ENV_SETUP.md](./JENKINS_ENV_SETUP.md)
- **Issues**: GitHub Issues
- **Security**: All secrets managed in Jenkins 