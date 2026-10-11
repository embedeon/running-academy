// Generates PROGRAM.md (printable full-year plan) from js/program.js:
//   node tools/build-program-md.js
const fs = require('fs');
const path = require('path');
const P = require('../js/program.js');

const DAYS = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];
const cell = (s) => s.replace(/\|/g, '\\|');
let out = '# Juoksuohjelma – 52 viikkoa\n\n';
out += '> Generoitu tiedostosta `js/program.js` (`node tools/build-program-md.js`). ';
out += P.source + ' Viikot 12–52 ovat jatko-ohjelma.\n\n';
out += 'Taulukko olettaa aloituksen maanantaina. Ohjelman voi aloittaa minä päivänä tahansa – viikko alkaa silloin aloituspäivän viikonpäivästä. '
  + 'Kaikki harjoitukset sopivat sekä juoksumatolle että ulos.\n\n';
out += 'Tyypit: 🛌 lepo · 🚶 kävely · 🏃 juoksu · ⚡ vauhti · 🛣️ pitkä lenkki · 💪 oheisharjoitus · 🏁 tavoite/testi\n\n';
const icon = { rest: '🛌', walk: '🚶', run: '🏃', speed: '⚡', long: '🛣️', cross: '💪', goal: '🏁' };

for (const ph of P.phases) {
  out += `## ${ph.id}. ${ph.fi} (viikot ${ph.weeks[0]}–${ph.weeks[1]})\n\n`;
  out += `| Vko | ${DAYS.join(' | ')} |\n|---|${DAYS.map(() => '---').join('|')}|\n`;
  for (let w = ph.weeks[0]; w <= ph.weeks[1]; w++) {
    const note = P.weekNotes[w] ? `<br>_${P.weekNotes[w][0]}_` : '';
    out += `| **${w}**${note} | ` + P.weeks[w - 1].map((d) => `${icon[d.type]} ${cell(d.fi)}`).join(' | ') + ' |\n';
  }
  out += '\n';
}
fs.writeFileSync(path.join(__dirname, '..', 'PROGRAM.md'), out);
console.log('wrote PROGRAM.md');
