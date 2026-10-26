import { useEffect } from 'react'
import { ScrollTrigger } from '../lib/gsap'
import { setJourneyStage } from '../lib/journey-store'

/**
 * Turns scroll position into a continuous stage value: 0 at the top, 1 when
 * the second [data-stage] section is centred in the viewport, and so on, with
 * linear interpolation between. Sections can be any height; the camera
 * always arrives at a keyframe exactly when its text is centred.
 *
 * Anchors are measured on every ScrollTrigger refresh (resize, fonts, lazy
 * content), never per frame.
 */
export function useJourneyTracker(): void {
  useEffect(() => {
    let anchors: number[] = []

    const measure = () => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>('[data-stage]'),
      )
      const max = ScrollTrigger.maxScroll(window)
      const vh = window.innerHeight
      anchors = sections.map((el, i) => {
        if (i === 0) return 0
        const rect = el.getBoundingClientRect()
        const top = rect.top + window.scrollY
        const centre = top + Math.min(rect.height, vh * 1.4) / 2 - vh / 2
        return Math.min(max, Math.max(0, centre))
      })
      // Anchors must increase; a short last section clamped to max scroll
      // could otherwise tie with the one before it.
      for (let i = 1; i < anchors.length; i++) {
        const prev = anchors[i - 1] ?? 0
        if ((anchors[i] ?? 0) <= prev) anchors[i] = prev + 1
      }
    }

    const update = (scroll: number) => {
      if (anchors.length < 2) return
      let i = 0
      while (i < anchors.length - 2 && scroll > (anchors[i + 1] ?? 0)) i++
      const a = anchors[i] ?? 0
      const b = anchors[i + 1] ?? a + 1
      const t = Math.min(1, Math.max(0, (scroll - a) / (b - a)))
      setJourneyStage(i + t)
    }

    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onRefresh: (self) => {
        measure()
        update(self.scroll())
      },
      onUpdate: (self) => update(self.scroll()),
    })
    measure()
    update(window.scrollY)

    return () => trigger.kill()
  }, [])
}
