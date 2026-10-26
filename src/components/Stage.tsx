import { useEffect, useRef, useState } from 'react'
import { KEYFRAMES, MARKERS } from '../data/journey'
import { COPY } from '../data/copy'
import { useLanguage } from '../i18n/useLanguage'
import { subscribeJourney } from '../lib/journey-store'
import { useSceneMode } from '../lib/scene-mode'
import type { Quality } from '../scene/types'

/**
 * Low quality on anything that looks like a phone or a modest machine: half
 * the grid resolution, no antialiasing, a lower pixel-ratio cap, and frames
 * only while the camera is actually moving.
 */
function pickQuality(): Quality {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const finePointer = window.matchMedia('(pointer: fine)').matches
  const wide = Math.min(window.innerWidth, window.innerHeight) >= 700
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 8
  return finePointer && wide && cores >= 6 && memory >= 4 ? 'high' : 'low'
}

/** Waits for the page to finish loading and the main thread to go idle. */
function whenIdle(callback: () => void): () => void {
  let cancelled = false
  let idleId = 0
  const schedule = () => {
    if (cancelled) return
    // Safari has no requestIdleCallback; a short timeout is close enough.
    idleId =
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(callback, { timeout: 2500 })
        : globalThis.setTimeout(callback, 400)
  }
  if (document.readyState === 'complete') schedule()
  else window.addEventListener('load', schedule, { once: true })
  return () => {
    cancelled = true
    window.removeEventListener('load', schedule)
    if (typeof window.cancelIdleCallback === 'function')
      window.cancelIdleCallback(idleId)
    globalThis.clearTimeout(idleId)
  }
}

const formatCoord = (value: number, pos: string, neg: string) =>
  `${Math.abs(value).toFixed(2)}°${value < 0 ? neg : pos}`

/**
 * The fixed WebGL layer behind the page, its peak labels and the camera
 * readout. three.js and the elevation grid are fetched only after the page
 * has loaded and gone idle, so they never compete with the first paint.
 */
export function Stage() {
  const { mode, fail } = useSceneMode()
  const { t, n, lang } = useLanguage()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const labelsRef = useRef<(HTMLDivElement | null)[]>([])
  const latRef = useRef<HTMLSpanElement>(null)
  const lonRef = useRef<HTMLSpanElement>(null)
  const altRef = useRef<HTMLSpanElement>(null)
  const [ready, setReady] = useState(false)
  // The readout formats numbers from inside the render loop, which must not
  // restart when the language changes; it reads the language from here.
  const langRef = useRef(lang)
  useEffect(() => {
    langRef.current = lang
  }, [lang])

  useEffect(() => {
    if (mode !== 'relief') return
    const canvas = canvasRef.current
    if (!canvas) return

    let disposed = false
    let handle: import('../scene/relief').ReliefHandle | null = null
    let unsubscribe = () => {}
    let stage = 0

    const onPointer = (event: PointerEvent) => {
      handle?.setPointer(
        (event.clientX / window.innerWidth) * 2 - 1,
        (event.clientY / window.innerHeight) * 2 - 1,
      )
    }

    const cancelIdle = whenIdle(() => {
      void import('../scene/relief')
        .then(({ createRelief }) =>
          createRelief({
            canvas,
            quality: pickQuality(),
            keyframes: KEYFRAMES,
            markers: MARKERS,
            onReadout: (lat, lon, elevation) => {
              if (latRef.current)
                latRef.current.textContent = formatCoord(lat, 'N', 'S')
              if (lonRef.current)
                lonRef.current.textContent = formatCoord(lon, 'E', 'W')
              if (altRef.current)
                altRef.current.textContent = new Intl.NumberFormat(
                  langRef.current === 'es' ? 'es-CL' : 'en-GB',
                ).format(Math.round(elevation / 10) * 10)
            },
            onMarkers: (positions) => {
              positions.forEach((p, i) => {
                const el = labelsRef.current[i]
                const marker = MARKERS[i]
                if (!el || !marker) return
                const near =
                  1 - Math.min(1, Math.abs(stage - marker.section) / 0.55)
                if (!p || near <= 0) {
                  el.style.opacity = '0'
                  return
                }
                // Labels are centred on their peak; fade them out before
                // half a label would leave the screen instead of cutting it.
                const width = el.firstElementChild?.clientWidth ?? 0
                const room = Math.min(p.x, canvas.clientWidth - p.x) - width / 2
                const edge = Math.min(1, Math.max(0, room / 24))
                el.style.opacity = String(near * edge)
                el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`
              })
            },
          }),
        )
        .then((created) => {
          if (disposed) {
            created.dispose()
            return
          }
          handle = created
          unsubscribe = subscribeJourney((value) => {
            stage = value
            created.setStage(value)
          })
          if (window.matchMedia('(pointer: fine)').matches)
            window.addEventListener('pointermove', onPointer, { passive: true })
          setReady(true)
        })
        .catch((error: unknown) => {
          console.warn(
            'Cordillera: relief unavailable, showing posters.',
            error,
          )
          fail()
        })
    })

    return () => {
      disposed = true
      cancelIdle()
      unsubscribe()
      window.removeEventListener('pointermove', onPointer)
      handle?.dispose()
    }
  }, [mode, fail])

  if (mode !== 'relief') return null

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className={`h-full w-full transition-opacity duration-[2400ms] ease-[var(--ease-cine)] ${ready ? 'opacity-100' : 'opacity-0'}`}
      />
      {MARKERS.map((marker, i) => (
        <div
          key={marker.id}
          ref={(el) => {
            labelsRef.current[i] = el
          }}
          className="absolute top-0 left-0 opacity-0 will-change-transform"
        >
          <div className="-translate-x-1/2 -translate-y-full pb-1 text-center">
            <p className="etiqueta whitespace-nowrap text-nieve [text-shadow:0_1px_8px_rgb(0_0_0/0.9)]">
              {marker.name}
            </p>
            <p className="font-mono text-[0.68rem] tabular text-niebla [text-shadow:0_1px_8px_rgb(0_0_0/0.9)]">
              {n(marker.elevation)} m
            </p>
            <span className="mx-auto mt-1 block h-6 w-px bg-glaciar/70" />
          </div>
        </div>
      ))}
      <div
        className={`etiqueta absolute right-20 bottom-8 hidden gap-3 text-niebla transition-opacity duration-1000 amplio:flex ${ready ? 'opacity-100' : 'opacity-0'}`}
        title={t(COPY.readout.label)}
      >
        <span ref={latRef} className="tabular text-nieve">
          20.60°S
        </span>
        <span ref={lonRef} className="tabular">
          69.00°W
        </span>
        <span className="tabular">
          <span ref={altRef}>0</span> m {t(COPY.readout.ground)}
        </span>
      </div>
    </div>
  )
}
