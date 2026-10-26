import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'
import { Header } from './components/Header'
import { LatitudeRail } from './components/LatitudeRail'
import { SmoothScroll } from './components/SmoothScroll'
import { Stage } from './components/Stage'
import { Chapter } from './components/sections/Chapter'
import { Closing } from './components/sections/Closing'
import { Hero } from './components/sections/Hero'
import { Interlude } from './components/sections/Interlude'
import { COPY } from './data/copy'
import { JOURNEY } from './data/journey'
import { useJourneyTracker } from './hooks/useJourneyTracker'
import { useReducedMotion } from './hooks/useMediaQuery'
import { LanguageProvider } from './i18n/LanguageProvider'
import { useLanguage } from './i18n/useLanguage'
import { SceneModeContext, webglAvailable } from './lib/scene-mode'

const noSubscription = () => () => {}

function Journey() {
  const { t } = useLanguage()
  const reduced = useReducedMotion()
  const [failed, setFailed] = useState(false)
  const fail = useCallback(() => setFailed(true), [])
  const supported = useSyncExternalStore(
    noSubscription,
    webglAvailable,
    () => true,
  )
  const mode = reduced || failed || !supported ? 'posters' : 'relief'
  const scene = useMemo(() => ({ mode, fail }) as const, [mode, fail])
  useJourneyTracker()

  useEffect(() => {
    document.title = t(COPY.meta.title)
  }, [t])

  return (
    <SceneModeContext value={scene}>
      <div className="cielo fixed inset-0 -z-10" aria-hidden="true" />
      <Stage />
      <Header />
      <LatitudeRail />
      <main
        id="contenido"
        tabIndex={-1}
        className="relative z-10 focus:outline-none"
      >
        {mode === 'posters' && <p className="sr-only">{t(COPY.posterNote)}</p>}
        {JOURNEY.map((stage) => {
          switch (stage.kind) {
            case 'hero':
              return <Hero key={stage.id} />
            case 'chapter':
              return <Chapter key={stage.id} chapter={stage} />
            case 'interlude':
              return <Interlude key={stage.id} interlude={stage} />
            case 'closing':
              return <Closing key={stage.id} />
          }
        })}
      </main>
    </SceneModeContext>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <SmoothScroll>
        <Journey />
      </SmoothScroll>
    </LanguageProvider>
  )
}
