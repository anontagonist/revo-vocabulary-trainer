import React, { useState } from 'react';
import { User } from '../types';
import { loginUser, registerUser } from '../services/authService';
import { ArrowRight, UserPlus, LogIn, Lock, Mail, User as UserIcon } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isLogin) {
        const user = loginUser(email, password);
        onLogin(user);
      } else {
        if (!name.trim()) throw new Error("Bitte gib Deinen Namen an.");
        const user = registerUser(email, password, name);
        onLogin(user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-revo-teal">
      <div className="w-full max-w-md bg-revo-surface border border-revo-emerald/30 rounded-3xl p-8 shadow-2xl">
        
        <div className="flex justify-center mb-6">
           <div className="w-20 h-20 bg-revo-emerald/20 rounded-2xl flex items-center justify-center border border-revo-emerald/50 overflow-hidden shadow-lg">
             <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Neck/Back - Dark Teal */}
              <path d="M15 40 L45 35 L55 60 L40 90 L10 75 Z" fill="#0A3D45" stroke="#0A3D45" strokeWidth="2" strokeLinejoin="round" />
              
              {/* Head Top - Emerald */}
              <path d="M30 15 L65 20 L55 45 L45 35 Z" fill="#1A5F54" stroke="#1A5F54" strokeWidth="2" strokeLinejoin="round" />
              
              {/* Cheek - Lighter Surface/Teal */}
              <path d="M45 35 L55 45 L55 60 L45 55 Z" fill="#2E8C7A" stroke="#2E8C7A" strokeWidth="2" strokeLinejoin="round" />
              
              {/* Upper Beak - Gold */}
              <path d="M55 45 L65 20 L90 50 L55 60 Z" fill="#D4AF37" stroke="#D4AF37" strokeWidth="2" strokeLinejoin="round" />
              
              {/* Lower Beak - Darker Gold */}
              <path d="M55 60 L90 50 L75 80 Z" fill="#B4941F" stroke="#B4941F" strokeWidth="2" strokeLinejoin="round" />
              
              {/* Eye */}
              <circle cx="50" cy="30" r="4" fill="#D4AF37" />
             </svg>
           </div>
        </div>
        
        <h2 className="text-2xl font-extrabold text-center text-white mb-2">
          {isLogin ? 'Willkommen zurück' : 'Konto erstellen'}
        </h2>
        <p className="text-center text-revo-text mb-8 text-sm">
          Revo Vocabulary Trainer v1.1
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-revo-gold uppercase tracking-wide ml-1">Dein Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-revo-teal border border-revo-emerald/50 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:border-revo-gold focus:ring-1 focus:ring-revo-gold focus:outline-none"
                  placeholder="Wie sollen wir Dich nennen?"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-revo-gold uppercase tracking-wide ml-1">E-Mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-revo-teal border border-revo-emerald/50 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:border-revo-gold focus:ring-1 focus:ring-revo-gold focus:outline-none"
                placeholder="name@beispiel.de"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-revo-gold uppercase tracking-wide ml-1">Passwort</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-revo-teal border border-revo-emerald/50 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:border-revo-gold focus:ring-1 focus:ring-revo-gold focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-revo-error/20 border border-revo-error/50 text-revo-error p-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <span className="block w-1.5 h-1.5 rounded-full bg-revo-error"></span>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-revo-gold hover:bg-yellow-500 text-revo-teal font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 mt-2 flex items-center justify-center gap-2"
          >
            {isLogin ? (
                <>
                    <LogIn className="w-5 h-5" /> Anmelden
                </>
            ) : (
                <>
                    <UserPlus className="w-5 h-5" /> Registrieren
                </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            {isLogin ? "Noch kein Konto? Jetzt registrieren" : "Bereits ein Konto? Hier anmelden"}
          </button>
        </div>
      </div>
    </div>
  );
};