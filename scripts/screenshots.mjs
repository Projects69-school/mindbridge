import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const base = process.env.BASE_URL ?? 'http://127.0.0.1:4173/'
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH })
const output = new URL('../docs/screenshots/', import.meta.url)
await mkdir(output, { recursive: true })
const views = [
  ['landing-page', '/'],
  ['role-selection', '/select-role'],
  ['student-dashboard', '/student/dashboard'],
  ['teacher-dashboard', '/teacher/dashboard'],
  ['emotional-checkin', '/student/emotions?emotion=เครียด&emotion=กังวล'],
  ['emotion-decoder', '/student/emotion-decoder'],
  ['mood-timeline', '/student/mood-timeline'],
  ['trust-ladder', '/student/trust-ladder', async page => page.getByRole('button', { name: /SIGNAL/ }).click()],
  ['private-journal', '/student/journal'],
  ['drawing-canvas', '/student/drawing', async page => {
    const canvas = page.locator('canvas')
    const box = await canvas.boundingBox()
    if (!box) throw new Error('Drawing canvas is missing')
    const point = ([x, y]) => ({ x: box.x + x * box.width, y: box.y + y * box.height })
    const coords = [[.50,.66],[.37,.47],[.35,.35],[.39,.24],[.46,.26],[.50,.34],[.54,.26],[.61,.24],[.65,.35],[.63,.47],[.50,.66]]
    await page.mouse.move(...Object.values(point(coords[0])))
    await page.mouse.down()
    for (const item of coords.slice(1)) await page.mouse.move(...Object.values(point(item)), { steps: 8 })
    await page.mouse.up()
  }],
  ['support-matching', '/student/support'],
  ['student-chat', '/student/messages?id=chat-fah'],
  ['teacher-chat', '/teacher/messages?id=chat-fah'],
  ['appointments', '/student/appointments?new=1&request=request-fah'],
  ['teacher-guidance', '/teacher/guidance'],
  ['care-loop', '/teacher/care?request=request-fah'],
  ['innovation-showcase', '/innovation'],
  ['mobile-student', '/student/dashboard', undefined, { width: 390, height: 844 }],
]

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  for (const [name, route, prepare, viewport] of views) {
    if (viewport) await page.setViewportSize(viewport)
    await page.goto(new URL('./#' + route, base).href)
    await page.locator('#main-content h1').first().waitFor()
    await page.evaluate(() => document.fonts.ready)
    if (prepare) await prepare(page)
    await page.screenshot({ path: decodeURIComponent(new URL(name + '.png', output).pathname), fullPage: name !== 'mobile-student', animations: 'disabled' })
    console.log(name + '.png')
  }
  if (errors.length) throw new Error(errors.join('\n'))
} finally {
  await browser.close()
}
