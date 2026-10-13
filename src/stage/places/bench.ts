import * as THREE from "three";
import { ball, box, cyl, dust, field, glow, matte, paint, put, shell, type Place } from "../kit";
import { circle, staticRibbons } from "../ribbons";

/**
 * 04 Machine. A FIRST Lego League table, as it would sit on a drawing
 * board: the mat with its line to follow, mission models built from bricks,
 * and the robot working along the line. Every few seconds it comes apart
 * into an exploded view, which is the CAD half of the chapter. Behind it,
 * on the blueprint itself, the three views and their dimensions.
 */

const P = 0.4; // stud pitch
const H = 0.48; // brick height
const MAT = { w: 15.2, d: 7.6 };

/** The line on the mat: t in 0..1 to mat coordinates (x, z). */
const track = (t: number): [number, number] => [-6.1 + 12.2 * t, 0.5 + Math.sin(t * Math.PI * 1.9) * 1.7];

type Brick = { x: number; z: number; w: number; l: number; level: number; h: number; color: number };

/** Bricks in stud coordinates, drawn as two instanced meshes: the blocks, and the studs on top of them. */
function lego(bricks: Brick[]) {
  const group = new THREE.Group();
  const plastic = matte(0xffffff, 0.3, 0.02);
  group.add(
    field(new THREE.BoxGeometry(1, 1, 1), plastic, bricks.length, (i, d, color) => {
      const b = bricks[i];
      d.position.set((b.x + b.w / 2) * P - MAT.w / 2, (b.level + b.h / 2) * H, (b.z + b.l / 2) * P - MAT.d / 2);
      d.scale.set(b.w * P - 0.015, b.h * H, b.l * P - 0.015);
      color.set(b.color);
    }),
  );
  const studs: [number, number, number, number][] = [];
  for (const b of bricks) for (let i = 0; i < b.w; i++) for (let k = 0; k < b.l; k++) studs.push([(b.x + i + 0.5) * P - MAT.w / 2, (b.level + b.h) * H + 0.04, (b.z + k + 0.5) * P - MAT.d / 2, b.color]);
  group.add(
    field(new THREE.CylinderGeometry(0.115, 0.115, 0.085, 14), plastic, studs.length, (i, d, color) => {
      d.position.set(studs[i][0], studs[i][1], studs[i][2]);
      color.set(studs[i][3]);
    }),
  );
  return group;
}

const RED = 0xc8202a;
const YELLOW = 0xf2c200;
const WHITE = 0xe9ecef;
const GREEN = 0x1f9e4a;
const ORANGE = 0xf07a1c;
const DARK = 0x22262c;

