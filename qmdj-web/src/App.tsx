import { useEffect, useMemo, useState } from 'react';
import type { ChartInput } from './types.ts';
import { useChart } from './hooks/useChart.ts';
import { Controls } from './components/Controls.tsx';
import { SummaryHeader } from './components/SummaryHeader.tsx';
import { PalaceGrid } from './components/PalaceGrid.tsx';
import { FourPillarsBar } from './components/FourPillarsBar.tsx';

type Method = 'zhirun' | 'chaibu';
interface UiState {
  y: number; m: number; d: number; hh: number; mm: number;
  method: Method; spiritVariant: boolean; lateZiNextDay: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');
const toLocal = (s: UiState) => `${s.y}-${pad(s.m)}-${pad(s.d)}T${pad(s.hh)}:${pad(s.mm)}`;

function fromLocal(v: string, base: UiState): UiState {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(v);
  if (!m) return base;
  return { ...base, y: +m[1], m: +m[2], d: +m[3], hh: +m[4], mm: +m[5] };
}

function initialState(): UiState {
  const p = new URLSearchParams(location.search);
  const now = new Date();
  const base: UiState = {
    y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate(),
    hh: now.getHours(), mm: now.getMinutes(),
    method: 'zhirun', spiritVariant: false, lateZiNextDay: true,
  };
  const dt = p.get('dt');
  const s = dt ? fromLocal(dt, base) : base;
  return {
    ...s,
    method: p.get('m') === 'chaibu' ? 'chaibu' : s.method,
    spiritVariant: p.get('sv') === '1' ? true : s.spiritVariant,
    lateZiNextDay: p.get('lz') === '0' ? false : s.lateZiNextDay,
  };
}

export default function App() {
  const [ui, setUi] = useState<UiState>(initialState);

  // deep-link sync (spec §6.2): navigation state lives in the URL
  useEffect(() => {
    const p = new URLSearchParams();
    p.set('dt', toLocal(ui));
    p.set('m', ui.method);
    if (ui.spiritVariant) p.set('sv', '1');
    if (!ui.lateZiNextDay) p.set('lz', '0');
    history.replaceState(null, '', `?${p.toString()}`);
  }, [ui]);

  const input: ChartInput = useMemo(() => ({
    y: ui.y, m: ui.m, d: ui.d, hh: ui.hh, mm: ui.mm,
    method: ui.method, spiritVariant: ui.spiritVariant, lateZiNextDay: ui.lateZiNextDay,
  }), [ui]);

  const { chart, error, loading } = useChart(input);

  const shiftHours = (delta: number) => setUi((s) => {
    const dt = new Date(s.y, s.m - 1, s.d, s.hh, s.mm);
    dt.setHours(dt.getHours() + delta);
    return { ...s, y: dt.getFullYear(), m: dt.getMonth() + 1, d: dt.getDate(),
             hh: dt.getHours(), mm: dt.getMinutes() };
  });
  const now = () => setUi((s) => {
    const d = new Date();
    return { ...s, y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate(),
             hh: d.getHours(), mm: d.getMinutes() };
  });

  return (
    <div className="min-h-full max-w-6xl mx-auto px-4 py-6">
      <header className="flex items-baseline gap-3 mb-5">
        <h1 className="text-xl font-semibold gold tracking-widest">奇門遁甲</h1>
        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>Qimen Dunjia · 时家转盘</span>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-start">
        <div className="flex flex-col gap-4">
          <Controls
            dtLocal={toLocal(ui)}
            onDt={(v) => setUi((s) => fromLocal(v, s))}
            method={ui.method}
            onMethod={(m) => setUi((s) => ({ ...s, method: m }))}
            spiritVariant={ui.spiritVariant}
            onSpiritVariant={(b) => setUi((s) => ({ ...s, spiritVariant: b }))}
            lateZi={ui.lateZiNextDay}
            onLateZi={(b) => setUi((s) => ({ ...s, lateZiNextDay: b }))}
            onShiftHours={shiftHours}
            onNow={now}
          />
          {chart && <SummaryHeader chart={chart} />}
          {chart && <FourPillarsBar chart={chart} />}
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
            置闰法为传统经典定局；拆补法与多数万年历一致，二者在超神/接气窗口会分歧。
            颜色仅为吉凶粗标（门/星/神），非专业格局评分。
          </p>
        </div>

        <div className="relative">
          {error && <div className="panel p-4" style={{ color: 'var(--q-bad)' }}>计算出错：{error}</div>}
          {!error && chart && <PalaceGrid board={chart.board} />}
          {loading && !chart && <div className="panel p-8 text-center" style={{ color: 'var(--text-dim)' }}>计算中…</div>}
        </div>
      </div>
    </div>
  );
}
