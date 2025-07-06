import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    mainImage: string;
    stock: number;
  };
  quantity: number;
  price: number;
  selectedOptions?: {
    size?: string;
    color?: string;
    weight?: string;
  };
}

interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (productId: string, quantity: number, options?: any) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();

  const fetchCart = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await axios.get('/api/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [user, token]);

  const addToCart = async (productId: string, quantity: number, options?: any) => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/cart', {
        productId,
        quantity,
        selectedOptions: options
      });
      setCart(response.data);
      toast.success('Đã thêm vào giỏ hàng');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi thêm vào giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await axios.put(`/api/cart/${itemId}`, { quantity });
      setCart(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi cập nhật giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await axios.delete(`/api/cart/${itemId}`);
      setCart(response.data);
      toast.success('Đã xóa khỏi giỏ hàng');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi xóa khỏi giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!token) return;

    try {
      setLoading(true);
      await axios.delete('/api/cart');
      setCart(null);
      toast.success('Đã làm trống giỏ hàng');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi làm trống giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = async () => {
    await fetchCart();
  };

  const value: CartContextType = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 