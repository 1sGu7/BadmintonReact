import React from 'react';
import Head from 'next/head';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useRouter } from 'next/router';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import { FiPackage } from 'react-icons/fi';

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    product: {
      name: string;
      mainImage: string;
    };
    quantity: number;
    price: number;
  }>;
}

const OrdersListPage: React.FC = () => {
  const router = useRouter();
  const { data: ordersData, isLoading } = useQuery(
    'orders',
    async () => {
      const response = await axios.get('/api/orders');
      return response.data;
    }
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <ProtectedRoute requireAuth>
      <Head>
        <title>Đơn hàng của tôi - Badminton Shop</title>
        <meta name="description" content="Xem danh sách đơn hàng của bạn" />
      </Head>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Đơn hàng của tôi</h1>
          <div className="bg-white rounded-lg shadow-sm p-6">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : ordersData && ordersData.orders && ordersData.orders.length > 0 ? (
              <div className="space-y-4">
                {ordersData.orders.map((order: Order) => (
                  <div key={order._id} className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50" onClick={() => router.push(`/orders/${order._id}`)}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Đơn hàng #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">
                          {formatPrice(order.total)}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <span className="text-gray-600">
                            {item.product.name} x{item.quantity}
                          </span>
                          <span className="ml-auto text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <FiPackage className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
                <p className="text-gray-600 mb-6">
                  Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!
                </p>
                <a
                  href="/products"
                  className="btn-primary"
                >
                  Mua sắm ngay
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  );
};

export default OrdersListPage; 