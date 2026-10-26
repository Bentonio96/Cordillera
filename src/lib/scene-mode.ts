import { createContext, use } from 'react'

/**
 * 'relief' runs the WebGL flight; 'posters' shows still shaded-relief maps
 * inside each chapter instead. Posters are the reduced-motion build and also
 * the fallback when WebGL is missing or the scene fails to load — the same
 * content either way, never a blank.
 */
export type SceneMode = 'relief' | 'posters'

export const SceneModeContext = createContext<{
  mode: SceneMode
  fail: () => void
}>({ mode: 'posters', fail: () => {} })

export const useSceneMode = () => use(SceneModeContext)

let webgl: boolean | null = null

/** Probed once; the prerendered HTML assumes it is there. */
export function webglAvailable(): boolean {
  if (typeof document === 'undefined') return true
  if (webgl === null) {
    try {
      webgl = document.createElement('canvas').getContext('webgl2') !== null
    } catch {
      webgl = false
    }
  }
  return webgl
}
