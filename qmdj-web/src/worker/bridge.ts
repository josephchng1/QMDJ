// Typed message bridge to the engine worker. computeChart(input) -> Promise<Chart>.
// Same call signature a tRPC/server hook would expose, so swapping worker<->server
// later is a one-line change (spec §6.2).
import type { ChartInput, Chart } from '../engine/index.ts';
import type { WorkerRequest, WorkerResponse } from './engine.worker.ts';

let worker: Worker | null = null;
let seq = 0;
const pending = new Map<number, { resolve: (c: Chart) => void; reject: (e: Error) => void }>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./engine.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const { id, chart, error } = e.data;
      const p = pending.get(id);
      if (!p) return;
      pending.delete(id);
      if (error) p.reject(new Error(error));
      else p.resolve(chart!);
    };
  }
  return worker;
}

export function computeChart(input: ChartInput): Promise<Chart> {
  const w = getWorker();
  const id = ++seq;
  return new Promise<Chart>((resolve, reject) => {
    pending.set(id, { resolve, reject });
    w.postMessage({ id, input } satisfies WorkerRequest);
  });
}
