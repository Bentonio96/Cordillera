import { useEffect, useRef } from 'react'
import { COPY } from '../data/copy'
import { CHAPTERS, JOURNEY } from '../data/journey'
import { useLanguage } from '../i18n/useLanguage'
import { subscribeJourney } from '../lib/journey-store'
import { scrollToTarget } from '../lib/scroll'

const NORTH = -17
const SOUTH = -56
const toPercent = (lat: number) => ((NORTH - lat) / (NORTH - SOUTH)) * 100

/**
 * The instrument: a ruler of latitude down the right edge, with the
 * chapters on it as links and a cursor at the latitude the camera is over.
 * It is the page's table of contents and its progress bar at once.
 */
export function LatitudeRail() {
  const { t } = useLanguage()
  const cursorRef = useRef<HTMLSpanElement>(null)

  useEffect(
    () =>
      subscribeJourney((stage) => {
        const i = Math.min(JOURNEY.length - 2, Math.floor(stage))
        const a = JOURNEY[i]?.camera.lat ?? NORTH
        const b = JOURNEY[i + 1]?.camera.lat ?? a
        const f = Math.min(1, Math.max(0, stage - i))
        const lat = a + (b - a) * f
        if (cursorRef.current)
          cursorRef.current.style.transform = `translateY(${toPercent(lat).toFixed(2)}cqh)`
      }),
    [],
  )

  return (
    <nav
      aria-label={t(COPY.chaptersNav)}
      className="fixed top-1/2 right-6 z-30 hidden h-[62vh] -translate-y-1/2 lg:block"
    >
      <div className="relative h-full w-px bg-linea [container-type:size]">
        <span
          ref={cursorRef}
          aria-hidden="true"
          className="absolute -left-[5px] top-0 -mt-[5px] block h-[11px] w-[11px] rounded-full border border-glaciar bg-basalto will-change-transform"
        />
        <ol>
          {CHAPTERS.map((s) => (
            <li
              key={s.id}
              className="absolute right-3 -translate-y-1/2"
              style={{ top: `${toPercent(s.camera.lat)}%` }}
            >
              <a
                href={`#${s.id}`}
                onClick={(event) => {
                  event.preventDefault()
                  scrollToTarget(`#${s.id}`)
                }}
                className="etiqueta group flex items-center gap-2 whitespace-nowrap py-2 text-niebla no-underline transition-colors duration-300 hover:text-nieve"
              >
                <span className="tabular">{s.number}</span>
                <span className="max-w-0 overflow-hidden transition-[max-width] duration-500 ease-[var(--ease-cine)] group-hover:max-w-48 group-focus-visible:max-w-48">
                  {t(s.name)}
                </span>
              </a>
            </li>
          ))}
        </ol>
        <span
          className="etiqueta absolute -top-7 -left-3 text-niebla"
          aria-hidden="true"
        >
          17°S
        </span>
        <span
          className="etiqueta absolute -bottom-7 -left-3 text-niebla"
          aria-hidden="true"
        >
          56°S
        </span>
      </div>
    </nav>
  )
}
