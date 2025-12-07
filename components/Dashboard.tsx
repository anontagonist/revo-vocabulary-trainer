import React, { useState } from 'react';
import { VocabSet, QuizDirection, User, AppView } from '../types';
import { Plus, BookOpen, Trash2, ChevronRight, Languages, ArrowLeftRight, Flame, Trophy, Clock, BarChart3, Crown, User as UserIcon, BookCopy, GripHorizontal, CheckSquare } from 'lucide-react';
import { getStreakInfo } from '../services/storageService';
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

// Sub-component for Streak Display
const StreakDisplay: React.FC<{ userId: string }> = ({ userId }) => {
  const [streak, setStreak] = useState(() => getStreakInfo(userId));

  return (
    <div className="flex items-center gap-2">
      {streak.isBroken ? (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-revo-error/10 border border-revo-error/50 rounded-xl text-revo-error text-xs font-bold" title={`Pause seit ${streak.daysMissed} Tagen`}>
          <Flame className="w-3.5 h-3.5" />
          <span>Pause: {streak.daysMissed} d</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-revo-success/10 border border-revo-success/50 rounded-xl text-revo-success text-xs font-bold" title="Aktueller Streak">
          <Flame className="w-3.5 h-3.5 fill-revo-success" />
          <span>{streak.current} d</span>
        </div>
      )}
      
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-revo-teal border border-revo-emerald/30 rounded-xl text-slate-400 text-xs font-bold" title="Dein Rekord">
        <Crown className="w-3.5 h-3.5 text-revo-gold" />
        <span>Rekord: {streak.best}</span>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ user, sets, onDeleteSet, onSelectSet, onCreateNew, onStartToughMode, onShowStats, onUpdateUser, onLogout, toughItemsCount }) => {
  const [selectedSet, setSelectedSet] = useState<VocabSet | null>(null);
  const [showToughModeModal, setShowToughModeModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  // Selection State
  const [selectionStep, setSelectionStep] = useState<'MODE' | 'DIRECTION'>('MODE');
  const [selectedMode, setSelectedMode] = useState<AppView>(AppView.QUIZ);

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
    return new Date(timestamp).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' Uhr';
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 relative">
      
      {/* Top Brand Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-revo-emerald/20">
         <div className="flex items-center gap-3">
            {/* Logo is now an image and larger */}
            <img src="logo.png" alt="Revo Logo" className="w-14 h-14 object-contain drop-shadow-lg" onError={(e) => {
                // Fallback if logo.png is missing
                e.currentTarget.style.display = 'none';
            }} />
            <div className="flex flex-col justify-center">
                 {/* Title is smaller/secondary */}
                <span className="text-xs md:text-sm font-bold text-revo-gold uppercase tracking-widest opacity-80">Revo Vocabulary Trainer</span>
                {/* Greeting is dominant */}
                <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">Hallo, {user.name}! 👋</h1>
            </div>
         </div>

         {/* Avatar Section - Smaller */}
         <div className="relative cursor-pointer flex-shrink-0 group" onClick={() => setShowProfile(true)}>
             {user.avatar ? (
               <div className="relative">
                 <img 
                   src={user.avatar} 
                   alt="Avatar" 
                   className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-revo-gold shadow-lg object-cover bg-revo-teal"
                 />
                 <div className="absolute -bottom-1 -right-1 bg-revo-surface text-revo-text rounded-full p-0.5 border border-revo-teal opacity-0 group-hover:opacity-100 transition-opacity">
                    <UserIcon className="w-2.5 h-2.5" />
                 </div>
               </div>
             ) : (
               <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-revo-gold shadow-lg bg-revo-emerald flex items-center justify-center text-white text-lg font-bold hover:bg-emerald-700 transition-colors">
                 {user.name.charAt(0)}
               </div>
             )}
         </div>
      </div>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <p className="text-revo-text text-sm">Was möchtest Du heute lernen?</p>

        <div className="flex flex-wrap items-center gap-2 md:ml-auto">
          {/* Status Bar Group */}
          <div className="flex items-center gap-2 bg-revo-surface p-1.5 rounded-2xl border border-revo-emerald/30 shadow-sm">
            <StreakDisplay userId={user.id} />
            
            <div className="w-px h-6 bg-revo-emerald/30 mx-1"></div>

            <button 
               onClick={onShowStats}
               className="flex items-center gap-2 px-3 py-1.5 bg-revo-teal hover:bg-revo-emerald/30 text-revo-text hover:text-white rounded-xl transition-colors text-xs font-bold"
               title="Statistik ansehen"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Statistik</span>
            </button>
          </div>

          <button
            onClick={onCreateNew}
            className="flex items-center justify-center gap-2 bg-revo-emerald hover:bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-lg shadow-revo-teal/50 transition-all active:scale-95 font-bold border border-revo-emerald ml-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Neues Set</span>
          </button>
        </div>
      </header>

      {/* Tough Mode Section */}
      {sets.length > 0 && (
        <div className="mb-8">
          {toughItemsCount > 0 ? (
            <div 
              onClick={() => setShowToughModeModal(true)}
              className="bg-gradient-to-r from-orange-700 to-red-800 rounded-2xl p-6 shadow-lg cursor-pointer transform hover:scale-[1.01] transition-transform relative overflow-hidden group border border-orange-600/50"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Flame className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-full flex-shrink-0 border border-white/10">
                  <Flame className="w-8 h-8 text-orange-200 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Tough Mode 🔥</h3>
                  <p className="text-orange-100 text-sm">
                    Du hast <span className="font-extrabold">{toughItemsCount}</span> schwierige Vokabeln. Trainiere sie jetzt!
                  </p>
                </div>
                <div className="ml-auto bg-white/10 p-2 rounded-full backdrop-blur-sm">
                  <ChevronRight className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-revo-surface border border-revo-success/30 rounded-2xl p-6 flex items-center gap-4 shadow-lg">
              <div className="p-3 bg-revo-success/20 rounded-full flex-shrink-0">
                <Trophy className="w-8 h-8 text-revo-success" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Alles im grünen Bereich! 🏆</h3>
                <p className="text-revo-text text-sm">
                  Keine schwierigen Vokabeln offen. Du bist spitze!
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {sets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-revo-surface rounded-3xl border-2 border-dashed border-revo-emerald/30 text-center p-6">
          <div className="bg-revo-teal p-4 rounded-full mb-4 border border-revo-emerald/50">
            <BookOpen className="w-8 h-8 text-revo-gold" />
          </div>
          <h3 className="text-lg font-bold text-white">Noch keine Vokabeln</h3>
          <p className="text-revo-text max-w-xs mt-2">
            Tippe auf den Button oben rechts, um Dein Schulbuch zu fotografieren und zu starten!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sets.map((set) => (
            <div
              key={set.id}
              className="group relative bg-revo-surface rounded-2xl p-5 shadow-lg border border-revo-emerald/20 hover:border-revo-gold/50 transition-all cursor-pointer overflow-hidden flex flex-col justify-between h-full"
              onClick={() => handleSetClick(set)}
            >
              <div>
                <div className={`absolute top-0 left-0 w-1.5 h-full ${set.color}`}></div>
                <div className="flex justify-between items-start pl-3 mb-2">
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-lg text-white leading-snug break-words">{set.title}</h3>
                    
                    {/* Meta info row */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-semibold text-revo-text uppercase tracking-wider bg-revo-teal px-2 py-1 rounded">
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
                    className="p-2 text-slate-500 hover:text-revo-error hover:bg-revo-teal rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pl-3 mt-4">
                 {/* Progress Bar */}
                 {set.lastScore !== undefined && (
                   <div className="mb-3">
                     <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                       <span>Letztes Ergebnis</span>
                       <span>{set.lastScore}%</span>
                     </div>
                     <div className="w-full bg-revo-teal rounded-full h-2 overflow-hidden">
                       <div 
                         className={`h-full rounded-full transition-all duration-500 ${getScoreColor(set.lastScore)}`}
                         style={{ width: `${set.lastScore}%` }}
                       ></div>
                     </div>
                   </div>
                 )}

                <div className="flex items-center text-revo-gold font-bold text-sm group-hover:translate-x-1 transition-transform">
                  Jetzt lernen <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mode/Direction Selection Modal */}
      {(selectedSet || showToughModeModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-revo-teal/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-revo-surface border border-revo-emerald/30 rounded-3xl p-6 w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            
            {/* STEP 1: MODE SELECTION (Only for normal sets, Tough Mode skips to direction) */}
            {selectionStep === 'MODE' && !showToughModeModal && (
                <>
                    <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-white">Wähle einen Spielmodus</h3>
                        <p className="text-revo-text text-sm mt-1">Wie möchtest Du das Set "{selectedSet?.title}" lernen?</p>
                    </div>
                    <div className="space-y-3">
                         <button onClick={() => handleModeSelect(AppView.QUIZ)} className="w-full p-4 bg-revo-teal hover:bg-revo-emerald/20 border border-revo-emerald/30 hover:border-revo-gold/50 rounded-2xl flex items-center gap-4 transition-all">
                             <div className="w-12 h-12 bg-revo-emerald/20 rounded-xl flex items-center justify-center text-revo-gold">
                                 <BookCopy className="w-6 h-6" />
                             </div>
                             <div className="text-left flex-1">
                                 <span className="block font-bold text-white">Karteikarten</span>
                                 <span className="text-xs text-slate-400">Der Klassiker. Umdrehen und prüfen.</span>
                             </div>
                             <ChevronRight className="w-5 h-5 text-slate-500" />
                         </button>

                         <button onClick={() => handleModeSelect(AppView.MATCHING_GAME)} className="w-full p-4 bg-revo-teal hover:bg-revo-emerald/20 border border-revo-emerald/30 hover:border-revo-gold/50 rounded-2xl flex items-center gap-4 transition-all">
                             <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center text-sky-400">
                                 <GripHorizontal className="w-6 h-6" />
                             </div>
                             <div className="text-left flex-1">
                                 <span className="block font-bold text-white">Match the Cards</span>
                                 <span className="text-xs text-slate-400">Verbinde die passenden Paare.</span>
                             </div>
                             <ChevronRight className="w-5 h-5 text-slate-500" />
                         </button>

                         <button onClick={() => handleModeSelect(AppView.MULTIPLE_CHOICE)} className="w-full p-4 bg-revo-teal hover:bg-revo-emerald/20 border border-revo-emerald/30 hover:border-revo-gold/50 rounded-2xl flex items-center gap-4 transition-all">
                             <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                                 <CheckSquare className="w-6 h-6" />
                             </div>
                             <div className="text-left flex-1">
                                 <span className="block font-bold text-white">Multiple Choice</span>
                                 <span className="text-xs text-slate-400">Wähle die richtige Antwort aus 4.</span>
                             </div>
                             <ChevronRight className="w-5 h-5 text-slate-500" />
                         </button>
                    </div>
                </>
            )}

            {/* STEP 2: DIRECTION SELECTION */}
            {(selectionStep === 'DIRECTION' || showToughModeModal) && (
                <>
                    <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white">Abfragerichtung</h3>
                    <p className="text-revo-text text-sm mt-1">
                        {showToughModeModal 
                        ? "Trainiere Deine schwierigsten Vokabeln." 
                        : `Richtung für "${selectedSet?.title}"`
                        }
                    </p>
                    </div>
                    
                    <div className="space-y-3">
                    <button 
                        onClick={() => showToughModeModal ? startToughMode(QuizDirection.ORIGINAL_TO_TRANSLATION) : startQuiz(QuizDirection.ORIGINAL_TO_TRANSLATION)}
                        className="w-full p-4 bg-revo-teal hover:bg-revo-emerald/20 border border-revo-emerald/30 hover:border-revo-gold/50 rounded-2xl flex items-center gap-4 transition-all group"
                    >
                        <div className="w-10 h-10 bg-revo-teal rounded-full flex items-center justify-center text-revo-gold border border-revo-gold/30">
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
                        className="w-full p-4 bg-revo-teal hover:bg-revo-emerald/20 border border-revo-emerald/30 hover:border-revo-success/50 rounded-2xl flex items-center gap-4 transition-all"
                    >
                        <div className="w-10 h-10 bg-revo-teal rounded-full flex items-center justify-center text-revo-success border border-revo-success/30">
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
                </>
            )}

            <button 
              onClick={() => {
                setSelectedSet(null);
                setShowToughModeModal(false);
                setSelectionStep('MODE');
              }}
              className="mt-6 w-full py-3 text-slate-400 font-bold hover:text-white hover:bg-revo-teal rounded-xl transition-colors"
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