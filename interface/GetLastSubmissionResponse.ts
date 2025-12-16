export interface Submission {
    playerId: string;
    code: string;
    submittedAt: string; 
    gameDuration: number;
}

export interface GetLastSubmissionResponse {
  success: boolean;
  submission: Submission;
}
