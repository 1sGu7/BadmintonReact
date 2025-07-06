import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import Image from 'next/image';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { FiMapPin, FiPhone, FiMail, FiCreditCard, FiTruck, FiLock } from 'react-icons/fi';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  note?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
}

interface OrderData {
  items: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
      mainImage: string;
    };
    quantity: number;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    city: '',
    district: '',
    ward: '',
    note: ''
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cod');
  const [isProcessing, setIsProcessing] = useState(false);

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
        toast.error('Không thể tải thông tin giỏ hàng');
        router.push('/cart');
      }
    }
  );

  // Create order mutation
  const createOrderMutation = useMutation(
    async (orderData: any) => {
      const response = await axios.post('/api/orders', orderData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success('Đặt hàng thành công!');
        router.push(`/orders/${data._id}`);
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng';
        toast.error(message);
      }
    }
  );

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'cod',
      name: 'Thanh toán khi nhận hàng',
      description: 'Thanh toán bằng tiền mặt khi nhận hàng',
      icon: FiTruck
    },
    {
      id: 'bank_transfer', // sửa lại cho đúng backend
      name: 'Chuyển khoản ngân hàng',
      description: 'Chuyển khoản qua tài khoản ngân hàng',
      icon: FiCreditCard
    },
    {
      id: 'momo',
      name: 'Ví MoMo',
      description: 'Thanh toán qua ví điện tử MoMo',
      icon: FiCreditCard
    }
  ];

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cart || cart.items.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }

    setIsProcessing(true);
    
    try {
      const subtotal = typeof cart.subtotal === 'number' ? cart.subtotal : cart.items.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
      const shipping = typeof cart.shipping === 'number' ? cart.shipping : (subtotal > 2000000 ? 0 : (subtotal > 0 ? 30000 : 0));
      const tax = typeof cart.tax === 'number' ? cart.tax : Math.round(subtotal * 0.08);
      const total = typeof cart.total === 'number' ? cart.total : (subtotal + shipping + tax);
      // Build shippingAddress đúng cấu trúc backend
      const shippingAddressPayload = {
        name: shippingAddress.fullName,
        phone: shippingAddress.phone,
        address: {
          street: shippingAddress.address,
          city: shippingAddress.city,
          district: shippingAddress.district,
          ward: shippingAddress.ward
        },
        note: shippingAddress.note
      };
      const orderData = {
        items: cart.items,
        shippingAddress: shippingAddressPayload,
        paymentMethod: selectedPaymentMethod,
        subtotal,
        shipping,
        tax,
        total
      };

      await createOrderMutation.mutateAsync(orderData);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    if (typeof price !== 'number' || isNaN(price)) return '0 VND';
    return price.toLocaleString('vi-VN') + ' VND';
  };



  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h1>
              <p className="text-gray-600 mb-6">Bạn cần có sản phẩm trong giỏ hàng để thanh toán</p>
              <button
                onClick={() => router.push('/products')}
                className="btn-primary"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const subtotal = typeof cart.subtotal === 'number' ? cart.subtotal : cart.items.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
  const shipping = typeof cart.shipping === 'number' ? cart.shipping : (subtotal > 2000000 ? 0 : (subtotal > 0 ? 30000 : 0));
  const tax = typeof cart.tax === 'number' ? cart.tax : Math.round(subtotal * 0.08);
  const total = typeof cart.total === 'number' ? cart.total : (subtotal + shipping + tax);

  return (
    <ProtectedRoute requireAuth>
      <Head>
        <title>Thanh toán - Badminton Shop</title>
        <meta name="description" content="Hoàn tất đơn hàng của bạn" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Shipping & Payment */}
              <div className="space-y-8">
                {/* Shipping Address */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <FiMapPin className="w-5 h-5 mr-2 text-primary-600" />
                    Thông tin giao hàng
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        required
                        value={shippingAddress.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        required
                        value={shippingAddress.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={shippingAddress.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="ward" className="block text-sm font-medium text-gray-700 mb-1">
                        Phường/Xã *
                      </label>
                      <input
                        type="text"
                        id="ward"
                        required
                        value={shippingAddress.ward}
                        onChange={(e) => handleInputChange('ward', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                        Quận/Huyện *
                      </label>
                      <input
                        type="text"
                        id="district"
                        required
                        value={shippingAddress.district}
                        onChange={(e) => handleInputChange('district', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        Tỉnh/Thành phố *
                      </label>
                      <input
                        type="text"
                        id="city"
                        required
                        value={shippingAddress.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ chi tiết *
                    </label>
                    <textarea
                      id="address"
                      rows={3}
                      required
                      value={shippingAddress.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Số nhà, tên đường, khu phố..."
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <textarea
                      id="note"
                      rows={2}
                      value={shippingAddress.note}
                      onChange={(e) => handleInputChange('note', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <FiCreditCard className="w-5 h-5 mr-2 text-primary-600" />
                    Phương thức thanh toán
                  </h2>

                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedPaymentMethod === method.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={selectedPaymentMethod === method.id}
                          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                          className="mr-3 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="flex items-center">
                          <method.icon className="w-5 h-5 mr-3 text-gray-600" />
                          <div>
                            <div className="font-medium text-gray-900">{method.name}</div>
                            <div className="text-sm text-gray-600">{method.description}</div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div>
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>

                  {/* Order Items */}
                  <div className="space-y-4 mb-6">
                    {cart.items.map((item: any) => (
                      <div key={item._id} className="flex items-center">
                        <div className="relative w-16 h-16 flex-shrink-0 mr-4">
                          <Image
                            src={item.product.mainImage}
                            alt={item.product.name}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(item.product.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tạm tính ({cart.totalItems} sản phẩm)</span>
                      <span className="text-gray-900">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phí vận chuyển</span>
                      <span className="text-gray-900">{formatPrice(shipping)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Thuế</span>
                      <span className="text-gray-900">{formatPrice(tax)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span className="text-gray-900">Tổng cộng</span>
                        <span className="text-gray-900">{formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isProcessing || createOrderMutation.isLoading}
                    className="w-full mt-6 btn-primary py-3 text-lg font-semibold flex items-center justify-center"
                  >
                    {isProcessing || createOrderMutation.isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang xử lý...
                      </div>
                    ) : (
                      <>
                        <FiLock className="w-5 h-5 mr-2" />
                        Đặt hàng
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Bằng cách đặt hàng, bạn đồng ý với{' '}
                    <a href="/terms" className="text-primary-600 hover:text-primary-500">
                      Điều khoản sử dụng
                    </a>
                    {' '}và{' '}
                    <a href="/privacy" className="text-primary-600 hover:text-primary-500">
                      Chính sách bảo mật
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </ProtectedRoute>
  );
};

export default CheckoutPage; 