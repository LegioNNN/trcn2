import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Task, Field } from '@shared/schema';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

export default function TasksPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  
  // Fetch tasks data
  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });
  
  // Fetch fields data
  const { data: fields } = useQuery<Field[]>({
    queryKey: ['/api/fields'],
  });
  
  // Toggle task completion status
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number, completed: boolean }) => {
      return apiRequest(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ completed }),
      });
    },
    onSuccess: () => {
      // Invalidate tasks query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: t('taskUpdated'),
        description: t('taskStatusChanged'),
      });
    },
    onError: (error) => {
      toast({
        title: t('error'),
        description: t('failedToUpdateTask'),
        variant: 'destructive',
      });
      console.error('Failed to update task:', error);
    },
  });
  
  // Handle task completion toggle
  const handleToggleTask = (task: Task) => {
    toggleTaskMutation.mutate({
      id: task.id,
      completed: !task.completed,
    });
  };
  
  // Filter tasks
  const filteredTasks = React.useMemo(() => {
    if (!tasks) return [];
    
    if (filter === 'pending') {
      return tasks.filter(task => !task.completed);
    } else if (filter === 'completed') {
      return tasks.filter(task => task.completed);
    }
    
    return tasks;
  }, [tasks, filter]);
  
  // Group tasks by date
  const groupedTasks = React.useMemo(() => {
    if (!filteredTasks.length) return new Map();
    
    const groups = new Map<string, Task[]>();
    
    filteredTasks.forEach(task => {
      const date = new Date(task.startDate).toISOString().split('T')[0];
      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups.get(date)!.push(task);
    });
    
    // Sort the map by dates
    return new Map([...groups.entries()].sort());
  }, [filteredTasks]);
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check if date is today or tomorrow
    if (date.toDateString() === today.toDateString()) {
      return t('today');
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return t('tomorrow');
    }
    
    // Otherwise return formatted date
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Get field name from ID
  const getFieldName = (fieldId: number | null) => {
    if (!fieldId || !fields) return t('noField');
    const field = fields.find(field => field.id === fieldId);
    return field ? field.name : t('unknownField');
  };
  
  // Color by task type
  const getTaskTypeColor = (taskType: string) => {
    switch (taskType.toLowerCase()) {
      case 'watering':
      case 'sulama':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'fertilizing':
      case 'gübreleme':
        return 'bg-green-50 text-green-700 border-green-100';
      case 'harvesting':
      case 'hasat':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'planting':
      case 'ekim':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };
  
  // Priority colors
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'yüksek':
        return 'text-red-600';
      case 'medium':
      case 'orta':
        return 'text-amber-600';
      default:
        return 'text-gray-600';
    }
  };
  
  return (
    <MainLayout title={t('tasks')}>
      <div className="container p-4 mx-auto pb-20">
        {/* Görevler Başlık ve Özet */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{t('tasks')}</h1>
              <p className="text-gray-600">
                {tasks?.filter(t => !t.completed).length || 0} {t('pendingTasks').toLowerCase()}
              </p>
            </div>
            <div className="flex gap-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-green-100 text-green-800' : 'text-gray-600'}`}
                >
                  {t('all')}
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-3 py-1 rounded ${filter === 'pending' ? 'bg-green-100 text-green-800' : 'text-gray-600'}`}
                >
                  {t('pending')}
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-3 py-1 rounded ${filter === 'completed' ? 'bg-green-100 text-green-800' : 'text-gray-600'}`}
                >
                  {t('completed')}
                </button>
              </div>
              <Button
                onClick={() => navigate('/calendar/new')}
                className="bg-green-600 hover:bg-green-700"
              >
                <span className="material-icons text-sm mr-1">add</span>
                {t('newTask')}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Task Lists */}
        <div className="space-y-6">
          {tasksLoading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              <span className="ml-3 text-green-600">{t('loading')}</span>
            </div>
          ) : groupedTasks.size > 0 ? (
            Array.from(groupedTasks.entries()).map(([date, tasks]) => (
              <div key={date} className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-800">{formatDate(date)}</h2>
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                      {tasks.map((task) => (
                        <div 
                          key={task.id} 
                          className={`p-4 hover:bg-gray-50 transition-colors ${task.completed ? 'bg-gray-50' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="pt-0.5">
                              <Checkbox 
                                checked={task.completed} 
                                onCheckedChange={() => handleToggleTask(task)}
                                className="mt-1"
                              />
                            </div>
                            <div className="flex-1">
                              <div 
                                className="cursor-pointer"
                                onClick={() => navigate(`/calendar/${task.id}`)}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                    {task.title}
                                  </h3>
                                  <div className="flex items-center gap-2">
                                    {task.priority && (
                                      <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                                        {t(task.priority.toLowerCase())}
                                      </span>
                                    )}
                                    <Badge variant="secondary" className={getTaskTypeColor(task.taskType)}>
                                      {t(task.taskType.toLowerCase())}
                                    </Badge>
                                  </div>
                                </div>
                                {task.description && (
                                  <p className={`text-sm mb-2 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {task.description}
                                  </p>
                                )}
                                <div className="flex items-center text-xs text-gray-500">
                                  {task.startTime && (
                                    <span className="flex items-center mr-3">
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
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <div className="material-icons text-3xl text-gray-400 mb-2">task</div>
              <h3 className="text-lg font-medium text-gray-600 mb-1">{t('noTasks')}</h3>
              <p className="text-gray-500 mb-4">{t('noTasksDescription')}</p>
              <Button
                onClick={() => navigate('/calendar/new')}
                className="bg-green-600 hover:bg-green-700"
              >
                <span className="material-icons text-sm mr-1">add</span>
                {t('newTask')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
