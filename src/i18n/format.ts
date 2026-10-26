import type { Lang, Localized } from '../types'

/**
 * Number formatting is the part of a bilingual piece that breaks quietly.
 * Spanish writes 2.635 and 4,24; English writes 2,635 and 4.24. Getting this
 * wrong does not throw — it just renders a number that means something else.
 * So every figure in the piece goes through here, including the ones being
 * counted up inside a GSAP tween.
 */
const LOCALES: Record<Lang, string> = {
  es: 'es-CL',
  en: 'en-GB',
}

/** Cached because counters call this on every animation frame. */
const formatterCache = new Map<string, Intl.NumberFormat>()

function getFormatter(lang: Lang, decimals: number): Intl.NumberFormat {
  const key = `${lang}:${decimals}`
  const cached = formatterCache.get(key)
  if (cached) return cached

  const formatter = new Intl.NumberFormat(LOCALES[lang], {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  formatterCache.set(key, formatter)
  return formatter
}

export function formatNumber(value: number, lang: Lang, decimals = 0): string {
  return getFormatter(lang, decimals).format(value)
}

/**
 * Large counts read better in words past a certain size. 25.415.584 is noise;
 * "25 millones" is the point being made.
 *
 * Spanish inflects the noun, so rounding to exactly one has to produce
 * "1 millón" rather than "1 millones" — which is what the VLT's 1.37 million
 * did before this.
 */
export function formatCompact(value: number, lang: Lang): string {
  if (value < 1_000_000) return formatNumber(value, lang)
  const millions = Math.round(value / 1_000_000)
  const formatted = formatNumber(millions, lang)
  if (lang === 'en') return `${formatted} million`
  return `${formatted} ${millions === 1 ? 'millón' : 'millones'}`
}

/** Pick the current language out of a Localized pair. */
export function t(entry: Localized, lang: Lang): string {
  return entry[lang]
}

/**
 * Fill {name} placeholders. Used instead of concatenation because word order
 * differs between the two languages — "3 de 7" and "3 of 7" happen to match,
 * but "{n} veces el ojo humano" and "{n} times a human eye" do not.
 */
export function fill(
  template: string,
  vars: Readonly<Record<string, string | number>>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = vars[key]
    return value === undefined ? match : String(value)
  })
}
