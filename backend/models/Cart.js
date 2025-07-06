const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Số lượng phải ít nhất là 1'],
    max: [100, 'Số lượng không được vượt quá 100']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Giá không được âm']
  },
  selectedOptions: {
    size: String,
    color: String,
    weight: String
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0,
    min: [0, 'Tổng tiền không được âm']
  },
  totalItems: {
    type: Number,
    default: 0,
    min: [0, 'Tổng số sản phẩm không được âm']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  next();
});

// Method to add item to cart
cartSchema.methods.addItem = function(productId, quantity, price, options = {}) {
  const existingItem = this.items.find(item => 
    item.product.toString() === productId.toString() &&
    JSON.stringify(item.selectedOptions) === JSON.stringify(options)
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({
      product: productId,
      quantity,
      price,
      selectedOptions: options
    });
  }
  
  return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(itemId) {
  this.items = this.items.filter(item => item._id.toString() !== itemId.toString());
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(itemId, quantity) {
  const item = this.items.find(item => item._id.toString() === itemId.toString());
  if (item) {
    item.quantity = quantity;
  }
  return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

// Method to get cart summary
cartSchema.methods.getSummary = function() {
  return {
    totalItems: this.totalItems,
    totalAmount: this.totalAmount,
    itemCount: this.items.length
  };
};

// Method to get cart totals (subtotal, shipping, tax, total)
cartSchema.methods.getTotals = function() {
  const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  // Shipping: miễn phí nếu subtotal > 2 triệu, ngược lại 30.000đ
  const shipping = subtotal > 2000000 ? 0 : (subtotal > 0 ? 30000 : 0);
  // Tax: 8% VAT
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shipping + tax;
  return { subtotal, shipping, tax, total };
};

module.exports = mongoose.model('Cart', cartSchema); 