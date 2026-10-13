import * as THREE from "three";

/**
 * Things every place shares: the uniforms the stage keeps up to date, a
 * seeded random source (so a place looks the same on every visit), the shape
 * of a place, and the particle volume that makes travel legible.
 */

export const shared = {
  uTime: { value: 0 },
  /** World units covered by one buffer pixel, per unit of depth. */
  uPxWorld: { value: 0.001 },
  /** Buffer pixels covered by one world unit at depth 1. */
  uPxScale: { value: 1000 },
  /** Distance fade of the place being drawn. */
  uFog: { value: 0.02 },
};

/** mulberry32: small, fast, and the same sequence for the same seed. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export type PlaceCtx = {
  time: number;
  dt: number;
  /** Runs on with time and with distance scrolled: drive anything that turns from it. */
  theta: number;
  /** Scroll speed, screens per second. */
  speed: number;
  /** This place's damped channel: [px, py, pz, rx, ry, rz, p, q]. */
  ch: number[];
  /** The opener, 0 to 1. */
  intro: number;
};

export type Place = {
  /** Scaled by the dive. */
  root: THREE.Group;
  /** Moved by the pose; signs stand relative to it. */
  slide: THREE.Group;
  update(ctx: PlaceCtx): void;
  /** Points that DOM labels follow, by key. */
  anchors?: Record<string, THREE.Object3D>;
  /** The corners (in the slide's coordinates) of an opening the next place is seen through from here. */
  portal?: THREE.Vector3[];
  /**
   * The corners (in the slide's coordinates, counter-clockwise seen from outside) of the opening this place
   * is entered through. Until the camera is through it, the place is drawn only where the opening is.
   */
  gate?: THREE.Vector3[];
  /** What stands round that opening on the outside (its frame). It is drawn with the place the camera comes from. */
  threshold?: THREE.Object3D;
};

export function shell() {
  const root = new THREE.Group();
  const slide = new THREE.Group();
  root.add(slide);
  return { root, slide };
}

const DUST_VERTEX = /* glsl */ `
  attribute float aSeed;
  uniform float uTime, uPxScale, uFog, uSize, uDrift;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p += vec3(sin(uTime * 0.11 + aSeed * 61.0), cos(uTime * 0.09 + aSeed * 37.0), sin(uTime * 0.07 + aSeed * 19.0)) * uDrift;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float d = -mv.z;
    float s = length(modelViewMatrix[0].xyz);
    gl_PointSize = clamp(uSize * s * uPxScale / max(d, 0.1) * (0.5 + aSeed), 1.0, 30.0);
    vAlpha = exp(-pow(uFog * d, 2.0)) * smoothstep(0.3, 1.6, d) * (0.3 + 0.7 * fract(aSeed * 7.7));
    gl_Position = projectionMatrix * mv;
  }
`;

const DUST_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uGain;
  varying float vAlpha;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.1, r) * vAlpha;
    if (a < 0.004) discard;
    gl_FragColor = vec4(uColor * uGain, a);
  }
