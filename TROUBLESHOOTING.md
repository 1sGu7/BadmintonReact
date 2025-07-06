# Hướng dẫn sửa lỗi Badminton Shop

## Lỗi thường gặp và cách khắc phục

### 1. Lỗi npm ETARGET - react-star-rating-component

**Lỗi:** `npm error notarget No matching version found for react-star-rating-component@^1.4.2`

**Nguyên nhân:** Package này đã bị deprecated và không còn tồn tại.

**Giải pháp:** Đã thay thế bằng `react-rating` trong package.json

### 2. Lỗi TypeScript - Cannot find module

**Lỗi:** `Cannot find module 'react' or its corresponding type declarations`

**Nguyên nhân:** Thiếu dependencies hoặc TypeScript configuration

**Giải pháp:**
```bash
# Cài đặt lại dependencies
cd frontend
npm install
```

### 3. Lỗi khi chạy npm install

**Giải pháp:**
```bash
# Xóa node_modules và package-lock.json
rm -rf node_modules package-lock.json
npm install

# Hoặc sử dụng yarn
yarn install
```

### 4. Lỗi MongoDB connection

**Lỗi:** `MongoServerSelectionError: connect ECONNREFUSED`

**Giải pháp:**
1. Kiểm tra file `.env` có đúng thông tin MongoDB Atlas
2. Kiểm tra IP whitelist trong MongoDB Atlas
3. Kiểm tra connection string

### 5. Lỗi Cloudinary

**Lỗi:** `CloudinaryError: Invalid signature`

**Giải pháp:**
1. Kiểm tra Cloudinary credentials trong `.env`
2. Đảm bảo API Key, Secret và Cloud Name đúng

### 6. Lỗi CORS

**Lỗi:** `Access to fetch at 'http://localhost:5000' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Giải pháp:** Backend đã được cấu hình CORS, kiểm tra:
1. Backend đang chạy trên port 5000
2. Frontend đang chạy trên port 3000

### 7. Lỗi JWT

**Lỗi:** `JsonWebTokenError: invalid token`

**Giải pháp:**
1. Kiểm tra JWT_SECRET trong `.env`
2. Xóa localStorage và đăng nhập lại

### 8. Lỗi Image upload

**Lỗi:** `MulterError: Unexpected field`

**Giải pháp:**
1. Đảm bảo form data có field name đúng
2. Kiểm tra multer configuration

## Cài đặt từ đầu

### Bước 1: Clone và cài đặt
```bash
git clone <repository-url>
cd badminton-web

# Cài đặt backend
npm install

# Cài đặt frontend
cd frontend
npm install
cd ..
```

### Bước 2: Cấu hình environment
```bash
# Copy file env.example
cp env.example .env

# Cập nhật thông tin trong .env
```

### Bước 3: Chạy ứng dụng
```bash
# Chạy backend
npm run dev

# Chạy frontend (terminal khác)
cd frontend
npm run dev
```

## Script cài đặt tự động

### Docker (Khuyến nghị)
```bash
# Deploy với Docker Compose
docker-compose up -d --build

# Hoặc sử dụng Jenkins pipeline
# Xem hướng dẫn chi tiết trong DEPLOYMENT.md
```

### Manual Installation
```bash
# Cài đặt backend
npm install

# Cài đặt frontend
cd frontend && npm install
```

## Kiểm tra cài đặt

1. **Backend:** http://localhost:5000/api/health
2. **Frontend:** http://localhost:3000
3. **API Documentation:** http://localhost:5000/api-docs

## Tài khoản mẫu

### Admin
- Email: admin@badmintonshop.com
- Password: admin123

### Customer
- Email: customer@badmintonshop.com
- Password: customer123

## Cấu trúc thư mục

```
badminton-web/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── components/
│   ├── contexts/
│   ├── pages/
│   ├── styles/
│   └── package.json
├── uploads/
├── .env
└── README.md
```

## Liên hệ hỗ trợ

Nếu gặp lỗi không có trong danh sách này, vui lòng:
1. Kiểm tra console logs
2. Kiểm tra network tab trong browser
3. Kiểm tra server logs
4. Tạo issue với thông tin chi tiết về lỗi 