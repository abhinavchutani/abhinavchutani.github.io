import * as THREE from "three";
import { chapters, disciplines } from "../../content";
import { ball, box, cyl, dust, field, glow, matte, paint, put, rng, shell, shared, type Place } from "../kit";
import { bow, staticRibbons } from "../ribbons";

/**
 * 08 Now. Helsinki, at night, from a jetty across the harbour: a granite
 * quay with its lamps, the waterfront's pale facades, the cathedral on its
 * steps above them, the wheel, a ferry tied up, and all of it again upside
 * down in the water. Over it the aurora, and in the sky every discipline as
 * one constellation, joined in the order the journey met them by the same
 * thread that opened the page. It runs on past the last of them.
 */

const CURTAIN_VERTEX = /* glsl */ `
  uniform float uTime, uSeed;
  varying vec2 vUv;
  varying float vFold;
  void main() {
    vUv = uv;
    vec3 p = position;
    float x = p.x;
    // The curtain hangs in folds that drift along it.
    float fold = sin(x * 0.11 + uTime * 0.12 + uSeed) * 9.0 + sin(x * 0.31 - uTime * 0.19 + uSeed * 2.0) * 3.0;
    p.z += fold;
    p.y += sin(x * 0.07 + uTime * 0.1 + uSeed * 3.0) * 2.5 * (1.0 - uv.y);
    vFold = cos(x * 0.11 + uTime * 0.12 + uSeed);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const CURTAIN_FRAGMENT = /* glsl */ `
  uniform float uTime, uSeed, uGain;
  uniform vec3 uLow, uHigh;
  varying vec2 vUv;
  varying float vFold;
  float hash(float n) { return fract(sin(n) * 43758.5453); }
  float noise(float x) { float i = floor(x); float f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(hash(i), hash(i + 1.0), f); }
  void main() {
    // Rays: fine vertical streaks that shimmer; brightest along the lower hem, fading upwards.
    float rays = 0.4 + 0.6 * noise(vUv.x * 190.0 + uSeed * 9.0 + sin(uTime * 0.4 + vUv.x * 20.0) * 0.8);
    rays *= 0.55 + 0.45 * noise(vUv.x * 37.0 - uTime * 0.25);
    // Surges that travel along the curtain: the whole thing brightens and dims in slow waves.
    float surge = 0.55 + 0.75 * noise(vUv.x * 5.0 - uTime * 0.11 + uSeed) * (0.7 + 0.3 * sin(uTime * 0.23 + uSeed * 4.0));
    float rise = pow(1.0 - vUv.y, 2.2) * smoothstep(0.0, 0.03, vUv.y);
    float ends = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
    vec3 colour = mix(uLow, uHigh, smoothstep(0.08, 0.7, vUv.y));
    // A hot, pale edge right at the hem.
    colour += vec3(0.5, 0.6, 0.45) * smoothstep(0.1, 0.0, vUv.y);
    float a = rays * rise * ends * surge * uGain * (0.7 + 0.3 * vFold);
    gl_FragColor = vec4(colour * 1.5, a);
  }
