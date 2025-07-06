const express = require('express');
const { body, validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price mainImage stock');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id });
    }

    const totals = cart.getTotals();
    res.json({
      ...cart.toObject(),
      ...totals
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
router.post('/', protect, [
  body('productId')
    .notEmpty()
    .withMessage('ID sản phẩm là bắt buộc'),
  body('quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Số lượng phải từ 1-100')
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

    const { productId, quantity, selectedOptions } = req.body;

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Số lượng vượt quá tồn kho' });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id });
    }

    // Add item to cart
    await cart.addItem(productId, quantity, product.price, selectedOptions);

    // Populate product details
    await cart.populate('items.product', 'name price mainImage stock');

    res.json(cart);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
router.put('/:itemId', protect, [
  body('quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Số lượng phải từ 1-100')
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

    const { quantity } = req.body;
    const { itemId } = req.params;

    // Get user cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
    }

    // Find item in cart
    const cartItem = cart.items.find(item => item._id.toString() === itemId);
    if (!cartItem) {
      return res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng' });
    }

    // Check stock
    const product = await Product.findById(cartItem.product);
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Số lượng vượt quá tồn kho' });
    }

    // Update quantity
    await cart.updateItemQuantity(itemId, quantity);

    // Populate product details
    await cart.populate('items.product', 'name price mainImage stock');

    res.json(cart);
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
router.delete('/:itemId', protect, async (req, res) => {
  try {
    const { itemId } = req.params;

    // Get user cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
    }

    // Remove item
    await cart.removeItem(itemId);

    // Populate product details
    await cart.populate('items.product', 'name price mainImage stock');

    res.json(cart);
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
    }

    await cart.clearCart();
    res.json({ message: 'Giỏ hàng đã được làm trống' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Get cart summary
// @route   GET /api/cart/summary
// @access  Private
router.get('/summary', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.json({
        totalItems: 0,
        totalAmount: 0,
        itemCount: 0
      });
    }

    res.json(cart.getSummary());
  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router; 