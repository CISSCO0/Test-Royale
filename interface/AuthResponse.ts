
import { Player } from './Player';
export interface AuthResponse {
  success: boolean;
  message?: string;     
  error?: string;      
  player?: Player;    
  token?: string;      
}
