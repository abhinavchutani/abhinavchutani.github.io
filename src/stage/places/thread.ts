import * as THREE from "three";
import { chapters, disciplines } from "../../content";
import { dust, paint, put, rng, shell, shared, type Place } from "../kit";
import { proceduralRibbons, staticRibbons } from "../ribbons";

/**
 * 00 Origin. One strand of light for every discipline on the page, each in
 * the colour of its chapter, twisting into a single thread that leaves a
 * star in the far distance and passes the lens, with rings of light running
 * down it. Behind it a nebula, so the dark has depth. The opener is a flight
 * through a tunnel of streaks to this view; `p` parts the strands and puts
 * the star out as the camera sets off down the thread.
 */

/** The seven chapter accents, for anything that wants the whole palette. */
export const ACCENTS = [0xffb45c, 0x5cf2a0, 0xa99bff, 0xffd84a, 0xff6f7d, 0xff7d6e, 0x8f88ff];

const PATH = /* glsl */ `
  uniform float uSpread, uIntro;
  vec3 centre(float u) {
    float f = 1.0 - u;
    return vec3(
      2.6 + 13.5 * pow(f, 1.7) + 0.9 * sin(u * 6.3 + 0.5),
      -1.0 + 7.6 * pow(f, 1.5) + 0.55 * sin(u * 4.7 + 1.3),
      mix(-74.0, 16.0, u)
    );
  }
  vec3 path(float u, float id, float seed) {
    float uu = clamp(u, 0.0, 1.0);
    // Each strand arrives in its own time, from its own distance.
    float arrive = clamp(uIntro * 1.7 - seed * 0.7, 0.0, 1.0);
    arrive = 1.0 - pow(1.0 - arrive, 3.0);
    float a = id * 2.0786 + uu * 34.0 + uTime * 0.14 + sin(uu * 3.0 + seed * 6.28) * 0.7;
    float r = mix(0.07, 0.4, uSpread) * (0.5 + fract(seed * 7.13)) * (1.0 + 0.35 * sin(uu * 11.0 + seed * 20.0));
    // The braid loosens as it nears the lens, so the strands can be told apart.
    r *= 1.0 + 2.6 * smoothstep(0.35, 0.95, uu);
    r += (1.0 - arrive) * (2.5 + 7.0 * fract(seed * 3.7)) * (0.4 + uu);
    r *= 1.0 + 2.4 * smoothstep(0.72, 1.0, uu) * uSpread;
    return centre(uu) + vec3(cos(a), sin(a), 0.0) * r;
  }
  // Far off, every strand shares a pixel or two; each is kept dim there so the thread stays a thread.
  float gain(float u, float id, float seed) {
    return mix(0.15, 0.85, smoothstep(0.45, 0.95, u));
  }
`;

// Rings that travel down the thread: each is a circle round the centre line, moving towards the lens and growing as it comes.
const RINGS = /* glsl */ `
  vec3 centre(float u) {
    float f = 1.0 - u;
    return vec3(2.6 + 13.5 * pow(f, 1.7) + 0.9 * sin(u * 6.3 + 0.5), -1.0 + 7.6 * pow(f, 1.5) + 0.55 * sin(u * 4.7 + 1.3), mix(-74.0, 16.0, u));
  }
  float along(float id) { return fract(id / 16.0 + uTime * 0.035); }
  vec3 path(float u, float id, float seed) {
    float s = along(id);
    float a = u * 6.28318;
    float r = 0.5 + 0.9 * s;
    return centre(s) + vec3(cos(a), sin(a), 0.0) * r;
  }
  float gain(float u, float id, float seed) {
    float s = along(id);
    return smoothstep(0.0, 0.12, s) * smoothstep(0.94, 0.7, s) * (0.25 + 0.5 * s);
  }
`;

/** The same centre line as the shader's, for things that sit on the thread. */
const centre = (u: number) => new THREE.Vector3(2.6 + 13.5 * Math.pow(1 - u, 1.7) + 0.9 * Math.sin(u * 6.3 + 0.5), -1.0 + 7.6 * Math.pow(1 - u, 1.5) + 0.55 * Math.sin(u * 4.7 + 1.3), -74 + 90 * u);

/**
 * The nebula: clouds folded through themselves, cool to rose to warm, brightest behind the star and kept
 * off the left of the frame, where the name stands. It is worked out once, here, into a picture. (As a
 * shader it was three five-octave noises for every pixel of the screen on every frame: the dearest thing
 * in the place, and the reason the first move of the page could not hold its frame rate.)
 */
