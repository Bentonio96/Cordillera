import { useCallback, useRef } from 'react'
import { COPY } from '../../data/copy'
import type { Interlude as InterludeData } from '../../data/journey'
import { fill } from '../../i18n/format'
import { useReveal } from '../../hooks/useReveal'
import { useLanguage } from '../../i18n/useLanguage'
import { useSceneMode } from '../../lib/scene-mode'
import { RiseText } from '../RiseText'

/** One sentence and a distance: the flight between two chapters. */
export function Interlude({ interlude }: { interlude: InterludeData }) {
  const { t, n } = useLanguage()
  const { mode } = useSceneMode()
  const ref = useRef<HTMLElement>(null)
  const format = useCallback((value: number) => n(value), [n])
  useReveal(ref, format)

  return (
    <section
      ref={ref}
      id={interlude.id}
      data-stage
      className={`relative flex items-center justify-center px-4 md:px-8 ${mode === 'posters' ? 'py-24' : 'min-h-[130vh]'}`}
    >
      <div className="relative max-w-3xl text-center">
        <div
          aria-hidden="true"
          className="absolute -inset-x-16 -inset-y-20 -z-10 bg-[radial-gradient(closest-side,rgb(10_11_13/0.82),transparent)]"
        />
        <p className="etiqueta text-ocre tabular">
          ≈ {fill(t(COPY.south), { km: n(interlude.distanceKm) })}
        </p>
        <p className="display mt-5 text-[clamp(1.9rem,4.2vw,3.6rem)] leading-[1.05] text-nieve">
          <RiseText text={t(interlude.text)} />
        </p>
      </div>
    </section>
  )
}
