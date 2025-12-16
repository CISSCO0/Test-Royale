export interface PlayerCoverage {
  playerName: string;
  playerId: string;
  coverage: {
    coverageSummary: number;
    executionTime: number;
    lineCoverage: Array<{ line: number; covered: boolean; file?: string }>;
    testOutput: string;
  };
}