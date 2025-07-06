import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import Image from 'next/image';
import Header from '../../../components/Layout/Header';
import Footer from '../../../components/Layout/Footer';
import { FiPlus, FiEdit3, FiTrash2, FiEye, FiSearch, FiFilter } from 'react-icons/fi';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';
import ProtectedRoute from '../../../components/Auth/ProtectedRoute';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  mainImage: string;
  rating: number;
  numReviews: number;
  brand: string;
  category: string;
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
}

const AdminProductsPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');

  // Fetch products
  const { data: productsData, isLoading } = useQuery(
    ['adminProducts', searchTerm, selectedCategory, selectedBrand],
    async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedBrand) params.append('brand', selectedBrand);
      params.append('limit', '50');
      
      const response = await axios.get(`/api/products?${params.toString()}`);
      return response.data;
    }
  );

  // Delete product mutation
  const deleteProductMutation = useMutation(
    async (productId: string) => {
      const response = await axios.delete(`/api/products/${productId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminProducts');
        toast.success('Đã xóa sản phẩm thành công');
      },
      onError: () => {
        toast.error('Có lỗi xảy ra khi xóa sản phẩm');
      }
    }
  );

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${productName}"?`)) {
      await deleteProductMutation.mutateAsync(productId);
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

  const categories = [
    'Vợt cầu lông',
    'Cầu lông',
    'Giày cầu lông',
    'Túi đựng vợt',
    'Quần áo cầu lông',
    'Phụ kiện'
  ];

  const brands = [
    'Yonex',
    'Victor',
    'Li-Ning',
    'Wilson',
    'Babolat',
    'Prince'
  ];

  return (
    <ProtectedRoute requireAuth requireAdmin>
      <Head>
        <title>Quản lý sản phẩm - Admin Dashboard</title>
        <meta name="description" content="Quản lý sản phẩm trong hệ thống" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
              <p className="text-gray-600 mt-2">
                Quản lý tất cả sản phẩm trong hệ thống
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/products/new')}
              className="btn-primary flex items-center"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Thêm sản phẩm mới
            </button>
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
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thương hiệu
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Tất cả thương hiệu</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setSelectedBrand('');
                  }}
                  className="w-full btn-secondary"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Danh sách sản phẩm ({productsData?.total || 0})
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
                        Sản phẩm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Danh mục
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thương hiệu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tồn kho
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productsData?.products?.map((product: Product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="relative w-12 h-12 flex-shrink-0 mr-4">
                              <Image
                                src={product.mainImage}
                                alt={product.name}
                                fill
                                className="object-cover rounded-lg"
                              />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.description.substring(0, 50)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.brand}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.isActive ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => router.push(`/products/${product._id}`)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Xem chi tiết"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => router.push(`/admin/products/${product._id}/edit`)}
                              className="text-green-600 hover:text-green-900"
                              title="Chỉnh sửa"
                            >
                              <FiEdit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id, product.name)}
                              className="text-red-600 hover:text-red-900"
                              title="Xóa"
                              disabled={deleteProductMutation.isLoading}
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {productsData?.products?.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <FiFilter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
                  <p className="text-gray-500">Thử thay đổi bộ lọc hoặc thêm sản phẩm mới.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </ProtectedRoute>
  );
};

export default AdminProductsPage; 