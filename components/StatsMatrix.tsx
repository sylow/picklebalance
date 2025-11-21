
import React, { useMemo, useState } from 'react';
import { Player, TournamentSchedule } from '../types';

interface StatsMatrixProps {
  players: Player[];
  schedule: TournamentSchedule | null;
}

export const StatsMatrix: React.FC<StatsMatrixProps> = ({ players, schedule }) => {
  const [activeTab, setActiveTab] = useState<'partners' | 'opponents'>('partners');

  const stats = useMemo(() => {
    if (!schedule || players.length === 0) return null;

    const playerIndexMap = new Map<string, number>();
    players.forEach((p, index) => playerIndexMap.set(p.id, index));
    const n = players.length;

    // Init matrices with 0
    const partnerM = Array.from({ length: n }, () => Array(n).fill(0));
    const opponentM = Array.from({ length: n }, () => Array(n).fill(0));
    const gamesPlayed = Array(n).fill(0);

    schedule.rounds.forEach((round) => {
      round.matches.forEach((match) => {
        const p1 = match.team1.player1Id;
        const p2 = match.team1.player2Id;
        const p3 = match.team2.player1Id;
        const p4 = match.team2.player2Id;

        const ids = [p1, p2, p3, p4];
        
        // Games Played
        ids.forEach(id => {
            const idx = playerIndexMap.get(id);
            if (idx !== undefined) gamesPlayed[idx]++;
        });

        // Partners
        const addPartner = (a: string, b: string) => {
          const idxA = playerIndexMap.get(a);
          const idxB = playerIndexMap.get(b);
          if (idxA !== undefined && idxB !== undefined) {
            partnerM[idxA][idxB]++;
            partnerM[idxB][idxA]++;
          }
        };
        addPartner(p1, p2);
        addPartner(p3, p4);

        // Opponents
        const addOpponent = (a: string, b: string) => {
          const idxA = playerIndexMap.get(a);
          const idxB = playerIndexMap.get(b);
          if (idxA !== undefined && idxB !== undefined) {
            opponentM[idxA][idxB]++;
            opponentM[idxB][idxA]++;
          }
        };
        // Team 1 vs Team 2
        addOpponent(p1, p3);
        addOpponent(p1, p4);
        addOpponent(p2, p3);
        addOpponent(p2, p4);
      });
    });

    return { partnerM, opponentM, gamesPlayed };
  }, [players, schedule]);

  if (!schedule) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl min-h-[400px]">
        <p className="text-lg font-medium">No stats available</p>
        <p className="text-sm">Generate a schedule to view the fairness matrix.</p>
      </div>
    );
  }

  if (!stats) return null;

  const { partnerM, opponentM, gamesPlayed } = stats;
  const activeMatrix = activeTab === 'partners' ? partnerM : opponentM;

  // Helper to determine cell color
  const getCellColor = (val: number, isSelf: boolean, type: 'partners' | 'opponents') => {
    if (isSelf) return 'bg-slate-100';
    if (type === 'partners') {
       if (val === 0) return 'bg-white';
       if (val === 1) return 'bg-emerald-50 text-emerald-700 font-medium'; // Good
       if (val === 2) return 'bg-amber-100 text-amber-700 font-bold border border-amber-200'; // Warning
       return 'bg-rose-100 text-rose-700 font-bold border border-rose-200'; // Bad
    } else {
       // Opponents
       if (val === 0) return 'bg-slate-50 text-slate-300';
       if (val === 1) return 'bg-emerald-50 text-emerald-700';
       if (val === 2) return 'bg-blue-50 text-blue-700 font-medium';
       if (val >= 3) return 'bg-amber-100 text-amber-700 font-bold border border-amber-200';
       return 'bg-white';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header / Tabs */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
        <div>
            <h3 className="font-bold text-slate-800">Fairness Matrix</h3>
            <p className="text-xs text-slate-500">Audit player interactions</p>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('partners')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all uppercase tracking-wide ${
              activeTab === 'partners' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Partners
          </button>
          <button
            onClick={() => setActiveTab('opponents')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all uppercase tracking-wide ${
              activeTab === 'opponents' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Opponents
          </button>
        </div>
      </div>

      {/* Matrix Container */}
      <div className="overflow-x-auto p-4">
        <div className="inline-block min-w-full align-middle">
            <div className="border rounded-lg overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th scope="col" className="px-3 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                            Player
                        </th>
                        <th scope="col" className="px-2 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-200 w-16">
                           Games
                        </th>
                        {players.map((p, i) => (
                            <th key={p.id} scope="col" className="px-1 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider w-8 min-w-[32px]">
                                {i + 1}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                    {players.map((rowPlayer, rowIndex) => (
                    <tr key={rowPlayer.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-slate-800 text-white text-[10px] font-bold shadow-sm">
                                    {rowIndex + 1}
                                </span>
                                <span className="truncate max-w-[120px]" title={rowPlayer.name}>{rowPlayer.name}</span>
                            </div>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-center text-xs text-slate-600 border-r border-slate-100 bg-slate-50/50 font-mono font-bold">
                             {gamesPlayed[rowIndex]}
                        </td>
                        {players.map((colPlayer, colIndex) => {
                            const isSelf = rowIndex === colIndex;
                            const val = activeMatrix[rowIndex][colIndex];
                            return (
                                <td 
                                    key={colPlayer.id} 
                                    className={`px-1 py-2 whitespace-nowrap text-center text-xs border-r border-slate-50 last:border-r-0 ${getCellColor(val, isSelf, activeTab)}`}
                                    title={`${rowPlayer.name} & ${colPlayer.name}: ${val}`}
                                >
                                    {isSelf ? '' : val}
                                </td>
                            );
                        })}
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap gap-6">
        <span className="font-bold uppercase tracking-wide text-slate-400">Legend:</span>
        {activeTab === 'partners' ? (
            <>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-white border border-slate-200"></span> 0 (Perfect)</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200"></span> 1 (Good)</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-200"></span> 2 (Repeat)</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-rose-100 border border-rose-200"></span> 3+ (Avoid)</span>
            </>
        ) : (
            <>
                 <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-slate-50 border border-slate-200"></span> 0</span>
                 <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200"></span> 1-2 (Normal)</span>
                 <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-200"></span> 3+ (Frequent)</span>
            </>
        )}
      </div>
    </div>
  );
};
