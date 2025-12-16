export interface PlayerInRoom {
  playerId: Object;
  isHost?: boolean;
  score?: number;
  joinedAt: string;

}


export interface Room {
  _id: string;
  code: string;
  hostId: string;
  isPrivate:boolean; 
  maxPlayers: number;
  players: PlayerInRoom[];
  gameState: 'waiting' | 'playing' | 'finished';
  gameData: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
