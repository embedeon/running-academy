// Renders the home-screen icons (PNG) from one SVG design: node tools/build-icons.js
// Uses Playwright's Chromium (preinstalled in the dev container).
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));

// Runner figure in a 64x64 frame.
const FIGURE = `
  <path d="M14 52h36" stroke="#5fd38a" stroke-width="3.5" stroke-linecap="round" opacity=".9"/>
  <circle cx="38" cy="12" r="5.2" fill="#fff"/>
  <path d="M21 29l9-9 8 4 5 8 7 2M30 20l-3 14 8 6-3 12M27 34l-7 9-8-1" fill="none" stroke="#fff"
        stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"/>`;

// rounded: corner radius (0 = full-bleed square); scale: figure size (maskable needs a safe zone).
function svg({ rounded = 0, scale = 1 } = {}) {
  const t = 32 - 32 * scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#1c7ae0"/><stop offset="1" stop-color="#0a4c94"/>
  </linearGradient></defs>
  <rect width="64" height="64" rx="${rounded}" fill="url(#g)"/>
  <g transform="translate(${t} ${t}) scale(${scale})">${FIGURE}</g>
</svg>`;
}

const root = path.join(__dirname, '..');
const OUT = [
  // Browser tab / in-app logo (vector, rounded)
  { file: 'icon.svg', svg: svg({ rounded: 14 }) },
  // iOS home screen: full-bleed square, iOS rounds the corners itself
  { file: 'icons/apple-touch-icon.png', size: 180, svg: svg({ scale: 0.9 }) },
  // Android / PWA "any": rounded corners
  { file: 'icons/icon-192.png', size: 192, svg: svg({ rounded: 14 }) },
  { file: 'icons/icon-512.png', size: 512, svg: svg({ rounded: 14 }) },
  // Android adaptive "maskable": full-bleed, figure inside the 80 % safe zone
  { file: 'icons/maskable-512.png', size: 512, svg: svg({ scale: 0.72 }) },
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const o of OUT) {
    const dest = path.join(root, o.file);
    if (!o.size) { fs.writeFileSync(dest, o.svg + '\n'); console.log('wrote', o.file); continue; }
    await page.setViewportSize({ width: o.size, height: o.size });
    await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${o.size}px;height:${o.size}px}</style>${o.svg}`);
    await page.screenshot({ path: dest, omitBackground: true });
    console.log('wrote', o.file);
  }
  await browser.close();
})();
