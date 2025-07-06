import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import axios from 'axios';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import { FiPackage } from 'react-icons/fi';

const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: order, isLoading, error } = useQuery(
    ['order', id],
    async () => {
      const response = await axios.get(`/api/orders/${id}`);
      return response.data;
    },
    { enabled: !!id }
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (isLoading) return <div>Đang tải...</div>;
  if (error || !order) return <div>Không tìm thấy đơn hàng</div>;

  return (
    <ProtectedRoute requireAuth>
      <Head>
        <title>Chi tiết đơn hàng #{order.orderNumber} - Badminton Shop</title>
      </Head>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold mb-4">Đơn hàng #{order.orderNumber}</h1>
          <div className="mb-4">Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
          <div className="mb-4">Trạng thái: {order.status}</div>
          <div className="mb-4">Tổng tiền: {formatPrice(order.total || order.totalPrice || order.totalAmount)}</div>
          <h2 className="text-lg font-semibold mb-2">Sản phẩm</h2>
          <ul className="mb-4">
            {(order.items || order.orderItems).map((item: any, idx: number) => (
              <li key={idx} className="mb-2 flex justify-between">
                <span>{item.product?.name || item.name} x{item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <h2 className="text-lg font-semibold mb-2">Địa chỉ giao hàng</h2>
          <div className="mb-4">
            {order.shippingAddress?.name} - {order.shippingAddress?.phone}<br />
            {order.shippingAddress?.address?.street}, {order.shippingAddress?.address?.district}, {order.shippingAddress?.address?.city}
          </div>
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  );
};

export default OrderDetailPage; 