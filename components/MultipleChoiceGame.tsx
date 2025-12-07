import React, { useState, useEffect } from 'react';
import { VocabSet, QuizDirection, VocabItem } from '../types';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

interface MultipleChoiceGameProps {
  set: VocabSet;
  direction: QuizDirection;
  onExit: () => void;
  onComplete: (scorePercentage: number, updatedItems: VocabItem[]) => void;
}

export const MultipleChoiceGame: React.FC<MultipleChoiceGameProps> = ({ set, direction, onExit, onComplete }) => {
  const [cards, setCards] = useState(() => [...set.items].sort(() => Math.random() - 0.5));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [itemUpdates, setItemUpdates] = useState<Record<string, { correct: number, wrong: number }>>({});
  const [completed, setCompleted] = useState(false);

  const currentCard = cards[currentIndex];
  const isOrigToTrans = direction === QuizDirection.ORIGINAL_TO_TRANSLATION;
  
  // Prepare Options
  useEffect(() => {
    if (!currentCard) return;

    const correctAns = isOrigToTrans ? currentCard.translation : currentCard.original;
    
    // Get 3 distractors
    const distractors = set.items
        .filter(i => i.id !== currentCard.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(i => isOrigToTrans ? i.translation : i.original);
    
    // Combine and shuffle
    const allOpts = [...distractors, correctAns].sort(() => Math.random() - 0.5);
    setOptions(allOpts);
    setSelectedOption(null);
    setIsAnswered(false);
  }, [currentIndex, currentCard, direction, set.items]);

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    
    const correctAns = isOrigToTrans ? currentCard.translation : currentCard.original;
    const correct = option === correctAns;
    
    setSelectedOption(option);
    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) setSessionCorrect(prev => prev + 1);

    // Track Stats
    setItemUpdates(prev => {
        const current = prev[currentCard.id] || { correct: 0, wrong: 0 };
        return {
          ...prev,
          [currentCard.id]: {
            correct: current.correct + (correct ? 1 : 0),
            wrong: current.wrong + (correct ? 0 : 1)
          }
        };
    });

    // Auto Advance
    setTimeout(() => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            finishGame();
        }
    }, 1500);
  };

  const finishGame = () => {
    setCompleted(true);
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
  };

  if (completed) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Quiz beendet!</h2>
            <div className="text-6xl font-bold text-revo-gold mb-4">{Math.round((sessionCorrect / cards.length) * 100)}%</div>
            <p className="mb-6 text-revo-text">Du hast {sessionCorrect} von {cards.length} richtig beantwortet.</p>
            <button onClick={onExit} className="py-3 px-8 bg-revo-emerald rounded-xl font-bold">
                Zurück
            </button>
        </div>
      );
  }

  if (!currentCard) return null;

  const question = isOrigToTrans ? currentCard.original : currentCard.translation;
  const correctAns = isOrigToTrans ? currentCard.translation : currentCard.original;
  const languageName = set.metadata?.language || "Fremdsprache";

  return (
    <div className="flex flex-col h-screen max-h-screen bg-revo-teal text-white">
        <div className="p-4 flex items-center justify-between">
            <button onClick={onExit} className="p-2 text-revo-text hover:text-white rounded-full">
                <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-revo-gold uppercase tracking-widest">
                    Frage {currentIndex + 1} / {cards.length}
                </span>
            </div>
            <div className="w-10"></div>
        </div>

        <div className="w-full h-1 bg-revo-surface mb-6">
            <div 
                className="h-full bg-revo-gold transition-all duration-300" 
                style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
            ></div>
        </div>

        <div className="flex-1 flex flex-col items-center max-w-md mx-auto w-full p-6">
            <div className="mb-12 text-center w-full">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">
                    {isOrigToTrans ? languageName : 'Deutsch'}
                </span>
                <h2 className="text-4xl font-extrabold text-white break-words">{question}</h2>
            </div>

            <div className="w-full space-y-3">
                {options.map((option, idx) => {
                    let btnClass = "w-full p-4 rounded-xl border-2 font-bold text-lg transition-all active:scale-95 flex items-center justify-between ";
                    const isSelected = selectedOption === option;
                    const isTheCorrectOne = option === correctAns;

                    if (isAnswered) {
                        if (isTheCorrectOne) btnClass += "bg-revo-success border-revo-success text-white shadow-lg";
                        else if (isSelected && !isTheCorrectOne) btnClass += "bg-revo-error border-revo-error text-white opacity-80";
                        else btnClass += "bg-revo-surface border-revo-surface text-slate-500 opacity-50";
                    } else {
                        btnClass += "bg-revo-surface border-revo-emerald/30 hover:border-revo-gold text-white shadow-md hover:bg-revo-emerald/20";
                    }

                    return (
                        <button 
                            key={idx} 
                            onClick={() => handleOptionClick(option)}
                            disabled={isAnswered}
                            className={btnClass}
                        >
                            <span>{option}</span>
                            {isAnswered && isTheCorrectOne && <CheckCircle className="w-6 h-6" />}
                            {isAnswered && isSelected && !isTheCorrectOne && <XCircle className="w-6 h-6" />}
                        </button>
                    );
                })}
            </div>
        </div>
    </div>
  );
};