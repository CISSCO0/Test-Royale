import { LoginCredentials } from './LoginCredentials';
import { RegisterCredentials } from './RegisterCredentials';
import { AuthResponse } from './AuthResponse';
import { Player } from './player';
export interface AuthContextType {
  player: Player | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>;

  // Legacy email verification methods
  startRegistration: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  verifyRegistration: (email: string, code: string) => Promise<AuthResponse>;

  logout: () => void;
  checkAuth: () => Promise<void>;
}

