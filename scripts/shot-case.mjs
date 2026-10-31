import { chromium } from 'playwright'

const base = process.argv[2] || 'http://127.0.0.1:4321'
const browser = await chromium.launch()

// десктоп: блок «Что сделано» + «Инструменты и технологии» в кейсе MeetFlow
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
await page.goto(`${base}/kejsy/meetflow/`, { waitUntil: 'networkidle' })
const el = await page.$('.sec--mint')
await el.scrollIntoViewIfNeeded()
await page.waitForTimeout(600)
await el.screenshot({ path: 'scripts/shots/case-mint-desktop.png' })

// мобильная версия
const m = await browser.newPage({ viewport: { width: 375, height: 812 }, isMobile: true })
await m.goto(`${base}/kejsy/meetflow/`, { waitUntil: 'networkidle' })
const mel = await m.$('.ch__stack')
await mel.scrollIntoViewIfNeeded()
await m.waitForTimeout(600)
await mel.screenshot({ path: 'scripts/shots/case-stack-mobile.png' })

await browser.close()
console.log('done')
