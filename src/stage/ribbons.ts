import * as THREE from "three";
import { rng, shared } from "./kit";

/**
 * Ribbons: lines with real width that face the camera, drawn in one call.
 * The thread that runs through the site, every string, orbit, path and edge
 * is one of these.
 *
 * Two kinds. A procedural ribbon's path is a GLSL function of (u, id, seed)
 * evaluated in the vertex shader, so it can move every frame for nothing. A
 * static ribbon's path is a list of points worked out once on the CPU.
 *
 * Width is in world units, so a ribbon thickens as it nears the lens, with a
 * floor in pixels so distant ones never drop out. The offset is done in view
 * space, which stays well behaved when a ribbon passes behind the camera.
 */

export type RibbonOptions = {
  width: number;
  minPx?: number;
  color?: THREE.ColorRepresentation;
  /** Brightness of the body. Above 1 it blooms. */
  gain?: number;
  opacity?: number;
  /** Brightness of the packets of light that run along it, how many, and how fast. */
  pulse?: number;
  pulseN?: number;
  pulseSpeed?: number;
  /** Dark lines on a light ground: ordinary blending instead of additive. */
  ink?: boolean;
  /** Fade the two ends. */
  taper?: boolean;
  /** Let a path's `gain` function hide parts of a ribbon instead of dimming them (needed for ink). */
  gainAsAlpha?: boolean;
  dash?: number;
  /** Per-ribbon body colour, pulse colour and width multiplier. */
  colors?: (index: number, random: () => number) => THREE.Color;
  pulseColors?: (index: number, random: () => number) => THREE.Color;
  widths?: (index: number, random: () => number) => number;
  uniforms?: Record<string, THREE.IUniform>;
  seed?: number;
};

const HEAD = /* glsl */ `
  uniform float uTime, uWidth, uMinPx, uPxWorld, uFog;
  attribute float aU, aSide, aId, aSeed, aW;
  attribute vec3 aColor, aColor2;
  varying float vSide, vU, vSeed, vFade, vGain;
  varying vec3 vColor, vColor2;

  vec4 ribbon(vec3 p, vec3 a, vec3 b) {
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec3 t = (modelViewMatrix * vec4(b, 1.0)).xyz - (modelViewMatrix * vec4(a, 1.0)).xyz;
    vec3 n = cross(t, mv.xyz);
    float l = length(n);
    n = l > 1e-7 ? n / l : vec3(1.0, 0.0, 0.0);
    float d = max(0.05, -mv.z);
    float s = length(modelViewMatrix[0].xyz);
    float halfWidth = max(uWidth * aW * s * 0.5, uMinPx * 0.5 * uPxWorld * d);
    mv.xyz += n * aSide * halfWidth;
    vFade = exp(-pow(uFog * d, 2.0));
    vSide = aSide;
    vU = aU;
    vSeed = aSeed;
    vColor = aColor;
    vColor2 = aColor2;
    return projectionMatrix * mv;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform float uTime, uGain, uReveal, uPulse, uPulseN, uPulseSpeed, uOpacity, uDash, uTaper, uGainAlpha;
  varying float vSide, vU, vSeed, vFade, vGain;
  varying vec3 vColor, vColor2;
  void main() {
    float a = smoothstep(0.0, 0.62, 1.0 - abs(vSide));
    a *= 1.0 - smoothstep(uReveal - 0.012, uReveal, vU);
    if (uDash > 0.0) a *= step(0.45, fract(vU * uDash));
    a *= mix(1.0, smoothstep(0.0, 0.05, vU) * smoothstep(1.0, 0.95, vU), uTaper);
    float packet = fract(vU * uPulseN - uTime * uPulseSpeed + vSeed);
    float pulse = pow(smoothstep(0.72, 1.0, packet), 3.0) * uPulse;
    vec3 c = vColor * uGain * mix(vGain, 1.0, uGainAlpha) + vColor2 * pulse;
    a *= vFade * uOpacity * mix(1.0, clamp(vGain, 0.0, 1.0), uGainAlpha);
    if (a < 0.003) discard;
    gl_FragColor = vec4(c, a);
  }
`;

function material(vertex: string, options: RibbonOptions) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: shared.uTime,
      uPxWorld: shared.uPxWorld,
      uFog: shared.uFog,
      uWidth: { value: options.width },
      uMinPx: { value: options.minPx ?? 1.3 },
      uGain: { value: options.gain ?? 1.4 },
      uReveal: { value: 2 },
      uPulse: { value: options.pulse ?? 0 },
      uPulseN: { value: options.pulseN ?? 3 },
      uPulseSpeed: { value: options.pulseSpeed ?? 0.25 },
      uOpacity: { value: options.opacity ?? 1 },
      uDash: { value: options.dash ?? 0 },
      uTaper: { value: options.taper ? 1 : 0 },
      uGainAlpha: { value: options.gainAsAlpha ? 1 : 0 },
      ...options.uniforms,
    },
    vertexShader: vertex,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: options.ink ? THREE.NormalBlending : THREE.AdditiveBlending,
  });
}

