/**
 * Where the reader is in the journey, outside React.
 *
 * The stage value changes on every scroll frame; routing it through React
 * state would re-render the page sixty times a second to move one cursor.
 * Subscribers write to the DOM themselves.
 */

type Listener = (stage: number) => void

let current = 0
const listeners = new Set<Listener>()

export function setJourneyStage(stage: number): void {
  if (stage === current) return
  current = stage
  for (const listener of listeners) listener(stage)
}

export function getJourneyStage(): number {
  return current
}

export function subscribeJourney(listener: Listener): () => void {
  listeners.add(listener)
  listener(current)
  return () => listeners.delete(listener)
}
