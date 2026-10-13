import * as THREE from "three";
import { chapters } from "../content";
import type { Travel } from "./handover";
import { PACE } from "./pace";

/**
 * The storyboard, as numbers. One row per resting stage; ten in all, in the
 * order of what matters most to him now: markets, the stage, the projects,
 * the machine, code, sound, mind, and how to reach him.
 *
 * The camera stays on the z axis, twelve units back, looking at the origin;
 * each place is modelled round that view, so a place at rest needs no pose
 * at all. A place's channel is [px, py, pz, rx, ry, rz, p, q]: where its
 * `slide` group sits and how it is turned (used for travel inside a place,
 * like the track from the books to the desk), plus two free parameters the
 * place reads (how far a net has deployed, how far a screen has faded).
 *
 * `arrive` is how the camera gets here from the place before: a real move
 * through one continuous world (see handover.ts). Each is a single gesture,
 * and neighbours never share an axis:
 *
 *   thread  -> chart     forwards, down the thread to the point it comes from: the last price, where the paths fan out.
 *   chart   -> forum     eyes up from the page: it is on a lectern, and there is the hall.
 *   forum   -> orbit     up: one tilt of the head, then straight through the oculus in the ceiling to the stars.
 *   orbit   -> bench     down: the sea below turns out to be blueprint blue.
 *   bench   -> study     backwards: the drawing is on a screen, and the camera pulls out of it to the desk it stands on.
 *   study   -> gallery   sideways to the right, into the room next door, opened up like a film set.
 *   gallery -> library   forwards and round to the left, through the tall doorway at the end of the wall.
 *   books   -> desk      sideways to the left (inside the library; no hand-over).
 *   library -> harbour   forwards, over the desk and out through the open window.
 */

export const FOV = 32;
export const DIST = 12;

export type Channel = number[];

export type StageRow = {
  ch: Channel;
  dist: number;
  /** Where the copy stands at rest: which side, its centre as a fraction of the viewport height, and how deep in the place. */
  side: "L" | "R";
  y?: number;
  deep?: number;
};

export type PlaceKey = "thread" | "violin" | "editor" | "orbit" | "bench" | "chart" | "forum" | "library" | "aurora";

export type Look = {
  /** Ground and accent come from the chapter (content.ts), so page and canvas agree. */
  ground: string;
  accent: string;
  /** The colour at the top of the frame; the ground is the colour at the foot. */
  top: number;
  /** Tight glow and wide haze in the accent, and where on screen (0..1) they sit. */
  glow: number;
  haze: number;
  at: [number, number];
  vignette: number;
  /** A drafting grid on the ground: negative darkens (paper), positive lightens (blueprint). */
  grid: number;
  fog: number;
  bloom: number;
  env: number;
  key: number;
  rim: number;
  /** A light ground with ink on it. */
  light?: boolean;
};

export type PlaceRow = {
  key: PlaceKey;
  look: Look;
  /** How the camera gets here from the place before. */
  arrive?: Travel;
  /** If the next place can be seen from this one at rest (through a window): how near its last stage the camera must be for that. */
  outlook?: number;
  /** The channel while the camera is on its way in, and on its way out. */
  enter: Channel;
  exit: Channel;
  stages: StageRow[];
};

const c = (px: number, py: number, pz: number, rx: number, ry: number, rz: number, p = 0, q = 0): Channel => [px, py, pz, rx, ry, rz, p, q];
const tone = (index: number, rest: Omit<Look, "ground" | "accent">): Look => ({ ground: chapters[index].ground, accent: chapters[index].accent, ...rest });
const HALF = Math.PI / 2;

/** How strongly a move eases in and out of its two stages (journey.ts). */
export const EASE = 0.72;

/** Where the newspaper's page is in the chart's own coordinates, and where the same page lies on the lectern in the hall. */
export const PAGE = { x: 2, y: -16, z: -8, wide: 80, tall: 50 };
export const LECTERN = { x: 3.1, y: -3.3, z: 1.6, yaw: 0.42, top: [0, 3.211, 0.2] as [number, number, number], tilt: 0.32, pageWide: 1.2 };

/** The chart, as it sits in the hall: its page is the sheet on the lectern, sixty-odd times smaller. */
function chartOnLectern() {
  const k = LECTERN.pageWide / PAGE.wide;
  const m = new THREE.Matrix4().makeTranslation(LECTERN.x, LECTERN.y, LECTERN.z);
  m.multiply(new THREE.Matrix4().makeRotationY(LECTERN.yaw));
  // (A hair above the sheet that is modelled on the lectern, so the two never fight for the same depth.)
  m.multiply(new THREE.Matrix4().makeTranslation(LECTERN.top[0], LECTERN.top[1] + 0.012, LECTERN.top[2]));
  // The page lies on the sloping top: its width along x, its height running away from the speaker, its face up.
  m.multiply(new THREE.Matrix4().makeRotationX(LECTERN.tilt - Math.PI / 2));
  m.multiply(new THREE.Matrix4().makeScale(k, k, k));
  m.multiply(new THREE.Matrix4().makeTranslation(-PAGE.x, -PAGE.y, -PAGE.z));
  // The spot on the page the camera was looking at.
  const pivot = new THREE.Vector3(0, 0, PAGE.z).applyMatrix4(m);
  return { seat: m, pivot: [pivot.x, pivot.y, pivot.z] as [number, number, number] };
}
const onLectern = chartOnLectern();

