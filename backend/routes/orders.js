const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const User = require('../models/User'); // Added missing import for User

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, [
  body('shippingAddress.name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Tên người nhận phải từ 2-50 ký tự'),
  body('shippingAddress.phone')
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại không hợp lệ'),
  body('shippingAddress.address.street')
    .trim()
    .notEmpty()
    .withMessage('Địa chỉ là bắt buộc'),
  body('shippingAddress.address.city')
    .trim()
    .notEmpty()
    .withMessage('Thành phố là bắt buộc'),
  body('shippingAddress.address.district')
    .trim()
    .notEmpty()
    .withMessage('Quận/huyện là bắt buộc'),
  body('paymentMethod')
    .isIn(['cod', 'bank_transfer', 'momo', 'vnpay'])
    .withMessage('Phương thức thanh toán không hợp lệ')
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

    const { shippingAddress, paymentMethod, note } = req.body;

    // Get user cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price mainImage stock');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    // Check stock for all items
    for (let item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product || !product.isActive) {
        return res.status(400).json({ 
          message: `Sản phẩm ${product?.name || 'không xác định'} không còn bán` 
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Sản phẩm ${product.name} chỉ còn ${product.stock} sản phẩm` 
        });
      }
    }

    // Create order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.price,
      image: item.product.mainImage,
      selectedOptions: item.selectedOptions
    }));

    // Create order
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress: {
        ...shippingAddress,
        note: note || ''
      },
      paymentMethod
    });

    const createdOrder = await order.save();

    // Update product stock
    for (let item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart
    await cart.clearCart();

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    const count = await Order.countDocuments({ user: req.user._id });
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product', 'name mainImage')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    // Map lại dữ liệu cho frontend
    const mappedOrders = orders.map(order => ({
      _id: order._id,
      orderNumber: order._id.toString().slice(-8).toUpperCase(),
      status: order.status,
      total: order.totalPrice,
      createdAt: order.createdAt,
      items: order.orderItems.map(item => ({
        product: {
          name: item.name,
          mainImage: item.image
        },
        quantity: item.quantity,
        price: item.price
      }))
    }));

    res.json({
      orders: mappedOrders,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name mainImage');

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Delete order (Admin only)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Restore product stock if order was confirmed/processing/shipped
    if (['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)) {
      for (let item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    await order.remove();
    res.json({ message: 'Đơn hàng đã được xóa' });
  } catch (error) {
    console.error('Delete order error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Get all orders (Admin only)
// @route   GET /api/admin/orders
// @access  Private/Admin
router.get('/admin/orders', protect, admin, async (req, res) => {
  try {
    const pageSize = 50;
    const page = Number(req.query.pageNumber) || 1;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const paymentStatus = req.query.paymentStatus || '';

    let query = {};
    if (search) {
      query.$or = [
        { 'user.name': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } },
        { _id: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const count = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name mainImage')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    // Map lại dữ liệu cho frontend admin
    const mappedOrders = orders.map(order => {
      let totalAmount = order.totalPrice;
      if (typeof totalAmount !== 'number' || isNaN(totalAmount)) {
        if (Array.isArray(order.orderItems) && order.orderItems.length > 0) {
          const itemsPrice = order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          const taxPrice = itemsPrice * 0.1;
          const shippingPrice = itemsPrice > 500000 ? 0 : 30000;
          totalAmount = itemsPrice + taxPrice + shippingPrice;
        } else {
          totalAmount = 0;
        }
      }
      return {
        _id: order._id,
        user: order.user ? {
          _id: order.user._id,
          name: order.user.name,
          email: order.user.email
        } : null,
        items: order.orderItems.map(item => ({
          product: {
            _id: item.product?._id,
            name: item.product?.name || item.name,
            mainImage: item.product?.mainImage || item.image
          },
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount,
        status: order.status,
        paymentStatus: order.isPaid ? 'paid' : 'pending',
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
    });

    res.json({
      orders: mappedOrders,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, admin, [
  body('status')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Trạng thái không hợp lệ'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Ghi chú không được vượt quá 500 ký tự')
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

    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Update order status
    order.status = status;
    if (note) {
      order.notes = order.notes || [];
      order.notes.push({
        message: note,
        createdAt: new Date(),
        createdBy: req.user._id
      });
    }
    
    await order.save();

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const pageSize = 20;
    const page = Number(req.query.pageNumber) || 1;
    const status = req.query.status;
    const keyword = req.query.keyword;

    const filters = {};
    if (status) filters.status = status;
    if (keyword) {
      filters.$or = [
        { 'shippingAddress.name': { $regex: keyword, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: keyword, $options: 'i' } }
      ];
    }

    const count = await Order.countDocuments(filters);
    const orders = await Order.find(filters)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name mainImage')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      orders,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Mark order as paid
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin
router.put('/:id/pay', protect, admin, async (req, res) => {
  try {
    const { paymentResult } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    if (order.isPaid) {
      return res.status(400).json({ message: 'Đơn hàng đã được thanh toán' });
    }

    await order.markAsPaid(paymentResult);
    res.json(order);
  } catch (error) {
    console.error('Mark order as paid error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, [
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Lý do hủy phải từ 10-500 ký tự')
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

    const { reason } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền hủy đơn hàng này' });
    }

    // Check if order can be cancelled
    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ message: 'Không thể hủy đơn hàng ở trạng thái này' });
    }

    // Cancel order
    await order.updateStatus('cancelled', reason);

    // Restore product stock
    for (let item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    res.json(order);
  } catch (error) {
    console.error('Cancel order error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Get user's favorite products
// @route   GET /api/products/favorites
// @access  Private
router.get('/favorites', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Get product brands
// @route   GET /api/products/brands
// @access  Public
router.get('/brands', async (req, res) => {
  try {
    const brands = await Product.distinct('brand');
    res.json(brands);
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router; 