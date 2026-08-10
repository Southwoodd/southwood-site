import { chromium } from 'playwright'

const browser = await chromium.launch()

async function shot(viewport, path, label) {
  const page = await browser.newPage({
    viewport,
    isMobile: viewport.width < 500,
  })
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(200)

  const info = await page.evaluate(() => {
    const track = document.querySelector('#recognition .recognition__track')
    const top = track.getBoundingClientRect().top + window.scrollY
    return { top, h: track.offsetHeight }
  })

  const hh = 68
  const viewH = viewport.height
  const pinStart = info.top - hh
  const pinScroll = info.h - (viewH - hh)
  const target = pinStart + pinScroll * (2.5 / 6)
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(target))
  await page.waitForTimeout(400)

  const r = await page.evaluate(() => {
    const stage = document.querySelector('.recognition__stage')
    const sr = stage.getBoundingClientRect()
    const active = document.querySelector('.recognition__row[data-active="true"]')
    const titles = [...document.querySelectorAll('.recognition__item-title')]
      .filter((t) => {
        const rect = t.getBoundingClientRect()
        return rect.bottom > sr.top + 2 && rect.top < sr.bottom - 2
      })
      .map((t) => t.textContent)
    const texts = [...document.querySelectorAll('.recognition__item-text')]
      .filter((p) => {
        const rect = p.getBoundingClientRect()
        return rect.bottom > sr.top + 2 && rect.top < sr.bottom - 2
      })
      .map((p) => p.textContent.slice(-40))
    const tr = active.querySelector('h3').getBoundingClientRect()
    return {
      cls: stage.className,
      marker: active.querySelector('.recognition__marker')?.textContent?.replace(/\s+/g, ' ').trim(),
      titles,
      textTails: texts,
      stageTop: Math.round(sr.top),
      centerDelta: Math.round(
        tr.top + tr.height / 2 - (sr.top + sr.height / 2),
      ),
      transform: document.querySelector('.recognition__reel').style.transform,
    }
  })

  console.log(label, JSON.stringify(r, null, 2))
  await page.screenshot({ path })
  await page.close()
}

await shot(
  { width: 390, height: 844 },
  'scripts/recognition-mobile-slide3.png',
  'mobile',
)
await shot(
  { width: 1280, height: 800 },
  'scripts/recognition-desktop-slide3.png',
  'desktop',
)
await browser.close()
