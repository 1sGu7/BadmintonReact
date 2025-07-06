import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiShoppingCart, FiHeart, FiStar } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

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
  discountPercentage?: number;
}

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  refetchFavorites?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid', refetchFavorites }) => {
  const { addToCart } = useCart();
  const { user, token } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!user) return setIsFavorite(false);
    axios.get('/api/products/favorites', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setIsFavorite(res.data.some((p: any) => p._id === product._id));
      });
  }, [user, product._id, token]);

  const handleFavorite = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để sử dụng tính năng yêu thích');
      return;
    }
    try {
      if (isFavorite) {
        await axios.delete(`/api/products/${product._id}/favorite`, { headers: { Authorization: `Bearer ${token}` } });
        setIsFavorite(false);
        toast.success('Đã xóa khỏi yêu thích');
      } else {
        await axios.post(`/api/products/${product._id}/favorite`, {}, { headers: { Authorization: `Bearer ${token}` } });
        setIsFavorite(true);
        toast.success('Đã thêm vào yêu thích');
      }
      if (refetchFavorites) refetchFavorites();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }

    try {
      await addToCart(product._id, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className={`card-hover group ${viewMode === 'list' ? 'flex' : ''}`}>
      <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'rounded-t-lg'}`}>
        {/* Product Image */}
        <Link href={`/products/${product._id}`}>
          <div className={`relative ${viewMode === 'list' ? 'h-32' : 'h-48'} w-full`}>
            <Image
              src={product.mainImage}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>

        {/* Discount Badge */}
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute top-2 left-2">
            <span className="badge-danger">
              -{product.discountPercentage || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button className={`p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors ${isFavorite ? 'text-red-500' : ''}`} onClick={handleFavorite}>
            <FiHeart className={`w-4 h-4 ${isFavorite ? 'fill-current text-red-500' : 'text-gray-600'}`} />
          </button>
        </div>

        {/* Add to Cart Button */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full btn-primary py-2 text-sm"
          >
            <FiShoppingCart className="w-4 h-4 mr-2" />
            {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className="mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {product.brand}
          </span>
        </div>

        <Link href={`/products/${product._id}`}>
          <h3 className={`font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors ${
            viewMode === 'list' ? 'text-lg' : 'line-clamp-2'
          }`}>
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center mr-2">
            {[...Array(5)].map((_, index) => (
              <FiStar
                key={index}
                className={`w-4 h-4 ${
                  index < Math.round(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">
            ({product.numReviews})
          </span>
        </div>

        {/* Price */}
        <div className={`flex items-center ${viewMode === 'list' ? 'justify-between' : 'justify-between'}`}>
          <div className="flex items-center space-x-2">
            <span className={`font-bold text-gray-900 ${viewMode === 'list' ? 'text-xl' : 'text-lg'}`}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          {/* Stock Status */}
          <div className="text-right">
            {product.stock > 0 ? (
              <span className="text-xs text-green-600">
                Còn {product.stock} sản phẩm
              </span>
            ) : (
              <span className="text-xs text-red-600">
                Hết hàng
              </span>
            )}
          </div>
        </div>

        {/* Category */}
        <div className="mt-2">
          <span className="badge-secondary text-xs">
            {product.category}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 