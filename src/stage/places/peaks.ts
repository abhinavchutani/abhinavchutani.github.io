import * as THREE from "three";
import { ball, cyl, field, glow, matte, paint, put, rng, shell, type Place } from "../kit";

/**
 * Travel. Mountains at first light, seen from the air: this is where the
 * camera comes down to after orbit. A valley with a lake in it, a tent and
 * its fire on the shore, ridges either side, and the high range a long way
 * off with the sun coming up behind it.
 *
 * The land is a patch of the planet the camera has just left, at 1/166 the
 * size: it curves away with the planet's surface, so that on the way down
 * it lies on the globe instead of standing off it. Leaving, the camera goes
 * on down, into the lake, which turns into the blue of a drawing: the
 * blueprint the next place is drawn on.
 *
 * `q` is the leaving: the lake turns to drawing as the camera tips over to
 * fall towards it.
 */

/** How far the camera looks down at the land when it is at rest here (radians below level). */
export const TILT = 0.2;
/** How far below the point the camera looks at the ground lies: the camera is that much higher up. */
export const LIFT = 4;
/** One unit of this place, in units of the place it is reached from (the planet is 20 of those across its radius). */
export const SCALE = 0.006;
/** The planet's radius in units of this place. */
const CURVE = 20 / SCALE;
/** The lake, in the land's own coordinates (x across, z towards the camera), and how big. */
export const LAKE = { x: 2.8, z: -8, r: 3.4 };
/** How much smaller the drawing board is than this place, and the blue it is drawn in. */
export const BOARD = 0.08;
const BLUE = 0x1444c4;

/** Where a point of the land (x, height, z) stands in this place's own coordinates: the land is laid back by TILT and lies LIFT below. */
export function onLand(x: number, y: number, z: number) {
  return new THREE.Vector3(x, y - LIFT, z).applyAxisAngle(new THREE.Vector3(1, 0, 0), TILT);
}

const hash2 = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const noise2 = (x: number, y: number) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  let fx = x - ix;
  let fy = y - iy;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy) + (hash2(ix + 1, iy) - hash2(ix, iy)) * fx;
  const b = hash2(ix, iy + 1) + (hash2(ix + 1, iy + 1) - hash2(ix, iy + 1)) * fx;
  return a + (b - a) * fy;
};
/** Ridged noise: creases where the plain kind has crests, which is what makes rock read as rock. */
const ridged = (x: number, y: number, octaves = 5) => {
  let v = 0;
  let amp = 0.5;
  for (let i = 0; i < octaves; i++) {
    const n = 1 - Math.abs(noise2(x, y) * 2 - 1);
    v += amp * n * n;
    x = x * 2.07 + 13.1;
    y = y * 2.07 + 7.7;
    amp *= 0.5;
  }
  return v;
};
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * The height of the land at (x, z), before the planet's curve. A valley runs away from the camera with the
 * lake in it; ridges rise either side, higher the further off; and a long way off, the high range.
 */
function height(x: number, z: number) {
  const d = Math.hypot(x, z);
  // The valley floor: low and gently rolling, wider towards the camera.
  const across = Math.abs(x - LAKE.x * 0.6 + z * 0.08);
  const valley = smooth(4.5, 15 + Math.max(0, -z) * 0.12, across);
  const rock = ridged(x * 0.045 + 3.1, z * 0.045 + 1.7);
  // Ridges either side of the valley, growing with distance.
  const ridges = valley * (1.2 + rock * (2.2 + Math.min(1, d / 80) * 7));
  // The high range: a band a long way off, across the whole of the view.
  const band = smooth(140, 200, -z) * (1 - smooth(310, 380, -z));
  const range = band * (5 + ridged(x * 0.012 + 9.4, z * 0.02 + 2.2) * 30);
  // One peak higher than the rest, off to the left of the valley's line, and foothills in between.
  const crown = 30 * Math.exp(-(((x + 55) / 60) ** 2) - (((z + 250) / 55) ** 2)) * (0.75 + 0.5 * ridged(x * 0.03, z * 0.03));
  const foot = smooth(40, 90, -z) * (1 - smooth(150, 210, -z)) * valley * ridged(x * 0.03 + 5.5, z * 0.03 + 1.1) * 7;
  const floor = (noise2(x * 0.08, z * 0.08) - 0.5) * 0.6;
  // Dies away at the edge of the patch, into the plain land round it.
  const edge = 1 - smooth(330, 420, d);
  let h = (floor + ridges + range + crown + foot) * edge;
  // The lake lies in a hollow.
  const lake = Math.hypot(x - LAKE.x, z - LAKE.z);
  h = h * smooth(LAKE.r * 0.9, LAKE.r * 2.2, lake);
  // Round the lake the ground stands clear of the water (the drawing board lies just under it, and is larger).
  if (lake > LAKE.r * 1.12 && Math.abs(x - LAKE.x) < 19 && Math.abs(z - LAKE.z) < 15) h = Math.max(h, 0.12);
  return h - 0.38 * (1 - smooth(LAKE.r * 0.9, LAKE.r * 1.12, lake));
}

