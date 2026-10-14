import * as THREE from "three";
import { ball, beam, box, cyl, dust, matte, paint, picture, put, rng, shell, type Place } from "../kit";

const HALF = Math.PI / 2;
import { proceduralRibbons } from "../ribbons";

/**
 * 01 Sound. A museum gallery. Damask on the walls, a carpet down the
 * boards, five paintings of people making music (1597 to 1663, all from
 * The Met's open-access collection) in gilt frames under picture lights.
 * The violin is in a glass case, turning slowly, its strings shaking; on
 * the right, behind a rope, the drum kit that came later. The camera comes
 * in through the door in the front wall and leaves through the one in the
 * right-hand wall, to the study. Scrolling plays the strings harder.
 *
 * The instrument is built in its own space: x across, y along its length
 * from the end button to the scroll, z up out of the top plate.
 */

// Half the outline of the body, from the bottom of the lower bout to the neck: (half-width, along).
const OUTLINE: [number, number][] = [
  [0, 0], [0.5, 0.01], [0.9, 0.2], [1.04, 0.6], [0.99, 0.98], [0.86, 1.22], [0.9, 1.34], [0.63, 1.5], [0.56, 1.78],
  [0.62, 2.06], [0.84, 2.2], [0.78, 2.3], [0.84, 2.6], [0.8, 2.98], [0.62, 3.32], [0.3, 3.52], [0, 3.56],
];
const TOP = 0.37; // height of the top plate above the back

/** The outline of a violin's body, as a shape to extrude. */
export function bodyShape() {
  const outline = new THREE.Shape();
  outline.moveTo(0, 0);
  outline.splineThru(OUTLINE.slice(1).map(([x, y]) => new THREE.Vector2(x, y)));
  outline.splineThru(OUTLINE.slice(0, -1).reverse().map(([x, y]) => new THREE.Vector2(-x, y)));
  return outline;
}

// Each string is drawn three times a third of a cycle apart: the eye reads the blur of a bowed string.
const STRINGS = /* glsl */ `
  uniform float uAmp;
  vec3 path(float u, float id, float seed) {
    float s = floor(id / 3.0);
    float phase = mod(id, 3.0) * 2.0944;
    float k = s - 1.5;
    vec3 tail = vec3(k * 0.075, 1.1, 0.5);
    vec3 bridge = vec3(k * 0.112, 1.62, 0.745 - abs(k) * 0.02);
    vec3 nut = vec3(k * 0.056, 4.95, 0.655);
    vec3 peg = vec3(k * 0.03, 5.1 + s * 0.12, 0.5);
    float uu = clamp(u, 0.0, 1.0);
    if (uu < 0.1) return mix(tail, bridge, uu / 0.1);
    if (uu > 0.92) return mix(nut, peg, (uu - 0.92) / 0.08);
    float t = (uu - 0.1) / 0.82;
    vec3 p = mix(bridge, nut, t);
    float shake = sin(3.14159 * t * (1.0 + s)) * sin(uTime * (19.0 + s * 6.0) + phase);
    p.x += shake * uAmp * (0.03 - 0.004 * s);
    p.z += shake * uAmp * 0.008;
    return p;
  }
`;

function fHole(side: number, material: THREE.Material) {
  const group = new THREE.Group();
  // The centre line of the f: upper eye near the middle of the instrument, lower eye further out.
  const centre = (t: number) => new THREE.Vector2(side * (0.3 + 0.16 * t + 0.04 * Math.sin((t - 0.5) * Math.PI * 2)), 2.02 - 0.82 * t);
  const left: THREE.Vector2[] = [];
  const right: THREE.Vector2[] = [];
  for (let i = 0; i <= 28; i++) {
    const t = i / 28;
    const along = centre(Math.min(1, t + 0.02)).sub(centre(Math.max(0, t - 0.02))).normalize();
    const across = new THREE.Vector2(-along.y, along.x);
    const wide = 0.012 + 0.032 * Math.sin(Math.PI * t);
    left.push(centre(t).addScaledVector(across, wide));
    right.push(centre(t).addScaledVector(across, -wide));
  }
  group.add(new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([...left, ...right.reverse()])), material));
  for (const [t, r] of [[0.02, 0.042], [0.98, 0.058]] as const) {
    const eye = new THREE.Mesh(new THREE.CircleGeometry(r, 20), material);
    const at = centre(t);
    eye.position.set(at.x + side * (t < 0.5 ? -0.03 : 0.035), at.y, 0);
    group.add(eye);
  }
  const nick = centre(0.5);
  group.add(put(new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.016), material), nick.x, nick.y, 0));
  group.position.z = TOP + 0.004;
  return group;
}

