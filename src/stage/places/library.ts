import * as THREE from "three";
import { ball, box, cyl, dust, field, matte, paint, put, rng, shell, tiled, type Place } from "../kit";
import { proceduralRibbons, staticRibbons } from "../ribbons";

/**
 * 07 Mind. Cream paper and ink.
 *
 * First a stair of fifty books (one per volume read) winding up past a
 * colonnade: the Stoics taught in a painted porch, a stoa, and took their
 * name from it. Then, along the paper to the right, the desk where the
 * daily practice happens: an open journal with a fountain pen writing in
 * it, a sketchbook, and the iron, by a window. Outside the window is
 * Helsinki, and the way on is out through it. The floor has a round opening
 * in it: that is where the camera comes up from the hall below. Nothing here waits on scroll: the pen
 * never stops.
 */

const INK = 0x17131a;
const INDIGO = 0x3b33d6;
const CLOTH = [0x1f2a44, 0x6e1f24, 0x234234, 0xa87b28, 0x2d2a66, 0x3a3a3a, 0x7a3d1c];

// The line the pen is writing: joined-up loops along a rule of the page.
const SCRIPT = /* glsl */ `
  uniform float uRow, uAlong;
  // Lines above the pen are finished, the one under it is written as far as the nib, those below are blank.
  float gain(float u, float id, float seed) {
    return id < uRow - 0.5 ? 1.0 : (id > uRow + 0.5 ? 0.0 : step(u, uAlong));
  }
  vec3 path(float u, float id, float seed) {
    float x = u * 2.25;
    float loops = u * 54.0 + id * 2.0;
    float lift = sin(loops) * 0.055 * (0.6 + 0.4 * sin(u * 13.0 + id));
    return vec3(x + cos(loops) * 0.03, 0.0, -lift - id * 0.36);
  }
`;

