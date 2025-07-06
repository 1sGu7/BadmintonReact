const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên sản phẩm là bắt buộc'],
    trim: true,
    maxlength: [100, 'Tên sản phẩm không được vượt quá 100 ký tự']
  },
  description: {
    type: String,
    required: [true, 'Mô tả sản phẩm là bắt buộc'],
    trim: true,
    maxlength: [1000, 'Mô tả không được vượt quá 1000 ký tự']
  },
  price: {
    type: Number,
    required: [true, 'Giá sản phẩm là bắt buộc'],
    min: [0, 'Giá không được âm']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Giá gốc không được âm']
  },
  stock: {
    type: Number,
    required: [true, 'Số lượng tồn kho là bắt buộc'],
    min: [0, 'Số lượng không được âm'],
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Danh mục sản phẩm là bắt buộc'],
    enum: [
      'Vợt cầu lông',
      'Cầu lông',
      'Giày cầu lông',
      'Túi đựng vợt',
      'Quần áo cầu lông',
      'Phụ kiện'
    ]
  },
  brand: {
    type: String,
    required: [true, 'Thương hiệu là bắt buộc'],
    trim: true
  },
  images: [{
    type: String,
    required: [true, 'Hình ảnh sản phẩm là bắt buộc']
  }],
  mainImage: {
    type: String,
    required: [true, 'Hình ảnh chính là bắt buộc']
  },
  specifications: {
    weight: String,
    material: String,
    size: String,
    color: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'professional']
    }
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: String,
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [String],
  sku: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Index for search
productSchema.index({ 
  name: 'text', 
  description: 'text', 
  brand: 'text',
  category: 'text' 
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema); 