import { useState, useEffect } from 'react';
import { User, Calendar, Globe, Trash2, Loader2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              {t('profile.title')}
            </DialogTitle>
            <DialogDescription>
              {user?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {t('profile.name')}
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('profile.namePlaceholder')}
              />
            </div>

            {/* Birthdate */}
            <div className="space-y-2">
              <Label htmlFor="birthdate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t('profile.birthdate')}
              </Label>
              <Input
                id="birthdate"
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
              />
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {t('profile.country')}
              </Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
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

            {/* Save Button */}
            <Button
              className="w-full"
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
            <div className="pt-4 border-t border-border">
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-medium">
                  <Lock className="w-4 h-4 text-primary" />
                  {t('profile.changePassword')}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('profile.newPassword')}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('profile.confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={async () => {
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
                  }}
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
            <div className="pt-4 border-t border-destructive/20">
              <div className="rounded-lg bg-destructive/10 p-4 space-y-3">
                <div className="flex items-center gap-2 text-destructive font-medium">
                  <Trash2 className="w-4 h-4" />
                  {t('profile.deleteAccount')}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('profile.deleteWarning')}
                </p>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('profile.deleteAccount')}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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