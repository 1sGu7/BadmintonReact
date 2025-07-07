# Badminton Web App

Ứng dụng web bán hàng cầu lông với Next.js frontend và Node.js backend, được thiết kế để deploy trên EC2 với Jenkins CI/CD pipeline.

## 🚀 Tính năng

### Frontend (Next.js)
- ✅ Giao diện responsive với Tailwind CSS
- ✅ Quản lý state với React Context
- ✅ Authentication và Authorization
- ✅ Shopping cart functionality
- ✅ Product catalog với search và filter
- ✅ Admin dashboard
- ✅ Image upload với Cloudinary

### Backend (Node.js)
- ✅ RESTful API với Express.js
- ✅ MongoDB database
- ✅ JWT authentication
- ✅ File upload với Cloudinary
- ✅ Data encryption
- ✅ Admin middleware
- ✅ Order management

### DevOps & CI/CD
- ✅ Docker containerization
- ✅ Jenkins CI/CD pipeline
- ✅ GitHub integration
- ✅ Environment variables security
- ✅ Automated deployment
- ✅ Health monitoring

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 13
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **HTTP Client**: Axios
- **Icons**: React Icons (Feather Icons)

### Backend
- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **File Upload**: Cloudinary
- **Encryption**: AES-256

### DevOps
- **Containerization**: Docker & Docker Compose
- **CI/CD**: Jenkins
- **Cloud**: AWS EC2
- **Reverse Proxy**: Nginx (Optional)

## 📋 Yêu cầu hệ thống

### Development
- Node.js 18+
- npm 9+
- MongoDB (local hoặc Atlas)
- Git

### Production (EC2)
- Ubuntu 24.04 LTS
- 2GB RAM minimum (4GB recommended)
- 20GB storage
- Docker & Docker Compose
- Jenkins
- Nginx (Optional)

## 🚀 Quick Start

### Development

1. **Clone repository**
```bash
git clone https://github.com/your-username/badminton-web.git
cd badminton-web
```

2. **Cài đặt dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Cấu hình environment variables**
```bash
# Copy env.example
cp env.example .env

# Chỉnh sửa .env với thông tin thực
```

4. **Chạy development servers**
```bash
# Backend (port 5000)
cd backend
npm run dev

# Frontend (port 3000)
cd frontend
npm run dev
```

### Production Deployment

Xem hướng dẫn chi tiết trong:
- [EC2_DEPLOYMENT_GUIDE.md](./EC2_DEPLOYMENT_GUIDE.md) - Hướng dẫn deploy lên EC2
- [JENKINS_ENV_SETUP.md](./JENKINS_ENV_SETUP.md) - Cấu hình Jenkins

### Quick EC2 Setup

```bash
# Kết nối SSH vào EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Chạy setup script
curl -fsSL https://raw.githubusercontent.com/your-username/badminton-web/main/scripts/setup-ec2.sh | bash

# Reboot system
sudo reboot
```

## 📁 Cấu trúc dự án

```
badminton-web/
├── backend/                 # Node.js API
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   └── server.js           # Main server file
├── frontend/               # Next.js app
│   ├── components/         # React components
│   ├── pages/              # Next.js pages
│   ├── contexts/           # React contexts
│   └── styles/             # CSS styles
├── scripts/                # Deployment scripts
├── docker-compose.yml      # Docker services
├── Jenkinsfile            # CI/CD pipeline
└── README.md              # This file
```

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
ENCRYPTION_KEY=your-64-character-hex-encryption-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
FRONTEND_URL=http://your-domain.com
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://your-domain.com:5000
```

## 🐳 Docker

### Development
```bash
# Build và chạy tất cả services
docker-compose up --build

# Chạy background
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down
```

### Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml up --build -d

# Scale services
docker-compose up -d --scale backend=2 --scale frontend=2
```

## 🔄 CI/CD Pipeline

### Jenkins Pipeline Stages
1. **Checkout** - Clone repository
2. **Environment Setup** - Create .env files from Jenkins variables
3. **Install Dependencies** - Install npm packages
4. **Security Scan** - Run npm audit
5. **Build & Test** - Build applications
6. **Docker Build** - Build Docker images
7. **Deploy** - Deploy to production
8. **Health Check** - Verify deployment
9. **Cleanup** - Clean up resources

### GitHub Webhook
- Tự động trigger build khi push code
- Support multiple branches
- Secure credentials management

## 📊 Monitoring

### Health Checks
```bash
# Backend health
curl http://localhost:5000/api/health

# Frontend health
curl http://localhost:3000

# Docker containers
docker ps
```

### Monitoring Scripts
```bash
# System health check
/opt/badminton-web/scripts/monitor.sh

# Create backup
/opt/badminton-web/scripts/backup.sh

# Clean up resources
/opt/badminton-web/scripts/cleanup.sh
```

## 🔒 Security

### Best Practices
- ✅ Environment variables không commit vào Git
- ✅ JWT secrets được mã hóa
- ✅ Data encryption với AES-256
- ✅ Input validation và sanitization
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Secure headers

### Production Checklist
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Regular backups scheduled
- [ ] Security patches updated
- [ ] Monitoring alerts configured
- [ ] Access logs reviewed

## 🐛 Troubleshooting

### Common Issues

#### Docker Issues
```bash
# Clean Docker resources
docker system prune -f

# Check disk space
df -h

# Restart Docker
sudo systemctl restart docker
```

#### Jenkins Issues
```bash
# Check Jenkins logs
sudo tail -f /var/log/jenkins/jenkins.log

# Restart Jenkins
sudo systemctl restart jenkins

# Check Jenkins status
sudo systemctl status jenkins
```

#### Application Issues
```bash
# Check application logs
docker-compose logs -f

# Restart services
docker-compose restart

# Check environment variables
docker-compose exec backend env
```

## 📚 API Documentation

### Authentication
```bash
# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

# Register
POST /api/auth/register
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password"
}
```

### Products
```bash
# Get all products
GET /api/products

# Get product by ID
GET /api/products/:id

# Create product (Admin only)
POST /api/products
```

### Orders
```bash
# Create order
POST /api/orders

# Get user orders
GET /api/orders

# Get order by ID
GET /api/orders/:id
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: [EC2_DEPLOYMENT_GUIDE.md](./EC2_DEPLOYMENT_GUIDE.md)
- **Jenkins Setup**: [JENKINS_ENV_SETUP.md](./JENKINS_ENV_SETUP.md)
- **Issues**: [GitHub Issues](https://github.com/your-username/badminton-web/issues)

## 🎯 Roadmap

- [ ] PWA support
- [ ] Real-time notifications
- [ ] Advanced search filters
- [ ] Payment integration
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Analytics dashboard 