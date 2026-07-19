# QMDJ Web — 奇门遁甲 frontend

React 19 + Vite + Tailwind 4 frontend for the `qimen-engine`. The engine runs
**entirely in the browser** inside a Web Worker — no server, no database, no
network. A chart is a pure function of (instant, method, options), per the
architecture blueprint §1.

## Run it with zero local install (StackBlitz)

1. Go to <https://stackblitz.com/> → **Create** → drag this `qmdj-web` folder in,
   or push it to GitHub and open `stackblitz.com/github/<you>/<repo>`.
2. StackBlitz runs `npm install` then `npm run dev` automatically (WebContainers —
   Node runs in your browser). The chart appears in the preview pane.

## Run it locally (if you ever install Node ≥ 18)

```bash
npm install
npm run dev
```

## What's wired up (first milestone)

- **ChartView**: date/time picker → engine (in a worker) → live 3×3 palace grid.
- **Method toggle** 置闰 / 拆补, **晚子时** and **勾陈/朱雀** options.
- **Summary header** (局/元/值符/值使/节气/符头) and **four-pillars bar** with 空亡/马星.
- **Hour nav** (← →) steps one 时辰; **此刻** jumps to now.
- **Deep links**: state is in the URL (`?dt=2026-07-19T10:30&m=zhirun`) — shareable.
- Dark + gold aesthetic; palace colours coded by 门/星/神 auspiciousness.

## Layout

```
src/
  engine/        ← copied VERBATIM from qimen-engine/src (do not hand-edit; re-copy on engine updates)
  worker/        ← engine.worker.ts + typed bridge (computeChart → Promise<Chart>)
  hooks/         ← useChart
  components/    ← Controls, SummaryHeader, PalaceGrid, PalaceCell, FourPillarsBar
  qmdata.ts      ← minimal colour/quality metadata (seed of the spec §5 registry — NOT authoritative scoring)
  App.tsx        ← state, URL sync, layout
```

## Not yet built (later phases per blueprint)

CalendarPage / MonthGrid, DayDetailPanel, SearchPage (+.ics export), ReferencePage,
the full declarative 格局 registry + scoring, and the optional tRPC/MySQL layer for
saved charts. The engine already exposes every field these need.

## Keeping the engine in sync

The `src/engine/` folder is a verbatim copy of `qimen-engine/src/`. If the engine
changes, re-copy it (`cp ../src/*.ts src/engine/`) rather than editing in place —
its correctness is guaranteed by the engine's own 3088-check test suite.
