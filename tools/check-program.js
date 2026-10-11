// Sanity checks for js/program.js: node tools/check-program.js
const assert = require('assert');
const P = require('../js/program.js');

const TYPES = new Set(['rest', 'walk', 'run', 'speed', 'long', 'cross', 'race']);
assert.strictEqual(P.weeks.length, 52, 'program must have 52 weeks');
P.weeks.forEach((week, i) => {
  assert.strictEqual(week.length, 7, `week ${i + 1} must have 7 days`);
  week.forEach((day, d) => {
    const where = `week ${i + 1} day ${d + 1}`;
    assert.ok(TYPES.has(day.type), `${where}: unknown type ${day.type}`);
    assert.ok(day.fi && day.en, `${where}: missing text`);
  });
  const rest = week.filter((x) => x.type === 'rest').length;
  assert.ok(rest >= 1, `week ${i + 1}: needs at least one rest day`);
});

// Phases cover weeks 1..52 contiguously.
let next = 1;
for (const p of P.phases) {
  assert.strictEqual(p.weeks[0], next, `phase ${p.id} should start at week ${next}`);
  next = p.weeks[1] + 1;
}
assert.strictEqual(next, 53, 'phases must end at week 52');

for (const m of P.milestones) assert.ok(P.weeks[m.week - 1][m.day], `milestone ${m.en} points nowhere`);

console.log('program OK: 52 weeks, %d phases, %d milestones', P.phases.length, P.milestones.length);
