import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { authStore } from '@/stores/authStore';
import { useI18n } from '@/lib/i18n';
import { ChevronRight, Lock, LogOut, Phone, Mail, Globe, Clock, Shield, Building2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ProfileScreen() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language, setLanguage } = useI18n();
  const profile = authStore((state) => state.profile);
  const logout = authStore((state) => state.logout);
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState('+355 69 123 4567'); // Mock phone
  const [isEditing, setIsEditing] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
  };

  const handleSaveProfile = () => {
    if (profile) {
      authStore.getState().setProfile({
        ...profile,
        name,
      });
      setIsEditing(false);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
    }
  };

  const handleLanguageChange = (lang: 'en' | 'sq') => {
    setLanguage(lang);
    if (profile) {
      authStore.getState().setProfile({
        ...profile,
        preferences: {
          ...profile.preferences,
          language: lang === 'sq' ? 'al' : 'en', // Map sq to al for profile
        },
      });
    }
    setIsLanguageOpen(false);
    toast({
      title: t('auth.profile.language'),
      description: t('auth.profile.language'),
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('auth.profile.title')} />
      <div className="space-y-4 px-4 py-4">
        {/* Profile Header */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-6">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#164945] text-2xl font-semibold text-white">
                {getInitials(profile?.name || 'User')}
              </div>
              <div className="text-center">
                <h2 className="text-lg font-semibold text-foreground">{profile?.name || 'User'}</h2>
                <p className="text-sm text-muted-foreground">
                  {profile?.role || 'Staff'} • {profile?.clientName || 'Company'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <div className="space-y-2">
          <h3 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('auth.profile.personalInfo')}
          </h3>
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-0">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex w-full items-center justify-between gap-3 border-b border-border py-3 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-foreground">{t('auth.profile.name')}</div>
                </div>
                <div className="flex flex-1 items-center justify-end gap-2">
                  <span className="text-sm text-muted-foreground">{name || '—'}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
              <div className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium text-foreground">{t('auth.profile.email')}</div>
                </div>
                <div className="flex flex-1 items-center justify-end gap-2">
                  <span className="text-sm text-muted-foreground">{profile?.email || '—'}</span>
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 py-3 last:border-b-0">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium text-foreground">{t('auth.profile.phone')}</div>
                </div>
                <div className="flex flex-1 items-center justify-end gap-2">
                  <span className="text-sm text-muted-foreground">{phone}</span>
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security */}
        <div className="space-y-2">
          <h3 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('auth.profile.security')}</h3>
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-0">
              <ChangePasswordDialog />
              <button
                type="button"
                onClick={() => navigate('/account/recent-logins')}
                className="flex w-full items-center justify-between gap-3 border-t border-border py-3"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium text-foreground">{t('auth.profile.recentLogins')}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Preferences */}
        <div className="space-y-2">
          <h3 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('auth.profile.preferences')}</h3>
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-0">
              <button
                type="button"
                onClick={() => setIsLanguageOpen(true)}
                className="flex w-full items-center justify-between gap-3 border-b border-border py-3"
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium text-foreground">{t('auth.profile.language')}</div>
                </div>
                <div className="flex flex-1 items-center justify-end gap-2">
                  <span className="text-sm text-muted-foreground">
                    {(profile?.preferences?.language === 'al' || language === 'sq') ? t('auth.profile.albanian') : t('auth.profile.english')}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
              <div className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium text-foreground">{t('auth.profile.timezone')}</div>
                </div>
                <div className="flex flex-1 items-center justify-end gap-2">
                  <span className="text-sm text-muted-foreground">
                    {profile?.preferences?.timezone || 'Europe/Tirana'}
                  </span>
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Access */}
        <div className="space-y-2">
          <h3 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('auth.profile.myAccess')}</h3>
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-0">
              <button
                type="button"
                onClick={() => navigate('/account/permissions')}
                className="flex w-full items-center justify-between gap-3 border-b border-border py-3"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium text-foreground">{t('auth.profile.myPermissions')}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/account/warehouses')}
                className="flex w-full items-center justify-between gap-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium text-foreground">{t('auth.profile.myWarehouses')}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </CardContent>
          </Card>
        </div>

        {/* About */}
        <div className="space-y-2">
          <h3 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('auth.profile.about')}</h3>
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-0">
              <div className="flex items-center justify-between gap-3 border-b border-border py-3">
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium text-foreground">{t('auth.profile.company')}</div>
                </div>
                <span className="text-sm text-muted-foreground">{profile?.clientName || '—'}</span>
              </div>
              <div className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium text-foreground">{t('auth.profile.appVersion')}</div>
                </div>
                <span className="text-sm text-muted-foreground">1.0.0</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logout */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-0 py-0">
            <Button
              className="w-full border-none bg-red-700 text-white hover:bg-red-800"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t('common.logout')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Edit Name Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('auth.profile.editName')}</DialogTitle>
            <DialogDescription>{t('auth.profile.updateDisplayName')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('auth.profile.name')}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('auth.profile.name')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSaveProfile}
              className="border-none bg-[#164945] text-white hover:bg-[#123b37]"
            >
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Language Selection Dialog */}
      <Dialog open={isLanguageOpen} onOpenChange={setIsLanguageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('auth.profile.selectLanguage')}</DialogTitle>
            <DialogDescription>{t('auth.profile.chooseLanguage')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              className={`w-full rounded-lg border p-3 text-left transition-colors ${
                (profile?.preferences?.language !== 'al' && language !== 'sq')
                  ? 'border-[#164945] bg-[#164945]/10'
                  : 'border-border hover:bg-muted'
              }`}
            >
              <div className="font-medium text-foreground">{t('auth.profile.english')}</div>
              <div className="text-xs text-muted-foreground">{t('auth.profile.english')}</div>
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('sq')}
              className={`w-full rounded-lg border p-3 text-left transition-colors ${
                (profile?.preferences?.language === 'al' || language === 'sq')
                  ? 'border-[#164945] bg-[#164945]/10'
                  : 'border-border hover:bg-muted'
              }`}
            >
              <div className="font-medium text-foreground">{t('auth.profile.albanian')}</div>
              <div className="text-xs text-muted-foreground">Shqip</div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ChangePasswordDialog() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }
    // TODO: API call
    toast({
      title: 'Password changed',
      description: 'Your password has been updated successfully',
    });
    setOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 py-3"
        >
          <div className="flex items-center gap-3">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm font-medium text-foreground">{t('auth.profile.changePassword')}</div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('auth.profile.changePasswordTitle')}</DialogTitle>
          <DialogDescription>{t('auth.profile.changePasswordDesc')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">{t('auth.profile.currentPassword')}</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t('auth.profile.currentPassword')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">{t('auth.profile.newPassword')}</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('auth.profile.newPassword')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">{t('auth.profile.confirmPassword')}</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('auth.profile.confirmPassword')}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleChangePassword}
            className="border-none bg-[#164945] text-white hover:bg-[#123b37]"
          >
            {t('auth.profile.changePasswordButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
