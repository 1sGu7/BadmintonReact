const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');
const { canCreateAdmin, canModifyAdmin } = require('../middleware/adminAuth');
const { encrypt } = require('../utils/encryption');

const router = express.Router();

// @desc    Register user (public - customer only)
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Tên phải từ 2-50 ký tự'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email không hợp lệ'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('phone')
    .optional()
    .custom((value) => {
      if (value && !/^[0-9]{10,11}$/.test(value)) {
        throw new Error('Số điện thoại phải có 10-11 chữ số');
      }
      return true;
    })
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array() 
      });
    }

    const { name, email, password, phone, address } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Create user with encrypted sensitive data (customer only)
    const user = await User.create({
      name,
      email: email, // Temporarily store plain email for testing
      password,
      phone: phone ? encrypt(phone) : undefined,
      address: address ? {
        ...address,
        street: address.street ? encrypt(address.street) : undefined
      } : undefined,
      role: 'customer' // Force customer role for public registration
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Dữ liệu người dùng không hợp lệ' });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email không hợp lệ'),
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu là bắt buộc')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user by email - try both encrypted and plain text
    let user = await User.findOne({ email: email });
    
    // If not found, try to find by encrypted email
    if (!user) {
      const users = await User.find({});
      for (const u of users) {
        try {
          if (u.email && u.email.includes(':')) {
            const decryptedEmail = decrypt(u.email);
            if (decryptedEmail === email) {
              user = u;
              break;
            }
          }
        } catch (error) {
          console.error('Email decryption failed:', error);
        }
      }
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Tài khoản đã bị khóa' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private (with admin protection)
router.put('/profile', protect, canModifyAdmin, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Tên phải từ 2-50 ký tự'),
  body('phone')
    .optional()
    .custom((value) => {
      if (value && !/^[0-9]{10,11}$/.test(value)) {
        throw new Error('Số điện thoại phải có 10-11 chữ số');
      }
      return true;
    })
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array() 
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Update fields with encryption for sensitive data
    user.name = req.body.name || user.name;
    user.phone = req.body.phone ? encrypt(req.body.phone) : user.phone;
    if (req.body.address) {
      user.address = {
        ...req.body.address,
        street: req.body.address.street ? encrypt(req.body.address.street) : user.address?.street
      };
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address,
      avatar: updatedUser.avatar
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mật khẩu hiện tại là bắt buộc'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Mật khẩu đã được thay đổi thành công' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Create admin account (admin only)
// @route   POST /api/auth/create-admin
// @access  Private (admin only)
router.post('/create-admin', protect, canCreateAdmin, [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Tên phải từ 2-50 ký tự'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email không hợp lệ'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('phone')
    .optional()
    .custom((value) => {
      if (value && !/^[0-9]{10,11}$/.test(value)) {
        throw new Error('Số điện thoại phải có 10-11 chữ số');
      }
      return true;
    })
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array() 
      });
    }

    const { name, email, password, phone, address } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Create admin user with encrypted sensitive data
    const user = await User.create({
      name,
      email: email, // Temporarily store plain email for testing
      password,
      phone: phone ? encrypt(phone) : undefined,
      address: address ? {
        ...address,
        street: address.street ? encrypt(address.street) : undefined
      } : undefined,
      role: 'admin' // Force admin role
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        message: 'Tài khoản admin đã được tạo thành công'
      });
    } else {
      res.status(400).json({ message: 'Dữ liệu người dùng không hợp lệ' });
    }
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router; 