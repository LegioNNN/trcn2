import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Task, Field } from '@shared/schema';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import { AddEventModal } from '@/components/AddEventModal';

// Activity type color mapping
const ACTIVITY_TYPE_COLORS: Record<string, { bgColor: string, textColor: string, borderColor: string, dotColor: string, badgeClass: string }> = {
  watering: {
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-100',
    dotColor: 'bg-blue-500',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-100'
  },
  fertilizing: {
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-100',
    dotColor: 'bg-green-500',
    badgeClass: 'bg-green-50 text-green-700 border-green-100'
  },
  harvesting: {
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-100',
    dotColor: 'bg-amber-500',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-100'
  },
  planting: {
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-100',
    dotColor: 'bg-indigo-500',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-100'
  },
  plowing: {
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-100',
    dotColor: 'bg-yellow-600',
    badgeClass: 'bg-yellow-50 text-yellow-700 border-yellow-100'
  },
  spraying: {
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-100',
    dotColor: 'bg-red-500',
    badgeClass: 'bg-red-50 text-red-700 border-red-100'
  },
  inspection: {
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-100',
    dotColor: 'bg-purple-500',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-100'
  },
  maintenance: {
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-100',
    dotColor: 'bg-gray-500',
    badgeClass: 'bg-gray-50 text-gray-700 border-gray-100'
  },
  other: {
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-100',
    dotColor: 'bg-gray-400',
    badgeClass: 'bg-gray-50 text-gray-700 border-gray-100'
  }
};

