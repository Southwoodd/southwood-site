import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.locator('#recognition').scrollIntoViewIfNeeded()
await page.mouse.wheel(0, 2200)
await page.waitForTimeout(500)

const geo = await page.evaluate(() => {
  const stage = document.querySelector('.recognition__stage')
  const vp = document.querySelector('.recognition__viewport')
  const reel = document.querySelector('.recognition__reel')
  const rows = [...document.querySelectorAll('.recognition__row')]
  const active = document.querySelector('.recognition__row[data-active="true"]')
  const title = active?.querySelector('h3')
  const sr = stage.getBoundingClientRect()
  const tr = title.getBoundingClientRect()
  return {
    headerH: getComputedStyle(document.documentElement).getPropertyValue('--header-h'),
    stage: { top: sr.top, h: sr.height, cls: stage.className },
    vp: vp.getBoundingClientRect().height,
    reelTransform: reel.style.transform,
    slideHInline: active?.style.height,
    rowHeights: rows.map((r) => r.getBoundingClientRect().height),
    activeStyles: {
      display: getComputedStyle(active).display,
      alignContent: getComputedStyle(active).alignContent,
      alignItems: getComputedStyle(active).alignItems,
      justifyContent: getComputedStyle(active).justifyContent,
      height: getComputedStyle(active).height,
      padding: getComputedStyle(active).padding,
    },
    titleTop: tr.top,
    titleBottom: tr.bottom,
    stageCenter: sr.top + sr.height / 2,
    deltaFromCenter: tr.top + tr.height / 2 - (sr.top + sr.height / 2),
    visibleTitles: rows
      .map((r) => {
        const h = r.querySelector('h3')
        const rr = r.getBoundingClientRect()
        const visible = rr.bottom > sr.top + 2 && rr.top < sr.bottom - 2
        return visible
          ? { title: h?.textContent, top: rr.top, bottom: rr.bottom, h: rr.height }
          : null
      })
      .filter(Boolean),
  }
})

console.log(JSON.stringify(geo, null, 2))
await page.screenshot({
  path: 'scripts/recognition-debug-desktop.png',
  fullPage: false,
})

const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
})
await mobile.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await mobile.locator('#recognition').scrollIntoViewIfNeeded()
await mobile.mouse.wheel(0, 1800)
await mobile.waitForTimeout(500)
await mobile.screenshot({
  path: 'scripts/recognition-debug-mobile.png',
  fullPage: false,
})
const mgeo = await mobile.evaluate(() => {
  const stage = document.querySelector('.recognition__stage')
  const active = document.querySelector('.recognition__row[data-active="true"]')
  const title = active?.querySelector('h3')
  const sr = stage.getBoundingClientRect()
  const tr = title.getBoundingClientRect()
  return {
    stageH: sr.height,
    rowH: active.getBoundingClientRect().height,
    titleTop: tr.top,
    delta: tr.top + tr.height / 2 - (sr.top + sr.height / 2),
    peek: document.body.innerText.includes('ушел дальше'),
  }
})
console.log('mobile', JSON.stringify(mgeo, null, 2))
await browser.close()
