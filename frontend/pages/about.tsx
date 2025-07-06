import React from 'react';
import Head from 'next/head';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { FiStar, FiTruck, FiShield, FiRefreshCw, FiUsers, FiAward } from 'react-icons/fi';

const AboutPage: React.FC = () => {
  const stats = [
    { number: '1000+', label: 'Khách hàng hài lòng' },
    { number: '500+', label: 'Sản phẩm chất lượng' },
    { number: '5+', label: 'Năm kinh nghiệm' },
    { number: '24/7', label: 'Hỗ trợ khách hàng' }
  ];

  const values = [
    {
      icon: FiStar,
      title: 'Chất lượng hàng đầu',
      description: 'Chúng tôi cam kết cung cấp những sản phẩm chất lượng cao từ các thương hiệu uy tín'
    },
    {
      icon: FiUsers,
      title: 'Khách hàng là trung tâm',
      description: 'Mọi quyết định đều hướng đến việc mang lại trải nghiệm tốt nhất cho khách hàng'
    },
    {
      icon: FiAward,
      title: 'Uy tín và minh bạch',
      description: 'Hoạt động với sự minh bạch, công bằng và đáng tin cậy'
    }
  ];

  const team = [
    {
      name: 'Nguyễn Văn A',
      position: 'Giám đốc điều hành',
      description: 'Chuyên gia với hơn 10 năm kinh nghiệm trong lĩnh vực thể thao'
    },
    {
      name: 'Trần Thị B',
      position: 'Quản lý kinh doanh',
      description: 'Chuyên gia tư vấn sản phẩm cầu lông với kiến thức sâu rộng'
    },
    {
      name: 'Lê Văn C',
      position: 'Chuyên viên kỹ thuật',
      description: 'Chuyên gia về kỹ thuật và bảo hành sản phẩm'
    }
  ];

  return (
    <>
      <Head>
        <title>Giới thiệu - Badminton Shop</title>
        <meta name="description" content="Tìm hiểu về Badminton Shop - Chuyên cung cấp linh kiện cầu lông chất lượng cao" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Về Badminton Shop
              </h1>
              <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
                Chuyên cung cấp linh kiện cầu lông chất lượng cao từ các thương hiệu uy tín hàng đầu thế giới
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Câu chuyện của chúng tôi
                </h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Badminton Shop được thành lập với mục tiêu mang đến cho người chơi cầu lông Việt Nam 
                    những sản phẩm chất lượng cao từ các thương hiệu uy tín hàng đầu thế giới.
                  </p>
                  <p>
                    Chúng tôi hiểu rằng để có được những trận đấu tốt, người chơi cần những thiết bị 
                    phù hợp và chất lượng. Vì vậy, chúng tôi luôn nỗ lực tìm kiếm và cung cấp những 
                    sản phẩm tốt nhất cho khách hàng.
                  </p>
                  <p>
                    Với đội ngũ chuyên gia giàu kinh nghiệm và tâm huyết, chúng tôi cam kết mang đến 
                    dịch vụ tư vấn chuyên nghiệp và trải nghiệm mua sắm tuyệt vời.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 rounded-lg transform rotate-3"></div>
                <div className="relative bg-white rounded-lg p-8 shadow-lg transform -rotate-1">
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
        </section>

        {/* Values Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Giá trị cốt lõi
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Những nguyên tắc và giá trị mà chúng tôi luôn tuân thủ trong mọi hoạt động
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Đội ngũ của chúng tôi
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Những con người tâm huyết đứng sau Badminton Shop
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <div key={index} className="text-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-600">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-primary-600 font-medium mb-3">
                    {member.position}
                  </p>
                  <p className="text-gray-600">
                    {member.description}
                  </p>
                </div>
              ))}
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
                Chúng tôi cam kết mang đến trải nghiệm mua sắm tốt nhất
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTruck className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Giao hàng miễn phí</h3>
                <p className="text-gray-600">Miễn phí vận chuyển cho đơn hàng từ 500k</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiShield className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Bảo hành chính hãng</h3>
                <p className="text-gray-600">Tất cả sản phẩm đều có bảo hành chính hãng</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiRefreshCw className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Đổi trả dễ dàng</h3>
                <p className="text-gray-600">30 ngày đổi trả miễn phí</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiStar className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Chất lượng đảm bảo</h3>
                <p className="text-gray-600">Sản phẩm chất lượng cao từ các thương hiệu uy tín</p>
              </div>
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
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default AboutPage; 