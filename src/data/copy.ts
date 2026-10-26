import type { Localized } from '../types'

/** Interface strings. Chapter prose lives with its data in journey.ts. */
export const COPY = {
  meta: {
    title: {
      es: 'Cordillera — Los Andes de Chile, de norte a sur',
      en: 'Cordillera — The Chilean Andes, north to south',
    },
  },
  skip: { es: 'Saltar al contenido', en: 'Skip to content' },
  language: { es: 'Idioma', en: 'Language' },
  chaptersNav: { es: 'Capítulos', en: 'Chapters' },
  hero: {
    eyebrow: {
      es: '17°S — 56°S · relieve real',
      en: '17°S — 56°S · real terrain',
    },
    subtitle: {
      es: 'Los Andes de Chile, de norte a sur. Un vuelo sobre el relieve real, del altiplano al hielo.',
      en: 'The Chilean Andes, north to south. A flight over the real terrain, from the altiplano to the ice.',
    },
    cue: { es: 'Desliza hacia el sur', en: 'Scroll south' },
  },
  readout: {
    label: { es: 'Posición de la cámara', en: 'Camera position' },
    ground: { es: 'suelo', en: 'ground' },
  },
  south: { es: '{km} km al sur', en: '{km} km south' },
  source: { es: 'Fuente', en: 'Source' },
  closing: {
    title: { es: 'Una sola línea', en: 'One line' },
    body: {
      es: 'Vista desde arriba, la cordillera es la columna de Chile: decide dónde llueve, dónde hay agua y dónde se puede vivir. De la frontera con Perú al Cabo de Hornos son 4.270 kilómetros, y en todos está ella.',
      en: 'Seen from above, the range is the spine of Chile: it decides where it rains, where there is water and where people can live. From the Peruvian border to Cape Horn it is 4,270 kilometres, and it is there for all of them.',
    },
    methodTitle: { es: 'Sobre el relieve', en: 'About the terrain' },
    method: {
      es: 'El relieve es real: datos de elevación SRTM, GMTED2010 y ETOPO1 servidos como AWS Terrain Tiles, reducidos a una grilla de 4,4 km (8,8 km en celulares) y con la altura exagerada {x} veces para que la cordillera se lea desde lejos. Las cifras de la página vienen de las fuentes citadas, no del modelo.',
      en: 'The terrain is real: SRTM, GMTED2010 and ETOPO1 elevation data served as AWS Terrain Tiles, reduced to a 4.4 km grid (8.8 km on phones) with height exaggerated {x} times so the range reads from a distance. The figures on the page come from the cited sources, not from the model.',
    },
    sourcesTitle: { es: 'Fuentes', en: 'Sources' },
    credit: {
      es: 'Un proyecto de Benjamín Peña.',
      en: 'A project by Benjamín Peña.',
    },
    back: { es: 'Volver al norte', en: 'Back to the north' },
  },
  posterNote: {
    es: 'Movimiento reducido: el relieve se muestra como mapas sombreados fijos.',
    en: 'Reduced motion: the terrain is shown as still shaded-relief maps.',
  },
} as const satisfies Record<string, Localized | Record<string, Localized>>
