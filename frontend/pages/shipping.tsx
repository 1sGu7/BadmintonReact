import React from 'react';
import Head from 'next/head';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { FiTruck, FiMapPin, FiClock, FiPackage } from 'react-icons/fi';

const ShippingPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Chính sách vận chuyển - Badminton Shop</title>
        <meta name="description" content="Chính sách vận chuyển và giao hàng của Badminton Shop" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Chính sách vận chuyển</h1>
            
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-6">
                Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FiTruck className="w-6 h-6 mr-2 text-primary-600" />
                  Phạm vi giao hàng
                </h2>
                <p className="text-gray-600 mb-4">
                  Chúng tôi cung cấp dịch vụ giao hàng trên toàn quốc với các khu vực chính:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>TP.HCM và các tỉnh lân cận</li>
                  <li>Hà Nội và các tỉnh miền Bắc</li>
                  <li>Đà Nẵng và các tỉnh miền Trung</li>
                  <li>Các tỉnh miền Nam</li>
                  <li>Các đảo lớn (Phú Quốc, Côn Đảo, v.v.)</li>
                </ul>
                <p className="text-gray-600">
                  Đối với các khu vực xa xôi, thời gian giao hàng có thể kéo dài hơn.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FiClock className="w-6 h-6 mr-2 text-primary-600" />
                  Thời gian giao hàng
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Giao hàng nhanh</h3>
                    <p className="text-gray-600 text-sm">
                      <strong>Thời gian:</strong> 1-2 ngày làm việc<br />
                      <strong>Phạm vi:</strong> TP.HCM, Hà Nội, Đà Nẵng<br />
                      <strong>Phí:</strong> 30.000đ - 50.000đ
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Giao hàng tiêu chuẩn</h3>
                    <p className="text-gray-600 text-sm">
                      <strong>Thời gian:</strong> 3-5 ngày làm việc<br />
                      <strong>Phạm vi:</strong> Toàn quốc<br />
                      <strong>Phí:</strong> 20.000đ - 40.000đ
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FiPackage className="w-6 h-6 mr-2 text-primary-600" />
                  Phí vận chuyển
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b">
                          Khu vực
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b">
                          Thời gian
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b">
                          Phí vận chuyển
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b">
                          Miễn phí từ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-600 border-b">TP.HCM</td>
                        <td className="px-4 py-2 text-sm text-gray-600 border-b">1-2 ngày</td>
                        <td className="px-4 py-2 text-sm text-gray-600 border-b">30.000đ</td>
                        <td className="px-4 py-2 text-sm text-gray-600 border-b">500.000đ</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-600 border-b">Hà Nội, Đà Nẵng</td>
                        <td className="px-4 py-2 text-sm text-gray-600 border-b">2-3 ngày</td>
                        <td className="px-4 py-2 text-sm text-gray-600 border-b">40.000đ</td>
                        <td className="px-4 py-2 text-sm text-gray-600 border-b">800.000đ</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-600 border-b">Các tỉnh khác</td>
                        <td className="px-4 py-2 text-sm text-gray-600 border-b">3-5 ngày</td>
                        <td className="px-4 py-2 text-sm text-gray-600 border-b">50.000đ</td>
                        <td className="px-4 py-2 text-sm text-gray-600 border-b">1.000.000đ</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quy trình giao hàng</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Xác nhận đơn hàng</h3>
                      <p className="text-gray-600">Chúng tôi sẽ xác nhận đơn hàng trong vòng 2 giờ làm việc.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Chuẩn bị hàng</h3>
                      <p className="text-gray-600">Kiểm tra và đóng gói sản phẩm cẩn thận.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Giao hàng</h3>
                      <p className="text-gray-600">Đối tác vận chuyển sẽ giao hàng đến địa chỉ của bạn.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Xác nhận nhận hàng</h3>
                      <p className="text-gray-600">Kiểm tra và ký nhận hàng hóa.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Lưu ý khi giao hàng</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Vui lòng cung cấp địa chỉ giao hàng chính xác và đầy đủ</li>
                    <li>Người nhận hàng phải có mặt tại địa chỉ giao hàng</li>
                    <li>Kiểm tra hàng hóa trước khi ký nhận</li>
                    <li>Thời gian giao hàng có thể thay đổi do thời tiết hoặc lý do khách quan</li>
                    <li>Đối với đơn hàng có giá trị cao, vui lòng chuẩn bị giấy tờ tùy thân</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Theo dõi đơn hàng</h2>
                <p className="text-gray-600 mb-4">
                  Bạn có thể theo dõi trạng thái đơn hàng bằng cách:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Đăng nhập vào tài khoản và vào mục "Đơn hàng"</li>
                  <li>Nhập mã đơn hàng trên website</li>
                  <li>Liên hệ với chúng tôi qua hotline hoặc email</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Liên hệ hỗ trợ</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-2">
                    Nếu bạn có thắc mắc về vận chuyển, vui lòng liên hệ với chúng tôi:
                  </p>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Hotline:</strong> 0123 456 789</p>
                    <p><strong>Email:</strong> shipping@badmintonshop.com</p>
                    <p><strong>Giờ làm việc:</strong> 8:00 - 22:00 (Thứ 2 - Chủ nhật)</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ShippingPage; 