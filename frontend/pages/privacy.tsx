import React from 'react';
import Head from 'next/head';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

const PrivacyPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Chính sách bảo mật - Badminton Shop</title>
        <meta name="description" content="Chính sách bảo mật thông tin của Badminton Shop" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Chính sách bảo mật</h1>
            
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-6">
                Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Thông tin chúng tôi thu thập</h2>
                <p className="text-gray-600 mb-4">
                  Chúng tôi thu thập thông tin cá nhân khi bạn:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Đăng ký tài khoản</li>
                  <li>Đặt hàng</li>
                  <li>Liên hệ với chúng tôi</li>
                  <li>Đăng ký nhận thông báo</li>
                </ul>
                <p className="text-gray-600">
                  Thông tin thu thập bao gồm: tên, email, số điện thoại, địa chỉ giao hàng.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Cách chúng tôi sử dụng thông tin</h2>
                <p className="text-gray-600 mb-4">
                  Chúng tôi sử dụng thông tin cá nhân để:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Xử lý đơn hàng và giao hàng</li>
                  <li>Liên lạc với khách hàng</li>
                  <li>Cải thiện dịch vụ</li>
                  <li>Gửi thông tin marketing (với sự đồng ý)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Bảo mật thông tin</h2>
                <p className="text-gray-600 mb-4">
                  Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn bằng cách:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Sử dụng mã hóa SSL để bảo vệ dữ liệu</li>
                  <li>Giới hạn quyền truy cập thông tin</li>
                  <li>Thường xuyên cập nhật hệ thống bảo mật</li>
                  <li>Không chia sẻ thông tin với bên thứ ba không được phép</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Cookie và công nghệ theo dõi</h2>
                <p className="text-gray-600 mb-4">
                  Chúng tôi sử dụng cookie để:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Ghi nhớ tùy chọn của bạn</li>
                  <li>Phân tích lưu lượng truy cập</li>
                  <li>Cải thiện trải nghiệm người dùng</li>
                </ul>
                <p className="text-gray-600">
                  Bạn có thể tắt cookie trong trình duyệt, nhưng điều này có thể ảnh hưởng đến chức năng của website.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Quyền của bạn</h2>
                <p className="text-gray-600 mb-4">
                  Bạn có quyền:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Truy cập thông tin cá nhân của mình</li>
                  <li>Yêu cầu cập nhật hoặc xóa thông tin</li>
                  <li>Từ chối nhận thông tin marketing</li>
                  <li>Khiếu nại về việc xử lý dữ liệu</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Chia sẻ thông tin</h2>
                <p className="text-gray-600 mb-4">
                  Chúng tôi có thể chia sẻ thông tin với:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Đối tác giao hàng (để thực hiện giao hàng)</li>
                  <li>Nhà cung cấp dịch vụ thanh toán</li>
                  <li>Cơ quan pháp luật (khi được yêu cầu)</li>
                </ul>
                <p className="text-gray-600">
                  Chúng tôi không bán, cho thuê hoặc chia sẻ thông tin cá nhân với bên thứ ba vì mục đích thương mại.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Lưu trữ dữ liệu</h2>
                <p className="text-gray-600 mb-4">
                  Chúng tôi lưu trữ thông tin cá nhân trong thời gian cần thiết để:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Cung cấp dịch vụ cho bạn</li>
                  <li>Tuân thủ nghĩa vụ pháp lý</li>
                  <li>Giải quyết tranh chấp</li>
                  <li>Thực thi thỏa thuận</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Thay đổi chính sách</h2>
                <p className="text-gray-600 mb-4">
                  Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. 
                  Những thay đổi quan trọng sẽ được thông báo qua email hoặc thông báo trên website.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Liên hệ</h2>
                <p className="text-gray-600 mb-4">
                  Nếu bạn có câu hỏi về chính sách bảo mật này, vui lòng liên hệ với chúng tôi:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600">
                    <strong>Email:</strong> privacy@badmintonshop.com<br />
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

export default PrivacyPage; 