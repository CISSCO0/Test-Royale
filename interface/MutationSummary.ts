export interface MutationSummary {
  totalMutants: number;
  killed: number;
  survived: number;
  mutationScore: number;
}
export interface TestMetrics {
  totalTestLines: number;
  mutationReport?: {
    summary: MutationSummary;
    mutants: Array<{
      id: string;
      mutation: string;
      line: number;
      status: string;
      fileName: string;
    }>[];
  };
}