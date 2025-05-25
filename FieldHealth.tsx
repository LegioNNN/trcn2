import React from 'react';
import { useTranslation } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { Field, FieldHealth } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';

export const FieldHealthDisplay: React.FC = () => {
  const { t, currentLanguage } = useTranslation();
  
  // Fetch fields with health data
  const { data: fields, isLoading: isLoadingFields } = useQuery<Field[]>({
    queryKey: ['/api/fields'],
    staleTime: 60000,
  });
  
  // Fetch field health data
  const { data: healthData, isLoading: isLoadingHealth } = useQuery<Record<number, FieldHealth>>({
    queryKey: ['/api/fields/health'],
    staleTime: 60000,
  });

  const isLoading = isLoadingFields || isLoadingHealth;

  const formatLastUpdated = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const today = new Date();
      
      // Reset hours to compare only dates
      today.setHours(0, 0, 0, 0);
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);
      
      const isToday = dateOnly.getTime() === today.getTime();
      
      if (isToday) {
        return `${t('today')} ${format(date, 'HH:mm')}`;
      } else {
        return format(
          date, 
          'dd MMM, HH:mm', 
          { locale: currentLanguage === 'tr' ? tr : enUS }
        );
      }
    } catch (e) {
      return 'Unknown';
    }
  };

  const getHealthStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'good': 'bg-green-100 text-green-600',
      'medium': 'bg-yellow-100 text-yellow-600',
      'poor': 'bg-red-100 text-red-600',
      'default': 'bg-gray-100 text-gray-600'
    };
    
    return colorMap[status] || colorMap.default;
  };

  if (isLoading) {
    return (
      <Card className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
        <CardContent className="p-0">
          <div className="p-3 border-b border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex flex-col items-center">
                  <Skeleton className="w-12 h-12 rounded-full mb-1" />
                  <Skeleton className="h-3 w-10 mb-1" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-3">
            <div className="flex justify-between items-center mb-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-36" />
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex flex-col items-center">
                  <Skeleton className="w-12 h-12 rounded-full mb-1" />
                  <Skeleton className="h-3 w-10 mb-1" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!fields || fields.length === 0 || !healthData) {
    return (
      <Card className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
        <CardContent className="p-4 text-center">
          <span className="material-icons text-gray-400 text-3xl mb-2">eco</span>
          <p className="text-sm text-gray-500">No field health data available</p>
        </CardContent>
      </Card>
    );
  }

  // Get fields with health data
  const fieldsWithHealth = fields
    .filter(field => healthData[field.id])
    .slice(0, 2); // Show only first two fields

  if (fieldsWithHealth.length === 0) {
    return (
      <Card className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
        <CardContent className="p-4 text-center">
          <span className="material-icons text-gray-400 text-3xl mb-2">eco</span>
          <p className="text-sm text-gray-500">No field health data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="px-4 mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">{t('fieldHealth')}</h3>
      
      <Card className="bg-white rounded-lg shadow-sm overflow-hidden">
        {fieldsWithHealth.map((field, index) => {
          const health = healthData[field.id];
          
          return (
            <div key={field.id} className={index > 0 ? "p-3 border-t border-gray-100" : "p-3"}>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">{field.name}</h4>
                <span className="text-xs text-gray-500">
                  {t('lastUpdated')}: {formatLastUpdated(health.timestamp)}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                    <span className="material-icons text-blue-600">water_drop</span>
                  </div>
                  <span className="text-xs text-gray-600">{t('moisture')}</span>
                  <span className="text-sm font-medium">{health.soilMoisture}%</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-1">
                    <span className="material-icons text-yellow-600">wb_sunny</span>
                  </div>
                  <span className="text-xs text-gray-600">{t('temperature')}</span>
                  <span className="text-sm font-medium">{health.temperature}°C</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full ${getHealthStatusColor(health.plantHealth)} flex items-center justify-center mb-1`}>
                    <span className="material-icons">eco</span>
                  </div>
                  <span className="text-xs text-gray-600">{t('plantHealth')}</span>
                  <span className="text-sm font-medium">{t(health.plantHealth.toLowerCase())}</span>
                </div>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
};

export default FieldHealthDisplay;
