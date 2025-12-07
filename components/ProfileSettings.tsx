import React, { useState, useRef } from 'react';
import { User } from '../types';
import { updateUserProfile } from '../services/authService';
import { X, Camera, Save, LogOut } from 'lucide-react';

interface ProfileSettingsProps {
  user: User;
  onClose: () => void;
  onUpdate: (user: User) => void;
  onLogout: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onClose, onUpdate, onLogout }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatar(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const updated = updateUserProfile(user.id, { name, avatar });
    onUpdate(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-revo-teal/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-revo-surface border border-revo-emerald/30 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">Profil bearbeiten</h2>

        <div className="flex flex-col items-center mb-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-full border-4 border-revo-teal shadow-xl overflow-hidden bg-revo-teal">
                {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-revo-emerald text-white text-3xl font-bold">
                        {name.charAt(0)}
                    </div>
                )}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
            </div>
            <div className="absolute bottom-0 right-0 bg-revo-gold p-1.5 rounded-full border-2 border-revo-surface text-revo-teal">
                <Camera className="w-4 h-4" />
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleAvatarChange}
          />
        </div>

        <div className="space-y-4">
            <div>
                <label className="text-xs font-bold text-revo-gold uppercase tracking-wide ml-1 block mb-1">Name</label>
                <input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-revo-teal border border-revo-emerald/50 rounded-xl px-4 py-3 text-white focus:border-revo-gold focus:ring-1 focus:ring-revo-gold focus:outline-none"
                />
            </div>
            
            <button 
                onClick={handleSave}
                className="w-full py-3 bg-revo-emerald hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
            >
                <Save className="w-5 h-5" /> Änderungen speichern
            </button>
            
            <div className="h-px bg-revo-teal my-2"></div>

            <button 
                onClick={onLogout}
                className="w-full py-3 bg-revo-teal border border-revo-error/30 text-revo-error hover:bg-revo-error/10 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
                <LogOut className="w-5 h-5" /> Abmelden
            </button>
        </div>
      </div>
    </div>
  );
};