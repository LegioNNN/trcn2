import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const AuthPage: React.FC = () => {
  const { login, register, user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('login');
  
  // Login form values
  const [loginPhone, setLoginPhone] = useState('05554443322');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form values
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Kullanıcı zaten giriş yapmışsa, dashboard'a yönlendirilsin
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(loginPhone, loginPassword);
      toast({
        title: "Giriş başarılı",
        description: "Hoş geldiniz!",
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Giriş başarısız",
        description: "Lütfen bilgilerinizi kontrol edip tekrar deneyin",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (regPassword !== regConfirmPassword) {
      toast({
        title: "Kayıt başarısız",
        description: "Şifreler eşleşmiyor",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(regName, regPhone, regPassword);
      toast({
        title: "Kayıt başarılı",
        description: "Şimdi giriş yapabilirsiniz",
      });
      setActiveTab('login');
    } catch (error) {
      toast({
        title: "Kayıt başarısız",
        description: "Bir hata oluştu, lütfen tekrar deneyin",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="grid w-full lg:grid-cols-2 gap-8 max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Sol taraf - Form */}
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-green-600">TARCAN</h1>
            <p className="text-gray-600">Çiftçilik Yönetim Sistemi</p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Giriş</TabsTrigger>
              <TabsTrigger value="register">Kayıt Ol</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-phone">Telefon Numarası</Label>
                  <Input 
                    id="login-phone"
                    placeholder="05XX XXX XXXX"
                    type="tel"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Şifre</Label>
                  </div>
                  <div className="relative">
                    <Input 
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      {showLoginPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Ad Soyad</Label>
                  <Input 
                    id="register-name"
                    placeholder="Ad Soyad"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-phone">Telefon Numarası</Label>
                  <Input 
                    id="register-phone"
                    placeholder="05XX XXX XXXX"
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">Şifre</Label>
                  <div className="relative">
                    <Input 
                      id="register-password"
                      type={showRegPassword ? "text" : "password"}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                    >
                      {showRegPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">Şifre Tekrar</Label>
                  <Input 
                    id="register-confirm-password"
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  {isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sağ taraf - Tanıtım */}
        <div className="hidden lg:block bg-green-600 text-white p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-4">TARCAN ile Çiftçilikte Yeni Bir Dönem</h2>
          <p className="mb-6">Modern çiftçilik yönetim sistemi ile:</p>
          <ul className="space-y-3">
            <li className="flex items-start">
              <svg className="h-6 w-6 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Tarlalarınızı dijital haritada takip edin</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Ürün takibi ve planlama yapın</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Hava durumunu ve analizleri görüntüleyin</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Yapılacak işleri ve görevleri planlayın</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;