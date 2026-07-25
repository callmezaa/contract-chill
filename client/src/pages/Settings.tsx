import { User, Bell, Shield, Camera, Loader2, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { updateProfile, deleteUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Button } from '@/components/motion/button';
import { Switch } from '@/components/motion/switch';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

export const Settings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [notifications, setNotifications] = useState({
    analysis: true,
    weekly: false
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useDocumentTitle(t('settings.title'));

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().notifications) {
        setNotifications(docSnap.data().notifications);
      }
    };
    loadSettings();
  }, [user]);

  const toggleNotification = async (key: 'analysis' | 'weekly') => {
    if (!user) return;
    const newNotifications = { ...notifications, [key]: !notifications[key] };
    setNotifications(newNotifications);
    
    try {
      await setDoc(doc(db, 'users', user.uid), {
        notifications: newNotifications
      }, { merge: true });
      toast.success(t('settings.toasts.settingsSaved', {
        type: key === 'analysis' ? t('settings.notifications.analysisComplete') : t('settings.notifications.weeklySummary'),
        status: !notifications[key] ? 'enabled' : 'disabled'
      }));
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(t('settings.toasts.settingsSaveFailed'));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsUpdating(true);
    try {
      await updateProfile(user, { displayName });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      toast.success(t('settings.toasts.profileUpdated'));
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('settings.toasts.profileUpdateFailed'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const { data } = await api.post('/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await updateProfile(user, { photoURL: data.photoURL });
      toast.success(t('settings.toasts.photoUploaded'));
      window.location.reload(); 
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error(t('settings.toasts.photoUploadFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(t('settings.deleteConfirm'));
    
    if (!confirmed) return;

    try {
      await deleteUser(user);
      toast.success(t('settings.toasts.accountDeleted'));
    } catch (error: any) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/requires-recent-login') {
        toast.error(t('settings.toasts.securityCheck'), { description: t('settings.toasts.securityCheckDesc') });
      } else {
        toast.error(t('settings.toasts.deleteFailed'), { description: t('settings.toasts.deleteFailedDesc') });
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-[-0.05em] text-text">{t('settings.header')}</h1>
          <p className="text-text-muted text-sm mt-1">{t('settings.subtitle')}</p>
        </div>
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20 text-sm font-medium shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              {t('settings.changesSaved')}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile Card */}
      <Card className="p-8" size="sm">
      <form onSubmit={handleUpdateProfile} className="flex flex-col gap-8 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
        <h2 className="text-lg font-display font-semibold text-text leading-tight">{t('settings.profile.title')}</h2>
            <p className="text-xs text-text-muted mt-0.5 font-medium">{t('settings.profile.subtitle')}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-10">
          {/* Avatar Upload */}
          <div className="relative group self-center md:self-start">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={`relative w-28 h-28 rounded-[2rem] border-4 border-background shadow-2xl shadow-primary/10 overflow-hidden bg-surface-2 flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:shadow-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/20 ${isUploading ? 'cursor-wait' : 'cursor-pointer'}`}
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <div className="flex flex-col items-center gap-1 opacity-20 transition-transform duration-500 group-hover:scale-110">
                  <User className="w-10 h-10" />
                </div>
              )}
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <Camera className="w-5 h-5 text-white/90" />
                <span className="text-[10px] font-bold text-white/90 tracking-wide">{t('settings.profile.changePhoto')}</span>
              </div>

              {/* Uploading State */}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-10">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              className="hidden"
              accept="image/*"
              title="Profile Picture"
            />
          </div>

          <div className="flex-1 grid grid-cols-1 gap-6 w-full">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-text-subtle ml-1">{t('settings.profile.displayName')}</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input px-5 py-3.5 bg-background focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold border-border/50 hover:border-primary/20"
                placeholder={t('settings.profile.displayNamePlaceholder')}
                required
                title="Display Name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-text-subtle ml-1">{t('settings.profile.emailAddress')}</label>
              <input
                type="text"
                value={user?.email || ''}
                disabled
                className="input px-5 py-3.5 bg-surface/50 cursor-not-allowed text-sm font-medium text-text-muted border-dashed"
                title="Email Address"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-border/40">
          <Button
            type="submit"
            disabled={isUpdating || displayName === user?.displayName}
          >
            {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('common.buttons.saveChanges')}
          </Button>
        </div>
      </form>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {/* Notifications Card */}
        <Card className="p-7 flex flex-col gap-6" size="sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center">
              <Bell className="w-4.5 h-4.5 text-primary" />
            </div>
            <h2 className="text-base font-display font-bold text-text">{t('settings.notifications.title')}</h2>
          </div>
          
          <div className="flex flex-col gap-4 mt-1">
            {[
              { id: 'analysis', title: t('settings.notifications.analysisComplete'), desc: t('settings.notifications.analysisCompleteDesc') },
              { id: 'weekly', title: t('settings.notifications.weeklySummary'), desc: t('settings.notifications.weeklySummaryDesc') }
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between group">
                <div>
                  <p className="text-sm font-bold text-text">{item.title}</p>
                  <p className="text-[10px] text-text-muted font-medium">{item.desc}</p>
                </div>
                <Switch
                  checked={notifications[item.id as keyof typeof notifications]}
                  onCheckedChange={() => toggleNotification(item.id as any)}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Danger Zone Card */}
        <Card className="p-7 flex flex-col gap-6 bg-red-500/5 border-red-500/20 md:col-span-2 relative overflow-hidden group" size="sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
            </div>
            <h2 className="text-base font-display font-bold text-red-500">{t('settings.dangerZone.title')}</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div>
              <p className="text-sm font-bold text-text">{t('settings.dangerZone.deleteAccount')}</p>
              <p className="text-[12px] text-text-muted mt-1 max-w-sm leading-relaxed">
                {t('settings.dangerZone.deleteDescription')}
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleDeleteAccount}
              className="bg-red-500 hover:bg-red-600 text-white shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              {t('common.buttons.deleteAccount')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
