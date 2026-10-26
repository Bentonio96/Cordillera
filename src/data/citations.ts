import { CHAPTERS } from './journey'
import { SOURCES, type SourceId } from './sources'

/**
 * Sources numbered by first appearance, chapter by chapter, then the terrain
 * data cited in the closing. A figure's [n] and the list entry it points to
 * come from the same array, so they cannot disagree.
 */
const ORDER: SourceId[] = []
for (const chapter of CHAPTERS)
  for (const fact of chapter.facts)
    if (!ORDER.includes(fact.source)) ORDER.push(fact.source)
for (const id of [
  'chile-length',
  'conaf',
  'terrain-tiles',
  'terrain-attribution',
] as const)
  if (!ORDER.includes(id)) ORDER.push(id)

export const CITED = ORDER.map((id, i) => ({ ...SOURCES[id], n: i + 1 }))

export const citationNumber = (id: SourceId) => ORDER.indexOf(id) + 1
