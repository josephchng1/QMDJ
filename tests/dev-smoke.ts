import { termJdLocal, gregorianFromJd, solarTermsOfYear } from './src/astro.ts';
import { XL0 } from './src/vsop87data.ts';
console.log('XL0 length:', XL0.length, '(expect 2666)');
console.log('boundary check idx20:', XL0[20], '(expect 17534704567)');
console.log('idx578:', XL0[578], '(expect 62833196674749)');
console.log('idx920:', XL0[920], '(expect 5291887)');
console.log('idx1100:', XL0[1100], 'idx1124:', XL0[1124], 'idx1136:', XL0[1136], 'idx1148:', XL0[1148]);
console.log('idx1217:', XL0[1217], 'idx1226:', XL0[1226], 'idx1229:', XL0[1229]);
console.log('idx1937:', XL0[1937], 'idx2363:', XL0[2363], 'idx2618:', XL0[2618], 'idx2633:', XL0[2633], 'idx2660:', XL0[2660]);
const fmt = (jd:number) => { const p = gregorianFromJd(jd); return `${p.y}-${String(p.m).padStart(2,'0')}-${String(p.d).padStart(2,'0')} ${String(p.hh).padStart(2,'0')}:${String(p.mm).padStart(2,'0')}:${String(p.ss).padStart(2,'0')}`; };
// winter solstice 2025, expect 2025-12-21 23:02 (app) ; official 23:03 CST
console.log('DongZhi 2025:', fmt(termJdLocal(18, 25)));
console.log('XiaZhi 2026:', fmt(termJdLocal(6, 26)));
