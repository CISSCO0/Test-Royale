export interface RunResponse {
  stdout: string;
  stderr: string;
  projectDir: string;
  playerTestsDir: string;
  executionTime: number;
}
