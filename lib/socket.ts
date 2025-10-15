import { io, Socket } from 'socket.io-client';
import { Room } from '@/interface/Room';


class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

connect(token: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (this.socket?.connected) {
      resolve();
      return;
    }

    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token },
      transports: ['websocket'],
      path: '/socket.io',
      withCredentials: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
      resolve();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      reject(error);
    });
  });
}


  // Room methods
  async createRoom(data: { 
    playerName: string; 
    maxPlayers?: number;
    isPrivate?: boolean;
  }): Promise<any> {
    if (!this.socket?.connected) throw new Error('Socket not connected');
    
    return new Promise((resolve, reject) => {
      this.socket!.emit('create_room', data, (response: any) => {
        if (response.error) reject(response.error);
        else resolve(response);
      });
    });
  }

    // socketService.ts

async getPlayerRoomInfo(): Promise<any> {
  if (!this.socket?.connected) throw new Error("Socket not connected");

  return new Promise((resolve) => {
    this.socket!.emit("get_player_room_info", (response: any) => {
     console.log("from socket "+ response.room.players);
      resolve(response);
    });
  });
}

async getRoomInfo(): Promise<any> {
  if (!this.socket?.connected) throw new Error("Socket not connected");

  return new Promise((resolve) => {
    this.socket!.emit("get_room_info", (response: any) => {
      resolve(response);
    });
  });
}

  async joinRoom(roomCode: string): Promise<any> {
    if (!this.socket?.connected) throw new Error('Socket not connected');
    
    return new Promise((resolve, reject) => {
      this.socket!.emit('join_room', { roomCode }, (response: any) => {
        if (response.error) reject(response.error);
        else resolve(response);
      });
    });
  }



  leaveRoom() {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject('No socket connection');
      this.socket.emit('leave_room', (response: any) => {
        if (response.success) resolve(response);
        else reject(response.error);
      });
    });
  }

  // Event listeners
  onPlayerJoined(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('player_joined', callback);
  }

  onPlayerLeft(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('player_left', callback);
  }

  onGameStarted(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('game_started', callback);
  }

  onRoomCreated(callback: (room: Room) => void) {
    if (!this.socket) return;
    this.socket.on('room_created', callback);
  }

  onRoomUpdated(callback: (room: Room) => void) {
    if (!this.socket) return;
    this.socket.on('room_updated', callback);
  }

  onRoomDeleted(callback: (roomCode: string) => void) {
    if (!this.socket) return;
    this.socket.on('room_deleted', callback);
  }

  getSocket() {
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = SocketService.getInstance();