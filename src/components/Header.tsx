import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { CurrencySwitcher } from '@/components/CurrencySwitcher';
import { ProfileMenu } from '@/components/ProfileMenu';
import { Gamepad2, LogOut, User, Moon, Sun, Info, Sparkles, Shield, Menu } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

const APP_VERSION = '1.0';

interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.0',
    date: '01/01/2026',
    changes: [
      'changelog.v1_feature1',
      'changelog.v1_feature2',
      'changelog.v1_feature3',
      'changelog.v1_feature4',
      'changelog.v1_feature5',
      'changelog.v1_feature6',
    ],
  },
];

export function Header() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [showProfile, setShowProfile] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleMobileNavigation = (action: () => void) => {
    action();
    setMobileMenuOpen(false);
  };

  // Handle browser back button to close drawer (mobile only)
  useEffect(() => {
    if (showAbout && isMobile) {
      window.history.pushState({ aboutDrawerOpen: true }, '');
      
      const handlePopState = () => {
        setShowAbout(false);
      };
      
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [showAbout, isMobile]);

  const handleAboutClose = (open: boolean) => {
    if (!open) {
      if (isMobile && window.history.state?.aboutDrawerOpen) {
        window.history.back();
      } else {
        setShowAbout(false);
      }
    }
  };

  const aboutContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-center">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-nintendo shadow-lg">
          <Gamepad2 className="w-10 h-10 text-primary-foreground" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-foreground">
          {t('about.version')}: {APP_VERSION}
        </p>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        {t('about.description')}
      </p>

      <Separator />

      {/* Changelog */}
      <div className="space-y-4">
        <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          {t('about.changelog')}
        </h3>
        
        {CHANGELOG.map((entry, index) => (
          <div key={entry.version} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">v{entry.version}</span>
              <span className="text-xs text-muted-foreground">{entry.date}</span>
            </div>
            <ul className="space-y-1 pl-4">
              {entry.changes.map((changeKey, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>{t(changeKey)}</span>
                </li>
              ))}
            </ul>
            {index < CHANGELOG.length - 1 && <Separator className="mt-3" />}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-nintendo shadow-md transition-transform group-hover:scale-105">
              <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <span className="font-extrabold text-base sm:text-xl text-foreground">
              Amiibo Tracker
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-2">
            <LanguageSwitcher />
            <CurrencySwitcher />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full w-9 h-9"
              aria-label={t('header.toggleTheme')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {user && (
              <>
                {isAdmin && (
                  <Button variant="ghost" asChild className="px-3 py-2">
                    <Link to="/admin">
                      <Shield className="w-4 h-4 mr-2" />
                      Admin
                    </Link>
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  onClick={() => setShowProfile(true)}
                  className="px-3 py-2"
                >
                  <User className="w-4 h-4 mr-2" />
                  {user.email}
                </Button>
                <Button variant="ghost" onClick={signOut} className="px-3 py-2">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('header.signOut')}
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              onClick={() => setShowAbout(true)}
              className="px-3 py-2"
            >
              <Info className="w-4 h-4 mr-2" />
              {t('header.about')}
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="flex sm:hidden items-center gap-1">
            <LanguageSwitcher />
            <CurrencySwitcher />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full w-8 h-8"
              aria-label={t('header.toggleTheme')}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-primary" />
                    Menu
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-6">
                  {user && (
                    <>
                      {isAdmin && (
                        <Button 
                          variant="ghost" 
                          asChild 
                          className="justify-start"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Link to="/admin">
                            <Shield className="w-4 h-4 mr-3" />
                            Admin
                          </Link>
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        onClick={() => handleMobileNavigation(() => setShowProfile(true))}
                        className="justify-start"
                      >
                        <User className="w-4 h-4 mr-3" />
                        {t('header.profile')}
                      </Button>
                      <Separator className="my-2" />
                      <Button 
                        variant="ghost" 
                        onClick={() => handleMobileNavigation(signOut)}
                        className="justify-start text-destructive hover:text-destructive"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        {t('header.signOut')}
                      </Button>
                    </>
                  )}

                  <Separator className="my-2" />

                  <Button
                    variant="ghost"
                    onClick={() => handleMobileNavigation(() => setShowAbout(true))}
                    className="justify-start"
                  >
                    <Info className="w-4 h-4 mr-3" />
                    {t('header.about')}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <ProfileMenu isOpen={showProfile} onClose={() => setShowProfile(false)} />

      {/* About - Drawer on Mobile, Dialog on Desktop */}
      {isMobile ? (
        <Drawer open={showAbout} onOpenChange={handleAboutClose}>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader className="pb-2">
              <DrawerTitle className="flex items-center justify-center gap-2">
                <Gamepad2 className="w-5 h-5 text-primary" />
                Amiibo Tracker
              </DrawerTitle>
            </DrawerHeader>
            <ScrollArea className="max-h-[60vh] px-4 pb-6">
              {aboutContent}
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showAbout} onOpenChange={handleAboutClose}>
          <DialogContent className="sm:max-w-md max-h-[85vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center gap-2">
                <Gamepad2 className="w-5 h-5 text-primary" />
                Amiibo Tracker
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              {aboutContent}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}