import React, { useState } from 'react';
import Head from 'next/head';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import axios from 'axios';
import Image from 'next/image';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { FiTrash2, FiPlus, FiMinus, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import ProtectedRoute from '../components/Auth/ProtectedRoute';

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    mainImage: string;
    stock: number;
  };
  quantity: number;
}

interface CartData {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

const CartPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Fetch cart data
  const { data: cart, isLoading } = useQuery(
    'cart',
    async () => {
      const response = await axios.get('/api/cart');
      return response.data;
    },
    {
      enabled: !!user,
      onError: () => {
        toast.error('Không thể tải giỏ hàng');
      }
    }
  );

  // Update quantity mutation
  const updateQuantityMutation = useMutation(
    async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const response = await axios.put(`/api/cart/${itemId}`, { quantity });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
        toast.success('Đã cập nhật giỏ hàng');
      },
      onError: () => {
        toast.error('Có lỗi xảy ra khi cập nhật giỏ hàng');
      }
    }
  );

  // Remove item mutation
  const removeItemMutation = useMutation(
    async (itemId: string) => {
      const response = await axios.delete(`/api/cart/${itemId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
        toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
      },
      onError: () => {
        toast.error('Có lỗi xảy ra khi xóa sản phẩm');
      }
    }
  );

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(itemId);
    await updateQuantityMutation.mutateAsync({ itemId, quantity: newQuantity });
    setIsUpdating(null);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeItemMutation.mutateAsync(itemId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };



  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-8"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <ProtectedRoute requireAuth>
      <Head>
        <title>Giỏ hàng - Badminton Shop</title>
        <meta name="description" content="Xem và quản lý giỏ hàng của bạn" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ hàng</h1>

          {!cart || cart.items.length === 0 ? (
            <div className="text-center py-12">
              <FiShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h2>
              <p className="text-gray-600 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
              <button
                onClick={() => router.push('/products')}
                className="btn-primary"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Sản phẩm ({cart.totalItems})
                    </h2>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {cart.items.map((item: CartItem) => (
                      <div key={item._id} className="p-6">
                        <div className="flex items-center">
                          {/* Product Image */}
                          <div className="relative w-20 h-20 flex-shrink-0 mr-4">
                            <Image
                              src={item.product.mainImage}
                              alt={item.product.name}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              {item.product.name}
                            </h3>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <span className="text-lg font-bold text-gray-900">
                                  {formatPrice(item.product.price)}
                                </span>
                                {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                                  <span className="text-sm text-gray-500 line-through">
                                    {formatPrice(item.product.originalPrice)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-4 ml-4">
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                disabled={isUpdating === item._id || item.quantity <= 1}
                                className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                              >
                                <FiMinus className="w-4 h-4" />
                              </button>
                              <span className="px-4 py-2 border-x border-gray-300">
                                {isUpdating === item._id ? '...' : item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                disabled={isUpdating === item._id || item.quantity >= item.product.stock}
                                className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                              >
                                <FiPlus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => handleRemoveItem(item._id)}
                              disabled={removeItemMutation.isLoading}
                              className="text-red-600 hover:text-red-800 p-2"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Stock Warning */}
                        {item.quantity > item.product.stock && (
                          <div className="mt-2 text-sm text-red-600">
                            Chỉ còn {item.product.stock} sản phẩm trong kho
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tạm tính ({cart.totalItems} sản phẩm)</span>
                      <span className="text-gray-900">{formatPrice(cart.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phí vận chuyển</span>
                      <span className="text-gray-900">{formatPrice(cart.shipping)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Thuế</span>
                      <span className="text-gray-900">{formatPrice(cart.tax)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span className="text-gray-900">Tổng cộng</span>
                        <span className="text-gray-900">{formatPrice(cart.total)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push('/checkout')}
                    disabled={cart.items.length === 0}
                    className="w-full btn-primary py-3 text-lg font-semibold flex items-center justify-center"
                  >
                    Tiến hành thanh toán
                    <FiArrowRight className="ml-2 w-5 h-5" />
                  </button>

                  <div className="mt-4 text-center">
                    <button
                      onClick={() => router.push('/products')}
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      Tiếp tục mua sắm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </ProtectedRoute>
  );
};

export default CartPage; 