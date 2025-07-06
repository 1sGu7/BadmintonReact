import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useMutation } from 'react-query';
import axios from 'axios';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface ForgotPasswordForm {
  email: string;
}

const ForgotPasswordPage: React.FC = () => {
  const [formData, setFormData] = useState<ForgotPasswordForm>({
    email: ''
  });
  const [errors, setErrors] = useState<Partial<ForgotPasswordForm>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const forgotPasswordMutation = useMutation(
    async (data: ForgotPasswordForm) => {
      const response = await axios.post('/api/auth/forgot-password', data);
      return response.data;
    },
    {
      onSuccess: () => {
        setIsSubmitted(true);
        toast.success('Email đặt lại mật khẩu đã được gửi!');
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi gửi email';
        toast.error(message);
      }
    }
  );

  const validateForm = (): boolean => {
    const newErrors: Partial<ForgotPasswordForm> = {};

    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await forgotPasswordMutation.mutateAsync(formData);
  };

  const handleInputChange = (field: keyof ForgotPasswordForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (isSubmitted) {
    return (
      <>
        <Head>
          <title>Đã gửi email - Badminton Shop</title>
          <meta name="description" content="Email đặt lại mật khẩu đã được gửi" />
        </Head>

        <Header />

        <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <FiMail className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Email đã được gửi
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Chúng tôi đã gửi email đặt lại mật khẩu đến {formData.email}
              </p>
              <p className="mt-4 text-center text-sm text-gray-500">
                Vui lòng kiểm tra hộp thư và làm theo hướng dẫn trong email để đặt lại mật khẩu.
              </p>
              <div className="mt-6">
                <Link
                  href="/login"
                  className="btn-primary w-full flex items-center justify-center"
                >
                  <FiArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại đăng nhập
                </Link>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Quên mật khẩu - Badminton Shop</title>
        <meta name="description" content="Đặt lại mật khẩu của bạn" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Quên mật khẩu
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Nhập email của bạn để nhận link đặt lại mật khẩu
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`appearance-none relative block w-full px-3 py-3 pl-10 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                  placeholder="Nhập email của bạn"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={forgotPasswordMutation.isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {forgotPasswordMutation.isLoading ? 'Đang gửi...' : 'Gửi email đặt lại mật khẩu'}
              </button>
            </div>

            <div className="text-center">
              <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                <FiArrowLeft className="inline w-4 h-4 mr-1" />
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ForgotPasswordPage; 