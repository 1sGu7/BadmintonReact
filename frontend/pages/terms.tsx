import React from 'react';
import Head from 'next/head';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

const TermsPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Điều khoản sử dụng - Badminton Shop</title>
        <meta name="description" content="Điều khoản sử dụng của Badminton Shop" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Điều khoản sử dụng</h1>
            
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-6">
                Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Chấp nhận điều khoản</h2>
                <p className="text-gray-600 mb-4">
                  Bằng việc truy cập và sử dụng website Badminton Shop, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện này.
                </p>
                <p className="text-gray-600">
                  Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Sử dụng dịch vụ</h2>
                <p className="text-gray-600 mb-4">
                  Bạn có thể sử dụng website của chúng tôi để:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Xem thông tin sản phẩm</li>
                  <li>Đặt hàng trực tuyến</li>
                  <li>Liên hệ với chúng tôi</li>
                  <li>Tạo tài khoản người dùng</li>
                </ul>
                <p className="text-gray-600">
                  Bạn cam kết sử dụng dịch vụ một cách hợp pháp và không vi phạm quyền của người khác.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Tài khoản người dùng</h2>
                <p className="text-gray-600 mb-4">
                  Khi tạo tài khoản, bạn có trách nhiệm:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Cung cấp thông tin chính xác và đầy đủ</li>
                  <li>Bảo mật thông tin đăng nhập</li>
                  <li>Thông báo ngay khi phát hiện vi phạm bảo mật</li>
                  <li>Chịu trách nhiệm về mọi hoạt động trong tài khoản</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Đặt hàng và thanh toán</h2>
                <p className="text-gray-600 mb-4">
                  Khi đặt hàng, bạn đồng ý:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Cung cấp thông tin giao hàng chính xác</li>
                  <li>Thanh toán đầy đủ theo giá niêm yết</li>
                  <li>Chấp nhận các điều kiện giao hàng</li>
                  <li>Tuân thủ chính sách đổi trả</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Sở hữu trí tuệ</h2>
                <p className="text-gray-600 mb-4">
                  Tất cả nội dung trên website, bao gồm nhưng không giới hạn:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Văn bản, hình ảnh, video</li>
                  <li>Logo, thương hiệu</li>
                  <li>Thiết kế giao diện</li>
                  <li>Phần mềm và mã nguồn</li>
                </ul>
                <p className="text-gray-600">
                  Đều thuộc quyền sở hữu của Badminton Shop hoặc được cấp phép sử dụng.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Hạn chế trách nhiệm</h2>
                <p className="text-gray-600 mb-4">
                  Chúng tôi không chịu trách nhiệm về:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Thiệt hại gián tiếp hoặc ngẫu nhiên</li>
                  <li>Mất dữ liệu hoặc lỗi hệ thống</li>
                  <li>Hành vi của bên thứ ba</li>
                  <li>Thiệt hại do lỗi kỹ thuật</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Bảo mật</h2>
                <p className="text-gray-600 mb-4">
                  Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn theo chính sách bảo mật. 
                  Tuy nhiên, không có phương thức truyền tải qua internet hoặc phương thức lưu trữ điện tử nào là an toàn 100%.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Thay đổi điều khoản</h2>
                <p className="text-gray-600 mb-4">
                  Chúng tôi có quyền cập nhật các điều khoản này bất cứ lúc nào. 
                  Những thay đổi sẽ có hiệu lực ngay khi được đăng tải trên website.
                </p>
                <p className="text-gray-600">
                  Việc tiếp tục sử dụng dịch vụ sau khi thay đổi được coi là chấp nhận điều khoản mới.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Luật áp dụng</h2>
                <p className="text-gray-600 mb-4">
                  Các điều khoản này được điều chỉnh bởi luật pháp Việt Nam. 
                  Mọi tranh chấp sẽ được giải quyết tại tòa án có thẩm quyền tại Việt Nam.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Liên hệ</h2>
                <p className="text-gray-600 mb-4">
                  Nếu bạn có câu hỏi về các điều khoản này, vui lòng liên hệ với chúng tôi:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600">
                    <strong>Email:</strong> legal@badmintonshop.com<br />
                    <strong>Điện thoại:</strong> 0123 456 789<br />
                    <strong>Địa chỉ:</strong> 123 Đường ABC, Quận 1, TP.HCM
                  </p>
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

export default TermsPage; 