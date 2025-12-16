export interface PlayerInGame {
  playerId: string;           // Player MongoDB ID
  playerCode: string;         // Submitted test code
  score: number;
  coverageScore: number;
  mutationScore: number;
  redundancyPenalty: number;
  badgesEarned: string[];     // Array of Badge IDs
  feedback: string;
  gameDuration: number;       // in seconds
  submittedAt: string;        // ISO date string
}
