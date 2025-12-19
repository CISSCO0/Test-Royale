
import { Player } from './player';
export interface AuthResponse {
  success: boolean;
  message?: string;     
  error?: string;      
  player?: Player;    
  token?: string;      
}
