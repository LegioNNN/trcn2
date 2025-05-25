import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from '@/lib/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Sidebar from './Sidebar';
import AddActionMenu from './AddActionMenu';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const { toast } = useToast();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  const closeUserDropdown = () => {
    setUserDropdownOpen(false);
  };

  const toggleAddMenu = () => {
    setAddMenuOpen(!addMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    setLocation('/auth');
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();
  };

  const isActive = (path: string) => {
    return location === path;
  };

  const navigateTo = (path: string) => {
    setLocation(path);
    closeSidebar();
    closeUserDropdown();
  };

  // Return main layout with header, main content, and navigation
  return (
    <div className="flex flex-col h-full">
      {/* Header/Navbar */}
      <header className="bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3 relative">
        <div className="flex items-center">
          <button id="sidebar-toggle" className="p-1" onClick={toggleSidebar}>
            <span className="material-icons text-gray-600">menu</span>
          </button>
          <h1 className="text-lg font-semibold text-primary ml-3">TARCAN</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            id="notification-btn" 
            className="p-1 relative hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => {
              toast({
                title: "Bildirimler",
                description: "Yeni bildiriminiz bulunmamaktadır.",
                duration: 3000,
              });
            }}
          >
            <span className="material-icons text-gray-600">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-secondary rounded-full"></span>
          </button>
          <button 
            id="user-menu-btn" 
            className="flex items-center hover:bg-gray-100 rounded-full p-1 transition-colors" 
            onClick={toggleUserDropdown}
            aria-expanded={userDropdownOpen}
          >
            <span id="user-name" className="text-sm font-medium mr-1 hidden sm:block">
              {user?.name}
            </span>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
              <span className="text-xs font-medium">{getUserInitials()}</span>
            </div>
          </button>
        </div>

        {/* User dropdown menu */}
        {userDropdownOpen && (
          <div className="dropdown-menu absolute right-4 top-14 w-48 bg-white rounded-lg shadow-lg py-2 z-20 transform scale-100 opacity-100">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.phone}</p>
            </div>
            <button
              onClick={() => navigateTo('/profile')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <span className="material-icons text-sm mr-2 align-text-bottom">person</span>
              {t('profile')}
            </button>
            <button
              onClick={() => navigateTo('/settings')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <span className="material-icons text-sm mr-2 align-text-bottom">settings</span>
              {t('settings')}
            </button>
            <div className="border-t border-gray-100 my-1"></div>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <span className="material-icons text-sm mr-2 align-text-bottom">logout</span>
              {t('logout')}
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-neutral-light relative">
        {children}
      </main>

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar}
        activeRoute={location}
        onNavigate={navigateTo}
        onLogout={handleLogout}
        user={user}
      />

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 opacity-100"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 flex justify-around py-2 z-30">
        <button
          onClick={() => navigateTo('/dashboard')}
          className={`flex flex-col items-center justify-center p-2 ${
            isActive('/dashboard') || isActive('/') ? 'text-primary' : 'text-gray-600'
          }`}
        >
          <span className="material-icons text-xl">dashboard</span>
          <span className="text-xs">{t('dashboard')}</span>
        </button>
        <button
          onClick={() => navigateTo('/fields')}
          className={`flex flex-col items-center justify-center p-2 ${
            isActive('/fields') ? 'text-primary' : 'text-gray-600'
          }`}
        >
          <span className="material-icons text-xl">map</span>
          <span className="text-xs">{t('fields')}</span>
        </button>
        <button
          onClick={toggleAddMenu}
          className="rounded-full bg-primary text-white w-12 h-12 flex items-center justify-center shadow-lg transform -translate-y-4"
        >
          <span className="material-icons">add</span>
        </button>
        <button
          onClick={() => navigateTo('/products')}
          className={`flex flex-col items-center justify-center p-2 ${
            isActive('/products') ? 'text-primary' : 'text-gray-600'
          }`}
        >
          <span className="material-icons text-xl">grass</span>
          <span className="text-xs">{t('products')}</span>
        </button>
        <button
          onClick={() => navigateTo('/calendar')}
          className={`flex flex-col items-center justify-center p-2 ${
            isActive('/calendar') ? 'text-primary' : 'text-gray-600'
          }`}
        >
          <span className="material-icons text-xl">event</span>
          <span className="text-xs">{t('calendar')}</span>
        </button>
      </nav>

      {/* Add Action Menu */}
      <AddActionMenu isOpen={addMenuOpen} onClose={() => setAddMenuOpen(false)} />
    </div>
  );
};

export default MainLayout;