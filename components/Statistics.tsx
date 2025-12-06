import React from 'react';
import { VocabSet, VocabItem } from '../types';
import { ArrowLeft, Brain, TrendingUp, Layers, AlertTriangle } from 'lucide-react';

interface StatisticsProps {
  sets: VocabSet[];
  onExit: () => void;
}

export const Statistics: React.FC<StatisticsProps> = ({ sets, onExit }) => {
  // Aggregate Data
  let totalItems = 0;
  let totalCorrect = 0;
  let totalWrong = 0;
  let allVocabItems: (VocabItem & { setDetails?: string })[] = [];

  sets.forEach(set => {
    totalItems += set.items.length;
    set.items.forEach(item => {
      totalCorrect += (item.correctCount || 0);
      totalWrong += (item.wrongCount || 0);
      allVocabItems.push({ ...item, setDetails: set.title });
    });
  });

  const totalAttempts = totalCorrect + totalWrong;
  const globalSuccessRate = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  // Identify Top Problem Words (Sorted by most wrong answers)
  const problemWords = allVocabItems
    .filter(item => (item.wrongCount || 0) > 0)
    .sort((a, b) => (b.wrongCount || 0) - (a.wrongCount || 0))
    .slice(0, 10);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8 animate-in fade-in duration-300 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onExit}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-extrabold text-white">Deine Statistik 📊</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-sky-500/20 rounded-lg">
              <Layers className="w-5 h-5 text-sky-400" />
            </div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Lernumfang</span>
          </div>
          <div className="text-3xl font-extrabold text-white">{totalItems} <span className="text-lg text-slate-500 font-normal">Wörter</span></div>
          <div className="text-sm text-slate-500 mt-1">in {sets.length} Sets</div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Brain className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Erfolgsquote</span>
          </div>
          <div className="text-3xl font-extrabold text-white">{globalSuccessRate}%</div>
          <div className="text-sm text-slate-500 mt-1">All-time Durchschnitt</div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Aktivität</span>
          </div>
          <div className="text-3xl font-extrabold text-white">{totalAttempts}</div>
          <div className="text-sm text-slate-500 mt-1">Beantwortete Fragen</div>
        </div>
      </div>

      {/* Set Performance Overview */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-6">Leistung pro Set</h3>
        <div className="space-y-4">
          {sets.length === 0 && <p className="text-slate-500">Keine Sets vorhanden.</p>}
          {sets.map(set => (
            <div key={set.id} className="space-y-1">
               <div className="flex justify-between text-sm">
                 <span className="font-semibold text-slate-300">{set.title}</span>
                 <span className="text-slate-400 font-mono">{set.lastScore !== undefined ? set.lastScore + '%' : '-'}</span>
               </div>
               <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                 {set.lastScore !== undefined ? (
                   <div 
                     className={`h-full rounded-full ${set.lastScore >= 80 ? 'bg-emerald-500' : set.lastScore >= 50 ? 'bg-amber-500' : 'bg-orange-500'}`}
                     style={{ width: `${set.lastScore}%` }}
                   ></div>
                 ) : (
                   <div className="h-full bg-slate-600 w-full opacity-20"></div>
                 )}
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Problem Words */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Häufigste Fehler
          </h3>
          <p className="text-sm text-slate-400 mt-1">Diese Vokabeln bereiten Dir am meisten Schwierigkeiten.</p>
        </div>
        
        <div className="divide-y divide-slate-700">
           {problemWords.length === 0 ? (
             <div className="p-8 text-center text-slate-500">
               Noch keine Fehler aufgezeichnet. Super!
             </div>
           ) : (
             problemWords.map((item, idx) => (
               <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-slate-500 text-sm font-bold border border-slate-700">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-200">{item.original}</div>
                      <div className="text-sm text-slate-400">{item.translation}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-400 font-bold text-lg">{item.wrongCount}x</div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold">Falsch</div>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
};
