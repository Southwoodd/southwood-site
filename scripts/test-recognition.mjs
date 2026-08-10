import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
console.log('has recognition', await page.locator('#recognition').count());

await page.locator('#recognition').scrollIntoViewIfNeeded();
await page.waitForTimeout(400);

for (let i = 0; i < 10; i++) {
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(180);
  const snap = await page.evaluate(() => {
    const stage = document.querySelector('.recognition__stage');
    const active = document.querySelector('.recognition__row[data-active="true"] h3');
    const reel = document.querySelector('.recognition__reel');
    return {
      cls: stage?.className ?? null,
      title: active?.textContent ?? null,
      transform: reel ? getComputedStyle(reel).transform : null,
      stageTop: stage?.getBoundingClientRect().top ?? null,
    };
  });
  console.log(i, JSON.stringify(snap));
}

await browser.close();
