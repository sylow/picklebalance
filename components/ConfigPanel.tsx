
import React from 'react';

interface ConfigPanelProps {
  courts: number;
  setCourts: (n: number) => void;
  rounds: number;
  setRounds: (n: number) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  playerCount: number;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  courts,
  setCourts,
  rounds,
  setRounds,
  onGenerate,
  isGenerating,
  playerCount
}) => {
    
  const maxPlayersPerRound = courts * 4;
  const byesPerRound = Math.max(0, playerCount - maxPlayersPerRound);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Courts</label>
          <input
            type="number"
            min="1"
            max="10"
            value={courts}
            onChange={(e) => setCourts(parseInt(e.target.value) || 1)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
            disabled={isGenerating}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Rounds</label>
          <input
            type="number"
            min="1"
            max="20"
            value={rounds}
            onChange={(e) => setRounds(parseInt(e.target.value) || 1)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
            disabled={isGenerating}
          />
        </div>
      </div>
      
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className={`w-full py-3 px-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 text-sm
          ${isGenerating 
            ? 'bg-slate-400 cursor-not-allowed shadow-none' 
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-200'}`}
      >
          {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Thinking...
              </>
          ) : (
              <>
                  Generate Schedule
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
              </>
          )}
      </button>

      {/* Stats Preview */}
      <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
          <div className="flex justify-between items-center mb-1">
             <span className="text-xs text-indigo-800 font-medium">Est. Capacity</span>
             <span className="text-xs text-indigo-600 font-bold">{maxPlayersPerRound} active / round</span>
          </div>
          {byesPerRound > 0 ? (
             <div className="flex justify-between items-center">
                <span className="text-xs text-orange-700 font-medium">Byes needed</span>
                <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">{byesPerRound} per round</span>
             </div>
          ) : (
              <div className="flex justify-between items-center">
                <span className="text-xs text-emerald-700 font-medium">Status</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Full Utilization</span>
             </div>
          )}
      </div>
    </div>
  );
};
