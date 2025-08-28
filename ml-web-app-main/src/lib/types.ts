export type Bar = {
  time: string;        // "YYYY-MM-DD" (or ISO)
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

export type TrendLine = {
  kind: "support" | "resistance" | "minor-support" | "minor-resistance";
  t0: number;  // index into bars[]
  t1: number;  // index into bars[]
  y0: number;
  y1: number;
};

export type TrendPack = {
  major: { support?: TrendLine; resistance?: TrendLine };
  minor: { support?: TrendLine; resistance?: TrendLine };
};
