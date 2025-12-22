import React from 'react';
import { VocabSet, VocabItem } from '../types';
import { ArrowLeft, Brain, TrendingUp, Layers, AlertTriangle, Trophy, TrendingDown } from 'lucide-react';

interface StatisticsProps {
  sets: VocabSet[];
  onExit: () => void;
}

export const Statistics: React.FC<StatisticsProps> = ({ sets, onExit }) => {
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

  const problemWords = allVocabItems
    .filter(item => (item.wrongCount || 0) > 0)
    .sort((a, b) => (b.wrongCount || 0) - (a.wrongCount || 0))
    .slice(0, 10);

  // Identify Top and Flop sets
  const playedSets = sets.filter(s => s.lastScore !== undefined);
  playedSets.sort((a, b) => (b.lastScore || 0) - (a.lastScore || 0));
  
  const bestSet = playedSets.length > 0 ? playedSets[0] : null;
  const worstSet = playedSets.length > 0 ? playedSets[playedSets.length - 1] : null;
  
  // If best and worst are the same (only 1 set), don't show worst
  const showWorst = worstSet && bestSet && worstSet.id !== bestSet.id;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8 animate-in fade-in duration-300 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={onExit}
          className="p-2 text-revo-text hover:text-white hover:bg-revo-surface rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-extrabold text-white">Deine Statistik 📊</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-revo-surface p-6 rounded-2xl border border-revo-emerald/30 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-sky-500/20 rounded-lg">
              <Layers className="w-5 h-5 text-sky-400" />
            </div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Lernumfang</span>
          </div>
          <div className="text-3xl font-extrabold text-white">{totalItems} <span className="text-lg text-slate-500 font-normal">Wörter</span></div>
          <div className="text-sm text-slate-500 mt-1">in {sets.length} Sets</div>
        </div>

        <div className="bg-revo-surface p-6 rounded-2xl border border-revo-emerald/30 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-revo-emerald/20 rounded-lg">
              <Brain className="w-5 h-5 text-revo-emerald" />
            </div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Erfolgsquote</span>
          </div>
          <div className="text-3xl font-extrabold text-white">{globalSuccessRate}%</div>
          <div className="text-sm text-slate-500 mt-1">All-time Durchschnitt</div>
        </div>

        <div className="bg-revo-surface p-6 rounded-2xl border border-revo-emerald/30 shadow-lg">
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

      <div className="bg-revo-surface rounded-2xl border border-revo-emerald/30 shadow-lg overflow-hidden p-6">
        <h3 className="text-lg font-bold text-white mb-6">Top & Flop</h3>
        
        {playedSets.length === 0 ? (
           <p className="text-slate-500 text-center py-4">Lerne erst ein paar Sets, um deine Bestleistungen zu sehen!</p>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bestSet && (
                <div className="bg-gradient-to-br from-revo-surface to-revo-emerald/20 rounded-xl p-5 border border-revo-emerald/30 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Trophy className="w-20 h-20" />
                  </div>
                  <div className="flex items-center gap-3 mb-3 relative z-10">
                    <div className="p-2 bg-revo-gold/20 rounded-full text-revo-gold">
                       <Trophy className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-revo-gold uppercase tracking-wide">Beste Leistung</span>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2 truncate relative z-10">{bestSet.title}</h4>
                  <div className="flex items-end gap-2 relative z-10">
                    <span className="text-4xl font-extrabold text-white">{bestSet.lastScore}%</span>
                    <span className="text-sm text-slate-400 mb-1.5">Erfolg</span>
                  </div>
                </div>
              )}

              {showWorst && worstSet && (
                <div className="bg-gradient-to-br from-revo-surface to-revo-error/10 rounded-xl p-5 border border-revo-error/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <TrendingDown className="w-20 h-20" />
                  </div>
                  <div className="flex items-center gap-3 mb-3 relative z-10">
                    <div className="p-2 bg-revo-error/20 rounded-full text-revo-error">
                       <TrendingDown className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-revo-error uppercase tracking-wide">Hier geht noch was</span>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2 truncate relative z-10">{worstSet.title}</h4>
                  <div className="flex items-end gap-2 relative z-10">
                    <span className="text-4xl font-extrabold text-white">{worstSet.lastScore}%</span>
                    <span className="text-sm text-slate-400 mb-1.5">Erfolg</span>
                  </div>
                </div>
              )}
           </div>
        )}
      </div>

      <div className="bg-revo-surface rounded-2xl border border-revo-emerald/30 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-revo-emerald/20">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-revo-error" />
            Häufigste Fehler (Top 10)
          </h3>
          <p className="text-sm text-slate-400 mt-1">Diese Vokabeln bereiten Dir am meisten Schwierigkeiten.</p>
        </div>
        
        <div className="divide-y divide-revo-emerald/20">
           {problemWords.length === 0 ? (
             <div className="p-8 text-center text-slate-500">
               Noch keine Fehler aufgezeichnet. Super!
             </div>
           ) : (
             problemWords.map((item, idx) => (
               <div key={idx} className="p-4 flex items-center justify-between hover:bg-revo-teal/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-revo-teal text-slate-500 text-sm font-bold border border-revo-emerald/30">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-200">{item.original}</div>
                      <div className="text-sm text-slate-400">{item.translation}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-revo-error font-bold text-lg">{item.wrongCount}x</div>
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