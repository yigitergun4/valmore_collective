'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function AboutPage(): React.JSX.Element {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen mt-10 bg-white">
      <div className="w-full mx-auto px-1 sm:px-2 lg:px-3 py-16">
        <h1 className="text-4xl font-serif font-bold text-primary-800 mb-8">{t('about.title')}</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            {t('about.description1')}
          </p>
          
          <p className="text-gray-600 mb-6">
            {t('about.description2')}
          </p>
          
          <h2 className="text-2xl font-bold text-primary-800 mt-8 mb-4">{t('about.values')}</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
            <li>{t('about.value1')}</li>
            <li>{t('about.value2')}</li>
            <li>{t('about.value3')}</li>
            <li>{t('about.value4')}</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-primary-800 mt-8 mb-4">{t('about.story')}</h2>
          <p className="text-gray-600 mb-6">
            {t('about.storyText')}
          </p>
        </div>
      </div>
    </div>
  );
}

