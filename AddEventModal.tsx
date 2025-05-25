import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Field } from '@shared/schema';
import { Badge } from '@/components/ui/badge';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  fieldId?: number;
}

const ACTIVITY_TYPES = [
  { value: 'watering', label: 'Sulama', color: 'bg-blue-500', hexColor: '#3b82f6' },
  { value: 'fertilizing', label: 'Gübreleme', color: 'bg-green-500', hexColor: '#22c55e' },
  { value: 'harvesting', label: 'Hasat', color: 'bg-amber-500', hexColor: '#f59e0b' },
  { value: 'planting', label: 'Ekim', color: 'bg-indigo-500', hexColor: '#6366f1' },
  { value: 'plowing', label: 'Tarla Sürme', color: 'bg-brown-500', hexColor: '#92400e' },
  { value: 'spraying', label: 'İlaçlama', color: 'bg-red-500', hexColor: '#ef4444' },
  { value: 'inspection', label: 'Kontrol/İnceleme', color: 'bg-purple-500', hexColor: '#a855f7' },
  { value: 'maintenance', label: 'Bakım', color: 'bg-gray-500', hexColor: '#6b7280' },
  { value: 'other', label: 'Diğer', color: 'bg-gray-400', hexColor: '#9ca3af' }
];

export function AddEventModal({ isOpen, onClose, selectedDate, fieldId }: AddEventModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch fields
  const { data: fields, isLoading: fieldsLoading } = useQuery<Field[]>({
    queryKey: ['/api/fields'],
    enabled: isOpen,
  });

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activityType, setActivityType] = useState(ACTIVITY_TYPES[0].value);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);

  // Set field ID from props if provided
  useEffect(() => {
    if (fieldId) {
      setSelectedFieldId(fieldId);
    }
  }, [fieldId, isOpen]);

  // Determine task/event details
  const formattedDate = selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

  // Prepare field options
  const fieldOptions = fields?.map(field => ({
    value: field.id,
    label: field.name
  })) || [];

  // Generate title based on activity type if not set by user
  useEffect(() => {
    if (!title && activityType) {
      const selectedActivity = ACTIVITY_TYPES.find(type => type.value === activityType);
      if (selectedActivity) {
        const fieldName = selectedFieldId && fields ? 
          fields.find(f => f.id === selectedFieldId)?.name : '';

        if (fieldName) {
          setTitle(`${selectedActivity.label} - ${fieldName}`);
        }
      }
    }
  }, [activityType, selectedFieldId, fields, title]);

  // Mutation to add task/event
  const addTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      return apiRequest('POST', '/api/tasks', taskData);
    },
    onSuccess: () => {
      toast({
        title: t('eventAddedSuccessfully'),
        description: formattedDate,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      handleClose();
    },
    onError: () => {
      toast({
        title: t('errorAddingEvent'),
        description: t('pleaseTryAgain'),
        variant: 'destructive',
      });
    }
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: t('titleRequired'),
        description: t('pleaseEnterTitle'),
        variant: 'destructive',
      });
      return;
    }

    if (!selectedFieldId) {
      toast({
        title: t('fieldRequired'),
        description: t('pleaseSelectField'),
        variant: 'destructive',
      });
      return;
    }

    // Validate time range
    const startDateTime = new Date(`${formattedDate}T${startTime}`);
    const endDateTime = new Date(`${formattedDate}T${endTime}`);

    if (endDateTime <= startDateTime) {
      toast({
        title: t('invalidTimeRange'),
        description: t('endTimeMustBeAfterStart'),
        variant: 'destructive',
      });
      return;
    }

    if (!activityType) {
      toast({
        title: t('activityTypeRequired'),
        description: t('pleaseSelectActivityType'),
        variant: 'destructive',
      });
      return;
    }

    // Create task data
    const taskData = {
      title,
      description,
      taskType: activityType,
      startDate: formattedDate,
      endDate: formattedDate,
      startTime,
      endTime,
      fieldId: selectedFieldId,
      priority: 'normal',
      completed: false,
      season: new Date().getFullYear().toString()
    };

    addTaskMutation.mutate(taskData);
  };

  // Handle modal close and reset form
  const handleClose = () => {
    setTitle('');
    setDescription('');
    setActivityType(ACTIVITY_TYPES[0].value);
    setStartTime('08:00');
    setEndTime('10:00');
    setSelectedFieldId(fieldId || null);
    onClose();
  };

  const getActivityLabel = (value: string) => {
    const activity = ACTIVITY_TYPES.find(type => type.value === value);
    return activity ? activity.label : value;
  };

  const getActivityColor = (value: string) => {
    const activity = ACTIVITY_TYPES.find(type => type.value === value);
    return activity ? activity.color : 'bg-gray-500';
  };

  const getActivityHexColor = (value: string) => {
    const activity = ACTIVITY_TYPES.find(type => type.value === value);
    return activity ? activity.hexColor : '#6b7280';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('addEvent')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center gap-2 mb-2">
            {ACTIVITY_TYPES.slice(0, 5).map((type) => (
              <div
                key={type.value}
                className={`flex flex-col items-center cursor-pointer p-2 rounded-lg transition-all ${
                  activityType === type.value 
                    ? `ring-2 ring-offset-2 ${type.color} text-white` 
                    : 'hover:bg-gray-100'
                }`}
                style={{ 
                  backgroundColor: activityType === type.value ? type.hexColor : '',
                }}
                onClick={() => setActivityType(type.value)}
              >
                <span className="material-icons text-lg">
                  {type.value === 'watering' && 'water_drop'}
                  {type.value === 'fertilizing' && 'compost'}
                  {type.value === 'harvesting' && 'agriculture'}
                  {type.value === 'planting' && 'grass'}
                  {type.value === 'plowing' && 'landscape'}
                </span>
                <span className="text-xs mt-1">{type.label}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mb-4">
            {ACTIVITY_TYPES.slice(5).map((type) => (
              <div
                key={type.value}
                className={`flex flex-col items-center cursor-pointer p-2 rounded-lg transition-all ${
                  activityType === type.value 
                    ? `ring-2 ring-offset-2 ${type.color} text-white` 
                    : 'hover:bg-gray-100'
                }`}
                style={{ 
                  backgroundColor: activityType === type.value ? type.hexColor : '',
                }}
                onClick={() => setActivityType(type.value)}
              >
                <span className="material-icons text-lg">
                  {type.value === 'spraying' && 'cleaning_services'}
                  {type.value === 'inspection' && 'search'}
                  {type.value === 'maintenance' && 'build'}
                  {type.value === 'other' && 'more_horiz'}
                </span>
                <span className="text-xs mt-1">{type.label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">{t('eventTitle')}</Label>
            <Input 
              id="title" 
              placeholder={t('enterEventTitle')} 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="field-select">{t('field')}</Label>
            <Select 
              value={selectedFieldId?.toString() || ''} 
              onValueChange={(value) => setSelectedFieldId(value ? parseInt(value) : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectField')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">
                  {t('noField')}
                </SelectItem>
                {fieldOptions.map((field) => (
                  <SelectItem key={field.value} value={field.value.toString()}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">{t('startTime')}</Label>
              <Input 
                id="start-time" 
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">{t('endTime')}</Label>
              <Input 
                id="end-time" 
                type="time" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea 
              id="description" 
              placeholder={t('enterDescription')} 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <span className="material-icons text-blue-500 text-sm">today</span>
              </div>
              <div className="ml-2 text-sm">
                <p className="font-medium text-blue-700">{t('selectedDate')}</p>
                <p className="text-blue-600">
                  {selectedDate ? selectedDate.toLocaleDateString('tr-TR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : t('dateNotSelected')}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {t('cancel')}
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700"
              disabled={addTaskMutation.isPending}
            >
              {addTaskMutation.isPending ? t('adding') : t('addEvent')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}