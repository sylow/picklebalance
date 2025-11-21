
import React, { useState } from 'react';
import { Player } from '../types';

interface PlayerManagerProps {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  isGenerating: boolean;
}

export const PlayerManager: React.FC<PlayerManagerProps> = ({ players, setPlayers, isGenerating }) => {
  const [newName, setNewName] = useState('');
  const [newDupr, setNewDupr] = useState('');

  const handleAddPlayer = () => {
    if (!newName || !newDupr) return;
    const player: Player = {
      id: `p${Date.now()}`,
      name: newName,
      dupr: parseFloat(newDupr),
    };
    setPlayers([...players, player]);
    setNewName('');
    setNewDupr('');
  };

  const handleDeletePlayer = (id: string) => {
    setPlayers(players.filter((p) => p.id !== id));
  };

  const handleUpdateDupr = (id: string, val: string) => {
      const numVal = parseFloat(val);
      if(isNaN(numVal)) return;
      
      setPlayers(players.map(p => p.id === id ? {...p, dupr: numVal} : p));
  }

  // Helper to get badge color
  const getDuprColor = (dupr: number) => {
      if (dupr >= 4.5) return 'bg-gradient-to-br from-rose-500 to-red-600 shadow-red-200';
      if (dupr >= 4.0) return 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-200';
      if (dupr >= 3.5) return 'bg-gradient-to-br from-blue-400 to-indigo-500 shadow-blue-200';
      return 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-green-200';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            Roster ({players.length})
        </h2>
      </div>

      {/* Add Player - Compact Form */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4 shadow-inner">
        <div className="flex gap-2 mb-2">
            <input
            type="text"
            placeholder="Name"
            className="flex-1 min-w-0 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={isGenerating}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
            />
            <input
            type="number"
            placeholder="DUPR"
            step="0.1"
            className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-center"
            value={newDupr}
            onChange={(e) => setNewDupr(e.target.value)}
            disabled={isGenerating}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
            />
        </div>
        <button
          onClick={handleAddPlayer}
          disabled={!newName || !newDupr || isGenerating}
          className="w-full bg-white hover:bg-indigo-50 text-indigo-600 border border-dashed border-indigo-300 hover:border-indigo-400 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Add Player
        </button>
      </div>

      {/* Player List */}
      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className="group flex items-center justify-between p-2.5 rounded-lg border border-transparent hover:bg-slate-50 hover:border-slate-200 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${getDuprColor(player.dupr)}`}>
                {player.dupr.toFixed(1)}
              </div>
              <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-slate-700 truncate group-hover:text-slate-900 transition-colors">{player.name}</span>
                  <span className="text-[10px] text-slate-400">ID: {player.id}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                {/* Quick Edit DUPR */}
                 <input 
                    type="number" 
                    step="0.01"
                    className="w-12 text-right text-xs border border-transparent hover:border-slate-300 rounded bg-transparent focus:bg-white py-1 outline-none font-mono text-slate-600"
                    value={player.dupr}
                    onChange={(e) => handleUpdateDupr(player.id, e.target.value)}
                    disabled={isGenerating}
                    title="Edit DUPR"
                 />

                <button
                    onClick={() => handleDeletePlayer(player.id)}
                    disabled={isGenerating}
                    className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 transition-colors"
                    title="Remove Player"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
          </div>
        ))}
        
        {players.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No players added.
            </div>
        )}
      </div>
    </div>
  );
};
