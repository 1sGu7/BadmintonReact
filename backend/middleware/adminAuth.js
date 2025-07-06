const { admin } = require('./auth');

// Middleware to check if user can create admin accounts
const canCreateAdmin = (req, res, next) => {
  // Check if the request is trying to create an admin account
  if (req.body.role === 'admin') {
    // Only allow if the current user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Chỉ có quản trị viên mới có quyền tạo tài khoản admin' 
      });
    }
  }
  next();
};

// Middleware to check if user can modify admin accounts
const canModifyAdmin = (req, res, next) => {
  // Check if trying to modify an admin account
  if (req.body.role === 'admin' || req.params.id) {
    // For existing admin accounts, only allow admin users to modify
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Chỉ có quản trị viên mới có quyền sửa đổi tài khoản admin' 
      });
    }
  }
  next();
};

// Middleware to prevent non-admin users from accessing admin routes
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Truy cập bị từ chối, yêu cầu quyền admin' 
    });
  }
  next();
};

module.exports = {
  canCreateAdmin,
  canModifyAdmin,
  requireAdmin
}; 