export const PLACES: PlaceRow[] = [
  {
    // 00 Origin. Black, with a nebula in it. One strand per discipline, twisting into a single thread of light.
    key: "thread",
    look: tone(0, { top: 0x050506, glow: 0.02, haze: 0.012, at: [0.7, 0.6], vignette: 0.5, grid: 0, fog: 0.012, bloom: 0.6, env: 0.4, key: 1.4, rim: 1.6 }),
    enter: c(0, 0, 0, 0, 0, 0, 0),
    exit: c(0, 0, 0, 0, 0, 0, 1),
    stages: [{ ch: c(0, 0, 0, 0, 0, 0, 0), dist: DIST, side: "L", y: 0.56 }],
  },
  {
    // 01 Markets. A newspaper page: candles, simulated paths, the podium.
    key: "chart",
    look: tone(1, { top: 0xf6e4d4, glow: 0, haze: 0, at: [0.5, 0.5], vignette: 0.14, grid: 0, fog: 0.008, bloom: 0, env: 0.36, key: 1.15, rim: 0.25, light: true }),
    arrive: {
      // The thread comes out of one point of light. That point is the last price on the chart, where the
      // simulated paths fan out: the page is there from the start, twenty times too small to see.
      meet: { anchor: "origin", at: [16.1, 6.6, -74], turn: [-0.1852, 0.0754, 0], scale: 0.05 },
      turning: [0, 0.55],
      sliding: [0.1, 0.9],
      keepSky: true,
      rush: 0.25,
      pace: PACE.chart,
    },
    enter: c(0, 0, 0, 0, 0, 0, 0, 0),
    exit: c(0, 0, 0, 0, 0, 0, 1, 0),
    stages: [{ ch: c(0, 0, 0, 0, 0, 0, 1, 0), dist: DIST, side: "L" }],
  },
  {
    // 02 Stage. The auditorium, from beside the lectern: curtains, a balcony, 3,500 lights.
    key: "forum",
    look: tone(2, { top: 0x070102, glow: 0.1, haze: 0.07, at: [0.5, 0.3], vignette: 0.6, grid: 0, fog: 0.011, bloom: 0.7, env: 0.34, key: 1.2, rim: 1.2 }),
    arrive: {
      // The newspaper page is the sheet lying on the lectern. Eyes up first, then step back from it.
      seat: onLectern.seat,
      pivot: onLectern.pivot,
      turning: [0, 0.5],
      sliding: [0.05, 0.9],
      pace: PACE.forum,
    },
    enter: c(0, 0, 0, 0, 0, 0, 1),
    exit: c(0, 0, 0, 0, 0, 0, 1),
    stages: [{ ch: c(0, 0, 0, 0, 0, 0, 1), dist: DIST, side: "L" }],
  },
  {
    // 03 Projects. Indigo. The Earth's limb, a belt of debris, the satellite and its net.
    key: "orbit",
    look: tone(3, { top: 0x01010a, glow: 0.03, haze: 0.03, at: [0.7, 0.3], vignette: 0.5, grid: 0, fog: 0.007, bloom: 0.5, env: 0.3, key: 2.0, rim: 1.6 }),
    arrive: {
      // Orbit is above the hall, along the line from the lectern through the oculus in its ceiling, and tipped
      // to face down that line: there is no up out there. So the camera tilts once and then flies straight.
      into: { at: [-5.93, 68.83, -16.82], turn: [0.2031, 1.1668, 0] },
      via: [{ at: [0, 0, 44], when: 0.48 }], // squared up to the opening, about to go through it
      rush: 0.25,
      pace: PACE.orbit,
    },
    // The whole sky is still swinging round into place as the camera comes out through the roof.
    enter: c(-5, 1.5, 0, 0.05, 0.3, 0, 0, 0),
    exit: c(0, 0, 0, 0, 0, 0, 1, 1),
    stages: [{ ch: c(0, 0, 0, 0, 0, 0, 1, 0), dist: DIST, side: "L" }],
  },
  {
    // 04 Machine. A drawing board: the competition table and its robot on a blueprint.
    key: "bench",
    look: tone(4, { top: 0x1444c4, glow: 0.0, haze: 0.0, at: [0.3, 0.5], vignette: 0.22, grid: 0, fog: 0.004, bloom: 0.22, env: 0.42, key: 1.35, rim: 0.5 }),
    arrive: {
      // The sheet lies on the sea far below, on the lit side of the Earth; everything here is 1/166 the size.
      into: { at: [13.12, -7.14, -0.8], turn: [0.5748, -0.8618, 0], scale: 0.006 },
      pivot: [0, 0, -9.4],
      turning: [0, 0.62],
      sliding: [0, 0.5],
      rush: 0.3,
      pace: PACE.bench,
    },
    enter: c(0, 0, 0, 0, 0, 0, 1),
    exit: c(0, 0, 0, 0, 0, 0, 1),
    stages: [{ ch: c(0, 0, 0, 0, 0, 0, 1), dist: DIST, side: "R" }],
  },
  {
    // 05 Code. A desk at night: screens of source, a browser, an artboard.
    key: "editor",
    look: tone(5, { top: 0x020a0e, glow: 0.06, haze: 0.05, at: [0.3, 0.5], vignette: 0.6, grid: 0, fog: 0.014, bloom: 0.5, env: 0.3, key: 1.0, rim: 1.4 }),
    arrive: {
      // The blueprint is a drawing open on the main monitor, half the size. The camera backs out of the screen.
      inScreen: { scale: 0.5, back: 4.6 },
      pace: PACE.editor,
    },
    enter: c(0, 0, 0, 0, 0, 0, 0, 0),
    exit: c(0, 0, 0, 0, 0, 0, 1, 0),
    stages: [{ ch: c(0, 0, 0, 0, 0, 0, 1, 0), dist: DIST, side: "R" }],
  },
  {
    // 06 Sound. A museum gallery: damask, paintings of musicians, a violin in a case, a drum kit behind a rope.
    key: "violin",
    look: tone(6, { top: 0x080303, glow: 0.04, haze: 0.03, at: [0.6, 0.4], vignette: 0.5, grid: 0, fog: 0.006, bloom: 0.3, env: 0.4, key: 1.35, rim: 0.7 }),
    arrive: {
      // The gallery is the room to the right of the study, seen from the side with its near wall away.
      // The camera does not turn: it slides, and the room opens up.
      into: { at: [41, 0, 0] },
      pace: PACE.violin,
    },
    enter: c(0, 0, 0, 0, 0, 0, 1),
    exit: c(0, 0, 0, 0, 0, 0, 1),
    stages: [{ ch: c(0, 0, 0, 0, 0, 0, 1), dist: DIST, side: "L", deep: -3 }],
  },
  {
    // 07 Mind. Cream paper and ink: a stair of books past a colonnade; then, tracking, the desk by the window.
    key: "library",
    // From the desk, the harbour can be seen through the window: draw it whenever the camera is within this of the desk.
    outlook: 21,
    look: tone(7, { top: 0xf3eee2, glow: 0, haze: 0, at: [0.5, 0.5], vignette: 0.15, grid: -0.035, fog: 0.022, bloom: 0, env: 0.36, key: 1.15, rim: 0.2, light: true }),
    arrive: {
      // The library is through the tall doorway at the left-hand end of the gallery's far wall, and faces
      // along the line from where the camera stood to that door: one straight walk, turning to it on the way.
      into: { at: [-41.3, 2.1, -40.2], turn: [0.67, 0, 0] },
      pace: PACE.library,
    },
    enter: c(0, 0, 0, 0, 0, 0, 0, 0),
    exit: c(24, 0, 0, 0, 0, 0, 1, 1),
    stages: [
      { ch: c(0, 0, 0, 0, 0, 0, 0, 0), dist: DIST, side: "R" },
      { ch: c(24, 0, 0, 0, 0, 0, 1, 1), dist: DIST, side: "L" },
    ],
  },
  {
    // 08 Contact. Outside the window: Helsinki across the water under the aurora, every discipline one constellation.
    key: "aurora",
    look: tone(8, { top: 0x01040d, glow: 0.05, haze: 0.1, at: [0.5, 0.78], vignette: 0.45, grid: 0, fog: 0.006, bloom: 0.8, env: 0.5, key: 1.2, rim: 1.6 }),
    arrive: {
      into: { at: [3, 1.6, -42] },
      via: [{ at: [0, -0.5, 26.3], when: 0.42 }], // through the open window
      pace: PACE.aurora,
    },
    // The town is still coming round and up into place as the camera comes out over the water.
    enter: c(4.5, 0.8, -9, -0.02, -0.16, 0, 0),
    exit: c(0, -1.5, 0, -0.07, 0, 0, 1),
    stages: [{ ch: c(0, -1.5, 0, -0.07, 0, 0, 1), dist: DIST, side: "L" }],
  },
];

export type Pose = { s: number; depth: number; dist: number } & Record<string, number | number[]>;

export type StageInfo = { place: number; step: number; row: StageRow };

/** Every stage in order, and the full pose the page rests on at each. */
export function buildPoses() {
  const stages: StageInfo[] = PLACES.flatMap((place, index) => place.stages.map((row, step) => ({ place: index, step, row })));
  const poses: Pose[] = stages.map((stage, s) => {
    const pose: Pose = { s, depth: stage.place, dist: stage.row.dist };
    PLACES.forEach((place, m) => {
      pose[`c${m}`] = [...(m === stage.place ? stage.row.ch : m < stage.place ? place.exit : place.enter)];
    });
    return pose;
  });
  return { stages, poses };
}

export const blankPose = (): Pose => {
  const pose: Pose = { s: 0, depth: 0, dist: PLACES[0].stages[0].dist };
  PLACES.forEach((place, m) => (pose[`c${m}`] = [...(m === 0 ? place.stages[0].ch : place.enter)]));
  return pose;
};
