import { Search, Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useCustomerSettings } from '@/contexts/CustomerContext';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
interface HeaderProps {
  toggleSidebar: () => void;
  openSettings: () => void;
}

export function Header({ toggleSidebar, openSettings }: HeaderProps) {
  const { t } = useTranslation();
  const { branding, isAgencyMode } = useCustomerSettings();
  
  // Determine what to show in the header based on mode
  const displayName = isAgencyMode ? 'CRM Platform' : branding.companyName;
  const showLogo = branding.logoUrl && !isAgencyMode;
  
  return (
    <header className="sticky top-0 z-30 bg-background border-b border-border h-16 flex items-center px-4 md:px-6 shadow-sm">
      <div className="flex items-center gap-2 md:gap-4 w-full">
        <Button onClick={toggleSidebar} variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        <div className="hidden md:flex md:w-[240px]">
          <Link to="/" className="flex items-center space-x-2">
            {showLogo && (
              <img 
                src={branding.logoUrl} 
                alt={branding.companyName}
                className="h-8 w-auto object-contain"
              />
            )}
            <h1 
              className={`text-xl font-bold tracking-tight ${!isAgencyMode ? 'text-primary' : ''}`}
            >
              {displayName}
            </h1>
          </Link>
        </div>

        <div className="flex items-center md:ml-auto md:gap-4 gap-2">
          <div className="relative hidden md:flex md:flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder={t('placeholders.searchLeadsCompany')} className="pl-8 bg-muted/30 border-muted focus-visible:ring-primary" />
          </div>

          <LanguageSwitcher />

          <ThemeToggle />

          <NotificationCenter />

          <Button variant="ghost" size="icon" onClick={openSettings}>
            <Settings className="h-5 w-5" />
            <span className="sr-only">{t('navigation.settings')}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-primary text-white">JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>{t('buttons.myAccount')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{t('buttons.profile')}</DropdownMenuItem>
              <DropdownMenuItem>{t('navigation.settings')}</DropdownMenuItem>
              <DropdownMenuItem>{t('navigation.billing')}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{t('buttons.logOut')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
