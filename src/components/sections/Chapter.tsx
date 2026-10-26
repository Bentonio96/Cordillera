import { useCallback, useRef } from 'react'
import { citationNumber } from '../../data/citations'
import { COPY } from '../../data/copy'
import type { Chapter as ChapterData } from '../../data/journey'
import { SOURCES } from '../../data/sources'
import { useReveal } from '../../hooks/useReveal'
import { useLanguage } from '../../i18n/useLanguage'
import { useSceneMode } from '../../lib/scene-mode'
import { RiseText } from '../RiseText'

export function Chapter({ chapter }: { chapter: ChapterData }) {
  const { t, n } = useLanguage()
  const { mode } = useSceneMode()
  const ref = useRef<HTMLElement>(null)
  const format = useCallback((value: number) => n(value), [n])
  useReveal(ref, format)

  const posters = mode === 'posters'
  const titleId = `${chapter.id}-titulo`

  const body = (
    <div className="max-w-[36rem]">
      <p className="etiqueta flex items-center gap-3 text-ocre">
        <span className="tabular">{chapter.number}</span>
        <span data-rule className="block h-px w-8 bg-ocre" aria-hidden="true" />
        <span>{t(chapter.name)}</span>
      </p>
      <h2
        id={titleId}
        className="display mt-5 text-[clamp(2.6rem,6vw,5.6rem)] text-nieve"
      >
        <RiseText text={t(chapter.title)} />
      </h2>
      <p className="mt-6 text-[1.05rem] leading-relaxed text-niebla md:text-lg">
        {t(chapter.lede)}
      </p>
      <p className="etiqueta mt-6 text-niebla tabular">{chapter.range}</p>

      <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
        {chapter.facts.map((fact, index) => {
          const ref = citationNumber(fact.source)
          return (
            <div key={`${fact.source}-${index}`} className="relative pt-4">
              <span
                data-rule
                aria-hidden="true"
                className="absolute inset-x-0 top-0 block h-px bg-linea"
              />
              <dt className="text-sm leading-snug text-niebla">
                {t(fact.label)}
              </dt>
              <dd className="mt-2 flex items-baseline gap-1 text-[clamp(1.7rem,2.6vw,2.4rem)] font-light tracking-tight text-nieve tabular">
                {fact.value !== undefined ? (
                  <>
                    <span aria-hidden="true" data-count={fact.value}>
                      {n(fact.value)}
                    </span>
                    <span className="sr-only">{n(fact.value)}</span>
                    {fact.unit && (
                      <span className="text-[0.6em] text-niebla">
                        {t(fact.unit)}
                      </span>
                    )}
                  </>
                ) : (
                  <span>{fact.text && t(fact.text)}</span>
                )}
                <a
                  href={`#fuente-${ref}`}
                  aria-label={`${t(COPY.source)} ${ref}: ${SOURCES[fact.source].label}`}
                  className="ml-1 inline-flex min-h-6 min-w-6 items-center justify-center self-start font-mono text-[0.62rem] text-glaciar no-underline hover:underline"
                >
                  [{ref}]
                </a>
              </dd>
              {fact.note && (
                <dd className="mt-1 text-xs leading-snug text-niebla">
                  {t(fact.note)}
                </dd>
              )}
            </div>
          )
        })}
      </dl>
    </div>
  )

  if (posters) {
    return (
      <section
        ref={ref}
        id={chapter.id}
        data-stage
        aria-labelledby={titleId}
        className="relative grid items-center gap-10 px-4 py-24 md:px-8 lg:grid-cols-[minmax(0,36rem)_1fr] lg:gap-16 lg:py-32 lg:pr-24"
      >
        {body}
        <figure className="m-0">
          <img
            src={chapter.poster}
            alt={t(chapter.posterAlt)}
            width={960}
            height={768}
            loading="lazy"
            decoding="async"
            className="h-auto w-full rounded-[2px] border border-linea"
          />
          <figcaption className="etiqueta mt-3 text-niebla">
            {chapter.range} · SRTM / GMTED2010
          </figcaption>
        </figure>
      </section>
    )
  }

  return (
    <section
      ref={ref}
      id={chapter.id}
      data-stage
      aria-labelledby={titleId}
      className="relative min-h-[160vh] amplio:min-h-[190vh]"
    >
      <div className="relative px-4 pt-[64vh] pb-24 md:px-8 amplio:sticky amplio:top-0 amplio:flex amplio:h-screen amplio:items-center amplio:pt-0 amplio:pb-0">
        <div
          aria-hidden="true"
          className="velo-abajo absolute inset-x-0 top-[48vh] bottom-0 -z-10 amplio:hidden"
        />
        <div
          aria-hidden="true"
          className="velo-izq absolute inset-y-0 left-0 -z-10 hidden w-[62%] amplio:block"
        />
        {body}
      </div>
    </section>
  )
}
