// Web Worker: runs the pure engine off the main thread (spec §3).
// The chart is a deterministic function of (instant, method, options), so this
// worker holds no state beyond an optional memo of recent boards.
import { buildChart, type ChartInput, type Chart } from '../engine/index.ts';

export type WorkerRequest = { id: number; input: ChartInput };
export type WorkerResponse = { id: number; chart?: Chart; error?: string };

const ctx = self as unknown as Worker;

ctx.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { id, input } = e.data;
  try {
    const chart = buildChart(input);
    ctx.postMessage({ id, chart } satisfies WorkerResponse);
  } catch (err) {
    ctx.postMessage({ id, error: err instanceof Error ? err.message : String(err) } satisfies WorkerResponse);
  }
};