export default function CalendarPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [visibleTasksFilter, setVisibleTasksFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  
  // Fetch tasks and fields
  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });
  
  const { data: fields } = useQuery<Field[]>({
    queryKey: ['/api/fields'],
  });
  
  // Get field name by id
  const getFieldName = (fieldId: number | null) => {
    if (!fieldId || !fields) return t('allFields');
    const field = fields.find(f => f.id === fieldId);
    return field ? field.name : t('unknownField');
  };
  
  // Filter tasks by selected date
  const filteredTasks = React.useMemo(() => {
    if (!tasks || !selectedDate) return [];
    
    const tasksForDate = tasks.filter(task => {
      // Compare only the date part (not time)
      const taskDate = new Date(task.startDate);
      return (
        taskDate.getDate() === selectedDate.getDate() &&
        taskDate.getMonth() === selectedDate.getMonth() &&
        taskDate.getFullYear() === selectedDate.getFullYear()
      );
    });
    
    // Apply completed/upcoming filter
    if (visibleTasksFilter === 'completed') {
      return tasksForDate.filter(task => task.completed);
    } else if (visibleTasksFilter === 'upcoming') {
      return tasksForDate.filter(task => !task.completed);
    }
    
    return tasksForDate;
  }, [tasks, selectedDate, visibleTasksFilter]);
  
  // Generate tasks by date for calendar highlighting
  const tasksByDate = React.useMemo(() => {
    if (!tasks) return new Map();
    
    const dateMap = new Map<string, Task[]>();
    tasks.forEach(task => {
      const dateStr = new Date(task.startDate).toISOString().split('T')[0];
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, []);
      }
      dateMap.get(dateStr)!.push(task);
    });
    
    return dateMap;
  }, [tasks]);
  
  // Group tasks by type for the selected day
  const tasksByType = React.useMemo(() => {
    if (!filteredTasks.length) return new Map<string, Task[]>();
    
    const typeMap = new Map<string, Task[]>();
    
    filteredTasks.forEach(task => {
      const taskType = task.taskType.toLowerCase();
      if (!typeMap.has(taskType)) {
        typeMap.set(taskType, []);
      }
      typeMap.get(taskType)!.push(task);
    });
    
    return typeMap;
  }, [filteredTasks]);
  
  // Function to handle new task creation
  const handleAddTask = () => {
    setIsAddEventModalOpen(true);
  };
  
  // Function to handle task click
  const handleTaskClick = (task: Task) => {
    navigate(`/calendar/${task.id}`);
  };
  
  // Function to format date in a readable way
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Function to get task type badge color
  const getTaskTypeColor = (taskType: string) => {
    const type = taskType.toLowerCase();
    return ACTIVITY_TYPE_COLORS[type]?.badgeClass || ACTIVITY_TYPE_COLORS.other.badgeClass;
  };

  // Function to get task type dot color
  const getTaskTypeDotColor = (taskType: string) => {
    const type = taskType.toLowerCase();
    return ACTIVITY_TYPE_COLORS[type]?.dotColor || ACTIVITY_TYPE_COLORS.other.dotColor;
  };
  
  // Custom day renderer for the calendar - Handle DayPickerDay props
  const dayRenderer = (props: any) => {
    const { date, displayMonth } = props;
    
    // Skip rendering details for days not in current month
    if (date.getMonth() !== displayMonth.getMonth()) {
      return <div className="text-center text-gray-300">{date.getDate()}</div>;
    }
    
    const dateStr = date.toISOString().split('T')[0];
    const tasksForDay = tasksByDate.get(dateStr) || [];
    
    // Highlight today
    const isToday = new Date().toISOString().split('T')[0] === dateStr;
    const isSelected = selectedDate && 
                       selectedDate.getDate() === date.getDate() && 
                       selectedDate.getMonth() === date.getMonth() && 
                       selectedDate.getFullYear() === date.getFullYear();
    
    // Group tasks by type
    const taskTypes = new Set<string>();
    tasksForDay.forEach(task => taskTypes.add(task.taskType.toLowerCase()));
    const taskTypeArray = Array.from(taskTypes);
    
    return (
      <div 
        className={`relative w-full h-full p-1 ${
          isToday ? 'bg-blue-50 rounded-md' : ''
        } ${
          isSelected ? 'ring-2 ring-green-500 rounded-md' : ''
        }`}
      >
        <div className="text-center font-medium">{date.getDate()}</div>
        
        {/* Task type dots */}
        {taskTypeArray.length > 0 && (
          <div className="absolute bottom-1 left-0 right-0 flex justify-center">
            <div className="flex space-x-1">
              {taskTypeArray.length <= 3 ? (
                // Show individual dots for task types
                taskTypeArray.map((type: string, idx: number) => (
                  <div 
                    key={idx} 
                    className={`w-1.5 h-1.5 rounded-full ${getTaskTypeDotColor(type)}`}
                    title={t(type)}
                  />
                ))
              ) : (
                // Show total count
                <Badge variant="secondary" className="text-xs py-0 px-1 h-3">
                  {tasksForDay.length}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <MainLayout title={t('calendar')}>
      <div className="container p-4 mx-auto pb-20">
        {/* Takvim Başlık ve Özet Bilgiler */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{t('calendar')}</h1>
              <p className="text-gray-600">
                {tasks?.filter(t => !t.completed).length || 0} {t('upcomingTasks').toLowerCase()}
              </p>
            </div>
            <Button onClick={handleAddTask} className="bg-green-600 hover:bg-green-700">
              <span className="material-icons text-sm mr-1">add</span>
              {t('newTask')}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Takvim */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">{t('calendar')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar 
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  components={{
                    Day: dayRenderer
                  }}
                />
                
                {/* Type Legend */}
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {Object.entries(ACTIVITY_TYPE_COLORS).map(([type, colors]) => (
                    <div key={type} className="flex items-center text-xs">
                      <div className={`w-2 h-2 rounded-full ${colors.dotColor} mr-1`}></div>
                      <span>{t(type)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Seçili Gün Görevleri */}
          <div>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-col space-y-1.5">
                  <CardTitle className="text-lg font-semibold">
                    {selectedDate ? formatDate(selectedDate) : t('selectedDay')}
                  </CardTitle>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {filteredTasks.length} {t('tasks').toLowerCase()}
                    </p>
                    <div className="flex space-x-1 text-xs">
                      <Badge 
                        variant={visibleTasksFilter === 'all' ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setVisibleTasksFilter('all')}
                      >
                        {t('all')}
                      </Badge>
                      <Badge 
                        variant={visibleTasksFilter === 'upcoming' ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setVisibleTasksFilter('upcoming')}
                      >
                        {t('upcoming')}
                      </Badge>
                      <Badge 
                        variant={visibleTasksFilter === 'completed' ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setVisibleTasksFilter('completed')}
                      >
                        {t('completed')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="py-8 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                ) : filteredTasks.length > 0 ? (
                  <div className="space-y-4">
                    {/* Group by task type */}
                    {Array.from(tasksByType.entries()).map(([type, tasksOfType]) => (
                      <div key={type} className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-700 flex items-center">
                          <div className={`w-2 h-2 rounded-full ${getTaskTypeDotColor(type)} mr-2`}></div>
                          {t(type)}
                        </h3>
                        <div className="space-y-2">
                          {tasksOfType.map((task) => (
                            <div 
                              key={task.id} 
                              className={`p-3 rounded-lg border ${task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'} hover:border-green-300 cursor-pointer transition-colors`}
                              onClick={() => handleTaskClick(task)}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                  {task.title}
                                </h3>
                                {task.completed && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 text-xs">
                                    {t('completed')}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center text-xs text-gray-500 flex-wrap gap-2">
                                {task.startTime && (
                                  <span className="flex items-center">
                                    <span className="material-icons text-xs mr-1">schedule</span>
                                    {task.startTime}
                                  </span>
                                )}
                                {task.fieldId && (
                                  <span className="flex items-center">
                                    <span className="material-icons text-xs mr-1">place</span>
                                    {getFieldName(task.fieldId)}
                                  </span>
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
                    <div className="material-icons text-3xl text-gray-400 mb-2">event_busy</div>
                    <p className="text-gray-500">{t('noTasksForSelectedDay')}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4" 
                      onClick={handleAddTask}
                    >
                      <span className="material-icons text-xs mr-1">add</span>
                      {t('addTask')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Etkinlik Ekleme Modal */}
      <AddEventModal 
        isOpen={isAddEventModalOpen} 
        onClose={() => setIsAddEventModalOpen(false)} 
        selectedDate={selectedDate || null}
      />
    </MainLayout>
  );
}
