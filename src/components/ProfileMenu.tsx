import { useState, useEffect } from 'react';
import { User, Calendar, Globe, Trash2, Loader2, Lock, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCurrency, CURRENCIES, Currency } from '@/hooks/useCurrency';
import { supabase } from '@/integrations/supabase/client';

const COUNTRIES = [
  { code: 'BR', name: 'Brasil' },
  { code: 'US', name: 'United States' },
  { code: 'JP', name: '日本 (Japan)' },
  { code: 'DE', name: 'Deutschland' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'España' },
  { code: 'IT', name: 'Italia' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'MX', name: 'México' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'PE', name: 'Perú' },
  { code: 'NL', name: 'Nederland' },
  { code: 'BE', name: 'België' },
  { code: 'AT', name: 'Österreich' },
  { code: 'CH', name: 'Schweiz' },
  { code: 'KR', name: '대한민국 (South Korea)' },
  { code: 'CN', name: '中国 (China)' },
  { code: 'OTHER', name: 'Other' },
];

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileMenu({ isOpen, onClose }: ProfileMenuProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { currency, setCurrency } = useCurrency();
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [country, setCountry] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadProfile();
    }
  }, [isOpen, user]);

  // Handle browser back button (mobile only)
  useEffect(() => {
    if (isOpen && isMobile) {
      window.history.pushState({ profileOpen: true }, '');
      
      const handlePopState = () => {
        onClose();
      };
      
      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, onClose, isMobile]);

  const handleClose = (open: boolean) => {
    if (!open) {
      if (isMobile && window.history.state?.profileOpen) {
        window.history.back();
      } else {
        onClose();
      }
    }
  };

  const loadProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('username, birthdate, country')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setName(data.username || '');
      setBirthdate(data.birthdate || '');
      setCountry(data.country || '');
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: name,
          birthdate: birthdate || null,
          country: country || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: t('profile.saved'),
        description: t('profile.savedDesc'),
      });
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: t('profile.error'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setDeleting(true);
    try {
      const { error } = await supabase.rpc('delete_user_account');

      if (error) throw error;

      toast({
        title: t('profile.deleted'),
        description: t('profile.deletedDesc'),
      });

      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: t('profile.error'),
        variant: 'destructive',
      });
      setDeleting(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: t('profile.error'),
        description: t('profile.passwordMismatch'),
        variant: 'destructive',
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: t('profile.error'),
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }
    
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      toast({
        title: t('profile.passwordChanged'),
        description: t('profile.passwordChangedDesc'),
      });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: t('profile.passwordError'),
        variant: 'destructive',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const profileContent = (
    <div className="space-y-4 p-1">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="flex items-center gap-2 text-sm">
          <User className="w-3.5 h-3.5" />
          {t('profile.name')}
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('profile.namePlaceholder')}
          className="h-10"
        />
      </div>

      {/* Birthdate */}
      <div className="space-y-1.5">
        <Label htmlFor="birthdate" className="flex items-center gap-2 text-sm">
          <Calendar className="w-3.5 h-3.5" />
          {t('profile.birthdate')}
        </Label>
        <Input
          id="birthdate"
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          className="h-10"
        />
      </div>

      {/* Country */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-2 text-sm">
          <Globe className="w-3.5 h-3.5" />
          {t('profile.country')}
        </Label>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder={t('profile.countryPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                <div className="flex items-center gap-2">
                  {c.code !== 'OTHER' && (
                    <img
                      src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`}
                      alt={c.name}
                      className="w-5 h-auto rounded-sm"
                    />
                  )}
                  {c.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Currency */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-2 text-sm">
          <Coins className="w-3.5 h-3.5" />
          {t('profile.currency')}
        </Label>
        <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder={t('profile.currencyPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{c.symbol}</span>
                  <span>{c.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Save Button */}
      <Button
        className="w-full h-10"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t('profile.saving')}
          </>
        ) : (
          t('profile.save')
        )}
      </Button>

      {/* Change Password Section */}
      <div className="pt-3 border-t border-border">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-medium text-sm">
            <Lock className="w-3.5 h-3.5 text-primary" />
            {t('profile.changePassword')}
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-sm">{t('profile.newPassword')}</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm">{t('profile.confirmPassword')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10"
            />
          </div>
          
          <Button
            variant="secondary"
            className="w-full h-10"
            onClick={handlePasswordChange}
            disabled={changingPassword || !newPassword || !confirmPassword}
          >
            {changingPassword ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('profile.saving')}
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                {t('profile.changePassword')}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Delete Account Section */}
      <div className="pt-3 border-t border-destructive/20">
        <div className="rounded-lg bg-destructive/10 p-3 space-y-2">
          <div className="flex items-center gap-2 text-destructive font-medium text-sm">
            <Trash2 className="w-3.5 h-3.5" />
            {t('profile.deleteAccount')}
          </div>
          <p className="text-xs text-muted-foreground">
            {t('profile.deleteWarning')}
          </p>
          <Button
            variant="destructive"
            className="w-full h-9"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('profile.deleteAccount')}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: Drawer, Desktop: Dialog */}
      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={handleClose}>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader className="pb-2">
              <DrawerTitle className="flex items-center justify-center gap-2">
                <User className="w-5 h-5 text-primary" />
                {t('profile.title')}
              </DrawerTitle>
              <DrawerDescription className="text-center">
                {user?.email}
              </DrawerDescription>
            </DrawerHeader>

            <div className="px-4 pb-6 overflow-y-auto">
              {profileContent}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-md max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center gap-2">
                <User className="w-5 h-5 text-primary" />
                {t('profile.title')}
              </DialogTitle>
              <DialogDescription className="text-center">
                {user?.email}
              </DialogDescription>
            </DialogHeader>
              {profileContent}
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('profile.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('profile.deleteWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {t('profile.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('profile.deleting')}
                </>
              ) : (
                t('profile.deleteButton')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}