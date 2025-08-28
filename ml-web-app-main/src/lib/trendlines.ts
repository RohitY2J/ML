import { Bar, TrendLine, TrendPack } from './types';

// ===== integrate in your pack builder =====
export function computeTrendPack(
  bars: Bar[],
  minorStartISO = "2024-01-01"
): TrendPack {
  if (bars.length < 50) return { major: {}, minor: {} };

  // Majors removed - keeping only minors for now
  const majorResistance = undefined;
  const majorSupport = undefined;

  // ===== MINORS (new improved logic: seed by extreme, pick best in lookahead) =====
  const minorResistance = computeMinorTrendLine(
    bars, true, "minor-resistance",
    { startISO: minorStartISO, minHopPct: 0.0005, lookahead: 240, swingOrder: 1, maxAnchors: 12, slopeFlatEps: 1e-7 }
  );
  const minorSupport = computeMinorTrendLine(
    bars, false, "minor-support",
    { startISO: minorStartISO, minHopPct: 0.0005, lookahead: 240, swingOrder: 1, maxAnchors: 12, slopeFlatEps: 1e-7 }
  );

  return { major: { resistance: majorResistance, support: majorSupport },
           minor: { resistance: minorResistance, support: minorSupport } };
}


// ---- MINOR TRENDLINES: exact behavior you liked (seed by extreme, pick best in lookahead) ----
type MinorOpts = {
  startISO: string;
  minHopPct?: number;    // default 0.0005
  lookahead?: number;    // default 240
  swingOrder?: number;   // default 1
  maxAnchors?: number;   // default 12
  slopeFlatEps?: number; // default 1e-7
};

function minor_findSwingIndices(arr: number[], leftRight: number): number[] {
  const out: number[] = [];
  for (let i = leftRight; i < arr.length - leftRight; i++) {
    let isMax = true, isMin = true;
    for (let k = 1; k <= leftRight; k++) {
      if (arr[i] < arr[i-k] || arr[i] < arr[i+k]) isMax = false;
      if (arr[i] > arr[i-k] || arr[i] > arr[i+k]) isMin = false;
      if (!isMax && !isMin) break;
    }
    if (isMax || isMin) out.push(i);
  }
  return out;
}

function minor_percentChange(a:number,b:number){ return (b-a)/Math.max(1e-9, a); }

function minor_fitOLS(x: number[], y: number[]) {
  const n = x.length;
  const sx = x.reduce((a,b)=>a+b,0), sy = y.reduce((a,b)=>a+b,0);
  const sxy = x.reduce((a,b,i)=>a + b*y[i],0), sxx = x.reduce((a,b)=>a + b*b,0);
  const d = n*sxx - sx*sx;
  if (Math.abs(d) < 1e-9) return { slope: 0, intercept: sy/Math.max(1,n) };
  const slope = (n*sxy - sx*sy)/d;
  const intercept = (sy - slope*sx)/n;
  return { slope, intercept };
}

function minor_walkAnchors(
  bars: Bar[],
  isResistance: boolean,
  opts: MinorOpts
): { idx: number[]; px: number[] } | undefined {
  const {
    startISO,
    minHopPct = 0.0005,
    lookahead = 240,
    swingOrder = 1,
    maxAnchors = 12,
  } = opts;

  if (bars.length < 50) return undefined;

  // start index
  const startIdx = bars.findIndex(b => new Date(b.time) >= new Date(startISO));
  if (startIdx === -1) return undefined;

  const highs = bars.map(b => b.high);
  const lows  = bars.map(b => b.low);
  const series = isResistance ? highs : lows;

  // swings from start
  const swings = minor_findSwingIndices(series, swingOrder).filter(i => i >= startIdx);
  if (swings.length === 0) return undefined;

  // seed = EXTREME in the early window (this is the original behavior)
  const windowEnd = Math.min(bars.length - 1, startIdx + Math.max(30, swingOrder * 3));
  let anchorI = swings
    .filter(i => i <= windowEnd)
    .sort((a, b) => isResistance ? series[b] - series[a] : series[a] - series[b])[0];
  if (anchorI === undefined) anchorI = swings[0];

  const anchors: number[] = [anchorI];

  // walk forward: choose the BEST candidate in lookahead (max high / min low) that clears minHop
  let cursor = anchorI;
  while (anchors.length < maxAnchors) {
    const end = Math.min(bars.length - 1, cursor + lookahead);
    let best: number | null = null;
    let bestVal = isResistance ? -Infinity : Infinity;

    for (const i of swings) {
      if (i <= cursor || i > end) continue;
      const prev = series[cursor], cand = series[i];
      const pct = Math.abs(minor_percentChange(prev, cand));
      if (pct < minHopPct) continue;

      if (isResistance) {
        if (cand > bestVal) { bestVal = cand; best = i; }
      } else {
        if (cand < bestVal) { bestVal = cand; best = i; }
      }
    }

    if (best == null) break;
    anchors.push(best);
    cursor = best;
  }

  if (anchors.length < 2) return undefined;

  const idx = Array.from(new Set(anchors)).sort((a,b)=>a-b);
  const px  = idx.map(i => series[i]);
  return { idx, px };
}

export function computeMinorTrendLine(
  bars: Bar[],
  isResistance: boolean,
  kind: TrendLine["kind"],
  opts: MinorOpts
): TrendLine | undefined {
  const a = minor_walkAnchors(bars, isResistance, opts);
  if (!a || a.idx.length < 2) return undefined;

  // OLS across all anchors (original)
  const { slope, intercept } = minor_fitOLS(a.idx, a.px);

  // extend from startISO to latest bar
  const startIdx = bars.findIndex(b => new Date(b.time) >= new Date(opts.startISO));
  const t0 = startIdx >= 0 ? startIdx : 0;
  const t1 = bars.length - 1;

  let y0 = slope * t0 + intercept;
  let y1 = slope * t1 + intercept;

  // sideways clamp
  const slopeFlatEps = opts.slopeFlatEps ?? 1e-7;
  if (Math.abs(slope) < slopeFlatEps) {
    const mean = a.px.reduce((p,c)=>p+c,0) / a.px.length;
    y0 = y1 = mean;
  }

  return { kind, t0, t1, y0, y1 };
}

export function convertToBars(trendline: TrendLine | undefined): any[] {
  if (!trendline) return [];
  
  return [{
    time: trendline.t0,
    value: trendline.y0
  }, {
    time: trendline.t1,
    value: trendline.y1
  }];
}
