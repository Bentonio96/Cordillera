/**
 * Shared domain types.
 *
 * Every user-visible string is a `Localized` pair declared side by side, so a
 * missing translation is a type error. Every figure carries the id of its
 * `Source`; the closing credits are generated from those records.
 */

import type { SourceId } from './data/sources'

export const LANGUAGES = ['es', 'en'] as const
export type Lang = (typeof LANGUAGES)[number]

export type Localized = { readonly [K in Lang]: string }

export interface Source {
  readonly id: string
  readonly label: string
  readonly url: string
}

export interface Fact {
  /** Numeric value, formatted per locale; text facts leave it out. */
  readonly value?: number
  readonly decimals?: number
  /** Unit or suffix after the number, e.g. "m", "km²". */
  readonly unit?: Localized
  /** Used instead of value when the figure is not a single number. */
  readonly text?: Localized
  readonly label: Localized
  /** A caveat shown under the figure, e.g. where sources disagree. */
  readonly note?: Localized
  readonly source: SourceId
}

export interface Marker {
  readonly id: string
  readonly name: string
  readonly lat: number
  readonly lon: number
  /** Cited elevation in metres, shown on the label. */
  readonly elevation: number
  /** Index of the section where this label is shown. */
  readonly section: number
}
