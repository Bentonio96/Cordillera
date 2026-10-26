import { COPY } from '../../data/copy'
import { useLanguage } from '../../i18n/useLanguage'

export function Hero() {
  const { t } = useLanguage()
  return (
    <section
      id="inicio"
      data-stage
      aria-labelledby="titulo"
      className="relative flex min-h-[100svh] flex-col justify-end px-4 pt-32 pb-20 md:px-8 md:pb-24"
    >
      <div className="velo-abajo absolute inset-x-0 bottom-0 -z-10 h-[55%] md:hidden" />
      <p className="etiqueta entrada-aparecer text-ocre">
        {t(COPY.hero.eyebrow)}
      </p>
      <h1
        id="titulo"
        className="display mt-4 text-[clamp(3.8rem,13.5vw,11.5rem)] text-nieve"
      >
        <span className="linea-mascara">
          <span className="entrada-subir inline-block">Cordillera</span>
        </span>
      </h1>
      <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <p className="entrada-aparecer max-w-md text-lg leading-relaxed text-niebla md:text-xl">
          {t(COPY.hero.subtitle)}
        </p>
        <p className="etiqueta entrada-aparecer flex items-center gap-3 text-niebla md:mr-16">
          <span className="block h-px w-10 bg-ocre" aria-hidden="true" />
          {t(COPY.hero.cue)}
        </p>
      </div>
    </section>
  )
}
