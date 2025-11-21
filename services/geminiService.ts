import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Player, TournamentSchedule, Match, Round } from "../types";

// Define the compact response type expected from Gemini
interface CompactSchedule {
  rawRounds: string[][][]; // [Round][Match][PlayerIDs]
}

export const generateTournamentSchedule = async (
  players: Player[],
  numCourts: number,
  numRounds: number
): Promise<TournamentSchedule> => {
  
  // Use the Flash model which is faster, but enable thinking for logic
  const modelName = "gemini-2.5-flash";
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 1. Create a simplified roster map for the prompt to save input tokens and clarity
  const rosterSummary = players.map(p => `${p.id}: ${p.dupr.toFixed(2)}`).join('\n');

  const prompt = `
    Act as an expert Tournament Director. Generate a highly balanced Round Robin Doubles schedule.
    
    **Configuration:**
    - Total Players: ${players.length}
    - Courts: ${numCourts}
    - Rounds: ${numRounds}
    
    **Roster (ID: DUPR):**
    ${rosterSummary}

    **Strict Constraints (Order of Importance):**
    1. **NO REPEAT PARTNERS**: Two players should NEVER be partners more than once. This is the most critical rule. Check your work.
    2. **MINIMIZE REPEAT OPPONENTS**: Two players should not play against each other more than twice.
    3. **COURT CAPACITY**: Exactly ${numCourts} matches per round. (4 players per match).
    4. **DUPR BALANCE**: Total DUPR of Team 1 ≈ Total DUPR of Team 2.
    5. **BYE DISTRIBUTION**: Ensure "Byes" (sitting out) are distributed evenly across players.

    **Strategy:**
    - Track the history of pairings as you generate rounds.
    - If a player has already partnered with X, they cannot partner with X again.
    - Shuffle players significantly between rounds.

    **Output Format:**
    Return a compact JSON object containing a 3D array called 'rawRounds'.
    - Dimension 1: Rounds
    - Dimension 2: Matches in that round
    - Dimension 3: Array of exactly 4 Player IDs for that match [Team1_P1, Team1_P2, Team2_P1, Team2_P2].
    
    Do NOT include explanations, byes, or court numbers in the JSON.
  `;

  // 2. Use a highly compact schema to reduce output token generation time
  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      rawRounds: {
        type: Type.ARRAY,
        description: "List of rounds, where each round is a list of matches.",
        items: {
          type: Type.ARRAY,
          description: "List of matches in this round.",
          items: {
            type: Type.ARRAY,
            description: "A single match consisting of exactly 4 player IDs: [T1P1, T1P2, T2P1, T2P2]. Ensure P1!=P2 and P3!=P4.",
            items: { type: Type.STRING }
          }
        }
      }
    }
  };

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      // Enable a moderate thinking budget to solve the "Duplicate Partner" CSP problem
      // 2048 is enough for Flash to plan better without being "super slow"
      thinkingConfig: { thinkingBudget: 2048 } 
    }
  });

  if (!response.text) {
    throw new Error("No response from AI");
  }

  let compactData: CompactSchedule;
  try {
    compactData = JSON.parse(response.text) as CompactSchedule;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("AI generated invalid JSON");
  }

  // 3. Post-process: Reconstruct the full TournamentSchedule object on the client
  const processedRounds: Round[] = compactData.rawRounds.map((roundMatches, roundIndex) => {
    
    // Determine who is playing in this round
    const playingPlayerIds = new Set<string>();
    
    const matches: Match[] = roundMatches.map((matchIds, matchIndex) => {
      const [p1Id, p2Id, p3Id, p4Id] = matchIds;
      
      if (p1Id) playingPlayerIds.add(p1Id);
      if (p2Id) playingPlayerIds.add(p2Id);
      if (p3Id) playingPlayerIds.add(p3Id);
      if (p4Id) playingPlayerIds.add(p4Id);

      // Calculate explanation locally
      const p1 = players.find(p => p.id === p1Id);
      const p2 = players.find(p => p.id === p2Id);
      const p3 = players.find(p => p.id === p3Id);
      const p4 = players.find(p => p.id === p4Id);
      
      let explanation = "";
      if (p1 && p2 && p3 && p4) {
        const t1Sum = p1.dupr + p2.dupr;
        const t2Sum = p3.dupr + p4.dupr;
        explanation = `Diff: ${Math.abs(t1Sum - t2Sum).toFixed(2)}`;
      }

      return {
        courtNumber: matchIndex + 1,
        team1: { player1Id: p1Id || '?', player2Id: p2Id || '?' },
        team2: { player1Id: p3Id || '?', player2Id: p4Id || '?' },
        explanation: explanation
      };
    });

    // Calculate Byes locally
    const byes = players
      .filter(p => !playingPlayerIds.has(p.id))
      .map(p => p.id);

    return {
      roundNumber: roundIndex + 1,
      matches,
      byes
    };
  });

  return { rounds: processedRounds };
};