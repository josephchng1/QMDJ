import { solarTermsOfYear, jdFromGregorian } from './src/astro.ts';
import { solsticeAnchor } from './src/ju.ts';
import { dayGanZhi, dateFromDayNumber } from './src/ganzhi.ts';
import { TERM_TIMES } from './tests/references.ts';
let maxd = 0;
for (const t of TERM_TIMES) {
  const terms = solarTermsOfYear(t.y);
  const f = terms.filter(x => x.name === t.name).find(x => Math.abs(x.jdLocal - jdFromGregorian(t.y,t.m,t.d)) < 20)!;
  const diff = (f.jdLocal - (jdFromGregorian(t.y,t.m,t.d)+(t.hh*60+t.mm)/1440))*1440;
  maxd = Math.max(maxd, Math.abs(diff));
  console.log(`${t.y} ${t.name}: app ${t.hh}:${String(t.mm).padStart(2,'0')}  engine ${f.time.hh}:${String(f.time.mm).padStart(2,'0')}:${String(f.time.ss).padStart(2,'0')}  diff ${diff.toFixed(2)} min`);
}
console.log('max |diff| =', maxd.toFixed(2), 'min');
// intercalation events 2010-2040
console.log('\n闰 (intercalated 芒种/大雪 repetitions), 2010-2040:');
let prev: {a:number,kind:string,year:number}|null = null;
const list: {a:number,kind:string,year:number}[] = [];
for (let y = 2009; y <= 2041; y++) for (const kind of ['summer','winter'] as const) {
  const r = solsticeAnchor(y, kind); list.push({a:r.anchorDayNum, kind, year:y});
}
list.sort((x,y)=>x.a-y.a);
for (let i=1;i<list.length;i++) {
  const span = (list[i].a - list[i-1].a)/5;
  if (span === 39) {
    const runStart = list[i].a - 15;
    const d = dateFromDayNumber(runStart);
    const term = list[i].kind === 'summer' ? '芒种' : '大雪';
    console.log(`  闰${term}: repeat starts ${d.y}-${d.m}-${d.d} (${dayGanZhi(runStart).name}), before ${list[i].kind==='summer'?'夏至':'冬至'} ${list[i].year}`);
  }
}
