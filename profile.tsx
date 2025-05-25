import React, { useState } from 'react';
import { useLocation } from 'wouter';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  
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
    <MainLayout title="Profilim">
      <div className="container p-4 mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Profilim</h1>
        </div>
        
        {!showEditProfile ? (
          <Card className="bg-white shadow-sm max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Kullanıcı Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Ad Soyad</h3>
                  <p className="text-lg">{user.name}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Telefon Numarası</h3>
                  <p className="text-lg">{user.phone}</p>
                </div>
                
                <div className="pt-4">
                  <Button
                    onClick={() => setShowEditProfile(true)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Profili Düzenle
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white shadow-sm max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Profili Düzenle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-500">Adınız:</label>
                  <input 
                    id="name"
                    type="text" 
                    defaultValue={user.name}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="surname" className="text-sm font-medium text-gray-500">Soyadınız:</label>
                  <input 
                    id="surname"
                    type="text" 
                    defaultValue={user.name.split(' ').slice(1).join(' ')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-gray-500">Telefon Numaranız:</label>
                  <input 
                    id="phone"
                    type="text" 
                    defaultValue={user.phone}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <Button
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800"
                    onClick={() => setShowEditProfile(false)}
                  >
                    İptal
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => setShowEditProfile(false)}
                  >
                    Kaydet
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}