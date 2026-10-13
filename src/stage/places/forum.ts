import * as THREE from "three";
import { ball, beam, box, cyl, dust, glow, matte, paint, put, rng, shell, shared, type Place } from "../kit";

/**
 * 06 Stage. An auditorium, seen from the stage: the lectern and its
 * microphone in front, crimson curtains either side, three spots in the
 * rafters, and beyond the footlights three and a half thousand small
 * lights, one for each student. The seventy at the front, brighter, are
 * the council. Behind the last row, a gilded balcony front and a panelled
 * wall. The banners are the three events. On the lectern lies the page the
 * camera has just been reading; overhead, an opening to the floor above.
 */

const CROWD_VERTEX = /* glsl */ `
  attribute float aSeed, aRank;
  uniform float uTime, uPxScale, uFog;
  varying float vAlpha;
  varying float vRank;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float d = -mv.z;
    float s = length(modelViewMatrix[0].xyz);
    float twinkle = 0.75 + 0.25 * sin(uTime * (1.0 + aSeed * 3.0) + aSeed * 40.0);
    gl_PointSize = clamp((0.13 + aSeed * 0.07 + aRank * 0.14) * s * uPxScale / max(d, 0.1), 1.2, 22.0);
    vAlpha = exp(-pow(uFog * d * 0.8, 2.0)) * twinkle;
    vRank = aRank;
    gl_Position = projectionMatrix * mv;
  }
`;
const CROWD_FRAGMENT = /* glsl */ `
  varying float vAlpha;
  varying float vRank;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.08, r) * vAlpha;
    if (a < 0.004) discard;
    // Students: warm. Council: white, and bright enough to bloom.
    vec3 c = mix(vec3(1.0, 0.56, 0.28) * 0.95, vec3(1.0, 0.94, 0.86) * 2.6, vRank);
    gl_FragColor = vec4(c, a);
  }
`;

export function forum(): Place {
  const { root, slide } = shell();
  const random = rng(350);
  const FLOOR = -3.3;

  // ---- the house: 3,500 lights on a raked, curved floor ----
  const STUDENTS = 3500;
  const COUNCIL = 70;
  const rows = 46;
  const lengths = Array.from({ length: rows }, (_, i) => 15 + i * 0.86);
  const total = lengths.reduce((a, b) => a + b, 0);
  const positions: number[] = [];
  const seeds: number[] = [];
  const ranks: number[] = [];
  let placed = 0;
  for (let i = 0; i < rows; i++) {
    const want = i === rows - 1 ? STUDENTS - placed : Math.round((lengths[i] / total) * STUDENTS);
    const radius = 15 + i * 0.86;
    const arc = 1.9; // radians of curve the rows wrap through
    for (let k = 0; k < want; k++) {
      // Two aisles: leave a gap a third and two thirds of the way along each row.
      let t = (k + 0.5) / want;
      t = t * 0.94 + (t > 0.333 ? 0.03 : 0) + (t > 0.666 ? 0.03 : 0);
      const a = (t - 0.5) * arc;
      positions.push(1.5 + Math.sin(a) * radius + (random() - 0.5) * 0.1, FLOOR - 1.5 + i * 0.3 + (random() - 0.5) * 0.06, 6 - Math.cos(a) * radius);
      seeds.push(random());
      ranks.push(placed + k < COUNCIL ? 1 : 0);
    }
    placed += want;
  }
  const crowdGeometry = new THREE.BufferGeometry();
  crowdGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  crowdGeometry.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 1));
  crowdGeometry.setAttribute("aRank", new THREE.Float32BufferAttribute(ranks, 1));
  const crowd = new THREE.Points(
    crowdGeometry,
    new THREE.ShaderMaterial({
      uniforms: { uTime: shared.uTime, uPxScale: shared.uPxScale, uFog: shared.uFog },
      vertexShader: CROWD_VERTEX,
      fragmentShader: CROWD_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  crowd.frustumCulled = false;
  slide.add(crowd);
  // The raked floor under them, so the lights sit on something.
  const rake = new THREE.Mesh(new THREE.RingGeometry(13.5, 58, 80, 1, Math.PI / 2 - 1.1, 2.2), matte(0x0c0304, 0.95));
  const rakeAt = rake.geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < rakeAt.count; i++) rakeAt.setZ(i, (Math.hypot(rakeAt.getX(i), rakeAt.getY(i)) - 13.5) * 0.35);
  rake.geometry.computeVertexNormals();
  slide.add(put(rake, 1.5, FLOOR - 1.75, 6, -Math.PI / 2, 0, Math.PI));

  // ---- the stage: boards, footlights, lectern ----
  const boards = paint(512, 512, (ctx, w, h) => {
    // Stage boards: long planks, their grain, the gaps, a nail at each end, and years of scuffs.
    ctx.fillStyle = "#1a0a07";
    ctx.fillRect(0, 0, w, h);
    const r = rng(8);
    const plank = w / 8;
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = `rgb(${50 + r() * 26},${22 + r() * 10},${14 + r() * 6})`;
      ctx.fillRect(i * plank + 1.5, 0, plank - 3, h);
      for (let g = 0; g < 22; g++) {
        ctx.strokeStyle = `rgba(${r() < 0.5 ? "0,0,0" : "150,80,50"},${0.05 + r() * 0.1})`;
        ctx.lineWidth = 0.6 + r();
        const x = i * plank + 3 + r() * (plank - 6);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.bezierCurveTo(x + (r() - 0.5) * 8, h * 0.3, x + (r() - 0.5) * 8, h * 0.7, x + (r() - 0.5) * 4, h);
        ctx.stroke();
      }
      const joint = r() * h;
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(i * plank, joint, plank, 2);
      ctx.fillStyle = "rgba(190,150,110,0.5)";
      for (const dy of [-9, 9]) for (const dx of [10, plank - 10]) ctx.fillRect(i * plank + dx, joint + dy, 2, 2);
    }
    for (let i = 0; i < 40; i++) {
      ctx.strokeStyle = `rgba(210,170,130,${0.02 + r() * 0.04})`;
      ctx.lineWidth = 1 + r() * 2;
      ctx.beginPath();
      const x = r() * w;
      const y = r() * h;
      ctx.moveTo(x, y);
      ctx.lineTo(x + (r() - 0.5) * 90, y + (r() - 0.5) * 30);
      ctx.stroke();
    }
  });
  boards.wrapS = boards.wrapT = THREE.RepeatWrapping;
  boards.repeat.set(7, 3);
  slide.add(put(new THREE.Mesh(new THREE.PlaneGeometry(60, 24), new THREE.MeshStandardMaterial({ map: boards, roughness: 0.5, metalness: 0 })), 0, FLOOR, 4, -Math.PI / 2));
  slide.add(put(box(60, 1.6, 0.4, matte(0x0d0304, 0.7)), 0, FLOOR - 0.8, -8));
  for (let i = 0; i < 17; i++) slide.add(put(ball(0.12, glow(0xffc27a, 2.4), 8), -20 + i * 2.5, FLOOR + 0.12, -7.6));

  const lectern = put(new THREE.Group(), 3.1, FLOOR, 1.6, 0, 0.42, 0);
  const grain = paint(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#34130c";
    ctx.fillRect(0, 0, w, h);
    const r = rng(14);
    for (let i = 0; i < 120; i++) {
      ctx.strokeStyle = `rgba(${r() < 0.5 ? "10,2,0" : "170,90,50"},${0.05 + r() * 0.1})`;
      ctx.lineWidth = 0.5 + r() * 1.5;
      const x = r() * w;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + (r() - 0.5) * 20, h * 0.3, x + (r() - 0.5) * 20, h * 0.7, x + (r() - 0.5) * 10, h);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 5;
    ctx.strokeRect(34, 30, w - 68, h - 60);
    ctx.strokeStyle = "rgba(200,140,70,0.35)";
    ctx.lineWidth = 2;
    ctx.strokeRect(42, 38, w - 84, h - 76);
  });
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping;
  grain.repeat.set(0.5, 0.33);
  const wood = new THREE.MeshStandardMaterial({ map: grain, roughness: 0.42, metalness: 0.05 });
  const body = new THREE.Shape();
  [[-0.95, 0], [0.95, 0], [0.8, 3.0], [-0.8, 3.0]].forEach(([x, y], i) => (i === 0 ? body.moveTo(x, y) : body.lineTo(x, y)));
  lectern.add(put(new THREE.Mesh(new THREE.ExtrudeGeometry(body, { depth: 1.1, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2 }), wood), 0, 0, -0.55));
  lectern.add(put(box(2.0, 0.1, 1.5, wood), 0, 3.12, 0.15, 0.32));
  // What is on the lectern: the newspaper page. The camera arrives by pulling back from it.
  const sheet = paint(256, 160, (ctx, w, h) => {
    ctx.fillStyle = "#f1d9c5";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#17131a";
    ctx.fillRect(10, 14, w - 20, 1.5);
    ctx.fillRect(10, 8, 46, 4);
    // The chart, as it reads from here: a run of candles, the fan, the histogram.
    let y = 96;
    for (let i = 0; i < 24; i++) {
      const up = (i * 7) % 5 > 1;
      y -= up ? 2.2 : -1.2;
      ctx.fillStyle = up ? "#0f6b5c" : "#9b1c2e";
      ctx.fillRect(30 + i * 4.4, y - 4, 2.6, 8);
    }
    ctx.strokeStyle = "rgba(23,19,26,0.35)";
    ctx.lineWidth = 0.6;
    for (let i = 0; i < 26; i++) {
      ctx.beginPath();
      ctx.moveTo(136, y);
      ctx.lineTo(196, y - 30 + i * 2.4);
      ctx.stroke();
    }
    ctx.fillStyle = "#0f6b5c";
    for (let i = 0; i < 14; i++) ctx.fillRect(198, y - 30 + i * 4.4, 4 + 22 * Math.exp(-Math.pow((i - 6.5) / 3.2, 2)), 3.4);
    ctx.fillStyle = "rgba(23,19,26,0.4)";
    for (let line = 0; line < 9; line++) ctx.fillRect(10, 30 + line * 4.5, 16, 1.6);
  });
  lectern.add(put(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.012, 0.75), new THREE.MeshStandardMaterial({ map: sheet, roughness: 0.9 })), 0, 3.211, 0.2, 0.32));
  // Microphone on a gooseneck.
  const neck = new THREE.CatmullRomCurve3([new THREE.Vector3(0.55, 3.1, -0.3), new THREE.Vector3(0.55, 3.7, -0.3), new THREE.Vector3(0.4, 4.15, -0.05), new THREE.Vector3(0.2, 4.3, 0.35)]);
  lectern.add(new THREE.Mesh(new THREE.TubeGeometry(neck, 24, 0.03, 8), matte(0x15161a, 0.3, 0.8)));
  lectern.add(put(cyl(0.085, 0.07, 0.3, matte(0x24262b, 0.4, 0.8), 14), 0.13, 4.36, 0.48, 1.15, 0, 0.45));
  // The school's crest would go here; a plain inlaid ring stands in for it.
  lectern.add(put(new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.03, 8, 40), matte(0xb98a2e, 0.35, 0.9)), 0, 1.75, 0.6));
  slide.add(lectern);

  // ---- curtains: velvet, with its nap and the shadow in each fold ----
  const cloth = paint(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#6a0c16";
    ctx.fillRect(0, 0, w, h);
    const r = rng(22);
    for (let x = 0; x < w; x += 32) {
      const fold = ctx.createLinearGradient(x, 0, x + 32, 0);
      fold.addColorStop(0, "rgba(0,0,0,0.5)");
      fold.addColorStop(0.45, "rgba(255,120,110,0.16)");
      fold.addColorStop(1, "rgba(0,0,0,0.5)");
      ctx.fillStyle = fold;
      ctx.fillRect(x, 0, 32, h);
    }
    for (let i = 0; i < 5000; i++) {
      ctx.fillStyle = r() < 0.5 ? "rgba(0,0,0,0.12)" : "rgba(255,150,140,0.06)";
      ctx.fillRect(r() * w, r() * h, 1, 1 + r() * 2);
    }
  });
  cloth.wrapS = cloth.wrapT = THREE.RepeatWrapping;
  const gilt = new THREE.MeshStandardMaterial({ color: 0x9a7326, roughness: 0.4, metalness: 1 });
  const drape = (wide: number, tall: number, folds: number) => {
    const geometry = new THREE.PlaneGeometry(wide, tall, folds * 8, 6);
    const at = geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < at.count; i++) {
      const x = at.getX(i);
      const y = at.getY(i);
      at.setZ(i, Math.sin((x / wide) * folds * Math.PI * 2) * 0.42 * (0.6 + 0.4 * (0.5 - y / tall)));
    }
    geometry.computeVertexNormals();
    const map = cloth.clone();
    map.repeat.set(folds, tall / 5);
    map.needsUpdate = true;
    return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ map, roughness: 0.9 }));
  };
  // The tabs either side, drawn back and tied; the pelmet across the top, with its fringe.
  for (const side of [-1, 1]) {
    const tab = put(drape(5.6, 30, 3), side * 9.6, 8, -9, 0, side * -0.3, 0);
    slide.add(tab);
    slide.add(put(new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.09, 8, 28), gilt), side * 9.0, -0.4, -8.5, 1.2, 0, side * 0.5));
    slide.add(put(cyl(0.16, 0.05, 0.9, gilt, 10), side * 8.3, -1.3, -8.3));
  }
  slide.add(put(drape(60, 4.4, 26), 0, 7.5, -9.5));
  const fringe = paint(256, 32, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#b98a2e";
    ctx.fillRect(0, 0, w, 7);
    for (let x = 0; x < w; x += 4) {
      ctx.fillStyle = x % 8 === 0 ? "#d9ae52" : "#8a6420";
      ctx.fillRect(x, 7, 2.4, h - 7 - (x % 12 === 0 ? 0 : 5));
    }
  });
  fringe.wrapS = THREE.RepeatWrapping;
  fringe.repeat.set(22, 1);
  slide.add(put(new THREE.Mesh(new THREE.PlaneGeometry(60, 0.7), new THREE.MeshStandardMaterial({ map: fringe, transparent: true, roughness: 0.5, metalness: 0.6, side: THREE.DoubleSide })), 0, 5.05, -9.05));

  // ---- the house beyond the lights: a balcony front, and a panelled wall behind the last row ----
  const relief = paint(512, 128, (ctx, w, h) => {
    // Gilded plasterwork on crimson: mouldings, medallions, and swags between them.
    ctx.fillStyle = "#3a0a10";
    ctx.fillRect(0, 0, w, h);
    const band = (y: number, tall: number) => {
      const g = ctx.createLinearGradient(0, y, 0, y + tall);
      g.addColorStop(0, "#e0b964");
      g.addColorStop(0.5, "#a67c2c");
      g.addColorStop(1, "#5a4014");
      ctx.fillStyle = g;
      ctx.fillRect(0, y, w, tall);
    };
    band(4, 12);
    band(h - 16, 12);
    for (let x = 0; x < w; x += 12) {
      ctx.fillStyle = "#8a6420";
      ctx.fillRect(x, 20, 7, 6);
    }
    for (let i = 0; i < 4; i++) {
      const cx = 64 + i * 128;
      ctx.strokeStyle = "#caa24e";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, 66, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#b98a2e";
      for (let k = 0; k < 8; k++) {
        ctx.beginPath();
        ctx.ellipse(cx + Math.cos((k * Math.PI) / 4) * 9, 66 + Math.sin((k * Math.PI) / 4) * 9, 6, 3.4, (k * Math.PI) / 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + 26, 52);
      ctx.quadraticCurveTo(cx + 64, 104, cx + 102, 52);
      ctx.stroke();
    }
  });
  relief.wrapS = THREE.RepeatWrapping;
  relief.repeat.set(9, 1);
  const front = new THREE.Mesh(new THREE.CylinderGeometry(57.5, 57.5, 2.2, 96, 1, true, Math.PI - 1.2, 2.4), new THREE.MeshStandardMaterial({ map: relief, roughness: 0.55, metalness: 0.25, side: THREE.BackSide }));
  slide.add(put(front, 1.5, 10.6, 6));
  slide.add(put(new THREE.Mesh(new THREE.CylinderGeometry(58.5, 58.5, 1.4, 96, 1, true, Math.PI - 1.2, 2.4), new THREE.MeshBasicMaterial({ color: 0x050102, side: THREE.BackSide })), 1.5, 8.9, 6));
  for (let i = 0; i < 34; i++) {
    const a = Math.PI - 1.12 + (i / 33) * 2.24;
    slide.add(put(ball(0.2, glow(0xffd29a, 2.2), 6), 1.5 + Math.sin(a) * 57, 12.1, 6 + Math.cos(a) * 57));
  }
  const panels = paint(256, 512, (ctx, w, h) => {
    // The back wall: a pilaster, and an arched panel picked out in gold, on deep red.
    ctx.fillStyle = "#26070b";
    ctx.fillRect(0, 0, w, h);
    const pilaster = ctx.createLinearGradient(0, 0, 44, 0);
    pilaster.addColorStop(0, "#4a3410");
    pilaster.addColorStop(0.5, "#a67c2c");
    pilaster.addColorStop(1, "#4a3410");
    ctx.fillStyle = pilaster;
    ctx.fillRect(0, 0, 44, h);
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    for (let x = 6; x < 44; x += 9) ctx.fillRect(x, 30, 3, h - 60);
    ctx.strokeStyle = "rgba(202,162,78,0.75)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(78, h - 40);
    ctx.lineTo(78, 190);
    ctx.arc(150, 190, 72, Math.PI, 0);
    ctx.lineTo(222, h - 40);
    ctx.closePath();
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(92, h - 54);
    ctx.lineTo(92, 190);
    ctx.arc(150, 190, 58, Math.PI, 0);
    ctx.lineTo(208, h - 54);
    ctx.closePath();
    ctx.stroke();
    const lamp = ctx.createRadialGradient(150, 250, 0, 150, 250, 60);
    lamp.addColorStop(0, "rgba(255,200,130,0.55)");
    lamp.addColorStop(1, "rgba(255,200,130,0)");
    ctx.fillStyle = lamp;
    ctx.fillRect(80, 180, 140, 140);
  });
  panels.wrapS = THREE.RepeatWrapping;
  panels.repeat.set(16, 1);
  slide.add(put(new THREE.Mesh(new THREE.CylinderGeometry(63, 63, 26, 96, 1, true, Math.PI - 1.25, 2.5), new THREE.MeshStandardMaterial({ map: panels, roughness: 0.8, side: THREE.BackSide })), 1.5, 22, 6));

  // ---- banners: the three events ----
  const banner = (name: string) =>
    paint(256, 512, (ctx, w, h) => {
      ctx.fillStyle = "#6e0c16";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#e0b45a";
      ctx.lineWidth = 6;
      ctx.strokeRect(14, 14, w - 28, h - 28);
      ctx.fillStyle = "#f4dfae";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.font = `900 ${name.length > 6 ? 76 : 92}px "Inter", sans-serif`;
      ctx.fillText(name, 0, 6);
      ctx.restore();
    });
  ["SCIFEST", "MELANGE", "ACON"].forEach((name, i) => {
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 6.8), new THREE.MeshStandardMaterial({ map: banner(name), roughness: 0.9, side: THREE.DoubleSide }));
    slide.add(put(flag, -1.6 + i * 5.5, 5.6, -22 - Math.abs(i - 1) * 1.5, 0, (1 - i) * 0.12, 0, 0.86));
  });

  // ---- overhead: the ceiling, with a round opening in it. The floor above is the library. ----
  const soffit = paint(128, 128, (ctx, w) => {
    ctx.fillStyle = "#0b0304";
    ctx.fillRect(0, 0, w, w);
    ctx.strokeStyle = "#3a1c14";
    ctx.lineWidth = 9;
    ctx.strokeRect(6, 6, w - 12, w - 12);
    ctx.strokeStyle = "#7c5a1c";
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, w - 44, w - 44);
  });
  soffit.wrapS = soffit.wrapT = THREE.RepeatWrapping;
  soffit.repeat.set(40, 40);
  const OCULUS = { x: -3.4, y: 39.4, z: -4.5, r: 3.3 };
  slide.add(put(new THREE.Mesh(new THREE.RingGeometry(OCULUS.r, 190, 64, 1), new THREE.MeshBasicMaterial({ map: soffit, color: new THREE.Color(0.8, 0.8, 0.8) })), OCULUS.x, OCULUS.y, OCULUS.z, Math.PI / 2));
  slide.add(put(new THREE.Mesh(new THREE.TorusGeometry(OCULUS.r + 0.15, 0.3, 10, 64), gilt), OCULUS.x, OCULUS.y - 0.1, OCULUS.z, Math.PI / 2));
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    slide.add(put(ball(0.22, glow(0xffd29a, 2.4), 8), OCULUS.x + Math.cos(a) * (OCULUS.r + 1.6), OCULUS.y - 0.3, OCULUS.z + Math.sin(a) * (OCULUS.r + 1.6)));
  }

  // ---- light ----
  const lamps: THREE.Mesh[] = [];
  for (const [x, y, z, lean] of [[-13, 15, -30, -0.55], [2, 16.5, -34, 0], [16, 15, -30, 0.5]] as const) {
    const cone = put(beam(7.5, 44, 0xffb37a, 0.16), x, y, z, -1.02, 0, lean);
    slide.add(cone);
    slide.add(put(ball(0.5, glow(0xfff0dc, 5), 12), x, y, z));
    lamps.push(cone);
  }
  slide.add(dust({ count: 1600, size: [60, 24, 60], centre: [0, 5, -16], color: 0xffc9a0, gain: 0.9, point: 0.05, seed: 66 }));

  return {
    root,
    slide,
    update({ time }) {
      lamps.forEach((lamp, i) => {
        lamp.rotation.z = [-0.55, 0, 0.5][i] + Math.sin(time * 0.25 + i * 2) * 0.05;
      });
    },
  };
}
