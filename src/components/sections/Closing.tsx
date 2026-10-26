import { useCallback, useRef } from 'react'
import { CITED } from '../../data/citations'
import { COPY } from '../../data/copy'
import { fill } from '../../i18n/format'
import { useReveal } from '../../hooks/useReveal'
import { useLanguage } from '../../i18n/useLanguage'
import { useSceneMode } from '../../lib/scene-mode'
import { EXAGGERATION } from '../../scene/constants'
import { RiseText } from '../RiseText'
import { scrollToTarget } from '../../lib/scroll'

export function Closing() {
  const { t, n } = useLanguage()
  const { mode } = useSceneMode()
  const ref = useRef<HTMLElement>(null)
  const format = useCallback((value: number) => n(value), [n])
  useReveal(ref, format)

  return (
    <section ref={ref} id="cierre" data-stage aria-labelledby="cierre-titulo">
      <div
        className={`relative flex flex-col justify-end px-4 pb-24 md:px-8 ${mode === 'posters' ? 'pt-24' : 'min-h-[150vh]'}`}
      >
        <div className="relative max-w-2xl">
          <div
            aria-hidden="true"
            className="absolute -inset-x-12 -inset-y-16 -z-10 bg-[radial-gradient(closest-side,rgb(10_11_13/0.85),transparent)]"
          />
          <h2
            id="cierre-titulo"
            className="display text-[clamp(2.8rem,7vw,6.4rem)] text-nieve"
          >
            <RiseText text={t(COPY.closing.title)} />
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-niebla md:text-xl">
            {t(COPY.closing.body)}
          </p>
        </div>
      </div>

      <div className="relative border-t border-linea bg-basalto px-4 py-20 md:px-8 md:py-28">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,28rem)_1fr] lg:gap-24">
          <div>
            <h3 className="etiqueta text-ocre">
              {t(COPY.closing.methodTitle)}
            </h3>
            <p className="mt-5 leading-relaxed text-niebla">
              {fill(t(COPY.closing.method), { x: n(EXAGGERATION) })}
            </p>
            <p className="mt-10 text-nieve">{t(COPY.closing.credit)}</p>
            <button
              type="button"
              onClick={() => scrollToTarget(0)}
              className="etiqueta group mt-6 inline-flex min-h-11 cursor-pointer items-center gap-3 text-glaciar"
            >
              <span
                aria-hidden="true"
                className="block h-px w-8 bg-glaciar transition-[width] duration-500 ease-[var(--ease-cine)] group-hover:w-14"
              />
              {t(COPY.closing.back)}
            </button>
          </div>
          <div>
            <h3 className="etiqueta text-ocre">
              {t(COPY.closing.sourcesTitle)}
            </h3>
            <ol className="mt-5 space-y-3 text-sm leading-snug">
              {CITED.map((source) => (
                <li
                  key={source.id}
                  id={`fuente-${source.n}`}
                  className="grid scroll-mt-24 grid-cols-[2.5rem_1fr] text-niebla"
                >
                  <span className="font-mono tabular">[{source.n}]</span>
                  <a
                    href={source.url}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="text-nieve underline decoration-linea underline-offset-4 transition-colors hover:decoration-glaciar"
                  >
                    {source.label}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
