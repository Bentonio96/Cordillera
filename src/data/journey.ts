import type { Keyframe } from '../scene/types'
import type { Fact, Localized, Marker } from '../types'

/**
 * The journey, north to south. Each entry is one [data-stage] section of the
 * page and one camera keyframe: the camera arrives at a keyframe when that
 * section's text is centred on screen.
 *
 * Chapters carry figures; interludes are the travel between them, one
 * sentence and a distance, so the camera has room to fly.
 */

interface Base {
  readonly id: string
  readonly camera: Keyframe
}

export interface Hero extends Base {
  readonly kind: 'hero'
}

export interface Chapter extends Base {
  readonly kind: 'chapter'
  readonly number: string
  readonly range: string
  readonly name: Localized
  readonly title: Localized
  readonly lede: Localized
  readonly facts: readonly Fact[]
  /** Shaded-relief poster for the reduced-motion and no-WebGL builds. */
  readonly poster: string
  readonly posterAlt: Localized
}

export interface Interlude extends Base {
  readonly kind: 'interlude'
  readonly distanceKm: number
  readonly text: Localized
}

export interface Closing extends Base {
  readonly kind: 'closing'
}

export type Stage = Hero | Chapter | Interlude | Closing

const m = { es: 'm', en: 'm' }
const km2 = { es: 'km²', en: 'km²' }

