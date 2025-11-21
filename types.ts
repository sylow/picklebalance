export interface Player {
  id: string;
  name: string;
  dupr: number;
}

export interface Team {
  player1Id: string;
  player2Id: string;
}

export interface Match {
  courtNumber: number;
  team1: Team;
  team2: Team;
  explanation?: string; // Why this match was made (optional AI insight)
}

export interface Round {
  roundNumber: number;
  matches: Match[];
  byes: string[]; // Player IDs who sit out
}

export interface TournamentSchedule {
  rounds: Round[];
}

export interface GenerationConfig {
  courts: number;
  rounds: number;
}