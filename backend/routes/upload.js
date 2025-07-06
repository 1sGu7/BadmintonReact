const express = require('express');
const multer = require('multer');
const { uploadImage, uploadMultipleImages } = require('../utils/cloudinary');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type - accept all image formats
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file hình ảnh (JPG, PNG, GIF, WEBP, SVG, etc.)'), false);
    }
  },
});

// @desc    Upload single image (for frontend compatibility)
// @route   POST /api/upload
// @access  Private/Admin
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file hình ảnh' });
    }

    // Convert buffer to base64
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await uploadImage(base64Image, 'badminton-shop/products');

    res.json({
      success: true,
      url: result.url,
      public_id: result.public_id,
      width: result.width,
      height: result.height
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ 
      message: 'Lỗi upload hình ảnh',
      error: error.message 
    });
  }
});

// @desc    Upload single image (alternative endpoint)
// @route   POST /api/upload/image
// @access  Private/Admin
router.post('/image', protect, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file hình ảnh' });
    }

    // Convert buffer to base64
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await uploadImage(base64Image, 'badminton-shop/products');

    res.json({
      success: true,
      url: result.url,
      public_id: result.public_id,
      width: result.width,
      height: result.height
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ 
      message: 'Lỗi upload hình ảnh',
      error: error.message 
    });
  }
});

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private/Admin
router.post('/images', protect, admin, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Vui lòng chọn ít nhất một file hình ảnh' });
    }

    // Convert buffers to base64
    const base64Images = req.files.map(file => 
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
    );

    // Upload to Cloudinary
    const results = await uploadMultipleImages(base64Images, 'badminton-shop/products');

    res.json({
      success: true,
      images: results.map(result => ({
        url: result.url,
        public_id: result.public_id,
        width: result.width,
        height: result.height
      }))
    });
  } catch (error) {
    console.error('Upload multiple images error:', error);
    res.status(500).json({ 
      message: 'Lỗi upload hình ảnh',
      error: error.message 
    });
  }
});

// @desc    Upload user avatar
// @route   POST /api/upload/avatar
// @access  Private
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file hình ảnh' });
    }

    // Convert buffer to base64
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await uploadImage(base64Image, 'badminton-shop/avatars');

    res.json({
      success: true,
      url: result.url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ 
      message: 'Lỗi upload avatar',
      error: error.message 
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File quá lớn, tối đa 10MB' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Quá nhiều file, tối đa 10 file' });
    }
    return res.status(400).json({ message: 'Lỗi upload file' });
  }
  
  if (error.message && error.message.includes('Chỉ chấp nhận file hình ảnh')) {
    return res.status(400).json({ message: error.message });
  }
  
  next(error);
});

module.exports = router; 