export const JOURNEY: readonly Stage[] = [
  {
    kind: 'hero',
    id: 'inicio',
    camera: { lat: -20.6, lon: -69.0, distance: 120, pitch: 30, azimuth: 32 },
  },
  {
    kind: 'chapter',
    id: 'altiplano',
    number: '01',
    range: '17°S — 25°S',
    name: { es: 'Atacama y el altiplano', en: 'Atacama and the altiplano' },
    title: { es: 'El techo seco', en: 'The dry roof' },
    lede: {
      es: 'En el norte la cordillera se abre en una meseta sobre los 4.000 metros. Llueve tan poco que la nieve solo se queda en las cumbres más altas, y el agua que baja de los volcanes termina evaporándose en salares.',
      en: 'In the north the range opens into a plateau above 4,000 metres. It rains so little that snow only stays on the highest summits, and the water running off the volcanoes ends up evaporating in salt flats.',
    },
    facts: [
      {
        value: 6336,
        unit: m,
        label: { es: 'Volcán Parinacota', en: 'Parinacota volcano' },
        source: 'gvp-parinacota',
      },
      {
        value: 4544,
        unit: m,
        label: {
          es: 'Altitud del lago Chungará',
          en: 'Altitude of Lake Chungará',
        },
        source: 'chungara',
      },
      {
        text: { es: '1993', en: '1993' },
        label: {
          es: 'Mayor erupción del Láscar, el volcán más activo del norte',
          en: 'Largest eruption of Láscar, the most active volcano in the north',
        },
        source: 'gvp-lascar',
      },
      {
        text: { es: '≈ 2.300 m', en: '≈ 2,300 m' },
        label: {
          es: 'Altitud del Salar de Atacama',
          en: 'Altitude of the Salar de Atacama',
        },
        source: 'salar-atacama',
      },
    ],
    poster: '/relief/altiplano.webp',
    posterAlt: {
      es: 'Relieve sombreado del altiplano chileno: una meseta alta y ocre, con volcanes aislados y salares claros en las cuencas.',
      en: 'Shaded relief of the Chilean altiplano: a high ochre plateau with isolated volcanoes and pale salt flats in the basins.',
    },
    camera: { lat: -22.6, lon: -68.3, distance: 40, pitch: 24, azimuth: 52 },
  },
  {
    kind: 'interlude',
    id: 'hacia-el-salado',
    distanceKm: 500,
    text: {
      es: 'Hacia el sur, la meseta se angosta y las cumbres siguen subiendo.',
      en: 'Further south the plateau narrows and the summits keep climbing.',
    },
    camera: { lat: -25.2, lon: -68.9, distance: 75, pitch: 30, azimuth: 22 },
  },
  {
    kind: 'chapter',
    id: 'ojos-del-salado',
    number: '02',
    range: '27°06′S',
    name: { es: 'Ojos del Salado', en: 'Ojos del Salado' },
    title: { es: 'La cumbre de Chile', en: 'The summit of Chile' },
    lede: {
      es: 'En la frontera con Argentina, el Ojos del Salado es la montaña más alta de Chile y el volcán activo más alto del mundo. Su última erupción conocida fue hacia el año 750; hoy solo respira por sus fumarolas.',
      en: 'On the border with Argentina, Ojos del Salado is the highest mountain in Chile and the highest active volcano on Earth. Its last known eruption was around the year 750; today it only breathes through its fumaroles.',
    },
    facts: [
      {
        value: 6879,
        unit: m,
        label: {
          es: 'Altura según el Smithsonian',
          en: 'Height per the Smithsonian',
        },
        note: {
          es: 'La cifra más citada es 6.893 m; el GVP registra 6.879 m.',
          en: 'The most quoted figure is 6,893 m; the GVP records 6,879 m.',
        },
        source: 'gvp-ojos',
      },
      {
        text: { es: '≈ 750 d. C.', en: '≈ 750 CE' },
        label: {
          es: 'Última erupción conocida (± 250 años)',
          en: 'Last known eruption (± 250 years)',
        },
        source: 'gvp-ojos',
      },
      {
        text: { es: '≈ 6.000 m', en: '≈ 6,000 m' },
        label: {
          es: 'Línea de nieve hacia los 28°S, la más alta de los Andes',
          en: 'Snowline near 28°S, the highest in the Andes',
        },
        source: 'snowline',
      },
    ],
    poster: '/relief/ojos-del-salado.webp',
    posterAlt: {
      es: 'Relieve sombreado del macizo del Ojos del Salado: cumbres nevadas aisladas sobre un desierto de altura.',
      en: 'Shaded relief of the Ojos del Salado massif: isolated snowy summits over a high desert.',
    },
    camera: { lat: -27.15, lon: -68.62, distance: 24, pitch: 17, azimuth: 68 },
  },
  {
    kind: 'interlude',
    id: 'hacia-el-sur',
    distanceKm: 1370,
    text: {
      es: 'Mil trescientos kilómetros más al sur, la cordillera baja y empieza a llover.',
      en: 'Thirteen hundred kilometres further south, the range drops and the rain begins.',
    },
    camera: { lat: -33.6, lon: -70.2, distance: 85, pitch: 32, azimuth: 30 },
  },
  {
    kind: 'chapter',
    id: 'volcanes',
    number: '03',
    range: '39°S — 41°S',
    name: { es: 'Villarrica y Osorno', en: 'Villarrica and Osorno' },
    title: { es: 'Fuego bajo la nieve', en: 'Fire under snow' },
    lede: {
      es: 'En el sur los volcanes se levantan solos sobre bosques y lagos: conos casi perfectos, cubiertos de glaciar. El Villarrica, con un lago de lava en su cráter, encabeza el ranking de peligrosidad de SERNAGEOMIN.',
      en: 'In the south the volcanoes rise alone over forests and lakes: near-perfect cones capped with glacier. Villarrica, with a lava lake in its crater, tops SERNAGEOMIN’s hazard ranking.',
    },
    facts: [
      {
        value: 2847,
        unit: m,
        label: { es: 'Volcán Villarrica', en: 'Villarrica volcano' },
        source: 'gvp-villarrica',
      },
      {
        text: { es: '≈ 1,5 km', en: '≈ 1.5 km' },
        label: {
          es: 'Altura de la fuente de lava del 3 de marzo de 2015',
          en: 'Height of the lava fountain on 3 March 2015',
        },
        source: 'villarrica-2015',
      },
      {
        text: { es: '1869', en: '1869' },
        label: {
          es: 'Última erupción del Osorno (2.659 m)',
          en: 'Last eruption of Osorno (2,659 m)',
        },
        source: 'gvp-osorno',
      },
      {
        value: 87,
        label: {
          es: 'Sistemas volcánicos activos en Chile (2023)',
          en: 'Active volcanic systems in Chile (2023)',
        },
        source: 'rnvv',
      },
    ],
    poster: '/relief/volcanes.webp',
    posterAlt: {
      es: 'Relieve sombreado de la zona de lagos: conos volcánicos nevados separados por valles verdes.',
      en: 'Shaded relief of the lake district: snow-capped volcanic cones separated by green valleys.',
    },
    camera: { lat: -40.1, lon: -72.2, distance: 32, pitch: 20, azimuth: 62 },
  },
  {
    kind: 'interlude',
    id: 'hacia-el-hielo',
    distanceKm: 1060,
    text: {
      es: 'Más abajo el valle central se hunde en el mar, y la cordillera queda sola frente al Pacífico.',
      en: 'Further down the central valley sinks into the sea, and the range is left alone facing the Pacific.',
    },
    camera: { lat: -45.6, lon: -73.0, distance: 80, pitch: 34, azimuth: 24 },
  },
  {
    kind: 'chapter',
    id: 'patagonia',
    number: '04',
    range: '48°S — 52°S',
    name: { es: 'Campos de hielo y Paine', en: 'Ice fields and Paine' },
    title: { es: 'El hielo', en: 'The ice' },
    lede: {
      es: 'Al final del continente la cordillera sostiene el Campo de Hielo Sur, la mayor masa de hielo del hemisferio sur fuera de la Antártica. En su borde oriental se levantan las Torres del Paine.',
      en: 'At the end of the continent the range holds up the Southern Patagonian Ice Field, the largest mass of ice in the Southern Hemisphere outside Antarctica. On its eastern edge rise the Torres del Paine.',
    },
    facts: [
      {
        text: { es: '≈ 13.000 km²', en: '≈ 13,000 km²' },
        label: {
          es: 'Campo de Hielo Sur',
          en: 'Southern Patagonian Ice Field',
        },
        source: 'ice-fields',
      },
      {
        value: 1265,
        unit: km2,
        label: {
          es: 'Glaciar Pío XI, el más grande del campo',
          en: 'Pío XI glacier, the largest in the field',
        },
        source: 'ice-fields',
      },
      {
        value: 26169,
        label: {
          es: 'Glaciares inventariados en Chile (DGA, 2022)',
          en: 'Glaciers inventoried in Chile (DGA, 2022)',
        },
        source: 'dga-2022',
      },
      {
        text: { es: '≈ 2.884 m', en: '≈ 2,884 m' },
        label: {
          es: 'Paine Grande, la cumbre del macizo',
          en: 'Paine Grande, the summit of the massif',
        },
        note: {
          es: 'Medición GPS de 2011; CONAF aún publica 3.050 m.',
          en: 'GPS survey, 2011; CONAF still publishes 3,050 m.',
        },
        source: 'paine-grande',
      },
    ],
    poster: '/relief/patagonia.webp',
    posterAlt: {
      es: 'Relieve sombreado de la Patagonia austral: una franja continua de hielo blanco entre los fiordos y la estepa.',
      en: 'Shaded relief of southern Patagonia: a continuous strip of white ice between the fjords and the steppe.',
    },
    camera: { lat: -50.4, lon: -73.3, distance: 40, pitch: 24, azimuth: 48 },
  },
  {
    kind: 'closing',
    id: 'cierre',
    camera: { lat: -37.5, lon: -70.8, distance: 330, pitch: 68, azimuth: 168 },
  },
]

