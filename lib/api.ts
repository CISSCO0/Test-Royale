// API service layer for backend communication
import { AuthResponse } from "@/interface/AuthResponse";
import { Player } from '@/interface/player';
import { Cookie } from "next/font/google";
import { LoginCredentials } from "@/interface/LoginCredentials";
import { RegisterCredentials } from "@/interface/RegisterCredentials";
import Cookies from 'js-cookie';

import { GetLastSubmissionResponse } from "@/interface/GetLastSubmissionResponse";
import { GameResponse } from "@/interface/GetGameResponse";
import { GetChallengeResponse } from "@/interface/GetChallengeResponse";
import { RunResponse } from "@/interface/RunResponse";
import { CoverageReport } from "@/interface/GenerateCoverageResponse";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

class ApiService {

  private baseURL: string;
  private readonly AUTH_COOKIE = 'auth_token';
  private readonly USER_COOKIE = 'user_data';
  private readonly COOKIE_OPTIONS:any = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: 7 
  };

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get token and add to headers
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      credentials: 'include', // Important for cookies
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return Cookies.get(this.AUTH_COOKIE) || null;
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    Cookies.set(this.AUTH_COOKIE, token, this.COOKIE_OPTIONS);
  }

  private removeToken(): void {
    if (typeof window === 'undefined') return;
    Cookies.remove(this.AUTH_COOKIE);
  }

  private setUserData(player: Player): void {
    if (typeof window === 'undefined') return;
    Cookies.set(this.USER_COOKIE, JSON.stringify(player), this.COOKIE_OPTIONS);
  }

  private removeUserData(): void {
    if (typeof window === 'undefined') return;
    Cookies.remove(this.USER_COOKIE);
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      // Only set cookies if login was successful
      if (response.success) {
        if (response.token) {
          this.setToken(response.token);
        }
        if (response.player) {
          this.setUserData(response.player);
        }
      }

      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // Direct registration without email verification
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      // Set cookies if registration was successful
      if (response.success) {
        if (response.token) {
          this.setToken(response.token);
        }
        if (response.player) {
          this.setUserData(response.player);
        }
      }

      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  // Legacy email verification methods (kept for backward compatibility)
  async startRegistration(credentials: RegisterCredentials): Promise<any> {
  try {
    const response = await this.request<any>('/auth/start-registration', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    return response; // { success: true, message: "Verification code sent" }
  } catch (err) {
    throw err;
  }
}

async verifyRegistration(email: string, code: string): Promise<AuthResponse> {
  try {
    const response = await this.request<AuthResponse>('/auth/verify-registration', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });

    if (response.success && response.player) {
      this.setUserData(response.player);
    }

    return response;

  } catch (err) {
    throw err;
  }
}


  async getProfile(): Promise<Player> {
    try {
      const response = await this.request<{success: boolean, player: Player}>('/auth/profile');
      if (response.success && response.player) {
        this.setUserData(response.player);
        return response.player;
      }
      throw new Error('Failed to get profile');
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        this.removeToken();
        this.removeUserData();
      }
      throw error;
    }
  }


  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
    this.removeToken();
    this.removeUserData();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Initialize auth state from cookies
  initializeAuth(): Player | null {
    const userData = Cookies.get(this.USER_COOKIE);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  }

  //game API
  /** Get game by ID */
  async getGame(gameId:string): Promise<GameResponse> {
    return await this.request(`/game/${gameId}`, { method: "GET" });
  }

  /** Get room by code */
  async getRoom(roomCode: string): Promise<any> {
    return await this.request(`/room/${roomCode}`, { method: "GET" });
  }

  
  async getPlayer(id:any): Promise<any> {
    return await this.request(`/auth/getPlayer/${id}`, { method: "GET" });
  }

  /** Submit test code for a game */
  async submitTestCode(gameId: string , playerId:object, testCode: string ) {
    return await this.request("/game/submitTestCode", {
      method: "POST",
      body: JSON.stringify({ gameId, playerId, testCode }),
    }
  )
  }

  /**Get Last Submission  */
  async getLastSubmission(playerId:string, gameId: string): Promise<GetLastSubmissionResponse> {
    return await this.request(`/game/${playerId}/${gameId}/lastSubmission`, {
      method: "GET",
    });
  }

  //code API
  /** Get a specific coding challenge */
  async getChallenge(id: string): Promise<GetChallengeResponse> {
    console.log("api service "+ id);
    return await this.request(`/code/${id}`, { method: 'GET' });
  }

  /** run code  */
  async compileAndRunCSharpCode (code: string, tests: string ,playerId:object): Promise<RunResponse> {
  return await this.request("/code/compileAndRunCSharpCode", {
    method: "POST",
    body: JSON.stringify({ code, tests,playerId }),
  });
  
  }

  /** generate coverage report */
  async generateCoverageReport(playerTestDir:string,code: string): Promise<CoverageReport> {
    return await this.request("/code/generateCoverageReport", {
      method: "POST",
      body: JSON.stringify({playerTestDir, code }),
    });
  }

async calculateTestLines(code: string) {
  return await this.request("/code/calculateTestLines", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

/** generate mutation testing report */
async generateMutationReport(playerTestsDir: string, projectDir:string): Promise<any> {
  return await this.request("/code/generateMutationReport", {
    method: "POST",
    body: JSON.stringify({ playerTestsDir, projectDir }),
  });
}

async calculatePlayerData(playerId: object, gameId: string): Promise<any> {
  return await this.request("/game/calculate-player-data", {
    method: "POST",
    body: JSON.stringify({ playerId, gameId }),
  });
}
async endGame(gameId: string): Promise<any> {
  return await this.request(`/game/end/${gameId}`, {
    method: "POST",
  });
}
async getGameResults(gameId: string): Promise<any> {
  return await this.request(`/game/results/${gameId}`, {
    method: "GET",
  });
}

}


export const apiService = new ApiService();