export function peaks(): Place {
  const { root, slide } = shell();
  const random = rng(44);

  // Everything here is built with y up, then laid back so that the camera looks down on it, from LIFT above the ground.
  const tilted = put(new THREE.Group(), 0, 0, 0, TILT, 0, 0);
  slide.add(tilted);
  const land = put(new THREE.Group(), 0, -LIFT, 0);
  tilted.add(land);

  // ---- the ground: a round patch, its rings crowded near the camera and spread out far off ----
  const RINGS = 170;
  const AROUND = 300;
  const RADIUS = 430;
  const positions = new Float32Array((RINGS + 1) * AROUND * 3);
  const colours = new Float32Array((RINGS + 1) * AROUND * 3);
  const at = { getX: (i: number) => positions[i * 3], getZ: (i: number) => positions[i * 3 + 2], count: (RINGS + 1) * AROUND };
  for (let i = 0; i <= RINGS; i++) {
    const r = RADIUS * Math.pow(i / RINGS, 2.2);
    for (let j = 0; j < AROUND; j++) {
      const a = (j / AROUND) * Math.PI * 2;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const k = (i * AROUND + j) * 3;
      positions[k] = x;
      positions[k + 1] = height(x, z) - (x * x + z * z) / (2 * CURVE);
      positions[k + 2] = z;
    }
  }
  const index: number[] = [];
  for (let i = 0; i < RINGS; i++) {
    for (let j = 0; j < AROUND; j++) {
      const a = i * AROUND + j;
      const b = i * AROUND + ((j + 1) % AROUND);
      const c = (i + 1) * AROUND + j;
      const d = (i + 1) * AROUND + ((j + 1) % AROUND);
      // Wound so that the faces look up.
      index.push(a, b, c, b, d, c);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  // The light is painted on, as it is at dawn: the sun just up behind the range to the right warms what faces
  // it, the rest of the sky lights everything blue, and distance hazes it all towards the colour of the horizon.
  const normals = geometry.attributes.normal as THREE.BufferAttribute;
  const meadow = new THREE.Color(0.16, 0.22, 0.13);
  const shore = new THREE.Color(0.26, 0.3, 0.2);
  const rockC = new THREE.Color(0.2, 0.19, 0.22);
  const scree = new THREE.Color(0.3, 0.27, 0.3);
  const snow = new THREE.Color(0.9, 0.9, 0.95);
  const sky = new THREE.Color(0.3, 0.34, 0.6);
  const sunlight = new THREE.Color(1.0, 0.6, 0.42);
  const horizon = new THREE.Color(0.42, 0.33, 0.45);
  // What the planet is coloured round the edge of the patch (see the planet's shader): where the land runs out into it.
  const plain = new THREE.Color(0.1, 0.12, 0.09);
  const toSun = new THREE.Vector3(0.42, 0.16, -1).normalize();
  const eye = new THREE.Vector3(0, LIFT + 12 * Math.sin(TILT), 12 * Math.cos(TILT));
  const albedo = new THREE.Color();
  const lit = new THREE.Color();
  const n = new THREE.Vector3();
  for (let i = 0; i < at.count; i++) {
    const x = at.getX(i);
    const z = at.getZ(i);
    const r = Math.hypot(x, z);
    const h = height(x, z);
    n.fromBufferAttribute(normals, i);
    const rough = noise2(x * 0.4, z * 0.4);
    const level = h / (6 + Math.min(1, r / 160) * 28);
    const steep = 1 - n.y;
    albedo.copy(meadow).lerp(shore, (1 - smooth(LAKE.r * 1.1, LAKE.r * 3, Math.hypot(x - LAKE.x, z - LAKE.z))) * 0.7).lerp(rockC, smooth(0.05, 0.25, level + steep * 0.5 + (rough - 0.5) * 0.15)).lerp(scree, rough * 0.25 * smooth(0.1, 0.3, level));
    // Snow lies on what is high and not too steep.
    const line = 0.4 + (rough - 0.5) * 0.18 + steep * 0.35;
    if (h > 2.2) albedo.lerp(snow, smooth(line, line + 0.12, level));
    const sun = Math.max(0, n.dot(toSun));
    lit.copy(sky).multiplyScalar(0.62 + 0.5 * n.y).add(new THREE.Color().copy(sunlight).multiplyScalar(sun * 1.7));
    albedo.multiply(lit);
    // Haze, more of it the further off from where the camera stands.
    const far = Math.hypot(x - eye.x, z - eye.z);
    albedo.lerp(horizon, 1 - Math.exp(-Math.pow(far / 420, 1.6)));
    albedo.lerp(plain, smooth(320, 420, r));
    colours[i * 3] = Math.min(1.25, albedo.r);
    colours[i * 3 + 1] = Math.min(1.25, albedo.g);
    colours[i * 3 + 2] = Math.min(1.25, albedo.b);
  }
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colours, 3));
  const ground = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }));
  land.add(ground);
  const surface = (x: number, z: number) => height(x, z) - (x * x + z * z) / (2 * CURVE);

  // ---- the lake: dark water with the dawn in it, which turns into a drawing on the way down ----
  const water = new THREE.ShaderMaterial({
    uniforms: {
      ...THREE.UniformsLib.fog,
      uShow: { value: 0 },
      uBlue: { value: new THREE.Color(BLUE) },
      uSky: { value: new THREE.Color(0.05, 0.07, 0.2) },
      uDawn: { value: new THREE.Color(1.0, 0.55, 0.42) },
      uTime: { value: 0 },
    },
    fog: true,
    vertexShader: /* glsl */ `
      #include <fog_pars_vertex>
      varying vec2 vAt;
      void main() {
        vAt = position.xy;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      #include <fog_pars_fragment>
      uniform float uShow;
      uniform vec3 uBlue, uSky, uDawn;
      uniform float uTime;
      varying vec2 vAt;
      float lines(vec2 p, float px) {
        vec2 g = abs(fract(p - 0.5) - 0.5) / (fwidth(p) * px);
        return 1.0 - min(min(g.x, g.y), 1.0);
      }
      float hash(vec2 p) {
        vec3 q = fract(vec3(p.xyx) * 0.1031);
        q += dot(q, q.yzx + 33.33);
        return fract((q.x + q.y) * q.z);
      }
      void main() {
        // The water: the sky in it, brighter to the far side where the dawn is, a ripple running across.
        float far = clamp(0.5 + vAt.y * 0.14, 0.0, 1.0);
        float ripple = sin(vAt.y * 9.0 + uTime * 1.3 + sin(vAt.x * 3.0) * 1.5) * 0.5 + 0.5;
        vec3 lake = mix(uSky * 0.6, uSky, far) + uDawn * pow(far, 4.0) * 0.4 + vec3(0.012) * ripple;
        // The drawing: the board's own blue, its coarse squares running out over the water (in the board's units:
        // one unit of the lake is 1/BOARD of them).
        vec2 p = vec2(vAt.x, vAt.y) / ${BOARD.toFixed(4)} - vec2(0.0, 4.0);
        float grid = lines(p / 32.0, 1.5) * 0.26 + lines(p / 8.0, 1.4) * 0.2 * (1.0 - smoothstep(0.25, 1.6, max(fwidth(p.x), fwidth(p.y))));
        vec3 sheet = uBlue + vec3(grid);
        // It spreads out from the middle of the lake as the camera tips over towards it.
        float r = length(vAt);
        float drawn = smoothstep(0.0, 0.2, uShow * 1.6 - r / ${(LAKE.r * 1.3).toFixed(2)});
        // Once it is all drawing, the water gives way to the board just under it (the same blue, with its drawing on it).
        if (drawn > 0.99 && hash(gl_FragCoord.xy) < smoothstep(0.78, 1.0, uShow)) discard;
        gl_FragColor = vec4(mix(lake, sheet, drawn), 1.0);
        #include <fog_fragment>
      }
    `,
  });
  // The water's own coordinates are the board's: its x across, its y away from the camera, centred on the lake.
  const lake = put(new THREE.Mesh(new THREE.CircleGeometry(LAKE.r * 1.4, 64), water), LAKE.x, -0.22, LAKE.z, -Math.PI / 2);
  land.add(lake);

  // ---- pines on the valley floor and the low slopes ----
  const pine = new THREE.ConeGeometry(1, 1, 6);
  pine.translate(0, 0.5, 0);
  const pines: [number, number, number, number][] = [];
  for (let i = 0; pines.length < 900 && i < 6000; i++) {
    const x = -40 + random() * 80;
    const z = -70 + random() * 84;
    const h = height(x, z);
    const lakeD = Math.hypot(x - LAKE.x, z - LAKE.z);
    if (h > 3.2 || lakeD < LAKE.r * 1.25) continue;
    if (noise2(x * 0.18 + 4, z * 0.18) < 0.42) continue;
    pines.push([x, surface(x, z) - 0.05, z, 0.25 + random() * 0.35]);
  }
  land.add(
    field(pine, new THREE.MeshBasicMaterial({ color: new THREE.Color(0.012, 0.03, 0.035), fog: false }), pines.length, (i, d) => {
      const [x, y, z, s] = pines[i];
      d.position.set(x, y, z);
      d.scale.set(s * 0.32, s, s * 0.32);
    }),
  );

  // ---- the tent on the shore, lit from inside, and its fire ----
  const camp = put(new THREE.Group(), LAKE.x - LAKE.r - 0.9, 0, LAKE.z + 1.6, 0, 0.6, 0, 0.32);
  camp.position.y = surface(camp.position.x, camp.position.z) + 0.02;
  const gable = new THREE.Shape();
  gable.moveTo(-1.1, 0);
  gable.lineTo(1.1, 0);
  gable.lineTo(0, 1.35);
  camp.add(put(new THREE.Mesh(new THREE.ExtrudeGeometry(gable, { depth: 2.4, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: 0xc46a3a, roughness: 0.9, emissive: 0xff8a3c, emissiveIntensity: 0.35, side: THREE.DoubleSide })), 0, 0, -1.2));
  const mouth = new THREE.Shape();
  mouth.moveTo(-0.5, 0);
  mouth.lineTo(0.5, 0);
  mouth.lineTo(0, 0.95);
  camp.add(put(new THREE.Mesh(new THREE.ShapeGeometry(mouth), glow(0xffb45c, 1.8)), 0, 0, 1.22));
  const fire = put(ball(0.22, glow(0xff8a3c, 3), 10), 1.7, 0.18, 2.3);
  camp.add(fire, put(cyl(0.34, 0.4, 0.1, matte(0x15110e, 1), 10), 1.7, 0.02, 2.3));
  land.add(camp);
  // Its smoke, going up in the still air.
  const smoke = paint(64, 64, (ctx, w) => {
    const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, "rgba(255,255,255,0.5)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.clearRect(0, 0, w, w);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, w);
  });
  const puffs: THREE.Sprite[] = [];
  for (let i = 0; i < 9; i++) {
    const puff = new THREE.Sprite(new THREE.SpriteMaterial({ map: smoke, color: 0xb9a9c8, transparent: true, depthWrite: false }));
    camp.add(puff);
    puffs.push(puff);
  }

  // ---- the sky: deep blue overhead, the colour of the haze along the horizon, warm towards the sun. It comes in
  // over the last part of the way down (from orbit there is no sky to see), and from then on it is the sky. ----
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(900, 48, 24),
    new THREE.ShaderMaterial({
      uniforms: { uShow: { value: 0 }, uSun: { value: toSun } },
      vertexShader: /* glsl */ `varying vec3 vDir; void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uShow;
        uniform vec3 uSun;
        varying vec3 vDir;
        void main() {
          float e = clamp(vDir.y, -0.2, 1.0);
          vec3 c = mix(vec3(${horizon.r.toFixed(3)}, ${horizon.g.toFixed(3)}, ${horizon.b.toFixed(3)}), vec3(0.12, 0.14, 0.36), smoothstep(0.0, 0.2, e));
          c = mix(c, vec3(0.03, 0.05, 0.16), smoothstep(0.18, 0.75, e));
          float toward = max(0.0, dot(normalize(vec3(vDir.x, 0.0, vDir.z)), normalize(vec3(uSun.x, 0.0, uSun.z))));
          c += vec3(1.0, 0.52, 0.36) * pow(toward, 5.0) * (1.0 - smoothstep(-0.02, 0.3, e)) * 0.75;
          gl_FragColor = vec4(c, uShow);
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      fog: false,
    }),
  );
  dome.renderOrder = -50;
  dome.frustumCulled = false;
  land.add(put(dome, 0, -30, 0));

  // ---- the sun, just coming up behind the range ----
  const sunMap = paint(128, 128, (ctx, w) => {
    const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.12, "rgba(255,240,220,0.9)");
    g.addColorStop(0.3, "rgba(255,180,140,0.25)");
    g.addColorStop(1, "rgba(255,160,120,0)");
    ctx.clearRect(0, 0, w, w);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, w);
  });
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunMap, color: new THREE.Color(1.6, 1.3, 1.1), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  sun.scale.setScalar(150);
  land.add(put(sun, 135, 14, -380));

  // A few last stars, high up.
  const stars: THREE.Vector3[] = [];
  for (let i = 0; i < 500; i++) {
    const a = -0.9 + random() * 1.8;
    const up = 0.12 + random() * 0.6;
    stars.push(new THREE.Vector3(Math.sin(a) * 600, Math.sin(up) * 600, -Math.cos(a) * 600));
  }
  land.add(
    field(new THREE.SphereGeometry(0.6, 6, 4), Object.assign(glow(0xe9e4ff, 1.1), { fog: false }), stars.length, (i, d) => {
      d.position.copy(stars[i]);
      d.scale.setScalar(0.5 + random());
    }),
  );

  return {
    root,
    slide,
    update({ ch, time, theta }) {
      // Leaving: the lake turns into the drawing as the camera tips over to fall into it.
      const leaving = ch[7] ?? 0;
      water.uniforms.uShow.value = Math.min(1, Math.max(0, leaving / 0.55));
      // The sky comes in over the last of the way down.
      dome.material.uniforms.uShow.value = smooth(0.62, 0.96, ch[6] ?? 1);
      water.uniforms.uTime.value = time;
      // The fire flickers; its smoke goes up and spreads.
      (fire.material as THREE.MeshBasicMaterial).color.setRGB(1, 0.55, 0.24).multiplyScalar(2.6 + Math.sin(time * 9.3) * 0.4 + Math.sin(time * 15.1) * 0.25);
      puffs.forEach((puff, i) => {
        const k = (time * 0.12 + i / puffs.length) % 1;
        puff.position.set(1.7 + Math.sin(k * 5 + i) * 0.3 + k * 1.2 + Math.sin(theta * 0.3) * k * 0.6, 0.5 + k * 7, 2.3 - k * 0.6);
        puff.scale.setScalar(0.5 + k * 2.6);
        puff.material.opacity = Math.sin(k * Math.PI) * 0.35;
      });
      // The sun's glow turns slowly, and with the wheel; the smoke drifts with it.
      sun.material.rotation = time * 0.02 + theta * 0.05;
    },
  };
}
