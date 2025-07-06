import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from 'react-query';
import axios from 'axios';
import Header from '../../../../components/Layout/Header';
import Footer from '../../../../components/Layout/Footer';
import { FiUpload, FiX, FiSave, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../../../contexts/AuthContext';
import toast from 'react-hot-toast';
import ProtectedRoute from '../../../../components/Auth/ProtectedRoute';

interface ProductForm {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  brand: string;
  category: string;
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
  mainImage: string;
  images: string[];
  specifications?: Record<string, string>;
}

type ProductFormError = Partial<Record<keyof ProductForm, string>>;

const AdminProductEditPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    brand: '',
    category: '',
    stock: 0,
    isFeatured: false,
    isActive: true,
    mainImage: '',
    images: [],
    specifications: {}
  });
  const [errors, setErrors] = useState<ProductFormError>({});
  const [isUploading, setIsUploading] = useState(false);

  // Fetch product data
  const { data: product, isLoading: loadingProduct } = useQuery(
    ['product', id],
    async () => {
      const response = await axios.get(`/api/products/${id}`);
      return response.data;
    },
    {
      enabled: !!id,
      onSuccess: (data) => {
        setFormData({
          name: data.name || '',
          description: data.description || '',
          price: data.price || 0,
          originalPrice: data.originalPrice || 0,
          brand: data.brand || '',
          category: data.category || '',
          stock: data.stock || 0,
          isFeatured: data.isFeatured || false,
          isActive: data.isActive !== false,
          mainImage: data.mainImage || '',
          images: data.images || [],
          specifications: data.specifications || {}
        });
      }
    }
  );

  // Update product mutation
  const updateProductMutation = useMutation(
    async (data: ProductForm) => {
      const response = await axios.put(`/api/products/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Cập nhật sản phẩm thành công!');
        router.push('/admin/products');
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật sản phẩm';
        toast.error(message);
      }
    }
  );

  const validateForm = (): boolean => {
    const newErrors: ProductFormError = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên sản phẩm là bắt buộc';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Tên sản phẩm phải có ít nhất 2 ký tự';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Tên sản phẩm không được vượt quá 100 ký tự';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả là bắt buộc';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Mô tả phải có ít nhất 10 ký tự';
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = 'Mô tả không được vượt quá 1000 ký tự';
    }

    if (typeof formData.price !== 'number' || formData.price <= 0) {
      newErrors.price = 'Giá phải lớn hơn 0';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'Thương hiệu là bắt buộc';
    }

    if (!formData.category) {
      newErrors.category = 'Danh mục là bắt buộc';
    }

    if (typeof formData.stock !== 'number' || formData.stock < 0) {
      newErrors.stock = 'Số lượng tồn kho không được âm';
    }

    if (!formData.mainImage) {
      newErrors.mainImage = 'Hình ảnh chính là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await updateProductMutation.mutateAsync(formData);
  };

  const handleInputChange = (field: keyof ProductForm, value: any) => {
    let newValue = value;
    if (field === 'price' || field === 'stock' || field === 'originalPrice') {
      newValue = Number(value);
    }
    setFormData(prev => ({ ...prev, [field]: newValue }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', files[0]);

      const response = await axios.post('/api/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = response.data.url;
      
      if (!formData.mainImage) {
        handleInputChange('mainImage', imageUrl);
      } else {
        handleInputChange('images', [...formData.images, imageUrl]);
      }

      toast.success('Tải ảnh thành công!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi tải ảnh';
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number, isMainImage: boolean = false) => {
    if (isMainImage) {
      handleInputChange('mainImage', '');
    } else {
      const newImages = formData.images.filter((_, i) => i !== index);
      handleInputChange('images', newImages);
    }
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

  if (loadingProduct) {
    return (
      <ProtectedRoute requireAuth requireAdmin>
        <Header />
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-8"></div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="space-y-4">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth requireAdmin>
      <Head>
        <title>Chỉnh sửa sản phẩm - Admin Dashboard</title>
        <meta name="description" content="Chỉnh sửa thông tin sản phẩm" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa sản phẩm</h1>
              <p className="text-gray-600 mt-2">
                Cập nhật thông tin sản phẩm
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/products')}
              className="btn-secondary flex items-center"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </button>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên sản phẩm *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Nhập tên sản phẩm"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thương hiệu *
                    </label>
                    <select
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.brand ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Chọn thương hiệu</option>
                      {brands.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                    {errors.brand && (
                      <p className="mt-1 text-sm text-red-600">{errors.brand}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Danh mục *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.category ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá bán (VNĐ) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', Number(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.price ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0"
                      min="0"
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá gốc (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => handleInputChange('originalPrice', Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số lượng tồn kho *
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => handleInputChange('stock', Number(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.stock ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0"
                      min="0"
                    />
                    {errors.stock && (
                      <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả sản phẩm *
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nhập mô tả chi tiết về sản phẩm..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Images */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Hình ảnh sản phẩm</h2>
                
                {/* Main Image */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hình ảnh chính *
                  </label>
                  {formData.mainImage ? (
                    <div className="relative inline-block">
                      <img
                        src={formData.mainImage}
                        alt="Main product"
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(0, true)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="hidden"
                        id="main-image-upload"
                      />
                      <label
                        htmlFor="main-image-upload"
                        className="cursor-pointer text-primary-600 hover:text-primary-500"
                      >
                        {isUploading ? 'Đang tải...' : 'Tải ảnh chính'}
                      </label>
                    </div>
                  )}
                  {errors.mainImage && (
                    <p className="mt-1 text-sm text-red-600">{errors.mainImage}</p>
                  )}
                </div>

                {/* Additional Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hình ảnh bổ sung
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {formData.images.length < 4 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="hidden"
                        id="additional-image-upload"
                      />
                      <label
                        htmlFor="additional-image-upload"
                        className="cursor-pointer text-primary-600 hover:text-primary-500"
                      >
                        {isUploading ? 'Đang tải...' : 'Thêm ảnh bổ sung'}
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Settings */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                      Sản phẩm nổi bật
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Sản phẩm hoạt động
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/admin/products')}
                  className="btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updateProductMutation.isLoading}
                  className="btn-primary flex items-center"
                >
                  <FiSave className="w-4 h-4 mr-2" />
                  {updateProductMutation.isLoading ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </ProtectedRoute>
  );
};

export default AdminProductEditPage; 