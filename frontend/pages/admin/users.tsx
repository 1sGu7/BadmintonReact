import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import { FiUsers, FiSearch, FiFilter, FiEdit3, FiTrash2, FiEye, FiUser, FiShield, FiMail, FiPhone } from 'react-icons/fi';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminUsersPage: React.FC = () => {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Fetch users
  const { data: usersData, isLoading } = useQuery(
    ['adminUsers', searchTerm, selectedRole, selectedStatus],
    async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedRole) params.append('role', selectedRole);
      if (selectedStatus) params.append('isActive', selectedStatus);
      params.append('limit', '50');
      
      const response = await axios.get(`/api/admin/users?${params.toString()}`);
      return response.data;
    }
  );

  // Update user role mutation
  const updateUserRoleMutation = useMutation(
    async ({ userId, role }: { userId: string; role: string }) => {
      const response = await axios.put(`/api/admin/users/${userId}/role`, { role });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers');
        toast.success('Cập nhật quyền người dùng thành công');
      },
      onError: () => {
        toast.error('Có lỗi xảy ra khi cập nhật quyền người dùng');
      }
    }
  );

  // Update user status mutation
  const updateUserStatusMutation = useMutation(
    async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const response = await axios.put(`/api/admin/users/${userId}/status`, { isActive });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers');
        toast.success('Cập nhật trạng thái người dùng thành công');
      },
      onError: () => {
        toast.error('Có lỗi xảy ra khi cập nhật trạng thái người dùng');
      }
    }
  );

  // Delete user mutation
  const deleteUserMutation = useMutation(
    async (userId: string) => {
      const response = await axios.delete(`/api/admin/users/${userId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers');
        toast.success('Đã xóa người dùng thành công');
      },
      onError: () => {
        toast.error('Có lỗi xảy ra khi xóa người dùng');
      }
    }
  );

  const handleUpdateRole = async (userId: string, role: string) => {
    await updateUserRoleMutation.mutateAsync({ userId, role });
  };

  const handleUpdateStatus = async (userId: string, isActive: boolean) => {
    await updateUserStatusMutation.mutateAsync({ userId, isActive });
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (userId === currentUser?._id) {
      toast.error('Bạn không thể xóa chính mình');
      return;
    }
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${userName}"?`)) {
      await deleteUserMutation.mutateAsync(userId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'user':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'user':
        return 'Người dùng';
      default:
        return role;
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Hoạt động' : 'Không hoạt động';
  };

  const roleOptions = [
    { value: '', label: 'Tất cả quyền' },
    { value: 'user', label: 'Người dùng' },
    { value: 'admin', label: 'Quản trị viên' }
  ];

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'true', label: 'Hoạt động' },
    { value: 'false', label: 'Không hoạt động' }
  ];

  return (
    <ProtectedRoute requireAuth requireAdmin>
      <Head>
        <title>Quản lý người dùng - Admin Dashboard</title>
        <meta name="description" content="Quản lý người dùng trong hệ thống" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
              <p className="text-gray-600 mt-2">
                Quản lý tất cả người dùng trong hệ thống
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
                    placeholder="Tìm kiếm người dùng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quyền hạn
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
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

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedRole('');
                    setSelectedStatus('');
                  }}
                  className="w-full btn-secondary"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Danh sách người dùng ({usersData?.total || 0})
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
                        Người dùng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thông tin liên hệ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quyền hạn
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
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
                    {usersData?.users?.map((user: User) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <FiUser className="h-6 w-6 text-primary-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {user._id.slice(-8).toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900 flex items-center">
                              <FiMail className="w-4 h-4 mr-2" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="text-sm text-gray-500 flex items-center">
                                <FiPhone className="w-4 h-4 mr-2" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                            disabled={user._id === currentUser?._id}
                            className={`text-xs font-medium px-2 py-1 rounded-full ${getRoleColor(user.role)} ${
                              user._id === currentUser?._id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {roleOptions.slice(1).map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.isActive.toString()}
                            onChange={(e) => handleUpdateStatus(user._id, e.target.value === 'true')}
                            disabled={user._id === currentUser?._id}
                            className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(user.isActive)} ${
                              user._id === currentUser?._id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {statusOptions.slice(1).map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => router.push(`/profile/${user._id}`)}
                              className="text-primary-600 hover:text-primary-900"
                              title="Xem chi tiết"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => router.push(`/admin/users/${user._id}/edit`)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Chỉnh sửa"
                            >
                              <FiEdit3 className="w-4 h-4" />
                            </button>
                            {user._id !== currentUser?._id && (
                              <button
                                onClick={() => handleDeleteUser(user._id, user.name)}
                                className="text-red-600 hover:text-red-900"
                                title="Xóa người dùng"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {(!usersData?.users || usersData.users.length === 0) && (
                  <div className="text-center py-12">
                    <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Không có người dùng</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Chưa có người dùng nào trong hệ thống.
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

export default AdminUsersPage; 