import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { Field } from '@shared/schema';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import { apiRequest } from '@/lib/queryClient';
import { TasksList } from '@/components/TasksList';

export default function FieldDetailPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { id: fieldId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // States
  const [isEditing, setIsEditing] = useState(false);
  const [fieldName, setFieldName] = useState('');
  const [fieldLocation, setFieldLocation] = useState('');
  const [fieldSize, setFieldSize] = useState('');
  const [fieldDescription, setFieldDescription] = useState('');
  const [fieldImages, setFieldImages] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  
  // Fetch field data
  const { data: field, isLoading } = useQuery<Field>({
    queryKey: [`/api/fields/${fieldId}`],
    onSuccess: (data) => {
      setFieldName(data.name);
      setFieldLocation(data.location || '');
      setFieldSize(data.size ? String(data.size) : '');
      setFieldDescription(data.description || '');
      setFieldImages(data.images || []);
    },
  });
  
  // Update field mutation
  const updateFieldMutation = useMutation({
    mutationFn: async (fieldData: Partial<Field>) => {
      return apiRequest('PATCH', `/api/fields/${fieldId}`, fieldData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/fields/${fieldId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/fields'] });
      setIsEditing(false);
      toast({
        title: t('fieldUpdateSuccess'),
        description: t('fieldInfoUpdated'),
      });
    },
    onError: (error) => {
      toast({
        title: t('fieldUpdateError'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest('POST', `/api/fields/${fieldId}/images`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/fields/${fieldId}`] });
      setUploadedImages([]);
      setUploadProgress({});
      toast({
        title: t('imageUploadSuccess'),
        description: t('imagesAddedToField'),
      });
    },
    onError: (error) => {
      toast({
        title: t('imageUploadError'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      return apiRequest('DELETE', `/api/fields/${fieldId}/images`, { imageUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/fields/${fieldId}`] });
      toast({
        title: t('imageDeleteSuccess'),
        description: t('imageRemovedFromField'),
      });
    },
    onError: (error) => {
      toast({
        title: t('imageDeleteError'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Handle save changes
  const handleSaveChanges = () => {
    if (!fieldName.trim()) {
      toast({
        title: t('validationError'),
        description: t('fieldNameRequired'),
        variant: 'destructive',
      });
      return;
    }
    
    const updatedField: Partial<Field> = {
      name: fieldName,
      location: fieldLocation,
      size: fieldSize ? parseFloat(fieldSize) : undefined,
      description: fieldDescription,
    };
    
    updateFieldMutation.mutate(updatedField);
  };
  
  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedImages(prev => [...prev, ...filesArray]);
      
      // Initialize progress for each file
      const newProgress: {[key: string]: number} = {};
      filesArray.forEach(file => {
        newProgress[file.name] = 0;
      });
      setUploadProgress(prev => ({...prev, ...newProgress}));
    }
  };
  
  // Handle image upload
  const handleImageUpload = () => {
    if (uploadedImages.length === 0) return;
    
    const formData = new FormData();
    uploadedImages.forEach(image => {
      formData.append('images', image);
    });
    
    uploadImageMutation.mutate(formData);
  };
  
  // Handle image delete
  const handleImageDelete = (imageUrl: string) => {
    if (window.confirm(t('confirmImageDelete'))) {
      deleteImageMutation.mutate(imageUrl);
    }
  };
  
  // Handle cancel upload
  const handleCancelUpload = (fileName: string) => {
    setUploadedImages(prev => prev.filter(file => file.name !== fileName));
    setUploadProgress(prev => {
      const newProgress = {...prev};
      delete newProgress[fileName];
      return newProgress;
    });
  };
  
  // Format field size display
  const formatFieldSize = (size?: number) => {
    if (!size) return '-';
    return `${size} ${t('hectare')}`;
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container p-4 mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (!field) {
    return (
      <MainLayout>
        <div className="container p-4 mx-auto">
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('fieldNotFound')}</h2>
            <p className="text-gray-600 mb-6">{t('fieldNotFoundDescription')}</p>
            <Button onClick={() => navigate('/fields')}>{t('backToFields')}</Button>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout title={field.name}>
      <div className="container p-4 mx-auto pb-20">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{field.name}</h1>
            <p className="text-gray-600">
              {formatFieldSize(field.size)}
              {field.location && ` • ${field.location}`}
            </p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <span className="material-icons text-sm mr-1">edit</span>
                {t('edit')}
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  {t('cancel')}
                </Button>
                <Button 
                  onClick={handleSaveChanges}
                  disabled={updateFieldMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {updateFieldMutation.isPending ? t('saving') : t('saveChanges')}
                </Button>
              </>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full max-w-md mb-6">
            <TabsTrigger value="details" className="flex-1">{t('details')}</TabsTrigger>
            <TabsTrigger value="photos" className="flex-1">{t('photos')}</TabsTrigger>
            <TabsTrigger value="tasks" className="flex-1">{t('tasks')}</TabsTrigger>
          </TabsList>
          
          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('fieldInformation')}</CardTitle>
                <CardDescription>{t('fieldInformationDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fieldName">{t('fieldName')}</Label>
                      <Input 
                        id="fieldName" 
                        value={fieldName} 
                        onChange={(e) => setFieldName(e.target.value)}
                        placeholder={t('enterFieldName')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fieldLocation">{t('location')}</Label>
                      <Input 
                        id="fieldLocation" 
                        value={fieldLocation} 
                        onChange={(e) => setFieldLocation(e.target.value)}
                        placeholder={t('enterLocation')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fieldSize">{t('fieldSize')} (ha)</Label>
                      <Input 
                        id="fieldSize" 
                        type="number" 
                        step="0.01"
                        value={fieldSize} 
                        onChange={(e) => setFieldSize(e.target.value)}
                        placeholder={t('enterFieldSize')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fieldDescription">{t('description')}</Label>
                      <Textarea 
                        id="fieldDescription" 
                        value={fieldDescription} 
                        onChange={(e) => setFieldDescription(e.target.value)}
                        placeholder={t('enterDescription')}
                        rows={4}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">{t('fieldName')}</h3>
                      <p className="mt-1 text-base">{field.name}</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">{t('location')}</h3>
                      <p className="mt-1 text-base">{field.location || '-'}</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">{t('fieldSize')}</h3>
                      <p className="mt-1 text-base">{formatFieldSize(field.size)}</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">{t('description')}</h3>
                      <p className="mt-1 text-base whitespace-pre-line">
                        {field.description || '-'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('fieldPhotos')}</CardTitle>
                <CardDescription>{t('fieldPhotosDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Current Photos */}
                {fieldImages && fieldImages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {fieldImages.map((image, index) => (
                      <div key={index} className="relative group overflow-hidden rounded-md border border-gray-200">
                        <img 
                          src={image} 
                          alt={`${field.name} - ${index + 1}`}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300"></div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleImageDelete(image)}
                            disabled={deleteImageMutation.isPending}
                          >
                            <span className="material-icons text-sm">delete</span>
                          </Button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-sm truncate">{t('photoNumber', { number: index + 1 })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-gray-300 rounded-md mb-6">
                    <div className="material-icons text-4xl text-gray-400 mb-2">photo_camera</div>
                    <p className="text-gray-500 mb-1">{t('noPhotosYet')}</p>
                    <p className="text-gray-400 text-sm">{t('addPhotosBelow')}</p>
                  </div>
                )}
                
                {/* Upload New Photos */}
                <div className="mt-4">
                  <h3 className="text-base font-medium mb-3">{t('addNewPhotos')}</h3>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    multiple 
                    accept="image/*" 
                    onChange={handleImageSelect}
                  />
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <span className="material-icons text-sm mr-1">add_photo_alternate</span>
                      {t('selectPhotos')}
                    </Button>
                    
                    {uploadedImages.length > 0 && (
                      <Button 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handleImageUpload}
                        disabled={uploadImageMutation.isPending}
                      >
                        {uploadImageMutation.isPending ? t('uploading') : t('uploadPhotos')}
                      </Button>
                    )}
                  </div>
                  
                  {/* Selected Image Preview */}
                  {uploadedImages.length > 0 && (
                    <div className="space-y-3 p-3 border border-gray-200 rounded-md">
                      <h4 className="text-sm font-medium">{t('selectedPhotos', { count: uploadedImages.length })}</h4>
                      
                      {uploadedImages.map((file, index) => {
                        const progress = uploadProgress[file.name] || 0;
                        return (
                          <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                            <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                              <img 
                                src={URL.createObjectURL(file)} 
                                alt={file.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-grow overflow-hidden">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              {progress > 0 && progress < 100 && (
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                  <div 
                                    className="bg-green-500 h-1.5 rounded-full" 
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-gray-500 hover:text-red-500"
                              onClick={() => handleCancelUpload(file.name)}
                            >
                              <span className="material-icons text-sm">close</span>
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('fieldTasks')}</CardTitle>
                    <CardDescription>{t('fieldTasksDescription')}</CardDescription>
                  </div>
                  <Button>
                    <span className="material-icons text-sm mr-1">add</span>
                    {t('addTask')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <TasksList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}