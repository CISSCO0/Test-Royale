import { Player } from './Player';
import { LoginCredentials } from './LoginCredentials';
import { RegisterCredentials } from './RegisterCredentials';
import { AuthResponse } from './AuthResponse';

export interface AuthContextType {
  player: Player | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (credentials: LoginCredentials) => Promise<void>;

  startRegistration: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  verifyRegistration: (email: string, code: string) => Promise<AuthResponse>;

  logout: () => void;
  checkAuth: () => Promise<void>;
}

