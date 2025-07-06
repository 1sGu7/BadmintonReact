const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Token không hợp lệ' });
      }

      if (!req.user.isActive) {
        return res.status(401).json({ message: 'Tài khoản đã bị khóa' });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' });
  }
};

// Middleware to check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Truy cập bị từ chối, yêu cầu quyền admin' });
  }
};

// Middleware to check if user is customer
const customer = (req, res, next) => {
  if (req.user && req.user.role === 'customer') {
    next();
  } else {
    return res.status(403).json({ message: 'Truy cập bị từ chối, yêu cầu quyền khách hàng' });
  }
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = { protect, admin, customer, generateToken }; 