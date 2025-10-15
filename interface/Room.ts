export interface PlayerInRoom {
  id: string;           
  name: string;
  score?: number;
  isReady?: boolean;
  isHost?: boolean;
}

export interface Room {
  _id: string;
  code: string;
  hostId: string;
  maxPlayers: number;
  players: PlayerInRoom[];
  gameState: 'waiting' | 'playing' | 'finished';
  gameData: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
