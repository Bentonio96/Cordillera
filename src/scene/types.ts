export type Quality = 'high' | 'low'

/** A camera position, in geography rather than scene units. */
export interface Keyframe {
  readonly lat: number
  readonly lon: number
  /** Scene units (tens of km) from the point looked at. */
  readonly distance: number
  /** Degrees above the horizon. */
  readonly pitch: number
  /** Degrees; 0 looks south from the north, 90 looks west from the east. */
  readonly azimuth: number
}

export interface ReliefMeta {
  readonly latNorth: number
  readonly latSouth: number
  readonly lonCentre: number
  readonly halfWidthKm: number
  readonly grids: Readonly<
    Record<string, { w: number; h: number; kmPerPx: number }>
  >
}
