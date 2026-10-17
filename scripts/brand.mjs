/**
 * Regenerates the app icons and social preview image from the logo geometry.
 *   node scripts/brand.mjs
 * Uses the Chromium that Playwright already installs, so there is nothing extra to set up.
 * Keep LEFT / RIGHT / BAR in step with src/components/Logo.tsx.
 */
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { existsSync } from 'node:fs';

const LEFT = 'M14 51V19a6 6 0 0 1 12 0V51Z';
const RIGHT = 'M38 13h12v32a6 6 0 0 1-12 0Z';
const BAR = 'x="26" y="27" width="12" height="10"';
const EMBER = '#ff6a3d';
const NAVY = '#101b33';
const INK = '#0b1220';
const CREAM = '#f4f6fb';

const mark = (tile, h, { full = false } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="${full ? 0 : 18}" fill="${tile}"/><path d="${LEFT}" fill="${h}"/><path d="${RIGHT}" fill="${h}"/><rect ${BAR} fill="${h}"/></svg>`;

const fontFile = new URL('../node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2', import.meta.url).pathname;
const font = readFileSync(fontFile).toString('base64');

const chromiumPath = '/opt/pw-browsers/chromium';
const browser = await chromium.launch(existsSync(chromiumPath) ? { executablePath: chromiumPath } : {});

async function png(html, w, h, out, scale = 1) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out, omitBackground: true });
  await page.close();
}
const square = (svg, size) => `<body style="margin:0;background:transparent">${svg.replace('<svg ', `<svg width="${size}" height="${size}" style="display:block" `)}</body>`;

mkdirSync('public', { recursive: true });
writeFileSync('public/logo.svg', mark(EMBER, INK));
writeFileSync('public/logo-navy.svg', mark(NAVY, CREAM));
await png(square(mark(EMBER, INK), 512), 512, 512, 'public/icon-512.png');
await png(square(mark(EMBER, INK), 192), 192, 192, 'public/icon-192.png');
await png(square(mark(EMBER, INK), 512), 512, 512, 'src/app/icon.png');
// iOS rounds the corners itself, so the apple icon is a full-bleed square.
await png(square(mark(EMBER, INK, { full: true }), 180), 180, 180, 'src/app/apple-icon.png');

// Social preview (also used by link unfurls): mark, wordmark and the promise, on navy.
const og = `<style>
@font-face{font-family:B;src:url(data:font/woff2;base64,${font});font-weight:200 800;font-stretch:75% 100%}
*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:${NAVY};color:${CREAM};font-family:B;position:relative;overflow:hidden}
.t{position:absolute;left:80px;top:96px;display:flex;align-items:center;gap:22px;font-size:64px;font-weight:800;letter-spacing:-0.03em;font-variation-settings:'wdth' 90}
h1{position:absolute;left:80px;top:250px;margin:0;width:760px;font-size:96px;line-height:.98;font-weight:800;letter-spacing:-0.04em;font-variation-settings:'wdth' 88}
h1 em{font-style:normal;color:${EMBER}}
.s{position:absolute;right:-60px;top:-40px;width:520px;height:520px;opacity:.9}
</style>
<div class="t">${mark(EMBER, INK).replace('<svg ', '<svg width="84" height="84" ')}<span>habitat</span></div>
<h1>Your friends.<br>Your rules.<br><em>Your place.</em></h1>
<div class="s">${mark('transparent', '#18264a').replace('<svg ', '<svg width="520" height="520" ')}</div>`;
await png(og, 1200, 630, 'src/app/opengraph-image.png');
await browser.close();
console.log('brand assets written');
