/**
 * Terrain shading. The colour is a function of latitude and height, the two
 * things that actually decide what the Andes look like: the same 4,000 m is
 * bare ochre rock in the Atacama and permanent ice in Patagonia.
 *
 * The snowline here is an artistic approximation of the real gradient (very
 * high in the hyper-arid north, near sea level in the far south), used for
 * colour only. It is not presented as data anywhere on the page.
 */

export const vertexShader = /* glsl */ `
  attribute float elevation;
  uniform float uLatNorth;
  uniform float uLengthU;
  uniform float uUnitKm;

  varying float vElevation;
  varying float vLat;
  varying vec3 vNormal;
  varying vec3 vWorld;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vElevation = elevation;
    vLat = uLatNorth - ((position.z + uLengthU * 0.5) * uUnitKm) / 111.32;
    vNormal = normal;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uFocusLat;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uTime;
  uniform float uContours;
  uniform vec3 uSun;
  uniform vec3 uAccent;

  varying float vElevation;
  varying float vLat;
  varying vec3 vNormal;
  varying vec3 vWorld;
  varying vec2 vUv;

  // Piecewise after Condom et al. (2007): ~6,000 m near 28°S, falling to
  // ~1,000 m by 55°S, fastest through central Chile.
  float snowline(float lat) {
    float s = -lat;
    float h = mix(5600.0, 6000.0, smoothstep(20.0, 28.0, s));
    h = mix(h, 4300.0, smoothstep(28.0, 34.0, s));
    h = mix(h, 1900.0, smoothstep(34.0, 41.0, s));
    h = mix(h, 1000.0, smoothstep(41.0, 52.0, s));
    return h;
  }

  /** Anti-aliased line at every integer of v. */
  float isoline(float v, float width) {
    float d = abs(fract(v - 0.5) - 0.5);
    return 1.0 - smoothstep(0.0, fwidth(v) * width, d);
  }

  void main() {
    vec3 n = normalize(vNormal);
    vec3 view = normalize(cameraPosition - vWorld);
    float h = vElevation;
    float lat = vLat;

    float north = smoothstep(-30.0, -20.0, lat);
    float south = smoothstep(-36.0, -43.0, lat);

    // Ground: basalt, warmed to ochre in the desert, greened in the wet south.
    vec3 basalt = vec3(0.075, 0.072, 0.07);
    vec3 ochre = vec3(0.42, 0.28, 0.17);
    vec3 salt = vec3(0.55, 0.47, 0.42);
    vec3 forest = vec3(0.12, 0.16, 0.115);
    vec3 rock = vec3(0.22, 0.21, 0.205);
    vec3 snow = mix(vec3(0.92, 0.93, 0.95), vec3(0.78, 0.9, 0.96), south);

    vec3 col = mix(basalt, forest, south * (1.0 - smoothstep(600.0, 1800.0, h)));
    col = mix(col, ochre, north * smoothstep(300.0, 2600.0, h));
    // Salt flats: flat, high, northern. The flatness test keeps it to basins.
    float flatness = smoothstep(0.985, 0.999, n.y);
    col = mix(col, salt, north * flatness * smoothstep(2200.0, 2500.0, h) * 0.6);
    col = mix(col, rock, smoothstep(3200.0, 5000.0, h) * (1.0 - north * 0.4));

    float sl = snowline(lat);
    float snowAmount = smoothstep(sl - 200.0, sl + 400.0, h);
    snowAmount *= mix(0.55, 1.0, smoothstep(0.35, 0.75, n.y));
    col = mix(col, snow, snowAmount);

    // Light: low sun from the north-west, a cool sky fill, and a rim that
    // pulls ridges off the dark background.
    float diffuse = max(dot(n, uSun), 0.0);
    float sky = 0.5 + 0.5 * n.y;
    float rim = pow(1.0 - max(dot(n, view), 0.0), 3.0);
    vec3 lit = col * (0.16 + 0.12 * south + 1.25 * diffuse) + col * vec3(0.10, 0.13, 0.17) * sky;
    lit += rim * mix(vec3(0.35, 0.22, 0.14), vec3(0.4, 0.55, 0.65), south) * 0.28;

    bool sea = h < 0.5;
    if (sea) {
      vec3 deep = vec3(0.022, 0.03, 0.04);
      lit = deep + rim * vec3(0.03, 0.05, 0.07);
    }

    // Contours every 250 m, heavier every 1,000 m: the drawn-map layer.
    if (!sea) {
      float minor = isoline(h / 250.0, 1.0) * 0.07;
      float major = isoline(h / 1000.0, 1.3) * 0.16;
      lit += vec3(0.95, 0.93, 0.9) * (minor + major) * uContours;
    }

    // Graticule every degree of latitude, faint; the latitude the camera is
    // reading glows in the accent, as the instrument's cursor.
    float grat = isoline(lat, 0.8) * 0.06;
    lit += vec3(0.8, 0.85, 0.9) * grat;
    float focus = 1.0 - smoothstep(0.0, 0.03, abs(lat - uFocusLat));
    lit = mix(lit, uAccent, focus * 0.4);

    // Fade to transparent with distance, so the CSS sky shows through, and
    // at the edges of the grid, so the strip never reads as a slab.
    float dist = length(cameraPosition - vWorld);
    float fog = smoothstep(uFogNear, uFogFar, dist);
    float edge = smoothstep(0.0, 0.14, vUv.x) * smoothstep(1.0, 0.86, vUv.x)
      * smoothstep(0.0, 0.025, vUv.y) * smoothstep(1.0, 0.975, vUv.y);
    // The open sea dissolves sooner than land: it is ground, not subject.
    float seaFade = sea ? smoothstep(0.0, 0.3, vUv.x) * 0.9 : 1.0;
    float alpha = (1.0 - fog) * edge * seaFade;

    gl_FragColor = vec4(lit * alpha, alpha);
  }
`
