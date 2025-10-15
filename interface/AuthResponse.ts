
import Player from './player';
export interface AuthResponse {
  success: boolean;
  player?: Player;
  token?: string;
  error?: string;
}
export default AuthResponse;