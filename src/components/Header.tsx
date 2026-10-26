import { COPY } from '../data/copy'
import { useLanguage } from '../i18n/useLanguage'
import { LANGUAGES } from '../types'
import { scrollToTarget } from '../lib/scroll'

export function Header() {
  const { t, lang, setLang } = useLanguage()

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between bg-[linear-gradient(to_bottom,rgb(10_11_13/0.92),rgb(10_11_13/0.7)_55%,transparent)] px-4 pt-4 pb-8 md:px-8 md:pt-6 md:pb-10">
      <a
        href="#contenido"
        onClick={(event) => {
          event.preventDefault()
          scrollToTarget('#contenido')
          document.getElementById('contenido')?.focus({ preventScroll: true })
        }}
        className="etiqueta sr-only bg-nieve px-3 py-2 text-basalto focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
      >
        {t(COPY.skip)}
      </a>
      <a
        href="#inicio"
        onClick={(event) => {
          event.preventDefault()
          scrollToTarget(0)
        }}
        className="etiqueta text-nieve no-underline"
      >
        Cordillera
      </a>
      <div
        role="group"
        aria-label={t(COPY.language)}
        className="etiqueta flex items-center gap-1 text-niebla"
      >
        {LANGUAGES.map((code) => (
          <button
            key={code}
            type="button"
            lang={code}
            aria-pressed={lang === code}
            onClick={() => setLang(code)}
            className={`min-h-11 min-w-11 cursor-pointer px-2 uppercase transition-colors duration-300 ${lang === code ? 'text-glaciar' : 'hover:text-nieve'}`}
          >
            <span className="md:hidden">{code}</span>
            <span className="hidden md:inline">
              {code === 'es' ? 'Español' : 'English'}
            </span>
          </button>
        ))}
      </div>
    </header>
  )
}
