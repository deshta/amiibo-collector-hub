import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ProfileMenu } from '@/components/ProfileMenu';
import { Gamepad2, LogOut, User, Moon, Sun, Info, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

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
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [showProfile, setShowProfile] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

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
              Amiibo Tracker
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

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAbout(true)}
              className="gap-2"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">{t('header.about')}</span>
            </Button>
          </div>
        </div>
      </header>

      <ProfileMenu isOpen={showProfile} onClose={() => setShowProfile(false)} />

      {/* About Dialog */}
      <Dialog open={showAbout} onOpenChange={setShowAbout}>
        <DialogContent className="sm:max-w-lg max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-primary" />
              Amiibo Tracker
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
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
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
