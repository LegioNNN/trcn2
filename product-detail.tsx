import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { Crop, Field } from '@shared/schema';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/lib/i18n';

export default function ProductDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  
  // Fetch crop data
  const { data: crop, isLoading: isLoadingCrop, isError: isErrorCrop } = useQuery<Crop>({
    queryKey: [`/api/crops/${id}`],
    enabled: !!id,
  });
  
  // Fetch fields with this crop
  const { data: allFields } = useQuery<Field[]>({
    queryKey: ['/api/fields'],
  });
  
  // Filter fields that have this crop
  const fieldsWithCrop = React.useMemo(() => {
    if (!allFields || !crop) return [];
    return allFields.filter(field => field.currentCropId === crop.id);
  }, [allFields, crop]);
  
  const handleEditCrop = () => {
    navigate(`/products/${id}/edit`);
  };
  
  const handleFieldClick = (fieldId: number) => {
    navigate(`/fields/${fieldId}`);
  };
  
  // Loading state
  if (isLoadingCrop) {
    return (
      <MainLayout>
        <div className="px-4 py-4 pb-20">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={() => navigate('/products')}
            >
              <span className="material-icons">arrow_back</span>
            </Button>
            <Skeleton className="h-8 w-40" />
          </div>
          
          <Skeleton className="h-44 w-full mb-4 rounded-lg" />
          
          <div className="grid grid-cols-1 gap-6">
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
          </div>
        </div>
      </MainLayout>
    );
  }
  
  // Error state
  if (isErrorCrop || !crop) {
    return (
      <MainLayout>
        <div className="px-4 py-4 pb-20 text-center">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={() => navigate('/products')}
            >
              <span className="material-icons">arrow_back</span>
            </Button>
            <h2 className="text-xl font-semibold">{t('cropDetails')}</h2>
          </div>
          
          <div className="py-12">
            <span className="material-icons text-accent text-4xl mb-2">error_outline</span>
            <p className="text-gray-500 mb-4">{t('failedToLoadCropData')}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="mx-auto"
            >
              <span className="material-icons text-sm mr-2">refresh</span>
              {t('retry')}
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="px-4 py-4 pb-20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={() => navigate('/products')}
            >
              <span className="material-icons">arrow_back</span>
            </Button>
            <h2 className="text-xl font-semibold">{crop.name}</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditCrop}
          >
            <span className="material-icons text-sm mr-1">edit</span>
            {t('edit')}
          </Button>
        </div>
        
        {/* Ürün Resmi ve Genel Bilgiler */}
        <Card className="mb-6">
          <div className="relative">
            {crop.imageUrl ? (
              <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${crop.imageUrl})` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
            ) : (
              <div className="h-48 bg-green-600 flex items-center justify-center text-white">
                <span className="material-icons text-6xl">grass</span>
              </div>
            )}
            
            <div className="p-4">
              <h1 className="text-2xl font-bold mb-2">
                <span className="inline-block mr-2">🌾</span>
                {crop.name} {t('details')}
              </h1>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                <h3 className="font-medium text-gray-700 mb-2">{t('generalInfo')}</h3>
                <p className="text-gray-600">{crop.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">{t('plantingSeason')}</h4>
                    <p>{crop.plantingSeason || t('notSpecified')}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">{t('harvestSeason')}</h4>
                    <p>{crop.harvestSeason || t('notSpecified')}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">{t('growingPeriod')}</h4>
                    <p>{crop.growingPeriod} {t('days')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Ekili Olduğu Tarlalar */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>
              <span className="inline-block mr-2">📍</span>
              {t('plantedFields')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fieldsWithCrop.length > 0 ? (
              <div className="space-y-3">
                {fieldsWithCrop.map(field => (
                  <div 
                    key={field.id} 
                    className="p-3 border rounded-lg cursor-pointer hover:border-green-300 transition-colors"
                    onClick={() => handleFieldClick(field.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: field.color || '#4CAF50' }}
                        />
                        <h3 className="font-medium">{field.name}</h3>
                      </div>
                      <Badge variant="outline">
                        {field.size} {field.unit}
                      </Badge>
                    </div>
                    <div className="mt-1 text-sm text-gray-500 flex items-center">
                      <span className="material-icons text-xs mr-1">place</span>
                      {field.location || t('locationNotSpecified')}
                      
                      <div className="ml-auto flex items-center">
                        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100">
                          {t('healthy')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <div className="material-icons text-3xl text-gray-400 mb-2">public_off</div>
                <p className="text-gray-500">{t('noPlantsInFields')}</p>
                <p className="text-sm text-gray-400">{t('assignCropToFields')}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Tarcan Tüyoları */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>
              <span className="inline-block mr-2">💡</span>
              {t('tarcanTips')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg bg-blue-50 border-blue-200">
                <h3 className="font-medium text-blue-700 mb-1">{t('beforePlanting')}</h3>
                <p className="text-sm text-blue-600">
                  {t('soilAnalysisTip')}
                </p>
              </div>
              
              <div className="p-3 border rounded-lg bg-green-50 border-green-200">
                <h3 className="font-medium text-green-700 mb-1">{t('duringGrowth')}</h3>
                <p className="text-sm text-green-600">
                  {t('fertilizerTip')}
                </p>
              </div>
              
              <div className="p-3 border rounded-lg bg-amber-50 border-amber-200">
                <h3 className="font-medium text-amber-700 mb-1">{t('harvestAndStorage')}</h3>
                <p className="text-sm text-amber-600">
                  {t('harvestTip')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* İdeal Yetişme Koşulları */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>
              <span className="inline-block mr-2">🌡️</span>
              {t('idealGrowingConditions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center mb-2">
                  <span className="material-icons text-blue-600 mr-2">device_thermostat</span>
                  <h3 className="font-medium">{t('idealTemperature')}</h3>
                </div>
                <p className="text-center font-semibold text-lg text-blue-700">
                  {crop.optimalTemperature ? (
                    `${JSON.parse(crop.optimalTemperature.toString()).min}°C - ${JSON.parse(crop.optimalTemperature.toString()).max}°C`
                  ) : (
                    '15°C - 25°C'
                  )}
                </p>
              </div>
              
              <div className="p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center mb-2">
                  <span className="material-icons text-blue-600 mr-2">water_drop</span>
                  <h3 className="font-medium">{t('idealHumidity')}</h3>
                </div>
                <p className="text-center font-semibold text-lg text-blue-700">
                  {crop.optimalHumidity ? (
                    `${JSON.parse(crop.optimalHumidity.toString()).min}% - ${JSON.parse(crop.optimalHumidity.toString()).max}%`
                  ) : (
                    '50% - 70%'
                  )}
                </p>
              </div>
              
              <div className="p-3 border rounded-lg bg-gray-50 col-span-2">
                <div className="flex items-center mb-2">
                  <span className="material-icons text-blue-600 mr-2">landscape</span>
                  <h3 className="font-medium">{t('soilPreference')}</h3>
                </div>
                <p className="text-center text-gray-600">
                  {t('clayLoamyWellDrained')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
