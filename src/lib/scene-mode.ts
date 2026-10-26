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

export function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return canvas.getContext('webgl2') !== null
  } catch {
    return false
  }
}
