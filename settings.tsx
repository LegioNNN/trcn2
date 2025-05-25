import React, { useState } from 'react';
import { useLocation } from 'wouter';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SettingsPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [language, setLanguage] = useState<string>('tr');
  const [theme, setTheme] = useState<string>('light');
  
  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="p-4 text-center">
            <p className="text-gray-600">Kullanıcı girişi yapılmamış</p>
            <Button 
              className="mt-4 bg-green-600 hover:bg-green-700"
              onClick={() => navigate('/')}
            >
              Ana Sayfaya Dön
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout title="Ayarlar">
      <div className="container p-4 mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Ayarlar</h1>
        </div>
        
        <Card className="bg-white shadow-sm max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Ayarlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Bildirim Ayarları */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Bildirim Ayarları</h3>
                <p className="text-gray-600 text-sm">
                  Bildirim ayarlarınızı buradan yapabilirsiniz (henüz işlevsel değil).
                </p>
              </div>
              
              {/* Dil Seçimi */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Dil Seçimi</h3>
                <Select 
                  value={language}
                  onValueChange={setLanguage}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Dil seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tr">Türkçe</SelectItem>
                    <SelectItem value="en">İngilizce</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Tema Ayarları */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Tema Ayarları</h3>
                <RadioGroup 
                  value={theme} 
                  onValueChange={setTheme}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light">Açık</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark">Koyu</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Kaydet Butonu */}
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => {
                  // İşlevsiz olduğu için sadece console.log ekledim
                  console.log('Ayarlar kaydedildi:', { language, theme });
                }}
              >
                Kaydet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}