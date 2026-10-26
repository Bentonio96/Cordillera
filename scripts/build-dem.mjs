/**
 * Builds the relief data the page ships with, from real elevation tiles.
 *
 * Source: AWS Terrain Tiles (Mapzen "terrarium" encoding), open data
 * assembled from SRTM, GMTED2010 and ETOPO1 among others. Tiles are fetched
 * at zoom 7 (~1.2 km per pixel at these latitudes) and cached locally, then
 * resampled into one north–south strip of continental Chile in a local
 * kilometre grid: rows are latitude, columns are kilometres east or west of
 * 71°W measured at that row's latitude, so the country keeps its real shape
 * instead of the stretch an equirectangular raster gives Patagonia.
 *
 * Outputs (all in public/relief/):
 *   dem-<w>.bin      Uint16 little-endian heights in metres, 0 = sea
 *   meta.json        grid size, bounds, km per pixel
 *   *.webp           shaded-relief posters for the reduced-motion build
 *
 * Usage: node scripts/build-dem.mjs [cacheDir]
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const CACHE = path.resolve(process.argv[2] ?? '.cache/dem')
const OUT = path.resolve('public/relief')
const ZOOM = 7
const TILE = 256

// The strip: from Visviri to Cape Horn, ±560 km either side of 71°W.
const LAT_N = -17.4
const LAT_S = -56.0
const LON_C = -71
const HALF_WIDTH_KM = 560
const KM_PER_DEG = 111.32

// Master grid used for the posters; the shipped meshes are downsampled.
const MASTER_W = 512
const MASTER_H = Math.round(
  (MASTER_W * ((LAT_N - LAT_S) * KM_PER_DEG)) / (HALF_WIDTH_KM * 2),
)

const lonToX = (lon, z = ZOOM) => ((lon + 180) / 360) * 2 ** z
const latToY = (lat, z = ZOOM) => {
  const r = (lat * Math.PI) / 180
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z
}

const tiles = new Map()

async function loadTile(z, tx, ty) {
  const key = `${z}/${tx}/${ty}`
  if (tiles.has(key)) return tiles.get(key)
  const file = path.join(CACHE, `${z}-${tx}-${ty}.png`)
  if (!existsSync(file)) {
    const url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${tx}/${ty}.png`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`${url}: ${res.status}`)
    await writeFile(file, Buffer.from(await res.arrayBuffer()))
  }
  const { data } = await sharp(await readFile(file))
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const heights = new Float32Array(TILE * TILE)
  for (let i = 0; i < heights.length; i++) {
    // Terrarium: (R * 256 + G + B / 256) - 32768
    heights[i] =
      data[i * 3] * 256 + data[i * 3 + 1] + data[i * 3 + 2] / 256 - 32768
  }
  tiles.set(key, heights)
  return heights
}

/** Fetches every tile covering a lat/lon box at zoom z. */
async function preload(z, lonW, lonE, latN, latS) {
  const x0 = Math.floor(lonToX(lonW, z))
  const x1 = Math.floor(lonToX(lonE, z))
  const y0 = Math.floor(latToY(latN, z))
  const y1 = Math.floor(latToY(latS, z))
  const jobs = []
  for (let ty = y0; ty <= y1; ty++)
    for (let tx = x0; tx <= x1; tx++) jobs.push([tx, ty])
  // Small batches: be polite to the bucket.
  for (let i = 0; i < jobs.length; i += 8)
    await Promise.all(jobs.slice(i, i + 8).map(([x, y]) => loadTile(z, x, y)))
  console.log(`zoom ${z}: ${jobs.length} tiles`)
}

function sample(lon, lat, z = ZOOM) {
  const px = lonToX(lon, z) * TILE
  const py = latToY(lat, z) * TILE
  const fx = Math.floor(px)
  const fy = Math.floor(py)
  const at = (x, y) => {
    const t = tiles.get(`${z}/${Math.floor(x / TILE)}/${Math.floor(y / TILE)}`)
    if (!t) return 0
    return t[(y % TILE) * TILE + (x % TILE)]
  }
  const tx = px - fx
  const ty = py - fy
  const a = at(fx, fy) * (1 - tx) + at(fx + 1, fy) * tx
  const b = at(fx, fy + 1) * (1 - tx) + at(fx + 1, fy + 1) * tx
  return a * (1 - ty) + b * ty
}

