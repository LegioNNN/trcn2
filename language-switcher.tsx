import React from 'react';
import { useTranslation } from '@/lib/i18n';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface LanguageSwitcherProps {
  variant?: 'default' | 'outline' | 'icon';
  size?: 'sm' | 'default';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'outline',
  size = 'default'
}) => {
  const { currentLanguage, setLanguage } = useTranslation();

  const languageNames = {
    tr: 'Türkçe',
    en: 'English'
  };
  
  const languageIcons = {
    tr: '🇹🇷',
    en: '🇬🇧'
  };

  const handleLanguageChange = (lang: 'tr' | 'en') => {
    setLanguage(lang);
  };

  if (variant === 'icon') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="px-2">
            <span>{languageIcons[currentLanguage]}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleLanguageChange('tr')}>
            <span className="mr-2">{languageIcons.tr}</span>
            <span>Türkçe</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
            <span className="mr-2">{languageIcons.en}</span>
            <span>English</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
        >
          <span className="mr-2">{languageIcons[currentLanguage]}</span>
          <span>{languageNames[currentLanguage]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLanguageChange('tr')}>
          <span className="mr-2">{languageIcons.tr}</span>
          <span>Türkçe</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
          <span className="mr-2">{languageIcons.en}</span>
          <span>English</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
