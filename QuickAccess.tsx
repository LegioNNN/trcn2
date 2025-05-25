import React from 'react';
import { useTranslation } from '@/lib/i18n';
import { useLocation } from 'wouter';

interface QuickAccessItemProps {
  icon: string;
  label: string;
  onClick: () => void;
}

const QuickAccessItem: React.FC<QuickAccessItemProps> = ({ icon, label, onClick }) => {
  return (
    <button 
      className="bg-white rounded-lg shadow-sm p-3 flex flex-col items-center justify-center aspect-square"
      onClick={onClick}
    >
      <span className="material-icons text-primary text-2xl mb-1">{icon}</span>
      <span className="text-xs text-center">{label}</span>
    </button>
  );
};

export const QuickAccess: React.FC = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const quickAccessItems = [
    { 
      icon: 'add_circle', 
      label: t('newField'),
      action: () => setLocation('/fields/new')
    },
    { 
      icon: 'grass', 
      label: t('products'),
      action: () => setLocation('/products')
    },
    { 
      icon: 'task_alt', 
      label: t('tasks'),
      action: () => setLocation('/calendar')
    },
    { 
      icon: 'insert_chart', 
      label: t('reports'),
      action: () => setLocation('/reports')
    }
  ];

  return (
    <div className="px-4 mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">{t('quickAccess')}</h3>
      <div className="grid grid-cols-4 gap-3">
        {quickAccessItems.map((item, index) => (
          <QuickAccessItem
            key={index}
            icon={item.icon}
            label={item.label}
            onClick={item.action}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickAccess;
