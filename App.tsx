import React, { useState, useEffect } from 'react';
import { VocabSet, AppView, QuizDirection, VocabItem, User } from './types';
import { Dashboard } from './components/Dashboard';
import { CreateSet } from './components/CreateSet';
import { Quiz } from './components/Quiz';
import { Statistics } from './components/Statistics';
import { Auth } from './components/Auth';
import { MatchingGame } from './components/MatchingGame';
import { MultipleChoiceGame } from './components/MultipleChoiceGame';
import { loadSets, saveSets, updateStreak } from './services/storageService';
import { getCurrentUser, logoutUser } from './services/authService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<AppView>(AppView.AUTH);
  
  const [sets, setSets] = useState<VocabSet[]>([]);
  const [activeSet, setActiveSet] = useState<VocabSet | null>(null);
  const [quizDirection, setQuizDirection] = useState<QuizDirection>(QuizDirection.ORIGINAL_TO_TRANSLATION);

  // Check for login on mount
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      loadUserData(user.id);
      setView(AppView.DASHBOARD);
    }
  }, []);

  const loadUserData = (userId: string) => {
    const loaded = loadSets(userId);
    setSets(loaded);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    loadUserData(user.id);
    setView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setSets([]);
    setView(AppView.AUTH);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

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
        if (rate < 0.81) {
          toughOnes.push(item);
        }
      });
    });
    return toughOnes;
  };

  const handleSaveSet = (newSet: VocabSet) => {
    if (!currentUser) return;
    
    // Assign current user ID to the new set
    const setWithUser = { ...newSet, userId: currentUser.id };
    
    const updatedSets = [setWithUser, ...sets];
    setSets(updatedSets);
    saveSets(updatedSets);
    setView(AppView.DASHBOARD);
  };

  const handleDeleteSet = (id: string) => {
    const updatedSets = sets.filter(s => s.id !== id);
    setSets(updatedSets);
    saveSets(updatedSets);
  };

  const handleSelectSet = (set: VocabSet, mode: AppView, direction: QuizDirection) => {
    setActiveSet(set);
    setQuizDirection(direction);
    setView(mode);
  };

  const handleStartToughMode = (direction: QuizDirection) => {
    const toughItems = getToughItems();
    if (toughItems.length === 0) return;

    // Create a temporary set
    const toughSet: VocabSet = {
      id: 'TOUGH_MODE',
      userId: currentUser?.id || 'temp',
      title: 'Tough Mode 🔥',
      createdAt: Date.now(),
      items: toughItems,
      color: 'bg-orange-600',
      metadata: { language: 'Fremdsprache', grade: '', chapter: '', page: '' }
    };
    
    setActiveSet(toughSet);
    setQuizDirection(direction);
    // Tough mode defaults to simple quiz for now, or we could ask for mode too?
    // Prompt said "Auch hier wird wieder gefragt in welche Richtung abgefragt werden soll".
    // Let's default tough mode to QUIZ (Flashcards) as it's the most effective for drilling.
    setView(AppView.QUIZ);
  };

  const handleQuizComplete = (scorePercentage: number, updatedItems: VocabItem[]) => {
    if (!activeSet || !currentUser) return;
    
    const newSets = sets.map(s => {
      // Only update stats if it's a real set, not tough mode temp set
      if (s.id === 'TOUGH_MODE') {
         // For tough mode, we must find the original items in the real sets and update them
         // BUT standard saveSets logic iterates over `s.items`.
         // We need a way to propagate updates back to source sets.
         // This simple implementation only updates if the item ID matches.
         const newItems = s.items.map(item => {
             const updatedVersion = updatedItems.find(u => u.id === item.id);
             return updatedVersion || item;
         });
         return { ...s, items: newItems };
      }

      const isCurrentSet = s.id === activeSet.id;
      
      const newItems = s.items.map(item => {
        const updatedVersion = updatedItems.find(u => u.id === item.id);
        if (updatedVersion) {
          return updatedVersion;
        }
        return item;
      });

      return {
        ...s,
        items: newItems,
        lastScore: isCurrentSet ? scorePercentage : s.lastScore
      };
    });

    setSets(newSets);
    saveSets(newSets);
    
    updateStreak(currentUser.id);
  };

  if (view === AppView.AUTH) {
    return <Auth onLogin={handleLogin} />;
  }

  // Guard clause
  if (!currentUser) {
      setView(AppView.AUTH);
      return null;
  }

  return (
    <div className="min-h-screen bg-revo-teal text-white font-sans w-full overflow-x-hidden">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-revo-teal to-revo-surface -z-10"></div>
      
      <main className="h-full">
        {view === AppView.DASHBOARD && (
          <Dashboard 
            user={currentUser}
            sets={sets}
            onDeleteSet={handleDeleteSet}
            onSelectSet={handleSelectSet}
            onCreateNew={() => setView(AppView.CREATE_SET)}
            onStartToughMode={handleStartToughMode}
            onShowStats={() => setView(AppView.STATISTICS)}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
            toughItemsCount={getToughItems().length}
          />
        )}

        {view === AppView.CREATE_SET && (
          <CreateSet 
            onSave={handleSaveSet}
            onCancel={() => setView(AppView.DASHBOARD)}
          />
        )}

        {/* Game Modes */}
        {view === AppView.QUIZ && activeSet && (
          <Quiz 
            set={activeSet}
            direction={quizDirection}
            onExit={() => setView(AppView.DASHBOARD)}
            onComplete={handleQuizComplete}
          />
        )}

        {view === AppView.MATCHING_GAME && activeSet && (
          <MatchingGame 
            set={activeSet}
            direction={quizDirection}
            onExit={() => setView(AppView.DASHBOARD)}
            onComplete={handleQuizComplete}
          />
        )}

        {view === AppView.MULTIPLE_CHOICE && activeSet && (
          <MultipleChoiceGame 
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