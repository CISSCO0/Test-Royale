import { PlayerInGame } from "./PlayerInGame";

export interface Game {
  _id: string;
  roomCode: string;
  hostId?: string;
  codeId: string;             // Reference to Code ID
  players: PlayerInGame[];
  gameState: 'waiting' | 'playing' | 'finished';
  startedAt: string;
  finishedAt?: string;
  winner?: string;            // Player ID
  totalDuration: number;      // in seconds
  createdAt: string;
  updatedAt: string;
}

export interface GameResponse {
    success: boolean;
    game: Game;
}
