import React, { useState, useEffect } from 'react';
import { VocabSet, QuizDirection, VocabItem } from '../types';
import { ArrowLeft, RotateCw, CheckCircle, XCircle, RefreshCcw } from 'lucide-react';

interface QuizProps {
  set: VocabSet;
  direction: QuizDirection;
  onExit: () => void;
  onComplete: (scorePercentage: number, updatedItems: VocabItem[]) => void;
}

// Simple floating animation component
const FloatingEmoji: React.FC<{ emoji: string; count: number }> = ({ emoji, count }) => {
  const [items] = useState(() => 
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // Random horizontal start
      delay: Math.random() * 2,  // Random delay
      duration: 3 + Math.random() * 4, // Random speed (slower is more majestic)
      scale: 0.5 + Math.random() * 1 // Random size
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute bottom-0 text-4xl"
          style={{
            left: `${item.left}%`,
            animation: `floatUp ${item.duration}s ease-in-out infinite`,
            animationDelay: `${item.delay}s`,
            fontSize: `${item.scale * 3}rem`, // Slightly larger for better effect
            opacity: 0
          }}
        >
          {emoji}
        </div>
      ))}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(10vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-110vh) rotate(${Math.random() * 40 - 20}deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export const Quiz: React.FC<QuizProps> = ({ set, direction, onExit, onComplete }) => {
  // Shuffle cards on mount
  const [cards, setCards] = useState(() => [...set.items].sort(() => Math.random() - 0.5));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Stats tracking for current session
  const [sessionCorrect, setSessionCorrect] = useState(0);
  // Track mistakes for "Repeat Mistakes" feature
  const [mistakes, setMistakes] = useState<VocabItem[]>([]);
  
  // We keep a map of updates to merge back later
  const [itemUpdates, setItemUpdates] = useState<Record<string, { correct: number, wrong: number }>>({});

  const currentCard = cards[currentIndex];

  // Determine language name for UI
  const languageName = set.metadata?.language || "Fremdsprache";

  // Determine what is front and what is back based on direction
  const isOrigToTrans = direction === QuizDirection.ORIGINAL_TO_TRANSLATION;
  
  // Safeguard: If currentCard is undefined (should not happen with logic below, but prevents crash)
  const questionText = currentCard ? (isOrigToTrans ? currentCard.original : currentCard.translation) : "";
  const answerText = currentCard ? (isOrigToTrans ? currentCard.translation : currentCard.original) : "";
  
  // Dynamic labels
  const questionLabel = isOrigToTrans 
    ? "Wie heißt das auf Deutsch?" 
    : `Wie heißt das auf ${languageName}?`;

  // Trigger save when completed state is reached
  useEffect(() => {
    if (completed) {
      const percentage = Math.round((sessionCorrect / cards.length) * 100);
      
      // Construct updated items array
      const updatedItems = set.items.map(item => {
        const update = itemUpdates[item.id];
        if (update) {
          return {
            ...item,
            correctCount: (item.correctCount || 0) + update.correct,
            wrongCount: (item.wrongCount || 0) + update.wrong
          };
        }
        return item;
      });

      onComplete(percentage, updatedItems);
    }
  }, [completed]);

  const handleNext = (known: boolean) => {
    if (isTransitioning) return; // Prevent double clicks
    setIsTransitioning(true);

    if (currentCard) {
      if (known) {
        setSessionCorrect(c => c + 1);
      } else {
        setMistakes(prev => [...prev, currentCard]);
      }
      
      // Update local stats tracker
      setItemUpdates(prev => {
        const current = prev[currentCard.id] || { correct: 0, wrong: 0 };
        return {
          ...prev,
          [currentCard.id]: {
            correct: current.correct + (known ? 1 : 0),
            wrong: current.wrong + (known ? 0 : 1)
          }
        };
      });
    }
    
    setIsFlipped(false);
    
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(c => c + 1);
        setIsTransitioning(false);
      } else {
        setCompleted(true);
      }
    }, 200); // Wait for flip back
  };

  const restart = () => {
    setCards([...set.items].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setSessionCorrect(0);
    setMistakes([]);
    setItemUpdates({});
    setCompleted(false);
    setIsFlipped(false);
    setIsTransitioning(false);
  };

  const repeatMistakes = () => {
    if (mistakes.length === 0) return;
    setCards([...mistakes].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setSessionCorrect(0); // Reset session score for this mini-round
    // We do NOT reset itemUpdates here, because we want to keep accumulating stats for the database!
    // But we might want to clear mistakes array to fill it again if they fail again
    setMistakes([]); 
    setCompleted(false);
    setIsFlipped(false);
    setIsTransitioning(false);
  };

  // Handle empty sets or invalid states gracefully
  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center text-slate-100">
        <h2 className="text-xl font-bold mb-4">Dieses Set enthält keine Vokabeln.</h2>
        <button onClick={onExit} className="py-3 px-6 bg-sky-600 text-white rounded-xl font-bold">
          Zurück
        </button>
      </div>
    );
  }

  if (completed) {
    const percentage = Math.round((sessionCorrect / cards.length) * 100);
    let message = "Gut gemacht!";
    if (percentage === 100) message = "Perfekt! 🏆";
    else if (percentage < 50) message = "Weiter üben!";

    // Animation Logic
    const showThumbs = percentage >= 80 && percentage < 90;
    const showClaps = percentage >= 90 && percentage < 100;
    const showTrophies = percentage === 100;

    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center animate-in zoom-in duration-300 relative overflow-hidden">
        
        {/* Animation Overlays - using CSS animations which are GPU accelerated and don't flicker text */}
        {showThumbs && <FloatingEmoji emoji="👍" count={15} />}
        {showClaps && <FloatingEmoji emoji="👏" count={20} />}
        {showTrophies && <FloatingEmoji emoji="🏆" count={25} />}

        <div className={`
          relative z-20 flex items-center justify-center mb-6 text-white font-bold transition-all duration-700
          ${percentage === 100 ? 'w-48 h-48 text-6xl shadow-[0_0_50px_rgba(14,165,233,0.8)] animate-bounce' : 'w-24 h-24 text-3xl shadow-xl shadow-sky-900/50'}
          bg-gradient-to-tr from-sky-500 to-blue-600 rounded-full
        `}>
          {percentage}%
        </div>

        <h2 className="text-3xl font-extrabold text-white mb-2 relative z-20">{message}</h2>
        <p className="text-slate-400 mb-8 relative z-20">
          Du wusstest {sessionCorrect} von {cards.length} Vokabeln.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs relative z-20">
          {percentage < 100 && mistakes.length > 0 && (
             <button 
               onClick={repeatMistakes} 
               className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold shadow-md hover:bg-orange-500 flex items-center justify-center gap-2 mb-2 border border-orange-500"
             >
               <RefreshCcw className="w-5 h-5" /> Fehler wiederholen ({mistakes.length})
             </button>
          )}

          <button onClick={restart} className="w-full py-3 bg-slate-700 text-white rounded-xl font-bold shadow-md hover:bg-slate-600 flex items-center justify-center gap-2">
            <RotateCw className="w-5 h-5" /> Komplettes Set wiederholen
          </button>
          <button onClick={onExit} className="w-full py-3 text-slate-400 font-bold hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
            Zur Übersicht
          </button>
        </div>
      </div>
    );
  }

  // Fallback if index out of bounds
  if (!currentCard) return null;

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-900">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button onClick={onExit} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Karte {currentIndex + 1} / {cards.length}
          </span>
          <h2 className="text-sm font-semibold text-slate-300 truncate max-w-[150px]">{set.title}</h2>
        </div>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-800">
        <div 
          className="h-full bg-sky-500 transition-all duration-300 shadow-[0_0_10px_rgba(14,165,233,0.5)]" 
          style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
        ></div>
      </div>

      {/* Card Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 perspective-1000">
        <div 
          className="relative w-full max-w-sm aspect-[3/4] cursor-pointer"
          onClick={() => !isTransitioning && setIsFlipped(!isFlipped)}
        >
          <div className={`w-full h-full relative transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
            
            {/* Front Side (Question) */}
            <div className="absolute inset-0 w-full h-full bg-slate-800 rounded-3xl shadow-xl shadow-slate-950/50 border border-slate-700 flex flex-col items-center justify-center p-6 sm:p-8 backface-hidden">
               <span className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-4 text-center">{questionLabel}</span>
               <h3 className="text-2xl sm:text-4xl font-extrabold text-white text-center break-words hyphens-auto max-h-[60%] overflow-y-auto w-full no-scrollbar" lang={isOrigToTrans ? set.metadata?.language : "de"}>
                 {questionText}
               </h3>
               <p className="mt-8 text-slate-500 text-sm animate-pulse">Tippen zum Umdrehen</p>
            </div>

            {/* Back Side (Answer) */}
            <div className="absolute inset-0 w-full h-full bg-sky-600 rounded-3xl shadow-xl shadow-sky-900/50 border border-sky-500 flex flex-col items-center justify-center p-6 sm:p-8 backface-hidden rotate-y-180">
               <span className="text-sm font-bold text-sky-200 uppercase tracking-wider mb-4">Lösung</span>
               <h3 className="text-2xl sm:text-4xl font-extrabold text-white text-center break-words hyphens-auto max-h-[60%] overflow-y-auto w-full no-scrollbar" lang={isOrigToTrans ? "de" : set.metadata?.language}>
                 {answerText}
               </h3>
            </div>

          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 pb-8 md:pb-12 bg-slate-900 border-t border-slate-800 safe-area-bottom">
        <div className="flex gap-4 max-w-md mx-auto">
          <button 
            onClick={() => handleNext(false)}
            disabled={isTransitioning}
            className="flex-1 py-4 rounded-2xl border-2 border-slate-700 text-slate-400 font-bold text-lg hover:bg-slate-800 hover:border-slate-600 hover:text-slate-200 transition-colors flex flex-col items-center justify-center gap-1 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            <XCircle className="w-6 h-6 text-red-500" />
            <span className="text-xs">Wusste ich nicht</span>
          </button>
          
          <button 
            onClick={() => handleNext(true)}
            disabled={isTransitioning}
            className="flex-1 py-4 rounded-2xl bg-sky-600 text-white font-bold text-lg shadow-lg shadow-sky-900 hover:bg-sky-500 transition-all flex flex-col items-center justify-center gap-1 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:active:scale-100 border border-sky-500"
          >
            <CheckCircle className="w-6 h-6 text-sky-200" />
            <span className="text-xs text-sky-100">Gewusst!</span>
          </button>
        </div>
      </div>
    </div>
  );
};