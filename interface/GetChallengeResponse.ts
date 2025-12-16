
export interface Challenge {
  id: string;
  title: string;
  description: string;
  baseCode: string;
  testTemplate: string;
  createdAt: string; // ISO date string
}

export interface GetChallengeResponse {
  success: boolean;
  challenge: Challenge;
}
