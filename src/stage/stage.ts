import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { Pass } from "three/addons/postprocessing/Pass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createFinishPass } from "./finish";
import { Route } from "./handover";
import { damp, follow, sample, tuning, type Keyframe } from "./journey";
import { pin, stand, type Plane } from "./planes";
import { setUploader, shared, type Place } from "./kit";
import { build } from "./places";
import { blankPose, buildPoses, EASE, FOV, PLACES, type Look, type PlaceKey, type Pose } from "./table";

/**
 * The stage: one fixed canvas behind the page.
 *
 *   scroll -> sample() -> eased pose -> follow() -> damped pose -> places, camera, passes, DOM
 *
 * Nothing is ever set straight from scroll. The damped pose says which place
 * the camera is in, or how far it has got from one to the next. Between
 * places the camera really travels (handover.ts): both are drawn for the
 * whole of the move, each in its own light, into the same depth buffer, so
 * one is seen through the other's door or window and nothing pops.
 */

export type StageOptions = {
  reduced: boolean;
  /** Current scroll position in px (Lenis's, or the window's). */
  scroll: () => number;
  /** The page has come to rest nearest a different stage. */
  onStage?: (stage: number, place: number) => void;
  /** The camera has set off from one place for the next. */
  onDive?: () => void;
};

type Tone = { ground: THREE.Color; top: THREE.Color; accent: THREE.Color; glow: number; haze: number; atX: number; atY: number; vignette: number; grid: number; fog: number; bloom: number; env: number; key: number; rim: number; light: number };

/** An accent at a fixed luminance, so a pale one does not blow the scene out and a dark one does not kill it. */
function level(color: THREE.Color, target = 0.42) {
  const l = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
  return color.clone().multiplyScalar(target / Math.max(0.02, l));
}

const tone = (look: Look): Tone => ({
  ground: new THREE.Color(look.ground),
  top: new THREE.Color(look.top),
  accent: level(new THREE.Color(look.accent)),
  glow: look.glow,
  haze: look.haze,
  atX: look.at[0],
  atY: look.at[1],
  vignette: look.vignette,
  grid: look.grid,
  fog: look.fog,
  bloom: look.bloom,
  env: look.env,
  key: look.key,
  rim: look.rim,
  light: look.light ? 1 : 0,
});

function blend(out: Tone, a: Tone, b: Tone, t: number) {
  out.ground.copy(a.ground).lerp(b.ground, t);
  out.top.copy(a.top).lerp(b.top, t);
  out.accent.copy(a.accent).lerp(b.accent, t);
  for (const key of ["glow", "haze", "atX", "atY", "vignette", "grid", "fog", "bloom", "env", "key", "rim", "light"] as const) out[key] = a[key] + (b[key] - a[key]) * t;
  return out;
}

const BACKDROP_FRAGMENT = /* glsl */ `
  uniform vec3 uGround, uTop, uAccent;
  uniform vec2 uAt;
  uniform float uGlow, uHaze, uVignette, uGrid, uAspect;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - 0.5;
    p.x *= uAspect;
    vec2 g = vUv - uAt;
    g.x *= uAspect;
    float d = dot(g, g);
    // Ground at the foot of the frame, sky at the top, and the accent as light in the air.
    vec3 c = mix(uGround, uTop, smoothstep(0.18, 0.95, vUv.y));
    c += uAccent * (uGlow * exp(-d * 9.0) + uHaze * exp(-d * 1.5));
    c *= 1.0 - uVignette * smoothstep(0.3, 1.05, length(p));
    // A drafting grid: darker on paper, lighter on a blueprint.
    vec2 cell = abs(fract(gl_FragCoord.xy / 46.0) - 0.5);
    vec2 major = abs(fract(gl_FragCoord.xy / 230.0) - 0.5);
    float line = 1.0 - smoothstep(0.0, 0.03, min(cell.x, cell.y));
    line += (1.0 - smoothstep(0.0, 0.008, min(major.x, major.y))) * 1.4;
    c += uGrid * line;
    gl_FragColor = vec4(c, 1.0);
  }
`;

