// Sanity checks for js/program.js: node tools/check-program.js
const assert = require('assert');
const P = require('../js/program.js');

const TYPES = new Set(['rest', 'walk', 'run', 'speed', 'long', 'cross', 'goal']);

// The program must not depend on season, weather, a route or a race calendar, and must not
// assume either a treadmill or running outside.
const BANNED = new RegExp([
  // Finnish word stems
  '(?<![a-zåäö])(?:käänn|koti|talv|kesä|kevä|syks|ulko|sisätil|lumi|liuk|sade|heijast|pime|metsä|polku|polut|luonno|reitti|lyhty|kisa|kilpailu|juomapiste|hiihto|sauva|mäki|mäet|mäke|ylämä|maasto|juoksumat)',
  // English whole words
  '\\b(?:winter|summer|spring|autumn|weather|rain|snow|ice|dark|home|turn around|trails?|route|lamp|ski|skiing|race|nordic|treadmill|outdoors?|indoors?|outside|inside|course|aid stations?|hills?|uphill|loop|reflector|nature|forests?)\\b',
].join('|'), 'i');
assert.strictEqual(P.weeks.length, 52, 'program must have 52 weeks');
P.weeks.forEach((week, i) => {
  assert.strictEqual(week.length, 7, `week ${i + 1} must have 7 days`);
  week.forEach((day, d) => {
    const where = `week ${i + 1} day ${d + 1}`;
    assert.ok(TYPES.has(day.type), `${where}: unknown type ${day.type}`);
    assert.ok(day.fi && day.en, `${where}: missing text`);
    for (const text of [day.fi, day.en]) {
      const m = text.match(BANNED);
      assert.ok(!m, `${where}: location/season/race-specific wording "${m && m[0]}" in: ${text}`);
    }
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
const extraTexts = [
  ...P.phases.flatMap((p) => [p.fi, p.en]),
  ...P.milestones.flatMap((m) => [m.fi, m.en]),
  ...Object.values(P.weekNotes).flat(),
];
for (const text of extraTexts) {
  const m = text.match(BANNED);
  assert.ok(!m, `location/season/race-specific wording "${m && m[0]}" in: ${text}`);
}

console.log('program OK: 52 weeks, %d phases, %d milestones', P.phases.length, P.milestones.length);