`;

function curtain(wide: number, tall: number, seed: number, gain: number, low = 0x29ff8c, high = 0x8c4dff) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(wide, tall, 220, 1),
    new THREE.ShaderMaterial({
      uniforms: { uTime: shared.uTime, uSeed: { value: seed }, uGain: { value: gain }, uLow: { value: new THREE.Color(low) }, uHigh: { value: new THREE.Color(high) } },
      vertexShader: CURTAIN_VERTEX,
      fragmentShader: CURTAIN_FRAGMENT,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    }),
  );
  mesh.frustumCulled = false;
  return mesh;
}

/** Helsinki Cathedral, roughly: a white cube on steps, four porticoes, four small domes, a drum and a green dome. */
function cathedral() {
  const group = new THREE.Group();
  const white = matte(0xc4cfd6, 0.8);
  const copper = matte(0x3f8f78, 0.6, 0.2);
  const gold = glow(0xffd98a, 1.6);
  group.add(put(box(17, 1.2, 12, white), 0, 0.6, 0), put(box(14, 0.8, 10, white), 0, 1.6, 0));
  group.add(put(box(8.6, 6.4, 8.6, white), 0, 5.2, 0));
  const pediment = new THREE.Shape();
  pediment.moveTo(-3.3, 0);
  pediment.lineTo(3.3, 0);
  pediment.lineTo(0, 1.5);
  for (let side = 0; side < 4; side++) {
    const porch = put(new THREE.Group(), 0, 0, 0, 0, (side * Math.PI) / 2, 0);
    for (let i = 0; i < 6; i++) porch.add(put(cyl(0.26, 0.3, 4.8, white, 10), -2.75 + i * 1.1, 4.4, 5.3));
    porch.add(put(box(6.6, 0.5, 1.6, white), 0, 7.05, 5.0));
    porch.add(put(new THREE.Mesh(new THREE.ExtrudeGeometry(pediment, { depth: 1.5, bevelEnabled: false }), white), 0, 7.3, 4.3));
    // A small tower and dome on each corner.
    porch.add(put(box(1.9, 2.4, 1.9, white), 4.6, 9.4, 4.6));
    const small = ball(1.0, copper, 20);
    small.scale.y = 1.2;
    porch.add(put(small, 4.6, 10.9, 4.6), put(ball(0.14, gold, 8), 4.6, 12.3, 4.6));
    group.add(porch);
  }
  // Drum, ring of columns, dome, lantern, cross.
  group.add(put(cyl(2.9, 3.0, 3.6, white, 28), 0, 10.2, 0));
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    group.add(put(cyl(0.16, 0.16, 3.4, white, 8), Math.cos(a) * 3.25, 10.2, Math.sin(a) * 3.25));
  }
  group.add(put(cyl(3.5, 3.5, 0.3, white, 28), 0, 12.1, 0));
  const dome = ball(3.1, copper, 32);
  dome.scale.y = 1.25;
  group.add(put(dome, 0, 12.2, 0));
  group.add(put(cyl(0.5, 0.6, 1.4, white, 12), 0, 16.4, 0), put(ball(0.5, copper, 12), 0, 17.3, 0));
  group.add(put(box(0.1, 1.2, 0.1, gold), 0, 18.4, 0), put(box(0.6, 0.1, 0.1, gold), 0, 18.6, 0));
  // Gold stars on the dome, as on the real one.
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    group.add(put(ball(0.07, gold, 6), Math.cos(a) * 2.6, 14.3, Math.sin(a) * 2.6));
  }
  return group;
}

/** A facade: rows of tall windows, some lit; a darker ground floor; a cornice. */
function facade(tint: string, seed: number) {
  return paint(256, 256, (ctx, w, h) => {
    const r = rng(seed);
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.fillRect(0, h - 58, w, 58);
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(0, 0, w, 10);
    ctx.fillRect(0, h - 62, w, 5);
    for (let floor = 0; floor < 4; floor++) {
      for (let bay = 0; bay < 8; bay++) {
        const x = 14 + bay * 30;
        const y = 24 + floor * 44 + (floor === 3 ? 14 : 0);
        const tall = floor === 3 ? 32 : 28;
        ctx.fillStyle = r() < 0.34 ? `rgb(255,${190 + r() * 40},${110 + r() * 50})` : "rgba(8,12,22,0.92)";
        ctx.fillRect(x, y, 15, tall);
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(x + 7, y, 1, tall);
        ctx.fillRect(x, y + 12, 15, 1);
      }
    }
  });
}

/** The same facade, as light only: black wherever a window is dark. */
function windows(seed: number) {
  return paint(256, 256, (ctx, w, h) => {
    const r = rng(seed);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    for (let floor = 0; floor < 4; floor++) {
      for (let bay = 0; bay < 8; bay++) {
        const lit = r() < 0.34;
        const g = 190 + r() * 40;
        const b = 110 + r() * 50;
        if (lit) {
          ctx.fillStyle = `rgb(255,${g},${b})`;
          ctx.fillRect(14 + bay * 30, 24 + floor * 44 + (floor === 3 ? 14 : 0), 15, floor === 3 ? 32 : 28);
        }
      }
    }
  });
}

export function aurora(): Place {
  const { root, slide } = shell();
  const random = rng(60);
  const SEA = -3.4;
  const QUAY = 1.7;
  const SQUARE = 9; // x of the middle of the square, and of the cathedral behind it
  const anchors: Record<string, THREE.Object3D> = {};

  // ---- the town, built on its quay. Everything in here is drawn a second time, upside down, in the water. ----
  const town = new THREE.Group();
  const stone = paint(256, 64, (ctx, w, h) => {
    // Granite blocks, a string course along the top, the tide line along the foot.
    ctx.fillStyle = "#2b2f38";
    ctx.fillRect(0, 0, w, h);
    const r = rng(40);
    for (let row = 0; row < 4; row++) {
      for (let x = (row % 2) * 16 - 16; x < w; x += 32) {
        ctx.fillStyle = `rgb(${46 + r() * 22},${50 + r() * 22},${60 + r() * 24})`;
        ctx.fillRect(x + 1, 8 + row * 13, 30, 11);
      }
    }
    ctx.fillStyle = "#59606c";
    ctx.fillRect(0, 0, w, 7);
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, h - 7, w, 7);
  });
  stone.wrapS = THREE.RepeatWrapping;
  stone.repeat.set(46, 1);
  town.add(put(box(300, QUAY, 30, new THREE.MeshStandardMaterial({ map: stone, roughness: 0.85 })), 0, QUAY / 2, -4));
  // Lamp posts along the edge, and bollards between them.
  const iron = matte(0x14171c, 0.5, 0.6);
  const lampAt: number[] = [];
  for (let i = 0; i < 40; i++) lampAt.push(-120 + i * 6.2);
  town.add(field(new THREE.CylinderGeometry(0.06, 0.09, 2.6, 8), iron, lampAt.length, (i, d) => d.position.set(lampAt[i], QUAY + 1.3, 10.2)));
  town.add(field(new THREE.SphereGeometry(0.2, 10, 8), glow(0xffd9a0, 2.4), lampAt.length, (i, d) => d.position.set(lampAt[i], QUAY + 2.7, 10.2)));
  town.add(field(new THREE.CylinderGeometry(0.16, 0.2, 0.5, 8), iron, lampAt.length, (i, d) => d.position.set(lampAt[i] + 3.1, QUAY + 0.25, 10.4)));

  // The waterfront: a continuous front of four-storey houses, with a gap where the square opens to the harbour.
  const tints = ["#5b5340", "#4c5560", "#5e5a4e", "#474f48", "#5a4c44", "#50545e"];
  const walls = tints.map((tint, i) => facade(tint, 30 + i));
  const lights = tints.map((_, i) => windows(30 + i));
  const roof = matte(0x14171c, 0.7);
  let x = -118;
  let n = 0;
  while (x < 126) {
    const wide = 9 + random() * 6;
    const tall = 6.6 + random() * 3.2;
    if (Math.abs(x + wide / 2 - SQUARE) < 17) {
      x += wide;
      continue;
    }
    const map = walls[n % walls.length].clone();
    const emissiveMap = lights[n % lights.length].clone();
    for (const texture of [map, emissiveMap]) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.repeat.set(wide / 10, 1);
      texture.needsUpdate = true;
    }
    town.add(put(box(wide - 0.12, tall, 9, new THREE.MeshStandardMaterial({ map, emissiveMap, emissive: 0xffffff, emissiveIntensity: 0.95, roughness: 0.85 })), x + wide / 2, QUAY + tall / 2, 2.5));
    // A cornice, a low roof, a chimney.
    town.add(put(box(wide + 0.3, 0.5, 9.4, roof), x + wide / 2, QUAY + tall + 0.25, 2.5), put(box(wide * 0.82, 0.7, 6, roof), x + wide / 2, QUAY + tall + 0.8, 2.5));
    if (random() < 0.7) town.add(put(box(0.7, 1.3, 0.7, roof), x + wide * (0.2 + random() * 0.6), QUAY + tall + 1.4, 2));
    x += wide;
    n++;
  }
  // Roofs and towers further back, for depth.
  for (let i = 0; i < 34; i++) {
    const bx = -130 + i * 7.8 + random() * 3;
    if (Math.abs(bx - SQUARE) < 16) continue;
    const tall = 9 + random() * 7;
    town.add(put(box(6 + random() * 4, tall, 8, matte(0x0d1118, 0.9)), bx, QUAY + tall / 2, -12 - random() * 8));
  }

  // The square: broad steps up from the quay, and the cathedral at the top of them.
  const pale = matte(0x8f98a2, 0.85);
  for (let i = 0; i < 9; i++) town.add(put(box(30 - i * 1.1, 0.5, 2.2, pale), SQUARE, QUAY + 0.25 + i * 0.5, 4.5 - i * 2.0));
  town.add(put(box(34, 4.6, 22, pale), SQUARE, QUAY + 2.3, -24));
  town.add(put(cathedral(), SQUARE, QUAY + 4.6, -24, 0, 0.3, 0, 1.2));

  // The wheel on the quay, on its two legs.
  const frame = matte(0xa9b4bc, 0.6, 0.4);
  const wheelOf = () => {
    const wheel = put(new THREE.Group(), -22, QUAY + 9.2, 5);
    wheel.add(new THREE.Mesh(new THREE.TorusGeometry(7.4, 0.12, 8, 72), frame), new THREE.Mesh(new THREE.TorusGeometry(6.6, 0.06, 6, 72), frame));
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      wheel.add(put(box(0.06, 7.4, 0.06, frame), Math.cos(a) * 3.7, Math.sin(a) * 3.7, 0, 0, 0, a - Math.PI / 2));
      wheel.add(put(ball(0.3, glow(0xfff1d0, 1.6), 8), Math.cos(a) * 7.4, Math.sin(a) * 7.4, 0));
    }
    return wheel;
  };
  for (const side of [-1, 1]) town.add(put(box(0.24, 10, 0.24, frame), -22 + side * 2.6, QUAY + 4.6, 5, 0, 0, side * 0.27));

  // A ferry alongside.
  const ferry = put(new THREE.Group(), 34, 0, 13.5);
  const hull = new THREE.Shape();
  [[-7, 0], [7, 0], [8.4, 1.5], [-7.6, 1.5]].forEach(([hx, hy], i) => (i ? hull.lineTo(hx, hy) : hull.moveTo(hx, hy)));
  ferry.add(put(new THREE.Mesh(new THREE.ExtrudeGeometry(hull, { depth: 3.4, bevelEnabled: false }), matte(0x18222e, 0.6)), 0, 0, -1.7));
  ferry.add(put(box(14.6, 0.16, 3.5, matte(0x8f989e, 0.6)), 0.4, 1.58, 0));
  const cabin = paint(256, 32, (ctx, w, h) => {
    ctx.fillStyle = "#3a4046";
    ctx.fillRect(0, 0, w, h);
    for (let wx = 8; wx < w - 8; wx += 16) {
      ctx.fillStyle = "#ffd58a";
      ctx.fillRect(wx, 9, 10, 13);
    }
  });
  ferry.add(put(box(9.5, 1.5, 2.8, new THREE.MeshStandardMaterial({ map: cabin, emissiveMap: cabin, emissive: 0xffffff, emissiveIntensity: 1.1, roughness: 0.6 })), -0.6, 2.4, 0));
  ferry.add(put(box(4, 0.9, 2.2, matte(0x8f989e, 0.6)), -1.5, 3.6, 0), put(cyl(0.4, 0.5, 1.5, matte(0x8c1d22, 0.6), 12), -2.4, 4.6, 0), put(cyl(0.03, 0.03, 3, iron, 6), 3.2, 4.6, 0));
  town.add(ferry);

  const city = put(new THREE.Group(), 0, SEA, -74);
  slide.add(city);
  // The reflection: a copy of the town, flipped about the waterline, under a dark sheet of water.
  const mirror = town.clone(true);
  mirror.scale.y = -1;
  const wheel = wheelOf();
  const wheelBelow = wheelOf();
  town.add(wheel);
  mirror.add(wheelBelow);
  city.add(town, mirror);
  slide.add(put(new THREE.Mesh(new THREE.PlaneGeometry(700, 320), new THREE.MeshBasicMaterial({ color: 0x03101b, transparent: true, opacity: 0.84, depthWrite: false })), 0, SEA + 0.02, -120, -Math.PI / 2));

  // Light on the water, broken up by the swell: the aurora's, and a long streak from every lamp on the quay.
  const swell = paint(512, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const r = rng(90);
    for (let i = 0; i < 1100; i++) {
      const y = Math.pow(r(), 2.2) * h;
      const long = 14 + r() * 60 * (1 - y / h);
      ctx.fillStyle = `rgba(255,255,255,${(0.1 + r() * 0.5) * (1 - y / h)})`;
      ctx.fillRect(r() * w, y, long, 1 + r() * 1.6);
    }
  });
  const onWater = (color: THREE.ColorRepresentation, opacity: number, map: THREE.Texture) => new THREE.MeshBasicMaterial({ map, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending });
  const sheen = new THREE.Mesh(new THREE.PlaneGeometry(280, 66), onWater(0x4dffb0, 0.5, swell));
  slide.add(put(sheen, 0, SEA + 0.06, -31, -Math.PI / 2));
  const streak = paint(32, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "rgba(255,255,255,0.95)");
    g.addColorStop(0.3, "rgba(255,255,255,0.3)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(w * 0.3, 0, w * 0.4, h);
  });
  slide.add(put(field(new THREE.PlaneGeometry(0.9, 22), onWater(0xffc27a, 0.5, streak), lampAt.length, (i, d) => d.position.set(lampAt[i], 0, 0)), 0, SEA + 0.07, -74 + 10.2 + 11.4, -Math.PI / 2));

  // ---- this side of the harbour: a jetty, running out towards the square ----
  const planks = paint(128, 256, (ctx, w, h) => {
    ctx.fillStyle = "#1c1612";
    ctx.fillRect(0, 0, w, h);
    const r = rng(17);
    for (let y = 0; y < h; y += 16) {
      ctx.fillStyle = `rgb(${52 + r() * 22},${42 + r() * 16},${34 + r() * 12})`;
      ctx.fillRect(0, y + 1, w, 14);
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      for (const nx of [8, w - 10]) ctx.fillRect(nx, y + 7, 2, 2);
    }
  });
  planks.wrapT = THREE.RepeatWrapping;
  planks.repeat.set(1, 9);
  const jetty = put(new THREE.Group(), 2.4, SEA, 6, 0, -0.16, 0);
  jetty.add(put(box(3.2, 0.2, 40, new THREE.MeshStandardMaterial({ map: planks, roughness: 0.9 })), 0, 0.9, -18));
  const pile = matte(0x15110e, 0.9);
  for (let i = 0; i < 9; i++) for (const side of [-1, 1]) jetty.add(put(cyl(0.16, 0.18, 2.4, pile, 8), side * 1.5, 0.2 + (i % 2) * 0.25, -i * 4.7));
  for (const [lx, lz] of [[1.5, -9.4], [-1.5, -23.5], [1.5, -37.6]]) jetty.add(put(cyl(0.05, 0.05, 1.6, iron, 6), lx, 2.2, lz), put(ball(0.19, glow(0xffc88a, 2.8), 10), lx, 3.1, lz));
  slide.add(jetty);

  // Stars, all the way round.
  slide.add(dust({ count: 2400, size: [0, 0, 0], color: 0xe6ecff, gain: 1.1, point: 0.5, drift: 0, seed: 77, place: (r) => { const a = r() * Math.PI * 2; const up = Math.pow(r(), 0.7); const d = 520; return [Math.cos(a) * Math.sqrt(1 - up * up) * d, 12 + up * d, Math.sin(a) * Math.sqrt(1 - up * up) * d]; } }));

  // ---- the night itself: a dome of sky, so that it is night wherever this place is seen from (through the
  // library's window, too), whatever is painted behind the frame ----
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(900, 32, 20),
    new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `varying vec3 vDir; void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          float up = clamp(vDir.y, -1.0, 1.0);
          vec3 night = mix(vec3(0.012, 0.045, 0.085), vec3(0.002, 0.008, 0.03), smoothstep(-0.05, 0.6, up));
          night += vec3(0.0, 0.05, 0.045) * exp(-abs(up) * 9.0);
          gl_FragColor = vec4(night, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    }),
  );
  dome.renderOrder = -50;
  dome.frustumCulled = false;
  slide.add(dome);

  // ---- the aurora: five curtains at five depths, each with its own colours and its own weather ----
  slide.add(put(curtain(340, 80, 15.9, 0.26, 0x1fe0a0, 0x3b2ad0), 0, 52, -190, 0.06));
  slide.add(put(curtain(300, 58, 1.3, 0.75), -10, 39, -150, 0.1));
  slide.add(put(curtain(230, 46, 4.1, 0.6, 0x2affb0, 0xff4da6), 36, 33, -118, 0.12, 0.2));
  slide.add(put(curtain(190, 36, 7.7, 0.46), -34, 28, -98, 0.16, -0.25));
  slide.add(put(curtain(160, 30, 11.2, 0.34, 0x49ffd0, 0x6a5cff), 60, 26, -86, 0.14, 0.4));

  // ---- the constellation: every discipline, in the order the journey met them ----
  const sky = put(new THREE.Group(), 5.6, 6.6, -24);
  slide.add(sky);
  const at = (i: number) => new THREE.Vector3(-9.4 + i * 1.12 + Math.sin(i * 1.7) * 0.9, Math.sin(i * 0.9) * 2.3 + Math.cos(i * 2.3) * 1.0 + i * 0.08, Math.cos(i * 1.3) * 3.4);
  const spots = disciplines.map((_, i) => at(i));
  disciplines.forEach((node, i) => {
    const color = new THREE.Color(chapters[node.chapter].accent).lerp(new THREE.Color(0xffffff), 0.35);
    const star = put(ball(0.17, glow(color, 2.4), 12), spots[i].x, spots[i].y, spots[i].z);
    sky.add(star);
    anchors[node.key] = star;
  });
  // The thread: in from the left, through every one, and away to the horizon.
  const line = new THREE.CatmullRomCurve3([new THREE.Vector3(-34, 8, 12), new THREE.Vector3(-18, -1, 6), ...spots, new THREE.Vector3(16, 3, -18), new THREE.Vector3(30, -3, -60), new THREE.Vector3(60, -5, -150)], false, "catmullrom", 0.5);
  sky.add(staticRibbons([line.getPoints(520)], { width: 0.05, minPx: 1.6, color: new THREE.Color(1, 0.95, 0.86), gain: 1.15, pulse: 2.6, pulseN: 7, pulseSpeed: 0.08, taper: true }));
  // Where the disciplines lean on each other.
  const index = (key: string) => disciplines.findIndex((node) => node.key === key);
  const links: [string, string][] = [
    ["strings", "discipline"], ["strings", "musicality"], ["syntax", "orbital-guardian"], ["syntax", "economics"], ["design", "art-and-illustration"],
    ["innovation", "public-speaking"], ["robotics", "leadership"], ["techne", "orbital-guardian"], ["economics", "reading"], ["leadership", "symposium"], ["philosophy", "journaling"], ["reading", "philosophy"], ["economics", "leadership"],
  ];
  const lean = links.filter(([a, b]) => index(a) >= 0 && index(b) >= 0).map(([a, b]) => {
    const from = spots[index(a)];
    const to = spots[index(b)];
    return bow(from, to, from.clone().lerp(to, 0.5).add(new THREE.Vector3(0, 1.4, -1.5)), 28);
  });
  sky.add(staticRibbons(lean, { width: 0.02, minPx: 1, color: 0x9fc6ff, gain: 0.55, opacity: 0.6, pulse: 1.4, pulseN: 1, pulseSpeed: 0.2, taper: true }));

  // Stars.
  slide.add(dust({ count: 2800, size: [0, 0, 0], color: 0xdfe8ff, gain: 1.1, point: 0.3, drift: 0, seed: 15, place: (r) => [(r() - 0.5) * 440, SEA + 8 + r() * r() * 160, -100 - r() * 130] }));
  slide.add(dust({ count: 420, size: [60, 20, 50], centre: [0, 5, -12], color: 0xbfffe0, gain: 0.5, point: 0.04, seed: 16 }));

  return {
    root,
    slide,
    anchors,
    update({ time, theta }) {
      wheel.rotation.z = time * 0.05 + theta * 0.12;
      wheelBelow.rotation.z = time * 0.05 + theta * 0.12;
      sky.rotation.y = Math.sin(theta * 0.05) * 0.06;
      sheen.material.opacity = 0.42 + 0.12 * Math.sin(time * 0.23);
    },
  };
}