export function library(): Place {
  const { root, slide } = shell();
  const random = rng(50);
  const stone = matte(0xd9d0bd, 0.92);

  // ---- the stair: fifty books ----
  const BOOKS = 50;
  const stair = put(new THREE.Group(), -3.4, 0, -4.5);
  slide.add(stair);
  type Piece = { book: number; size: [number, number, number]; at: [number, number, number]; color: number };
  const pieces: Piece[] = [];
  for (let i = 0; i < BOOKS; i++) {
    const cloth = CLOTH[Math.floor(random() * CLOTH.length)];
    const thick = 0.26 + random() * 0.14;
    pieces.push({ book: i, size: [1.86, thick, 1.26], at: [0, 0, 0], color: 0xd9d1bf }); // pages
    pieces.push({ book: i, size: [1.94, 0.04, 1.32], at: [0, thick / 2 + 0.02, 0], color: cloth });
    pieces.push({ book: i, size: [1.94, 0.04, 1.32], at: [0, -thick / 2 - 0.02, 0], color: cloth });
    pieces.push({ book: i, size: [0.05, thick + 0.08, 1.32], at: [0.96, 0, 0], color: cloth }); // spine, outward
  }
  const helix = (i: number) => ({ a: -2.4 + i * 0.37, y: -5.6 + i * 0.27, r: 4.4 });
  const tread = new THREE.Object3D();
  const bookMatrix = new THREE.Matrix4();
  stair.add(
    field(new THREE.BoxGeometry(1, 1, 1), matte(0xffffff, 0.8), pieces.length, (i, d, color) => {
      const piece = pieces[i];
      const { a, y, r } = helix(piece.book);
      tread.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
      tread.rotation.set(0, -a, 0);
      tread.updateMatrix();
      d.position.set(...piece.at);
      d.scale.set(...piece.size);
      d.updateMatrix();
      bookMatrix.multiplyMatrices(tread.matrix, d.matrix);
      bookMatrix.decompose(d.position, d.quaternion, d.scale);
      color.set(piece.color);
    }),
  );
  // The thread, in ink, running up the stair.
  const rail: THREE.Vector3[] = [];
  for (let i = -6; i <= (BOOKS + 5) * 4; i++) {
    const { a, y, r } = helix(i / 4);
    rail.push(new THREE.Vector3(Math.cos(a) * (r + 1.5), y + 1.5, Math.sin(a) * (r + 1.5)));
  }
  stair.add(staticRibbons([rail], { width: 0.035, minPx: 1.3, color: INDIGO, gain: 1, ink: true, taper: true }));

  // ---- the floor: flagged, with a round opening in the middle of the stair. The camera comes up through it. ----
  const WELL = { x: -3.4, z: -4.5, r: 3.3 };
  const flags = paint(256, 256, (ctx, w) => {
    ctx.fillStyle = "#e6dfcf";
    ctx.fillRect(0, 0, w, w);
    ctx.strokeStyle = "rgba(60,52,44,0.16)";
    ctx.lineWidth = 2;
    for (let i = 0; i < w; i += 64) {
      ctx.strokeRect(i, 0, 64, w);
      ctx.strokeRect(0, i, w, 64);
    }
  });
  flags.wrapS = flags.wrapT = THREE.RepeatWrapping;
  flags.repeat.set(1 / 4.4, 1 / 4.4);
  // Underfoot: limestone slabs (a photograph), which is what a floor like this is made of.
  const paving = new THREE.MeshStandardMaterial({ map: tiled("marble", 1 / 10, 1 / 10), color: 0xf2ead8, roughness: 0.85 });
  // Under the books and the colonnade it runs to the horizon; by the desk it stops at the wall with the window.
  const open = new THREE.Shape();
  [[-13, -90], [90, -90], [90, 70], [-13, 70]].forEach(([x, y], i) => (i ? open.lineTo(x, y) : open.moveTo(x, y)));
  open.holes.push(new THREE.Path().absarc(WELL.x, -WELL.z, WELL.r, 0, Math.PI * 2, true));
  const walled = new THREE.Shape();
  [[-100, -70], [-13, -70], [-13, 16.2], [-100, 16.2]].forEach(([x, y], i) => (i ? walled.lineTo(x, y) : walled.moveTo(x, y)));
  // (A shape is drawn in x and y; laid flat, its y runs towards the viewer, so depths are written negated.)
  for (const shape of [open, walled]) slide.add(put(new THREE.Mesh(new THREE.ShapeGeometry(shape, 48), paving), 0, -6.5, 0, -Math.PI / 2, 0, 0));
  // The thickness of the floor, seen on the way through, and a kerb round the opening.
  slide.add(put(new THREE.Mesh(new THREE.CylinderGeometry(WELL.r, WELL.r, 0.6, 64, 1, true), new THREE.MeshStandardMaterial({ color: 0xcfc6b2, roughness: 0.9, side: THREE.BackSide })), WELL.x, -6.8, WELL.z));
  slide.add(put(new THREE.Mesh(new THREE.TorusGeometry(WELL.r + 0.2, 0.2, 8, 64), stone), WELL.x, -6.42, WELL.z, Math.PI / 2));

  // ---- the stoa: two rows of columns, going away ----
  const column = (x: number, z: number) => {
    const group = put(new THREE.Group(), x, -6.5, z);
    group.add(put(box(1.9, 0.4, 1.9, stone), 0, 0.2, 0), put(cyl(0.82, 0.9, 0.36, stone, 24), 0, 0.58, 0));
    group.add(put(cyl(0.62, 0.72, 12, stone, 18), 0, 6.76, 0));
    group.add(put(cyl(0.9, 0.64, 0.4, stone, 24), 0, 12.96, 0), put(box(2.0, 0.34, 2.0, stone), 0, 13.33, 0));
    return group;
  };
  for (let i = 0; i < 6; i++) slide.add(column(-12.5, 0 - i * 8.5), column(9.5, -12 - i * 8.5));
  slide.add(put(box(2.4, 1.3, 52, stone), -12.5, 7.65, -21), put(box(2.4, 1.3, 52, stone), 9.5, 7.65, -33));

  // Loose leaves in the air.
  const leaves = new THREE.Group();
  leaves.add(
    field(new THREE.PlaneGeometry(0.9, 1.2), new THREE.MeshStandardMaterial({ color: 0xded6c4, roughness: 0.9, side: THREE.DoubleSide }), 70, (_i, d) => {
      d.position.set((random() - 0.5) * 54 - 6, -4.5 + random() * 18, -8 - random() * 34);
      d.rotation.set(random() * 6, random() * 6, random() * 6);
      d.scale.setScalar(0.6 + random() * 0.9);
    }),
  );
  slide.add(leaves);
  slide.add(dust({ count: 500, size: [70, 24, 50], centre: [-8, 0, -14], color: 0x4a4038, gain: 1, point: 0.035, seed: 71, ink: true }));

  // ---- the desk ----
  const desk = put(new THREE.Group(), -21.2, -2.3, -3.5, 0.72, -0.34, 0);
  desk.scale.setScalar(0.78);
  slide.add(desk);
  desk.add(put(box(13, 0.4, 7.4, new THREE.MeshStandardMaterial({ map: tiled("walnut", 2, 1), color: 0xb98a5c, roughness: 0.55 })), 0, -0.2, 0));

  // The journal: indigo cloth, two pages, rules and handwriting.
  const pageOf = (written: number) =>
    paint(512, 720, (ctx, w, h) => {
      ctx.fillStyle = "#e6dfcd";
      ctx.fillRect(0, 0, w, h);
      const r = rng(written * 7 + 3);
      for (let line = 0; line < 18; line++) {
        const y = 70 + line * 34;
        ctx.strokeStyle = "rgba(59,51,214,0.16)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(w - 40, y);
        ctx.stroke();
        if (line >= written) continue;
        // Something like a hand: loops of uneven height, in words.
        ctx.strokeStyle = "#2a2580";
        ctx.lineWidth = 2.2;
        let x = 46;
        while (x < w - 70) {
          const word = 30 + r() * 90;
          if (x + word > w - 44) break;
          ctx.beginPath();
          ctx.moveTo(x, y - 4);
          for (let s = 0; s < word; s += 5) ctx.lineTo(x + s + Math.cos(s * 0.9) * 2.4, y - 5 - Math.abs(Math.sin(s * 0.45 + r())) * (5 + r() * 9));
          ctx.stroke();
          x += word + 14;
        }
      }
    });
  const journal = put(new THREE.Group(), 0.4, 0, 0.6, 0, 0.16, 0);
  journal.add(put(box(5.9, 0.14, 4.1, matte(0x2a2580, 0.75)), 0, 0.07, 0));
  const leftPage = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 3.9), new THREE.MeshStandardMaterial({ map: pageOf(18), roughness: 0.9 }));
  const rightPage = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 3.9), new THREE.MeshStandardMaterial({ map: pageOf(6), roughness: 0.9 }));
  journal.add(put(leftPage, -1.42, 0.2, 0, -Math.PI / 2, -0.07, 0), put(rightPage, 1.42, 0.2, 0, -Math.PI / 2, 0.07, 0));
  // The grain of the paper, laid over both pages.
  const grain = new THREE.MeshBasicMaterial({ map: tiled("paper", 1, 1.4), transparent: true, blending: THREE.MultiplyBlending, premultipliedAlpha: true, depthWrite: false });
  journal.add(put(new THREE.Mesh(new THREE.PlaneGeometry(2.8, 3.9), grain), -1.42, 0.205, 0, -Math.PI / 2, -0.07, 0), put(new THREE.Mesh(new THREE.PlaneGeometry(2.8, 3.9), grain), 1.42, 0.205, 0, -Math.PI / 2, 0.07, 0));
  journal.add(put(box(0.07, 0.01, 5.2, matte(0x9b1c2e, 0.8)), 0.3, 0.24, 0.7)); // ribbon marker
  desk.add(journal);

  // The pen, and the three lines it is in the middle of.
  const pace = { row: { value: 0 }, along: { value: 0 } };
  const lines = proceduralRibbons(3, 220, SCRIPT, { width: 0.022, minPx: 1.2, color: 0x2a2580, gain: 1, ink: true, hasGain: true, gainAsAlpha: true, uniforms: { uRow: pace.row, uAlong: pace.along } });
  journal.add(put(lines, 0.3, 0.29, 0.25));
  const pen = new THREE.Group();
  const resin = matte(0x15131a, 0.25, 0.3);
  const goldTrim = new THREE.MeshStandardMaterial({ color: 0xb98a2e, roughness: 0.3, metalness: 1 });
  pen.add(put(cyl(0.1, 0.085, 2.0, resin, 16), 0, 1.5, 0), put(cyl(0.104, 0.104, 0.07, goldTrim, 16), 0, 0.62, 0), put(cyl(0.085, 0.06, 0.42, resin, 16), 0, 0.36, 0));
  const nib = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.34, 12), goldTrim);
  nib.scale.set(1, 1, 0.4);
  pen.add(put(nib, 0, 0.02, 0, Math.PI));
  pen.add(put(cyl(0.115, 0.115, 0.5, resin, 16), 0, 2.7, 0), put(box(0.03, 0.9, 0.04, goldTrim), 0.12, 2.5, 0));
  const hand = put(new THREE.Group(), 0, 0, 0, 0.5, 0, -0.6);
  hand.add(pen);
  journal.add(hand);

  // The rest of the pens, in a tray: each its own colour of resin, a gold band, a clip, and one left uncapped.
  const tray = put(new THREE.Group(), 5.0, 0, 0.5, 0, -0.3, 0);
  tray.add(put(box(3.3, 0.12, 2.5, matte(0x3a2a1c, 0.6)), 0, 0.06, 0), put(box(3.05, 0.02, 2.25, matte(0x1f3a2a, 0.95)), 0, 0.13, 0));
  const laid: [number, number, boolean][] = [[0x6e1220, -0.7, true], [0x16324a, 0, true], [0x1e4a34, 0.7, false]];
  laid.forEach(([colour, z, capped], i) => {
    const one = put(new THREE.Group(), -0.1 + i * 0.08, 0.26, z, 0, 0.05 * (i - 1), Math.PI / 2);
    const body = matte(colour, 0.22, 0.25);
    one.add(put(cyl(0.11, 0.1, 1.5, body, 16), 0, -0.35, 0), put(cyl(0.114, 0.114, 0.07, goldTrim, 16), 0, 0.42, 0));
    if (capped) one.add(put(cyl(0.125, 0.125, 0.9, body, 16), 0, 0.88, 0), put(box(0.03, 0.62, 0.05, goldTrim), 0, 0.92, 0.13), put(cyl(0.1, 0.1, 0.05, goldTrim, 16), 0, 1.35, 0));
    else {
      one.add(put(cyl(0.095, 0.07, 0.4, resin, 16), 0, 0.66, 0));
      const point = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.36, 12), goldTrim);
      point.scale.set(1, 1, 0.4);
      one.add(put(point, 0, 1.03, 0));
      tray.add(put(cyl(0.125, 0.125, 0.9, body, 16), 1.15, 0.26, 0.15, 0, 0.5, Math.PI / 2));
    }
    tray.add(one);
  });
  desk.add(tray);

  // The candle: a brass stick, a stub of wax, a flame. By the desk it is the light of the place.
  const candle = put(new THREE.Group(), 2.3, 0, -3.1);
  candle.add(put(cyl(0.62, 0.7, 0.1, goldTrim, 28), 0, 0.05, 0), put(cyl(0.12, 0.2, 0.5, goldTrim, 16), 0, 0.33, 0), put(cyl(0.32, 0.26, 0.08, goldTrim, 20), 0, 0.6, 0));
  candle.add(put(cyl(0.2, 0.21, 1.25, matte(0xefe6d0, 0.5), 20), 0, 1.25, 0), put(cyl(0.012, 0.012, 0.16, matte(0x1a1410, 0.8), 6), 0, 1.94, 0));
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 14), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.9, 1.35, 0.6), transparent: true, opacity: 0 }));
  flame.scale.set(1, 2.3, 1);
  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: paint(128, 128, (ctx, w) => {
        const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
        g.addColorStop(0, "rgba(255,214,150,0.9)");
        g.addColorStop(0.25, "rgba(255,170,90,0.28)");
        g.addColorStop(1, "rgba(255,150,70,0)");
        ctx.clearRect(0, 0, w, w);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, w);
      }),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0,
    }),
  );
  halo.scale.setScalar(1.5);
  const wick = put(new THREE.Group(), 0, 2.2, 0);
  wick.add(flame, halo);
  candle.add(wick);
  desk.add(candle);

  // Ink, sketchbook, pencil.
  const bottle = put(new THREE.Group(), 4.6, 0, -2.2);
  bottle.add(put(box(1.0, 1.0, 1.0, new THREE.MeshStandardMaterial({ color: 0x8f9dc4, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.45 })), 0, 0.5, 0), put(box(0.86, 0.62, 0.86, matte(0x1c1870, 0.3)), 0, 0.34, 0), put(cyl(0.3, 0.3, 0.3, resin, 20), 0, 1.15, 0));
  desk.add(bottle);
  const sketch = paint(512, 400, (ctx, w, h) => {
    ctx.fillStyle = "#e2dac8";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#2b2730";
    ctx.lineWidth = 2;
    // A cube in two-point perspective, with its construction left in.
    const P = (x: number, y: number) => [x, y] as const;
    const front = [P(150, 250), P(250, 270), P(250, 150), P(150, 140)];
    const back = [P(210, 220), P(300, 235), P(300, 130), P(210, 122)];
    for (const quad of [front, back]) {
      ctx.beginPath();
      quad.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.stroke();
    }
    front.forEach(([x, y], i) => {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(back[i][0], back[i][1]);
      ctx.stroke();
    });
    ctx.lineWidth = 0.8;
    ctx.setLineDash([6, 6]);
    for (const [x, y] of front) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(500, 196);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(390, 300, 56, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(390, 300, 56, 18, 0, 0, Math.PI * 2);
    ctx.stroke();
    // A phone screen, thumbnailed: the kind of thing the sketchbook is for.
    ctx.strokeRect(40, 40, 70, 124);
    ctx.strokeRect(50, 54, 50, 30);
    for (let i = 0; i < 3; i++) ctx.strokeRect(50, 94 + i * 20, 50, 12);
  });
  const pad = put(new THREE.Group(), -4.4, 0, -1.6, 0, 0.3, 0);
  pad.add(put(box(4.0, 0.1, 3.1, matte(0x24222a, 0.8)), 0, 0.05, 0), put(new THREE.Mesh(new THREE.PlaneGeometry(3.8, 2.96), new THREE.MeshStandardMaterial({ map: sketch, roughness: 0.9 })), 0, 0.11, 0, -Math.PI / 2));
  const pencil = put(new THREE.Group(), 1.4, 0.2, 1.3, 0, 0.5, Math.PI / 2);
  pencil.add(cyl(0.06, 0.06, 1.9, matte(0x2f6b3a, 0.5), 6), put(new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 6), matte(0xd9b98a, 0.6)), 0, 1.06, 0));
  pad.add(pencil);
  desk.add(pad);

  // ---- the iron: a loaded bar, a kettlebell ----
  const iron = matte(0x1b1a1f, 0.55, 0.5);
  const steel = new THREE.MeshStandardMaterial({ color: 0x8b8e96, roughness: 0.3, metalness: 1 });
  const bar = put(new THREE.Group(), -30.5, 2.6, -13, 0, 0.16, 0);
  bar.scale.setScalar(0.66);
  bar.add(put(cyl(0.085, 0.085, 13, steel, 14), 0, 0, 0, 0, 0, Math.PI / 2));
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const r = [1.7, 1.7, 1.2][i];
      bar.add(put(cyl(r, r, 0.3, iron, 40), side * (4.6 + i * 0.36), 0, 0, 0, 0, Math.PI / 2));
      bar.add(put(cyl(r * 0.36, r * 0.36, 0.32, steel, 24), side * (4.6 + i * 0.36), 0, 0, 0, 0, Math.PI / 2));
    }
    bar.add(put(cyl(0.2, 0.2, 0.3, steel, 16), side * 5.75, 0, 0, 0, 0, Math.PI / 2));
  }
  slide.add(bar);
  const bell = put(new THREE.Group(), -5.3, 0, 2.3, 0, 0.6, 0, 0.85);
  const round = ball(0.95, iron, 28);
  round.scale.set(1, 0.92, 1);
  bell.add(put(round, 0, 0.86, 0), put(new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.11, 10, 28, Math.PI), iron), 0, 1.62, 0), put(cyl(0.6, 0.66, 0.12, iron, 24), 0, 0.06, 0));
  desk.add(bell);

  // ---- the wall by the desk, and the window in it: outside is Helsinki, and that is the way on ----
  const PANE = { x: -21, y: 1.2, w: 8.4, h: 6.6 };
  const wallShape = new THREE.Shape();
  [[-76, -6.5], [-13, -6.5], [-13, 30], [-76, 30]].forEach(([x, y], i) => (i ? wallShape.lineTo(x, y) : wallShape.moveTo(x, y)));
  const opening = new THREE.Path();
  [[PANE.x - PANE.w / 2, PANE.y - PANE.h / 2], [PANE.x - PANE.w / 2, PANE.y + PANE.h / 2], [PANE.x + PANE.w / 2, PANE.y + PANE.h / 2], [PANE.x + PANE.w / 2, PANE.y - PANE.h / 2]].forEach(([x, y], i) => (i ? opening.lineTo(x, y) : opening.moveTo(x, y)));
  wallShape.holes.push(opening);
  slide.add(put(new THREE.Mesh(new THREE.ShapeGeometry(wallShape), new THREE.MeshStandardMaterial({ map: tiled("plaster", 1 / 14, 1 / 14), color: 0xf4ebd8, roughness: 1 })), 0, 0, -16.2));
  // The frame: ink-dark timber, a mullion and a transom, a deep sill.
  const timber = matte(0x221c1a, 0.6);
  const sash = put(new THREE.Group(), PANE.x, PANE.y, -16.2);
  for (const side of [-1, 1]) sash.add(put(box(0.34, PANE.h + 0.68, 0.7, timber), side * (PANE.w / 2 + 0.17), 0, 0), put(box(PANE.w + 0.68, 0.34, 0.7, timber), 0, side * (PANE.h / 2 + 0.17), 0));
  sash.add(put(box(PANE.w + 1.4, 0.2, 1.3, timber), 0, -PANE.h / 2 - 0.3, 0.4));
  // The window stands open: two casements swung outwards on their hinges, glazing bars and all.
  for (const side of [-1, 1]) {
    const leaf = put(new THREE.Group(), side * (PANE.w / 2), 0, -0.2, 0, side * 1.25, 0);
    const half = PANE.w / 2;
    leaf.add(put(box(half, 0.2, 0.14, timber), (-side * half) / 2, PANE.h / 2 - 0.1, 0), put(box(half, 0.2, 0.14, timber), (-side * half) / 2, -PANE.h / 2 + 0.1, 0));
    leaf.add(put(box(0.2, PANE.h, 0.14, timber), -side * half + side * 0.1, 0, 0), put(box(0.2, PANE.h, 0.14, timber), -side * 0.1, 0, 0));
    leaf.add(put(box(half, 0.08, 0.1, timber), (-side * half) / 2, 0.9, 0), put(box(0.08, PANE.h, 0.1, timber), (-side * half) / 2, 0, 0));
    sash.add(leaf);
  }
  slide.add(sash);

  // Tally marks on that wall: one stroke a session, a slash through every fifth.
  const marks: [number, number, number][] = [];
  for (let row = 0; row < 6; row++) {
    for (let g = 0; g < 26; g++) {
      const gx = -46 + g * 1.25;
      const gy = 7.5 - row * 1.35;
      if (Math.abs(gx + 0.4 - PANE.x) < PANE.w / 2 + 1.2 && Math.abs(gy - PANE.y) < PANE.h / 2 + 0.9) continue;
      for (let k = 0; k < 5; k++) marks.push([gx + (k < 4 ? k * 0.2 : 0.3), gy, k < 4 ? 0 : 1]);
    }
  }
  slide.add(
    put(
      field(new THREE.BoxGeometry(0.045, 0.7, 0.01), new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.55 }), marks.length, (i, d) => {
        d.position.set(marks[i][0] + (random() - 0.5) * 0.04, marks[i][1] + (random() - 0.5) * 0.06, 0);
        d.rotation.z = marks[i][2] ? 1.05 : (random() - 0.5) * 0.14;
        d.scale.y = marks[i][2] ? 1.5 : 0.9 + random() * 0.2;
      }),
      0,
      0,
      -16,
    ),
  );

  return {
    root,
    slide,
    // What is outside is drawn only where the window is.
    portal: [-1, 1].flatMap((sx) => [-1, 1].map((sy) => new THREE.Vector3(PANE.x + (sx * PANE.w) / 2, PANE.y + (sy * PANE.h) / 2, -16.2))),
    lamp: wick,
    update({ ch, time, theta }) {
      // Night comes on towards the desk, and the candle with it: it flickers, as a flame does.
      const night = Math.min(1, Math.max(0, ch[7]));
      const flicker = 0.86 + 0.09 * Math.sin(time * 11.3) + 0.05 * Math.sin(time * 23.7 + 1.3);
      flame.material.opacity = night;
      flame.scale.set(1 + 0.1 * Math.sin(time * 9.1), 2.3 * flicker, 1);
      // Leaving by the window the camera passes right over the flame: its glow is down to nothing before then,
      // or it would white the frame out for a moment.
      const leaving = Math.min(1, Math.max(0, (ch[8] ?? 0) / 0.14));
      halo.material.opacity = night * 0.32 * flicker * (1 - leaving * leaving * (3 - 2 * leaving));
      wick.position.x = Math.sin(time * 7.3) * 0.012;
      leaves.rotation.y = Math.sin(time * 0.05) * 0.1 + theta * 0.02;
      leaves.position.y = Math.sin(time * 0.21) * 0.3;
      // The pen works along three lines and starts the page again.
      const beat = (time * 0.11) % 1;
      const row = Math.min(2, Math.floor(beat * 3));
      const u = (beat * 3) % 1;
      pace.row.value = row;
      pace.along.value = u;
      const loops = u * 54 + row * 2;
      hand.position.set(0.3 + u * 2.25 + Math.cos(loops) * 0.03, 0.3, 0.25 - Math.sin(loops) * 0.055 - row * 0.36);
      hand.rotation.z = -0.6 + Math.sin(loops) * 0.03;
    },
  };
}
