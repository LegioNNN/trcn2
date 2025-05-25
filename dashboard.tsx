import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Field, Task } from '@shared/schema';
import MainLayout from '@/components/MainLayout';
import { WeatherWidget } from '@/components/WeatherWidget';
import { TasksList } from '@/components/TasksList';
import { FieldHealthDisplay } from '@/components/FieldHealth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';

export default function DashboardPage() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  
  // Fetch data for dashboard
  const { data: fields } = useQuery<Field[]>({
    queryKey: ['/api/fields'],
  });
  
  const { data: tasks } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });
  
  // Count completed tasks
  const completedTasks = React.useMemo(() => {
    if (!tasks) return 0;
    return tasks.filter(task => task.completed).length;
  }, [tasks]);
  
  // Calculate total field area
  const totalArea = React.useMemo(() => {
    if (!fields) return 0;
    return fields.reduce((total, field) => total + (field.size || 0), 0);
  }, [fields]);
  
  return (
    <MainLayout title={t('dashboard')}>
      <div className="container p-4 mx-auto pb-20">
        {/* Duyuru Bandı */}
        <div className="bg-gradient-to-r from-green-700 to-green-600 p-4 rounded-lg shadow-md mb-6 text-white overflow-hidden relative">
          <div className="flex items-center space-x-3 animate-marquee">
            <div className="flex items-center px-4">
              <span className="text-2xl mr-2">⚠️</span>
              <span>Yarın sabah don bekleniyor, domates tarlasını kontrol et.</span>
            </div>
            <div className="flex items-center px-4">
              <span className="text-2xl mr-2">📌</span>
              <span>Bugün gübreleme günü (Tarla 2 - Buğday).</span>
            </div>
            <div className="flex items-center px-4">
              <span className="text-2xl mr-2">🌟</span>
              <span>Tarla 4'te ayçiçeği hasadı için ideal gün bugün!</span>
            </div>
          </div>
        </div>
        
        {/* Weather Widget */}
        <div className="mb-6">
          <WeatherWidget />
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Field Card */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">{t('myFields')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-semibold">{fields?.length || 0}</div>
                <div className="text-muted-foreground text-sm">{totalArea.toFixed(1)} {t('acres')}</div>
              </div>
              <Button 
                variant="outline" 
                className="w-full text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                onClick={() => navigate('/fields')}
              >
                {t('viewAll')} →
              </Button>
            </CardContent>
          </Card>
          
          {/* Mahsul Paneli */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">{t('products')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-3xl font-semibold mb-1">8</div>
                <div className="text-muted-foreground text-sm">{t('activeCrops')}</div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-green-700">{t('today')}: {t('watering')}</span>
                <span className="text-sm font-medium text-orange-600">{t('fertilizing')}: 3 {t('daysLater')}</span>
              </div>
              <Button 
                variant="outline" 
                className="w-full text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                onClick={() => navigate('/products')}
              >
                {t('viewAll')} →
              </Button>
            </CardContent>
          </Card>
          
          {/* Tarla Durumu */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">{t('fieldHealth')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">3 {t('healthyFields')}</span>
                <span className="text-sm text-gray-600 text-right">2 {t('needsAttention')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
              <Button 
                variant="outline" 
                className="w-full text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                onClick={() => navigate('/fields')}
              >
                {t('showOnMap')} →
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Tasks and Field Health */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Yakın Zamandaki Görevler */}
          <Card className="bg-white">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">{t('upcomingTasks')}</CardTitle>
                <div className="text-sm text-gray-500">
                  {tasks ? (
                    <span>
                      {completedTasks}/{tasks.length} {t('completed')}
                    </span>
                  ) : null}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <TasksList limit={5} showViewAll={true} />
            </CardContent>
          </Card>
          
          {/* Tarla Sağlık Durumu */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{t('fieldHealth')}</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldHealthDisplay />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
