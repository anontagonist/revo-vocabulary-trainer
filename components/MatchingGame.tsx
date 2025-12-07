import React, { useState, useEffect } from 'react';
import { VocabSet, QuizDirection, VocabItem } from '../types';
import { ArrowLeft, RotateCw, RefreshCcw } from 'lucide-react';

interface MatchingGameProps {
  set: VocabSet;
  direction: QuizDirection;
  onExit: () => void;
  onComplete: (scorePercentage: number, updatedItems: VocabItem[]) => void;
}

const ITEMS_PER_PAGE = 6;

// Helper to shuffle array
const shuffle = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

export const MatchingGame: React.FC<MatchingGameProps> = ({ set, direction, onExit, onComplete }) => {
  const [pages, setPages] = useState<VocabItem[][]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  // Selection State
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]); // Array of item IDs that are done
  const [wrongPairs, setWrongPairs] = useState<{left: string, right: string} | null>(null);

  // Stats
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0); // Tracks total pairs attempted
  const [itemUpdates, setItemUpdates] = useState<Record<string, { correct: number, wrong: number }>>({});
  const [completed, setCompleted] = useState(false);

  // Layout State
  const [leftCol, setLeftCol] = useState<VocabItem[]>([]);
  const [rightCol, setRightCol] = useState<VocabItem[]>([]);

  // Initialize Pages
  useEffect(() => {
    let allItems = [...set.items];
    const numPages = Math.ceil(allItems.length / ITEMS_PER_PAGE);
    const generatedPages: VocabItem[][] = [];

    // Shuffle initially
    allItems = shuffle(allItems);

    for (let i = 0; i < numPages; i++) {
        let chunk = allItems.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE);
        
        // Fill up last page if needed
        if (chunk.length < ITEMS_PER_PAGE && allItems.length >= ITEMS_PER_PAGE) {
            const needed = ITEMS_PER_PAGE - chunk.length;
            // Get random items from the REST of the set (excluding current chunk) to fill up
            const pool = allItems.filter(item => !chunk.find(c => c.id === item.id));
            const fillers = shuffle(pool).slice(0, needed);
            chunk = [...chunk, ...fillers];
        }
        generatedPages.push(chunk);
    }
    setPages(generatedPages);
    setCurrentPageIndex(0);
  }, [set.items]);

  // Setup current page layout
  useEffect(() => {
    if (pages.length > 0 && currentPageIndex < pages.length) {
        const pageItems = pages[currentPageIndex];
        // Shuffle left and right independently
        setLeftCol(shuffle(pageItems));
        setRightCol(shuffle(pageItems));
        setMatchedPairs([]);
        setSelectedLeft(null);
        setWrongPairs(null);
    } else if (pages.length > 0 && currentPageIndex >= pages.length) {
        finishGame();
    }
  }, [pages, currentPageIndex]);

  const finishGame = () => {
    setCompleted(true);
    // Calc score based on first-try correctness? 
    // Simplified: Percentage of items that were solved correctly without error?
    // Actually, we track item updates. Let's just sum up correctness from itemUpdates relative to total items in set.
    // However, filler items distort this.
    // Let's use simple logic: (sessionCorrect / (pages * ITEMS_PER_PAGE)) * 100 
    // But since fillers exist, let's base it on the ORIGINAL set size.
    // sessionCorrect increments for every pair solved. 
    // If we have fillers, we might solve more pairs than items in set.
    // Let's cap score at 100%.
    const totalPairsSolved = pages.length * ITEMS_PER_PAGE;
    // This is tough. Let's stick to standard item tracking.
    
    // Aggregate updates for final save
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

    // Score calculation:
    // We want a rough percentage. 
    const percentage = Math.round((sessionCorrect / totalPairsSolved) * 100);
    onComplete(Math.min(100, percentage), updatedItems);
  };

  const handleLeftClick = (id: string) => {
    if (matchedPairs.includes(id)) return;
    setWrongPairs(null);
    setSelectedLeft(id);
  };

  const handleRightClick = (id: string) => {
    if (matchedPairs.includes(id)) return;
    if (!selectedLeft) return;

    // Check match
    if (selectedLeft === id) {
        // Correct
        setMatchedPairs(prev => [...prev, id]);
        setSessionCorrect(prev => prev + 1);
        
        // Update Stats
        setItemUpdates(prev => {
            const current = prev[id] || { correct: 0, wrong: 0 };
            return { ...prev, [id]: { ...current, correct: current.correct + 1 }};
        });

        setSelectedLeft(null);

        // Check if page complete
        if (matchedPairs.length + 1 === ITEMS_PER_PAGE) {
            setTimeout(() => {
                setCurrentPageIndex(prev => prev + 1);
            }, 500);
        }

    } else {
        // Wrong
        setWrongPairs({ left: selectedLeft, right: id });
        
        // Update Stats
        setItemUpdates(prev => {
            const current = prev[selectedLeft] || { correct: 0, wrong: 0 };
            return { ...prev, [selectedLeft]: { ...current, wrong: current.wrong + 1 }};
        });

        setTimeout(() => {
            setWrongPairs(null);
            setSelectedLeft(null);
        }, 1000);
    }
  };

  const isOrigToTrans = direction === QuizDirection.ORIGINAL_TO_TRANSLATION;
  const languageName = set.metadata?.language || "Fremdsprache";

  if (completed) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Training beendet!</h2>
            <p className="mb-6">Alle Paare gefunden.</p>
            <button onClick={onExit} className="py-3 px-8 bg-revo-emerald rounded-xl font-bold">
                Zurück
            </button>
        </div>
     );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-revo-teal text-white">
        <div className="p-4 flex items-center justify-between border-b border-revo-emerald/20">
            <button onClick={onExit} className="p-2 text-revo-text hover:text-white rounded-full">
                <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-revo-gold uppercase tracking-widest">
                    Seite {currentPageIndex + 1} / {pages.length}
                </span>
                <span className="text-xs text-slate-400">Verbinde die Paare</span>
            </div>
            <div className="w-10"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-4 h-full max-w-2xl mx-auto items-center">
                {/* Left Column */}
                <div className="space-y-3">
                    <h3 className="text-center text-xs font-bold text-slate-400 uppercase mb-2">
                        {isOrigToTrans ? languageName : 'Deutsch'}
                    </h3>
                    {leftCol.map(item => {
                        const isMatched = matchedPairs.includes(item.id);
                        const isSelected = selectedLeft === item.id;
                        const isWrong = wrongPairs?.left === item.id;
                        
                        let baseClass = "w-full p-4 rounded-xl border-2 font-bold text-sm md:text-base transition-all duration-200 min-h-[4rem] flex items-center justify-center text-center break-words ";
                        
                        if (isMatched) baseClass += "bg-revo-success border-revo-success opacity-50 scale-95";
                        else if (isWrong) baseClass += "bg-revo-error border-revo-error animate-shake";
                        else if (isSelected) baseClass += "bg-revo-gold text-revo-teal border-revo-gold shadow-lg scale-105";
                        else baseClass += "bg-revo-surface border-revo-emerald/30 hover:border-revo-gold/50 cursor-pointer";

                        return (
                            <div 
                                key={item.id} 
                                onClick={() => handleLeftClick(item.id)}
                                className={baseClass}
                            >
                                {isOrigToTrans ? item.original : item.translation}
                            </div>
                        );
                    })}
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                    <h3 className="text-center text-xs font-bold text-slate-400 uppercase mb-2">
                         {isOrigToTrans ? 'Deutsch' : languageName}
                    </h3>
                    {rightCol.map(item => {
                         const isMatched = matchedPairs.includes(item.id);
                         const isWrong = wrongPairs?.right === item.id;
                         
                         let baseClass = "w-full p-4 rounded-xl border-2 font-bold text-sm md:text-base transition-all duration-200 min-h-[4rem] flex items-center justify-center text-center break-words ";
                        
                         if (isMatched) baseClass += "bg-revo-success border-revo-success opacity-50 scale-95";
                         else if (isWrong) baseClass += "bg-revo-error border-revo-error animate-shake";
                         else baseClass += "bg-revo-surface border-revo-emerald/30 hover:border-revo-gold/50 cursor-pointer";

                        return (
                            <div 
                                key={item.id} 
                                onClick={() => handleRightClick(item.id)}
                                className={baseClass}
                            >
                                {isOrigToTrans ? item.translation : item.original}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    </div>
  );
};