`;

/** A volume of small drifting points. Parallax against these is how the eye reads speed. */
export function dust(options: {
  count: number;
  size: [number, number, number];
  centre?: [number, number, number];
  color: THREE.ColorRepresentation;
  gain?: number;
  point?: number;
  drift?: number;
  seed?: number;
  /** Dark specks on a light ground instead of light on dark. */
  ink?: boolean;
  /** Custom placement: return a position for each point. */
  place?: (random: () => number, index: number) => [number, number, number];
}) {
  const random = rng(options.seed ?? 7);
  const [cx, cy, cz] = options.centre ?? [0, 0, 0];
  const positions = new Float32Array(options.count * 3);
  const seeds = new Float32Array(options.count);
  for (let i = 0; i < options.count; i++) {
    const at = options.place ? options.place(random, i) : [cx + (random() - 0.5) * options.size[0], cy + (random() - 0.5) * options.size[1], cz + (random() - 0.5) * options.size[2]];
    positions.set(at, i * 3);
    seeds[i] = random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: shared.uTime,
      uPxScale: shared.uPxScale,
      uFog: shared.uFog,
      uColor: { value: new THREE.Color(options.color) },
      uGain: { value: options.gain ?? 1 },
      uSize: { value: options.point ?? 0.05 },
      uDrift: { value: options.drift ?? 0.4 },
    },
    vertexShader: DUST_VERTEX,
    fragmentShader: DUST_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: options.ink ? THREE.NormalBlending : THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return points;
}

/** A material for solids that takes the scene's lights and fog. */
export function metal(color: THREE.ColorRepresentation, roughness = 0.4, metalness = 0.85) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

/** An unlit colour brighter than 1, so only it blooms. */
export function glow(color: THREE.ColorRepresentation, gain = 2) {
  const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(gain) });
  material.toneMapped = false;
  return material;
}

// ---- props: the small vocabulary every place is modelled from ----

/** Positions (and optionally turns and scales) an object, and hands it back. */
export function put<T extends THREE.Object3D>(object: T, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, scale = 1): T {
  object.position.set(x, y, z);
  object.rotation.set(rx, ry, rz);
  if (scale !== 1) object.scale.setScalar(scale);
  return object;
}

export const box = (w: number, h: number, d: number, material: THREE.Material) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
/** A cylinder standing on the y axis. */
export const cyl = (top: number, bottom: number, h: number, material: THREE.Material, sides = 32) => new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, h, sides), material);
export const ball = (r: number, material: THREE.Material, detail = 24) => new THREE.Mesh(new THREE.SphereGeometry(r, detail, Math.max(8, detail >> 1)), material);

/** A lit surface: paint, plastic, lacquer, cloth. */
export function matte(color: THREE.ColorRepresentation, roughness = 0.6, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

/**
 * A texture drawn with the 2D canvas. It is drawn at once, and again when
 * the page's fonts have loaded, so lettering never ships in a fallback face.
 */
export function paint(width: number, height: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  draw(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  void document.fonts?.ready.then(() => {
    ctx.clearRect(0, 0, width, height);
    draw(ctx, width, height);
    texture.needsUpdate = true;
    upload(texture);
  });
  return texture;
}

/** The stage sets this: it sends a finished texture to the GPU there and then, instead of on the frame it first shows. */
let upload: (texture: THREE.Texture) => void = () => {};
export function setUploader(send: (texture: THREE.Texture) => void) {
  upload = send;
}

const loader = new THREE.TextureLoader();
/** A picture from a file in public/. The mesh that wears it shows its base colour until it arrives. */
export function picture(url: string) {
  const texture = loader.load(url, (loaded) => upload(loaded));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/** Many copies of one shape in one draw call. `each` places copy i by writing to the dummy (and, optionally, the colour). */
export function field(geometry: THREE.BufferGeometry, material: THREE.Material, count: number, each: (index: number, dummy: THREE.Object3D, color: THREE.Color) => void) {
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  for (let i = 0; i < count; i++) {
    dummy.position.set(0, 0, 0);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    color.set(0xffffff);
    each(i, dummy, color);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    mesh.setColorAt(i, color);
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.frustumCulled = false;
  return mesh;
}

const BEAM_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uGain;
  varying vec2 vUv;
  varying float vFacing;
  void main() {
    // Brightest at the lamp, gone at the floor, soft at the edges of the cone.
    float a = pow(vUv.y, 1.6) * vFacing * uGain;
    gl_FragColor = vec4(uColor, a);
  }
`;

/** A cone of light in haze, from a lamp at the origin down the -y axis. */
export function beam(radius: number, length: number, color: THREE.ColorRepresentation, gain = 0.5) {
  const geometry = new THREE.CylinderGeometry(0.06, radius, length, 40, 1, true);
  geometry.translate(0, -length / 2, 0);
  const material = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uGain: { value: gain } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying float vFacing;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vec3 n = normalize(normalMatrix * normal);
        vFacing = pow(abs(dot(n, normalize(-mv.xyz))), 1.5);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: BEAM_FRAGMENT,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Mesh(geometry, material);
}