export const KEYFRAMES: readonly Keyframe[] = JOURNEY.map((s) => s.camera)

export const CHAPTERS = JOURNEY.filter(
  (s): s is Chapter => s.kind === 'chapter',
)

export const stageIndex = (id: string) => JOURNEY.findIndex((s) => s.id === id)

/** Labels drawn over the relief. Elevations from the GVP unless noted. */
export const MARKERS: readonly Marker[] = [
  {
    id: 'parinacota',
    name: 'Parinacota',
    lat: -18.166,
    lon: -69.142,
    elevation: 6336,
    section: 1,
  },
  {
    id: 'licancabur',
    name: 'Licancabur',
    lat: -22.83,
    lon: -67.88,
    elevation: 5916,
    section: 1,
  },
  {
    id: 'lascar',
    name: 'Láscar',
    lat: -23.37,
    lon: -67.73,
    elevation: 5592,
    section: 1,
  },
  {
    id: 'ojos',
    name: 'Ojos del Salado',
    lat: -27.109,
    lon: -68.541,
    elevation: 6879,
    section: 3,
  },
  {
    id: 'villarrica',
    name: 'Villarrica',
    lat: -39.42,
    lon: -71.93,
    elevation: 2847,
    section: 5,
  },
  {
    id: 'osorno',
    name: 'Osorno',
    lat: -41.1,
    lon: -72.493,
    elevation: 2659,
    section: 5,
  },
  {
    id: 'paine',
    name: 'Paine Grande',
    lat: -50.99,
    lon: -73.1,
    elevation: 2884,
    section: 7,
  },
]
