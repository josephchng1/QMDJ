/**
 * Demo: node --experimental-strip-types example.ts
 * Prints the 置闰法 and 拆补法 charts for a given moment.
 */
import { buildChart } from './src/index.ts';

function printChart(label: string, method: 'zhirun' | 'chaibu') {
  const c = buildChart({ y: 2026, m: 7, d: 19, hh: 10, mm: 30, method });
  console.log(`\n==== ${label} ====`);
  console.log('四柱:', c.summary.fourPillars, c.pillars.isLateZi ? '(晚子时)' : '');
  console.log('局:', c.summary.dun, c.summary.yuan, '· 值事节气:', c.summary.term,
    '· 符头:', c.juResult.fuTou.name);
  console.log('节气:', c.pillars.currentTerm.name,
    `(${c.pillars.currentTerm.time.m}/${c.pillars.currentTerm.time.d} ${c.pillars.currentTerm.time.hh}:${String(c.pillars.currentTerm.time.mm).padStart(2, '0')})`,
    '→', c.pillars.nextTerm.name);
  console.log('值符:', c.summary.zhiFu, '· 值使:', c.summary.zhiShi);
  console.log('时空:', c.board.hourKongWang, '· 日空:', c.board.dayKongWang, '· 马星:', c.board.maXing);
  // 3x3 grid, classic display order 4-9-2 / 3-5-7 / 8-1-6
  const order = [4, 9, 2, 3, 5, 7, 8, 1, 6];
  const cells = order.map(p => {
    const pal = c.board.palaces[p - 1];
    if (p === 5) return [`      `, `  中${pal.diPanStem}  `, `      `];
    return [
      `${pal.spirit} ${pal.gate}`.padEnd(6),
      `${pal.stars.join('')}`.padEnd(6),
      `${pal.tianPanStems.join('')}/${pal.diPanStem}`.padEnd(6)
    ];
  });
  for (let row = 0; row < 3; row++) {
    for (let line = 0; line < 3; line++) {
      console.log(cells[row * 3][line] + ' | ' + cells[row * 3 + 1][line] + ' | ' + cells[row * 3 + 2][line]);
    }
    console.log('-'.repeat(30));
  }
}

printChart('置闰法', 'zhirun');
printChart('拆补法', 'chaibu');
