import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from '@/components/ui/toaster';
import { Route, Switch, useLocation } from 'wouter';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Sayfa importları
import DashboardPage from './pages/dashboard';
import FieldsPage from './pages/fields';
import ProductsPage from './pages/products';
import ProductDetailPage from './pages/product-detail';
import CalendarPage from './pages/calendar';
import TasksPage from './pages/tasks';
import ReportsPage from './pages/reports_enhanced';
import SettingsPage from './pages/settings';
import FieldDetailPage from './pages/field-detail';
import ProfilePage from './pages/profile';
import NotFound from './pages/not-found';
import AuthPage from './pages/auth';

// Route koruyucu bileşen
function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType, path: string }) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        <span className="ml-3 text-green-600">Yükleniyor...</span>
      </div>
    );
  }
  
  if (!user) return null; // Navigate işlemi gerçekleşene kadar boş sayfa göster
  
  return <Component />;
}

function AppRoutes() {
  const { loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        <span className="ml-3 text-green-600">Yükleniyor...</span>
      </div>
    );
  }
  
  return (
    <div className="app-container">
      <Toaster />
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/" component={() => <ProtectedRoute path="/" component={DashboardPage} />} />
        <Route path="/dashboard" component={() => <ProtectedRoute path="/dashboard" component={DashboardPage} />} />
        <Route path="/fields" component={() => <ProtectedRoute path="/fields" component={FieldsPage} />} />
        <Route path="/fields/:id" component={() => <ProtectedRoute path="/fields/:id" component={FieldDetailPage} />} />
        <Route path="/products" component={() => <ProtectedRoute path="/products" component={ProductsPage} />} />
        <Route path="/products/:id" component={() => <ProtectedRoute path="/products/:id" component={ProductDetailPage} />} />
        <Route path="/calendar" component={() => <ProtectedRoute path="/calendar" component={CalendarPage} />} />
        <Route path="/tasks" component={() => <ProtectedRoute path="/tasks" component={TasksPage} />} />
        <Route path="/reports" component={() => <ProtectedRoute path="/reports" component={ReportsPage} />} />
        <Route path="/settings" component={() => <ProtectedRoute path="/settings" component={SettingsPage} />} />
        <Route path="/profile" component={() => <ProtectedRoute path="/profile" component={ProfilePage} />} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;