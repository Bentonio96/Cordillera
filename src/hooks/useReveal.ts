import { useEffect, useRef, type RefObject } from 'react'
import { MQ, ScrollTrigger, gsap, useGSAP } from '../lib/gsap'

/**
 * Entrance choreography shared by every section, declared once:
 *   [data-rise]  words rise out of their line mask, staggered 70 ms
 *   [data-rule]  hairlines draw from the left
 *   [data-count] figures count up to their value, in the active locale
 *
 * Transform only, never opacity on text: content waiting below the fold is
 * fully opaque, so contrast audits and readers without JS see it as is.
 * Under reduced motion none of this is created.
 */
export function useReveal(
  scope: RefObject<HTMLElement | null>,
  format: (value: number) => string,
) {
  // Read through a ref: switching language must not tear down and rebuild
  // the timelines (that left already-played reveals stuck at their start).
  const formatRef = useRef(format)
  useEffect(() => {
    formatRef.current = format
  }, [format])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const root = scope.current
        if (!root) return
        const trigger = { trigger: root, start: 'top 72%', once: true }

        const words = root.querySelectorAll('[data-rise]')
        if (words.length)
          gsap.from(words, {
            yPercent: 140,
            rotate: 2,
            duration: 1.4,
            stagger: 0.07,
            scrollTrigger: trigger,
          })

        const rules = root.querySelectorAll('[data-rule]')
        if (rules.length)
          gsap.from(rules, {
            scaleX: 0,
            transformOrigin: 'left center',
            duration: 1.6,
            stagger: 0.08,
            scrollTrigger: trigger,
          })

        root.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
          const target = Number(el.dataset.count)
          const state = { value: 0 }
          // Write to React's own text node, not textContent: React keeps a
          // reference to it and updates it when the language changes.
          const text = el.firstChild
          if (!(text instanceof Text)) return
          const write = (value: number) => {
            text.nodeValue = formatRef.current(value)
          }
          write(0)
          gsap.to(state, {
            value: target,
            duration: 2.2,
            ease: 'power3.out',
            scrollTrigger: trigger,
            onUpdate: () => write(Math.round(state.value)),
            onComplete: () => write(target),
          })
        })
        ScrollTrigger.refresh()
      })
      return () => mm.revert()
    },
    { scope },
  )
}
