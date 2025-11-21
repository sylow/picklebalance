
import React, { useState } from 'react';
import { Player, TournamentSchedule, Match } from '../types';

interface ScheduleDisplayProps {
  schedule: TournamentSchedule | null;
  players: Player[];
}

export const ScheduleDisplay: React.FC<ScheduleDisplayProps> = ({ schedule, players }) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  if (!schedule) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl min-h-[400px]">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">Ready to Organize</h3>
        <p className="text-sm max-w-xs text-center">Configure your courts and roster on the left, then click Generate to create the perfect schedule.</p>
      </div>
    );
  }

  const getPlayer = (id: string) => players.find((p) => p.id === id) || { name: 'Unknown', dupr: 0 };

  const handlePlayerClick = (id: string) => {
      // If clicking the already selected player, deselect. Otherwise select.
      if (selectedPlayerId === id) setSelectedPlayerId(null);
      else setSelectedPlayerId(id);
  };

  // --- Sub-components ---

  const PlayerName = ({ id, align = 'left' }: { id: string, align?: 'left' | 'right' }) => {
      const p = getPlayer(id);
      const isSelected = selectedPlayerId === id;
      
      return (
          <div 
              onClick={(e) => { e.stopPropagation(); handlePlayerClick(id); }}
              className={`flex items-center gap-2 cursor-pointer group/player select-none ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}
          >
              <span className={`text-[10px] font-mono px-1 rounded transition-colors ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover/player:bg-slate-200'}`}>
                  {p.dupr.toFixed(1)}
              </span>
              <span className={`text-sm font-semibold transition-colors ${isSelected ? 'text-indigo-600 underline decoration-2 underline-offset-2' : 'text-slate-800 group-hover/player:text-indigo-600'}`}>
                  {p.name}
              </span>
          </div>
      );
  };

  const MatchRow = ({ match }: { match: Match }) => {
    const t1p1Id = match.team1.player1Id;
    const t1p2Id = match.team1.player2Id;
    const t2p1Id = match.team2.player1Id;
    const t2p2Id = match.team2.player2Id;

    const t1p1 = getPlayer(t1p1Id);
    const t1p2 = getPlayer(t1p2Id);
    const t2p1 = getPlayer(t2p1Id);
    const t2p2 = getPlayer(t2p2Id);

    const t1Dupr = t1p1.dupr + t1p2.dupr;
    const t2Dupr = t2p1.dupr + t2p2.dupr;
    const diff = Math.abs(t1Dupr - t2Dupr).toFixed(2);
    const isGoodMatch = Number(diff) < 0.3;

    return (
      <div className="group bg-white hover:bg-slate-50 border-b last:border-b-0 border-slate-100 p-3 flex items-center justify-between gap-4 transition-colors">
        
        {/* Left: Court Info */}
        <div className="w-16 flex-shrink-0 flex flex-col items-center justify-center border-r border-slate-100 pr-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Court</span>
            <span className="text-lg font-bold text-slate-700 leading-none">{match.courtNumber}</span>
        </div>

        {/* Middle: Matchup */}
        <div className="flex-1 grid grid-cols-[1fr,auto,1fr] items-center gap-2 md:gap-6">
            {/* Team 1 */}
            <div className="flex flex-col items-end gap-0.5">
                <PlayerName id={t1p1Id} align="right" />
                <PlayerName id={t1p2Id} align="right" />
            </div>

            {/* VS Badge */}
            <div className="flex flex-col items-center">
                 <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-400 border border-slate-200">VS</div>
            </div>

            {/* Team 2 */}
            <div className="flex flex-col items-start gap-0.5">
                <PlayerName id={t2p1Id} align="left" />
                <PlayerName id={t2p2Id} align="left" />
            </div>
        </div>

        {/* Right: Stats */}
        <div className="w-20 flex-shrink-0 flex flex-col items-end pl-3 border-l border-slate-100">
             <span className="text-[9px] text-slate-400 font-medium uppercase">Diff</span>
             <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                 isGoodMatch 
                 ? 'text-emerald-600 bg-emerald-50' 
                 : 'text-amber-600 bg-amber-50'
             }`}>
                 {diff}
             </span>
        </div>
      </div>
    );
  };

  // --- Filtering Logic ---

  const filteredRounds = schedule.rounds.map(round => {
      // If no filter, return everything
      if (!selectedPlayerId) return { ...round, isVisible: true };

      // Check if player is in byes
      if (round.byes.includes(selectedPlayerId)) {
          return { ...round, matches: [], isByeRound: true, isVisible: true };
      }

      // Check if player is in a match
      const playerMatch = round.matches.find(m => 
        m.team1.player1Id === selectedPlayerId || 
        m.team1.player2Id === selectedPlayerId || 
        m.team2.player1Id === selectedPlayerId || 
        m.team2.player2Id === selectedPlayerId
      );

      if (playerMatch) {
          return { ...round, matches: [playerMatch], isByeRound: false, isVisible: true };
      }

      // Should theoretically not happen in a full schedule if not in bye and not in match
      return { ...round, isVisible: false };
  }).filter(r => r.isVisible);


  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      
      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between sticky top-0 z-10">
         <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter By Player:</span>
            <div className="relative">
                <select 
                    className="appearance-none bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium rounded-lg py-1.5 pl-3 pr-8 outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                    value={selectedPlayerId || ''}
                    onChange={(e) => setSelectedPlayerId(e.target.value || null)}
                >
                    <option value="">Show All Matches</option>
                    {players.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.dupr})</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
         </div>
         
         {selectedPlayerId && (
             <button 
                onClick={() => setSelectedPlayerId(null)}
                className="text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
             >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                 </svg>
                 Clear Filter
             </button>
         )}
      </div>

      {/* Rounds List */}
      {filteredRounds.map((round) => (
        <div key={round.roundNumber} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up">
          {/* Round Header */}
          <div className={`px-4 py-2 border-b border-slate-200 flex items-center justify-between backdrop-blur-sm ${
              // Use a different header color if this round is a BYE for the selected player
              (round as any).isByeRound ? 'bg-amber-50/80' : 'bg-slate-50/80'
          }`}>
             <div className="flex items-center gap-2">
                <div className="bg-slate-800 text-white w-5 h-5 rounded flex items-center justify-center text-xs font-bold">
                    {round.roundNumber}
                </div>
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                    Round {round.roundNumber}
                </h3>
             </div>

             {/* Show Byes list only if we are NOT filtering, OR if we are filtering and it's not the Bye Round (which displays explicitly below) */}
             {(!selectedPlayerId && round.byes.length > 0) && (
                 <div className="flex items-center gap-2">
                     <span className="text-[10px] font-bold uppercase text-slate-400">Byes:</span>
                     <div className="flex gap-1">
                        {round.byes.map(bid => (
                            <span key={bid} className="text-xs font-medium text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">
                                {getPlayer(bid).name}
                            </span>
                        ))}
                     </div>
                 </div>
             )}
          </div>
          
          {/* Matches List */}
          <div className="flex flex-col">
            {(round as any).isByeRound ? (
                <div className="p-6 flex flex-col items-center justify-center text-slate-400 bg-amber-50/30">
                    <span className="text-lg font-bold text-amber-600 mb-1">BYE</span>
                    <span className="text-sm">No match this round</span>
                </div>
            ) : (
                round.matches.map((match, idx) => (
                    <MatchRow key={idx} match={match} />
                ))
            )}
          </div>
        </div>
      ))}

      {filteredRounds.length === 0 && selectedPlayerId && (
          <div className="text-center py-10 text-slate-400">
              No matches found for this player.
          </div>
      )}
    </div>
  );
};
