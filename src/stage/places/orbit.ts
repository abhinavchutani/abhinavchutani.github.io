import * as THREE from "three";
import { ball, box, cyl, dust, glow, matte, paint, put, rng, shell, type Place } from "../kit";
import { poseMatrix } from "../handover";
import { circle, staticRibbons } from "../ribbons";
import { PLACES } from "../table";

/**
 * 03 Orbit. Low Earth orbit, which is where Orbital Guardian works: the
 * planet's limb across the foot of the frame, a field of debris, the
 * satellite, its camera picking out a target, and the net going out to it
 * on a tether. `p` lets the net go; at rest it fires again every few seconds.
 */

const EARTH_FRAGMENT = /* glsl */ `
  precision highp sampler3D;
  uniform sampler3D uNoise;
  uniform float uTime;
  uniform vec3 uSun;
  uniform vec3 uSite;
  uniform vec3 uBlue;
  uniform vec3 uEast;
  uniform vec3 uNorth;
  uniform float uPerUnit;
  uniform float uShow;
  uniform float uClose;
  varying vec3 vSun;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vLocal;

  // Value noise, read from a small block of random numbers instead of being worked out: one look-up where
  // there were eight hashes. With twenty-odd of these for every pixel of a planet that can fill the screen,
  // that is the difference between holding the frame rate on the way down and not.
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return texture(uNoise, (i + f + 0.5) / 64.0).r;
  }
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.03 + 11.7;
      a *= 0.5;
    }
    return v * 1.033;
  }
  // Two octaves, scaled to the same range: enough for the fine layers, at well under half the cost.
  float fbm2(vec3 p) {
    return (0.5 * noise(p) + 0.25 * noise(p * 2.03 + 11.7)) * 1.29;
  }

  void main() {
    vec3 n = normalize(vNormal);
    vec3 p = normalize(vLocal);
    // Where the camera is going to come down the sea brightens into the blue of a drawing, squared off like
    // one: the sheet's own grid, coarser, runs out over the water, so on the way down there is always a
    // line going by. The sheet the camera lands on lies in the middle of it.
    float site = distance(p, uSite);
    vec2 q = vec2(dot(p - uSite, uEast), dot(p - uSite, uNorth)) * uPerUnit - vec2(0.0, 4.0);
    vec2 cell = abs(fract(q / 256.0 - 0.5) - 0.5) / (fwidth(q / 256.0) * 1.5);
    float line = 1.0 - min(min(cell.x, cell.y), 1.0);
    // The squares between, once they are wide enough on screen to be drawn cleanly.
    vec2 fine = abs(fract(q / 64.0 - 0.5) - 0.5) / fwidth(q / 64.0);
    line += (1.0 - min(min(fine.x, fine.y), 1.0)) * 0.5 * (1.0 - smoothstep(0.03, 0.12, max(fwidth(q.x), fwidth(q.y)) / 64.0));
    float drawing = (1.0 - smoothstep(0.085, 0.21, site)) * uShow;
    vec3 sheet = uBlue + vec3(line * 0.26);
    // Inside it there is nothing else to work out, which matters: on the way down it fills the screen.
    if (drawing > 0.995) {
      gl_FragColor = vec4(sheet, 1.0);
      return;
    }

    float land = smoothstep(0.5, 0.54, fbm(p * 1.7));
    land *= smoothstep(0.2, 0.36, site);
    float ice = smoothstep(0.78, 0.9, abs(p.y));
    // Finer structure for the way down: coasts and the patchwork of the land, and a second scale of
    // cloud. (From orbit it is too small to see, and is left out; nearer still, the camera is over the
    // drawing and none of this is worked out at all.)
    float coast = 0.5;
    float wisps = 0.0;
    if (uClose > 0.004) {
      float near = smoothstep(0.0, 0.14, uClose);
      coast = mix(0.5, fbm2(p * 46.0), near);
      wisps = near * 0.8 * smoothstep(0.62, 0.8, fbm2(p * 31.0 + 7.0));
    }
    vec3 sea = mix(vec3(0.012, 0.045, 0.16), vec3(0.02, 0.1, 0.26), coast);
    vec3 ground = mix(vec3(0.06, 0.2, 0.06), vec3(0.34, 0.26, 0.12), coast) * (0.72 + 0.56 * coast);
    land = smoothstep(0.42, 0.58, land + (coast - 0.5) * 0.5);
    vec3 surface = mix(mix(sea, ground, land), vec3(0.75, 0.8, 0.85), ice);
    float cloud = max(smoothstep(0.6, 0.82, fbm(p * 3.6 + vec3(uTime * 0.012, 0.0, uTime * 0.007))), wisps);
    cloud *= smoothstep(0.09, 0.17, site);
    surface = mix(surface, vec3(0.62), cloud * 0.6);

    float day = dot(n, normalize(vSun));
    float lit = smoothstep(-0.12, 0.3, day);
    vec3 colour = surface * (0.015 + lit * 0.62);
    // Cities on the night side.
    if (lit < 0.98) {
      float city = step(0.8, noise(p * 420.0)) * step(0.5, noise(p * 30.0)) * land * (1.0 - cloud) * (1.0 - lit);
      colour += vec3(1.3, 0.9, 0.45) * city * 0.9;
    }
    // Air: a thin bright line at the limb, bluer in daylight.
    float rim = pow(1.0 - max(0.0, dot(n, normalize(vView))), 5.0);
    colour += mix(vec3(0.2, 0.16, 0.6), vec3(0.2, 0.4, 1.0), lit) * rim * (0.25 + 0.5 * lit);
    gl_FragColor = vec4(mix(colour, sheet, drawing), 1.0);
  }
`;

