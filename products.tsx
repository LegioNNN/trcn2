import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Crop } from '@shared/schema';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';

export default function ProductsPage() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  
  // Fetch crops data
  const { data: crops, isLoading, error } = useQuery<Crop[]>({
    queryKey: ['/api/crops'],
  });
  
  const handleAddProduct = () => {
    navigate('/products/new');
  };
  
  const handleProductSelect = (crop: Crop) => {
    navigate(`/products/${crop.id}`);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          <span className="ml-3 text-green-600">{t('loading')}</span>
        </div>
      </MainLayout>
    );
  }
  
  // Error state
  if (error) {
    return (
      <MainLayout>
        <div className="p-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{t('errorLoadingProducts')}</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout title={t('products')}>
      <div className="container p-4 mx-auto">
        {/* Ürünlerim Başlık ve Özet Bilgiler */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{t('myProducts')}</h1>
              <p className="text-gray-600">
                {crops?.length || 0} {t('differentCrops')}
              </p>
            </div>
            <Button onClick={handleAddProduct} className="bg-green-600 hover:bg-green-700">
              <span className="material-icons text-sm mr-1">add</span>
              {t('newProduct')}
            </Button>
          </div>
        </div>
        
        {/* Ürünler Listesi */}
        {crops && crops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {crops.map((crop) => (
              <Card 
                key={crop.id} 
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleProductSelect(crop)}
              >
                <div 
                  className="h-40 bg-cover bg-center" 
                  style={{ 
                    backgroundImage: crop.imageUrl ? `url(${crop.imageUrl})` : undefined,
                    backgroundColor: !crop.imageUrl ? '#4CAF50' : undefined 
                  }}
                >
                  {!crop.imageUrl && (
                    <div className="flex items-center justify-center h-full text-white">
                      <span className="material-icons text-5xl">grass</span>
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold">{crop.name}</CardTitle>
                    {crop.growingPeriod && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {crop.growingPeriod} {t('days')}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {crop.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{crop.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {crop.plantingSeason && (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                          <span className="material-icons text-xs mr-1">spa</span>
                          {crop.plantingSeason}
                        </Badge>
                      )}
                      {crop.harvestSeason && (
                        <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-100">
                          <span className="material-icons text-xs mr-1">agriculture</span>
                          {crop.harvestSeason}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <div className="material-icons text-3xl text-gray-400 mb-2">grass</div>
            <h3 className="text-lg font-medium text-gray-600 mb-1">{t('noProducts')}</h3>
            <p className="text-gray-500 mb-4">{t('addYourFirstProduct')}</p>
            <Button onClick={handleAddProduct} className="bg-green-600 hover:bg-green-700">
              <span className="material-icons text-sm mr-1">add</span>
              {t('newProduct')}
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