function nebulaPicture(width: number, height: number) {
  const hash = (x: number, y: number) => {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const noise = (x: number, y: number) => {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    let fx = x - ix;
    let fy = y - iy;
    fx = fx * fx * (3 - 2 * fx);
    fy = fy * fy * (3 - 2 * fy);
    const top = hash(ix, iy) + (hash(ix + 1, iy) - hash(ix, iy)) * fx;
    const foot = hash(ix, iy + 1) + (hash(ix + 1, iy + 1) - hash(ix, iy + 1)) * fx;
    return top + (foot - top) * fy;
  };
  const fbm = (x: number, y: number) => {
    let v = 0;
    let amp = 0.5;
    for (let i = 0; i < 5; i++) {
      v += amp * noise(x, y);
      x = x * 2.02 + 17.3;
      y = y * 2.02 + 17.3;
      amp *= 0.5;
    }
    return v;
  };
  const step = (lo: number, hi: number, v: number) => {
    const t = Math.min(1, Math.max(0, (v - lo) / (hi - lo)));
    return t * t * (3 - 2 * t);
  };
  // Light is added, so the picture holds colour already multiplied by how dense the cloud is, stored for the screen's curve.
  const encode = (v: number) => Math.round(255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(width, height);
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      const u = (i + 0.5) / width;
      const v = 1 - (j + 0.5) / height;
      const x = u * 5.2;
      const y = v * 3.0;
      const foldX = fbm(x, y);
      const foldY = fbm(x + 5.2, y + 5.2);
      const dense = step(0.42, 0.86, fbm(x + foldX * 1.6, y + foldY * 1.6));
      const toRose = step(0.3, 0.8, foldX);
      const toWarm = step(0.5, 0.95, foldY) * 0.8;
      let r = 0.06 + (0.26 - 0.06) * toRose;
      let g = 0.1 + (0.07 - 0.1) * toRose;
      let b = 0.36 + (0.24 - 0.36) * toRose;
      r += (0.42 - r) * toWarm;
      g += (0.16 - g) * toWarm;
      b += (0.08 - b) * toWarm;
      const near = Math.exp(-((u - 0.62) * (u - 0.62) + (v - 0.58) * (v - 0.58)) * 9);
      const edge = step(0, 0.25, u) * step(1, 0.8, u) * step(0, 0.2, v) * step(1, 0.8, v);
      const amount = dense * (0.05 + near * 0.62) * edge * (0.35 + 0.65 * step(0.36, 0.56, u)) * 1.2;
      const at = (j * width + i) * 4;
      image.data[at] = encode(r * amount);
      image.data[at + 1] = encode(g * amount);
      image.data[at + 2] = encode(b * amount);
      image.data[at + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function thread(): Place {
  const { root, slide } = shell();
  const ivory = new THREE.Color(1.0, 0.95, 0.86);
  const random = rng(4);

  // ---- the nebula, and the star the thread comes from ----
  const nebula = new THREE.Mesh(new THREE.PlaneGeometry(520, 300), new THREE.MeshBasicMaterial({ map: nebulaPicture(560, 322), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  nebula.renderOrder = -10;
  slide.add(put(nebula, 20, 10, -230));

  const flare = paint(512, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const core = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    core.addColorStop(0, "rgba(255,250,240,1)");
    core.addColorStop(0.06, "rgba(255,236,205,0.7)");
    core.addColorStop(0.25, "rgba(255,200,150,0.14)");
    core.addColorStop(1, "rgba(255,200,150,0)");
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, w, h);
    // A long streak across, and four short spikes: the look of a bright point through glass.
    const streak = ctx.createLinearGradient(0, 0, w, 0);
    streak.addColorStop(0, "rgba(160,190,255,0)");
    streak.addColorStop(0.5, "rgba(220,230,255,0.85)");
    streak.addColorStop(1, "rgba(160,190,255,0)");
    ctx.fillStyle = streak;
    ctx.fillRect(0, h / 2 - 1.5, w, 3);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 4 + (i * Math.PI) / 2);
      const spike = ctx.createLinearGradient(0, 0, w * 0.2, 0);
      spike.addColorStop(0, "rgba(255,240,220,0.5)");
      spike.addColorStop(1, "rgba(255,240,220,0)");
      ctx.fillStyle = spike;
      ctx.fillRect(0, -0.8, w * 0.2, 1.6);
      ctx.rotate(-(Math.PI / 4 + (i * Math.PI) / 2));
    }
    ctx.restore();
  });
  const star = new THREE.Sprite(new THREE.SpriteMaterial({ map: flare, color: new THREE.Color(2.2, 2.0, 1.8), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  star.scale.set(34, 34, 1);
  star.position.copy(centre(0));
  slide.add(star);

  // ---- the thread: one strand per discipline, in its chapter's colour ----
  const strands = proceduralRibbons(disciplines.length, 420, PATH, {
    width: 0.03,
    minPx: 1.25,
    hasGain: true,
    gain: 1.15,
    pulse: 2.2,
    pulseN: 5,
    pulseSpeed: 0.16,
    colors: (i) => ivory.clone().lerp(new THREE.Color(chapters[disciplines[i].chapter].accent), 0.62),
    pulseColors: () => ivory.clone(),
    widths: (_i, r) => 0.75 + r() * 0.7,
    uniforms: { uSpread: { value: 0 }, uIntro: { value: 0 } },
    seed: 19,
  });
  slide.add(strands);

  // ---- rings of light that run down the thread towards the lens, like a scan ----
  slide.add(
    proceduralRibbons(16, 72, RINGS, {
      width: 0.014,
      minPx: 1,
      hasGain: true,
      gain: 1.0,
      color: 0xbfd8ff,
    }),
  );

  // ---- the way in: long streaks either side of the line of flight. The opener flies down them; at rest they are behind the lens. ----
  const streaks: THREE.Vector3[][] = [];
  for (let i = 0; i < 260; i++) {
    const a = random() * Math.PI * 2;
    const r = 2.2 + random() * random() * 22;
    const z = 16 + random() * 200;
    const long = 10 + random() * 34;
    streaks.push([new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, z), new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, z + long)]);
  }
  const tunnel = staticRibbons(streaks, { width: 0.03, minPx: 1.1, gain: 1.3, taper: true, colors: (i) => (i % 5 === 0 ? new THREE.Color(ACCENTS[i % ACCENTS.length]).lerp(ivory, 0.5) : new THREE.Color(0xcfd8ff)) });
  slide.add(tunnel);

  // ---- depth: other threads far off, dust, a sleeve of motes, and a few soft lights near the lens ----
  const far: THREE.Vector3[][] = [];
  for (let i = 0; i < 70; i++) {
    const x = (random() - 0.5) * 120;
    const y = (random() - 0.5) * 60;
    const z = -30 - random() * 90;
    const lean = new THREE.Vector3((random() - 0.5) * 30, (random() - 0.5) * 14, 60 + random() * 40);
    const line: THREE.Vector3[] = [];
    for (let k = 0; k <= 24; k++) {
      const t = k / 24;
      line.push(new THREE.Vector3(x + lean.x * t + Math.sin(t * 5 + i) * 1.5, y + lean.y * t + Math.cos(t * 4 + i) * 1.2, z + lean.z * t));
    }
    far.push(line);
  }
  slide.add(staticRibbons(far, { width: 0.02, minPx: 1, color: 0x8f96b8, gain: 0.5, opacity: 0.55, pulse: 1.2, pulseN: 1, pulseSpeed: 0.06, taper: true }));
  slide.add(dust({ count: 3200, size: [90, 50, 130], centre: [4, 2, -40], color: 0xdcd6c8, gain: 1.1, point: 0.055, seed: 3 }));
  slide.add(
    dust({
      count: 620,
      size: [0, 0, 0],
      color: 0xfff1d8,
      gain: 0.8,
      point: 0.03,
      drift: 0.15,
      seed: 8,
      place: (r) => {
        const at = centre(r());
        const a = r() * Math.PI * 2;
        const d = 0.3 + r() * r() * 2.6;
        return [at.x + Math.cos(a) * d, at.y + Math.sin(a) * d, at.z];
      },
    }),
  );
  return {
    root,
    slide,
    update({ ch, intro, time }) {
      const u = strands.material.uniforms;
      u.uSpread.value = ch[6];
      u.uIntro.value = Math.min(1, intro * 1.25);
      // During the opener the thread draws itself from the star towards the lens.
      u.uReveal.value = intro >= 1 ? 2 : 0.05 + intro * 1.3;
      // The opener is a flight: the whole place starts far ahead and the camera comes down the streaks to it.
      const flown = intro < 0.5 ? 4 * intro * intro * intro : 1 - Math.pow(-2 * intro + 2, 3) / 2;
      slide.position.z = ch[2] - (1 - flown) * 190;
      tunnel.visible = intro < 1;
      tunnel.material.uniforms.uOpacity.value = Math.min(1, intro * 6) * (1 - Math.max(0, intro * 5 - 4));
      // The star is the light at the end of the thread. It fades as the camera sets off down it: it turns out to be a doorway.
      const gone = Math.min(1, ch[6] / 0.38);
      const lit = Math.min(1, intro * 1.6) * (1 - gone * gone * (3 - 2 * gone));
      star.material.opacity = lit;
      star.scale.setScalar(30 + Math.sin(time * 0.7) * 1.5 + lit * 4);
    },
  };
}
