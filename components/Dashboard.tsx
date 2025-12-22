
import React, { useState, useEffect } from 'react';
import { VocabSet, QuizDirection, User, AppView } from '../types';
import { Plus, BookOpen, Trash2, ChevronRight, Languages, ArrowLeftRight, Flame, Trophy, Clock, BarChart3, Crown, User as UserIcon, BookCopy, GripHorizontal, CheckSquare, CloudCheck, CloudOff, Layers } from 'lucide-react';
import { getStreakInfo, getSyncStatus } from '../services/storageService';
import { ProfileSettings } from './ProfileSettings';

interface DashboardProps {
  user: User;
  sets: VocabSet[];
  onDeleteSet: (id: string) => void;
  onSelectSet: (set: VocabSet, mode: AppView, direction: QuizDirection) => void;
  onCreateNew: () => void;
  onStartToughMode: (direction: QuizDirection) => void;
  onShowStats: () => void;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  toughItemsCount: number;
}

const StreakDisplay: React.FC<{ userId: string }> = ({ userId }) => {
  const [streak, setStreak] = useState(() => getStreakInfo(userId));

  return (
    <div className="flex items-center gap-2">
      {streak.isBroken ? (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-revo-error/10 border border-revo-error/50 rounded-xl text-revo-error text-xs font-bold" title={`Pause seit ${streak.daysMissed} Tagen`}>
          <Flame className="w-3.5 h-3.5" />
          <span>{streak.daysMissed} d Pause</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-revo-success/10 border border-revo-success/50 rounded-xl text-revo-success text-xs font-bold" title="Aktueller Streak">
          <Flame className="w-3.5 h-3.5 fill-revo-success" />
          <span>{streak.current} d Streak</span>
        </div>
      )}
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ user, sets, onDeleteSet, onSelectSet, onCreateNew, onStartToughMode, onShowStats, onUpdateUser, onLogout, toughItemsCount }) => {
  const [selectedSet, setSelectedSet] = useState<VocabSet | null>(null);
  const [showToughModeModal, setShowToughModeModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isSynced, setIsSynced] = useState(true);
  
  const [selectionStep, setSelectionStep] = useState<'MODE' | 'DIRECTION'>('MODE');
  const [selectedMode, setSelectedMode] = useState<AppView>(AppView.QUIZ);

  useEffect(() => {
    // Simulate real-time sync check
    const interval = setInterval(() => {
      setIsSynced(getSyncStatus(user.id));
    }, 5000);
    return () => clearInterval(interval);
  }, [user.id]);

  const handleSetClick = (set: VocabSet) => {
    setSelectedSet(set);
    setSelectionStep('MODE');
  };

  const handleModeSelect = (mode: AppView) => {
    setSelectedMode(mode);
    setSelectionStep('DIRECTION');
  };

  const startQuiz = (direction: QuizDirection) => {
    if (selectedSet) {
      onSelectSet(selectedSet, selectedMode, direction);
      setSelectedSet(null);
      setSelectionStep('MODE');
    }
  };

  const startToughMode = (direction: QuizDirection) => {
    onStartToughMode(direction);
    setShowToughModeModal(false);
  };

  const getLanguageName = () => {
    return selectedSet?.metadata?.language || "Fremdsprache";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-revo-success';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-orange-500';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 relative">
      
      {/* Premium Navigation Header with Restored Logo */}
      <div className="flex items-center justify-between gap-3 pb-6 border-b border-revo-emerald/20">
         <div className="flex items-center gap-4">
            <div className="bg-revo-gold/10 p-2 rounded-2xl border border-revo-gold/20">
                <BookOpen className="w-8 h-8 text-revo-gold" />
            </div>
            <div className="flex flex-col">
                <h1 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tight uppercase">REVO</h1>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user.name}</span>
                    {isSynced ? (
                      <span title="Gesichert in Cloud"><CloudCheck className="w-3.5 h-3.5 text-revo-success" /></span>
                    ) : (
                      <span title="Warte auf Sync..."><CloudOff className="w-3.5 h-3.5 text-slate-500" /></span>
                    )}
                </div>
            </div>
         </div>

         <div className="flex items-center gap-3">
             <button 
                onClick={onShowStats}
                className="p-2.5 bg-revo-surface hover:bg-revo-emerald/30 text-slate-400 hover:text-white rounded-xl transition-all border border-revo-emerald/20"
                title="Statistik"
             >
                <BarChart3 className="w-5 h-5" />
             </button>
             
             <div className="relative cursor-pointer group" onClick={() => setShowProfile(true)}>
                 {user.avatar ? (
                   <img src={user.avatar} alt="Avatar" className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-revo-gold/50 shadow-lg object-cover bg-revo-teal group-hover:border-revo-gold transition-colors" />
                 ) : (
                   <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-revo-gold/50 shadow-lg bg-revo-emerald flex items-center justify-center text-white text-lg font-bold group-hover:bg-emerald-700 transition-colors">
                     {user.name.charAt(0)}
                   </div>
                 )}
                 {user.isPremium && <Crown className="absolute -top-1 -right-1 w-4 h-4 text-revo-gold fill-revo-gold drop-shadow-md" />}
             </div>
         </div>
      </div>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-white">Deine Lernwelt</h2>
            <p className="text-slate-400 text-sm font-medium">Bereit für die nächste 100%?</p>
        </div>

        <div className="flex items-center gap-3">
          <StreakDisplay userId={user.id} />
          <button
            onClick={onCreateNew}
            className="flex items-center justify-center gap-2 bg-revo-gold hover:bg-yellow-500 text-revo-teal px-5 py-3 rounded-2xl shadow-xl shadow-revo-teal/50 transition-all active:scale-95 font-black uppercase text-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Set scannen</span>
          </button>
        </div>
      </header>

      {sets.length > 0 && (
        <div className="mb-8">
          {toughItemsCount > 0 ? (
            <div 
              onClick={() => setShowToughModeModal(true)}
              className="bg-gradient-to-r from-orange-600 to-rose-700 rounded-2xl p-6 shadow-xl cursor-pointer transform hover:scale-[1.01] transition-all relative overflow-hidden group border border-white/10"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all rotate-12 group-hover:rotate-0">
                <Flame className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl flex-shrink-0 border border-white/20">
                  <Flame className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Tough Mode 🔥</h3>
                  <p className="text-orange-50/80 text-sm font-medium">
                    Du hast <span className="text-white font-bold">{toughItemsCount}</span> knifflige Vokabeln zu meistern.
                  </p>
                </div>
                <div className="ml-auto bg-white/10 p-2 rounded-full backdrop-blur-sm group-hover:translate-x-1 transition-transform">
                  <ChevronRight className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-revo-surface/50 border border-revo-success/20 rounded-2xl p-6 flex items-center gap-4 shadow-lg backdrop-blur-sm">
              <div className="p-3 bg-revo-success/10 rounded-2xl flex-shrink-0 border border-revo-success/20">
                <Trophy className="w-8 h-8 text-revo-success" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Perfekter Stand! 🏆</h3>
                <p className="text-slate-400 text-sm">
                  Aktuell keine schwierigen Wörter. Zeit für ein neues Kapitel?
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {sets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-revo-surface/30 rounded-[32px] border-2 border-dashed border-revo-emerald/20 text-center p-8">
          <div className="bg-revo-teal p-5 rounded-3xl mb-6 border border-revo-emerald/30 shadow-inner">
            <BookOpen className="w-10 h-10 text-revo-gold opacity-50" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Deine Liste ist leer</h3>
          <p className="text-slate-400 max-w-xs text-sm leading-relaxed mb-8">
            Fotografiere deine Vokabelseiten und REVO erstellt dir automatisch Karteikarten und Spiele.
          </p>
          <button onClick={onCreateNew} className="bg-revo-emerald hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-95">
             Jetzt erste Seite scannen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sets.map((set) => (
            <div
              key={set.id}
              className="group relative bg-revo-surface rounded-3xl p-6 shadow-lg border border-revo-emerald/10 hover:border-revo-gold/40 transition-all cursor-pointer flex flex-col justify-between h-full overflow-hidden"
              onClick={() => handleSetClick(set)}
            >
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${set.color} opacity-80`}></div>
              
              <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-revo-teal/50 rounded-xl border border-revo-emerald/20">
                         <Languages className="w-4 h-4 text-revo-gold" />
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if(confirm("Set löschen?")) onDeleteSet(set.id);
                        }}
                        className="p-2 text-slate-500 hover:text-revo-error hover:bg-revo-error/10 rounded-xl transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <h3 className="font-bold text-lg text-white leading-tight mb-2 group-hover:text-revo-gold transition-colors">{set.title}</h3>
                
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-revo-teal px-2 py-1 rounded-lg">
                        {set.items.length} Wörter
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(set.createdAt)}
                    </span>
                </div>
              </div>

              <div className="mt-6">
                 {set.lastScore !== undefined && (
                   <div className="mb-4">
                     <div className="flex justify-between text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">
                       <span>Training</span>
                       <span>{set.lastScore}%</span>
                     </div>
                     <div className="w-full bg-revo-teal rounded-full h-1.5 overflow-hidden">
                       <div 
                         className={`h-full rounded-full transition-all duration-700 ease-out ${getScoreColor(set.lastScore)}`}
                         style={{ width: `${set.lastScore}%` }}
                       ></div>
                     </div>
                   </div>
                 )}

                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-revo-gold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Jetzt üben</span>
                    <div className="w-8 h-8 rounded-full bg-revo-emerald/20 flex items-center justify-center text-revo-gold border border-revo-emerald/20 group-hover:bg-revo-gold group-hover:text-revo-teal transition-all">
                        <ChevronRight className="w-5 h-5" />
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(selectedSet || showToughModeModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-revo-teal/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-revo-surface border border-revo-emerald/30 rounded-[40px] p-8 w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-300">
            
            {selectionStep === 'MODE' && !showToughModeModal && (
                <>
                    <div className="text-center mb-8">
                        <div className="inline-flex p-3 bg-revo-gold/10 rounded-2xl border border-revo-gold/20 mb-4">
                            <Layers className="w-6 h-6 text-revo-gold" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Trainingsmodus</h3>
                        <p className="text-slate-400 text-sm mt-1 font-medium">Wähle deine Methode für "{selectedSet?.title}"</p>
                    </div>
                    <div className="space-y-3">
                         <button onClick={() => handleModeSelect(AppView.QUIZ)} className="w-full p-4 bg-revo-teal/50 hover:bg-revo-emerald/20 border border-revo-emerald/10 hover:border-revo-gold/50 rounded-3xl flex items-center gap-4 transition-all group">
                             <div className="w-12 h-12 bg-revo-emerald/20 rounded-2xl flex items-center justify-center text-revo-gold group-hover:scale-110 transition-transform">
                                 <BookCopy className="w-6 h-6" />
                             </div>
                             <div className="text-left flex-1">
                                 <span className="block font-bold text-white">Karteikarten</span>
                                 <span className="text-xs text-slate-500">Klassisch & hocheffektiv.</span>
                             </div>
                             <ChevronRight className="w-5 h-5 text-slate-600" />
                         </button>

                         <button onClick={() => handleModeSelect(AppView.MATCHING_GAME)} className="w-full p-4 bg-revo-teal/50 hover:bg-revo-emerald/20 border border-revo-emerald/10 hover:border-revo-gold/50 rounded-3xl flex items-center gap-4 transition-all group">
                             <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                                 <GripHorizontal className="w-6 h-6" />
                             </div>
                             <div className="text-left flex-1">
                                 <span className="block font-bold text-white">Match the Cards</span>
                                 <span className="text-xs text-slate-500">Paare finden auf Zeit.</span>
                             </div>
                             <ChevronRight className="w-5 h-5 text-slate-600" />
                         </button>

                         <button onClick={() => handleModeSelect(AppView.MULTIPLE_CHOICE)} className="w-full p-4 bg-revo-teal/50 hover:bg-revo-emerald/20 border border-revo-emerald/10 hover:border-revo-gold/50 rounded-3xl flex items-center gap-4 transition-all group">
                             <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                 <CheckSquare className="w-6 h-6" />
                             </div>
                             <div className="text-left flex-1">
                                 <span className="block font-bold text-white">Multiple Choice</span>
                                 <span className="text-xs text-slate-500">Schnelles Quiz-Format.</span>
                             </div>
                             <ChevronRight className="w-5 h-5 text-slate-600" />
                         </button>
                    </div>
                </>
            )}

            {(selectionStep === 'DIRECTION' || showToughModeModal) && (
                <>
                    <div className="text-center mb-8">
                        <div className="inline-flex p-3 bg-revo-success/10 rounded-2xl border border-revo-success/20 mb-4">
                            <Languages className="w-6 h-6 text-revo-success" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Sprachrichtung</h3>
                        <p className="text-slate-400 text-sm mt-1 font-medium">In welcher Richtung willst du üben?</p>
                    </div>
                    
                    <div className="space-y-4">
                        <button 
                            onClick={() => showToughModeModal ? startToughMode(QuizDirection.ORIGINAL_TO_TRANSLATION) : startQuiz(QuizDirection.ORIGINAL_TO_TRANSLATION)}
                            className="w-full p-5 bg-revo-teal/50 hover:bg-revo-emerald/20 border border-revo-emerald/10 hover:border-revo-gold/50 rounded-3xl flex items-center gap-5 transition-all group"
                        >
                            <div className="w-12 h-12 bg-revo-teal rounded-2xl flex items-center justify-center text-revo-gold border border-revo-gold/20">
                            <Languages className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <span className="block font-bold text-white text-lg">
                                    {showToughModeModal ? "Fremdsprache" : getLanguageName()} <ArrowLeftRight className="w-4 h-4 inline-block mx-2 text-slate-500" /> Deutsch
                                </span>
                                <span className="text-xs text-slate-500">Gesehenes Wort übersetzen.</span>
                            </div>
                        </button>

                        <button 
                            onClick={() => showToughModeModal ? startToughMode(QuizDirection.TRANSLATION_TO_ORIGINAL) : startQuiz(QuizDirection.TRANSLATION_TO_ORIGINAL)}
                            className="w-full p-5 bg-revo-teal/50 hover:bg-revo-emerald/20 border border-revo-emerald/10 hover:border-revo-success/50 rounded-3xl flex items-center gap-5 transition-all group"
                        >
                            <div className="w-12 h-12 bg-revo-teal rounded-2xl flex items-center justify-center text-revo-success border border-revo-success/20">
                            <Languages className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <span className="block font-bold text-white text-lg">
                                    Deutsch <ArrowLeftRight className="w-4 h-4 inline-block mx-2 text-slate-500" /> {showToughModeModal ? "Fremdsprache" : getLanguageName()}
                                </span>
                                <span className="text-xs text-slate-500">Deutsches Wort übersetzen.</span>
                            </div>
                        </button>
                    </div>
                </>
            )}

            <button 
              onClick={() => {
                setSelectedSet(null);
                setShowToughModeModal(false);
                setSelectionStep('MODE');
              }}
              className="mt-8 w-full py-4 text-slate-500 font-bold hover:text-white transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {showProfile && (
        <ProfileSettings 
          user={user} 
          onClose={() => setShowProfile(false)} 
          onUpdate={onUpdateUser}
          onLogout={onLogout}
        />
      )}
    </div>
  );
};
