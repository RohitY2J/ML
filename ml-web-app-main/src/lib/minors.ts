import type { Bar, TrendLine } from "./types";

// ---------- Shared helpers (local copies for minors) ----------
const EPS = 1e-9;

function percentChange(a: number, b: number) {
  return (b - a) / Math.max(EPS, a);
}

function findSwingIndices(arr: number[], leftRight: number): number[] {
  const out: number[] = [];
  for (let i = leftRight; i < arr.length - leftRight; i++) {
    let isMax = true, isMin = true;
    for (let k = 1; k <= leftRight; k++) {
      if (arr[i] < arr[i - k] || arr[i] < arr[i + k]) isMax = false;
      if (arr[i] > arr[i - k] || arr[i] > arr[i + k]) isMin = false;
      if (!isMax && !isMin) break;
    }
    if (isMax || isMin) out.push(i);
  }
  return out;
}

function fitLineOLS(x: number[], y: number[]) {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
  const sumXX = x.reduce((a, b) => a + b * b, 0);
  const denom = n * sumXX - sumX * sumX;
  if (Math.abs(denom) < EPS) return { slope: 0, intercept: sumY / Math.max(1, n) };
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

// ---------- Public types for minors ----------
export type MinorWalkOpts = {
  startISO: string;
  minHopPct?: number;   // default 0.0005 (0.05%)
  lookahead?: number;   // default 240
  swingOrder?: number;  // default 1 (very sensitive)
  maxAnchors?: number;  // default 12
  slopeFlatEps?: number; // default 1e-7 (sideways clamp)
};

// ---------- Core: ultra-lenient anchor walk (previous behavior) ----------
export function walkAnchorsForMinors(
  bars: Bar[],
  isResistance: boolean,
  opts: MinorWalkOpts
): { idx: number[]; px: number[] } | undefined {
  const {
    startISO,
    minHopPct = 0.0005,
    lookahead = 240,
    swingOrder = 1,
    maxAnchors = 12,
  } = opts;

  console.log(`[walkAnchorsForMinors] ${isResistance ? 'Resistance' : 'Support'} - bars: ${bars.length}, startISO: ${startISO}, minHopPct: ${minHopPct}`);

  if (bars.length < 50) {
    console.log(`[walkAnchorsForMinors] Not enough bars: ${bars.length} < 50`);
    return undefined;
  }

  // start index
  const startIndex = bars.findIndex(b => new Date(b.time) >= new Date(startISO));
  console.log(`[walkAnchorsForMinors] startIndex: ${startIndex}, first bar time: ${bars[0]?.time}, last bar time: ${bars[bars.length-1]?.time}`);
  
  if (startIndex === -1) {
    console.log(`[walkAnchorsForMinors] No start index found for ${startISO}`);
    return undefined;
  }

  const series = isResistance ? bars.map(b => b.high) : bars.map(b => b.low);

  // swings from start
  const swings = findSwingIndices(series, swingOrder).filter(i => i >= startIndex);
  console.log(`[walkAnchorsForMinors] Found ${swings.length} swings from index ${startIndex}, swingOrder: ${swingOrder}`);
  
  if (swings.length < 1) {
    console.log(`[walkAnchorsForMinors] No swings found`);
    return undefined;
  }

  // seed with first swing in window
  let cursor = swings[0];
  const anchors: number[] = [cursor];

  // forward walk: accept any meaningful hop (either direction)
  while (anchors.length < maxAnchors) {
    const end = Math.min(series.length - 1, cursor + lookahead);
    let nextIdx: number | null = null;

    for (const i of swings) {
      if (i <= cursor || i > end) continue;
      const prev = series[cursor];
      const cand = series[i];
      if (Math.abs(percentChange(prev, cand)) >= minHopPct) {
        nextIdx = i;
        break;
      }
    }
    if (nextIdx === null) break;
    anchors.push(nextIdx);
    cursor = nextIdx;
  }

  console.log(`[walkAnchorsForMinors] Final anchors: ${anchors.length}`);
  
  if (anchors.length < 2) {
    console.log(`[walkAnchorsForMinors] Not enough anchors: ${anchors.length} < 2`);
    return undefined;
  }

  const idx = Array.from(new Set(anchors)).sort((a, b) => a - b);
  const px = idx.map(i => series[i]);
  console.log(`[walkAnchorsForMinors] Returning ${idx.length} anchors`);
  return { idx, px };
}

// ---------- Public: compute minor trendline (OLS across anchors + sideways clamp) ----------
export function computeMinorTrendLine(
  bars: Bar[],
  isResistance: boolean,
  kind: TrendLine["kind"],
  opts: MinorWalkOpts
): TrendLine | undefined {
  console.log(`[computeMinorTrendLine] ${isResistance ? 'Resistance' : 'Support'} - kind: ${kind}`);
  
  const anchors = walkAnchorsForMinors(bars, isResistance, opts);
  if (!anchors || anchors.idx.length < 2) {
    console.log(`[computeMinorTrendLine] No valid anchors returned`);
    return undefined;
  }

  const { idx, px } = anchors;

  // OLS fit across anchors
  const { slope, intercept } = fitLineOLS(idx, px);

  // extend from startISO to latest
  const startIndex = bars.findIndex(b => new Date(b.time) >= new Date(opts.startISO));
  const t0 = startIndex >= 0 ? startIndex : 0;
  const t1 = bars.length - 1;

  let y0 = slope * t0 + intercept;
  let y1 = slope * t1 + intercept;

  // sideways clamp if nearly flat
  const slopeFlatEps = opts.slopeFlatEps ?? 1e-7;
  if (Math.abs(slope) < slopeFlatEps) {
    const mean = px.reduce((a, b) => a + b, 0) / px.length;
    y0 = y1 = mean;
  }

  return { kind, t0, t1, y0, y1 };
}
