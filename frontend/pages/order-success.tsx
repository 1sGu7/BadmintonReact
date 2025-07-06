import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { FiCheckCircle, FiPackage, FiMail, FiArrowRight } from 'react-icons/fi';

const OrderSuccessPage: React.FC = () => {
  const router = useRouter();
  const { orderId, orderNumber } = router.query;

  return (
    <>
      <Head>
        <title>Đặt hàng thành công - Badminton Shop</title>
        <meta name="description" content="Cảm ơn bạn đã đặt hàng" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <FiCheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Đặt hàng thành công!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn sớm nhất có thể.
            </p>
            
            {orderNumber && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-center mb-4">
                  <FiPackage className="h-6 w-6 text-primary-600 mr-2" />
                  <span className="text-lg font-semibold text-gray-900">
                    Mã đơn hàng: #{orderNumber}
                  </span>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Vui lòng lưu lại mã đơn hàng này để theo dõi trạng thái đơn hàng.
                </p>
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <FiMail className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Email xác nhận đã được gửi</p>
                  <p>Chúng tôi đã gửi email xác nhận đơn hàng đến địa chỉ email của bạn.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => router.push(`/orders/${orderId}`)}
                className="w-full btn-primary flex items-center justify-center"
              >
                <FiPackage className="w-4 h-4 mr-2" />
                Xem chi tiết đơn hàng
              </button>
              
              <button
                onClick={() => router.push('/products')}
                className="w-full btn-secondary flex items-center justify-center"
              >
                <FiArrowRight className="w-4 h-4 mr-2" />
                Tiếp tục mua sắm
              </button>
            </div>

            <div className="mt-8 text-sm text-gray-500">
              <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi:</p>
              <p className="mt-2">
                <strong>Email:</strong> support@badmintonshop.com<br />
                <strong>Điện thoại:</strong> 0123 456 789
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default OrderSuccessPage; 