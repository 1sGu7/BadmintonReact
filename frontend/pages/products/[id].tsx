import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import axios from 'axios';
import Image from 'next/image';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import ProductCard from '../../components/Products/ProductCard';
import { FiStar, FiShoppingCart, FiHeart, FiShare2, FiTruck, FiShield, FiRefreshCw, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  mainImage: string;
  images: string[];
  rating: number;
  numReviews: number;
  brand: string;
  category: string;
  stock: number;
  isFeatured: boolean;
  discountPercentage?: number;
  specifications?: Record<string, string>;
  reviews?: Review[];
}

interface Review {
  _id: string;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

const ProductDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');

  // Fetch product details
  const { data: product, isLoading: loadingProduct } = useQuery(
    ['product', id],
    async () => {
      const response = await axios.get(`/api/products/${id}`);
      return response.data;
    },
    {
      enabled: !!id,
      onSuccess: (data) => {
        setSelectedImage(data.mainImage);
      }
    }
  );

  // Fetch related products
  const { data: relatedProducts } = useQuery(
    ['relatedProducts', product?.category],
    async () => {
      const response = await axios.get(`/api/products?category=${product.category}&limit=4`);
      return response.data.products.filter((p: Product) => p._id !== id);
    },
    {
      enabled: !!product?.category
    }
  );

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }

    if (product.stock === 0) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }

    try {
      await addToCart(product._id, quantity);
      toast.success('Đã thêm vào giỏ hàng');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loadingProduct) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-96 bg-gray-200 rounded-lg"></div>
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy sản phẩm</h1>
              <p className="text-gray-600 mb-6">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
              <button
                onClick={() => router.push('/products')}
                className="btn-primary"
              >
                Quay lại trang sản phẩm
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{product.name} - Badminton Shop</title>
        <meta name="description" content={product.description} />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <a href="/" className="hover:text-primary-600">Trang chủ</a>
              </li>
              <li>/</li>
              <li>
                <a href="/products" className="hover:text-primary-600">Sản phẩm</a>
              </li>
              <li>/</li>
              <li>
                <a href={`/products?category=${product.category}`} className="hover:text-primary-600">
                  {product.category}
                </a>
              </li>
              <li>/</li>
              <li className="text-gray-900">{product.name}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Product Images */}
            <div>
              {/* Ảnh sản phẩm */}
              <div className="flex justify-center items-center bg-gray-50 rounded-lg shadow-sm mb-6 relative" style={{ minHeight: 360, aspectRatio: '4/3', maxWidth: 400, margin: '0 auto' }}>
                <img
                  src={product.mainImage}
                  alt={product.name}
                  className="object-contain w-full h-full rounded-lg"
                  style={{ maxHeight: 360, maxWidth: 400 }}
                />
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="absolute top-4 left-4">
                    <span className="badge-danger">
                      -{String(Number(product.discountPercentage) || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100))}%
                    </span>
                  </div>
                )}
              </div>
              
              {/* Thumbnail Images */}
              {product.images && product.images.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  <div
                    className={`relative h-20 cursor-pointer rounded border-2 ${
                      selectedImage === product.mainImage ? 'border-primary-600' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedImage(product.mainImage)}
                  >
                    <Image
                      src={product.mainImage}
                      alt={product.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  {product.images.map((image: string, index: number) => (
                    <div
                      key={index}
                      className={`relative h-20 cursor-pointer rounded border-2 ${
                        selectedImage === image ? 'border-primary-600' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedImage(image)}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-4">
                <span className="text-sm text-gray-500 uppercase tracking-wide">
                  {product.brand}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex items-center mr-2">
                  {[...Array(5)].map((_, index) => (
                    <FiStar
                      key={index}
                      className={`w-5 h-5 ${
                        index < Math.round(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 mr-4">
                  {product.rating}/5 ({product.numReviews} đánh giá)
                </span>
                <span className="badge-secondary">
                  {product.category}
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <span className="text-green-600 font-medium">
                    ✓ Còn {product.stock} sản phẩm
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">
                    ✗ Hết hàng
                  </span>
                )}
              </div>

              {/* Quantity and Add to Cart */}
              <div className="mb-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="btn-primary flex items-center px-8 py-3"
                  >
                    <FiShoppingCart className="w-5 h-5 mr-2" />
                    Thêm vào giỏ hàng
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 mb-6">
                <button className="flex items-center text-gray-600 hover:text-primary-600">
                  <FiHeart className="w-5 h-5 mr-2" />
                  Yêu thích
                </button>
                <button className="flex items-center text-gray-600 hover:text-primary-600">
                  <FiShare2 className="w-5 h-5 mr-2" />
                  Chia sẻ
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <FiTruck className="w-5 h-5 mr-2 text-primary-600" />
                  Miễn phí vận chuyển
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FiShield className="w-5 h-5 mr-2 text-primary-600" />
                  Bảo hành chính hãng
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FiRefreshCw className="w-5 h-5 mr-2 text-primary-600" />
                  Đổi trả 30 ngày
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'description'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Mô tả
                </button>
                <button
                  onClick={() => setActiveTab('specifications')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'specifications'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Thông số kỹ thuật
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'reviews'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Đánh giá ({product.numReviews})
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {activeTab === 'specifications' && product.specifications && typeof product.specifications === 'object' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-700">{key}</span>
                      <span className="text-gray-600">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                                     {product.reviews && product.reviews.length > 0 ? (
                     <div className="space-y-6">
                       {product.reviews.map((review: Review) => (
                         <div key={review._id} className="border-b border-gray-200 pb-6">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                <span className="text-sm font-medium text-gray-600">
                                  {review.user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{review.user.name}</div>
                                <div className="text-sm text-gray-500">{formatDate(review.createdAt)}</div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, index) => (
                                <FiStar
                                  key={index}
                                  className={`w-4 h-4 ${
                                    index < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm liên quan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct: Product) => (
                  <ProductCard key={relatedProduct._id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ProductDetailPage; 