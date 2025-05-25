import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/lib/i18n';
import { Field, Crop, Task, HarvestRecord } from '@shared/schema';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  ComposedChart,
  Area
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ReportsPage() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedTab, setSelectedTab] = useState('production');
  
  // Fetch fields data
  const { data: fields, isLoading: fieldsLoading } = useQuery<Field[]>({
    queryKey: ['/api/fields'],
  });
  
  // Fetch crops data
  const { data: crops, isLoading: cropsLoading } = useQuery<Crop[]>({
    queryKey: ['/api/crops'],
  });
  
  // Fetch tasks data
  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });
  
  // Calculate field area stats
  const fieldStats = React.useMemo(() => {
    if (!fields) return { totalArea: 0, activeFields: 0 };
    
    const activeFields = fields.length;
    const totalArea = fields.reduce((sum, field) => sum + (field.size || 0), 0);
    
    return {
      totalArea,
      activeFields
    };
  }, [fields]);
  
  // Calculate crops stats
  const cropStats = React.useMemo(() => {
    if (!crops) return { totalCrops: 0 };
    
    return {
      totalCrops: crops.length
    };
  }, [crops]);
  
  // Calculate tasks stats
  const taskStats = React.useMemo(() => {
    if (!tasks) return { totalTasks: 0, completedTasks: 0, pendingTasks: 0 };
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    
    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  }, [tasks]);
  
  // Field size by type data (MockData) - Bu kısım gerçek veri ile değiştirilmeli
  const fieldProductionData = [
    { name: t('wheat'), value: 42 },
    { name: t('barley'), value: 28 },
    { name: t('corn'), value: 15 },
    { name: t('sunflower'), value: 10 },
    { name: t('other'), value: 5 },
  ];
  
  // Efficiency data (MockData) - Bu kısım gerçek veri ile değiştirilmeli
  const fieldEfficiencyData = [
    { name: t('highYield'), value: 35 },
    { name: t('mediumYield'), value: 45 },
    { name: t('lowYield'), value: 20 },
  ];
  
  // Financial data (MockData) - Bu kısım gerçek veri ile değiştirilmeli
  const financialData = [
    { name: t('income'), value: 85000 },
    { name: t('expenses'), value: 45000 },
    { name: t('profit'), value: 40000 },
  ];
  
  // Render loading state
  if (fieldsLoading || cropsLoading || tasksLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          <span className="ml-3 text-green-600">{t('loading')}</span>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout title={t('reports')}>
      <div className="container p-4 mx-auto pb-20">
        {/* Raporlar Başlık ve Periyot Seçimi */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{t('reports')}</h1>
              <p className="text-gray-600">{t('reportsDescription')}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex">
              <button
                onClick={() => setPeriod('day')}
                className={`px-3 py-1 rounded text-sm ${period === 'day' ? 'bg-green-100 text-green-800' : 'text-gray-600'}`}
              >
                {t('day')}
              </button>
              <button
                onClick={() => setPeriod('week')}
                className={`px-3 py-1 rounded text-sm ${period === 'week' ? 'bg-green-100 text-green-800' : 'text-gray-600'}`}
              >
                {t('week')}
              </button>
              <button
                onClick={() => setPeriod('month')}
                className={`px-3 py-1 rounded text-sm ${period === 'month' ? 'bg-green-100 text-green-800' : 'text-gray-600'}`}
              >
                {t('month')}
              </button>
              <button
                onClick={() => setPeriod('quarter')}
                className={`px-3 py-1 rounded text-sm ${period === 'quarter' ? 'bg-green-100 text-green-800' : 'text-gray-600'}`}
              >
                {t('quarter')}
              </button>
              <button
                onClick={() => setPeriod('year')}
                className={`px-3 py-1 rounded text-sm ${period === 'year' ? 'bg-green-100 text-green-800' : 'text-gray-600'}`}
              >
                {t('year')}
              </button>
            </div>
          </div>
        </div>
        
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">{t('activeFields')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{fieldStats.activeFields}</div>
                  <div className="text-sm text-gray-500">
                    {fieldStats.totalArea} {t('hectares')}
                  </div>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <span className="material-icons text-green-600">landscape</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">{t('activeCrops')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{cropStats.totalCrops}</div>
                  <div className="text-sm text-gray-500">{t('differentCrops')}</div>
                </div>
                <div className="p-2 bg-amber-100 rounded-full">
                  <span className="material-icons text-amber-600">grass</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">{t('taskCompletion')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{taskStats.completionRate}%</div>
                  <div className="text-sm text-gray-500">
                    {taskStats.completedTasks}/{taskStats.totalTasks} {t('tasks').toLowerCase()}
                  </div>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <span className="material-icons text-blue-600">assignment_turned_in</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs ve Grafik Alanları */}
        <Tabs defaultValue="production" onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="production">{t('production')}</TabsTrigger>
            <TabsTrigger value="efficiency">{t('efficiency')}</TabsTrigger>
            <TabsTrigger value="financial">{t('financial')}</TabsTrigger>
            <TabsTrigger value="planning">{t('planning')}</TabsTrigger>
          </TabsList>
          
          {/* Üretim Raporu */}
          <TabsContent value="production">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{t('fieldProduction')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      {fields && fields.length > 0 ? (
                        <div className="w-full h-full">
                          <div className="text-center mb-4">
                            <h3 className="text-lg font-medium text-gray-600">{t('fieldSizeDistribution')}</h3>
                            <p className="text-sm text-gray-500">{t('byHectares')}</p>
                          </div>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                width={500}
                                height={300}
                                data={fields.map(field => ({
                                  name: field.name,
                                  size: field.size || 0
                                }))}
                                margin={{
                                  top: 5,
                                  right: 30,
                                  left: 20,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="size" fill="#4ade80" name={t('fieldSize')} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-200 w-full h-full flex flex-col items-center justify-center">
                          <span className="material-icons text-4xl text-gray-400 mb-2">insert_chart</span>
                          <h3 className="text-lg font-medium text-gray-600">{t('productionChartPlaceholder')}</h3>
                          <p className="text-sm text-gray-500 mb-4">{t('chartDescription')}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{t('productionByField')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={fieldProductionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {fieldProductionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={[
                                '#4ade80', '#fcd34d', '#60a5fa', '#f87171', '#c084fc'
                              ][index % 5]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="space-y-4">
                      {fieldProductionData.map((item, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: [
                                  '#4ade80', '#fcd34d', '#60a5fa', '#f87171', '#c084fc'
                                ][index % 5] }}
                              />
                              <span>{item.name}</span>
                            </div>
                            <span className="font-medium">{item.value}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="h-2.5 rounded-full" 
                              style={{ 
                                width: `${item.value}%`,
                                backgroundColor: [
                                  '#4ade80', '#fcd34d', '#60a5fa', '#f87171', '#c084fc'
                                ][index % 5]
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Verimlilik Raporu */}
          <TabsContent value="efficiency">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{t('fieldEfficiency')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <div className="w-full h-full">
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-medium text-gray-600">{t('yieldDistribution')}</h3>
                          <p className="text-sm text-gray-500">{t('byCategory')}</p>
                        </div>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={fieldEfficiencyData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                <Cell fill="#4ade80" />
                                <Cell fill="#facc15" />
                                <Cell fill="#f87171" />
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{t('efficiencyByField')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {fieldEfficiencyData.map((item, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{item.name}</span>
                            <span className="font-medium">{item.value}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${index === 0 ? 'bg-green-600' : index === 1 ? 'bg-amber-500' : 'bg-red-500'}`} 
                              style={{ width: `${item.value}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Finansal Rapor */}
          <TabsContent value="financial">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{t('financialSummary')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <div className="w-full h-full">
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-medium text-gray-600">{t('financialOverview')}</h3>
                          <p className="text-sm text-gray-500">{t('currentPeriod')}</p>
                        </div>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              width={500}
                              height={300}
                              data={financialData}
                              margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip formatter={(value) => value.toLocaleString('tr-TR') + ' ₺'} />
                              <Legend />
                              <Bar 
                                dataKey="value" 
                                name={t('amount')} 
                                fill="#60a5fa" 
                                radius={[4, 4, 0, 0]}
                                barSize={60}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{t('financialBreakdown')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {financialData.map((item, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{item.name}</span>
                            <span className="font-medium">{item.value.toLocaleString('tr-TR')} ₺</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${index === 0 ? 'bg-green-600' : index === 1 ? 'bg-red-500' : 'bg-blue-500'}`} 
                              style={{ width: `${(item.value / financialData[0].value) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Planlama Raporu */}
          <TabsContent value="planning">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('upcomingTasks')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tasks && tasks.filter(t => !t.completed).slice(0, 5).length > 0 ? (
                      tasks.filter(t => !t.completed).slice(0, 5).map((task, index) => (
                        <div key={index} className="p-3 border border-gray-200 rounded-md">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{task.title}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(task.startDate).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-6">
                        <p className="text-gray-500">{t('noUpcomingTasks')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{t('taskAnalytics')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {tasks && tasks.length > 0 ? (
                    <div className="h-72">
                      <div className="text-center mb-2">
                        <h3 className="text-sm font-medium text-gray-600">{t('tasksByStatus')}</h3>
                      </div>
                      <ResponsiveContainer width="100%" height="80%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: t('completed'), value: taskStats.completedTasks },
                              { name: t('pending'), value: taskStats.pendingTasks }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            <Cell fill="#4ade80" />
                            <Cell fill="#60a5fa" />
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          className="mt-2 bg-white border-green-600 text-green-600 hover:bg-green-50"
                          onClick={() => navigate('/tasks')}
                        >
                          <span className="material-icons text-sm mr-1">list</span>
                          {t('viewAllTasks')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      <span className="material-icons text-3xl text-gray-400 mb-2">event_note</span>
                      <h3 className="text-lg font-medium text-gray-600">{t('planningPlaceholder')}</h3>
                      <p className="text-sm text-gray-500 mb-4">{t('planningDescription')}</p>
                      <Button
                        variant="outline"
                        className="bg-white border-green-600 text-green-600 hover:bg-green-50"
                      >
                        {t('createPlan')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Rapor İndirme Butonu */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            className="bg-white border-green-600 text-green-600 hover:bg-green-50"
          >
            <span className="material-icons text-sm mr-1">download</span>
            {t('downloadReport')}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
