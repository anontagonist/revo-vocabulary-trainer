import React, { useState, useEffect, useRef } from 'react';
import { VocabSet, QuizDirection, VocabItem } from '../types';
import { Plus, BookOpen, Trash2, ChevronRight, Languages, ArrowLeftRight, Camera, Flame, Trophy, Clock, Edit2, BarChart3, Crown } from 'lucide-react';
import { getStreakInfo } from '../services/storageService';

interface DashboardProps {
  sets: VocabSet[];
  onDeleteSet: (id: string) => void;
  onSelectSet: (set: VocabSet, direction: QuizDirection) => void;
  onCreateNew: () => void;
  onStartToughMode: (direction: QuizDirection) => void;
  onShowStats: () => void;
  toughItemsCount: number;
}

// Sub-component for Streak Display
const StreakDisplay: React.FC = () => {
  const [streak, setStreak] = useState({ current: 0, best: 0, isBroken: false, daysMissed: 0 });

  useEffect(() => {
    setStreak(getStreakInfo());
  }, []);

  return (
    <div className="flex items-center gap-2">
      {streak.isBroken ? (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-xs font-bold" title={`Pause seit ${streak.daysMissed} Tagen`}>
          <Flame className="w-3.5 h-3.5" />
          <span>Pause: {streak.daysMissed} d</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/50 rounded-xl text-emerald-400 text-xs font-bold" title="Aktueller Streak">
          <Flame className="w-3.5 h-3.5 fill-emerald-400" />
          <span>{streak.current} d</span>
        </div>
      )}
      
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 text-xs font-bold" title="Dein Rekord">
        <Crown className="w-3.5 h-3.5" />
        <span>Rekord: {streak.best}</span>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ sets, onDeleteSet, onSelectSet, onCreateNew, onStartToughMode, onShowStats, toughItemsCount }) => {
  const [selectedSet, setSelectedSet] = useState<VocabSet | null>(null);
  const [showToughModeModal, setShowToughModeModal] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load avatar from local storage on mount
  useEffect(() => {
    const savedAvatar = localStorage.getItem('user_avatar');
    if (savedAvatar) {
      setAvatar(savedAvatar);
    }
  }, []);

  const startQuiz = (direction: QuizDirection) => {
    if (selectedSet) {
      onSelectSet(selectedSet, direction);
      setSelectedSet(null);
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
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-orange-500';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' Uhr';
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatar(base64String);
        localStorage.setItem('user_avatar', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           {/* Avatar Section with Upload Feature */}
           <div className="relative cursor-pointer flex-shrink-0" onClick={handleAvatarClick}>
             {avatar ? (
               <div className="relative">
                 <img 
                   src={avatar} 
                   alt="Avatar" 
                   className="w-16 h-16 rounded-full border-4 border-slate-700 shadow-lg object-cover bg-slate-800"
                   onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = '<div class="w-16 h-16 rounded-full border-4 border-slate-700 bg-sky-600 flex items-center justify-center text-white font-bold text-xl">R</div>';
                   }}
                 />
                 {/* Discreet Edit Badge */}
                 <div className="absolute -bottom-1 -right-1 bg-slate-700 text-slate-200 rounded-full p-1.5 border-2 border-slate-800 shadow-sm">
                    <Camera className="w-3 h-3" />
                 </div>
               </div>
             ) : (
               <div className="group relative w-16 h-16 rounded-full border-4 border-slate-700 shadow-lg bg-sky-600 flex items-center justify-center text-white text-3xl font-bold hover:bg-sky-500 transition-colors">
                 R
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-full">
                    <Camera className="w-6 h-6" />
                 </div>
               </div>
             )}
             
             <input 
               type="file" 
               ref={fileInputRef} 
               className="hidden" 
               accept="image/*"
               onChange={handleAvatarChange}
             />
           </div>
           
           <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Hallo, Rena! 👋</h1>
            <p className="text-slate-400 mt-1 text-sm sm:text-base">Was möchtest Du heute lernen?</p>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:ml-auto">
          {/* Status Bar Group */}
          <div className="flex items-center gap-2 bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700/50">
            <StreakDisplay />
            
            <div className="w-px h-6 bg-slate-700 mx-1"></div>

            <button 
               onClick={onShowStats}
               className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl transition-colors text-xs font-bold"
               title="Statistik ansehen"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Statistik</span>
            </button>
          </div>

          <button
            onClick={onCreateNew}
            className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-4 py-3 rounded-2xl shadow-lg shadow-sky-900/50 transition-all active:scale-95 font-bold border border-sky-500 ml-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Neues Set</span>
          </button>
        </div>
      </header>

      {/* Tough Mode Section - Always visible if sets exist */}
      {sets.length > 0 && (
        <div className="mb-8">
          {toughItemsCount > 0 ? (
            <div 
              onClick={() => setShowToughModeModal(true)}
              className="bg-gradient-to-r from-orange-600 to-rose-600 rounded-2xl p-6 shadow-lg shadow-orange-900/40 cursor-pointer transform hover:scale-[1.01] transition-transform relative overflow-hidden group border border-orange-500"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Flame className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full flex-shrink-0">
                  <Flame className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Tough Mode 🔥</h3>
                  <p className="text-orange-100 text-sm">
                    Du hast <span className="font-extrabold">{toughItemsCount}</span> schwierige Vokabeln. Trainiere sie jetzt!
                  </p>
                </div>
                <div className="ml-auto bg-white/20 p-2 rounded-full backdrop-blur-sm">
                  <ChevronRight className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-2xl p-6 flex items-center gap-4 shadow-lg shadow-emerald-900/20">
              <div className="p-3 bg-emerald-500/20 rounded-full flex-shrink-0">
                <Trophy className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Alles im grünen Bereich! 🏆</h3>
                <p className="text-emerald-200/70 text-sm">
                  Keine schwierigen Vokabeln offen. Du bist spitze!
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {sets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-800 rounded-3xl border-2 border-dashed border-slate-700 text-center p-6">
          <div className="bg-slate-700 p-4 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-sky-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Noch keine Vokabeln</h3>
          <p className="text-slate-400 max-w-xs mt-2">
            Tippe auf den Button oben rechts, um Dein Schulbuch zu fotografieren und zu starten!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sets.map((set) => (
            <div
              key={set.id}
              className="group relative bg-slate-800 rounded-2xl p-5 shadow-lg shadow-slate-900/50 border border-slate-700 hover:border-sky-500/50 transition-all cursor-pointer overflow-hidden flex flex-col justify-between h-full"
              onClick={() => setSelectedSet(set)}
            >
              <div>
                <div className={`absolute top-0 left-0 w-2 h-full ${set.color}`}></div>
                <div className="flex justify-between items-start pl-3 mb-2">
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-lg text-slate-100 leading-snug break-words">{set.title}</h3>
                    
                    {/* Meta info row: Count + Date */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-700/50 px-2 py-1 rounded">
                        {set.items.length} Karten
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(set.createdAt)}
                      </span>
                    </div>

                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if(confirm("Möchtest Du dieses Set wirklich löschen?")) {
                        onDeleteSet(set.id);
                      }
                    }}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pl-3 mt-4">
                 {/* Progress Bar if score exists */}
                 {set.lastScore !== undefined && (
                   <div className="mb-3">
                     <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                       <span>Letztes Ergebnis</span>
                       <span>{set.lastScore}%</span>
                     </div>
                     <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                       <div 
                         className={`h-full rounded-full transition-all duration-500 ${getScoreColor(set.lastScore)}`}
                         style={{ width: `${set.lastScore}%` }}
                       ></div>
                     </div>
                   </div>
                 )}

                <div className="flex items-center text-sky-400 font-bold text-sm group-hover:translate-x-1 transition-transform">
                  Jetzt lernen <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Direction Selection Modal (Normal & Tough Mode) */}
      {(selectedSet || showToughModeModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white">Wie möchtest Du lernen?</h3>
              <p className="text-slate-400 text-sm mt-1">
                {showToughModeModal 
                  ? "Trainiere Deine schwierigsten Vokabeln." 
                  : `Wähle die Abfragerichtung für "${selectedSet?.title}"`
                }
              </p>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => showToughModeModal ? startToughMode(QuizDirection.ORIGINAL_TO_TRANSLATION) : startQuiz(QuizDirection.ORIGINAL_TO_TRANSLATION)}
                className="w-full p-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-sky-500/50 rounded-2xl flex items-center gap-4 transition-all group"
              >
                <div className="w-10 h-10 bg-sky-900/50 rounded-full flex items-center justify-center text-sky-400 border border-sky-500/30">
                  <Languages className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-slate-100">
                    {showToughModeModal ? "Fremdsprache" : getLanguageName()} <ArrowLeftRight className="w-3 h-3 inline mx-1 text-slate-500" /> Deutsch
                  </span>
                  <span className="text-xs text-slate-400">Du siehst das fremde Wort und musst übersetzen.</span>
                </div>
              </button>

              <button 
                onClick={() => showToughModeModal ? startToughMode(QuizDirection.TRANSLATION_TO_ORIGINAL) : startQuiz(QuizDirection.TRANSLATION_TO_ORIGINAL)}
                className="w-full p-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-emerald-500/50 rounded-2xl flex items-center gap-4 transition-all"
              >
                <div className="w-10 h-10 bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                  <Languages className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-slate-100">
                    Deutsch <ArrowLeftRight className="w-3 h-3 inline mx-1 text-slate-500" /> {showToughModeModal ? "Fremdsprache" : getLanguageName()}
                  </span>
                  <span className="text-xs text-slate-400">Du siehst das deutsche Wort und musst übersetzen.</span>
                </div>
              </button>
            </div>

            <button 
              onClick={() => {
                setSelectedSet(null);
                setShowToughModeModal(false);
              }}
              className="mt-6 w-full py-3 text-slate-400 font-bold hover:text-white hover:bg-slate-700 rounded-xl transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};