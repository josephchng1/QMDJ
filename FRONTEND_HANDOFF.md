# QMDJ Engine — Frontend Integration Guide

Hand this file (plus the `qimen-engine` folder) to any chat/session building the frontend. It explains what the engine does, its full public API, and what a UI needs to render.

## What this is

`qimen-engine` is a self-contained TypeScript library (zero runtime dependencies) that computes a full 时家奇门遁甲 (QMDJ) chart for a given date/time: four pillars (四柱), the 局数 (via 置闰法 or 拆补法), and the complete 转盘 nine-palace board (九星/八门/八神/天盘·地盘干/值符·值使/空亡/马星).

It is a **pure computation engine, no UI**. The frontend's job is to call `buildChart(...)` and render the returned object — typically as a 3×3 palace grid plus a summary header.

Location: `src/index.ts` exports everything needed; `example.ts` is a working CLI reference for exactly what to pull out of the result and how to lay it out.

## Setup

- Requires Node ≥ 22.7 to run directly (`node --experimental-strip-types`), or compile with `tsc` for use in a browser bundle / tRPC or other backend.
- No dependencies to install.
- Run `npm test` (2098+ checks) to confirm the engine works in your environment before wiring it up.
- Run `npm run example` to see sample console output and confirm your mental model of the data shape.

## Core API

```ts
import { buildChart } from './src/index.ts';

const chart = buildChart({
  y: 2026, m: 3, d: 17, hh: 10, mm: 6,   // required: local civil date/time
  method: 'zhirun',                       // optional: 'zhirun' (default) | 'chaibu'
  lateZiNextDay: true,                    // optional: 晚子时 rolls to next day (default true)
  tzHours: 8,                             // optional: default 8 (Beijing/Singapore)
  spiritVariant: false                    // optional: true = 勾陈/朱雀 naming instead of 白虎/玄武
});
```

### Input: `ChartInput`

| Field | Type | Notes |
|---|---|---|
| `y, m, d, hh, mm` | `number` | Local civil date and time (24h clock) |
| `method` | `'zhirun' \| 'chaibu'` | Which ju-determination method to use. Default `'zhirun'` (置闰法, the traditional/classical method). `'chaibu'` (拆补法) is what most almanac apps use and can diverge from 置闰 during 超神/接气 windows — see README §"method divergence" for when/why. If the frontend needs to show both side by side (like `example.ts` does), call `buildChart` twice with each method. |
| `lateZiNextDay` | `boolean` | Whether 23:00–24:00 (晚子时) advances the day pillar to the next day. Default `true`. |
| `tzHours` | `number` | Civil timezone offset. Default `8`. |
| `spiritVariant` | `boolean` | Swap 白虎/玄武 for 勾陈/朱雀 spirit names (a school-specific naming variant). Default `false`. |

### Output: `Chart`

```ts
interface Chart {
  input: ChartInput;
  pillars: FourPillars;
  juResult: JuResult;
  board: Board;
  summary: {
    fourPillars: string;   // "丙午 辛卯 庚寅 辛巳"
    dun: string;           // "阳遁四局"
    yuan: string;          // "上元" | "中元" | "下元"
    term: string;          // serving solar term, e.g. "惊蛰" (+ "(闰)" if intercalated)
    zhiFu: string;         // "甲戌己 天禽落兑七宫"
    zhiShi: string;        // "死门落震三宫"
  };
}
```

Use `summary` directly for a header/status bar — it's pre-formatted, human-readable Chinese text and needs no further assembly.

### `Board` — what the 3×3 grid needs

```ts
interface Board {
  dun: 'yang' | 'yin';
  ju: number;                    // 1..9
  palaces: Palace[];             // index 0..8 = palace 1..9 (see Palace below)
  zhiFuStar: string;
  zhiFuPalace: number;           // actual palace (5 possible: 中五 case)
  zhiFuDisplayPalace: number;    // display palace (中五 -> 坤二, per convention)
  zhiShiGate: string;
  zhiShiPalace: number;
  zhiShiDisplayPalace: number;
  xunShou: string;               // e.g. "甲戌"
  xunShouYi: string;             // e.g. "己"
  hourKongWang: string;          // e.g. "申酉"
  dayKongWang: string;
  maXing: string;                // branch name
}

interface Palace {
  palace: number;                // Luoshu number 1..9
  spirit: string | null;         // 八神 (null for centre palace 5)
  gate: string | null;           // 八门 (null for centre palace 5)
  stars: string[];               // usually 1 star; 芮宫 carries ["天芮","天禽"]
  tianPanStems: string[];        // heaven-plate stem(s); 芮宫 carries two
  diPanStem: string;             // earth-plate stem
  isZhiFu: boolean;
  isZhiShi: boolean;
  isHourKong: boolean;           // 时空亡 marker
  isMaXing: boolean;             // 马星 marker
}
```

`palaces` is a flat array indexed `[0..8]` for Luoshu palaces `1..9` — **not** already arranged into the visual 3×3 grid. The classic display order (top row → bottom row, left → right) is:

```
4  9  2
3  5  7
8  1  6
```

`example.ts` (lines 19–34) shows exactly how to map that `order` array over `board.palaces` and render each cell (spirit+gate line, stars line, tianPan/diPan stems line), with palace 5 (中宫) rendered specially since it has no gate/spirit/stars — just its 地盘 stem.

### Other exports available if needed

`buildChart` is the one entry point most UIs need, but everything is also exported individually from `src/index.ts` if the frontend (or a backend/tRPC layer) needs lower-level pieces:

- `fourPillars(y, m, d, hh, mm, opt)` → `FourPillars` (year/month/day/hour 干支, 空亡, 马星, current/next solar term)
- `getJuZhiRun(qimenDayNum, tzHours)` / `getJuChaiBu(qimenDayNum, currentTerm)` → `JuResult`
- `buildBoard(pillars, juRes, opt)` → `Board`
- `solarTermsOfYear(year, tzHours)`, `termsBracketing(jdLocal, tzHours)` — solar term calendar, useful for a "term timeline" feature
- `ganZhi`, `dayNumber`, `kongWang`, `yiMa`, etc. — low-level ganzhi utilities

Full signatures: `src/ganzhi.ts`, `src/ju.ts`, `src/board.ts`, `src/astro.ts`.

## What the engine deliberately does NOT do

(So the frontend/app layer knows what it still owns.)

- No 格局 detection (青龙返首 etc.), no 门迫/入墓/击刑 markers, no interpretive quality scoring — the board exposes all the raw fields these need, but scoring logic lives in the app.
- No 阴盘 or 飞盘 board variants — 转盘 (rotating/moving) only.
- No 农历 (lunar calendar) date display.
- No persistence, no state, no UI — it's a pure function per chart.

## Validating your integration

`tests/run.ts` runs 3000+ checks against 30 transcribed reference charts (screenshots from a professional app, Sep 2024–Jul 2026) and is the source of truth for correctness. If a rendered chart ever looks wrong, check it against these references before assuming a UI bug — see README §6 for what's covered (including known 置闰-vs-拆补 divergence dates you can use as test fixtures for a "both methods" toggle).

## Suggested first frontend milestone

1. Wire a date/time picker → `buildChart()` → render `summary` as a header.
2. Render the 3×3 palace grid per `example.ts`'s layout logic.
3. Add a method toggle (置闰/拆补) once the basic grid renders correctly, to exercise both code paths.
4. Surface `hourKongWang` / `dayKongWang` / `maXing` as a small annotations row — these mark specific palaces (`isHourKong` / `isMaXing` on `Palace`) rather than needing separate lookup.
