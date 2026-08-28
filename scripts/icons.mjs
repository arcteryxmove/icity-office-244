/**
 * Набор иконок: favicon.ico (16 · 32 · 48), icon-32.png, apple-touch-icon.png
 * 180, icon-512.png.
 *
 * Запуск: node scripts/icons.mjs
 *
 * Мелкие размеры рисуются по сетке, а не уменьшаются из 512: стебель буквы
 * при уменьшении уходит ниже пикселя и сливается с точкой в пятно.
 */
// playwright в зависимостях проекта не держим: он нужен только этим двум
// скриптам и утянул бы браузеры в каждую сборку. Ставится разово:
//   npm i -D playwright && npx playwright install chromium
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Нужен playwright: npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}
import sharp from 'sharp';
import fs from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const F = (n) => `data:font/woff2;base64,${fs.readFileSync(`${ROOT}/public/fonts/${n}`).toString('base64')}`;
const S = 512, WEIGHT = 300, SIZE = 320;

const html = (radius) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:U;src:url("${F('unbounded-latin.woff2')}");font-weight:200 300}
*{margin:0;padding:0}
html,body{width:${S}px;height:${S}px;background:transparent}
.m{width:${S}px;height:${S}px;border-radius:${radius}px;background:#0F63A8;color:#fff;
   display:flex;align-items:center;justify-content:center;
   font-family:U;font-weight:${WEIGHT};font-size:${SIZE}px;line-height:1;
   letter-spacing:-0.02em;-webkit-font-smoothing:antialiased}
</style></head><body><div class="m">i</div></body></html>`;

const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:S,height:S}, deviceScaleFactor:1 });
const page = await ctx.newPage();
const render = async (radius, out) => {
  await page.setContent(html(radius), { waitUntil:'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  await page.screenshot({ path: out, omitBackground: true });
};
// Скруглённый — для вкладки браузера. Квадратный без скругления — для iOS:
// там систему просят не скруглять дважды, маску накладывает сама iOS.
await render(Math.round(S*0.24), `${`${ROOT}/public`}/mark-rounded.png`);
await render(0, `${`${ROOT}/public`}/mark-square.png`);
await b.close();

const rounded = `${`${ROOT}/public`}/mark-rounded.png`;
const square = `${`${ROOT}/public`}/mark-square.png`;

/**
 * Мелкие размеры рисуются по сетке, а не уменьшаются из 512.
 * Замерено на знаке: стебель 29px из 512 даёт 0.9px при 16, точка — 1.3px,
 * зазор — 0.88px. Все три ниже пикселя, сглаживание сливает их в пятно.
 * Формула держит пропорции знака и при этом попадает в целые пиксели:
 * стебель ~9% канвы, но не тоньше 2px, высота знака 69% канвы, точка и
 * зазор равны толщине стебля.
 */
const mark = (size) => {
  const w = Math.max(2, Math.round(size * 0.09));
  const x = Math.floor((size - w) / 2);
  const H = Math.round(size * 0.69);
  const top = Math.round((size - H) / 2);
  const radius = Math.round(size * 0.24);
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
    `<rect width="${size}" height="${size}" rx="${radius}" fill="#0F63A8"/>` +
    `<rect x="${x}" y="${top}" width="${w}" height="${w}" fill="#ffffff"/>` +
    `<rect x="${x}" y="${top + 2 * w}" width="${w}" height="${H - 2 * w}" fill="#ffffff"/></svg>`);
};

await sharp(mark(32)).png().toFile(`${ROOT}/public/icon-32.png`);
// 180 и 512 остаются настоящим глифом Unbounded: там он читается как есть.
await sharp(square).resize(180,180).flatten({background:'#0F63A8'}).png().toFile(`${ROOT}/public/apple-touch-icon.png`);
await sharp(square).resize(512,512).flatten({background:'#0F63A8'}).png().toFile(`${ROOT}/public/icon-512.png`);

const sizes = [16, 32, 48];
const pngs = [];
for (const s of sizes) pngs.push(await sharp(mark(s)).png({ compressionLevel: 9 }).toBuffer());
const header = Buffer.alloc(6);
header.writeUInt16LE(0,0); header.writeUInt16LE(1,2); header.writeUInt16LE(sizes.length,4);
let offset = 6 + 16*sizes.length;
const dir = [];
sizes.forEach((s,i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s,0); e.writeUInt8(s,1);
  e.writeUInt8(0,2); e.writeUInt8(0,3);
  e.writeUInt16LE(1,4); e.writeUInt16LE(32,6);
  e.writeUInt32LE(pngs[i].length,8); e.writeUInt32LE(offset,12);
  offset += pngs[i].length; dir.push(e);
});
fs.writeFileSync(`${ROOT}/public/favicon.ico`, Buffer.concat([header, ...dir, ...pngs]));

for (const f of ['favicon.ico','icon-32.png','apple-touch-icon.png','icon-512.png'])
  console.log(f.padEnd(22), (fs.statSync(`${ROOT}/public/${f}`).size/1024).toFixed(1), 'КБ');
