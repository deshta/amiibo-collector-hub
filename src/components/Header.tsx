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
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-nintendo shadow-md transition-transform group-hover:scale-105">
              <Gamepad2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-extrabold text-xl text-foreground">
              Amiibo Collection
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              aria-label={t('header.toggleTheme')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {user && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowProfile(true)}
                  className="gap-2"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.email}</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">{t('header.signOut')}</span>
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
