import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Logo } from "./Logo";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/i18n";

// Login form schema
const loginSchema = z.object({
  phone: z.string().min(10, "Geçerli bir telefon numarası giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

// Register form schema
const registerSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  phone: z.string().min(10, "Geçerli bir telefon numarası giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  confirmPassword: z.string().min(6, "Şifre tekrarı en az 6 karakter olmalıdır"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export const AuthForms: React.FC = () => {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tabValue, setTabValue] = useState<'login' | 'register'>('login');
  
  console.log('AuthForms rendered');
  
  // Form definitions
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "05554443322",
      password: "password123",
    },
  });
  
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(values.phone, values.password);
      setLocation('/dashboard');
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

  const onRegisterSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await register(values.name, values.phone, values.password);
      toast({
        title: "Kayıt başarılı",
        description: "Giriş sayfasına yönlendiriliyorsunuz",
      });
      setTabValue('login');
    } catch (error) {
      toast({
        title: "Kayıt başarısız",
        description: "Lütfen bilgilerinizi kontrol edip tekrar deneyin",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    toast({
      title: "Google ile giriş",
      description: "Bu özellik şu anda geliştirme aşamasındadır",
    });
  };

  return (
    <div className="absolute inset-0 z-40 px-6 pt-6 pb-6 bg-white bg-pattern">
      <div className="flex justify-between">
        <Logo size="small" />
      </div>
      
      <div className="w-full max-w-md mx-auto mt-8">
        <Tabs value={tabValue} onValueChange={(v) => setTabValue(v as 'login' | 'register')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t('login')}</TabsTrigger>
            <TabsTrigger value="register">{t('register')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-6">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                <FormField
                  control={loginForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('phoneNumber')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="05XX XXX XXXX"
                          type="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t('password')}</Label>
                    <Button variant="link" size="sm" className="text-xs h-auto p-0">
                      {t('forgotPassword')}
                    </Button>
                  </div>
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="relative">
                          <FormControl>
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <span className="material-icons text-gray-500 text-xl">
                              {showPassword ? "visibility_off" : "visibility"}
                            </span>
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="material-icons animate-spin mr-2">autorenew</span>
                      {t('loading')}
                    </span>
                  ) : (
                    t('login')
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="relative mt-8 mb-4">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">{t('or')}</span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center"
              onClick={handleGoogleLogin}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M12 5c1.6 0 3 .6 4.1 1.5l3-3C17 1.9 14.7 1 12 1 7.3 1 3.4 3.9 1.8 8l3.5 2.7C6 8 8.7 5 12 5z"/>
                <path fill="#34A853" d="M12 23c4.7 0 8.6-2.9 10.2-7l-3.5-2.7c-1 2.3-3.3 3.9-6.7 3.9-3.3 0-6-2.8-6.7-6.1L1.8 13.8C3.4 19.1 7.3 23 12 23z"/>
                <path fill="#FBBC05" d="M5.3 14.7l-3.5 2.7C3.4 20.1 7.3 23 12 23c2.7 0 5-1 6.8-2.6l-3.5-2.7c-1 .7-2.1 1.1-3.3 1.1-3.3 0-6-2.8-6.7-6.1z"/>
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.5l3-3C17 1.9 14.7 1 12 1 7.3 1 3.4 3.9 1.8 8l3.5 2.7C6 8 8.7 5 12 5z"/>
              </svg>
              {t('googleLogin')}
            </Button>
          </TabsContent>
          
          <TabsContent value="register" className="mt-6">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fullName')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('phoneNumber')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="05XX XXX XXXX"
                          type="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('password')}</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <span className="material-icons text-gray-500 text-xl">
                            {showPassword ? "visibility_off" : "visibility"}
                          </span>
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Şifre Tekrarı</FormLabel>
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="material-icons animate-spin mr-2">autorenew</span>
                      {t('loading')}
                    </span>
                  ) : (
                    t('register')
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthForms;