import * as THREE from "three";
import { ball, box, cyl, dust, field, matte, paint, put, rng, shell, type Place } from "../kit";
import { circle, staticRibbons } from "../ribbons";
import { PAGE } from "../table";

/**
 * 05 Markets. Salmon newsprint and ink. A candlestick series runs in from
 * the left; where it ends, a fan of simulated price paths (the Monte Carlo
 * project) spreads out to a histogram with the theoretical curve laid over
 * it. In front, a podium with a qubit on its third step: third place at the
 * Quantum × Finance hackathon. `p` draws the paths.
 */

const TEAL = 0x0f6b5c;
const CLARET = 0x9b1c2e;
const INK = 0x17131a;
const PAPER = 0xfbf1e6;

export function chart(): Place {
  const { root, slide } = shell();
  const random = rng(105);
  const gauss = () => Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());
  const set = put(new THREE.Group(), -0.9, 0.5, -1.5, 0.04, 0.42, 0);
  slide.add(set);
  const anchors: Record<string, THREE.Object3D> = {};

  // ---- the page: salmon newsprint, columns of type down the margins; its head lies just above the frame ----
  const page = paint(1024, 640, (ctx, w, h) => {
    ctx.fillStyle = "#f1d9c5";
    ctx.fillRect(0, 0, w, h);
    const r = rng(52);
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle = `rgba(${r() < 0.5 ? "120,80,50" : "255,255,255"},${0.03 + r() * 0.05})`;
      ctx.fillRect(r() * w, r() * h, 1.5, 1.5);
    }
    ctx.fillStyle = "#17131a";
    ctx.fillRect(40, 62, w - 80, 3);
    ctx.fillRect(40, 70, w - 80, 1);
    ctx.fillRect(40, h - 44, w - 80, 2);
    // Type, set in columns down either margin and along the foot.
    ctx.fillStyle = "rgba(23,19,26,0.3)";
    for (const [x0, x1] of [[40, 86], [94, 140], [w - 140, w - 94], [w - 86, w - 40]]) {
      for (let y = 90; y < h - 70; y += 4) ctx.fillRect(x0, y, (x1 - x0) * (r() < 0.12 ? 0.5 : 1), 1.2);
    }
    for (let x = 150; x < w - 150; x += 62) {
      for (let y = 330; y < h - 70; y += 4) ctx.fillRect(x, y, 54 * (r() < 0.12 ? 0.5 : 1), 1.2);
    }
  });
  slide.add(put(new THREE.Mesh(new THREE.PlaneGeometry(PAGE.wide, PAGE.tall), new THREE.MeshBasicMaterial({ map: page })), PAGE.x, PAGE.y, PAGE.z));
  // The masthead, set large enough to be read as the camera comes down the desk on to the page.
  const head = paint(2048, 220, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#17131a";
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.font = `900 150px "Inter", sans-serif`;
    ctx.fillText("MARKETS", 0, 160);
    ctx.font = `400 44px "Space Mono", monospace`;
    ctx.textAlign = "right";
    ctx.fillText("HELSINKI  ·  MMXXVI  ·  NO. 05", w, 150);
    ctx.fillRect(0, h - 14, w, 6);
  });
  slide.add(put(new THREE.Mesh(new THREE.PlaneGeometry(17.4, 1.87), new THREE.MeshBasicMaterial({ map: head, transparent: true, depthWrite: false })), 0, PAGE.y + PAGE.tall / 2 - 1.75, PAGE.z + 0.02));

  // ---- the series ----
  const N = 120;
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
  const FLOOR = -3.6;
  const flat = matte(0xffffff, 0.85);
  set.add(
    field(new THREE.BoxGeometry(1, 1, 1), flat, N, (i, d, color) => {
      const c = candles[i];
      d.position.set(c.x, (c.open + c.close) / 2, 0);
      d.scale.set(0.24, Math.max(0.03, Math.abs(c.close - c.open)), 0.24);
      color.set(c.close >= c.open ? TEAL : CLARET);
    }),
    field(new THREE.BoxGeometry(1, 1, 1), flat, N, (i, d, color) => {
      const c = candles[i];
      d.position.set(c.x, (c.high + c.low) / 2, 0);
      d.scale.set(0.035, c.high - c.low, 0.035);
      color.set(INK);
    }),
    // Volume, along the floor.
    field(new THREE.BoxGeometry(1, 1, 1), flat, N, (i, d, color) => {
      const c = candles[i];
      const v = 0.08 + Math.abs(c.close - c.open) * 0.7 + random() * 0.15;
      d.position.set(c.x, FLOOR + v / 2, 0);
      d.scale.set(0.24, v, 0.12);
      color.set(0xb79782);
    }),
  );
  // A moving average through the closes, and the rules of the chart.
  const average: THREE.Vector3[] = [];
  for (let i = 7; i < N; i++) {
    let sum = 0;
    for (let k = 0; k < 8; k++) sum += candles[i - k].close;
    average.push(new THREE.Vector3(candles[i].x, sum / 8, 0.2));
  }
  set.add(staticRibbons([average], { width: 0.05, minPx: 1.4, color: INK, gain: 1, ink: true }));
  const rules: THREE.Vector3[][] = [];
  for (let y = -3; y <= 4; y++) rules.push([new THREE.Vector3(-44, y * 1.1, -0.3), new THREE.Vector3(7.4, y * 1.1, -0.3)]);
  for (let x = -40; x <= 7; x += 4) rules.push([new THREE.Vector3(x, FLOOR, -0.3), new THREE.Vector3(x, 4.6, -0.3)]);
  set.add(staticRibbons(rules, { width: 0.012, minPx: 1, color: INK, gain: 1, opacity: 0.16, ink: true }));
  set.add(staticRibbons([[new THREE.Vector3(-44, FLOOR, 0), new THREE.Vector3(7.4, FLOOR, 0)], [new THREE.Vector3(7.4, FLOOR, 0), new THREE.Vector3(7.4, 4.8, 0)]], { width: 0.045, minPx: 1.4, color: INK, gain: 1, ink: true }));

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
  const fan = staticRibbons(paths, { width: 0.014, minPx: 1, color: INK, gain: 1, opacity: 0.3, ink: true });
  set.add(fan);
  const mean = ends.reduce((a, b) => a + b, 0) / PATHS;
  const meanLine = staticRibbons([[new THREE.Vector3(END, last, 0.3), new THREE.Vector3(FAR, mean, 0.3)]], { width: 0.06, minPx: 1.6, color: CLARET, gain: 1, ink: true });
  set.add(meanLine);

  // Where they land: a histogram, and the curve theory says it should follow.
  const sigma = Math.sqrt(ends.reduce((a, b) => a + (b - mean) ** 2, 0) / PATHS);
  const BINS = 22;
  const lo = mean - 3 * sigma;
  const step = (6 * sigma) / BINS;
  const counts = new Array(BINS).fill(0);
  for (const y of ends) counts[Math.min(BINS - 1, Math.max(0, Math.floor((y - lo) / step)))]++;
  const peak = Math.max(...counts);
  const bars = field(new THREE.BoxGeometry(1, 1, 1), flat, BINS, (i, d, color) => {
    const wide = (counts[i] / peak) * 1.7 + 0.02;
    d.position.set(FAR + 0.25 + wide / 2, lo + (i + 0.5) * step, 0);
    d.scale.set(wide, step * 0.86, 0.5);
    color.set(TEAL);
  });
  set.add(bars);
  const bell: THREE.Vector3[] = [];
  for (let i = 0; i <= 60; i++) {
    const y = lo + (i / 60) * 6 * sigma;
    bell.push(new THREE.Vector3(FAR + 0.25 + Math.exp(-((y - mean) ** 2) / (2 * sigma * sigma)) * 1.8, y, 0.3));
  }
  const curve = staticRibbons([bell], { width: 0.06, minPx: 1.6, color: CLARET, gain: 1, ink: true });
  set.add(curve);

  // ---- the podium, and a qubit on the third step ----
  const stone = matte(0xe2d0bf, 0.85);
  const podium = put(new THREE.Group(), 2.0, FLOOR + 0.15, 3.6, 0, -0.42, 0);
  podium.scale.setScalar(0.8);
  const face = (n: string, hot: boolean) =>
    paint(128, 128, (ctx, w) => {
      ctx.fillStyle = hot ? "#9b1c2e" : "#fbf1e6";
      ctx.fillRect(0, 0, w, w);
      ctx.fillStyle = hot ? "#fbf1e6" : "#17131a";
      ctx.font = `900 92px "Inter", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(n, w / 2, w / 2 + 6);
    });
  const steps: [number, number, string][] = [[0, 1.5, "1"], [-1.5, 1.1, "2"], [1.5, 0.75, "3"]];
  for (const [x, tall, n] of steps) {
    const hot = n === "3";
    podium.add(put(box(1.5, tall, 1.5, hot ? matte(CLARET, 0.7) : stone), x, tall / 2, 0));
    podium.add(put(new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: face(n, hot) })), x, tall / 2, 0.76));
  }
  // The Bloch sphere: three great circles, an axis, and the state as an arrow.
  const qubit = put(new THREE.Group(), 1.5, 0.75 + 1.0, 0);
  const great = [circle(0.72, 64), circle(0.72, 64).map((p) => p.applyEuler(new THREE.Euler(Math.PI / 2, 0, 0))), circle(0.72, 64).map((p) => p.applyEuler(new THREE.Euler(0, Math.PI / 2, 0)))];
  qubit.add(staticRibbons(great, { width: 0.025, minPx: 1.2, color: INK, gain: 1, ink: true }));
  qubit.add(staticRibbons([[new THREE.Vector3(0, -0.95, 0), new THREE.Vector3(0, 0.95, 0)]], { width: 0.02, minPx: 1, color: INK, gain: 1, opacity: 0.6, ink: true }));
  const state = new THREE.Group();
  state.add(put(cyl(0.025, 0.025, 0.66, matte(CLARET, 0.6), 8), 0, 0.33, 0), put(new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 12), matte(CLARET, 0.6)), 0, 0.7, 0));
  qubit.add(state, ball(0.06, matte(INK, 0.5), 10));
  podium.add(qubit);
  set.add(podium);
  anchors.quantum = put(new THREE.Object3D(), 1.5, 3.1, 0);
  podium.add(anchors.quantum);

  // Coins, stacked, between the chart and the lens.
  const gold = new THREE.MeshStandardMaterial({ color: 0xb98a2e, roughness: 0.4, metalness: 0.9 });
  const coins: [number, number, number][] = [];
  for (const [x, z, n] of [[-2.6, 3.4, 9], [-1.7, 3.9, 5], [-3.5, 4.1, 13], [6.9, 2.6, 7], [7.7, 2.2, 4]] as const) for (let i = 0; i < n; i++) coins.push([x + (random() - 0.5) * 0.04, FLOOR + 0.045 + i * 0.09, z + (random() - 0.5) * 0.04]);
  set.add(field(new THREE.CylinderGeometry(0.4, 0.4, 0.075, 28), gold, coins.length, (i, d) => d.position.set(...coins[i])));

  // ---- ticker tape, looping over the chart ----
  const tape = paint(1024, 64, (ctx, w, h) => {
    ctx.fillStyle = "#fbf1e6";
    ctx.fillRect(0, 0, w, h);
    ctx.font = `700 30px "Space Mono", monospace`;
    ctx.textBaseline = "middle";
    const r = rng(8);
    for (let x = 14; x < w - 120; x += 168) {
      const up = r() > 0.42;
      ctx.fillStyle = up ? "#0f6b5c" : "#9b1c2e";
      ctx.fillText(`${up ? "▲" : "▼"} ${(r() * 3).toFixed(2)}%`, x, h / 2 + 2);
    }
  });
  tape.wrapS = THREE.RepeatWrapping;
  tape.repeat.set(4, 1);
  const tapeCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(-16, 4.6, -5), new THREE.Vector3(-8, 4.0, -2.5), new THREE.Vector3(-1, 4.5, -3.5), new THREE.Vector3(5, 3.9, -1.5), new THREE.Vector3(11, 4.4, -3), new THREE.Vector3(18, 3.8, -1)]);
  const tapeGeometry = new THREE.PlaneGeometry(1, 0.42, 160, 1);
  const tapeAt = tapeGeometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < tapeAt.count; i++) {
    const t = tapeAt.getX(i) + 0.5;
    const c = tapeCurve.getPoint(t);
    const twist = Math.sin(t * 22) * 0.5;
    const across = tapeAt.getY(i);
    tapeAt.setXYZ(i, c.x, c.y + across * Math.cos(twist), c.z + across * Math.sin(twist));
  }
  tapeGeometry.computeVertexNormals();
  slide.add(new THREE.Mesh(tapeGeometry, new THREE.MeshStandardMaterial({ map: tape, roughness: 0.9, side: THREE.DoubleSide })));

  slide.add(dust({ count: 400, size: [50, 18, 30], centre: [0, 1, -4], color: 0x5a4636, gain: 1, point: 0.035, seed: 61, ink: true }));

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
      bars.scale.set(1, 1, 1);
      bars.visible = drawn > 0.6;
      // The qubit precesses.
      state.rotation.set(0.9 + Math.sin(time * 0.7) * 0.25, time * 0.9 + theta * 1.2, 0);
      qubit.rotation.y = time * 0.25 + theta * 0.6;
      tape.offset.x = -time * 0.05 - theta * 0.06;
    },
  };
}
