import React, { useState, useEffect } from 'react';
import { VocabSet, AppView, QuizDirection, VocabItem } from './types';
import { Dashboard } from './components/Dashboard';
import { CreateSet } from './components/CreateSet';
import { Quiz } from './components/Quiz';
import { Statistics } from './components/Statistics';
import { loadSets, saveSets, updateStreak } from './services/storageService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [sets, setSets] = useState<VocabSet[]>([]);
  const [activeSet, setActiveSet] = useState<VocabSet | null>(null);
  const [quizDirection, setQuizDirection] = useState<QuizDirection>(QuizDirection.ORIGINAL_TO_TRANSLATION);

  useEffect(() => {
    const loaded = loadSets();
    setSets(loaded);
  }, []);

  // Calculate items for Tough Mode (< 81% success rate)
  const getToughItems = (): VocabItem[] => {
    const toughOnes: VocabItem[] = [];
    sets.forEach(set => {
      set.items.forEach(item => {
        const total = (item.correctCount || 0) + (item.wrongCount || 0);
        let rate = 0;
        if (total > 0) {
          rate = (item.correctCount || 0) / total;
        }
        // Include if rate < 0.81 OR never practiced (optional, but let's stick to explicit requests)
        // User asked: "weniger als 81% Erfolgsraten"
        // Words with 0 attempts have 0% rate, so they are included.
        if (rate < 0.81) {
          toughOnes.push(item);
        }
      });
    });
    return toughOnes;
  };

  const handleSaveSet = (newSet: VocabSet) => {
    const updatedSets = [newSet, ...sets];
    setSets(updatedSets);
    saveSets(updatedSets);
    setView(AppView.DASHBOARD);
  };

  const handleDeleteSet = (id: string) => {
    const updatedSets = sets.filter(s => s.id !== id);
    setSets(updatedSets);
    saveSets(updatedSets);
  };

  const handleSelectSet = (set: VocabSet, direction: QuizDirection) => {
    setActiveSet(set);
    setQuizDirection(direction);
    setView(AppView.QUIZ);
  };

  const handleStartToughMode = (direction: QuizDirection) => {
    const toughItems = getToughItems();
    if (toughItems.length === 0) return;

    // Create a temporary set
    const toughSet: VocabSet = {
      id: 'TOUGH_MODE',
      title: 'Tough Mode 🔥',
      createdAt: Date.now(),
      items: toughItems,
      color: 'bg-orange-600',
      metadata: { language: 'Fremdsprache', grade: '', chapter: '', page: '' }
    };
    
    setActiveSet(toughSet);
    setQuizDirection(direction);
    setView(AppView.QUIZ);
  };

  const handleQuizComplete = (scorePercentage: number, updatedItems: VocabItem[]) => {
    if (!activeSet) return;
    
    // 1. Update the score on the set (only if it's a real set, not tough mode)
    // 2. Update the stats on the individual items (globally)
    
    const newSets = sets.map(s => {
      // Is this the set we just played?
      const isCurrentSet = s.id === activeSet.id;
      
      // Update items inside this set if they were part of the quiz
      const newItems = s.items.map(item => {
        const updatedVersion = updatedItems.find(u => u.id === item.id);
        if (updatedVersion) {
          return updatedVersion; // Use the version with updated counts
        }
        return item;
      });

      return {
        ...s,
        items: newItems,
        lastScore: isCurrentSet ? scorePercentage : s.lastScore // Only update score if it was this specific set
      };
    });

    setSets(newSets);
    saveSets(newSets);
    
    // Update Streak
    updateStreak();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans w-full overflow-x-hidden">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-slate-800 to-slate-900 -z-10"></div>
      
      <main className="h-full">
        {view === AppView.DASHBOARD && (
          <Dashboard 
            sets={sets}
            onDeleteSet={handleDeleteSet}
            onSelectSet={handleSelectSet}
            onCreateNew={() => setView(AppView.CREATE_SET)}
            onStartToughMode={handleStartToughMode}
            onShowStats={() => setView(AppView.STATISTICS)}
            toughItemsCount={getToughItems().length}
          />
        )}

        {view === AppView.CREATE_SET && (
          <CreateSet 
            onSave={handleSaveSet}
            onCancel={() => setView(AppView.DASHBOARD)}
          />
        )}

        {view === AppView.QUIZ && activeSet && (
          <Quiz 
            set={activeSet}
            direction={quizDirection}
            onExit={() => setView(AppView.DASHBOARD)}
            onComplete={handleQuizComplete}
          />
        )}

        {view === AppView.STATISTICS && (
          <Statistics 
            sets={sets}
            onExit={() => setView(AppView.DASHBOARD)}
          />
        )}
      </main>
    </div>
  );
};

export default App;