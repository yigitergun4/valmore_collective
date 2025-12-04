'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ContactPage(): React.JSX.Element {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    message: string;
  }>({
    name: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    // In a real application, this would send the form data to a server
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-10">
      <div className="w-full mx-auto px-1 sm:px-2 lg:px-3 py-16">
        <h1 className="text-4xl font-serif font-bold text-primary-800 mb-8">{t('contact.title')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <p className="text-gray-600 mb-8">
              {t('contact.description')}
            </p>

            <div className="space-y-6">
              <div className="flex items-start">
                <Mail className="w-6 h-6 text-primary-700 mr-4 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t('contact.email')}</h3>
                  <a href="mailto:info@valmorecollective.com" className="text-gray-600 hover:text-primary-600">
                    info@valmorecollective.com
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="w-6 h-6 text-primary-700 mr-4 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t('contact.phone')}</h3>
                  <a href="tel:+905551234567" className="text-gray-600 hover:text-primary-600">
                    +90 (555) 123-45-67
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="w-6 h-6 text-primary-700 mr-4 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t('contact.address')}</h3>
                  <p className="text-gray-600">
                    Moda Caddesi No: 123
                    <br />
                    Şişli, İstanbul 34394
                    <br />
                    Türkiye
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.name')} *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.email')} *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.message')} *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                {submitted ? t('contact.sent') : t('contact.send')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

