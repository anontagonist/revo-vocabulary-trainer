
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { loginUser, registerUser, getLastEmail, loginWithGoogle } from '../services/authService';
import { UserPlus, LogIn, Lock, Mail, User as UserIcon, BookOpen, ShieldCheck } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recognizedUser, setRecognizedUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const lastEmail = getLastEmail();
    if (lastEmail) {
      setEmail(lastEmail);
      const usersRaw = localStorage.getItem('revo_users');
      if (usersRaw) {
        const users = JSON.parse(usersRaw) as User[];
        const u = users.find(x => x.email.toLowerCase() === lastEmail.toLowerCase());
        if (u) setRecognizedUser(u.name);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    await new Promise(r => setTimeout(r, 600));

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Once Firebase is connected, this will open the Google Popup
      const user = await loginWithGoogle();
      onLogin(user);
    } catch (err) {
      setError("Google Login fehlgeschlagen.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-revo-teal selection:bg-revo-gold selection:text-revo-teal">
      
      {/* Decorative background elements */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-revo-gold/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-revo-emerald/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative">
        <div className="bg-revo-surface/40 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 md:p-10 shadow-2xl relative z-10">
          
          <div className="flex flex-col items-center mb-8">
             {/* Logo restored to previous style */}
             <div className="w-16 h-16 bg-revo-gold/10 border border-revo-gold/30 rounded-2xl flex items-center justify-center mb-4">
                <BookOpen className="w-10 h-10 text-revo-gold" />
             </div>
             <h1 className="text-3xl font-black text-white uppercase tracking-tighter">REVO</h1>
             <p className="text-slate-400 text-sm font-medium mt-1">Intelligentes Vokabeltraining</p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-lg font-bold text-white text-center">
              {recognizedUser && isLogin ? `Hi ${recognizedUser}! 👋` : (isLogin ? 'Willkommen zurück' : 'Starte jetzt kostenlos')}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-revo-gold uppercase tracking-[0.2em] ml-2">Dein Vorname</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-revo-gold transition-colors" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-revo-teal/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:border-revo-gold focus:ring-0 focus:outline-none transition-all"
                    placeholder="Rena"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-revo-gold uppercase tracking-[0.2em] ml-2">E-Mail Adresse</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-revo-gold transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-revo-teal/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:border-revo-gold focus:ring-0 focus:outline-none transition-all"
                  placeholder="name@beispiel.de"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-revo-gold uppercase tracking-[0.2em] ml-2">Passwort</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-revo-gold transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus={recognizedUser ? true : false}
                  className="w-full bg-revo-teal/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:border-revo-gold focus:ring-0 focus:outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-revo-error/10 border border-revo-error/20 text-revo-error p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-1.5 h-1.5 rounded-full bg-revo-error animate-pulse"></div>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-revo-gold hover:bg-yellow-500 disabled:bg-revo-gold/50 text-revo-teal font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-revo-gold/10 transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                  <div className="w-6 h-6 border-2 border-revo-teal/30 border-t-revo-teal rounded-full animate-spin"></div>
              ) : (
                  <>
                      {isLogin ? (
                          <>Anmelden <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                      ) : (
                          <>Konto erstellen <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" /></>
                      )}
                  </>
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-4">
             <div className="relative flex items-center">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">oder</span>
                <div className="flex-grow border-t border-white/5"></div>
             </div>

             <button
               onClick={handleGoogleSignIn}
               disabled={isLoading}
               className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-4 rounded-2xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-3 border border-slate-200"
             >
               <svg className="w-5 h-5" viewBox="0 0 24 24">
                 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
               </svg>
               Mit Google anmelden
             </button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                  setIsLogin(!isLogin);
                  setRecognizedUser(null);
                  if(isLogin) setEmail('');
              }}
              className="text-xs font-bold text-slate-500 hover:text-revo-gold transition-colors uppercase tracking-widest"
            >
              {isLogin ? "Noch kein Konto? Jetzt registrieren" : "Bereits ein Konto? Hier anmelden"}
            </button>
          </div>
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            Sichere Datenübertragung & Cloud Sync
        </div>
      </div>
    </div>
  );
};
