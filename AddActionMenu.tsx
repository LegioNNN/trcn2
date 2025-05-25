import React from 'react';
import { useTranslation } from '@/lib/i18n';
import { useLocation } from 'wouter';

interface AddActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddActionMenu: React.FC<AddActionMenuProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  
  const menuOptions = [
    { 
      icon: 'add_location', 
      label: t('newField'),
      action: () => {
        setLocation('/fields/new');
        onClose();
      }
    },
    { 
      icon: 'add_task', 
      label: t('newTask'),
      action: () => {
        setLocation('/calendar/new');
        onClose();
      }
    },
    { 
      icon: 'grass', 
      label: t('newProduct'),
      action: () => {
        setLocation('/products/new');
        onClose();
      }
    }
  ];
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-xl w-full max-w-md animate-slideUp p-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{t('addNewItem')}</h3>
          <button className="p-1" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {menuOptions.map((option, index) => (
            <button
              key={index}
              className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100"
              onClick={option.action}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                <span className="material-icons">{option.icon}</span>
              </div>
              <span className="text-xs text-center">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddActionMenu;
