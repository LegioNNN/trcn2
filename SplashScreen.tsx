import React from 'react';
import { Logo } from './Logo';
import { useTranslation } from '@/lib/i18n';

export const SplashScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white bg-pattern">
      <div className="flex flex-col items-center animate__animated animate__fadeIn">
        <Logo size="large" />
        <p className="text-lg text-gray-600 mt-2 text-center">
          {t('welcome')}
        </p>
      </div>
      <div className="mt-12 flex items-center justify-center">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
