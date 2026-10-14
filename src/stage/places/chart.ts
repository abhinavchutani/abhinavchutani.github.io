import * as THREE from "three";
import { box, cyl, dust, field, glow, matte, paint, put, rng, shell, tiled, type Place } from "../kit";
import { staticRibbons } from "../ribbons";

/**
 * 01 Markets. The floor of an exchange at night: a hall of stone and
 * screens. A board the width of the far wall, a ticker running round under
 * it, trading posts ringed with monitors, slips of paper on the floor. In
 * the middle, standing in the air over the central post, a price series in
 * candles; where it ends, a fan of simulated paths (the Monte Carlo
 * project) spreads out to the histogram they make, with the curve theory
 * says it should follow. Over to the right hangs the other thing he built
 * in this field: a chain of blocks, each carrying the hash of the one
 * before, the newest still being mined.
 *
 * The camera comes down into it through the roof, and leaves by the doors
 * under the board, which open on to the wings of a stage. `p` draws the
 * paths; `q` opens the doors.
 */

const UP = 0x35e08a;
const DOWN = 0xff5a52;
const AMBER = 0xffb648;
const ICE = 0x9fdcff;

/** The hall, in its own units: the floor, the ceiling, the walls, the doors in the far wall. */
export const HALL = { floor: -3.6, top: 13, half: 22, back: -22, front: 30, door: { wide: 5.8, top: 1.9 } };

/** A screenful of quotes: rows of figures, green and red, on black. */
function quotes(width: number, height: number, columns: number, rows: number, seed: number, chart = false) {
  return paint(width, height, (ctx, w, h) => {
    const r = rng(seed);
    ctx.fillStyle = "#02060b";
    ctx.fillRect(0, 0, w, h);
    const cw = w / columns;
    const rh = h / rows;
    ctx.textBaseline = "middle";
    for (let c = 0; c < columns; c++) {
      for (let k = 0; k < rows; k++) {
        const up = r() > 0.44;
        const x = c * cw + cw * 0.08;
        const y = k * rh + rh / 2;
        // A code is a block of light here, not a name: this is set dressing, and no company's price.
        ctx.fillStyle = "rgba(159,220,255,0.75)";
        ctx.fillRect(x, y - rh * 0.2, cw * (0.16 + r() * 0.1), rh * 0.4);
        ctx.fillStyle = up ? "#35e08a" : "#ff5a52";
        ctx.font = `700 ${Math.round(rh * 0.56)}px "Space Mono", monospace`;
        ctx.textAlign = "right";
        ctx.fillText(`${up ? "▲" : "▼"} ${(r() * 4).toFixed(2)}`, c * cw + cw * 0.92, y + 1);
      }
      ctx.fillStyle = "rgba(159,220,255,0.12)";
      ctx.fillRect(c * cw, 0, 1.5, h);
    }
    for (let k = 1; k < rows; k++) {
      ctx.fillStyle = "rgba(159,220,255,0.06)";
      ctx.fillRect(0, k * rh, w, 1);
    }
    if (chart) {
      // One panel of the board is an index, drawn as a line with its area under it.
      const x0 = w * 0.62;
      ctx.fillStyle = "#02060b";
      ctx.fillRect(x0, 0, w - x0, h);
      ctx.strokeStyle = "rgba(159,220,255,0.14)";
      ctx.lineWidth = 1;
      for (let g = 1; g < 6; g++) {
        ctx.beginPath();
        ctx.moveTo(x0, (h * g) / 6);
        ctx.lineTo(w, (h * g) / 6);
        ctx.stroke();
      }
      let y = h * 0.62;
      const points: [number, number][] = [];
      for (let x = x0 + 12; x < w - 12; x += 7) {
        y = Math.min(h * 0.9, Math.max(h * 0.12, y + (r() - 0.54) * h * 0.06));
        points.push([x, y]);
      }
      ctx.beginPath();
      points.forEach(([x, v], i) => (i ? ctx.lineTo(x, v) : ctx.moveTo(x, v)));
      ctx.strokeStyle = "#35e08a";
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.lineTo(points[points.length - 1][0], h);
      ctx.lineTo(points[0][0], h);
      ctx.closePath();
      ctx.fillStyle = "rgba(53,224,138,0.14)";
      ctx.fill();
    }
  });
}

