
import React, { useState } from 'react';
import { INITIAL_PLAYERS, INITIAL_CONFIG } from './constants';
import { Player, TournamentSchedule } from './types';
import { PlayerManager } from './components/PlayerManager';
import { ConfigPanel } from './components/ConfigPanel';
import { ScheduleDisplay } from './components/ScheduleDisplay';
import { StatsMatrix } from './components/StatsMatrix';
import { generateTournamentSchedule } from './services/geminiService';

function App() {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [courts, setCourts] = useState<number>(INITIAL_CONFIG.courts);
  const [rounds, setRounds] = useState<number>(INITIAL_CONFIG.rounds);
  const [schedule, setSchedule] = useState<TournamentSchedule | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'matches' | 'stats'>('matches');

  const handleGenerate = async () => {
    if (!process.env.API_KEY) {
       setError("API_KEY is missing. Please check your environment configuration.");
       return;
    }
    
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateTournamentSchedule(players, courts, rounds);
      setSchedule(result);
      setViewMode('matches'); // Switch to matches view on new generation
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An error occurred while generating the tournament.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Header - Fixed at top */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center shadow-emerald-200 shadow-lg text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            Pickle<span className="text-emerald-600">Balance</span>
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-4">
             <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">How it works</a>
             <div className="h-4 w-px bg-slate-300"></div>
             <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">AI Powered</span>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar: Config & Roster */}
        <aside className="w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
             
             {/* Configuration Section */}
             <section>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    Tournament Settings
                </h2>
                <ConfigPanel 
                    courts={courts} 
                    setCourts={setCourts} 
                    rounds={rounds} 
                    setRounds={setRounds}
                    onGenerate={handleGenerate}
                    isGenerating={isGenerating}
                    playerCount={players.length}
                />
             </section>

             <div className="h-px bg-slate-100 w-full"></div>

             {/* Roster Section */}
             <section>
                <PlayerManager 
                    players={players} 
                    setPlayers={setPlayers}
                    isGenerating={isGenerating} 
                />
             </section>
          </div>
        </aside>

        {/* Right Content: Schedule & Stats */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 lg:p-10 custom-scrollbar relative">
            
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3 shadow-sm animate-fade-in">
                    <svg className="h-5 w-5 text-red-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                        <h3 className="text-sm font-bold text-red-800">Generation Failed</h3>
                        <p className="text-sm text-red-600 mt-1">{error}</p>
                    </div>
                </div>
            )}

            {schedule && (
                <div className="flex items-center justify-between mb-8 sticky top-0 z-10 bg-slate-50/95 backdrop-blur py-2">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Tournament Results</h2>
                        <p className="text-sm text-slate-500">Generated for {schedule.rounds.length} rounds</p>
                    </div>
                    <div className="flex bg-white p-1 rounded-lg shadow-sm border border-slate-200">
                        <button
                            onClick={() => setViewMode('matches')}
                            className={`px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${
                                viewMode === 'matches' 
                                ? 'bg-slate-800 text-white shadow-md' 
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                            </svg>
                            Schedule
                        </button>
                        <button
                            onClick={() => setViewMode('stats')}
                            className={`px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${
                                viewMode === 'stats' 
                                ? 'bg-slate-800 text-white shadow-md' 
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                            </svg>
                            Fairness Analysis
                        </button>
                    </div>
                </div>
            )}
            
            {/* Content Area */}
            <div className="min-h-[500px]">
                {viewMode === 'matches' ? (
                    <ScheduleDisplay schedule={schedule} players={players} />
                ) : (
                    <StatsMatrix players={players} schedule={schedule} />
                )}
            </div>
        </main>
      </div>
    </div>
  );
}

export default App;
