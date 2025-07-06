import React, { useState } from 'react';
import Head from 'next/head';
import { useMutation } from 'react-query';
import axios from 'axios';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const contactMutation = useMutation(
    async (data: ContactForm) => {
      const response = await axios.post('/api/contact', data);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Gửi tin nhắn thành công! Chúng tôi sẽ liên hệ lại sớm nhất.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      },
      onError: () => {
        toast.error('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.');
      }
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await contactMutation.mutateAsync(formData);
  };

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const contactInfo = [
    {
      icon: FiMapPin,
      title: 'Địa chỉ',
      content: '123 Đường ABC, Quận 1, TP.HCM',
      description: 'Trụ sở chính của chúng tôi'
    },
    {
      icon: FiPhone,
      title: 'Điện thoại',
      content: '0123 456 789',
      description: 'Hỗ trợ 24/7'
    },
    {
      icon: FiMail,
      title: 'Email',
      content: 'info@badmintonshop.com',
      description: 'Liên hệ qua email'
    },
    {
      icon: FiClock,
      title: 'Giờ làm việc',
      content: '8:00 - 22:00',
      description: 'Thứ 2 - Chủ nhật'
    }
  ];

  return (
    <>
      <Head>
        <title>Liên hệ - Badminton Shop</title>
        <meta name="description" content="Liên hệ với Badminton Shop - Chúng tôi luôn sẵn sàng hỗ trợ bạn" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Liên hệ với chúng tôi
              </h1>
              <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
                Chúng tôi luôn sẵn sàng hỗ trợ và tư vấn cho bạn
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Gửi tin nhắn cho chúng tôi</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Nhập họ và tên của bạn"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Nhập email của bạn"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Chủ đề *
                      </label>
                      <select
                        id="subject"
                        required
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Chọn chủ đề</option>
                        <option value="tư vấn sản phẩm">Tư vấn sản phẩm</option>
                        <option value="đặt hàng">Đặt hàng</option>
                        <option value="bảo hành">Bảo hành</option>
                        <option value="khiếu nại">Khiếu nại</option>
                        <option value="hợp tác">Hợp tác</option>
                        <option value="khác">Khác</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Nội dung tin nhắn *
                    </label>
                    <textarea
                      id="message"
                      rows={6}
                      required
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Nhập nội dung tin nhắn của bạn..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={contactMutation.isLoading}
                    className="w-full btn-primary py-3 text-lg font-semibold flex items-center justify-center"
                  >
                    {contactMutation.isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang gửi...
                      </div>
                    ) : (
                      <>
                        <FiSend className="w-5 h-5 mr-2" />
                        Gửi tin nhắn
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin liên hệ</h2>
                
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <info.icon className="w-6 h-6 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {info.title}
                        </h3>
                        <p className="text-gray-900 font-medium">
                          {info.content}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Map Placeholder */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Vị trí của chúng tôi</h3>
                  <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center">
                      <FiMapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Bản đồ sẽ được hiển thị ở đây</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Câu hỏi thường gặp</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Làm thế nào để đặt hàng?
                  </h3>
                  <p className="text-gray-600">
                    Bạn có thể đặt hàng trực tuyến qua website hoặc liên hệ với chúng tôi qua điện thoại, email.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Thời gian giao hàng là bao lâu?
                  </h3>
                  <p className="text-gray-600">
                    Thời gian giao hàng từ 1-3 ngày làm việc tùy thuộc vào địa điểm giao hàng.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Chính sách đổi trả như thế nào?
                  </h3>
                  <p className="text-gray-600">
                    Chúng tôi chấp nhận đổi trả trong vòng 30 ngày kể từ ngày nhận hàng với điều kiện sản phẩm còn nguyên vẹn.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Có hỗ trợ bảo hành không?
                  </h3>
                  <p className="text-gray-600">
                    Tất cả sản phẩm đều có bảo hành chính hãng theo chính sách của nhà sản xuất.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ContactPage; 