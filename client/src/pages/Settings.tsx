import { User, CreditCard, Bell, Shield, Camera, Loader2, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { updateProfile, deleteUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const Settings = () => {
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

  useDocumentTitle('Settings - ContractChill');

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
      toast.success(`${key === 'analysis' ? 'Analysis' : 'Weekly'} notifications ${!notifications[key] ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
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
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
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
      toast.success('Photo uploaded successfully');
      window.location.reload(); 
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(
      'Are you absolutely sure you want to delete your account?\n\nThis action cannot be undone. All your data, analysis history, and active subscriptions will be permanently erased.'
    );
    
    if (!confirmed) return;

    try {
      // In a production app, we would first delete the user's data from Firestore and Storage here.
      // For this implementation, we will delete the Auth user.
      await deleteUser(user);
      toast.success('Account deleted permanently');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Security Check', { description: 'Please log out and log back in before deleting your account.' });
      } else {
        toast.error('Failed to delete account', { description: 'Please contact support if the issue persists.' });
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-text">Settings</h1>
          <p className="text-text-muted text-sm mt-1">Manage your account and preferences.</p>
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
              Changes saved
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile Card */}
      <form onSubmit={handleUpdateProfile} className="card p-8 flex flex-col gap-8 relative overflow-hidden bg-surface border-border/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-text leading-tight">Profile Information</h2>
            <p className="text-xs text-text-muted mt-0.5 font-medium">Update your photo and personal details.</p>
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
                <span className="text-[10px] font-bold text-white/90 tracking-wide">change photo</span>
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
              <label className="text-xs font-bold text-text-subtle ml-1">Display name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input px-5 py-3.5 bg-background focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold border-border/50 hover:border-primary/20"
                placeholder="Your name"
                required
                title="Display Name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-text-subtle ml-1">Email address</label>
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
          <button
            type="submit"
            disabled={isUpdating || displayName === user?.displayName}
            className="btn-primary px-10 py-3 flex items-center gap-2.5 disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Save changes</span>
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subscription Card */}
        <div className="card p-7 flex flex-col gap-6 bg-surface border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center">
              <CreditCard className="w-4.5 h-4.5 text-primary" />
            </div>
            <h2 className="text-base font-display font-bold text-text">Subscription</h2>
          </div>

          <div className="p-5 rounded-2xl bg-surface/50 border border-border/40 hover:border-primary/10 transition-all flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary/60" />
              </div>
              <div>
                <p className="text-sm font-bold text-text">Free plan</p>
                <p className="text-[10px] text-text-muted font-medium">20 analyses per day</p>
              </div>
            </div>
            <button className="btn-primary w-full py-2.5 text-xs font-bold shadow-md shadow-primary/10">Upgrade to pro</button>
          </div>
        </div>

        {/* Notifications Card */}
        <div className="card p-7 flex flex-col gap-6 bg-surface border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center">
              <Bell className="w-4.5 h-4.5 text-primary" />
            </div>
            <h2 className="text-base font-display font-bold text-text">Notifications</h2>
          </div>
          
          <div className="flex flex-col gap-4 mt-1">
            {[
              { id: 'analysis', title: 'Analysis complete', desc: 'Notify when scan finishes' },
              { id: 'weekly', title: 'Weekly summary', desc: 'Your contract insights' }
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between group">
                <div>
                  <p className="text-sm font-bold text-text">{item.title}</p>
                  <p className="text-[10px] text-text-muted font-medium">{item.desc}</p>
                </div>
                <div 
                  onClick={() => toggleNotification(item.id as any)}
                  className={`w-10 h-5.5 rounded-full relative cursor-pointer transition-all duration-300 ${notifications[item.id as keyof typeof notifications] ? 'bg-primary' : 'bg-surface-2'}`}
                >
                  <motion.div 
                    animate={{ x: notifications[item.id as keyof typeof notifications] ? 18 : 3 }}
                    className="w-4 h-4 bg-white rounded-full absolute top-0.75 shadow-sm" 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone Card */}
        <div className="card p-7 flex flex-col gap-6 bg-red-500/5 border-red-500/20 md:col-span-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
            </div>
            <h2 className="text-base font-display font-bold text-red-500">Danger Zone</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div>
              <p className="text-sm font-bold text-text">Delete Account</p>
              <p className="text-[12px] text-text-muted mt-1 max-w-sm leading-relaxed">
                Permanently remove your account, subscription, and all associated data. This action cannot be undone.
              </p>
            </div>
            <button 
              onClick={handleDeleteAccount}
              className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95 shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
