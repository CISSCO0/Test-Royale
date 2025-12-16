export interface LineCoverage {
  line: number;
  covered: boolean;
  file: string;
}

export interface CoverageReport {
  lineCoverage: LineCoverage[];
  coverageSummary: string; // e.g. "96.1"
  lineRate: number;
  branchRate: number;
}

