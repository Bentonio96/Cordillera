import {
  BufferAttribute,
  Color,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from 'three'
import { gsap } from '../lib/gsap'
import { EXAGGERATION } from './constants'
import type { Keyframe, Quality, ReliefMeta } from './types'
import { fragmentShader, vertexShader } from './shaders'

/**
 * The relief: one displaced plane of continental Chile, built from the real
 * elevation grid in public/relief/, and a camera that flies south along it.
 *
 * Scene units are tens of kilometres. North is -Z, east is +X, and heights
 * are exaggerated by EXAGGERATION so a range 200 km wide and 7 km tall reads
 * as a range at all from orbit-ish distances. The page's figures always come
 * from the cited sources, never from this mesh.
 *
 * Nothing here talks to React. The page hands in a continuous "stage" value
 * (section index plus progress through it) and a pointer position; the scene
 * damps towards them on GSAP's ticker, so Lenis, ScrollTrigger and the
 * renderer share one requestAnimationFrame.
 */

const UNIT_KM = 10
const KM_PER_DEG = 111.32

export interface ReliefOptions {
  readonly canvas: HTMLCanvasElement
  readonly quality: Quality
  readonly keyframes: readonly Keyframe[]
  /** Called each rendered frame with what the camera is looking at. */
  readonly onReadout?: (lat: number, lon: number, elevation: number) => void
  /** Screen positions of labelled points; null when behind the camera. */
  readonly markers?: readonly { lat: number; lon: number }[]
  readonly onMarkers?: (
    positions: readonly ({ x: number; y: number; depth: number } | null)[],
  ) => void
}

export interface ReliefHandle {
  setStage(stage: number): void
  setPointer(x: number, y: number): void
  resize(): void
  dispose(): void
}

interface Grid {
  readonly w: number
  readonly h: number
  readonly kmPerPx: number
  readonly heights: Uint16Array
}

const smoothstep = (t: number) => t * t * (3 - 2 * t)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
/** Shortest way round, so an azimuth of 350° to 10° turns 20°, not 340°. */
const lerpAngle = (a: number, b: number, t: number) => {
  const d = ((((b - a) % 360) + 540) % 360) - 180
  return a + d * t
}

async function loadGrid(meta: ReliefMeta, quality: Quality): Promise<Grid> {
  const size = quality === 'high' ? '256' : '128'
  const grid = meta.grids[size]
  if (!grid) throw new Error(`No ${size} grid in meta.json`)
  const res = await fetch(`/relief/dem-${size}.bin`)
  if (!res.ok) throw new Error(`dem-${size}.bin: ${res.status}`)
  const heights = new Uint16Array(await res.arrayBuffer())
  return { ...grid, heights }
}

export async function createRelief(
  options: ReliefOptions,
): Promise<ReliefHandle> {
  const { canvas, quality, keyframes } = options
  const meta = (await fetch('/relief/meta.json').then((r) =>
    r.json(),
  )) as ReliefMeta
  const grid = await loadGrid(meta, quality)

  const widthU = (grid.w * grid.kmPerPx) / UNIT_KM
  const lengthU = (grid.h * grid.kmPerPx) / UNIT_KM

  // ---- Geography ↔ scene -----------------------------------------------

  const toScene = (lat: number, lon: number) => {
    const x =
      ((lon - meta.lonCentre) * KM_PER_DEG * Math.cos((lat * Math.PI) / 180)) /
      UNIT_KM
    const z = ((meta.latNorth - lat) * KM_PER_DEG) / UNIT_KM - lengthU / 2
    return { x, z }
  }

  const toGeo = (x: number, z: number) => {
    const lat = meta.latNorth - ((z + lengthU / 2) * UNIT_KM) / KM_PER_DEG
    const lon =
      meta.lonCentre +
      (x * UNIT_KM) / (KM_PER_DEG * Math.cos((lat * Math.PI) / 180))
    return { lat, lon }
  }

  /** Bilinear height in metres at a scene position. */
  const heightAt = (x: number, z: number) => {
    const gx = ((x + widthU / 2) / widthU) * (grid.w - 1)
    const gz = ((z + lengthU / 2) / lengthU) * (grid.h - 1)
    const x0 = Math.max(0, Math.min(grid.w - 2, Math.floor(gx)))
    const z0 = Math.max(0, Math.min(grid.h - 2, Math.floor(gz)))
    const tx = Math.min(1, Math.max(0, gx - x0))
    const tz = Math.min(1, Math.max(0, gz - z0))
    const at = (i: number, j: number) => grid.heights[j * grid.w + i] ?? 0
    const a = lerp(at(x0, z0), at(x0 + 1, z0), tx)
    const b = lerp(at(x0, z0 + 1), at(x0 + 1, z0 + 1), tx)
    return lerp(a, b, tz)
  }

  const metresToUnits = (m: number) => (m / 1000 / UNIT_KM) * EXAGGERATION

  // ---- Mesh --------------------------------------------------------------

  const geometry = new PlaneGeometry(widthU, lengthU, grid.w - 1, grid.h - 1)
  geometry.rotateX(-Math.PI / 2)
  const position = geometry.getAttribute('position') as BufferAttribute
  const elevation = new Float32Array(position.count)
  for (let k = 0; k < position.count; k++) {
    // PlaneGeometry rows run north to south after the rotation, matching the
    // grid's row order, so vertex k is grid cell k.
    const metres = grid.heights[k] ?? 0
    elevation[k] = metres
    position.setY(k, metresToUnits(metres))
  }
  geometry.setAttribute('elevation', new BufferAttribute(elevation, 1))
  geometry.computeVertexNormals()

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    uniforms: {
      uLatNorth: { value: meta.latNorth },
      uLengthU: { value: lengthU },
      uUnitKm: { value: UNIT_KM },
      uFocusLat: { value: -20 },
      uFogNear: { value: 40 },
      uFogFar: { value: 160 },
      uTime: { value: 0 },
      uSun: { value: new Vector3(-0.55, 0.62, -0.56).normalize() },
      uAccent: { value: new Color('#9fd6e4') },
      uContours: { value: quality === 'high' ? 1 : 0.6 },
    },
  })

  const mesh = new Mesh(geometry, material)
  const scene = new Scene()
  scene.add(mesh)

  const camera = new PerspectiveCamera(38, 1, 0.5, 2000)
  const renderer = new WebGLRenderer({
    canvas,
    antialias: quality === 'high',
    alpha: true,
    powerPreference: quality === 'high' ? 'high-performance' : 'low-power',
  })
  renderer.setClearColor(0x000000, 0)

  const resize = () => {
    const { clientWidth, clientHeight } = canvas
    const cap = quality === 'high' ? 1.75 : 1.25
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, cap))
    renderer.setSize(clientWidth, clientHeight, false)
    camera.aspect = clientWidth / Math.max(1, clientHeight)
    portrait = camera.aspect < 0.8
    // Narrow screens see less of the strip; widen the lens instead of
    // pulling the camera back, which would shrink the mountains.
    camera.fov = portrait ? 50 : 38
    // Frame the subject away from the text: up on phones, where the text
    // sits at the bottom; right on wide screens, where it sits on the left.
    if (portrait) {
      camera.setViewOffset(
        clientWidth,
        clientHeight,
        0,
        clientHeight * 0.2,
        clientWidth,
        clientHeight,
      )
    } else if (clientWidth >= 1024) {
      camera.setViewOffset(
        clientWidth,
        clientHeight,
        -clientWidth * 0.14,
        0,
        clientWidth,
        clientHeight,
      )
    } else {
      camera.clearViewOffset()
    }
    camera.updateProjectionMatrix()
    dirty = true
  }

  // ---- Camera rig ----------------------------------------------------------

  /** Pre-resolved keyframes in scene space. */
  const keys = keyframes.map((k) => {
    const { x, z } = toScene(k.lat, k.lon)
    return { ...k, x, z }
  })

  let targetStage = 0
  let stage = 0
  let pointerX = 0
  let pointerY = 0
  let px = 0
  let py = 0
  let drift = 0
  let dirty = true
  let portrait = false
  let lastReadout = ''

  const rig = { x: 0, z: 0, distance: 0, pitch: 0, azimuth: 0 }

  const resolveRig = (s: number) => {
    const max = keys.length - 1
    const clamped = Math.min(max, Math.max(0, s))
    const i = Math.min(max - 1, Math.floor(clamped))
    const a = keys[i]
    const b = keys[i + 1] ?? a
    if (!a || !b) return
    const t = smoothstep(Math.min(1, Math.max(0, clamped - i)))
    rig.x = lerp(a.x, b.x, t)
    rig.z = lerp(a.z, b.z, t)
    // Distance travels in log space: from orbit to valley the change should
    // feel even, not all crammed into the last few percent.
    rig.distance =
      Math.exp(lerp(Math.log(a.distance), Math.log(b.distance), t)) *
      (portrait ? 0.85 : 1)
    rig.pitch = lerp(a.pitch, b.pitch, t)
    rig.azimuth = lerpAngle(a.azimuth, b.azimuth, t)
  }

  const target = new Vector3()
  const projected = new Vector3()
  const markerPoints = (options.markers ?? []).map((m) => {
    const { x, z } = toScene(m.lat, m.lon)
    return new Vector3(x, metresToUnits(heightAt(x, z)) + 0.15, z)
  })

  const frame = (time: number) => {
    // Critically damped-ish follow. Scroll sets where the camera is going;
    // this decides how it gets there, so a flick of the wheel becomes a
    // camera move instead of a cut.
    const ds = targetStage - stage
    stage += ds * 0.075
    px += (pointerX - px) * 0.05
    py += (pointerY - py) * 0.05
    if (quality === 'high') drift = Math.sin(time * 0.07) * 2.2

    const settled =
      Math.abs(ds) < 0.0004 &&
      Math.abs(pointerX - px) < 0.001 &&
      Math.abs(pointerY - py) < 0.001
    // Low quality renders on demand only; high keeps a slow drift alive.
    if (settled && !dirty && quality !== 'high') return
    dirty = false

    resolveRig(stage)
    const ground = metresToUnits(heightAt(rig.x, rig.z))
    target.set(rig.x, ground * 0.6, rig.z)

    const az = ((rig.azimuth + px * 6 + drift) * Math.PI) / 180
    const pitch = ((rig.pitch + py * 3) * Math.PI) / 180
    camera.position.set(
      target.x + Math.sin(az) * Math.cos(pitch) * rig.distance,
      target.y + Math.sin(pitch) * rig.distance,
      target.z - Math.cos(az) * Math.cos(pitch) * rig.distance,
    )
    camera.lookAt(target)

    const geo = toGeo(rig.x, rig.z)
    const u = material.uniforms
    if (u.uFocusLat) u.uFocusLat.value = geo.lat
    if (u.uFogNear) u.uFogNear.value = rig.distance * 0.7
    if (u.uFogFar) u.uFogFar.value = rig.distance * 2.1
    if (u.uTime) u.uTime.value = time

    renderer.render(scene, camera)

    if (options.onReadout) {
      const metres = heightAt(rig.x, rig.z)
      const key = `${geo.lat.toFixed(2)}${geo.lon.toFixed(2)}${Math.round(metres / 10)}`
      if (key !== lastReadout) {
        lastReadout = key
        options.onReadout(geo.lat, geo.lon, metres)
      }
    }

    if (options.onMarkers) {
      const { clientWidth: w, clientHeight: h } = canvas
      options.onMarkers(
        markerPoints.map((p) => {
          projected.copy(p).project(camera)
          if (projected.z > 1 || projected.z < -1) return null
          return {
            x: (projected.x * 0.5 + 0.5) * w,
            y: (-projected.y * 0.5 + 0.5) * h,
            depth: camera.position.distanceTo(p) / rig.distance,
          }
        }),
      )
    }
  }

  // Pause when the tab is hidden: GSAP's ticker already throttles, but the
  // GPU work is the expensive part and there is nothing to look at.
  let running = true
  const onVisibility = () => {
    running = !document.hidden
  }
  const tick = (time: number) => {
    if (running) frame(time)
  }

  resize()
  resolveRig(0)
  window.addEventListener('resize', resize)
  document.addEventListener('visibilitychange', onVisibility)
  gsap.ticker.add(tick)

  return {
    setStage(value) {
      targetStage = value
    },
    setPointer(x, y) {
      pointerX = x
      pointerY = y
    },
    resize,
    dispose() {
      gsap.ticker.remove(tick)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    },
  }
}
