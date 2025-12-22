
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { updateUserProfile } from '../services/authService';
import { exportAllData, importAllData } from '../services/storageService';
import { X, Camera, Save, LogOut, Key, Download, Upload, ShieldCheck } from 'lucide-react';

interface ProfileSettingsProps {
  user: User;
  onClose: () => void;
  onUpdate: (user: User) => void;
  onLogout: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onClose, onUpdate, onLogout }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const [newPassword, setNewPassword] = useState('');
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revo_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (importAllData(content)) {
          alert("Backup erfolgreich geladen! Die App wird neu geladen.");
          window.location.reload();
        } else {
          alert("Fehler beim Importieren. Datei beschädigt?");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSave = () => {
    try {
      const updates: Partial<User> = { name, avatar };
      if (newPassword.trim()) updates.password = newPassword;
      const updated = updateUserProfile(user.id, updates);
      onUpdate(updated);
      setSaveStatus('SUCCESS');
      setTimeout(() => { setSaveStatus('IDLE'); onClose(); }, 1000);
    } catch { setSaveStatus('ERROR'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-revo-teal/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-revo-surface border border-revo-emerald/30 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">Profil & Sicherheit</h2>

        <div className="flex flex-col items-center mb-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-full border-4 border-revo-teal shadow-xl overflow-hidden bg-revo-teal">
                {avatar ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-revo-emerald text-white text-3xl font-bold">{name.charAt(0)}</div>}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
        </div>

        <div className="space-y-4">
            <div>
                <label className="text-xs font-bold text-revo-gold uppercase tracking-wide ml-1 block mb-1">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-revo-teal border border-revo-emerald/50 rounded-xl px-4 py-3 text-white focus:border-revo-gold focus:outline-none" />
            </div>

            <div>
                <label className="text-xs font-bold text-revo-gold uppercase tracking-wide ml-1 block mb-1">Neues Passwort</label>
                <div className="relative">
                    <Key className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                    <input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-revo-teal border border-revo-emerald/50 rounded-xl px-4 pl-10 py-3 text-white focus:border-revo-gold focus:outline-none" />
                </div>
            </div>
            
            <button onClick={handleSave} disabled={saveStatus !== 'IDLE'} className={`w-full py-3 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${saveStatus === 'SUCCESS' ? 'bg-revo-success' : 'bg-revo-emerald hover:bg-emerald-600'} text-white`}>
                {saveStatus === 'SUCCESS' ? 'Gespeichert!' : <><Save className="w-5 h-5" /> Profil speichern</>}
            </button>
            
            <div className="pt-4 mt-2 border-t border-revo-teal">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Datensicherung
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleExport} className="flex flex-col items-center justify-center gap-2 p-3 bg-revo-teal border border-revo-emerald/30 rounded-xl hover:bg-revo-emerald/20 transition-colors group">
                        <Download className="w-5 h-5 text-revo-gold group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-white">Exportieren</span>
                    </button>
                    <button onClick={() => importInputRef.current?.click()} className="flex flex-col items-center justify-center gap-2 p-3 bg-revo-teal border border-revo-emerald/30 rounded-xl hover:bg-revo-emerald/20 transition-colors group">
                        <Upload className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-white">Importieren</span>
                    </button>
                </div>
                <input type="file" ref={importInputRef} className="hidden" accept=".json" onChange={handleImport} />
                <p className="text-[9px] text-slate-500 mt-2 text-center">Tipp: Speichere das Backup in deinem Google Drive oder iCloud.</p>
            </div>

            <button onClick={onLogout} className="w-full py-3 mt-4 bg-transparent border border-revo-error/30 text-revo-error hover:bg-revo-error/10 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                <LogOut className="w-5 h-5" /> Abmelden
            </button>
        </div>
      </div>
    </div>
  );
};
