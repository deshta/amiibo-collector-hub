import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ProfileMenu } from '@/components/ProfileMenu';
import { Gamepad2, LogOut, User, Moon, Sun } from 'lucide-react';

export function Header() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [showProfile, setShowProfile] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-nintendo shadow-md transition-transform group-hover:scale-105">
              <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <span className="font-extrabold text-base sm:text-xl text-foreground hidden xs:inline">
              Amiibo Collection
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full h-8 w-8 sm:h-9 sm:w-9"
              aria-label={t('header.toggleTheme')}
            >
              <Sun className="h-4 w-4 sm:h-5 sm:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 sm:h-5 sm:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {user && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowProfile(true)}
                  className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 sm:gap-2"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">{user.email}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={signOut}
                  className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2 text-sm">{t('header.signOut')}</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <ProfileMenu isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </>
  );
}
