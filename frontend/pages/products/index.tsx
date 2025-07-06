import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import ProductCard from '../../components/Products/ProductCard';
import { FiFilter, FiSearch, FiGrid, FiList, FiChevronDown, FiHeart } from 'react-icons/fi';
import Link from 'next/link';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';

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
}

interface FilterState {
  category: string;
  brand: string;
  priceRange: string;
  sortBy: string;
  search: string;
}

const ProductsPage: React.FC = () => {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    brand: '',
    priceRange: '',
    sortBy: 'newest',
    search: ''
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Get query parameters from URL
  useEffect(() => {
    const { category, brand, priceRange, sortBy, search, page } = router.query;
    setFilters({
      category: (category as string) || '',
      brand: (brand as string) || '',
      priceRange: (priceRange as string) || '',
      sortBy: (sortBy as string) || 'newest',
      search: (search as string) || ''
    });
    setCurrentPage(parseInt(page as string) || 1);
  }, [router.query]);

  // Update URL when filters change
  const updateURL = (newFilters: Partial<FilterState>, page: number = 1) => {
    const params = new URLSearchParams();
    Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    if (page > 1) params.append('page', page.toString());
    
    router.push(`/products?${params.toString()}`, undefined, { shallow: true });
  };

  // Fetch products
  const { data: productsData, isLoading } = useQuery(
    ['products', filters, currentPage],
    async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (key === 'search' && value) {
          params.append('keyword', value); // Đổi search thành keyword
        } else if (key !== 'search' && value) {
          params.append(key, value);
        }
      });
      params.append('page', currentPage.toString());
      params.append('limit', '12');
      
      const response = await axios.get(`/api/products?${params.toString()}`);
      return response.data;
    },
    {
      keepPreviousData: true
    }
  );

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL(newFilters);
    setCurrentPage(1);
  };

  const handleSearch = (searchTerm: string) => {
    const newFilters = { ...filters, search: searchTerm };
    setFilters(newFilters);
    updateURL(newFilters);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    const newFilters = {
      category: '',
      brand: '',
      priceRange: '',
      sortBy: 'newest',
      search: ''
    };
    setFilters(newFilters);
    updateURL(newFilters);
    setCurrentPage(1);
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

  const priceRanges = [
    { label: 'Dưới 500k', value: '0-500000' },
    { label: '500k - 1 triệu', value: '500000-1000000' },
    { label: '1 triệu - 2 triệu', value: '1000000-2000000' },
    { label: 'Trên 2 triệu', value: '2000000-9999999' }
  ];

  const sortOptions = [
    { label: 'Mới nhất', value: 'newest' },
    { label: 'Cũ nhất', value: 'oldest' },
    { label: 'Giá tăng dần', value: 'price-asc' },
    { label: 'Giá giảm dần', value: 'price-desc' },
    { label: 'Đánh giá cao nhất', value: 'rating-desc' },
    { label: 'Bán chạy nhất', value: 'popular' }
  ];

  return (
    <>
      <Head>
        <title>Sản phẩm - Badminton Shop</title>
        <meta name="description" content="Khám phá bộ sưu tập đa dạng các sản phẩm cầu lông chất lượng cao" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Sản phẩm</h1>
              <p className="text-gray-600">
                Khám phá bộ sưu tập đa dạng các sản phẩm cầu lông chất lượng cao
              </p>
            </div>
            <Link href="/products/favorites" className="btn-secondary">
              <FiHeart className="inline mr-2" /> Yêu thích
            </Link>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-64">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Bộ lọc</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Xóa tất cả
                  </button>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Danh mục</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category}
                          checked={filters.category === category}
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                          className="mr-2 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brand Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Thương hiệu</h4>
                  <div className="space-y-2">
                    {brands.map((brand) => (
                      <label key={brand} className="flex items-center">
                        <input
                          type="radio"
                          name="brand"
                          value={brand}
                          checked={filters.brand === brand}
                          onChange={(e) => handleFilterChange('brand', e.target.value)}
                          className="mr-2 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Khoảng giá</h4>
                  <div className="space-y-2">
                    {priceRanges.map((range) => (
                      <label key={range.value} className="flex items-center">
                        <input
                          type="radio"
                          name="priceRange"
                          value={range.value}
                          checked={filters.priceRange === range.value}
                          onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                          className="mr-2 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Sắp xếp</h4>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-gray-600">
                  Hiển thị {productsData?.products?.length || 0} sản phẩm
                  {productsData?.total && ` trong tổng số ${productsData.total} sản phẩm`}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <FiGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <FiList className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Products */}
              {isLoading ? (
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {[...Array(12)].map((_, index) => (
                    <div key={index} className="card animate-pulse">
                      <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                      <div className="p-4">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : productsData?.products?.length > 0 ? (
                <>
                  <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {productsData.products.map((product: Product) => (
                      <ProductCard key={product._id} product={product} viewMode={viewMode} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {productsData.totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <nav className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const newPage = currentPage - 1;
                            setCurrentPage(newPage);
                            updateURL(filters, newPage);
                          }}
                          disabled={currentPage === 1}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Trước
                        </button>
                        
                        {[...Array(productsData.totalPages)].map((_, index) => {
                          const page = index + 1;
                          const isActive = page === currentPage;
                          return (
                            <button
                              key={page}
                              onClick={() => {
                                setCurrentPage(page);
                                updateURL(filters, page);
                              }}
                              className={`px-3 py-2 text-sm border rounded-md ${
                                isActive
                                  ? 'bg-primary-600 text-white border-primary-600'
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => {
                            const newPage = currentPage + 1;
                            setCurrentPage(newPage);
                            updateURL(filters, newPage);
                          }}
                          disabled={currentPage === productsData.totalPages}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Sau
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <FiSearch className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
                  <p className="text-gray-600 mb-6">
                    Không có sản phẩm nào phù hợp với bộ lọc của bạn
                  </p>
                  <button
                    onClick={clearFilters}
                    className="btn-primary"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ProductsPage; 