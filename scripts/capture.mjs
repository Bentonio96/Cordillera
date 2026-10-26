/**
 * Regenerates the screenshots in docs/ and the Open Graph image.
 *
 * Needs the dev server (npm run dev): it drives the page through the
 * dev-only window.__lenis handle, because window.scrollTo is overwritten by
 * Lenis on the next frame. Uses the installed Google Chrome.
 *
 * Usage: node scripts/capture.mjs [http://localhost:5173]
 */
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const BASE = process.argv[2] ?? 'http://localhost:5173'
const OUT = 'docs'

const DESKTOP = { width: 1440, height: 900 }
const PHONE = { width: 390, height: 844 }

const SHOTS = [
  { file: '01-hero.jpg', viewport: DESKTOP, section: 'inicio' },
  { file: '02-altiplano.jpg', viewport: DESKTOP, section: 'altiplano' },
  {
    file: '03-ojos-del-salado.jpg',
    viewport: DESKTOP,
    section: 'ojos-del-salado',
  },
  { file: '04-volcanes.jpg', viewport: DESKTOP, section: 'volcanes' },
  { file: '05-patagonia.jpg', viewport: DESKTOP, section: 'patagonia' },
  { file: '06-cierre.jpg', viewport: DESKTOP, section: 'cierre' },
  {
    file: '07-movimiento-reducido.jpg',
    viewport: DESKTOP,
    section: 'altiplano',
    query: '?reduced=1',
  },
  { file: '08-movil.jpg', viewport: PHONE, section: 'inicio', scale: 2 },
  {
    file: '09-movil-ojos.jpg',
    viewport: PHONE,
    section: 'ojos-del-salado',
    scale: 2,
  },
  {
    file: '10-english.jpg',
    viewport: DESKTOP,
    section: 'volcanes',
    lang: 'en',
  },
]

const browser = await chromium.launch({
  channel: 'chrome',
  args: ['--enable-unsafe-swiftshader', '--use-angle=metal'],
})
await mkdir(OUT, { recursive: true })

async function open(viewport, query = '', lang = 'es', scale = 1) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: scale,
    locale: lang === 'en' ? 'en-GB' : 'es-CL',
  })
  await context.addInitScript((l) => {
    localStorage.setItem('cordillera:lang', l)
  }, lang)
  const page = await context.newPage()
  await page.goto(`${BASE}/${query}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(4500)
  return { context, page }
}

/** Centre a section the way the journey tracker anchors it, then settle. */
async function go(page, id) {
  await page.evaluate((target) => {
    const el = document.getElementById(target)
    if (!el) return
    const y =
      target === 'inicio'
        ? 0
        : el.offsetTop +
          Math.min(el.offsetHeight, innerHeight * 1.4) / 2 -
          innerHeight / 2
    const lenis = window.__lenis
    if (lenis) lenis.scrollTo(y, { immediate: true })
    else window.scrollTo(0, y)
  }, id)
  await page.waitForTimeout(5000)
}

for (const shot of SHOTS) {
  const { context, page } = await open(
    shot.viewport,
    shot.query,
    shot.lang,
    shot.scale,
  )
  await go(page, shot.section)
  await page.screenshot({
    path: `${OUT}/${shot.file}`,
    type: 'jpeg',
    quality: 82,
  })
  console.log(shot.file)
  await context.close()
}

const { context, page } = await open({ width: 1200, height: 630 })
await go(page, 'inicio')
await page.screenshot({ path: 'public/og.jpg', type: 'jpeg', quality: 84 })
console.log('public/og.jpg')
await context.close()

await browser.close()
