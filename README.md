# Badminton Shop - Hệ thống thương mại điện tử bán linh kiện cầu lông

## 📋 Mô tả dự án

Badminton Shop là một hệ thống thương mại điện tử hoàn chỉnh chuyên bán linh kiện cầu lông, được xây dựng với công nghệ MERN Stack (MongoDB, Express.js, React, Node.js).

## ✨ Tính năng chính

### Backend
- ✅ API RESTful với Express.js
- ✅ Kết nối MongoDB Atlas
- ✅ Xác thực JWT
- ✅ Upload hình ảnh với Cloudinary
- ✅ Quản lý sản phẩm (CRUD)
- ✅ Quản lý giỏ hàng và đơn hàng
- ✅ Phân quyền admin/customer
- ✅ Validation và error handling

### Frontend
- ✅ Giao diện responsive với Tailwind CSS
- ✅ Quản lý state với React Context
- ✅ Tích hợp React Query cho data fetching
- ✅ Trang chủ với hero section và featured products
- ✅ Trang sản phẩm với filter và search
- ✅ Giỏ hàng và checkout
- ✅ Trang admin cho quản lý sản phẩm
- ✅ Authentication và authorization

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Image upload
- **Multer** - File upload
- **Express Validator** - Input validation

### Frontend
- **Next.js** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Query** - Data fetching
- **React Hook Form** - Form handling
- **React Icons** - Icons
- **Framer Motion** - Animations

## 📁 Cấu trúc dự án

```
badminton-web/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   └── upload.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   └── cloudinary.js
│   └── server.js
├── frontend/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   └── Products/
│   │       └── ProductCard.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   ├── pages/
│   │   └── index.tsx
│   ├── styles/
│   │   └── globals.css
│   └── package.json
├── package.json
├── env.example
└── README.md
```

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống
- Node.js (v16 trở lên)
- npm hoặc yarn
- MongoDB Atlas account
- Cloudinary account

### Bước 1: Clone dự án
```bash
git clone <repository-url>
cd badminton-web
```

### Bước 2: Cài đặt dependencies
```bash
# Cài đặt dependencies cho backend
npm install

# Cài đặt dependencies cho frontend
cd frontend
npm install
cd ..
```

### Bước 3: Cấu hình môi trường

Tạo file `.env` trong thư mục gốc dựa trên `env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://shop_user:shop_password@badminton-shop-cluster.wcjjhqv.mongodb.net/?retryWrites=true&w=majority&appName=badminton-shop-cluster

# JWT Secret
JWT_SECRET=badminton_shop_jwt_secret_key_2024

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Bước 4: Cấu hình MongoDB Atlas

1. Đăng ký tài khoản MongoDB Atlas
2. Tạo cluster mới
3. Tạo database user với quyền read/write
4. Lấy connection string và cập nhật vào file `.env`

### Bước 5: Cấu hình Cloudinary

1. Đăng ký tài khoản Cloudinary
2. Lấy Cloud Name, API Key, API Secret
3. Cập nhật vào file `.env`

### Bước 6: Chạy dự án

#### Chạy backend
```bash
# Development mode
npm run dev

# Production mode
npm start
```

#### Chạy frontend
```bash
cd frontend
npm run dev
```

#### Chạy cả backend và frontend
```bash
npm run dev-full
```

## 🌐 Truy cập ứng dụng

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin profile
- `PUT /api/auth/profile` - Cập nhật profile

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm (Admin)
- `PUT /api/products/:id` - Cập nhật sản phẩm (Admin)
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin)

### Cart
- `GET /api/cart` - Lấy giỏ hàng
- `POST /api/cart` - Thêm sản phẩm vào giỏ hàng
- `PUT /api/cart/:itemId` - Cập nhật số lượng
- `DELETE /api/cart/:itemId` - Xóa sản phẩm khỏi giỏ hàng

### Orders
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders` - Lấy danh sách đơn hàng
- `GET /api/orders/:id` - Lấy chi tiết đơn hàng

### Upload
- `POST /api/upload/image` - Upload hình ảnh đơn
- `POST /api/upload/images` - Upload nhiều hình ảnh

## 👥 Tài khoản mẫu

### Admin
- Email: admin@badmintonshop.com
- Password: admin123

### Customer
- Email: customer@badmintonshop.com
- Password: customer123

## 🔧 Tính năng nâng cao

### Backend
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Security headers với Helmet
- ✅ Input validation
- ✅ Error handling middleware
- ✅ Image optimization với Cloudinary
- ✅ Pagination cho products và orders
- ✅ Search và filter sản phẩm
- ✅ Order status management
- ✅ Stock management

### Frontend
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ Toast notifications
- ✅ Form validation
- ✅ Image lazy loading
- ✅ Infinite scroll (có thể thêm)
- ✅ Dark mode (có thể thêm)

## 🚀 Deployment

### Backend (Heroku/Railway)
```bash
# Build và deploy
npm run build
```

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
```

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License

Dự án này được phát hành dưới MIT License.

## 📞 Liên hệ

- Email: info@badmintonshop.com
- Website: https://badmintonshop.com
- GitHub: [repository-url]

## 🙏 Cảm ơn

Cảm ơn bạn đã quan tâm đến dự án Badminton Shop! Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi. 