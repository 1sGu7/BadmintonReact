import React from 'react';
import Head from 'next/head';
import { useQuery } from 'react-query';
import axios from 'axios';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import ProductCard from '../components/Products/ProductCard';
import { FiArrowRight, FiStar, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';

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

const HomePage: React.FC = () => {
  // Fetch featured products
  const { data: featuredProducts, isLoading: loadingProducts } = useQuery(
    'featuredProducts',
    async () => {
      const response = await axios.get('/api/products/featured');
      return response.data;
    }
  );

  const categories = [
    { name: 'Vợt cầu lông', image: '/images/categories/rackets.jpg', href: '/products?category=vợt cầu lông' },
    { name: 'Cầu lông', image: '/images/categories/shuttles.jpg', href: '/products?category=cầu lông' },
    { name: 'Giày cầu lông', image: '/images/categories/shoes.jpg', href: '/products?category=giày cầu lông' },
    { name: 'Túi đựng vợt', image: '/images/categories/bags.jpg', href: '/products?category=túi đựng vợt' },
    { name: 'Quần áo cầu lông', image: '/images/categories/clothing.jpg', href: '/products?category=quần áo cầu lông' },
    { name: 'Phụ kiện', image: '/images/categories/accessories.jpg', href: '/products?category=phụ kiện' },
  ];

  const features = [
    {
      icon: FiTruck,
      title: 'Giao hàng miễn phí',
      description: 'Miễn phí vận chuyển cho đơn hàng từ 500k'
    },
    {
      icon: FiShield,
      title: 'Bảo hành chính hãng',
      description: 'Tất cả sản phẩm đều có bảo hành chính hãng'
    },
    {
      icon: FiRefreshCw,
      title: 'Đổi trả dễ dàng',
      description: '30 ngày đổi trả miễn phí'
    },
    {
      icon: FiStar,
      title: 'Chất lượng đảm bảo',
      description: 'Sản phẩm chất lượng cao từ các thương hiệu uy tín'
    }
  ];

  return (
    <>
      <Head>
        <title>Badminton Shop - Chuyên cung cấp linh kiện cầu lông chất lượng cao</title>
        <meta name="description" content="Badminton Shop - Chuyên cung cấp các sản phẩm cầu lông chất lượng cao từ các thương hiệu uy tín. Vợt cầu lông, cầu lông, giày cầu lông và phụ kiện." />
        <meta name="keywords" content="badminton, cầu lông, vợt cầu lông, giày cầu lông, phụ kiện cầu lông" />
      </Head>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 text-shadow-lg">
                  Chuyên cung cấp linh kiện cầu lông
                  <span className="block text-accent-400">chất lượng cao</span>
                </h1>
                <p className="text-xl mb-8 text-gray-100">
                  Khám phá bộ sưu tập đa dạng các sản phẩm cầu lông từ các thương hiệu uy tín. 
                  Từ vợt cầu lông, cầu lông, giày cầu lông đến các phụ kiện chuyên nghiệp.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="/products"
                    className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
                  >
                    Khám phá ngay
                    <FiArrowRight className="ml-2 w-5 h-5" />
                  </a>
                  <a
                    href="/about"
                    className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg font-semibold"
                  >
                    Tìm hiểu thêm
                  </a>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 rounded-lg transform rotate-3"></div>
                  <div className="relative bg-white rounded-lg p-8 transform -rotate-1">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiStar className="w-12 h-12 text-primary-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Chất lượng hàng đầu</h3>
                      <p className="text-gray-600">Sản phẩm từ các thương hiệu uy tín</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Tại sao chọn Badminton Shop?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Chúng tôi cam kết mang đến trải nghiệm mua sắm tốt nhất với các dịch vụ chất lượng cao
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Danh mục sản phẩm
              </h2>
              <p className="text-xl text-gray-600">
                Khám phá các danh mục sản phẩm đa dạng của chúng tôi
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category, index) => (
                <a
                  key={index}
                  href={category.href}
                  className="group block text-center"
                >
                  <div className="bg-gray-100 rounded-lg p-6 mb-4 group-hover:bg-primary-50 transition-colors">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-200 transition-colors">
                      <span className="text-2xl font-bold text-primary-600">B</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h3>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Sản phẩm nổi bật
              </h2>
              <p className="text-xl text-gray-600">
                Những sản phẩm được yêu thích nhất
              </p>
            </div>
            
            {loadingProducts ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts?.map((product: Product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <a
                href="/products"
                className="btn-primary px-8 py-3 text-lg font-semibold"
              >
                Xem tất cả sản phẩm
                <FiArrowRight className="ml-2 w-5 h-5" />
              </a>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Sẵn sàng nâng cao kỹ năng cầu lông?
            </h2>
            <p className="text-xl mb-8 text-primary-100">
              Khám phá bộ sưu tập đa dạng và tìm kiếm thiết bị phù hợp với bạn
            </p>
            <a
              href="/products"
              className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
            >
              Bắt đầu mua sắm
              <FiArrowRight className="ml-2 w-5 h-5" />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default HomePage; 