/** The violin, with its bow. Returns the instrument and the uniform that shakes its strings. */
function instrument() {
  const v = new THREE.Group();
  const grain = paint(512, 1024, (ctx, w, h) => {
    // Sunburst varnish, long grain, and the flame of the maple across it.
    const burst = ctx.createRadialGradient(w / 2, h * 0.48, 30, w / 2, h * 0.5, h * 0.62);
    burst.addColorStop(0, "#c8701c");
    burst.addColorStop(0.5, "#8a3a10");
    burst.addColorStop(1, "#2e0e05");
    ctx.fillStyle = burst;
    ctx.fillRect(0, 0, w, h);
    const r = rng(9);
    for (let i = 0; i < 300; i++) {
      const x = r() * w;
      const dark = r() < 0.55;
      ctx.strokeStyle = dark ? `rgba(50,18,4,${0.05 + r() * 0.1})` : `rgba(255,205,130,${0.03 + r() * 0.07})`;
      ctx.lineWidth = 0.5 + r() * 1.8;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + (r() - 0.5) * 16, h * 0.33, x + (r() - 0.5) * 16, h * 0.66, x + (r() - 0.5) * 8, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 10) {
      ctx.fillStyle = `rgba(255,214,150,${0.02 + 0.04 * Math.abs(Math.sin(y * 0.047))})`;
      ctx.fillRect(0, y, w, 4);
    }
  });
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping;
  grain.repeat.set(0.45, 0.27);
  grain.offset.set(0.5, 0.02);
  const varnish = new THREE.MeshPhysicalMaterial({ map: grain, roughness: 0.34, clearcoat: 0.85, clearcoatRoughness: 0.14 });
  const maple = matte(0x8a4a16, 0.42);
  const ebony = matte(0x0c0a0d, 0.26, 0.25);
  const black = new THREE.MeshBasicMaterial({ color: 0x050302 });
  const inlaid = new THREE.MeshBasicMaterial({ color: 0x1c0a04 });

  const outline = bodyShape();
  v.add(new THREE.Mesh(new THREE.ExtrudeGeometry(outline, { depth: 0.34, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3, curveSegments: 20 }), varnish));
  // Purfling: the dark inlaid line just inside the edge, on the top and on the back.
  const band = new THREE.Shape(outline.getPoints(20).map((p) => new THREE.Vector2(p.x * 0.955, 1.78 + (p.y - 1.78) * 0.972)));
  band.holes.push(new THREE.Path(outline.getPoints(20).map((p) => new THREE.Vector2(p.x * 0.94, 1.78 + (p.y - 1.78) * 0.962)).reverse()));
  const purfling = new THREE.ShapeGeometry(band);
  v.add(put(new THREE.Mesh(purfling, inlaid), 0, 0, TOP + 0.002), put(new THREE.Mesh(purfling, inlaid), 0, 0, -0.032, 0, Math.PI, 0));
  v.add(fHole(1, black), fHole(-1, black));

  // Bridge: a thin maple arch standing between the nicks of the f-holes.
  const arch = new THREE.Shape();
  arch.moveTo(-0.24, 0);
  arch.lineTo(-0.2, 0.26);
  arch.quadraticCurveTo(0, 0.42, 0.2, 0.26);
  arch.lineTo(0.24, 0);
  arch.lineTo(0.12, 0);
  arch.quadraticCurveTo(0, 0.12, -0.12, 0);
  v.add(put(new THREE.Mesh(new THREE.ExtrudeGeometry(arch, { depth: 0.035, bevelEnabled: false }), matte(0xb98f58, 0.55)), 0, 1.64, TOP, Math.PI / 2));

  // Fingerboard, neck, pegbox, pegs, scroll.
  const taper = (y0: number, w0: number, y1: number, w1: number) => {
    const shape = new THREE.Shape();
    shape.moveTo(-w0 / 2, y0);
    shape.lineTo(w0 / 2, y0);
    shape.lineTo(w1 / 2, y1);
    shape.lineTo(-w1 / 2, y1);
    return shape;
  };
  v.add(put(new THREE.Mesh(new THREE.ExtrudeGeometry(taper(2.1, 0.46, 4.95, 0.27), { depth: 0.06, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2 }), ebony), 0, 0, 0.56));
  v.add(put(box(0.25, 1.75, 0.26, maple), 0, 4.1, 0.42));
  v.add(put(box(0.27, 0.64, 0.3, maple), 0, 5.27, 0.4));
  v.add(put(box(0.28, 0.05, 0.1, ebony), 0, 4.97, 0.6)); // nut
  for (let i = 0; i < 4; i++) {
    const y = 5.08 + i * 0.13;
    const side = i % 2 === 0 ? 1 : -1;
    v.add(put(cyl(0.028, 0.035, 0.6, ebony, 10), side * 0.16, y, 0.42, 0, 0, Math.PI / 2));
    const head = put(ball(0.085, ebony, 12), side * 0.5, y, 0.42);
    head.scale.set(0.55, 1, 1.25);
    v.add(head);
  }
  const curl: THREE.Vector3[] = [];
  for (let i = 0; i <= 44; i++) {
    const a = (i / 44) * Math.PI * 2 * 2.2;
    const r = 0.27 * (1 - i / 52);
    curl.push(new THREE.Vector3(0, 5.72 + r * Math.cos(a + 2.4), 0.2 + r * Math.sin(a + 2.4)));
  }
  v.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curl), 80, 0.105, 10), maple));

  // Tailpiece, chinrest, end button.
  v.add(put(new THREE.Mesh(new THREE.ExtrudeGeometry(taper(0.2, 0.2, 1.12, 0.38), { depth: 0.05, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2 }), ebony), 0, 0, 0.43));
  const chin = cyl(0.33, 0.3, 0.07, ebony, 28);
  chin.scale.set(1, 1, 0.78);
  v.add(put(chin, -0.5, 0.36, TOP + 0.05, Math.PI / 2));
  v.add(put(ball(0.06, ebony, 10), 0, -0.04, 0.18));

  const amp = { value: 1 };
  v.add(
    proceduralRibbons(12, 160, STRINGS, {
      width: 0.011,
      minPx: 1.1,
      gain: 0.5,
      opacity: 0.85,
      pulse: 0.9,
      pulseN: 1,
      pulseSpeed: 0.7,
      colors: () => new THREE.Color(1.0, 0.94, 0.84),
      pulseColors: () => new THREE.Color(1.0, 0.7, 0.3),
      widths: (i) => 1.5 - Math.floor(i / 3) * 0.3,
      uniforms: { uAmp: amp },
    }),
  );
  return { v, amp };
}

