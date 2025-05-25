import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Field } from '@shared/schema';
import MainLayout from '@/components/MainLayout';
import { FieldsMap } from '@/components/FieldsMap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';

export default function FieldsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Fetch fields data
  const { data: fields, isLoading, error } = useQuery<Field[]>({
    queryKey: ['/api/fields'],
  });

  // Function to handle field selection for viewing details
  const handleFieldSelect = (field: Field) => {
    navigate(`/fields/${field.id}`);
  };

  // Function to create a new field
  const handleCreateField = () => {
    navigate('/fields/new');
  };

  // Show total area of all fields
  const totalArea = React.useMemo(() => {
    if (!fields) return 0;
    return fields.reduce((total, field) => {
      return total + (field.size || 0);
    }, 0);
  }, [fields]);

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

  if (error) {
    return (
      <MainLayout>
        <div className="p-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{t('errorLoadingFields')}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={t('fields')}>
      <div className="container p-4 mx-auto">
        {/* Tarlalarım Başlık ve Özet Bilgiler */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{t('myFields')}</h1>
              <p className="text-gray-600">
                {fields?.length || 0} {t('fields').toLowerCase()}, {totalArea.toFixed(1)} {t('acres')}
              </p>
            </div>
            <div className="flex gap-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-green-100 text-green-800' : 'text-gray-600'}`}
                >
                  <span className="material-icons text-sm mr-1">view_list</span>
                  {t('list')}
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1 rounded ${viewMode === 'map' ? 'bg-green-100 text-green-800' : 'text-gray-600'}`}
                >
                  <span className="material-icons text-sm mr-1">map</span>
                  {t('map')}
                </button>
              </div>
              <Button onClick={handleCreateField} className="bg-green-600 hover:bg-green-700">
                <span className="material-icons text-sm mr-1">add</span>
                {t('newField')}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Harita ve Liste Görünümü */}
        {viewMode === 'map' ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-[500px]">
              <FieldsMap showList={true} onFieldSelect={handleFieldSelect} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields && fields.length > 0 ? (
              fields.map((field) => (
                <Card key={field.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                  <div 
                    className="h-24 bg-cover bg-center" 
                    style={{ backgroundColor: field.color || '#4CAF50' }}
                  />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold">{field.name}</CardTitle>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {field.size} {field.unit || t('acres')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {field.location && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="material-icons text-gray-400 mr-1 text-sm">location_on</span>
                          <span>{field.location}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="material-icons text-gray-400 mr-1 text-sm">grass</span>
                        <span>{field.currentCropId ? 'Ekili ürün var' : 'Ekili ürün yok'}</span>
                      </div>
                      <div className="pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                          onClick={() => handleFieldSelect(field)}
                        >
                          {t('details')} →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="material-icons text-3xl text-gray-400 mb-2">grass</div>
                <h3 className="text-lg font-medium text-gray-600 mb-1">{t('noFields')}</h3>
                <p className="text-gray-500 mb-4">{t('addYourFirstField')}</p>
                <Button onClick={handleCreateField} className="bg-green-600 hover:bg-green-700">
                  <span className="material-icons text-sm mr-1">add</span>
                  {t('newField')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
