import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import axios from 'axios';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import { FiUsers, FiPackage, FiShoppingCart, FiDollarSign, FiTrendingUp, FiTrendingDown, FiEdit3, FiTrash2 } from 'react-icons/fi';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  brand: string;
  isFeatured: boolean;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'products' | 'orders' | 'users'>('dashboard');

  // Fetch dashboard stats
  const { data: stats, isLoading: loadingStats } = useQuery(
    'adminStats',
    async () => {
      const response = await axios.get('/api/admin/stats');
      return response.data;
    }
  );

  // Fetch products
  const { data: products, isLoading: loadingProducts } = useQuery(
    'adminProducts',
    async () => {
      const response = await axios.get('/api/products?limit=10');
      return response.data.products;
    }
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <ProtectedRoute requireAuth requireAdmin>
      <Head>
        <title>Admin Dashboard - Badminton Shop</title>
        <meta name="description" content="Quản trị hệ thống" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Quản trị hệ thống</h1>
            <button
              onClick={() => router.push('/admin/products/new')}
              className="btn-primary flex items-center"
            >
              <FiPackage className="w-4 h-4 mr-2" />
              Thêm sản phẩm
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex space-x-8">
              {[
                { id: 'dashboard', label: 'Tổng quan', path: '/admin' },
                { id: 'products', label: 'Sản phẩm', path: '/admin/products' },
                { id: 'orders', label: 'Đơn hàng', path: '/admin/orders' },
                { id: 'users', label: 'Người dùng', path: '/admin/users' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'dashboard') {
                      setSelectedTab(tab.id as any);
                    } else {
                      router.push(tab.path);
                    }
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Dashboard Content */}
          {selectedTab === 'dashboard' && (
            <div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FiPackage className="h-8 w-8 text-primary-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Tổng sản phẩm
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {loadingStats ? '...' : stats?.totalProducts || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FiUsers className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Tổng người dùng
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {loadingStats ? '...' : stats?.totalUsers || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FiShoppingCart className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Tổng đơn hàng
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {loadingStats ? '...' : stats?.totalOrders || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FiDollarSign className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Doanh thu
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {loadingStats ? '...' : formatPrice(stats?.totalRevenue || 0)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Products */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Sản phẩm gần đây</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sản phẩm
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Giá
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tồn kho
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Danh mục
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thương hiệu
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày tạo
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loadingProducts ? (
                        [...Array(5)].map((_, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            </td>
                          </tr>
                        ))
                      ) : products && products.length > 0 ? (
                        products.map((product: Product) => (
                          <tr key={product._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatPrice(product.price)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                product.stock > 10 ? 'bg-green-100 text-green-800' :
                                product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {product.stock}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {product.category}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {product.brand}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {formatDate(product.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => router.push(`/admin/products/${product._id}/edit`)}
                                  className="text-primary-600 hover:text-primary-900"
                                >
                                  <FiEdit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
                                      // Handle delete
                                      toast.success('Đã xóa sản phẩm');
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                            Không có sản phẩm nào
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {selectedTab === 'products' && (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quản lý sản phẩm</h3>
              <p className="text-gray-600">Tính năng đang được phát triển...</p>
            </div>
          )}

          {/* Orders Tab */}
          {selectedTab === 'orders' && (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quản lý đơn hàng</h3>
              <p className="text-gray-600">Tính năng đang được phát triển...</p>
            </div>
          )}

          {/* Users Tab */}
          {selectedTab === 'users' && (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quản lý người dùng</h3>
              <p className="text-gray-600">Tính năng đang được phát triển...</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </ProtectedRoute>
  );
};

export default AdminDashboard; 