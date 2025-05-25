import React from 'react';
import { useTranslation } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Task } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';

interface TasksListProps {
  limit?: number;
  showViewAll?: boolean;
}

export const TasksList: React.FC<TasksListProps> = ({ limit = 3, showViewAll = true }) => {
  const { t, currentLanguage } = useTranslation();
  const [, setLocation] = useLocation();

  const { data: tasks, isLoading, isError } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    staleTime: 60000,
  });

  const handleCompleteTask = async (taskId: number) => {
    try {
      await apiRequest('PATCH', `/api/tasks/${taskId}/complete`, { completed: true });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const getTaskIcon = (taskType: string) => {
    const iconMap: Record<string, string> = {
      watering: 'water_drop',
      fertilizing: 'eco',
      harvesting: 'agriculture',
      planting: 'grass',
      default: 'event_note'
    };
    
    return iconMap[taskType] || iconMap.default;
  };

  const getTaskIconColor = (taskType: string) => {
    const colorMap: Record<string, string> = {
      watering: 'text-accent',
      fertilizing: 'text-green-600',
      harvesting: 'text-amber-600',
      planting: 'text-primary',
      default: 'text-gray-600'
    };
    
    return colorMap[taskType] || colorMap.default;
  };

  const getDateLabel = (dateStr: string) => {
    const taskDate = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    // Reset hours to compare only dates
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);
    
    if (taskDate.getTime() === today.getTime()) {
      return { text: t('today'), color: 'bg-yellow-100 text-yellow-800' };
    } else if (taskDate.getTime() === tomorrow.getTime()) {
      return { text: t('tomorrow'), color: 'bg-blue-100 text-blue-800' };
    } else {
      const dateFormatter = format(
        taskDate, 
        'd MMM', 
        { locale: currentLanguage === 'tr' ? tr : enUS }
      );
      return { text: dateFormatter, color: 'bg-gray-100 text-gray-800' };
    }
  };

  // Format task date for display
  const formatTaskDate = (task: Task) => {
    const dateLabel = getDateLabel(task.startDate);
    
    return (
      <span className={`text-xs ${dateLabel.color} px-2 py-0.5 rounded`}>
        {dateLabel.text}
      </span>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium text-gray-700">{t('upcomingTasks')}</CardTitle>
            {showViewAll && <Skeleton className="h-4 w-16" />}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <Skeleton className="h-6 w-6 rounded-full mr-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-md" />
                </div>
                <Skeleton className="h-3 w-full mb-2" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">{t('upcomingTasks')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">
            <span className="material-icons text-accent text-3xl mb-2">error_outline</span>
            <p>Failed to load tasks</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/tasks'] })}
            >
              <span className="material-icons text-sm mr-2">refresh</span> Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const upcomingTasks = tasks
    ?.filter(task => !task.completed)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, limit);

  return (
    <div className="px-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-700">{t('upcomingTasks')}</h3>
        {showViewAll && (
          <button 
            className="text-xs text-primary"
            onClick={() => setLocation('/calendar')}
          >
            {t('viewAll')}
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {upcomingTasks && upcomingTasks.length > 0 ? (
          upcomingTasks.map(task => (
            <div key={task.id} className="bg-white rounded-lg shadow-sm p-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <span className={`material-icons ${getTaskIconColor(task.taskType)} mr-2`}>
                    {getTaskIcon(task.taskType)}
                  </span>
                  <h4 className="text-sm font-medium">{task.title}</h4>
                </div>
                {formatTaskDate(task)}
              </div>
              <p className="text-xs text-gray-500 mb-2">{task.description}</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="material-icons text-gray-400 text-sm mr-1">schedule</span>
                  <span className="text-xs text-gray-500">
                    {task.startTime} {task.endTime ? `- ${task.endTime}` : ''}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm" 
                  className="text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20"
                  onClick={() => handleCompleteTask(task.id)}
                >
                  {t('completed')}
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <span className="material-icons text-gray-400 text-3xl mb-2">event_available</span>
            <p className="text-sm text-gray-500">No upcoming tasks</p>
            <Button 
              variant="outline"
              className="mt-2"
              onClick={() => setLocation('/calendar/new')}
            >
              <span className="material-icons text-sm mr-2">add</span>
              Add Task
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksList;
