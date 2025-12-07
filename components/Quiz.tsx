import React, { useState, useEffect } from 'react';
import { VocabSet, QuizDirection, VocabItem } from '../types';
import { ArrowLeft, RotateCw, CheckCircle, XCircle, RefreshCcw } from 'lucide-react';

interface QuizProps {
  set: VocabSet;
  direction: QuizDirection;
  onExit: () => void;
  onComplete: (scorePercentage: number, updatedItems: VocabItem[]) => void;
}

const FloatingEmoji: React.FC<{ emoji: string; count: number }> = ({ emoji, count }) => {
  const [items] = useState(() => 
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 4,
      scale: 0.5 + Math.random() * 1
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
            fontSize: `${item.scale * 3}rem`,
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
  const [cards, setCards] = useState(() => [...set.items].sort(() => Math.random() - 0.5));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [mistakes, setMistakes] = useState<VocabItem[]>([]);
  
  const [itemUpdates, setItemUpdates] = useState<Record<string, { correct: number, wrong: number }>>({});

  const currentCard = cards[currentIndex];

  const languageName = set.metadata?.language || "Fremdsprache";
  const isOrigToTrans = direction === QuizDirection.ORIGINAL_TO_TRANSLATION;
  
  const questionText = currentCard ? (isOrigToTrans ? currentCard.original : currentCard.translation) : "";
  const answerText = currentCard ? (isOrigToTrans ? currentCard.translation : currentCard.original) : "";
  
  const questionLabel = isOrigToTrans 
    ? "Wie heißt das auf Deutsch?" 
    : `Wie heißt das auf ${languageName}?`;

  useEffect(() => {
    if (completed) {
      const percentage = Math.round((sessionCorrect / cards.length) * 100);
      
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
    if (isTransitioning) return;
    setIsTransitioning(true);

    if (currentCard) {
      if (known) {
        setSessionCorrect(c => c + 1);
      } else {
        setMistakes(prev => [...prev, currentCard]);
      }
      
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
    }, 200);
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
    setSessionCorrect(0);
    setMistakes([]); 
    setCompleted(false);
    setIsFlipped(false);
    setIsTransitioning(false);
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center text-slate-100">
        <h2 className="text-xl font-bold mb-4">Dieses Set enthält keine Vokabeln.</h2>
        <button onClick={onExit} className="py-3 px-6 bg-revo-emerald text-white rounded-xl font-bold">
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

    const showThumbs = percentage >= 80 && percentage < 90;
    const showClaps = percentage >= 90 && percentage < 100;
    const showTrophies = percentage === 100;

    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center animate-in zoom-in duration-300 relative overflow-hidden">
        
        {showThumbs && <FloatingEmoji emoji="👍" count={15} />}
        {showClaps && <FloatingEmoji emoji="👏" count={20} />}
        {showTrophies && <FloatingEmoji emoji="🏆" count={25} />}

        <div className={`
          relative z-20 flex items-center justify-center mb-6 text-white font-bold transition-all duration-700
          ${percentage === 100 ? 'w-48 h-48 text-6xl shadow-[0_0_50px_rgba(212,175,55,0.8)] animate-bounce bg-revo-gold text-revo-teal' : 'w-24 h-24 text-3xl shadow-xl shadow-revo-emerald/50 bg-revo-emerald'}
          rounded-full border-4 border-revo-surface
        `}>
          {percentage}%
        </div>

        <h2 className="text-3xl font-extrabold text-white mb-2 relative z-20">{message}</h2>
        <p className="text-revo-text mb-8 relative z-20">
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

          <button onClick={restart} className="w-full py-3 bg-revo-surface border border-revo-emerald/50 text-white rounded-xl font-bold shadow-md hover:bg-revo-teal flex items-center justify-center gap-2">
            <RotateCw className="w-5 h-5" /> Komplettes Set wiederholen
          </button>
          <button onClick={onExit} className="w-full py-3 text-revo-text font-bold hover:text-white hover:bg-revo-teal rounded-xl transition-colors">
            Zur Übersicht
          </button>
        </div>
      </div>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="flex flex-col h-screen max-h-screen bg-revo-teal">
      <div className="p-4 flex items-center justify-between">
        <button onClick={onExit} className="p-2 text-revo-text hover:text-white hover:bg-revo-surface rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-revo-gold uppercase tracking-widest">
            Karte {currentIndex + 1} / {cards.length}
          </span>
          <h2 className="text-sm font-semibold text-slate-300 truncate max-w-[150px]">{set.title}</h2>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="w-full h-1 bg-revo-surface">
        <div 
          className="h-full bg-revo-gold transition-all duration-300 shadow-[0_0_10px_rgba(212,175,55,0.5)]" 
          style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
        ></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 perspective-1000">
        <div 
          className="relative w-full max-w-sm aspect-[3/4] cursor-pointer"
          onClick={() => !isTransitioning && setIsFlipped(!isFlipped)}
        >
          <div className={`w-full h-full relative transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
            
            <div className="absolute inset-0 w-full h-full bg-revo-surface rounded-3xl shadow-2xl border border-revo-emerald/30 flex flex-col items-center justify-center p-6 sm:p-8 backface-hidden">
               <span className="text-xs font-bold text-revo-gold uppercase tracking-wider mb-4 text-center">{questionLabel}</span>
               <h3 className="text-2xl sm:text-4xl font-extrabold text-white text-center break-words hyphens-auto max-h-[60%] overflow-y-auto w-full no-scrollbar" lang={isOrigToTrans ? set.metadata?.language : "de"}>
                 {questionText}
               </h3>
               <p className="mt-8 text-revo-text/50 text-sm animate-pulse">Tippen zum Umdrehen</p>
            </div>

            <div className="absolute inset-0 w-full h-full bg-revo-emerald rounded-3xl shadow-2xl border border-revo-gold/30 flex flex-col items-center justify-center p-6 sm:p-8 backface-hidden rotate-y-180">
               <span className="text-sm font-bold text-revo-gold uppercase tracking-wider mb-4">Lösung</span>
               <h3 className="text-2xl sm:text-4xl font-extrabold text-white text-center break-words hyphens-auto max-h-[60%] overflow-y-auto w-full no-scrollbar" lang={isOrigToTrans ? "de" : set.metadata?.language}>
                 {answerText}
               </h3>
            </div>

          </div>
        </div>
      </div>

      <div className="p-6 pb-8 md:pb-12 bg-revo-teal border-t border-revo-surface safe-area-bottom">
        <div className="flex gap-4 max-w-md mx-auto">
          <button 
            onClick={() => handleNext(false)}
            disabled={isTransitioning}
            className="flex-1 py-4 rounded-2xl border-2 border-revo-surface text-revo-text font-bold text-lg hover:bg-revo-error/20 hover:border-revo-error/50 hover:text-white transition-colors flex flex-col items-center justify-center gap-1 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            <XCircle className="w-6 h-6 text-revo-error" />
            <span className="text-xs">Wusste ich nicht</span>
          </button>
          
          <button 
            onClick={() => handleNext(true)}
            disabled={isTransitioning}
            className="flex-1 py-4 rounded-2xl bg-revo-gold text-revo-teal font-bold text-lg shadow-lg hover:bg-yellow-500 transition-all flex flex-col items-center justify-center gap-1 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:active:scale-100 border border-yellow-600"
          >
            <CheckCircle className="w-6 h-6 text-revo-teal" />
            <span className="text-xs text-revo-teal/80">Gewusst!</span>
          </button>
        </div>
      </div>
    </div>
  );
};