import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

export default function NotFound() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="text-center max-w-md">
        <div className="text-green-600 text-7xl font-bold mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('pageNotFound')}</h1>
        <p className="text-gray-600 mb-6">{t('pageNotFoundMessage')}</p>
        <Button 
          onClick={() => navigate('/')} 
          className="bg-green-600 hover:bg-green-700"
        >
          <span className="material-icons text-sm mr-1">home</span>
          {t('backToHome')}
        </Button>
      </div>
    </div>
  );
}
