import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import { FiEye, FiEdit3, FiTrash2, FiSearch, FiFilter, FiPackage, FiTruck, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface OrderItem {
  product: {
    _id?: string;
    name: string;
    mainImage: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  } | null;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  total?: number; // Added for new logic
}

const AdminOrdersPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');

  // Fetch orders
  const { data: ordersData, isLoading } = useQuery(
    ['adminOrders', searchTerm, selectedStatus, selectedPaymentStatus],
    async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedPaymentStatus) params.append('paymentStatus', selectedPaymentStatus);
      params.append('limit', '50');
      
      // Sử dụng đúng endpoint cho admin
      const response = await axios.get(`/api/admin/orders?${params.toString()}`);
      return response.data;
    }
  );

  // Update order status mutation
  const updateOrderStatusMutation = useMutation(
    async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await axios.put(`/api/orders/${orderId}/status`, { status });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminOrders');
        toast.success('Cập nhật trạng thái đơn hàng thành công');
      },
      onError: () => {
        toast.error('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
      }
    }
  );

  // Delete order mutation
  const deleteOrderMutation = useMutation(
    async (orderId: string) => {
      const response = await axios.delete(`/api/orders/${orderId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminOrders');
        toast.success('Đã xóa đơn hàng thành công');
      },
      onError: () => {
        toast.error('Có lỗi xảy ra khi xóa đơn hàng');
      }
    }
  );

  const handleUpdateStatus = async (orderId: string, status: string) => {
    await updateOrderStatusMutation.mutateAsync({ orderId, status });
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng "${orderNumber}"?`)) {
      await deleteOrderMutation.mutateAsync(orderId);
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
        return 'Đã gửi hàng';
      case 'delivered':
        return 'Đã giao hàng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ thanh toán';
      case 'paid':
        return 'Đã thanh toán';
      case 'failed':
        return 'Thanh toán thất bại';
      default:
        return status;
    }
  };

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'shipped', label: 'Đã gửi hàng' },
    { value: 'delivered', label: 'Đã giao hàng' },
    { value: 'cancelled', label: 'Đã hủy' }
  ];

  const paymentStatusOptions = [
    { value: '', label: 'Tất cả thanh toán' },
    { value: 'pending', label: 'Chờ thanh toán' },
    { value: 'paid', label: 'Đã thanh toán' },
    { value: 'failed', label: 'Thanh toán thất bại' }
  ];

  return (
    <ProtectedRoute requireAuth requireAdmin>
      <Head>
        <title>Quản lý đơn hàng - Admin Dashboard</title>
        <meta name="description" content="Quản lý đơn hàng trong hệ thống" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
              <p className="text-gray-600 mt-2">
                Quản lý tất cả đơn hàng trong hệ thống
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm đơn hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái đơn hàng
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái thanh toán
                </label>
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {paymentStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedStatus('');
                    setSelectedPaymentStatus('');
                  }}
                  className="w-full btn-secondary"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Danh sách đơn hàng ({ordersData?.total || 0})
              </h2>
            </div>

            {isLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="h-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã đơn hàng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Khách hàng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tổng tiền
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thanh toán
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ordersData?.orders?.map((order: Order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{order._id.slice(-8).toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.user?.name || 'Ẩn'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.user?.email || ''}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {typeof order.total === 'number' && !isNaN(order.total)
                              ? formatPrice(order.total)
                              : (typeof order.totalAmount === 'number' && !isNaN(order.totalAmount))
                                ? formatPrice(order.totalAmount)
                                : Array.isArray(order.items)
                                  ? formatPrice(order.items.reduce((sum, item) => sum + item.price * item.quantity, 0))
                                  : 'Không xác định'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                            className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(order.status)}`}
                          >
                            {statusOptions.slice(1).map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {getPaymentStatusText(order.paymentStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => router.push(`/orders/${order._id}`)}
                              className="text-primary-600 hover:text-primary-900"
                              title="Xem chi tiết"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order._id, order._id.slice(-8).toUpperCase())}
                              className="text-red-600 hover:text-red-900"
                              title="Xóa đơn hàng"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {(!ordersData?.orders || ordersData.orders.length === 0) && (
                  <div className="text-center py-12">
                    <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Không có đơn hàng</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Chưa có đơn hàng nào trong hệ thống.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </ProtectedRoute>
  );
};

export default AdminOrdersPage; 