import React from 'react';
import Head from 'next/head';
import { useQuery } from 'react-query';
import axios from 'axios';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import ProductCard from '../../components/Products/ProductCard';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import { FiHeart } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const FavoritesPage: React.FC = () => {
  const { token } = useAuth();
  const { data: favorites, isLoading, refetch } = useQuery('favorites', async () => {
    const response = await axios.get('/api/products/favorites', { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
  });

  return (
    <ProtectedRoute requireAuth>
      <Head>
        <title>Sản phẩm yêu thích - Badminton Shop</title>
        <meta name="description" content="Danh sách sản phẩm yêu thích của bạn" />
      </Head>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex items-center">
            <FiHeart className="w-6 h-6 text-red-500 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">Sản phẩm yêu thích</h1>
          </div>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : favorites && favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favorites.map((product: any) => (
                <ProductCard key={product._id} product={product} refetchFavorites={refetch} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiHeart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có sản phẩm yêu thích</h3>
              <p className="mt-1 text-sm text-gray-500">
                Hãy thêm sản phẩm vào danh sách yêu thích để dễ dàng xem lại sau này.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  );
};

export default FavoritesPage; 