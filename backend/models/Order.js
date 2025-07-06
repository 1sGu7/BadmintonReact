const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Số lượng phải ít nhất là 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Giá không được âm']
  },
  image: {
    type: String,
    required: true
  },
  selectedOptions: {
    size: String,
    color: String,
    weight: String
  }
});

const shippingAddressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    zipCode: String
  },
  note: String
});

const paymentResultSchema = new mongoose.Schema({
  id: String,
  status: String,
  update_time: String,
  email_address: String
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [orderItemSchema],
  shippingAddress: shippingAddressSchema,
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cod', 'bank_transfer', 'momo', 'vnpay']
  },
  paymentResult: paymentResultSchema,
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: Date,
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: Date,
  trackingNumber: String,
  estimatedDelivery: Date,
  cancelReason: String,
  adminNote: String
}, {
  timestamps: true
});

// Calculate totals before saving
orderSchema.pre('save', function(next) {
  this.itemsPrice = this.orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  this.taxPrice = this.itemsPrice * 0.1; // 10% tax
  this.shippingPrice = this.itemsPrice > 500000 ? 0 : 30000; // Free shipping over 500k
  this.totalPrice = this.itemsPrice + this.taxPrice + this.shippingPrice;
  next();
});

// Method to update order status
orderSchema.methods.updateStatus = function(newStatus, note = '') {
  this.status = newStatus;
  
  if (newStatus === 'delivered') {
    this.isDelivered = true;
    this.deliveredAt = new Date();
  } else if (newStatus === 'cancelled') {
    this.cancelReason = note;
  }
  
  return this.save();
};

// Method to mark as paid
orderSchema.methods.markAsPaid = function(paymentResult) {
  this.isPaid = true;
  this.paidAt = new Date();
  this.paymentResult = paymentResult;
  return this.save();
};

// Method to get order summary
orderSchema.methods.getSummary = function() {
  return {
    orderId: this._id,
    totalItems: this.orderItems.length,
    totalQuantity: this.orderItems.reduce((total, item) => total + item.quantity, 0),
    totalPrice: this.totalPrice,
    status: this.status,
    createdAt: this.createdAt
  };
};

// Index for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema); 