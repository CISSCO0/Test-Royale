import { io, Socket } from 'socket.io-client';
import { Room } from '@/interface/Room';
import Cookies from 'js-cookie';

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

  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        this.socket.emit('reconnect_player');
        resolve();
        return;
      }

      // Get token from parameter or cookies
      const authToken = token || Cookies.get('auth_token');
      if (!authToken) {
        reject(new Error('No authentication token available'));
        return;
      }

      this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
        auth: { token: authToken },
        transports: ['websocket'],
        path: '/socket.io',
        withCredentials: true,
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to socket server');
        this.socket!.emit('reconnect_player');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message);
        reject(new Error(error.message || 'Socket connection failed'));
      });
    });
  }

  // ============ ROOM METHODS ============
  async createRoom(data: { 
    playerName: string; 
    maxPlayers?: number;
  }): Promise<any> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    
    return new Promise((resolve, reject) => {
      this.socket!.emit('create_room', data, (response: any) => {
        console.log('create_room response:', response);
        
        // ✅ Check response.success first
        if (response.success) {
          resolve(response);
        } else if (response.error) {
          // ✅ Throw proper error with message
          reject(new Error(response.error));
        } else {
          reject(new Error('Failed to create room'));
        }
      });
    });
  }

  async getPlayerRoomInfo(): Promise<any> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('get_player_room_info', (response: any) => {
        console.log('get_player_room_info response:', response);
        
        if (response.success) {
          resolve(response);
        } else if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  async getRoomInfo(): Promise<any> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('get_room_info', (response: any) => {
        console.log('get_room_info response:', response);
        
        if (response.success) {
          resolve(response);
        } else if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  async joinRoom(roomCode: string): Promise<any> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    
    return new Promise((resolve, reject) => {
      this.socket!.emit('join_room', { roomCode }, (response: any) => {
        console.log('join_room response:', response);
        
        // ✅ Check response.success first
        if (response.success) {
          resolve(response);
        } else if (response.error) {
          // ✅ Throw proper error with message
          reject(new Error(response.error));
        } else {
          reject(new Error('Failed to join room'));
        }
      });
    });
  }

  async setPlayerReady(isReady: boolean): Promise<any> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('set_ready', { isReady }, (response: any) => {
        console.log('set_ready response:', response);
        
        if (response.success) {
          resolve(response);
        } else if (response.error) {
          reject(new Error(response.error));
        } else {
          reject(new Error('Failed to set ready status'));
        }
      });
    });
  }

  async leaveRoom(): Promise<any> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('leave_room', (response: any) => {
        console.log('leave_room response:', response);
        
        if (response.success) {
          resolve(response);
        } else if (response.error) {
          reject(new Error(response.error));
        } else {
          reject(new Error('Failed to leave room'));
        }
      });
    });
  }

  // ============ GAME METHODS ============
  async startGame(): Promise<any> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('start_game', (response: any) => {
        console.log('start_game response:', response);
        
        if (response.success) {
          resolve(response);
        } else if (response.error) {
          reject(new Error(response.error));
        } else {
          reject(new Error('Failed to start game'));
        }
      });
    });
  }

  // ============ EVENT LISTENERS ============
  onPlayerJoined(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('player_joined', callback);
  }

  onPlayerReadyChanged(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('player_ready_changed', callback);
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