/** The attributes both kinds share, for `counts[i] + 1` points on ribbon i. */
function strips(counts: number[], options: RibbonOptions) {
  const random = rng(options.seed ?? 11);
  const total = counts.reduce((sum, n) => sum + (n + 1) * 2, 0);
  const u = new Float32Array(total);
  const side = new Float32Array(total);
  const id = new Float32Array(total);
  const seed = new Float32Array(total);
  const wide = new Float32Array(total);
  const color = new Float32Array(total * 3);
  const color2 = new Float32Array(total * 3);
  const index: number[] = [];
  const base = new THREE.Color(options.color ?? 0xffffff);
  let v = 0;
  counts.forEach((segments, r) => {
    const s = random();
    const c = options.colors ? options.colors(r, random) : base;
    const c2 = options.pulseColors ? options.pulseColors(r, random) : c;
    const w = options.widths ? options.widths(r, random) : 1;
    for (let i = 0; i <= segments; i++) {
      for (let k = 0; k < 2; k++) {
        u[v] = i / segments;
        side[v] = k === 0 ? -1 : 1;
        id[v] = r;
        seed[v] = s;
        wide[v] = w;
        color.set([c.r, c.g, c.b], v * 3);
        color2.set([c2.r, c2.g, c2.b], v * 3);
        v++;
      }
      if (i < segments) {
        const a = v - 2;
        index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("aU", new THREE.BufferAttribute(u, 1));
  geometry.setAttribute("aSide", new THREE.BufferAttribute(side, 1));
  geometry.setAttribute("aId", new THREE.BufferAttribute(id, 1));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  geometry.setAttribute("aW", new THREE.BufferAttribute(wide, 1));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
  geometry.setAttribute("aColor2", new THREE.BufferAttribute(color2, 3));
  geometry.setIndex(index);
  return { geometry, total };
}

export type Ribbons = THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;

/**
 * `path` is GLSL that defines `vec3 path(float u, float id, float seed)`
 * (and, optionally, reads uniforms passed in `options.uniforms`, which it
 * must declare). It may also define `float gain(float u, float id, float seed)`
 * if `hasGain` is set.
 */
export function proceduralRibbons(count: number, segments: number, path: string, options: RibbonOptions & { hasGain?: boolean }): Ribbons {
  const { geometry, total } = strips(new Array(count).fill(segments), options);
  // three wants a position attribute; the real one is computed in the shader.
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(total * 3), 3));
  const vertex = /* glsl */ `
    ${HEAD}
    ${path}
    void main() {
      float du = 1.0 / ${segments.toFixed(1)};
      vec3 p = path(aU, aId, aSeed);
      gl_Position = ribbon(p, path(aU - du, aId, aSeed), path(aU + du, aId, aSeed));
      vGain = ${options.hasGain ? "gain(aU, aId, aSeed)" : "1.0"};
    }
  `;
  const mesh = new THREE.Mesh(geometry, material(vertex, options));
  mesh.frustumCulled = false;
  return mesh;
}

export function staticRibbons(lines: THREE.Vector3[][], options: RibbonOptions): Ribbons {
  const { geometry, total } = strips(
    lines.map((line) => line.length - 1),
    options,
  );
  const position = new Float32Array(total * 3);
  const previous = new Float32Array(total * 3);
  const next = new Float32Array(total * 3);
  let v = 0;
  for (const line of lines) {
    for (let i = 0; i < line.length; i++) {
      const p = line[i];
      const a = line[Math.max(0, i - 1)];
      const b = line[Math.min(line.length - 1, i + 1)];
      for (let k = 0; k < 2; k++) {
        position.set([p.x, p.y, p.z], v * 3);
        previous.set([a.x, a.y, a.z], v * 3);
        next.set([b.x, b.y, b.z], v * 3);
        v++;
      }
    }
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geometry.setAttribute("aPrev", new THREE.BufferAttribute(previous, 3));
  geometry.setAttribute("aNext", new THREE.BufferAttribute(next, 3));
  const vertex = /* glsl */ `
    ${HEAD}
    attribute vec3 aPrev, aNext;
    void main() {
      gl_Position = ribbon(position, aPrev, aNext);
      vGain = 1.0;
    }
  `;
  const mesh = new THREE.Mesh(geometry, material(vertex, options));
  mesh.frustumCulled = false;
  return mesh;
}

/** Points along a closed circle in the XY plane, for static ribbons. */
export function circle(radius: number, segments = 96, squash = 1) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius * squash, 0));
  }
  return points;
}

/** A quadratic curve from a to b, bowed towards `via`. */
export function bow(a: THREE.Vector3, b: THREE.Vector3, via: THREE.Vector3, segments = 32) {
  const curve = new THREE.QuadraticBezierCurve3(a, via, b);
  return curve.getPoints(segments);
}
