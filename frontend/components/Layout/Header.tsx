import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiSearch, FiLogOut } from 'react-icons/fi';
import axios from 'axios';
import type { RefObject } from 'react';

interface Product {
  _id: string;
  name: string;
  mainImage: string;
  brand: string;
  price: number;
}

let debounceTimeout: ReturnType<typeof setTimeout>;

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    clearTimeout(debounceTimeout);
    if (value.trim().length > 0) {
      debounceTimeout = setTimeout(async () => {
        try {
          const res = await axios.get(`/api/products?keyword=${encodeURIComponent(value)}&limit=5`);
          setSearchResults(res.data.products || []);
        } catch {
          setSearchResults([]);
        }
      }, 400);
    } else {
      setSearchResults([]);
    }
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !(searchRef.current as HTMLDivElement).contains(event.target as Node)) {
        setShowSearch(false);
      }
    }
    if (showSearch) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearch]);

  const cartItemCount = cart?.totalItems || 0;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Badminton Shop</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors">
              Trang chủ
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-primary-600 transition-colors">
              Sản phẩm
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-primary-600 transition-colors">
              Giới thiệu
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-primary-600 transition-colors">
              Liên hệ
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search */}
            <button
              onClick={() => setShowSearch((v) => !v)}
              className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
            >
              <FiSearch className="w-5 h-5" />
            </button>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-500 hover:text-primary-600 transition-colors">
              <FiShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <FiUser className="w-5 h-5" />
                  <span className="hidden lg:block">{user.name}</span>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Hồ sơ
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Đơn hàng
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Quản trị
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiLogOut className="inline w-4 h-4 mr-2" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login" className="btn-secondary">
                  Đăng nhập
                </Link>
                <Link href="/register" className="btn-primary">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link
                href="/"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Trang chủ
              </Link>
              <Link
                href="/products"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Sản phẩm
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Giới thiệu
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Liên hệ
              </Link>
              
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Hồ sơ
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đơn hàng
                  </Link>
                  <Link
                    href="/cart"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Giỏ hàng ({cartItemCount})
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Quản trị
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                  >
                    <FiLogOut className="inline w-4 h-4 mr-2" />
                    Đăng xuất
                  </button>
                </>
              ) : (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div ref={searchRef} className="absolute left-0 right-0 top-16 mx-auto max-w-xl w-full z-50 bg-white border rounded-lg shadow-lg p-4">
          <div className="flex items-center border rounded px-2 mb-2">
            <FiSearch className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Tìm kiếm sản phẩm..."
              className="flex-1 py-2 outline-none"
              autoFocus
            />
          </div>
          {searchTerm && (
            <div>
              {searchResults.length > 0 ? (
                <ul>
                  {searchResults.map((product) => (
                    <li key={product._id} className="flex items-center gap-3 py-2 border-b last:border-b-0">
                      <a href={`/products/${product._id}`} className="flex items-center gap-3 w-full hover:bg-gray-50 rounded p-2">
                        <img src={product.mainImage} alt={product.name} className="w-12 h-12 object-cover rounded" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.brand}</div>
                        </div>
                        <div className="font-semibold text-primary-600 whitespace-nowrap">
                          {product.price?.toLocaleString('vi-VN')}₫
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500 text-center py-4">Không tìm thấy sản phẩm phù hợp</div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header; 