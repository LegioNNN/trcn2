import React from 'react';
import { useTranslation } from '@/lib/i18n';
import { User } from '@shared/schema';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoute: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  user: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeRoute,
  onNavigate,
  onLogout,
  user
}) => {
  const { t } = useTranslation();

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();
  };

  const menuItems = [
    { icon: "dashboard", label: "dashboard", path: "/dashboard" },
    { icon: "map", label: "fields", path: "/fields" },
    { icon: "grass", label: "products", path: "/products" },
    { icon: "event", label: "calendar", path: "/calendar" },
    { icon: "task_alt", label: "tasks", path: "/tasks" },
    { icon: "insert_chart", label: "reports", path: "/reports" }
  ];

  const settingsItems = [
    { icon: "person", label: "profile", path: "/profile" },
    { icon: "settings", label: "settings", path: "/settings" },
  ];

  return (
    <div 
      className={`fixed inset-y-0 left-0 max-w-xs w-3/4 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white mr-3">
              <span className="text-sm font-medium">{getUserInitials()}</span>
            </div>
            <div>
              <h3 className="text-sm font-medium">{user?.name}</h3>
              <p className="text-xs text-gray-500">Çiftçi</p>
            </div>
            <button className="ml-auto p-1" onClick={onClose}>
              <span className="material-icons text-gray-600">close</span>
            </button>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`sidebar-item flex items-center px-4 py-3 text-sm rounded-lg hover:bg-gray-100 w-full text-left ${
                  activeRoute === item.path 
                    ? 'text-primary bg-primary/10' 
                    : 'text-gray-700'
                }`}
              >
                <span className="material-icons mr-3">{item.icon}</span>
                <span>{t(item.label)}</span>
              </button>
            ))}
          </div>
          
          <div className="border-t border-gray-200 my-2"></div>
          
          <div className="space-y-1">
            {settingsItems.map((item) => (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`sidebar-item flex items-center px-4 py-3 text-sm rounded-lg hover:bg-gray-100 w-full text-left ${
                  activeRoute === item.path 
                    ? 'text-primary bg-primary/10' 
                    : 'text-gray-700'
                }`}
              >
                <span className="material-icons mr-3">{item.icon}</span>
                <span>{t(item.label)}</span>
              </button>
            ))}
            <button
              onClick={onLogout}
              className="sidebar-item flex items-center px-4 py-3 text-sm rounded-lg hover:bg-gray-100 w-full text-left text-red-600"
            >
              <span className="material-icons mr-3">logout</span>
              <span>{t('logout')}</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