/** A small screen at a trading post: a run of candles, or a depth of bids and asks. */
function terminal(seed: number) {
  return paint(256, 160, (ctx, w, h) => {
    const r = rng(seed);
    ctx.fillStyle = "#03080d";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(159,220,255,0.6)";
    ctx.fillRect(8, 8, 60 + r() * 50, 7);
    if (seed % 3 === 0) {
      for (let k = 0; k < 9; k++) {
        const up = r() > 0.5;
        const wide = 20 + r() * 90;
        ctx.fillStyle = up ? "rgba(53,224,138,0.85)" : "rgba(255,90,82,0.85)";
        ctx.fillRect(up ? w / 2 : w / 2 - wide, 28 + k * 14, wide, 9);
      }
    } else {
      let y = h * 0.6;
      for (let x = 12; x < w - 10; x += 9) {
        const next = Math.min(h - 16, Math.max(30, y + (r() - 0.52) * 22));
        ctx.fillStyle = next <= y ? "#35e08a" : "#ff5a52";
        ctx.fillRect(x, Math.min(y, next), 5, Math.max(3, Math.abs(next - y)));
        ctx.fillRect(x + 2, Math.min(y, next) - 5, 1, Math.abs(next - y) + 10);
        y = next;
      }
    }
  });
}

export function chart(): Place {
  const { root, slide } = shell();
  const random = rng(105);
  const gauss = () => Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());
  const { floor: FLOOR, top: TOP, half: HALF, back: BACK, front: FRONT, door: DOOR } = HALL;
  const deep = FRONT - BACK;
  const midZ = (FRONT + BACK) / 2;
  const tall = TOP - FLOOR;

  // ---- the hall ----
  // Cut limestone for the walls (a photograph of slabs, seen by the blue light of the screens), and the same
  // underfoot, polished enough to take that light.
  const stoneOf = (across: number, up: number) => {
    const map = tiled("marble", across, up);
    return new THREE.MeshLambertMaterial({ map, color: 0x5f6f9c, emissive: 0x39466b, emissiveMap: map, emissiveIntensity: 0.3 });
  };
  slide.add(put(new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2, deep), new THREE.MeshStandardMaterial({ map: tiled("marble", (HALF * 2) / 11, deep / 11), color: 0x4a5a80, roughness: 0.55, metalness: 0.15 })), 0, FLOOR, midZ, -Math.PI / 2));
  // Side walls and the wall behind the camera.
  for (const side of [-1, 1]) slide.add(put(new THREE.Mesh(new THREE.PlaneGeometry(deep, tall), stoneOf(deep / 7, tall / 7)), side * HALF, FLOOR + tall / 2, midZ, 0, -side * (Math.PI / 2), 0));
  slide.add(put(new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2, tall), stoneOf((HALF * 2) / 7, tall / 7)), 0, FLOOR + tall / 2, FRONT, 0, Math.PI, 0));
  // The far wall, with the doors in it.
  const wall = new THREE.Shape();
  [[-HALF, FLOOR], [HALF, FLOOR], [HALF, TOP], [-HALF, TOP]].forEach(([x, y], i) => (i ? wall.lineTo(x, y) : wall.moveTo(x, y)));
  const hole = new THREE.Path();
  [[-DOOR.wide / 2, FLOOR], [-DOOR.wide / 2, DOOR.top], [DOOR.wide / 2, DOOR.top], [DOOR.wide / 2, FLOOR]].forEach(([x, y], i) => (i ? hole.lineTo(x, y) : hole.moveTo(x, y)));
  wall.holes.push(hole);
  slide.add(put(new THREE.Mesh(new THREE.ShapeGeometry(wall), stoneOf(1 / 7, 1 / 7)), 0, 0, BACK));
  // Pilasters down the sides, and a cornice.
  const pale = matte(0x39425a, 0.7);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 6; i++) slide.add(put(box(0.5, tall, 1.5, pale), side * (HALF - 0.25), FLOOR + tall / 2, BACK + 4 + i * 9));
    slide.add(put(box(0.9, 0.7, deep, pale), side * (HALF - 0.45), TOP - 2.2, midZ));
  }
  for (const x of [-HALF + 1.2, HALF - 1.2]) slide.add(put(box(1.2, tall, 0.5, pale), x, FLOOR + tall / 2, BACK + 0.25));
  // (The two by the doors stop under the ticker, so that nothing stands across the board.)
  for (const side of [-1, 1]) slide.add(put(box(1.2, 2.0 - FLOOR, 0.5, pale), side * (DOOR.wide / 2 + 1.1), (2.0 + FLOOR) / 2, BACK + 0.25));

  // The ceiling: coffers, each with a skylight. And the roof it is the underside of, seen from above on the
  // way in: dark, with the same lights let into it.
  const lights = (bright: number) =>
    paint(256, 256, (ctx, w) => {
      ctx.fillStyle = "#070a11";
      ctx.fillRect(0, 0, w, w);
      ctx.strokeStyle = "#1b2233";
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, w - 14, w - 14);
      ctx.fillStyle = `rgba(190,225,255,${bright})`;
      ctx.fillRect(58, 58, w - 116, w - 116);
      ctx.strokeStyle = "#0a0e16";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(w / 2, 58);
      ctx.lineTo(w / 2, w - 58);
      ctx.moveTo(58, w / 2);
      ctx.lineTo(w - 58, w / 2);
      ctx.stroke();
    });
  const under = lights(0.42);
  const over = lights(0.9);
  for (const map of [under, over]) {
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set((HALF * 2) / 7.4, deep / 7.4);
  }
  slide.add(put(new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2, deep), new THREE.MeshBasicMaterial({ map: under })), 0, TOP, midZ, Math.PI / 2));
  slide.add(put(new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2 + 2, deep + 2), new THREE.MeshBasicMaterial({ map: over, color: new THREE.Color(1.5, 1.5, 1.5) })), 0, TOP + 0.7, midZ, -Math.PI / 2));
  slide.add(put(box(HALF * 2 + 2, 0.7, deep + 2, matte(0x0a0d14, 0.9)), 0, TOP + 0.34, midZ));

  // ---- the board: the width of the far wall, over the doors ----
  const board = quotes(2048, 560, 7, 11, 17, true);
  slide.add(put(new THREE.Mesh(new THREE.PlaneGeometry(34, 9.3), new THREE.MeshBasicMaterial({ map: board, color: new THREE.Color(1.5, 1.5, 1.5) })), 0, 7.6, BACK + 0.46));
  slide.add(put(box(35, 10.3, 0.3, matte(0x0a0d14, 0.6)), 0, 7.6, BACK + 0.2));
  // The ticker: a band of figures running round the hall under it.
  const tape = paint(2048, 64, (ctx, w, h) => {
    ctx.fillStyle = "#03070c";
    ctx.fillRect(0, 0, w, h);
    ctx.font = `700 34px "Space Mono", monospace`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    const r = rng(8);
    for (let x = 16; x < w - 150; x += 196) {
      const up = r() > 0.42;
      ctx.fillStyle = "rgba(159,220,255,0.8)";
      ctx.fillRect(x, h / 2 - 9, 34 + r() * 22, 18);
      ctx.fillStyle = up ? "#35e08a" : "#ff5a52";
      ctx.fillText(`${up ? "▲" : "▼"} ${(r() * 3).toFixed(2)}%`, x + 66, h / 2 + 2);
    }
  });
  tape.wrapS = THREE.RepeatWrapping;
  const band = new THREE.MeshBasicMaterial({ map: tape, color: new THREE.Color(1.5, 1.5, 1.5) });
  slide.add(put(new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2 - 1, 0.62), band), 0, 2.45, BACK + 0.62));
  slide.add(put(box(HALF * 2 - 0.6, 0.86, 0.2, matte(0x0a0d14, 0.6)), 0, 2.45, BACK + 0.5));
  for (const side of [-1, 1]) slide.add(put(new THREE.Mesh(new THREE.PlaneGeometry(deep, 0.62), band), side * (HALF - 0.6), 2.45, midZ, 0, -side * (Math.PI / 2), 0));

  // ---- the doors under the board, and the wings of the stage beyond them ----
  const bronze = new THREE.MeshStandardMaterial({ color: 0x6a5230, roughness: 0.35, metalness: 0.9 });
  const rise = DOOR.top - FLOOR;
  const leaves = [-1, 1].map((side) => {
    const hinge = put(new THREE.Group(), (side * DOOR.wide) / 2, 0, BACK);
    hinge.add(put(box(DOOR.wide / 2, rise, 0.18, matte(0x121826, 0.5, 0.3)), (-side * DOOR.wide) / 4, FLOOR + rise / 2, 0));
    for (const y of [0.27, 0.68]) hinge.add(put(box(DOOR.wide / 2 - 0.5, rise * 0.3, 0.06, bronze), (-side * DOOR.wide) / 4, FLOOR + rise * y, 0.12));
    hinge.add(put(cyl(0.05, 0.05, 1.1, bronze, 10), -side * (DOOR.wide / 2 - 0.3), FLOOR + rise * 0.47, 0.2));
    slide.add(hinge);
    return { hinge, side };
  });
  for (const side of [-1, 1]) slide.add(put(box(0.5, rise + 0.5, 0.9, bronze), side * (DOOR.wide / 2 + 0.25), FLOOR + rise / 2 + 0.25, BACK));
  slide.add(put(box(DOOR.wide + 1.6, 0.6, 1.0, bronze), 0, DOOR.top + 0.3, BACK));
  // The balcony over the doors, where the day is rung in and out: a rail, a rostrum, the bell on its bracket.
  const brass = new THREE.MeshStandardMaterial({ color: 0xc9a25a, roughness: 0.3, metalness: 0.85, emissive: 0x3a2a0c, emissiveIntensity: 0.2 });
  const gallery = put(new THREE.Group(), 0, 3.0, BACK + 0.6);
  gallery.add(put(box(9, 0.26, 1.7, matte(0x1a2132, 0.6, 0.2)), 0, 0, 0.85), put(box(9.2, 0.1, 0.1, brass), 0, 1.05, 1.66));
  for (let i = 0; i <= 18; i++) gallery.add(put(cyl(0.035, 0.035, 0.95, brass, 6), -4.5 + i * 0.5, 0.58, 1.66));
  for (const side of [-1, 1]) gallery.add(put(box(0.1, 0.1, 1.7, brass), side * 4.55, 1.05, 0.85), put(cyl(0.035, 0.035, 0.95, brass, 6), side * 4.55, 0.58, 0.85));
  gallery.add(put(box(1.5, 1.2, 0.5, matte(0x121826, 0.5, 0.3)), 0, 0.72, 1.2), put(box(1.6, 0.06, 0.6, brass), 0, 1.35, 1.2));
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.46, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.56), brass);
  gallery.add(put(dome, 2.9, 1.75, 0.9), put(cyl(0.05, 0.05, 0.5, brass, 8), 2.9, 2.35, 0.9), put(box(0.08, 0.08, 1.0, brass), 2.9, 2.6, 0.45), put(new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), brass), 2.9, 1.42, 0.9));
  slide.add(gallery);

  // The wings: a black passage with boards underfoot, so that through the doors there is somewhere to walk.
  const dark = matte(0x050506, 1);
  const wings = { deep: 6.6, wide: DOOR.wide + 3 };
  slide.add(put(new THREE.Mesh(new THREE.PlaneGeometry(wings.wide, wings.deep), matte(0x1a0d08, 0.7)), 0, FLOOR, BACK - wings.deep / 2, -Math.PI / 2));
  for (const side of [-1, 1]) slide.add(put(new THREE.Mesh(new THREE.PlaneGeometry(wings.deep, tall), dark), (side * wings.wide) / 2, FLOOR + tall / 2, BACK - wings.deep / 2, 0, -side * (Math.PI / 2), 0));
  slide.add(put(new THREE.Mesh(new THREE.PlaneGeometry(wings.wide, wings.deep), dark), 0, DOOR.top + 0.6, BACK - wings.deep / 2, Math.PI / 2));

  // ---- trading posts: a counter, a ring of screens at eye level, another hung above ----
  const screens = [0, 1, 2, 3, 4, 5].map((i) => new THREE.MeshBasicMaterial({ map: terminal(i + 20), color: new THREE.Color(1.35, 1.35, 1.35) }));
  const iron = matte(0x10141d, 0.5, 0.6);
  const post = (x: number, z: number, turn: number) => {
    const group = put(new THREE.Group(), x, FLOOR, z, 0, turn, 0);
    group.add(put(cyl(2.3, 2.4, 1.25, matte(0x151b28, 0.55, 0.3), 8), 0, 0.62, 0), put(cyl(2.45, 2.45, 0.1, bronze, 8), 0, 1.3, 0));
    group.add(put(cyl(0.12, 0.12, 7.5, iron, 8), 0, 5, 0), put(cyl(2.0, 2.0, 0.12, iron, 8), 0, 6.1, 0));
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
      for (const [high, lean, size] of [[2.1, -0.22, 1], [5.2, 0.3, 1.15]] as const) {
        const screen = put(new THREE.Group(), Math.sin(a) * 2.0, high, Math.cos(a) * 2.0, 0, a, 0);
        screen.add(put(box(1.44 * size, 0.94 * size, 0.08, iron), 0, 0, -0.05, lean, 0, 0), put(new THREE.Mesh(new THREE.PlaneGeometry(1.32 * size, 0.82 * size), screens[(k + (high > 3 ? 3 : 0)) % screens.length]), 0, 0, 0, lean, 0, 0));
        group.add(screen);
      }
    }
    return group;
  };
  for (const [x, z, turn] of [[-12.5, -4, 0.3], [12.5, -7, 0.1], [-8.5, -14, 0.7], [10.5, -15.5, 0.4], [-15, 8, 0.2], [15.5, 6, 0.5]] as const) slide.add(post(x, z, turn));
  // Slips of paper, where the day left them.
  slide.add(
    field(new THREE.PlaneGeometry(0.34, 0.16), new THREE.MeshBasicMaterial({ color: 0x7f8aa6, side: THREE.DoubleSide }), 420, (_i, d) => {
      d.position.set((random() - 0.5) * (HALF * 2 - 3), FLOOR + 0.02 + random() * 0.01, BACK + 2 + random() * (deep - 6));
      d.rotation.set(-Math.PI / 2, 0, random() * Math.PI);
    }),
  );

  // ---- the series, standing in the air over the central post ----
  const SIZE = 0.66;
  const set = put(new THREE.Group(), 3.3, 0.3, -6.2, 0.03, 0.36, 0, SIZE);
  slide.add(set);
  const N = 30;
  const pitch = 0.36;
  const END = 0.4; // x of the last candle
  let price = 0;
  const candles: { x: number; open: number; close: number; high: number; low: number }[] = [];
  for (let i = 0; i < N; i++) {
    const open = price;
    price += gauss() * 0.32 + 0.022;
    const close = price;
    candles.push({ x: END - (N - 1 - i) * pitch, open, close, high: Math.max(open, close) + Math.abs(gauss()) * 0.2, low: Math.min(open, close) - Math.abs(gauss()) * 0.2 });
  }
  // Sit the series so that it ends near the middle of the frame.
  const shift = -candles[N - 1].close - 0.2;
  for (const c of candles) {
    c.open += shift;
    c.close += shift;
    c.high += shift;
    c.low += shift;
  }
  const last = candles[N - 1].close;
  const lit = new THREE.MeshBasicMaterial({ color: 0xffffff });
  lit.toneMapped = false;
  set.add(
    field(new THREE.BoxGeometry(1, 1, 1), lit, N, (i, d, color) => {
      const c = candles[i];
      d.position.set(c.x, (c.open + c.close) / 2, 0);
      d.scale.set(0.24, Math.max(0.03, Math.abs(c.close - c.open)), 0.24);
      color.set(c.close >= c.open ? UP : DOWN).multiplyScalar(1.25);
    }),
    field(new THREE.BoxGeometry(1, 1, 1), lit, N, (i, d, color) => {
      const c = candles[i];
      d.position.set(c.x, (c.high + c.low) / 2, 0);
      d.scale.set(0.035, c.high - c.low, 0.035);
      color.set(c.close >= c.open ? UP : DOWN);
    }),
    // Volume, along the foot.
    field(new THREE.BoxGeometry(1, 1, 1), lit, N, (i, d, color) => {
      const c = candles[i];
      const v = 0.08 + Math.abs(c.close - c.open) * 0.7 + random() * 0.15;
      d.position.set(c.x, -3.1 + v / 2, 0);
      d.scale.set(0.24, v, 0.12);
      color.set(ICE).multiplyScalar(0.32);
    }),
  );
  // A moving average through the closes, and the rules of the chart.
  const average: THREE.Vector3[] = [];
  for (let i = 7; i < N; i++) {
    let sum = 0;
    for (let k = 0; k < 8; k++) sum += candles[i - k].close;
    average.push(new THREE.Vector3(candles[i].x, sum / 8, 0.2));
  }
  set.add(staticRibbons([average], { width: 0.05, minPx: 1.4, color: 0xffffff, gain: 1.2 }));
  const LEFT = END - (N - 1) * pitch - 0.7;
  const rules: THREE.Vector3[][] = [];
  for (let y = -3; y <= 4; y++) rules.push([new THREE.Vector3(LEFT, y * 1.1, -0.3), new THREE.Vector3(7.4, y * 1.1, -0.3)]);
  for (let x = Math.ceil(LEFT); x <= 7; x += 2) rules.push([new THREE.Vector3(x, -3.1, -0.3), new THREE.Vector3(x, 4.6, -0.3)]);
  set.add(staticRibbons(rules, { width: 0.012, minPx: 1, color: ICE, gain: 0.5, opacity: 0.3 }));
  set.add(staticRibbons([[new THREE.Vector3(LEFT, -3.1, 0), new THREE.Vector3(7.4, -3.1, 0)], [new THREE.Vector3(7.4, -3.1, 0), new THREE.Vector3(7.4, 4.8, 0)]], { width: 0.04, minPx: 1.3, color: ICE, gain: 1 }));
  // What it stands over: a low round post, lit from within.
  slide.add(put(cyl(3.6, 3.8, 0.5, matte(0x151b28, 0.5, 0.3), 40), 2.4, FLOOR + 0.25, -6.6), put(new THREE.Mesh(new THREE.TorusGeometry(3.65, 0.05, 8, 80), glow(ICE, 1.6)), 2.4, FLOOR + 0.52, -6.6, Math.PI / 2));

  // ---- the fan: simulated paths from the last price ----
  const PATHS = 180;
  const STEPS = 48;
  const FAR = 5.0;
  const ends: number[] = [];
  const paths: THREE.Vector3[][] = [];
  for (let p = 0; p < PATHS; p++) {
    let y = last;
    const line = [new THREE.Vector3(END, y, 0)];
    for (let s = 1; s <= STEPS; s++) {
      y += gauss() * 0.16 + 0.006;
      line.push(new THREE.Vector3(END + (s / STEPS) * (FAR - END), y, (random() - 0.5) * 0.02 + (p / PATHS - 0.5) * 1.6 * (s / STEPS)));
    }
    ends.push(y);
    paths.push(line);
  }
  const fan = staticRibbons(paths, { width: 0.014, minPx: 1, color: ICE, gain: 0.9, opacity: 0.5 });
  set.add(fan);
  const mean = ends.reduce((a, b) => a + b, 0) / PATHS;
  const meanLine = staticRibbons([[new THREE.Vector3(END, last, 0.3), new THREE.Vector3(FAR, mean, 0.3)]], { width: 0.06, minPx: 1.6, color: AMBER, gain: 1.5 });
  set.add(meanLine);

  // Where they land: a histogram, and the curve theory says it should follow.
  const sigma = Math.sqrt(ends.reduce((a, b) => a + (b - mean) ** 2, 0) / PATHS);
  const BINS = 22;
  const lo = mean - 3 * sigma;
  const step = (6 * sigma) / BINS;
  const counts = new Array(BINS).fill(0);
  for (const y of ends) counts[Math.min(BINS - 1, Math.max(0, Math.floor((y - lo) / step)))]++;
  const peak = Math.max(...counts);
  const bars = field(new THREE.BoxGeometry(1, 1, 1), lit, BINS, (i, d, color) => {
    const wide = (counts[i] / peak) * 1.7 + 0.02;
    d.position.set(FAR + 0.25 + wide / 2, lo + (i + 0.5) * step, 0);
    d.scale.set(wide, step * 0.86, 0.5);
    color.set(UP).multiplyScalar(0.9);
  });
  set.add(bars);
  const bell: THREE.Vector3[] = [];
  for (let i = 0; i <= 60; i++) {
    const y = lo + (i / 60) * 6 * sigma;
    bell.push(new THREE.Vector3(FAR + 0.25 + Math.exp(-((y - mean) ** 2) / (2 * sigma * sigma)) * 1.8, y, 0.3));
  }
  const curve = staticRibbons([bell], { width: 0.06, minPx: 1.6, color: AMBER, gain: 1.5 });
  set.add(curve);

  // ---- the chain: blocks, each carrying the hash of the one before; the newest is still being mined ----
  const face = paint(128, 128, (ctx, w) => {
    const r = rng(33);
    ctx.fillStyle = "#04101a";
    ctx.fillRect(0, 0, w, w);
    // The hash of the block before, across the head, and this block's own figures under it.
    ctx.fillStyle = "#ffb648";
    ctx.fillRect(12, 14, w - 24, 9);
    ctx.fillStyle = "rgba(159,220,255,0.8)";
    for (let y = 36; y < w - 14; y += 13) for (let x = 12; x < w - 20; ) {
      const wide = 6 + r() * 16;
      ctx.fillRect(x, y, Math.min(wide, w - 12 - x), 6);
      x += wide + 5;
    }
  });
  const sealed = new THREE.MeshBasicMaterial({ map: face, color: new THREE.Color(1.15, 1.15, 1.15) });
  const mining = new THREE.MeshBasicMaterial({ map: face, color: new THREE.Color(1.5, 1.2, 0.7) });
  const rim = new THREE.LineBasicMaterial({ color: new THREE.Color(0.9, 1.3, 1.6), transparent: true, opacity: 0.85 });
  const BLOCKS = 6;
  const chain = put(new THREE.Group(), 8.4, 5.6, -13.5, 0.08, -0.42, 0.05);
  const newest = new THREE.Group();
  for (let i = 0; i < BLOCKS; i++) {
    const last = i === BLOCKS - 1;
    const block = last ? newest : new THREE.Group();
    block.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), last ? mining : sealed), new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.05, 1.05, 1.05)), rim));
    chain.add(put(block, (i - (BLOCKS - 1) / 2) * 1.6, 0, 0));
    if (i) chain.add(put(box(0.6, 0.07, 0.07, glow(AMBER, 1.5)), (i - BLOCKS / 2) * 1.6, 0, 0));
  }
  slide.add(chain);

  // Where the labels of the two projects hang.
  const anchors: Record<string, THREE.Object3D> = { monte: put(new THREE.Object3D(), 1.2, 3.4, 0), chain: put(new THREE.Object3D(), -(BLOCKS / 2) * 1.6, 1.0, 0) };
  set.add(anchors.monte);
  chain.add(anchors.chain);

  slide.add(dust({ count: 700, size: [40, 14, 46], centre: [0, 3, 0], color: 0x9fdcff, gain: 0.6, point: 0.04, seed: 61 }));

  return {
    root,
    slide,
    anchors,
    update({ ch, time, theta }) {
      // The paths draw out from the last price; then they are run again.
      const run = (time % 11) / 11;
      const drawn = ch[6] * Math.min(1, run / 0.36);
      const reveal = drawn >= 1 ? 2 : drawn;
      fan.material.uniforms.uReveal.value = reveal;
      meanLine.material.uniforms.uReveal.value = reveal;
      curve.material.uniforms.uReveal.value = drawn >= 1 ? 2 : Math.max(0, drawn * 2 - 1);
      bars.visible = drawn > 0.6;
      // The ticker runs on its own, and faster with the wheel.
      tape.offset.x = time * 0.012 + theta * 0.05;
      // Leaving, the series is switched off (it stands in the way to the doors): it sinks back into its post.
      const off = Math.min(1, Math.max(0, (ch[7] - 0.02) / 0.22));
      const stand = 1 - off * off * (3 - 2 * off);
      set.scale.set(SIZE, SIZE * Math.max(0.001, stand), SIZE);
      set.position.y = 0.3 - (1 - stand) * 3.6;
      set.visible = stand > 0.004;
      // Mining: the newest block turns over, one face at a time, until it is found; then it starts on the next.
      const work = time * 0.5 + theta * 1.2;
      const tried = Math.floor(work);
      const turn = work - tried;
      newest.rotation.x = (tried + turn * turn * (3 - 2 * turn)) * (Math.PI / 2);
      chain.position.y = 5.6 + Math.sin(time * 0.6) * 0.08 - (1 - stand) * 0.6;
      // The doors swing open as the camera makes for them.
      const open = Math.min(1, Math.max(0, ch[7] / 0.45));
      const swing = open * open * (3 - 2 * open) * 1.75;
      for (const { hinge, side } of leaves) hinge.rotation.y = -side * swing;
    },
  };
}