const kmPerPx = (HALF_WIDTH_KM * 2) / MASTER_W

/** Grid position → geographic position. */
function geo(i, j) {
  const lat = LAT_N - (j * kmPerPx) / KM_PER_DEG
  const xKm = (i - MASTER_W / 2) * kmPerPx
  const lon = LON_C + xKm / (KM_PER_DEG * Math.cos((lat * Math.PI) / 180))
  return { lat, lon }
}

function buildMaster() {
  const out = new Float32Array(MASTER_W * MASTER_H)
  const S = 3 // supersampling per cell
  for (let j = 0; j < MASTER_H; j++) {
    for (let i = 0; i < MASTER_W; i++) {
      let sum = 0
      let max = -Infinity
      for (let sy = 0; sy < S; sy++)
        for (let sx = 0; sx < S; sx++) {
          const { lat, lon } = geo(
            i + (sx + 0.5) / S - 0.5,
            j + (sy + 0.5) / S - 0.5,
          )
          const h = sample(lon, lat)
          sum += h
          if (h > max) max = h
        }
      // Lean towards the maximum so summits survive the downsampling.
      const h = 0.55 * max + 0.45 * (sum / (S * S))
      out[j * MASTER_W + i] = h > 0 ? h : 0
    }
  }
  return out
}

function downsample(src, w, h, factor) {
  const W = w / factor
  const H = Math.floor(h / factor)
  const out = new Uint16Array(W * H)
  for (let j = 0; j < H; j++)
    for (let i = 0; i < W; i++) {
      let sum = 0
      let max = 0
      let sea = 0
      for (let y = 0; y < factor; y++)
        for (let x = 0; x < factor; x++) {
          const v = src[(j * factor + y) * w + i * factor + x]
          sum += v
          if (v > max) max = v
          if (v <= 0) sea++
        }
      out[j * W + i] =
        sea > (factor * factor) / 2
          ? 0
          : Math.max(
              1,
              Math.round(0.55 * max + (0.45 * sum) / (factor * factor)),
            )
    }
  return { data: out, w: W, h: H }
}

// ---- Shaded relief -----------------------------------------------------