function bowOf() {
  const ebony = matte(0x0c0a0d, 0.26, 0.25);
  const bow = new THREE.Group();
  bow.add(put(cyl(0.02, 0.026, 5.6, matte(0x6b2c12, 0.35), 10), 0, 0, 0.16, 0, 0, Math.PI / 2));
  bow.add(box(5.2, 0.05, 0.006, matte(0xb9b19c, 0.9)));
  bow.add(put(box(0.34, 0.085, 0.15, ebony), 2.55, 0, 0.08), put(box(0.1, 0.06, 0.16, matte(0x8f897a, 0.6)), -2.72, 0, 0.08));
  return bow;
}

function drumKit() {
  const kit = new THREE.Group();
  const lacquer = matte(0x5e0d0b, 0.3, 0.3);
  const chrome = new THREE.MeshStandardMaterial({ color: 0x9a9aa2, roughness: 0.22, metalness: 1 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xb8842a, roughness: 0.32, metalness: 1 });
  const skin = matte(0x8f8778, 0.8);

  /** A drum standing on y: shell, two hoops, a batter head. */
  const drum = (r: number, h: number) => {
    const g = new THREE.Group();
    g.add(cyl(r, r, h, lacquer, 40));
    g.add(put(cyl(r * 0.985, r * 0.985, 0.012, skin, 40), 0, h / 2 + 0.006, 0));
    for (const y of [h / 2, -h / 2]) g.add(put(new THREE.Mesh(new THREE.TorusGeometry(r + 0.012, 0.028, 8, 48), chrome), 0, y, 0, Math.PI / 2));
    return g;
  };
  const cymbal = (r: number) => {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.ConeGeometry(r, r * 0.09, 48, 1, true), Object.assign(brass.clone(), { side: THREE.DoubleSide })));
    g.add(put(ball(r * 0.17, brass, 16), 0, r * 0.02, 0));
    return g;
  };
  const stand = (h: number) => put(cyl(0.03, 0.03, h, chrome, 10), 0, h / 2, 0);

  const kick = drum(1.2, 1.0);
  kit.add(put(kick, 0, 1.2, 0, Math.PI / 2));
  kit.add(put(drum(0.58, 0.3), -1.55, 1.75, 0.5, 0.12, 0, 0.06), put(stand(1.6), -1.55, 0, 0.5));
  kit.add(put(drum(0.46, 0.42), -0.62, 2.85, 0.1, 0.5, 0, 0.1), put(drum(0.52, 0.46), 0.62, 2.85, 0.1, 0.5, 0, -0.1));
  kit.add(put(drum(0.72, 0.9), 1.95, 1.3, 0.55, 0.06));
  for (const x of [1.4, 2.5]) kit.add(put(stand(0.9), x, 0, 0.6));
  const hat = new THREE.Group();
  hat.add(put(cymbal(0.58), 0, 2.32, 0), put(cymbal(0.58), 0, 2.26, 0, Math.PI), stand(2.3));
  kit.add(put(hat, -2.55, 0, 0.35));
  const crash = cymbal(0.78);
  const ride = cymbal(0.92);
  kit.add(put(crash, -1.7, 3.95, -0.5, 0.3, 0, 0.22), put(stand(3.9), -1.7, 0, -0.5));
  kit.add(put(ride, 2.25, 3.5, -0.35, 0.34, 0, -0.26), put(stand(3.45), 2.25, 0, -0.35));
  const wood = matte(0xd8b27a, 0.5);
  kit.add(put(cyl(0.022, 0.03, 1.5, wood, 8), -1.5, 1.95, 0.55, 0.12, 0.3, Math.PI / 2 + 0.1), put(cyl(0.022, 0.03, 1.5, wood, 8), -1.62, 1.96, 0.45, 0.12, -0.25, Math.PI / 2 - 0.05));
  return { kit, kick, crash, ride, hat };
}

