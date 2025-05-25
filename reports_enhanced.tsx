import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedTab, setSelectedTab] = useState('activities');
  const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
  const [reportType, setReportType] = useState<'field' | 'crop' | 'activity'>('field');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedSeason, setSelectedSeason] = useState<string>(new Date().getFullYear().toString());
  const [previousSeason, setPreviousSeason] = useState<string>((new Date().getFullYear() - 1).toString());
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');
  const [selectedCropId, setSelectedCropId] = useState<string>('');
  
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
  
  // Fetch harvest records
  const { data: harvestRecords, isLoading: harvestRecordsLoading } = useQuery<HarvestRecord[]>({
    queryKey: ['/api/harvest-records'],
    enabled: false, // Disable this query initially as we haven't implemented this endpoint yet
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
  
  // Group tasks by type and count
  const tasksByType = React.useMemo(() => {
    if (!tasks) return [];
    
    const typeCountMap = new Map<string, number>();
    tasks.forEach(task => {
      const type = task.taskType.toLowerCase();
      typeCountMap.set(type, (typeCountMap.get(type) || 0) + 1);
    });
    
    return Array.from(typeCountMap.entries()).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value);
  }, [tasks]);
  
  // Activities per month data
  const activitiesByMonth = React.useMemo(() => {
    if (!tasks) return [];
    
    const monthsData: Record<string, Record<string, number>> = {};
    const months = Array.from({ length: 12 }, (_, i) => i);
    
    months.forEach(month => {
      const monthName = new Date(2023, month, 1).toLocaleString('tr-TR', { month: 'short' });
      monthsData[monthName] = { watering: 0, fertilizing: 0, spraying: 0, harvesting: 0 };
    });
    
    tasks.forEach(task => {
      const taskDate = new Date(task.startDate);
      const monthName = taskDate.toLocaleString('tr-TR', { month: 'short' });
      const taskType = task.taskType.toLowerCase();
      
      if (monthsData[monthName] && (taskType === 'watering' || taskType === 'fertilizing' || taskType === 'spraying' || taskType === 'harvesting')) {
        monthsData[monthName][taskType] = (monthsData[monthName][taskType] || 0) + 1;
      }
    });
    
    return Object.entries(monthsData).map(([name, activities]) => ({
      name,
      ...activities
    }));
  }, [tasks]);
  
  // Compare current season with previous
  const seasonComparisonData = React.useMemo(() => {
    // This would be real data fetched from the API for two different seasons
    // For now, use placeholder data
    return [
      { name: 'Sulama', [previousSeason]: 24, [selectedSeason]: 28 },
      { name: 'Gübreleme', [previousSeason]: 18, [selectedSeason]: 22 },
      { name: 'İlaçlama', [previousSeason]: 15, [selectedSeason]: 14 },
      { name: 'Hasat', [previousSeason]: 8, [selectedSeason]: 9 },
    ];
  }, [previousSeason, selectedSeason]);
  
  // Yield comparison data
  const yieldComparisonData = React.useMemo(() => {
    // This would be real data fetched from the API
    // For now, use placeholder data
    return [
      { name: 'Buğday', [previousSeason]: 4.2, [selectedSeason]: 4.5, unit: 'ton/dönüm' },
      { name: 'Mısır', [previousSeason]: 7.8, [selectedSeason]: 8.1, unit: 'ton/dönüm' },
      { name: 'Arpa', [previousSeason]: 3.9, [selectedSeason]: 3.7, unit: 'ton/dönüm' },
    ];
  }, [previousSeason, selectedSeason]);
  
  // Activity timeline
  const activityTimeline = React.useMemo(() => {
    if (!tasks) return [];
    
    // Group tasks by date
    const tasksGroupedByDate = new Map<string, Task[]>();
    tasks.forEach(task => {
      const dateStr = new Date(task.startDate).toISOString().split('T')[0];
      if (!tasksGroupedByDate.has(dateStr)) {
        tasksGroupedByDate.set(dateStr, []);
      }
      tasksGroupedByDate.get(dateStr)!.push(task);
    });
    
    // Sort by date
    return Array.from(tasksGroupedByDate.entries())
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .slice(0, 10); // Only take the most recent 10 days with activity
  }, [tasks]);
  
  // Handle report generation
  const handleGenerateReport = () => {
    console.log('Generating report with:', { reportType, dateRange, selectedFieldId, selectedCropId });
    
    // In a real implementation, this would call an API endpoint to generate a report
    // For now, just close the modal
    setShowGenerateReportModal(false);
  };
  
  // Get activity type color
  const getActivityTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      watering: 'bg-blue-100 text-blue-700',
      fertilizing: 'bg-green-100 text-green-700',
      harvesting: 'bg-amber-100 text-amber-700',
      planting: 'bg-indigo-100 text-indigo-700',
      spraying: 'bg-red-100 text-red-700',
      plowing: 'bg-yellow-100 text-yellow-700',
      inspection: 'bg-purple-100 text-purple-700',
      maintenance: 'bg-gray-100 text-gray-700',
    };
    
    return colorMap[type.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };
  
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
            <div className="flex gap-2">
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
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowGenerateReportModal(true)}
              >
                <span className="material-icons text-sm mr-1">file_download</span>
                {t('generateReport')}
              </Button>
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
                    {fieldStats.totalArea.toFixed(2)} {fields && fields.length > 0 ? fields[0].unit : t('hectares')}
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
        
        {/* Season Comparison Controls */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="text-sm font-medium text-gray-700 mb-2">{t('compareSeasons')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentSeason">{t('currentSeason')}</Label>
              <Select 
                value={selectedSeason} 
                onValueChange={setSelectedSeason}
              >
                <SelectTrigger id="currentSeason">
                  <SelectValue placeholder={t('selectSeason')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">{t('season')} 2025</SelectItem>
                  <SelectItem value="2024">{t('season')} 2024</SelectItem>
                  <SelectItem value="2023">{t('season')} 2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="previousSeason">{t('previousSeason')}</Label>
              <Select 
                value={previousSeason} 
                onValueChange={setPreviousSeason}
              >
                <SelectTrigger id="previousSeason">
                  <SelectValue placeholder={t('selectSeason')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">{t('season')} 2024</SelectItem>
                  <SelectItem value="2023">{t('season')} 2023</SelectItem>
                  <SelectItem value="2022">{t('season')} 2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Tabs ve Grafik Alanları */}
        <Tabs defaultValue="activities" onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="activities">{t('activities')}</TabsTrigger>
            <TabsTrigger value="harvest">{t('harvest')}</TabsTrigger>
            <TabsTrigger value="comparison">{t('comparison')}</TabsTrigger>
            <TabsTrigger value="timeline">{t('timeline')}</TabsTrigger>
          </TabsList>
          
          {/* Activities Tab */}
          <TabsContent value="activities">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{t('activityDistribution')}</CardTitle>
                    <CardDescription>{t('activitiesByMonth')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <div className="w-full h-full">
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              width={500}
                              height={300}
                              data={activitiesByMonth}
                              margin={{
                                top: 20,
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
                              <Bar dataKey="watering" fill="#3b82f6" name={t('watering')} />
                              <Bar dataKey="fertilizing" fill="#22c55e" name={t('fertilizing')} />
                              <Bar dataKey="spraying" fill="#ef4444" name={t('spraying')} />
                              <Bar dataKey="harvesting" fill="#f59e0b" name={t('harvesting')} />
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
                    <CardTitle>{t('activityTypes')}</CardTitle>
                    <CardDescription>{t('distributionByType')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={tasksByType}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${t(name)}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {tasksByType.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={
                                entry.name === 'watering' ? '#3b82f6' :
                                entry.name === 'fertilizing' ? '#22c55e' :
                                entry.name === 'harvesting' ? '#f59e0b' :
                                entry.name === 'planting' ? '#6366f1' :
                                entry.name === 'plowing' ? '#92400e' :
                                entry.name === 'spraying' ? '#ef4444' :
                                entry.name === 'inspection' ? '#a855f7' :
                                '#6b7280'
                              } />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="space-y-3">
                      {tasksByType.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div 
                              className={`w-3 h-3 rounded-full mr-2 ${
                                item.name === 'watering' ? 'bg-blue-500' :
                                item.name === 'fertilizing' ? 'bg-green-500' :
                                item.name === 'harvesting' ? 'bg-amber-500' :
                                item.name === 'planting' ? 'bg-indigo-500' :
                                item.name === 'plowing' ? 'bg-yellow-700' :
                                item.name === 'spraying' ? 'bg-red-500' :
                                item.name === 'inspection' ? 'bg-purple-500' :
                                'bg-gray-500'
                              }`}
                            />
                            <span>{t(item.name)}</span>
                          </div>
                          <span className="font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Harvest Tab */}
          <TabsContent value="harvest">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{t('harvestResults')}</CardTitle>
                    <CardDescription>{t('comparisonWithPreviousSeason')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <div className="w-full h-full">
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              width={500}
                              height={300}
                              data={yieldComparisonData}
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip formatter={(value) => [`${value} ${yieldComparisonData[0].unit}`, t('yield')]} />
                              <Legend />
                              <Bar dataKey={previousSeason} fill="#94a3b8" name={t('previousSeason')} />
                              <Bar dataKey={selectedSeason} fill="#22c55e" name={t('currentSeason')} />
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
                    <CardTitle>{t('yieldSummary')}</CardTitle>
                    <CardDescription>{t('byFieldAndCrop')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {fields && fields.length > 0 ? (
                      <div className="space-y-4">
                        {fields.map((field) => {
                          const fieldCrop = crops?.find(c => c.id === field.currentCropId);
                          
                          if (!fieldCrop) return null;
                          
                          // This would be replaced with real data in a production app
                          const currentYield = (Math.random() * 5 + 3).toFixed(1);
                          const previousYield = (Math.random() * 5 + 3).toFixed(1);
                          const change = (Number(currentYield) - Number(previousYield)).toFixed(1);
                          const isPositive = Number(change) > 0;
                          
                          return (
                            <div key={field.id} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium text-gray-800">{field.name}</h3>
                                <Badge style={{ backgroundColor: field.color }}>{fieldCrop.name}</Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{t('currentYield')}</span>
                                <span className="font-medium">{currentYield} ton/dönüm</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{t('vsLastSeason')}</span>
                                <span className={`font-medium flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                  <span className="material-icons text-xs mr-1">
                                    {isPositive ? 'arrow_upward' : 'arrow_downward'}
                                  </span>
                                  {change} ton/dönüm
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="material-icons text-4xl text-gray-400 mb-2">grass</div>
                        <p className="text-gray-500">{t('noFieldsWithCrops')}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Comparison Tab */}
          <TabsContent value="comparison">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{t('activityComparison')}</CardTitle>
                    <CardDescription>
                      {t('seasonComparisonDescription', { 
                        currentSeason: selectedSeason, 
                        previousSeason: previousSeason 
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <div className="w-full h-full">
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              width={500}
                              height={300}
                              data={seasonComparisonData}
                              margin={{
                                top: 20,
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
                              <Bar dataKey={previousSeason} fill="#94a3b8" name={`${t('season')} ${previousSeason}`} />
                              <Bar dataKey={selectedSeason} fill="#22c55e" name={`${t('season')} ${selectedSeason}`} />
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
                    <CardTitle>{t('efficiencyIndicators')}</CardTitle>
                    <CardDescription>{t('comparisonBySeason')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <h3 className="font-medium">{t('activityFrequency')}</h3>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-gray-400 mr-1"></div>
                              {previousSeason}
                            </span>
                            <span className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                              {selectedSeason}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {seasonComparisonData.map((item, index) => (
                            <div key={index} className="space-y-1">
                              <div className="flex items-center justify-between text-xs text-gray-600">
                                <span>{item.name}</span>
                                <div className="flex gap-2">
                                  <span>{item[previousSeason]}</span>
                                  <span className="font-medium">{item[selectedSeason]}</span>
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 relative">
                                <div 
                                  className="absolute h-2.5 rounded-full bg-gray-400" 
                                  style={{ width: `${(item[previousSeason] / Math.max(...seasonComparisonData.map(d => d[previousSeason])) * 100)}%` }}
                                ></div>
                                <div 
                                  className="absolute h-2.5 rounded-full bg-green-500 mix-blend-multiply" 
                                  style={{ width: `${(item[selectedSeason] / Math.max(...seasonComparisonData.map(d => d[selectedSeason])) * 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">{t('overallEfficiency')}</h3>
                        
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>{t('previousSeason')}</span>
                          <span>76%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                          <div className="h-2.5 rounded-full bg-gray-400" style={{ width: '76%' }}></div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>{t('currentSeason')}</span>
                          <span className="flex items-center text-green-600">
                            <span className="material-icons text-xs mr-1">arrow_upward</span>
                            82%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="h-2.5 rounded-full bg-green-500" style={{ width: '82%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('activityTimeline')}</CardTitle>
                  <CardDescription>{t('recentActivities')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {activityTimeline.length > 0 ? (
                    <div className="space-y-6 relative">
                      {/* Timeline line */}
                      <div className="absolute top-0 bottom-0 left-3 w-0.5 bg-gray-200"></div>
                      
                      {activityTimeline.map(([dateStr, tasksForDay], index) => (
                        <div key={index} className="relative pl-8">
                          {/* Date dot */}
                          <div className="absolute left-1 top-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white z-10"></div>
                          
                          {/* Date header */}
                          <div className="mb-2">
                            <h3 className="font-medium text-gray-800">
                              {new Date(dateStr).toLocaleDateString('tr-TR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {tasksForDay.length} {t('activities').toLowerCase()}
                            </p>
                          </div>
                          
                          {/* Tasks for this day */}
                          <div className="space-y-2">
                            {tasksForDay.map((task) => (
                              <div 
                                key={task.id} 
                                className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                              >
                                <div className="flex items-start justify-between mb-1">
                                  <h4 className="font-medium text-gray-800">{task.title}</h4>
                                  <Badge className={getActivityTypeColor(task.taskType)}>
                                    {t(task.taskType.toLowerCase())}
                                  </Badge>
                                </div>
                                {task.description && (
                                  <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                                )}
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <div className="flex items-center">
                                    {task.startTime && (
                                      <span className="flex items-center mr-3">
                                        <span className="material-icons text-xs mr-1">schedule</span>
                                        {task.startTime}
                                      </span>
                                    )}
                                    {task.fieldId && fields && (
                                      <span className="flex items-center">
                                        <span className="material-icons text-xs mr-1">place</span>
                                        {fields.find(f => f.id === task.fieldId)?.name || t('unknownField')}
                                      </span>
                                    )}
                                  </div>
                                  {task.completed && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100">
                                      {t('completed')}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <div className="material-icons text-4xl text-gray-400 mb-2">event_busy</div>
                      <h3 className="text-lg font-medium text-gray-600 mb-1">{t('noActivitiesRecorded')}</h3>
                      <p className="text-gray-500 mb-4">{t('startTrackingActivities')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Generate Report Modal */}
      <Dialog open={showGenerateReportModal} onOpenChange={setShowGenerateReportModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('generateReport')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">{t('reportType')}</Label>
              <Select 
                value={reportType} 
                onValueChange={(value: any) => setReportType(value)}
              >
                <SelectTrigger id="reportType">
                  <SelectValue placeholder={t('selectReportType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="field">{t('fieldReport')}</SelectItem>
                  <SelectItem value="crop">{t('cropReport')}</SelectItem>
                  <SelectItem value="activity">{t('activityReport')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">{t('startDate')}</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">{t('endDate')}</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
              </div>
            </div>
            
            {reportType === 'field' && (
              <div className="space-y-2">
                <Label htmlFor="fieldSelect">{t('selectField')}</Label>
                <Select 
                  value={selectedFieldId} 
                  onValueChange={setSelectedFieldId}
                >
                  <SelectTrigger id="fieldSelect">
                    <SelectValue placeholder={t('allFields')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('allFields')}</SelectItem>
                    {fields?.map((field) => (
                      <SelectItem key={field.id} value={field.id.toString()}>
                        {field.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {reportType === 'crop' && (
              <div className="space-y-2">
                <Label htmlFor="cropSelect">{t('selectCrop')}</Label>
                <Select 
                  value={selectedCropId} 
                  onValueChange={setSelectedCropId}
                >
                  <SelectTrigger id="cropSelect">
                    <SelectValue placeholder={t('allCrops')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('allCrops')}</SelectItem>
                    {crops?.map((crop) => (
                      <SelectItem key={crop.id} value={crop.id.toString()}>
                        {crop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateReportModal(false)}>
              {t('cancel')}
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleGenerateReport}
            >
              <span className="material-icons text-sm mr-1">file_download</span>
              {t('generate')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}