const mix = (a, b, t) => a.map((v, k) => v + (b[k] - v) * t)
const clamp01 = (v) => Math.min(1, Math.max(0, v))
const smooth = (e0, e1, x) => {
  const t = clamp01((x - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}

/** Same rule as the shader: after Condom et al. (2007), artistic only. */
const snowline = (lat) => {
  const s = -lat
  let h = 5600 + (6000 - 5600) * smooth(20, 28, s)
  h += (4300 - h) * smooth(28, 34, s)
  h += (1900 - h) * smooth(34, 41, s)
  h += (1000 - h) * smooth(41, 52, s)
  return h
}

/**
 * Shaded relief of a height grid. latOf(j) gives each row's latitude and
 * kmPx the cell size, so the same lighting serves the strip and the zooms.
 */
function shade(src, w, h, latOf, kmPx) {
  const rgb = Buffer.alloc(w * h * 3)
  const sea = [7, 9, 12]
  const low = [38, 33, 28]
  const desert = [104, 76, 52]
  const high = [62, 58, 56]
  const snow = [228, 233, 238]
  const forest = [44, 56, 42]
  const lake = [16, 26, 34]
  const salt = [196, 180, 160]
  const sun = [-0.6, -0.55, 0.58] // from the northwest, as on a printed map
  const n = Math.hypot(...sun)
  for (let j = 0; j < h; j++) {
    const lat = latOf(j)
    const north = smooth(-30, -20, lat) // 1 in the dry north
    const south = smooth(-36, -42, lat) // 1 in the wet south
    for (let i = 0; i < w; i++) {
      const k = j * w + i
      const v = src[k]
      if (v <= 0) {
        rgb.set(sea, k * 3)
        continue
      }
      const l = src[k - 1] ?? v
      const r = src[k + 1] ?? v
      const u = src[k - w] ?? v
      const d = src[k + w] ?? v
      const scale = (1 / (kmPx * 1000)) * 3
      const dx = (r - l) * scale
      const dy = (d - u) * scale
      // Lakes and salt flats are the only perfectly flat land: water in the
      // wet south, salt in the dry north. Blended, not thresholded, so the
      // edge of a salar does not dissolve into speckle.
      const grad = Math.abs(r - l) + Math.abs(d - u)
      const flatness = v > 200 ? 1 - smooth(0.4, 4, grad) : 0
      const len = Math.hypot(dx, dy, 1)
      const lambert = clamp01((-dx * sun[0] - dy * sun[1] + sun[2]) / (len * n))
      let c = mix(low, mix(desert, forest, south), smooth(0, 1500, v))
      c = mix(c, high, smooth(2500, 4500, v) * (1 - south * 0.3))
      c = mix(c, desert, north * smooth(1800, 3800, v) * 0.35)
      c = mix(c, snow, smooth(snowline(lat) - 250, snowline(lat) + 350, v))
      c = mix(c, lake, flatness * south)
      c = mix(c, salt, flatness * north * smooth(2000, 2300, v) * 0.85)
      const lit = 0.28 + 0.95 * lambert
      rgb.set(
        c.map((x) => Math.min(255, Math.round(x * lit))),
        k * 3,
      )
    }
  }
  return rgb
}

const ZONES = {
  altiplano: { lat: -22.4, lon: -68.4, spanKm: 360 },
  'ojos-del-salado': { lat: -27.1, lon: -68.6, spanKm: 150 },
  volcanes: { lat: -40.2, lon: -72.1, spanKm: 260 },
  patagonia: { lat: -50.4, lon: -73.4, spanKm: 300 },
}
const POSTER_W = 960
const POSTER_H = 768
const POSTER_ZOOM = 9

/** A zoomed poster: its own km grid around a point, sampled at zoom 9. */
async function poster(name, { lat, lon, spanKm }) {
  const kmPx = spanKm / POSTER_W
  const halfH = (POSTER_H * kmPx) / 2
  const latN = lat + halfH / KM_PER_DEG
  const latS = lat - halfH / KM_PER_DEG
  const dLon = spanKm / 2 / (KM_PER_DEG * Math.cos((latS * Math.PI) / 180))
  await preload(POSTER_ZOOM, lon - dLon, lon + dLon, latN, latS)
  const latOf = (j) => latN - (j * kmPx) / KM_PER_DEG
  const heights = new Float32Array(POSTER_W * POSTER_H)
  for (let j = 0; j < POSTER_H; j++) {
    const rowLat = latOf(j)
    const cos = Math.cos((rowLat * Math.PI) / 180)
    for (let i = 0; i < POSTER_W; i++) {
      const rowLon = lon + ((i - POSTER_W / 2) * kmPx) / (KM_PER_DEG * cos)
      const v = sample(rowLon, rowLat, POSTER_ZOOM)
      heights[j * POSTER_W + i] = v > 0 ? v : 0
    }
  }
  const rgb = shade(heights, POSTER_W, POSTER_H, latOf, kmPx)
  await sharp(rgb, { raw: { width: POSTER_W, height: POSTER_H, channels: 3 } })
    .webp({ quality: 76 })
    .toFile(path.join(OUT, `${name}.webp`))
  console.log(`${name}.webp`)
}

async function main() {
  await mkdir(CACHE, { recursive: true })
  await mkdir(OUT, { recursive: true })
  await preload(ZOOM, LON_C - 12, LON_C + 12, LAT_N, LAT_S)
  const master = buildMaster()
  console.log(`master ${MASTER_W}x${MASTER_H}, ${kmPerPx.toFixed(2)} km/px`)

  let peak = 0
  for (const v of master) if (v > peak) peak = v
  console.log(`highest cell ${Math.round(peak)} m`)

  const sizes = {}
  for (const factor of [2, 4]) {
    const { data, w, h } = downsample(master, MASTER_W, MASTER_H, factor)
    await writeFile(path.join(OUT, `dem-${w}.bin`), Buffer.from(data.buffer))
    sizes[w] = { w, h, kmPerPx: kmPerPx * factor }
    console.log(`dem-${w}.bin ${w}x${h}`)
  }

  await writeFile(
    path.join(OUT, 'meta.json'),
    JSON.stringify(
      {
        source:
          'AWS Terrain Tiles (Mapzen terrarium; SRTM, GMTED2010, ETOPO1), zoom 7',
        latNorth: LAT_N,
        latSouth: LAT_S,
        lonCentre: LON_C,
        halfWidthKm: HALF_WIDTH_KM,
        grids: sizes,
      },
      null,
      2,
    ),
  )

  for (const [name, zone] of Object.entries(ZONES)) await poster(name, zone)
}

await main()