export async function createStage(canvas: HTMLCanvasElement, options: StageOptions) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, stencil: false, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 1);
  renderer.toneMapping = THREE.NoToneMapping;

  const scene = new THREE.Scene();
  // A move between places can cross scales by a factor of a hundred or more, and both places are in the frame
  // for the whole of it: the far plane has to hold the larger one, or it would drop out of sight part-way.
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.25, 60000);
  const fog = new THREE.FogExp2(0x000000, 0.02);
  scene.fog = fog;
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  // Three lights, always on the scene: changing how many there are recompiles every lit material.
  const key = new THREE.DirectionalLight(0xffffff, 2);
  key.position.set(4, 7, 9);
  const rim = new THREE.DirectionalLight(0xffffff, 3);
  rim.position.set(-6, 3, -9);
  const under = new THREE.DirectionalLight(0xffffff, 0.6);
  under.position.set(1, -7, 3);
  scene.add(key, rim, under);

  const backdrop = new THREE.Mesh(
    new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3)),
    new THREE.ShaderMaterial({
      uniforms: {
        uGround: { value: new THREE.Color() },
        uTop: { value: new THREE.Color() },
        uAccent: { value: new THREE.Color() },
        uAt: { value: new THREE.Vector2(0.5, 0.5) },
        uGlow: { value: 0 },
        uHaze: { value: 0 },
        uVignette: { value: 0.5 },
        uGrid: { value: 0 },
        uAspect: { value: 1.6 },
      },
      vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 1.0, 1.0); }`,
      fragmentShader: BACKDROP_FRAGMENT,
      depthTest: false,
      depthWrite: false,
    }),
  );
  backdrop.frustumCulled = false;
  backdrop.renderOrder = -1000;
  scene.add(backdrop);

  // The world leans a little towards the pointer; every place lives inside it.
  const world = new THREE.Group();
  scene.add(world);
  // Pictures and lettering are uploaded to the GPU as soon as they are ready, not on the frame they first show.
  setUploader((texture) => renderer.initTexture(texture));
  const places: Place[] = PLACES.map((row) => build[row.key]());
  for (const place of places) {
    // A hand-over moves a place as a whole, by writing its root matrix.
    place.root.matrixAutoUpdate = false;
    world.add(place.root);
  }

  const tones = PLACES.map((row) => tone(row.look));
  const mixed = tone(PLACES[0].look);

  /** The colour behind everything. */
  function paint(t: Tone) {
    const u = backdrop.material.uniforms;
    u.uGround.value.copy(t.ground);
    u.uTop.value.copy(t.top);
    u.uAccent.value.copy(t.accent);
    u.uAt.value.set(t.atX, t.atY);
    u.uGlow.value = t.glow;
    u.uHaze.value = t.haze;
    u.uVignette.value = t.vignette;
    u.uGrid.value = t.grid;
  }
  /** The light, the air and the reflections a place is seen in. */
  function light(t: Tone) {
    fog.color.copy(t.ground);
    fog.density = t.fog;
    shared.uFog.value = t.fog;
    key.intensity = t.key;
    rim.color.copy(t.accent);
    rim.intensity = t.rim;
    under.color.copy(t.accent);
    scene.environmentIntensity = t.env;
  }

  // What the frame shows: one place at rest, or two while the camera is between them.
  // The far one of a pair is drawn first; the near one over it, in its own light, sharing the depth buffer.
  const showing = { first: 0, second: -1, pane: null as [number, number, number, number] | null, back: null as Tone | null };

  class WorldPass extends Pass {
    constructor() {
      super();
      this.needsSwap = false;
    }
    render(gl: THREE.WebGLRenderer, _write: THREE.WebGLRenderTarget, read: THREE.WebGLRenderTarget) {
      for (const place of places) place.root.visible = false;
      backdrop.visible = true;
      paint(showing.back ?? mixed);
      const pane = showing.pane;
      if (pane) {
        // The far place is seen through a window: lay the backdrop down first, then draw it only where the window is.
        read.scissorTest = false;
        gl.setRenderTarget(read);
        gl.render(scene, camera);
        backdrop.visible = false;
        const left = Math.floor(pane[0] * read.width);
        const foot = Math.floor(pane[1] * read.height);
        read.scissorTest = true;
        read.scissor.set(left, foot, Math.max(1, Math.ceil(pane[2] * read.width) - left), Math.max(1, Math.ceil(pane[3] * read.height) - foot));
        gl.autoClear = false;
      }
      gl.setRenderTarget(read);
      places[showing.first].root.visible = true;
      light(tones[showing.first]);
      gl.render(scene, camera);
      read.scissorTest = false;
      gl.setRenderTarget(read);
      gl.autoClear = true;
      if (showing.second >= 0) {
        places[showing.first].root.visible = false;
        places[showing.second].root.visible = true;
        backdrop.visible = false;
        light(tones[showing.second]);
        gl.autoClear = false;
        gl.render(scene, camera);
        gl.autoClear = true;
      }
    }
  }

  const composer = new EffectComposer(renderer);
  const worldPass = new WorldPass();
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.6, 0.62, 1.0);
  const finish = createFinishPass(1.0);
  composer.addPass(worldPass);
  composer.addPass(bloom);
  composer.addPass(finish);

  // ---- the journey -------------------------------------------------------------------

  const { stages, poses } = buildPoses();
  const keys = PLACES.map((row) => row.key);
  const DIST = PLACES[0].stages[0].dist;
  // routes[i]: how the camera gets from place i to place i + 1.
  const routes = PLACES.slice(1).map((row) => new Route(row.arrive!, DIST));
  // `?raw` is for measuring a move: scroll maps straight on to the camera's path, with no easing, pacing or damping.
  const params = new URLSearchParams(window.location.search);
  const raw = params.has("raw");
  if (raw) {
    tuning.linear = true;
    for (const route of routes) route.retime(null);
  }
  // The frame round a place's way in is seen from the place before it, so it is drawn with that one.
  const gates = places.map((place, i) => {
    if (i > 0 && place.threshold) {
      place.threshold.matrixAutoUpdate = false;
      place.threshold.matrix.copy(routes[i - 1].seat).invert();
      places[i - 1].root.add(place.threshold);
    }
    if (!place.gate) return null;
    const [a, b, , d] = place.gate;
    return { a, normal: new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(d, a)).normalize() };
  });
  const target = blankPose();
  const current = blankPose();
  let frames: Keyframe<Pose>[] = [];

  const state = { intro: options.reduced ? 1 : 0, ready: false, rush: 0 };
  let vw = 1;
  let vh = 1;
  let compact = false;
  let budget = 2.7e6;
  let time = 0;
  let theta = 0;
  let speed = 0;
  let lastScroll = options.scroll();
  let nearest = -1;
  let underway = false;
  // What the hand is still pushing after the page has stopped at a stage (screens of scroll): the scene gives a little.
  let impulse = 0;
  let push = 0;
  const pointer = { x: 0, y: 0 };

  // ---- copy that stands in the scene ---------------------------------------------------

  type Sign = { el: HTMLElement; k: number; place: number; plane: Plane | null; on: boolean; until: number };
  const signs: Sign[] = [...document.querySelectorAll<HTMLElement>(".sign[data-stage]")].map((el) => {
    const k = Number(el.dataset.stage);
    return { el, k, place: stages[k].place, plane: null, on: false, until: 0 };
  });

  type Follower = { el: HTMLElement; place: number; stage: number; anchor: THREE.Object3D; on: boolean };
  const followers: Follower[] = [];
  for (const el of document.querySelectorAll<HTMLElement>("[data-follow]")) {
    const [placeKey, name] = el.dataset.follow!.split(":");
    const place = keys.indexOf(placeKey as PlaceKey);
    const anchor = places[place]?.anchors?.[name];
    if (!anchor) continue;
    const stage = stages.findIndex((s) => s.place === place && s.step === Number(el.dataset.step ?? 0));
    followers.push({ el, place, stage, anchor, on: false });
  }

  const matrix = new THREE.Matrix4();
  const viewProjection = new THREE.Matrix4();
  const point = new THREE.Vector3();
  const euler = new THREE.Euler();
  const quaternion = new THREE.Quaternion();
  const one = new THREE.Vector3(1, 1, 1);

  /** Where each sign stands when the page rests on its stage: worked out from that stage's pose alone. */
  function pinSigns() {
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    for (const sign of signs) {
      const row = stages[sign.k].row;
      sign.el.style.transform = "";
      if (compact) {
        sign.plane = null;
        continue;
      }
      const wide = sign.el.offsetWidth;
      const tall = sign.el.offsetHeight;
      // How deep in the place the copy stands. It is sized so that, at rest, a CSS pixel is a screen pixel.
      const z = row.deep ?? 0;
      const halfH = (row.dist - z) * tan;
      const unit = (2 * halfH) / vh;
      const margin = Math.max(40, vw * 0.065);
      const left = row.side === "L" ? margin : vw - margin - wide;
      const top = Math.min(Math.max(vh * (row.y ?? 0.5) - tall / 2, 84), Math.max(84, vh - tall - 56));
      const x = (left + wide / 2 - vw / 2) * unit;
      const y = (vh / 2 - (top + tall / 2)) * unit;
      const ch = row.ch;
      matrix.compose(point.set(ch[0], ch[1], ch[2]), quaternion.setFromEuler(euler.set(ch[3], ch[4], ch[5])), one);
      sign.plane = pin(sign.el, matrix, [x, y, z], wide * unit);
    }
  }

  /** Each stage rests where its stop begins in the page. */
  function measure() {
    frames = [];
    const stops = document.querySelectorAll<HTMLElement>(".stop");
    stops.forEach((stop, s) => {
      if (s >= poses.length) return;
      frames.push({ y: Math.round(stop.getBoundingClientRect().top + window.scrollY), pose: poses[s], chapter: stages[s].place, hold: EASE });
    });
  }

  function size() {
    const ratio = Math.min(window.devicePixelRatio || 1, Math.sqrt(budget / (vw * vh)));
    renderer.setPixelRatio(ratio);
    renderer.setSize(vw, vh, false);
    composer.setPixelRatio(ratio);
    composer.setSize(vw, vh);
    const tall = vh * ratio;
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    shared.uPxWorld.value = (2 * tan) / tall;
    shared.uPxScale.value = tall / (2 * tan);
    finish.uniforms.uTexel.value.set(1 / (vw * ratio), 1 / tall);
  }

  function resize() {
    // A tab can load with no size at all (a hidden pane, a background tab): build for a sane one
    // and let the resize that comes with being shown correct it.
    vw = window.innerWidth || 1280;
    vh = window.innerHeight || 720;
    const aspect = vw / vh;
    compact = vw < 820 || aspect < 0.9;
    // A long lens flatters; widen it on tall screens so the subject still fits.
    camera.fov = aspect >= 1.3 ? FOV : Math.min(64, THREE.MathUtils.radToDeg(2 * Math.atan((Math.tan(THREE.MathUtils.degToRad(FOV) / 2) * 1.3) / aspect)));
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    backdrop.material.uniforms.uAspect.value = aspect;
    size();
    measure();
    pinSigns();
  }

  // ---- one frame -------------------------------------------------------------------

  const ctx = { time: 0, dt: 0, theta: 0, speed: 0, ch: [] as number[], intro: 0 };
  const last = PLACES.length - 1;
  const still = new THREE.Matrix4();
  const spare = new THREE.Matrix4();
  const inverse = new THREE.Matrix4();
  const pane: [number, number, number, number] = [0, 0, 1, 1];

  /** The box on screen round four corners given in a place's own coordinates; false if any is behind the lens. */
  function frameOf(corners: THREE.Vector3[], slide: THREE.Object3D) {
    let x0 = 1;
    let y0 = 1;
    let x1 = 0;
    let y1 = 0;
    for (const corner of corners) {
      point.copy(corner).applyMatrix4(slide.matrixWorld).applyMatrix4(camera.matrixWorldInverse);
      if (point.z > -camera.near) return false;
      point.applyMatrix4(camera.projectionMatrix);
      x0 = Math.min(x0, point.x * 0.5 + 0.5);
      x1 = Math.max(x1, point.x * 0.5 + 0.5);
      y0 = Math.min(y0, point.y * 0.5 + 0.5);
      y1 = Math.max(y1, point.y * 0.5 + 0.5);
    }
    pane[0] = Math.max(0, x0);
    pane[1] = Math.max(0, y0);
    pane[2] = Math.min(1, x1);
    pane[3] = Math.min(1, y1);
    return pane[2] > pane[0] && pane[3] > pane[1];
  }

  function pose(index: number) {
    const place = places[index];
    const ch = current[`c${index}`] as number[];
    place.slide.position.set(ch[0], ch[1], ch[2]);
    place.slide.rotation.set(ch[3], ch[4], ch[5]);
    ctx.ch = ch;
    place.update(ctx);
  }

  function frame(_now: number, deltaMs: number) {
    if (window.innerWidth < 2 || window.innerHeight < 2) return; // nothing to draw into
    const dt = Math.min(0.05, Math.max(0.001, deltaMs / 1000));
    time += dt;
    shared.uTime.value = time;

    const scroll = options.scroll();
    const moved = (scroll - lastScroll) / vh;
    lastScroll = scroll;
    speed = damp(speed, Math.abs(moved) / dt, 8, dt);
    // What is left of a push against a stage dies away; while it lasts the camera leans in on it.
    impulse *= Math.exp(-5 * dt);
    push = damp(push, options.reduced ? 0 : impulse, 10, dt);
    // Time and distance scrolled both turn the world, so it answers the wheel even while a pose rests.
    theta += dt * 0.3 + moved * 2.4 + push * dt * 9;

    // Which stage the page is resting nearest to, for the chrome and the sound.
    let near = 0;
    for (let i = 1; i < frames.length; i++) if (Math.abs(frames[i].y - scroll) < Math.abs(frames[near].y - scroll)) near = i;

    // With reduced motion there is no travel: the page shows the nearest stage, at rest, wherever it is scrolled to.
    sample(frames, options.reduced ? frames[near].y : scroll, vh, target);
    follow(current, target, options.reduced || raw ? 1e6 : 7.5, dt);
    if (near !== nearest) {
      nearest = near;
      options.onStage?.(near, stages[near].place);
    }

    // Where the camera is along the journey: at rest in a place, or part of the way to the next.
    const d = Math.min(last, Math.max(0, current.depth));
    const from = Math.min(last - 1, Math.floor(d));
    let through = d - from;
    if (options.reduced) through = Math.round(through);
    const between = through > 0.0015 && through < 0.9985;
    const moving = through > 0.25 && through < 0.75;
    if (moving && !underway) options.onDive?.();
    underway = moving;

    camera.position.set(0, 0, DIST * (compact ? 1.12 : 1) - push * 1.1);
    camera.lookAt(0, 0, 0);

    // The world leans towards the pointer (less while the camera is travelling: the move is the motion then),
    // and sways a little on its own.
    const sway = options.reduced || raw ? 0 : 1;
    const lean = sway * (1 - 0.6 * Math.sin(Math.PI * through));
    world.rotation.y = damp(world.rotation.y, pointer.x * 0.085 * lean + Math.sin(time * 0.23) * 0.012 * sway, 3.2, dt);
    world.rotation.x = damp(world.rotation.x, pointer.y * 0.05 * lean + Math.cos(time * 0.19) * 0.008 * sway, 3.2, dt);
    // On a tall screen the copy sits at the foot, so the subject (composed off to one side for a wide
    // frame) is brought to the middle and lifted clear of it.
    const side = stages[Math.max(0, nearest)].row.side === "L" ? -1 : 1;
    world.position.x = damp(world.position.x, compact ? side * 2.1 : 0, 3, dt);
    world.position.y = damp(world.position.y, compact ? 1.5 : 0, 3, dt);

    ctx.time = time;
    ctx.dt = dt;
    ctx.theta = theta;
    ctx.speed = speed;
    ctx.intro = state.intro;
    let rush = 0;
    let wantPane = -1;
    let wantGate = -1;
    showing.back = null;
    if (between) {
      // The place being reached is drawn first (it is what is seen through the door, the screen, the window);
      // the place being left over it.
      const route = routes[from];
      route.at(through, places[from].root.matrix, places[from + 1].root.matrix);
      showing.first = from + 1;
      showing.second = from;
      showing.pane = null;
      pose(from);
      pose(from + 1);
      rush = route.rush * Math.pow(Math.sin(Math.PI * through), 2);
      blend(mixed, tones[from], tones[from + 1], through * through * (3 - 2 * through));
      if (gates[from + 1]) wantGate = from + 1;
    } else {
      const at = through < 0.5 ? from : from + 1;
      places[at].root.matrix.copy(still);
      showing.first = at;
      showing.second = -1;
      showing.pane = null;
      pose(at);
      blend(mixed, tones[at], tones[at], 0);
      // A place with an outlook: the next one can be seen from it (through a window), so it is drawn as well,
      // standing where it will be when the camera sets off for it.
      const row = PLACES[at];
      if (row.outlook && at < last) {
        const ch = current[`c${at}`] as number[];
        const dx = ch[0] - row.exit[0];
        const dy = ch[1] - row.exit[1];
        const dz = ch[2] - row.exit[2];
        if (Math.abs(dx) + Math.abs(dy) + Math.abs(dz) < row.outlook) {
          routes[at].at(0, spare, places[at + 1].root.matrix);
          places[at + 1].root.matrix.premultiply(spare.makeTranslation(dx, dy, dz));
          pose(at + 1);
          showing.first = at + 1;
          showing.second = at;
          wantPane = at;
        }
      }
    }
    for (const place of places) place.root.matrixWorldNeedsUpdate = true;
    world.updateMatrixWorld(true);
    camera.updateMatrixWorld();
    if (wantPane >= 0) {
      // Where the window is on screen: the box round its four corners.
      const corners = places[wantPane].portal;
      if (corners) {
        if (frameOf(corners, places[wantPane].slide)) showing.pane = pane;
        else {
          // The window is out of frame: there is nothing of the far place to draw.
          showing.first = showing.second;
          showing.second = -1;
        }
      }
    }
    if (wantGate >= 0) {
      // The place ahead is entered through an opening. While the camera is still outside, that place is
      // drawn only where the opening is, and what is round it is the place being left.
      const gate = gates[wantGate]!;
      const slide = places[wantGate].slide;
      point.copy(camera.position).applyMatrix4(inverse.copy(slide.matrixWorld).invert());
      if (point.sub(gate.a).dot(gate.normal) > 0) {
        showing.back = tones[wantGate - 1];
        if (frameOf(places[wantGate].gate!, slide)) showing.pane = pane;
      }
    }

    bloom.strength = mixed.bloom;
    const u = finish.uniforms;
    u.uWarp.value = options.reduced ? 0 : Math.max(rush, state.intro < 1 ? state.rush : 0);
    u.uShift.value = options.reduced ? 0 : Math.min(0.008, speed * 0.0011);
    u.uTint.value.copy(mixed.accent);
    u.uTime.value = time;
    u.uGrain.value = 0.022 + 0.01 * mixed.light;
    composer.render(dt);

    // ---- DOM in the scene ----
    viewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    const now = performance.now();
    for (const sign of signs) {
      // A sign belongs to its place: it is there as the camera comes in, and goes soon after it sets off again.
      const ahead = sign.k - current.s;
      const on = state.ready && ahead < 0.44 && ahead > -0.16 && (sign.place === showing.first || sign.place === showing.second);
      if (on !== sign.on) {
        sign.on = on;
        sign.el.toggleAttribute("data-on", on);
        if (!on) sign.until = now + 450;
      }
      if (sign.plane && (on || now < sign.until)) {
        const depth = stand(sign.plane, places[sign.place].slide.matrixWorld, viewProjection, vw, vh);
        if (depth === null && sign.on) {
          sign.on = false;
          sign.el.removeAttribute("data-on");
        }
      }
    }
    for (const f of followers) {
      let on = state.ready && !between && Math.abs(current.s - f.stage) < 0.2;
      if (on) {
        point.setFromMatrixPosition(f.anchor.matrixWorld).project(camera);
        on = point.z > -1 && point.z < 1;
        if (on) f.el.style.transform = `translate3d(${((point.x * 0.5 + 0.5) * vw).toFixed(1)}px,${((0.5 - point.y * 0.5) * vh).toFixed(1)}px,0)`;
      }
      if (on !== f.on) {
        f.on = on;
        f.el.toggleAttribute("data-on", on);
      }
    }

  }

  // ---- governor: if refreshes keep being missed, trade pixels for frame rate ----
  // It watches the timestamps requestAnimationFrame is given (the display's own refreshes), not a ticker's
  // delta, which wobbles by milliseconds on a real screen without a refresh being missed. Changing resolution
  // re-allocates every buffer, which is a long frame of its own, so it is done rarely.
  let frameAt = 0;
  let refresh = 16.7;
  let slow = 0;
  let cooling = 240;
  let watching = true;
  const watch = (now: number) => {
    if (!watching) return;
    const took = now - frameAt;
    frameAt = now;
    if (took > 0 && took < 250 && !document.hidden && state.ready && state.intro >= 1) {
      refresh += (Math.min(took, 34) - refresh) * (took < refresh ? 0.2 : 0.002);
      if (cooling > 0) cooling--;
      else {
        slow = slow * 0.9 + (took > Math.max(20, refresh * 1.6) ? 0.1 : 0);
        if (slow > 0.45 && budget > 1.0e6) {
          budget *= 0.72;
          slow = 0;
          cooling = 150;
          size();
        }
      }
    }
    requestAnimationFrame(watch);
  };
  requestAnimationFrame(watch);

  // ---- warm-up: compile every shader and draw every place once, before anything is shown ----

  resize();
  for (const place of places) place.root.visible = true;
  paint(tones[0]);
  light(tones[0]);
  await renderer.compileAsync(scene, camera);
  // One real frame down the pipeline for each place, so nothing is built or uploaded mid-scroll. Culling is
  // off while this is done: a place is entered from behind and from the side, and what is out of sight from
  // where it rests (the wall with the door in it, the ceiling) has to be on the GPU too.
  const culled: THREE.Object3D[] = [];
  scene.traverse((object) => {
    if (object.frustumCulled) {
      object.frustumCulled = false;
      culled.push(object);
    }
  });
  for (let i = 0; i < places.length; i++) {
    ctx.ch = PLACES[i].stages[0].ch;
    ctx.intro = 1;
    places[i].update(ctx);
    showing.first = i;
    showing.second = -1;
    blend(mixed, tones[i], tones[i], 0);
    composer.render(0.016);
  }
  showing.first = 0;
  for (const object of culled) object.frustumCulled = true;

  const onPointer = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    pointer.x = (event.clientX / vw) * 2 - 1;
    pointer.y = (event.clientY / vh) * 2 - 1;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });
  let resizeTimer = 0;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 120);
  };
  window.addEventListener("resize", onResize);

  return {
    state,
    frame,
    resize,
    /** The hand pushed on although the page is holding at a stage: `screens` of scroll that went nowhere. */
    nudge(screens: number) {
      impulse = Math.max(-0.5, Math.min(0.5, impulse + screens * 0.55));
    },
    /** Scroll position of every resting stage, top to bottom. */
    stops: () => frames.map((f) => f.y),
    /** Which place each stage is in. */
    placeOf: (stage: number) => stages[stage].place,
    destroy() {
      watching = false;
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    },
  };
}

export type Stage = Awaited<ReturnType<typeof createStage>>;
