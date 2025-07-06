import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useQueryClient } from 'react-query';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    district?: string;
    zipCode?: string;
  };
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  loading: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    district?: string;
    zipCode?: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Check if user is authenticated on mount and initialize axios defaults
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // Set token first
          setToken(storedToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Then fetch user profile
          const response = await axios.get('/api/auth/profile');
          setUser(response.data);
        } catch (error: any) {
          console.error('Auth check failed:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          delete axios.defaults.headers.common['Authorization'];
          // Thông báo lỗi xác thực
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []); // Remove token dependency to avoid infinite loop

  // Set axios Authorization header when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { token: newToken, ...userInfo } = response.data;
      
      setToken(newToken);
      setUser(userInfo);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    queryClient.clear();
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await axios.put('/api/auth/profile', data);
      setUser(response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    updateProfile,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 