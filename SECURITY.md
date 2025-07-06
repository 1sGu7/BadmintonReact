# Bảo Mật Hệ Thống Badminton Shop

## Tổng Quan

Tài liệu này mô tả các biện pháp bảo mật đã được triển khai trong hệ thống Badminton Shop để đảm bảo an toàn cho dữ liệu người dùng và hệ thống.

## Các Tính Năng Bảo Mật

### 1. Mã Hóa Dữ Liệu Nhạy Cảm

#### Thông Tin Được Mã Hóa
- **Email**: Được mã hóa bằng AES-256-CBC
- **Số điện thoại**: Được mã hóa bằng AES-256-CBC  
- **Địa chỉ**: Đường phố được mã hóa bằng AES-256-CBC

#### Cách Thức Hoạt Động
```javascript
// Mã hóa khi lưu trữ
const encryptedEmail = encrypt(userEmail);

// Giải mã khi hiển thị
const decryptedEmail = decrypt(encryptedEmail);
```

#### Cấu Hình
Thêm vào file `.env`:
```
ENCRYPTION_KEY=your-secret-encryption-key-32-chars-long
```

### 2. Phân Quyền Người Dùng

#### Hệ Thống Phân Quyền
- **Admin**: Quyền truy cập toàn bộ hệ thống
- **Customer**: Quyền truy cập hạn chế

#### Bảo Vệ Trang
```javascript
// Trang yêu cầu đăng nhập
<ProtectedRoute requireAuth>
  <Component />
</ProtectedRoute>

// Trang yêu cầu quyền admin
<ProtectedRoute requireAuth requireAdmin>
  <AdminComponent />
</ProtectedRoute>
```

#### Middleware Backend
```javascript
// Bảo vệ route
router.get('/admin', protect, admin, controller);

// Kiểm tra quyền tạo admin
router.post('/create-admin', protect, canCreateAdmin, controller);
```

### 3. Quản Lý Session và Token

#### JWT Token
- **Thời hạn**: 30 ngày
- **Bảo mật**: Sử dụng secret key
- **Lưu trữ**: LocalStorage với mã hóa

#### AuthContext
```javascript
// Tự động kiểm tra token khi load trang
useEffect(() => {
  const checkAuth = async () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      // Verify token và lấy thông tin user
    }
  };
  checkAuth();
}, []);
```

### 4. Bảo Vệ API

#### Middleware Bảo Vệ
- **protect**: Kiểm tra token hợp lệ
- **admin**: Kiểm tra quyền admin
- **customer**: Kiểm tra quyền customer

#### Rate Limiting
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100 // giới hạn 100 request
});
```

### 5. Kiểm Tra và Sửa Lỗi Đồng Bộ

#### Script Kiểm Tra Hệ Thống
```bash
# Chạy kiểm tra toàn bộ hệ thống
npm run check-system

# Sửa lỗi đồng bộ dữ liệu
npm run fix-sync
```

#### Các Kiểm Tra
- **Mã hóa dữ liệu**: Kiểm tra email, phone, address đã được mã hóa
- **Tính toàn vẹn dữ liệu**: Validate format email, phone
- **Trạng thái tài khoản**: Kiểm tra active/inactive users
- **Token hợp lệ**: Kiểm tra JWT tokens

## Hướng Dẫn Triển Khai

### 1. Cài Đặt Môi Trường
```bash
# Cài đặt dependencies
npm run install-all

# Cấu hình environment variables
cp env.example .env
# Chỉnh sửa .env với thông tin thực tế
```

### 2. Khởi Tạo Hệ Thống
```bash
# Chạy kiểm tra hệ thống
npm run check-system

# Khởi động development server
npm run dev-full
```

### 3. Tạo Tài Khoản Admin Đầu Tiên
```bash
# Sử dụng MongoDB Compass hoặc mongo shell
# Tạo user admin đầu tiên với role: 'admin'
```

## Bảo Trì và Giám Sát

### 1. Kiểm Tra Định Kỳ
```bash
# Chạy kiểm tra hàng tuần
npm run check-system
```

### 2. Backup Dữ Liệu
- Backup MongoDB định kỳ
- Backup encryption keys
- Backup environment variables

### 3. Monitoring
- Log authentication attempts
- Monitor failed login attempts
- Track API usage patterns

## Xử Lý Sự Cố

### 1. Lỗi Đăng Nhập
- Kiểm tra token trong localStorage
- Verify JWT secret
- Check user status (active/inactive)

### 2. Lỗi Mã Hóa
- Verify ENCRYPTION_KEY
- Check data format
- Run sync check script

### 3. Lỗi Phân Quyền
- Verify user role
- Check middleware configuration
- Review route protection

## Best Practices

### 1. Bảo Mật
- Thay đổi ENCRYPTION_KEY định kỳ
- Sử dụng HTTPS trong production
- Implement 2FA cho admin accounts

### 2. Performance
- Cache user data appropriately
- Optimize database queries
- Monitor memory usage

### 3. Monitoring
- Log security events
- Monitor API performance
- Track user behavior patterns

## Liên Hệ

Nếu gặp vấn đề về bảo mật, vui lòng liên hệ:
- Email: security@badmintonshop.com
- Phone: +84-xxx-xxx-xxx
- Emergency: +84-xxx-xxx-xxx 