import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useRouter } from 'next/router';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit3, FiSave, FiX } from 'react-icons/fi';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

// Sửa interface Order cho đúng dữ liệu backend trả về
interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    product: {
      name: string;
      mainImage: string;
    };
    quantity: number;
    price: number;
  }>;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });

  // Fetch user profile
  const { data: profile, isLoading: loadingProfile } = useQuery(
    'profile',
    async () => {
      const response = await axios.get('/api/auth/profile');
      return response.data;
    },
    {
      enabled: !!user,
      onSuccess: (data) => {
        setFormData({
          name: data.name,
          phone: data.phone || ''
        });
      }
    }
  );

  // Fetch user orders
  const { data: ordersData, isLoading: loadingOrders } = useQuery(
    'orders',
    async () => {
      const response = await axios.get('/api/orders');
      return response.data;
    },
    {
      enabled: !!user
    }
  );

  // Update profile mutation
  const updateProfileMutation = useMutation(
    async (data: { name: string; phone: string }) => {
      const response = await axios.put('/api/auth/profile', data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        setIsEditing(false);
        toast.success('Cập nhật hồ sơ thành công');
        queryClient.invalidateQueries('profile');
      },
      onError: () => {
        toast.error('Có lỗi xảy ra khi cập nhật hồ sơ');
      }
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfileMutation.mutateAsync(formData);
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.name || '',
      phone: profile?.phone || ''
    });
    setIsEditing(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'processing':
        return 'Đang xử lý';
      case 'shipped':
        return 'Đang giao hàng';
      case 'delivered':
        return 'Đã giao hàng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };



  return (
    <ProtectedRoute requireAuth>
      <Head>
        <title>Hồ sơ - Badminton Shop</title>
        <meta name="description" content="Quản lý hồ sơ và đơn hàng của bạn" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Hồ sơ của tôi</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Thông tin cá nhân</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center text-primary-600 hover:text-primary-700"
                    >
                      <FiEdit3 className="w-4 h-4 mr-1" />
                      Chỉnh sửa
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleSubmit}
                        disabled={updateProfileMutation.isLoading}
                        className="flex items-center text-green-600 hover:text-green-700"
                      >
                        <FiSave className="w-4 h-4 mr-1" />
                        Lưu
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center text-gray-600 hover:text-gray-700"
                      >
                        <FiX className="w-4 h-4 mr-1" />
                        Hủy
                      </button>
                    </div>
                  )}
                </div>

                {loadingProfile ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Họ và tên
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            required
                          />
                        ) : (
                          <div className="flex items-center text-gray-900">
                            <FiUser className="w-4 h-4 mr-2 text-gray-500" />
                            {profile?.name}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <div className="flex items-center text-gray-900">
                          <FiMail className="w-4 h-4 mr-2 text-gray-500" />
                          {profile?.email}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số điện thoại
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="flex items-center text-gray-900">
                            <FiPhone className="w-4 h-4 mr-2 text-gray-500" />
                            {profile?.phone || 'Chưa cập nhật'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vai trò
                        </label>
                        <div className="flex items-center text-gray-900">
                          <FiUser className="w-4 h-4 mr-2 text-gray-500" />
                          {profile?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ngày tham gia
                        </label>
                        <div className="flex items-center text-gray-900">
                          <FiMapPin className="w-4 h-4 mr-2 text-gray-500" />
                          {profile?.createdAt ? formatDate(profile.createdAt) : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Order History */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Lịch sử đơn hàng</h2>

                {loadingOrders ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="h-24 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : ordersData && ordersData.orders && ordersData.orders.length > 0 ? (
                  <div className="space-y-4">
                    {ordersData.orders.map((order: Order) => (
                      <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              Đơn hàng #{order.orderNumber}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                            <span className="font-medium text-gray-900">
                              {formatPrice(order.total)}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <span className="text-gray-600">
                                {item.product.name} x{item.quantity}
                              </span>
                              <span className="ml-auto text-gray-900">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <a
                            href={`/orders/${order._id}`}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            Xem chi tiết →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <FiUser className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
                    <p className="text-gray-600 mb-6">
                      Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!
                    </p>
                    <a
                      href="/products"
                      className="btn-primary"
                    >
                      Mua sắm ngay
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </ProtectedRoute>
  );
};

export default ProfilePage; 