export function bench(): Place {
  const { root, slide } = shell();
  // The table, tipped towards the camera on the left of the frame.
  const set = put(new THREE.Group(), -2.9, -1.3, -5.5, 0.7, 0.5, 0.05);
  set.scale.setScalar(0.74);
  slide.add(set);

  // ---- the mat ----
  const print = paint(1216, 608, (ctx, w, h) => {
    const X = (x: number) => ((x + MAT.w / 2) / MAT.w) * w;
    const Z = (z: number) => ((z + MAT.d / 2) / MAT.d) * h;
    ctx.fillStyle = "#e6eaef";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(20,68,196,0.14)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 32) ctx.strokeRect(x, 0, 32, h);
    for (let y = 0; y < h; y += 32) ctx.strokeRect(0, y, w, 32);
    // Launch area, target zones.
    ctx.fillStyle = "#1444c4";
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.arc(0, h, 190, -Math.PI / 2, 0);
    ctx.fill();
    for (const [x, z, r, color] of [[2.6, -2.0, 70, "#f2c200"], [5.6, 1.9, 56, "#c8202a"], [-3.2, 2.4, 50, "#1f9e4a"], [-0.8, -2.5, 44, "#f07a1c"]] as const) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(X(x), Z(z), r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e6eaef";
      ctx.beginPath();
      ctx.arc(X(x), Z(z), r * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    // The line to follow: black, with a white margin, as on the real mats.
    for (const [width, color] of [[30, "#ffffff"], [14, "#111418"]] as const) {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = 0; i <= 80; i++) {
        const [x, z] = track(i / 80);
        if (i === 0) ctx.moveTo(X(x), Z(z));
        else ctx.lineTo(X(x), Z(z));
      }
      ctx.stroke();
    }
    ctx.fillStyle = "#111418";
    ctx.font = `700 26px "Space Mono", monospace`;
    ctx.fillText("START", 22, h - 26);
  });
  set.add(put(new THREE.Mesh(new THREE.PlaneGeometry(MAT.w, MAT.d), new THREE.MeshStandardMaterial({ map: print, roughness: 0.75 })), 0, 0.005, 0, -Math.PI / 2));
  set.add(put(box(MAT.w + 0.7, 0.3, MAT.d + 0.7, matte(0x1a1d22, 0.6)), 0, -0.16, 0));
  const wall = matte(0x101216, 0.5);
  for (const z of [-1, 1]) set.add(put(box(MAT.w + 0.7, 0.55, 0.22, wall), 0, 0.2, z * (MAT.d / 2 + 0.24)));
  for (const x of [-1, 1]) set.add(put(box(0.22, 0.55, MAT.d + 0.7, wall), x * (MAT.w / 2 + 0.24), 0.2, 0));

  // ---- mission models ----
  const bricks: Brick[] = [
    // a crane
    { x: 3, z: 1, w: 4, l: 4, level: 0, h: 1, color: DARK },
    { x: 4, z: 2, w: 2, l: 2, level: 1, h: 6, color: YELLOW },
    { x: 4, z: 0, w: 2, l: 8, level: 7, h: 1, color: RED },
    { x: 4, z: 7, w: 2, l: 1, level: 5, h: 2, color: DARK },
    // a bridge
    { x: 13, z: 12, w: 2, l: 4, level: 0, h: 2, color: WHITE },
    { x: 21, z: 12, w: 2, l: 4, level: 0, h: 2, color: WHITE },
    { x: 12, z: 12, w: 12, l: 4, level: 2, h: 1, color: YELLOW },
    { x: 12, z: 12, w: 1, l: 4, level: 3, h: 1, color: RED },
    { x: 23, z: 12, w: 1, l: 4, level: 3, h: 1, color: RED },
    // the mast of the turbine
    { x: 29, z: 1, w: 4, l: 4, level: 0, h: 1, color: GREEN },
    { x: 30, z: 2, w: 2, l: 2, level: 1, h: 8, color: WHITE },
    // cargo
    { x: 9, z: 14, w: 2, l: 2, level: 0, h: 1, color: RED },
    { x: 9, z: 14, w: 2, l: 2, level: 1, h: 1, color: YELLOW },
    { x: 33, z: 13, w: 2, l: 4, level: 0, h: 1, color: GREEN },
    { x: 33, z: 14, w: 2, l: 2, level: 1, h: 1, color: WHITE },
    { x: 17, z: 1, w: 2, l: 2, level: 0, h: 2, color: ORANGE },
    { x: 21, z: 1, w: 4, l: 2, level: 0, h: 1, color: RED },
    { x: 1, z: 10, w: 2, l: 2, level: 0, h: 1, color: YELLOW },
  ];
  set.add(lego(bricks));
  // The turbine's blades turn.
  const rotor = put(new THREE.Group(), (31 * P - MAT.w / 2), 9.2 * H, (4 * P - MAT.d / 2) + 0.12);
  for (let i = 0; i < 3; i++) {
    const blade = put(new THREE.Group(), 0, 0, 0, 0, 0, (i * Math.PI * 2) / 3);
    blade.add(put(box(0.24, 1.7, 0.08, matte(WHITE, 0.3)), 0, 0.9, 0));
    rotor.add(blade);
  }
  rotor.add(put(cyl(0.18, 0.18, 0.2, matte(RED, 0.3), 16), 0, 0, 0, Math.PI / 2));
  set.add(rotor);

  // ---- the robot ----
  type Part = { mesh: THREE.Object3D; rest: THREE.Vector3; away: THREE.Vector3 };
  const robot = new THREE.Group();
  const parts: Part[] = [];
  const part = (mesh: THREE.Object3D, rest: [number, number, number], away: [number, number, number]) => {
    mesh.position.set(...rest);
    robot.add(mesh);
    parts.push({ mesh, rest: new THREE.Vector3(...rest), away: new THREE.Vector3(...away) });
    return mesh;
  };
  const tyre = matte(0x15171a, 0.7);
  const grey = matte(0x9aa0a8, 0.4, 0.2);
  // Hub: white brick, a yellow band, and its light matrix on top.
  const hub = new THREE.Group();
  hub.add(box(1.3, 0.62, 1.7, matte(WHITE, 0.32)), put(box(1.32, 0.16, 1.72, matte(YELLOW, 0.32)), 0, -0.15, 0));
  const matrix = paint(128, 128, (ctx, w) => {
    ctx.fillStyle = "#0b0d10";
    ctx.fillRect(0, 0, w, w);
    const face = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0];
    face.forEach((on, i) => {
      ctx.fillStyle = on ? "#ffe45c" : "#2a2d31";
      ctx.fillRect(14 + (i % 5) * 21, 14 + Math.floor(i / 5) * 21, 15, 15);
    });
  });
  hub.add(put(new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), new THREE.MeshBasicMaterial({ map: matrix, color: new THREE.Color(1.5, 1.5, 1.5) })), 0, 0.315, 0.2, -Math.PI / 2));
  part(hub, [0, 0.95, 0], [0, 1.5, 0]);
  const wheels: THREE.Object3D[] = [];
  for (const side of [-1, 1]) {
    const wheel = new THREE.Group();
    wheel.add(put(cyl(0.52, 0.52, 0.34, tyre, 28), 0, 0, 0, 0, 0, Math.PI / 2), put(cyl(0.28, 0.28, 0.36, grey, 16), 0, 0, 0, 0, 0, Math.PI / 2));
    for (let s = 0; s < 3; s++) wheel.add(put(box(0.37, 0.07, 0.5, grey), 0, 0, 0, (s * Math.PI) / 3));
    part(wheel, [side * 0.88, 0.52, 0.25], [side * 1.5, 0, 0]);
    wheels.push(wheel);
    part(box(0.36, 0.44, 1.0, grey), [side * 0.46, 0.5, 0.2], [side * 0.6, -0.1, -0.9]); // motor
  }
  const caster = new THREE.Group();
  caster.add(ball(0.17, matte(0xc4c8ce, 0.2, 0.9), 14), put(box(0.3, 0.2, 0.3, matte(DARK, 0.4)), 0, 0.22, 0));
  part(caster, [0, 0.17, -0.72], [0, -0.1, -1.4]);
  // The attachment: two liftarms, a crossbeam, a fork.
  const arm = new THREE.Group();
  for (const x of [-0.36, 0.36]) arm.add(put(box(0.15, 0.15, 1.5, matte(YELLOW, 0.32)), x, 0, 0.75));
  arm.add(put(box(1.0, 0.15, 0.15, matte(RED, 0.32)), 0, 0, 1.5));
  for (const x of [-0.36, 0.36]) arm.add(put(box(0.12, 0.12, 0.5, matte(DARK, 0.4)), x, -0.2, 1.72, 0.5));
  part(arm, [0, 0.8, 0.8], [0, 0.6, 1.5]);
  const eye = new THREE.Group();
  eye.add(box(0.34, 0.3, 0.42, matte(DARK, 0.4)), put(box(0.16, 0.02, 0.16, glow(0xff3b30, 2.4)), 0, -0.16, 0.05));
  part(eye, [0, 0.36, 1.05], [0, -0.05, 2.1]);
  // Leaders: a line from where each part sits to where it has been pulled to.
  const leaders = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(parts.flatMap((p) => [p.rest, p.rest.clone().add(p.away)])),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }),
  );
  robot.add(leaders);
  robot.scale.setScalar(1.35);
  set.add(robot);

  // ---- the sheet itself: blueprint blue with its grid ----
  const blue = paint(256, 256, (ctx, w) => {
    ctx.fillStyle = "#1444c4";
    ctx.fillRect(0, 0, w, w);
    ctx.strokeStyle = "rgba(255,255,255,0.11)";
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 32) {
      ctx.strokeRect(i, 0, 32, w);
      ctx.strokeRect(0, i, w, 32);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, w, w);
  });
  blue.wrapS = blue.wrapT = THREE.RepeatWrapping;
  blue.repeat.set(88 / 8, 60 / 8);
  slide.add(put(new THREE.Mesh(new THREE.PlaneGeometry(88, 60), new THREE.MeshBasicMaterial({ map: blue })), -16, 0, -9.4));
  // ---- the drawing on it: three views, dimensions, construction lines ----
  const sheet = put(new THREE.Group(), 0, 0, -9);
  slide.add(sheet);
  const rect = (x: number, y: number, w: number, h: number) => [new THREE.Vector3(x, y, 0), new THREE.Vector3(x + w, y, 0), new THREE.Vector3(x + w, y + h, 0), new THREE.Vector3(x, y + h, 0), new THREE.Vector3(x, y, 0)];
  const seg = (x0: number, y0: number, x1: number, y1: number) => [new THREE.Vector3(x0, y0, 0), new THREE.Vector3(x1, y1, 0)];
  const ring = (x: number, y: number, r: number) => circle(r, 48).map((p) => p.add(new THREE.Vector3(x, y, 0)));
  /** A dimension: the line, and a tick at each end. */
  const dim = (x0: number, x1: number, y: number) => [seg(x0, y, x1, y), seg(x0, y - 0.25, x0, y + 0.25), seg(x1, y - 0.25, x1, y + 0.25)];
  const drawn: THREE.Vector3[][] = [
    // top view
    rect(-12.6, 4.2, 2.6, 3.4), rect(-13.3, 4.9, 0.7, 2.0), rect(-10.0, 4.9, 0.7, 2.0), rect(-12.0, 7.6, 1.4, 1.6), ...dim(-13.3, -9.3, 3.5),
    // side view
    rect(-5.6, 5.4, 3.6, 1.3), ring(-4.3, 5.2, 1.05), ring(-4.3, 5.2, 0.5), ring(-2.5, 4.5, 0.34), seg(-2.0, 5.9, 0.2, 5.2), seg(0.2, 5.2, 0.5, 4.5), ...dim(-5.6, 0.5, 3.6),
    // front view
    rect(4.0, 5.0, 2.8, 1.5), rect(3.2, 4.2, 0.8, 2.1), rect(6.8, 4.2, 0.8, 2.1), rect(4.6, 6.5, 1.6, 0.5), ...dim(3.2, 7.6, 3.5),
    // title block
    rect(5.2, -8.4, 9.6, 2.6), seg(5.2, -7.1, 14.8, -7.1), seg(10.2, -8.4, 10.2, -7.1),
    // sheet border
    rect(-17.5, -9.2, 35, 19.4),
  ];
  sheet.add(staticRibbons(drawn, { width: 0.045, minPx: 1.1, color: 0xffffff, gain: 0.85, opacity: 0.9 }));
  const guides: THREE.Vector3[][] = [ring(-4.3, 5.2, 3.2), ring(5.4, 5.6, 2.6), seg(-17, 5.2, 17, 5.2), seg(-4.3, -9, -4.3, 10), seg(5.4, -9, 5.4, 10), ring(-11.3, 5.9, 2.9)];
  sheet.add(staticRibbons(guides, { width: 0.03, minPx: 1, color: 0xffffff, gain: 0.45, opacity: 0.7, dash: 46 }));
  const legend = paint(1024, 280, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "middle";
    ctx.font = `700 40px "Space Mono", monospace`;
    ctx.fillText("FIRST LEGO LEAGUE", 26, 46);
    ctx.font = `400 30px "Space Mono", monospace`;
    ctx.fillText("WORLD FESTIVAL · DETROIT 2019", 26, 100);
    ctx.font = `700 64px "Inter", sans-serif`;
    ctx.fillText("#8", 30, 210);
    ctx.font = `400 28px "Space Mono", monospace`;
    ctx.fillText("OF 110+ NATIONS", 560, 196);
    ctx.fillText("#1 NORTH INDIA", 560, 236);
  });
  sheet.add(put(new THREE.Mesh(new THREE.PlaneGeometry(9.3, 2.54), new THREE.MeshBasicMaterial({ map: legend, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })), 10.0, -7.1, 0.02));

  slide.add(dust({ count: 700, size: [50, 30, 40], centre: [0, 2, -6], color: 0xdfe8ff, gain: 0.7, point: 0.04, seed: 44 }));

  let turned = 0;
  return {
    root,
    slide,
    update({ time, dt }) {
      rotor.rotation.z = time * 1.3;

      // Drive, stop, come apart, hold, go back together: ten seconds, then again.
      const beat = time % 10;
      const apart = beat < 6 ? 0 : beat < 7 ? beat - 6 : beat < 9 ? 1 : 10 - beat;
      const e = apart * apart * (3 - 2 * apart);
      const driving = beat < 5.6 ? 1 : 0;
      // Along the line and back, facing the way it is going.
      const lap = Math.floor(time / 10) * 5.6 + Math.min(beat, 5.6);
      const t = 0.5 - 0.44 * Math.cos(lap * 0.42);
      const heading = Math.sin(lap * 0.42) >= 0 ? 1 : -1;
      const [x, z] = track(t);
      const [x2, z2] = track(Math.min(1, Math.max(0, t + 0.01 * heading)));
      robot.position.set(x, e * 0.5, z);
      const yaw = Math.atan2(x2 - x, z2 - z);
      robot.rotation.y += (yaw - robot.rotation.y) * Math.min(1, dt * 5);
      turned += dt * 5 * driving;
      for (const p of parts) p.mesh.position.copy(p.rest).addScaledVector(p.away, e);
      for (const wheel of wheels) wheel.rotation.x = turned;
      arm.rotation.x = -0.25 - 0.3 * Math.max(0, Math.sin(time * 0.9)) * (1 - e);
      leaders.material.opacity = e * 0.9;
    },
  };
}