/** Corner brackets: what the detector draws round a thing it has found. */
function reticle(color: string, locked: boolean) {
  const map = paint(128, 128, (ctx, w, h) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = locked ? 7 : 5;
    const m = 14;
    const l = 34;
    for (const [x, y, dx, dy] of [[m, m, 1, 1], [w - m, m, -1, 1], [m, h - m, 1, -1], [w - m, h - m, -1, -1]]) {
      ctx.beginPath();
      ctx.moveTo(x + dx * l, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + dy * l);
      ctx.stroke();
    }
    if (locked) {
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 12, h / 2);
      ctx.lineTo(w / 2 + 12, h / 2);
      ctx.moveTo(w / 2, h / 2 - 12);
      ctx.lineTo(w / 2, h / 2 + 12);
      ctx.stroke();
    }
  });
  return new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, color: new THREE.Color(1.6, 1.6, 1.6) }));
}

export function orbit(): Place {
  const { root, slide } = shell();
  const random = rng(77);
  const sun = new THREE.Vector3(0.9, 0.35, -0.1);

  // ---- the planet ----
  // A 64-cube of random numbers, repeating: the lattice its noise is read from.
  const cube = new Uint8Array(64 * 64 * 64);
  const scatter = rng(31);
  for (let i = 0; i < cube.length; i++) cube[i] = Math.floor(scatter() * 256);
  const lattice = new THREE.Data3DTexture(cube, 64, 64, 64);
  lattice.format = THREE.RedFormat;
  lattice.type = THREE.UnsignedByteType;
  lattice.minFilter = lattice.magFilter = THREE.LinearFilter;
  lattice.wrapS = lattice.wrapT = lattice.wrapR = THREE.RepeatWrapping;
  lattice.unpackAlignment = 1;
  lattice.needsUpdate = true;
  // Where the drawing board of the next place lies on it, which way that sheet's own axes run, and how small it is.
  const down = PLACES.find((row) => row.key === "bench")!.arrive!.into!;
  const sheet = poseMatrix(down);
  const landing = {
    site: new THREE.Vector3().setFromMatrixColumn(sheet, 2).normalize(),
    east: new THREE.Vector3().setFromMatrixColumn(sheet, 0).normalize(),
    north: new THREE.Vector3().setFromMatrixColumn(sheet, 1).normalize(),
    scale: down.scale ?? 1,
  };
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(20, 96, 64),
    new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSun: { value: sun },
        uSite: { value: landing.site },
        uBlue: { value: new THREE.Color(0x1444c4) },
        uEast: { value: landing.east },
        uNorth: { value: landing.north },
        uPerUnit: { value: 20 / landing.scale },
        uShow: { value: 0 },
        uClose: { value: 0 },
        uNoise: { value: lattice },
      },
      vertexShader: /* glsl */ `
        uniform vec3 uSun;
        varying vec3 vNormal;
        varying vec3 vView;
        varying vec3 vLocal;
        varying vec3 vSun;
        void main() {
          vLocal = position;
          vSun = normalMatrix * uSun;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalMatrix * normal;
          vView = -mv.xyz;
          gl_Position = projectionMatrix * mv;
        }
      `,
      // (The sun is fixed to the planet's own frame, not the camera's: the terminator must not move when the camera turns to fall.)
      fragmentShader: EARTH_FRAGMENT,
    }),
  );
  const globe = put(new THREE.Group(), 6, -22.4, -12);
  globe.add(earth);
  slide.add(globe);
  // A soft shell of air outside the limb.
  const air = new THREE.Mesh(
    new THREE.SphereGeometry(20.9, 64, 48),
    new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vV; void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalMatrix * normal; vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: /* glsl */ `varying vec3 vN; varying vec3 vV; void main() { float f = pow(max(0.0, dot(normalize(vN), normalize(vV))), 4.0); gl_FragColor = vec4(vec3(0.22, 0.34, 1.0) * f, f * 0.7); }`,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  globe.add(air);

  // Orbits, drawn: the lanes the debris keeps to.
  const lanes = [24.5, 26.5, 29].map((r, i) => circle(r, 160).map((p) => p.applyEuler(new THREE.Euler(Math.PI / 2 - 0.25 + i * 0.12, 0, 0.2 - i * 0.16))));
  globe.add(staticRibbons(lanes, { width: 0.03, minPx: 1, color: 0xa99bff, gain: 0.5, opacity: 0.5, pulse: 1.6, pulseN: 5, pulseSpeed: 0.03 }));

  // ---- debris: a few hundred tumbling fragments ----
  const scrap = new THREE.MeshStandardMaterial({ color: 0x5d606c, roughness: 0.5, metalness: 0.85, flatShading: true });
  const shapes = [new THREE.TetrahedronGeometry(0.2), new THREE.BoxGeometry(0.34, 0.05, 0.24), new THREE.OctahedronGeometry(0.17), new THREE.BoxGeometry(0.12, 0.12, 0.5)];
  type Bit = { at: THREE.Vector3; axis: THREE.Vector3; spin: number; size: number; drift: number };
  const swarms = shapes.map((shape) => {
    const bits: Bit[] = [];
    for (let i = 0; i < 90; i++) {
      // A band that runs from near the lens away to the upper right, thicker in the middle.
      const t = random();
      const spread = (random() + random() - 1) * 5;
      bits.push({
        at: new THREE.Vector3(-16 + t * 40 + spread * 0.6, -3.2 + t * 6.5 + spread * 0.55 + (random() - 0.5) * 2, 9 - t * 46 + (random() - 0.5) * 7),
        axis: new THREE.Vector3(random() - 0.5, random() - 0.5, random() - 0.5).normalize(),
        spin: 0.2 + random() * 1.3,
        size: 0.4 + random() * random() * 2.4,
        drift: 0.2 + random() * 0.5,
      });
    }
    const mesh = new THREE.InstancedMesh(shape, scrap, bits.length);
    mesh.frustumCulled = false;
    slide.add(mesh);
    return { mesh, bits };
  });

  // More of it along the way in, just above the roof the camera comes out through and close to the line of flight: it goes by the lens.
  const corridor: Bit[] = [];
  for (let i = 0; i < 84; i++) {
    const a = random() * Math.PI * 2;
    const r = 2.6 + random() * 7.5;
    corridor.push({
      at: new THREE.Vector3(Math.cos(a) * r * 1.5, Math.sin(a) * r * 0.9, 14 + random() * 15),
      axis: new THREE.Vector3(random() - 0.5, random() - 0.5, random() - 0.5).normalize(),
      spin: 0.2 + random() * 1.3,
      size: 0.5 + random() * random() * 2.2,
      drift: 0.2 + random() * 0.5,
    });
  }
  const passing = new THREE.InstancedMesh(shapes[1], scrap, corridor.length);
  passing.frustumCulled = false;
  slide.add(passing);
  swarms.push({ mesh: passing, bits: corridor });

  // ---- the satellite ----
  const craft = new THREE.Group();
  const foil = new THREE.MeshStandardMaterial({ color: 0xc79a3c, roughness: 0.34, metalness: 1 });
  const white = matte(0xd9dce4, 0.5, 0.1);
  craft.add(box(1.2, 1.2, 1.8, foil));
  const cells = paint(256, 128, (ctx, w, h) => {
    ctx.fillStyle = "#0a1846";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#5d7de0";
    ctx.lineWidth = 2;
    for (let x = 0; x <= w; x += 32) ctx.strokeRect(x, 0, 32, h);
    for (let y = 0; y <= h; y += 32) ctx.strokeRect(0, y, w, 32);
  });
  for (const side of [-1, 1]) {
    craft.add(put(cyl(0.05, 0.05, 1.0, white, 8), side * 1.1, 0, 0, 0, 0, Math.PI / 2));
    craft.add(put(box(3.6, 0.04, 1.5, new THREE.MeshStandardMaterial({ map: cells, roughness: 0.3, metalness: 0.7 })), side * 3.4, 0, 0, 0.5, 0, 0));
  }
  // Dish, and the camera that does the detecting.
  const dish = new THREE.Mesh(new THREE.LatheGeometry([0, 0.12, 0.3, 0.5, 0.66].map((r, i) => new THREE.Vector2(r, i === 0 ? 0 : r * r * 0.55)), 28), Object.assign(white.clone(), { side: THREE.DoubleSide }));
  craft.add(put(dish, 0, 0.75, -0.4, -0.3, 0, 0));
  craft.add(put(cyl(0.2, 0.24, 0.5, matte(0x15171c, 0.35, 0.6), 20), 0, -0.1, 1.1, Math.PI / 2));
  const lens = put(cyl(0.15, 0.15, 0.04, glow(0x7dffc0, 2.6), 20), 0, -0.1, 1.37, Math.PI / 2);
  craft.add(lens);
  const station = put(new THREE.Group(), 4.7, 1.9, -3, 0.2, -0.75, 0.12);
  station.scale.setScalar(0.82);
  station.add(craft);
  slide.add(station);

  // ---- the target, and the net ----
  const target = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 0), scrap);
  const targetAt = new THREE.Vector3(1.6, -1.1, 1.6);
  slide.add(put(target, targetAt.x, targetAt.y, targetAt.z));
  const lock = reticle("#7dffc0", true);
  lock.scale.setScalar(2.0);
  lock.position.copy(targetAt);
  slide.add(lock);
  const seen: THREE.Sprite[] = [];
  for (let i = 0; i < 7; i++) {
    const mark = reticle("#a99bff", false);
    mark.scale.setScalar(0.9 + random() * 0.5);
    slide.add(mark);
    seen.push(mark);
  }

  // A square mesh, cupped, with a weight at each corner.
  const N = 9;
  const strands: THREE.Vector3[][] = [];
  const cup = (x: number, y: number) => new THREE.Vector3(x, y, -(x * x + y * y) * 0.34);
  for (let i = 0; i < N; i++) {
    const a = (i / (N - 1)) * 2 - 1;
    const row: THREE.Vector3[] = [];
    const col: THREE.Vector3[] = [];
    for (let k = 0; k <= 16; k++) {
      const b = (k / 16) * 2 - 1;
      row.push(cup(b * 1.25, a * 1.25));
      col.push(cup(a * 1.25, b * 1.25));
    }
    strands.push(row, col);
  }
  const net = new THREE.Group();
  net.add(staticRibbons(strands, { width: 0.022, minPx: 1.2, color: 0xe9e4ff, gain: 1.5, pulse: 1.2, pulseN: 2, pulseSpeed: 0.6 }));
  for (const [x, y] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) net.add(put(ball(0.09, glow(0xffd84a, 2), 10), cup(x * 1.25, y * 1.25).x, cup(x * 1.25, y * 1.25).y, cup(x * 1.25, y * 1.25).z));
  slide.add(net);
  // The tether back to the satellite, redrawn each frame.
  const tetherGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  const tether = new THREE.Line(tetherGeometry, new THREE.LineBasicMaterial({ color: new THREE.Color(1.4, 1.3, 1.9), transparent: true, opacity: 0.8 }));
  tether.frustumCulled = false;
  slide.add(tether);
  // The detector's line of sight.
  const sightGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  const sight = new THREE.Line(sightGeometry, new THREE.LineBasicMaterial({ color: new THREE.Color(0.4, 1.4, 0.9), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending }));
  sight.frustumCulled = false;
  slide.add(sight);

  // Stars, and the sun as a single hard light.
  slide.add(dust({ count: 2600, size: [0, 0, 0], color: 0xdfe2ff, gain: 1.2, point: 0.28, drift: 0, seed: 5, place: (r) => { const a = r() * Math.PI * 2; const y = r() * 1.6 - 0.5; const d = 120 + r() * 60; return [Math.cos(a) * d, y * 60, -Math.abs(Math.sin(a) * d) - 20]; } }));
  slide.add(put(ball(1.1, glow(0xfff2d6, 5), 16), 62, 34, -80));

  const dummy = new THREE.Object3D();
  const from = new THREE.Vector3();
  const to = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const forward = new THREE.Vector3(0, 0, 1);

  return {
    root,
    slide,
    update({ ch, time, theta }) {
      // (The planet itself does not turn: the drawing board lies on it, a long way down.)
      earth.material.uniforms.uTime.value = time + theta * 5;
      // The patch of sea turns to drawing only once the camera has tipped over to fall towards it.
      earth.material.uniforms.uShow.value = Math.min(1, Math.max(0, (ch[7] - 0.02) / 0.2));
      earth.material.uniforms.uClose.value = ch[7];
      // Arriving: the Earth comes up from under the frame and the satellite in from the right, as the camera does.
      const here = Math.min(1, Math.max(0, (ch[6] - 0.3) / 0.7));
      const away = 1 - here * here * (3 - 2 * here);
      globe.position.y = -22.4 - away * 13;
      station.rotation.z = 0.12 + Math.sin(time * 0.3) * 0.04 + away * 0.5;
      station.position.set(4.7 + away * 13, 1.9 + Math.sin(time * 0.4) * 0.12 + away * 3, -3 - away * 8);

      // Debris: each bit tumbles on its own axis and drifts along the lane.
      for (const { mesh, bits } of swarms) {
        for (let i = 0; i < bits.length; i++) {
          const bit = bits[i];
          dummy.position.copy(bit.at);
          dummy.position.x += Math.sin(theta * 0.1 * bit.drift + i) * 0.8;
          dummy.position.y += Math.cos(theta * 0.08 * bit.drift + i * 1.7) * 0.4;
          dummy.quaternion.setFromAxisAngle(bit.axis, (time + theta * 1.5) * bit.spin + i);
          dummy.scale.setScalar(bit.size);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
          if (mesh === swarms[0].mesh && i < seen.length) seen[i].position.copy(dummy.position);
        }
        mesh.instanceMatrix.needsUpdate = true;
      }
      for (let i = 0; i < seen.length; i++) seen[i].material.opacity = 0.35 + 0.35 * Math.sin(time * 2 + i * 1.3);

      // The net: out along the line of sight, opening as it goes, closing on the target; then again.
      const cycle = (time % 9) / 9;
      const out = ch[6] * Math.min(1, cycle / 0.34);
      const eased = 1 - Math.pow(1 - out, 3);
      const fade = 1 - Math.min(1, Math.max(0, (cycle - 0.86) / 0.12));
      from.set(0, -0.1, 1.5).applyMatrix4(craft.matrixWorld);
      slide.worldToLocal(from);
      to.copy(targetAt);
      net.position.lerpVectors(from, to, eased);
      quaternion.setFromUnitVectors(forward, to.clone().sub(from).normalize());
      net.quaternion.copy(quaternion);
      net.rotateZ(time * 0.7);
      const open = Math.sin(Math.min(1, eased * 1.15) * Math.PI) * 0.9 + 0.15;
      net.scale.set(open, open, 0.5 + eased * 1.3).multiplyScalar(fade);
      net.visible = fade > 0.02 && out > 0.005;
      const line = tetherGeometry.attributes.position as THREE.BufferAttribute;
      line.setXYZ(0, from.x, from.y, from.z);
      line.setXYZ(1, net.position.x, net.position.y, net.position.z);
      line.needsUpdate = true;
      tether.visible = net.visible;
      const ray = sightGeometry.attributes.position as THREE.BufferAttribute;
      ray.setXYZ(0, from.x, from.y, from.z);
      ray.setXYZ(1, to.x, to.y, to.z);
      ray.needsUpdate = true;

      target.rotation.set(time * 0.4, time * 0.27, 0);
      lock.material.rotation = Math.sin(time * 1.2) * 0.06;
      lock.scale.setScalar(2.0 + Math.sin(time * 3) * 0.08 - eased * 0.4);
      (lens.material as THREE.MeshBasicMaterial).color.setRGB(0.5, 1, 0.75).multiplyScalar(2 + Math.sin(time * 6) * 0.6);
    },
  };
}
