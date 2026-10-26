import type { Source } from '../types'

/**
 * Every source the piece cites. Figures reference these by id; the closing
 * numbers them in order of first appearance, so the credits cannot drift
 * from the data.
 *
 * Note on Smithsonian GVP: elevations come from the GVP database (Volcanoes
 * of the World), which sometimes differs from survey heights; where it
 * matters the figure says so on the page.
 */
export const SOURCES = {
  'gvp-parinacota': {
    id: 'gvp-parinacota',
    label: 'Smithsonian Global Volcanism Program — Parinacota (355012)',
    url: 'https://volcano.si.edu/volcano.cfm?vn=355012',
  },
  chungara: {
    id: 'chungara',
    label: 'Herrera et al. (2006), Andean Geology 33(2) — Lago Chungará',
    url: 'https://www.redalyc.org/pdf/1739/173918421005.pdf',
  },
  'gvp-lascar': {
    id: 'gvp-lascar',
    label: 'Smithsonian Global Volcanism Program — Láscar (355100)',
    url: 'https://volcano.si.edu/volcano.cfm?vn=355100',
  },
  'gvp-licancabur': {
    id: 'gvp-licancabur',
    label: 'Smithsonian Global Volcanism Program — Licancabur (355092)',
    url: 'https://volcano.si.edu/volcano.cfm?vn=355092',
  },
  'salar-atacama': {
    id: 'salar-atacama',
    label: 'Copernicus — Salar de Atacama',
    url: 'https://www.copernicus.eu/en/node/5934',
  },
  'gvp-ojos': {
    id: 'gvp-ojos',
    label: 'Smithsonian Global Volcanism Program — Ojos del Salado (355130)',
    url: 'https://volcano.si.edu/volcano.cfm?vn=355130',
  },
  snowline: {
    id: 'snowline',
    label:
      'Condom et al. (2007), Global and Planetary Change 59 — snowline in the Andes',
    url: 'https://app.ingemmet.gob.pe/biblioteca/pdf/Amb-82.pdf',
  },
  'gvp-villarrica': {
    id: 'gvp-villarrica',
    label: 'Smithsonian Global Volcanism Program — Villarrica (357120)',
    url: 'https://volcano.si.edu/volcano.cfm?vn=357120',
  },
  'villarrica-2015': {
    id: 'villarrica-2015',
    label:
      'Romero et al. (2018), Frontiers in Earth Science — Villarrica, 3 March 2015',
    url: 'https://www.frontiersin.org/journals/earth-science/articles/10.3389/feart.2018.00098/full',
  },
  'gvp-osorno': {
    id: 'gvp-osorno',
    label: 'Smithsonian Global Volcanism Program — Osorno (358010)',
    url: 'https://volcano.si.edu/volcano.cfm?vn=358010',
  },
  rnvv: {
    id: 'rnvv',
    label:
      'SERNAGEOMIN, ranking de peligrosidad 2023 (vía The Clinic, 16-10-2023)',
    url: 'https://www.theclinic.cl/2023/10/16/entregan-ranking-de-los-volcanes-mas-peligrosos-de-chile-villarrica-encabeza-la-lista/',
  },
  'ice-fields': {
    id: 'ice-fields',
    label: 'Casassa y Rivera (2002) — Campos de Hielo Patagónicos',
    url: 'https://glaciologia.cl/wp-content/uploads/2020/08/Casassa_Rivera2002.pdf',
  },
  'dga-2022': {
    id: 'dga-2022',
    label: 'DGA, Inventario Público de Glaciares 2022 (vía Glaciares Chilenos)',
    url: 'https://www.glaciareschilenos.org/en/?p=21488',
  },
  'paine-grande': {
    id: 'paine-grande',
    label: 'Cordillera Paine — Paine Grande, medición GPS 2011',
    url: 'https://en.wikipedia.org/wiki/Cordillera_Paine',
  },
  conaf: {
    id: 'conaf',
    label: 'CONAF — Parque Nacional Torres del Paine',
    url: 'https://www.conaf.cl/parques/parque-nacional-torres-del-paine/',
  },
  'chile-length': {
    id: 'chile-length',
    label: 'Memoria Chilena — Territorio de Chile',
    url: 'https://www.memoriachilena.gob.cl/602/w3-article-94271.html',
  },
  'terrain-tiles': {
    id: 'terrain-tiles',
    label:
      'AWS Terrain Tiles (Mapzen/Tilezen): SRTM, GMTED2010, ETOPO1 y otras',
    url: 'https://registry.opendata.aws/terrain-tiles/',
  },
  'terrain-attribution': {
    id: 'terrain-attribution',
    label: 'Tilezen Joerd — atribución de los datos de elevación',
    url: 'https://github.com/tilezen/joerd/blob/master/docs/attribution.md',
  },
} as const satisfies Record<string, Source>

export type SourceId = keyof typeof SOURCES
