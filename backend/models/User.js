const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { encrypt, decrypt } = require('../utils/encryption');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên người dùng là bắt buộc'],
    trim: true,
    maxlength: [50, 'Tên không được vượt quá 50 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự']
  },
  role: {
    type: String,
    enum: ['admin', 'customer'],
    default: 'customer'
  },
  phone: {
    type: String,
    trim: true,
    // Remove regex validation for encrypted phone numbers
    // match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ']
  },
  address: {
    street: String,
    city: String,
    district: String,
    zipCode: String
  },
  avatar: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: []
  }],
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output and decrypt sensitive data
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  
  // Decrypt sensitive data before sending (only if encrypted)
  if (user.email && user.email.includes(':')) {
    try {
      user.email = decrypt(user.email);
    } catch (error) {
      console.error('Email decryption failed:', error);
    }
  }
  if (user.phone && user.phone.includes(':')) {
    try {
      user.phone = decrypt(user.phone);
    } catch (error) {
      console.error('Phone decryption failed:', error);
    }
  }
  if (user.address && user.address.street && user.address.street.includes(':')) {
    try {
      user.address.street = decrypt(user.address.street);
    } catch (error) {
      console.error('Address decryption failed:', error);
    }
  }
  
  return user;
};

module.exports = mongoose.model('User', userSchema); 