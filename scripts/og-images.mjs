/**
 * Картинки для og: 1200×630, по одной на локаль, только типографика.
 *
 * Запуск: node scripts/og-images.mjs
 * Пересобирать, когда меняется ставка, площадь или title секции: тексты
 * берутся из src/i18n/messages, но сама картинка — статический файл.
 *
 * Шрифты вшиваются base64: file:// из about:blank Chromium не отдаёт, и
 * страница молча уезжает на системный шрифт с засечками.
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
import fs from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
// Шрифты вшиваются в разметку base64. file:// из about:blank Chromium
// не отдаёт, и страница молча уезжает на системный шрифт с засечками.
const F = (n) => `data:font/woff2;base64,${fs.readFileSync(`${ROOT}/public/fonts/${n}`).toString('base64')}`;
const msg = (loc) => JSON.parse(fs.readFileSync(`${ROOT}/src/i18n/messages/${loc}.json`, 'utf8'));

// Площадь — то же число и тот же формат, что на странице.
const AREA = 244.1;
const area = (loc) => new Intl.NumberFormat(loc === 'ru' ? 'ru-RU' : 'en-US',
  { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(AREA);

const LINE3 = {
  ru: 'БЦ iCITY · Space Tower · 23 этаж',
  en: 'iCITY · Space Tower · 23rd floor',
};

const page_html = (loc) => {
  const m = msg(loc);
  const unit = m.numbers.items.area.unit;         // «м²» / «m²»
  const price = m.hero.price;                     // «1 300 000 ₽ / мес»
  return `<!doctype html><html lang="${loc}"><head><meta charset="utf-8"><style>
@font-face{font-family:U;src:url("${F('unbounded-cyrillic.woff2')}");font-weight:200 300;unicode-range:U+301,U+400-45F,U+490-491,U+4B0-4B1,U+2116}
@font-face{font-family:U;src:url("${F('unbounded-latin.woff2')}");font-weight:200 300;unicode-range:U+??,U+131,U+152-153,U+2BB-2BC,U+2C6,U+2DA,U+2DC,U+304,U+308,U+329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:U;src:url("${F('unbounded-ruble.woff2')}");font-weight:200 300;unicode-range:U+20BD}
@font-face{font-family:O;src:url("${F('onest-cyrillic.woff2')}");font-weight:400 500;unicode-range:U+301,U+400-45F,U+490-491,U+4B0-4B1,U+2116}
@font-face{font-family:O;src:url("${F('onest-latin.woff2')}");font-weight:400 500;unicode-range:U+??,U+131,U+152-153,U+2BB-2BC,U+2C6,U+2DA,U+2DC,U+304,U+308,U+329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:O;src:url("${F('onest-ruble.woff2')}");font-weight:400 500;unicode-range:U+20BD}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px}
body{background:#DCEBF7;color:#16222B;font-family:O,sans-serif;
     display:flex;flex-direction:column;justify-content:center;padding:0 88px;-webkit-font-smoothing:antialiased}
.area{font-family:U;font-weight:200;font-size:132px;line-height:1.05;letter-spacing:-0.02em;
      padding-bottom:.16em;margin-bottom:-.16em}
.area i{font-style:normal;font-size:.42em;letter-spacing:0;margin-left:.12em;color:#3F6580}
.price{font-family:U;font-weight:200;font-size:74px;line-height:1.1;letter-spacing:-0.02em;color:#0F63A8;
       margin-top:18px;padding-bottom:.16em;margin-bottom:-.16em}
.rule{height:1px;background:rgba(22,34,43,.18);width:100%;margin:44px 0 26px}
.sub{font-family:O;font-weight:400;font-size:30px;line-height:1.35;color:#3F6580}
</style></head><body>
<div class="area">${area(loc)}<i>${unit}</i></div>
<div class="price">${price}</div>
<div class="rule"></div>
<div class="sub">${LINE3[loc]}</div>
</body></html>`;
};

const b = await chromium.launch();
for (const loc of ['ru', 'en']) {
  const ctx = await b.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.setContent(page_html(loc), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const out = `${ROOT}/public/og/${loc}.png`;
  await page.screenshot({ path: out });
  console.log(loc, '→', out, (fs.statSync(out).size/1024).toFixed(1), 'КБ');
  await ctx.close();
}
await b.close();
