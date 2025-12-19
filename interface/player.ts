interface Player {
  playerId:object;
  email: string;
  name: string;
  totalScore?: number;
  totalGamesPlayed?: number;
  winRate?: number;
  bestScore?: number;
  averageScore?: number; 
  bestStreak?: number;
  currentStreak?: number;
  achievements?: string[];
  badges?: string[];
  joinedAt: string;
  lastActiveAt?: string;
}

export default Player;
