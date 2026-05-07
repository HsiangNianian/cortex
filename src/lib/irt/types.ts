export interface ResponseRecord {
  questionId: number;
  type: "logic" | "math" | "vocab";
  score: 0 | 1; // 1 = correct, 0 = incorrect/timedout
  difficulty: number;
  discrimination?: number;
  guessing?: number;
  responseTime?: number; // milliseconds
}

export interface ThetaEstimate {
  theta: number; // EAP point estimate
  standardError: number; // posterior SD
  responses: ResponseRecord[];
  priorMean: number;
  priorSd: number;
}

export interface AbilityProfile {
  overall: ThetaEstimate;
  byType: {
    logic: ThetaEstimate | null;
    math: ThetaEstimate | null;
    vocab: ThetaEstimate | null;
  };
  testDate: string; // ISO date
  questionsAnswered: number;
}