// ---- the room ----

/** Damask: an ogee lattice with a palmette in each cell, tone on tone. */
function damask() {
  const texture = paint(256, 384, (ctx, w, h) => {
    ctx.fillStyle = "#2c0a10";
    ctx.fillRect(0, 0, w, h);
    const cell = (cx: number, cy: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      // The almond that frames the cell.
      ctx.strokeStyle = "rgba(214,160,92,0.16)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -h / 2);
      ctx.bezierCurveTo(w * 0.56, -h * 0.24, w * 0.56, h * 0.24, 0, h / 2);
      ctx.bezierCurveTo(-w * 0.56, h * 0.24, -w * 0.56, -h * 0.24, 0, -h / 2);
      ctx.stroke();
      // The palmette: a fan of leaves, a pair of scrolls, a bud.
      ctx.fillStyle = "rgba(204,140,84,0.12)";
      for (let i = -3; i <= 3; i++) {
        ctx.save();
        ctx.rotate(i * 0.36);
        ctx.beginPath();
        ctx.ellipse(0, -h * 0.13, w * 0.045, h * 0.115, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(side * w * 0.13, h * 0.1, w * 0.1, h * 0.05, side * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(side * w * 0.2, h * 0.21, w * 0.055, h * 0.03, side * -0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.ellipse(0, h * 0.2, w * 0.035, h * 0.075, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, w * 0.045, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    for (const [x, y] of [[w / 2, h / 2], [0, 0], [w, 0], [0, h], [w, h]]) cell(x, y);
    // The weave: fine vertical threads.
    for (let x = 0; x < w; x += 3) {
      ctx.fillStyle = `rgba(0,0,0,${0.05 + 0.05 * Math.sin(x * 1.7)})`;
      ctx.fillRect(x, 0, 1, h);
    }
  });
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/** Wainscot: a run of raised panels in dark walnut. */
function panelling() {
  const texture = paint(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#24110a";
    ctx.fillRect(0, 0, w, h);
    const r = rng(12);
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = `rgba(${90 + r() * 50},${48 + r() * 24},${24 + r() * 12},${0.05 + r() * 0.07})`;
      ctx.fillRect(0, r() * h, w, 1 + r() * 2);
    }
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.lineWidth = 6;
    ctx.strokeRect(26, 30, w - 52, h - 60);
    ctx.strokeStyle = "rgba(190,120,60,0.22)";
    ctx.lineWidth = 2;
    ctx.strokeRect(34, 38, w - 68, h - 76);
    ctx.strokeRect(20, 24, w - 40, h - 48);
  });
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/** Parquet, laid herringbone. */
function parquet() {
  const texture = paint(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#2b1508";
    ctx.fillRect(0, 0, w, h);
    const r = rng(31);
    const long = 64;
    const wide = 16;
    for (let row = -2; row < 10; row++) {
      for (let col = -2; col < 10; col++) {
        for (const flip of [0, 1]) {
          ctx.save();
          ctx.translate(col * long + (flip ? long / 2 : 0) + ((row % 2) * long) / 2, row * long * 0.5 + (flip ? 0 : 0));
          ctx.rotate(flip ? Math.PI / 4 : -Math.PI / 4);
          ctx.fillStyle = `rgb(${70 + r() * 34},${36 + r() * 16},${15 + r() * 8})`;
          ctx.fillRect(1, 1, long - 2, wide - 2);
          ctx.restore();
        }
      }
    }
  });
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

const gilt = new THREE.MeshStandardMaterial({ color: 0x7c5a1c, roughness: 0.46, metalness: 1 });

/** A painting in a gilt frame, with a picture light over it and a card beside it. */
function framed(file: string, wide: number, tall: number) {
  const g = new THREE.Group();
  const canvas = new THREE.Mesh(new THREE.PlaneGeometry(wide, tall), new THREE.MeshBasicMaterial({ map: picture(file), color: new THREE.Color(0.94, 0.9, 0.84) }));
  g.add(canvas);
  const bar = 0.36;
  // Outer moulding, a step, and a thin inner slip: three boxes to a side.
  for (const [w, h, x, y] of [[wide + bar * 2, bar, 0, tall / 2 + bar / 2], [wide + bar * 2, bar, 0, -tall / 2 - bar / 2], [bar, tall, -wide / 2 - bar / 2, 0], [bar, tall, wide / 2 + bar / 2, 0]] as const) {
    g.add(put(box(w, h, 0.26, gilt), x, y, 0.05));
    g.add(put(box(w * (w > h ? 1 : 0.5) + (w > h ? 0.16 : 0), h * (w > h ? 0.5 : 1) + (w > h ? 0 : 0.16), 0.36, gilt), x + (w > h ? 0 : Math.sign(x) * 0.12), y + (w > h ? Math.sign(y) * 0.12 : 0), 0.03));
  }
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) g.add(put(ball(0.2, gilt, 12), sx * (wide / 2 + bar * 0.62), sy * (tall / 2 + bar * 0.62), 0.14));
  g.add(put(box(wide + bar * 2.5, tall + bar * 2.5, 0.06, matte(0x120505, 0.9)), 0, 0, -0.06));
  // The light: a brass tube on an arm, and what it does to the wall.
  g.add(put(cyl(0.07, 0.07, wide * 0.55, gilt, 10), 0, tall / 2 + bar + 0.5, 0.55, 0, 0, Math.PI / 2), put(box(0.05, 0.05, 0.55, gilt), 0, tall / 2 + bar + 0.5, 0.28));
  const wash = paint(64, 64, (ctx, w) => {
    ctx.clearRect(0, 0, w, w);
    const glowing = ctx.createRadialGradient(w / 2, w * 0.3, 0, w / 2, w * 0.3, w * 0.5);
    glowing.addColorStop(0, "rgba(255,214,150,0.5)");
    glowing.addColorStop(0.6, "rgba(255,214,150,0.12)");
    glowing.addColorStop(1, "rgba(255,214,150,0)");
    ctx.fillStyle = glowing;
    ctx.fillRect(0, 0, w, w);
  });
  g.add(put(new THREE.Mesh(new THREE.PlaneGeometry(wide + 3.4, tall + 3), new THREE.MeshBasicMaterial({ map: wash, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.4 })), 0, 0.4, -0.02));
  g.add(put(box(0.62, 0.36, 0.02, matte(0xd8d0bd, 0.8)), wide / 2 + bar + 0.75, -tall / 2 + 0.2, 0));
  return g;
}

/** A brass post for a rope. */
function post() {
  const g = new THREE.Group();
  g.add(put(cyl(0.32, 0.36, 0.08, gilt, 24), 0, 0.04, 0), put(cyl(0.05, 0.05, 1.5, gilt, 12), 0, 0.8, 0), put(ball(0.11, gilt, 12), 0, 1.6, 0));
  return g;
}

/** A wall with a doorway in it: a rectangle with a hole, in its own x (along the wall) and y (up). */
function wallWithDoor(wide: number, floor: number, top: number, doorAt: number, doorWide: number, doorTop: number, material: THREE.Material) {
  const shape = new THREE.Shape();
  shape.moveTo(-wide / 2, floor);
  shape.lineTo(wide / 2, floor);
  shape.lineTo(wide / 2, top);
  shape.lineTo(-wide / 2, top);
  const hole = new THREE.Path();
  hole.moveTo(doorAt - doorWide / 2, floor);
  hole.lineTo(doorAt - doorWide / 2, doorTop);
  hole.lineTo(doorAt + doorWide / 2, doorTop);
  hole.lineTo(doorAt + doorWide / 2, floor);
  shape.holes.push(hole);
  return new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
}

/** The architrave round a doorway: two jambs and a head, with some depth to them. */
function doorCase(doorWide: number, floor: number, doorTop: number, deep: number, material: THREE.Material) {
  const g = new THREE.Group();
  const tall = doorTop - floor;
  for (const side of [-1, 1]) g.add(put(box(0.5, tall + 0.5, deep, material), side * (doorWide / 2 + 0.25), floor + tall / 2 + 0.25, 0));
  g.add(put(box(doorWide + 1.4, 0.6, deep + 0.1, material), 0, doorTop + 0.3, 0), put(box(doorWide + 1.9, 0.22, deep + 0.3, material), 0, doorTop + 0.7, 0));
  return g;
}

/**
 * Wallpaper: lit by the lamps and by a little of its own colour for the light of the room. (Paper has no
 * shine to speak of, so it is not worth the reflections a full material works out for every pixel of four walls.)
 */
function wallpaper(map: THREE.Texture) {
  return new THREE.MeshLambertMaterial({ map, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: 0.22 });
}

export function violin(): Place {
  const { root, slide } = shell();
  const FLOOR = -4.4;
  const TOPS = 9.6;
  const BACK = -12;
  const FRONT = 40; // the wall the camera comes in through
  const LEFT = -26;
  const RIGHT = 17; // the wall with the door to the study

  // ---- the gallery: four walls, a floor, a ceiling ----
  const room = new THREE.Group();
  slide.add(room);
  const paperOf = (across: number, up: number) => {
    const map = damask();
    map.repeat.set(across, up);
    return wallpaper(map);
  };
  const dadoOf = (across: number) => {
    const map = panelling();
    map.repeat.set(across, 1);
    return new THREE.MeshStandardMaterial({ map, roughness: 0.55 });
  };
  const wide = RIGHT - LEFT;
  const deep = FRONT - BACK;
  const midX = (LEFT + RIGHT) / 2;
  const midZ = (FRONT + BACK) / 2;
  const tall = TOPS - FLOOR;
  // Back wall: paper, dado, rails; and at its left-hand end a tall doorway, which is the way on to the library.
  // (A ShapeGeometry's UVs are its own coordinates, so the paper on a wall with a hole in it repeats per unit.)
  const WAY = { x: -19, wide: 6.6, top: 5.4 };
  const perUnit = damask();
  perUnit.repeat.set(1 / 2.1, 1 / 1.6);
  const papered = wallpaper(perUnit);
  room.add(put(wallWithDoor(wide, FLOOR, TOPS, WAY.x - midX, WAY.wide, WAY.top, papered), midX, 0, BACK));
  // Dado and rails stop either side of it.
  const leftOf = WAY.x - WAY.wide / 2 - LEFT;
  const rightOf = RIGHT - (WAY.x + WAY.wide / 2);
  for (const [span, at] of [[leftOf, LEFT + leftOf / 2], [rightOf, RIGHT - rightOf / 2]]) {
    room.add(put(new THREE.Mesh(new THREE.PlaneGeometry(span, 2.4), dadoOf(span / 3)), at, FLOOR + 1.2, BACK + 0.06));
    room.add(put(box(span, 0.14, 0.2, gilt), at, FLOOR + 2.44, BACK + 0.1), put(box(span, 0.3, 0.16, matte(0x1a0b06, 0.5)), at, FLOOR + 0.15, BACK + 0.12));
  }
  room.add(put(box(wide, 0.1, 0.14, gilt), midX, 7.4, BACK + 0.08));
  room.add(put(doorCase(WAY.wide, FLOOR, WAY.top, 0.8, matte(0x2a140b, 0.5)), WAY.x, 0, BACK + 0.2));
  // Its two doors: panelled, with a brass pull each. They are shut until the camera makes for them, and
  // then they swing away into the library.
  const high = WAY.top - FLOOR;
  const doors = [-1, 1].map((side) => {
    const hinge = put(new THREE.Group(), WAY.x + (side * WAY.wide) / 2, 0, BACK);
    hinge.add(put(box(WAY.wide / 2, high, 0.16, matte(0x24120a, 0.55)), (-side * WAY.wide) / 4, FLOOR + high / 2, 0));
    for (const y of [0.24, 0.66]) hinge.add(put(box(WAY.wide / 2 - 0.7, high * 0.3, 0.05, matte(0x3a1d10, 0.5)), (-side * WAY.wide) / 4, FLOOR + high * y, 0.1));
    hinge.add(put(cyl(0.05, 0.05, 0.9, gilt, 10), -side * (WAY.wide / 2 - 0.35), FLOOR + high * 0.45, 0.18));
    room.add(hinge);
    return { hinge, side };
  });
  // Left wall.
  room.add(put(new THREE.Mesh(new THREE.PlaneGeometry(deep, tall), paperOf(deep / 2.1, tall / 1.6)), LEFT, FLOOR + tall / 2, midZ, 0, HALF, 0));
  room.add(put(new THREE.Mesh(new THREE.PlaneGeometry(deep, 2.4), dadoOf(deep / 3)), LEFT + 0.06, FLOOR + 1.2, midZ, 0, HALF, 0));
  // Right wall.
  room.add(put(new THREE.Mesh(new THREE.PlaneGeometry(deep, tall), paperOf(deep / 2.1, tall / 1.6)), RIGHT, FLOOR + tall / 2, midZ, 0, -HALF, 0));
  room.add(put(new THREE.Mesh(new THREE.PlaneGeometry(deep, 2.4), dadoOf(deep / 3)), RIGHT - 0.06, FLOOR + 1.2, midZ, 0, -HALF, 0));
  // Front wall, behind the camera. (The left wall is only ever seen from inside: from the study next door,
  // which is how the camera arrives, there is nothing there and the room stands open like a set.)
  room.add(put(new THREE.Mesh(new THREE.PlaneGeometry(wide, tall), paperOf(wide / 2.1, tall / 1.6)), midX, FLOOR + tall / 2, FRONT, 0, Math.PI, 0));
  // Floor, carpet, ceiling.
  const boards = parquet();
  boards.repeat.set(wide / 4.6, deep / 4.6);
  room.add(put(new THREE.Mesh(new THREE.PlaneGeometry(wide, deep + 2), new THREE.MeshStandardMaterial({ map: boards, roughness: 0.38, metalness: 0.05 })), midX, FLOOR, midZ + 1, -HALF));
  const carpet = paint(256, 64, (ctx, w, h) => {
    ctx.fillStyle = "#4e0d15";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#a67c2c";
    ctx.fillRect(12, 0, 5, h);
    ctx.fillRect(w - 17, 0, 5, h);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    for (let x = 30; x < w - 30; x += 4) ctx.fillRect(x, 0, 1, h);
  });
  carpet.wrapT = THREE.RepeatWrapping;
  carpet.repeat.set(1, 14);
  // The runner, down the middle of the room.
  room.add(put(new THREE.Mesh(new THREE.PlaneGeometry(6.4, deep + 2), new THREE.MeshStandardMaterial({ map: carpet, roughness: 0.95 })), 0, FLOOR + 0.02, midZ + 1, -HALF));
  const coffer = paint(128, 128, (ctx, w) => {
    ctx.fillStyle = "#120807";
    ctx.fillRect(0, 0, w, w);
    ctx.strokeStyle = "#3a2414";
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, w - 10, w - 10);
    ctx.fillStyle = "rgba(255,214,160,0.5)";
    ctx.fillRect(44, 44, 40, 40);
  });
  coffer.wrapS = coffer.wrapT = THREE.RepeatWrapping;
  coffer.repeat.set(wide / 5, deep / 5);
  room.add(put(new THREE.Mesh(new THREE.PlaneGeometry(wide, deep), new THREE.MeshBasicMaterial({ map: coffer, color: new THREE.Color(0.75, 0.75, 0.75) })), midX, TOPS, midZ, HALF));

  // The paintings. All five are in the public domain (The Met, Open Access).
  const hang: [string, number, number, number][] = [
    ["lute-player", 3.4, 4.43, -12.6],
    ["musicians", 7.4, 5.74, -4.4],
    ["woman-with-a-lute", 3.7, 4.24, 4.2],
    ["allegory-of-music", 6.4, 4.71, 11.6],
  ];
  for (const [file, w, h, x] of hang) room.add(put(framed(`./art/${file}.jpg`, w, h), x, 1.5, BACK + 0.24));
  room.add(put(framed("./art/boy-with-a-lute.jpg", 3.3, 4.02), RIGHT - 0.24, 1.5, 5, 0, -HALF, 0));

  // ---- on the right: the kit, on a dais, behind a rope ----
  const { kit, kick, crash, ride, hat } = drumKit();
  const dais = put(new THREE.Group(), 6.2, FLOOR, -4.6, 0, -0.22, 0);
  dais.add(put(cyl(3.7, 3.8, 0.3, matte(0x1c0f0a, 0.5), 48), 0, 0.15, 0), put(kit, 0, 0.3, 0.2, 0, 0.12, 0, 0.84));
  const velvet = matte(0x6e0c16, 0.9);
  const stands: [number, number][] = [[-4.4, 3.4], [-2.2, 4.5], [0, 4.8], [2.2, 4.5], [4.4, 3.4]];
  stands.forEach(([x, z], i) => {
    dais.add(put(post(), x, 0, z));
    if (i === 0) return;
    const [px, pz] = stands[i - 1];
    const sag = new THREE.QuadraticBezierCurve3(new THREE.Vector3(px, 1.5, pz), new THREE.Vector3((px + x) / 2, 0.95, (pz + z) / 2), new THREE.Vector3(x, 1.5, z));
    dais.add(new THREE.Mesh(new THREE.TubeGeometry(sag, 16, 0.045, 8), velvet));
  });
  room.add(dais);
  room.add(put(beam(5.5, 14, 0xffc27a, 0.045), 6.2, TOPS, -4.4));

  // ---- beside it: the violin, in a glass case ----
  const { v, amp } = instrument();
  const cabinet = put(new THREE.Group(), 0.7, FLOOR, 1.4, 0, 0.3, 0);
  const walnut = panelling();
  walnut.repeat.set(1, 1);
  cabinet.add(put(box(2.9, 1.5, 2.9, new THREE.MeshStandardMaterial({ map: walnut, roughness: 0.5 })), 0, 0.75, 0), put(box(3.1, 0.12, 3.1, gilt), 0, 1.56, 0));
  cabinet.add(put(box(1.2, 0.34, 0.03, gilt), 0, 0.95, 1.47)); // the plate
  const CASE = { w: 2.6, h: 5.3, base: 1.62 };
  // Brass at every edge; glass between.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cabinet.add(put(box(0.07, CASE.h, 0.07, gilt), (sx * CASE.w) / 2, CASE.base + CASE.h / 2, (sz * CASE.w) / 2));
  for (const y of [CASE.base, CASE.base + CASE.h]) {
    for (const s of [-1, 1]) cabinet.add(put(box(CASE.w + 0.07, 0.07, 0.07, gilt), 0, y, (s * CASE.w) / 2), put(box(0.07, 0.07, CASE.w + 0.07, gilt), (s * CASE.w) / 2, y, 0));
  }
  cabinet.add(put(box(CASE.w, 0.1, CASE.w, matte(0x1a120c, 0.5)), 0, CASE.base + CASE.h + 0.05, 0));
  const glass = new THREE.MeshStandardMaterial({ color: 0xbfd6e2, roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 3 });
  for (let i = 0; i < 4; i++) cabinet.add(put(new THREE.Mesh(new THREE.PlaneGeometry(CASE.w, CASE.h), glass), Math.sin((i * Math.PI) / 2) * (CASE.w / 2), CASE.base + CASE.h / 2, Math.cos((i * Math.PI) / 2) * (CASE.w / 2), 0, (i * Math.PI) / 2, 0));
  // The instrument stands on its end button on a small stand, and turns.
  const spin = put(new THREE.Group(), 0, CASE.base + 0.45, 0);
  spin.add(put(v, 0, 0, -0.12, 0, 0, 0, 0.74));
  cabinet.add(spin, put(cyl(0.5, 0.6, 0.12, matte(0x1a120c, 0.5), 24), 0, CASE.base + 0.06, 0), put(cyl(0.05, 0.05, 0.36, gilt, 8), 0, CASE.base + 0.28, 0));
  const bow = put(bowOf(), 0.95, CASE.base + 2.5, -0.75, 0, 0, HALF - 0.1, 0.72);
  cabinet.add(bow);
  cabinet.add(put(cyl(0.3, 0.3, 0.03, new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.9, 1.4) }), 16), 0, CASE.base + CASE.h - 0.02, 0)); // the lamp in the lid
  room.add(cabinet);
  room.add(put(beam(1.5, CASE.h, 0xffd9a0, 0.1), 0.7, FLOOR + CASE.base + CASE.h, 1.4));

  // A bench to sit and look, and the dust in the light.
  const seat = put(new THREE.Group(), -7.5, FLOOR, 13, 0, 0.5, 0);
  seat.add(put(box(5.2, 0.36, 1.7, matte(0x3a1410, 0.6)), 0, 1.3, 0));
  for (const sx of [-1, 1]) seat.add(put(box(0.3, 1.14, 1.5, matte(0x1a0f0a, 0.5)), sx * 2.2, 0.57, 0));
  room.add(seat);
  slide.add(dust({ count: 900, size: [40, 12, 50], centre: [-3, 1.5, 12], color: 0xffd6a0, gain: 0.4, point: 0.035, seed: 21 }));

  return {
    root,
    slide,
    update({ ch, speed, time, theta }) {
      const open = Math.min(1, Math.max(0, ch[7] / 0.4));
      const swing = open * open * (3 - 2 * open) * 1.8;
      for (const { hinge, side } of doors) hinge.rotation.y = side * swing;
      // Scrolling plays it harder.
      amp.value = 0.45 + Math.min(1.3, speed * 0.6);
      // It turns about its length (and with the wheel), dwelling on the front and on the back and passing quickly edge-on.
      const round = time * 0.22 + theta * 0.35 + 0.3;
      spin.rotation.y = round - 0.45 * Math.sin(2 * round);
      // The kit keeps time: the kick's head on the beat, the cymbals still ringing.
      const beat = Math.exp(-((time * 1.6) % 1) * 6);
      kick.scale.setScalar(1 + beat * 0.012);
      crash.rotation.z = 0.22 + Math.sin(time * 5.1) * 0.03 * (0.3 + beat);
      ride.rotation.z = -0.26 + Math.sin(time * 4.3 + 1) * 0.025;
      hat.position.y = beat * 0.02;
    },
  };
}
