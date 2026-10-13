import { chapters } from "../content";
import type { Travel } from "./handover";

/**
 * The storyboard, as numbers. One row per resting stage; eleven in all.
 *
 * The camera stays on the z axis, twelve units back, looking at the origin;
 * each place is modelled round that view, so a place at rest needs no pose
 * at all. A place's channel is [px, py, pz, rx, ry, rz, p, q]: where its
 * `slide` group sits and how it is turned (used for travel inside a place,
 * like the track from the books to the desk), plus two free parameters the
 * place reads (how far a net has deployed, how far a screen has faded).
 *
 * `arrive` is how the camera gets here from the place before: a real move
 * through one continuous world (see handover.ts). It says where the two
 * places sit relative to each other and which way the camera goes:
 *
 *   thread  -> gallery   down the thread to the light at its end: a doorway. In, looking down, and through the room in a curve.
 *   gallery -> study     a turn to the right and through the door in the side wall.
 *   study   -> orbit     in through the monitor; the screen is a window.
 *   orbit   -> bench     tip forward and fall, all the way down to a drawing board on the ground.
 *   bench   -> chart     track right across the desk, off the blueprint and on to the newspaper.
 *   chart   -> forum     pull back: the page is on a lectern. Look up, and there is the hall.
 *   forum   -> library   straight up, through the oculus in the ceiling, on to the floor above.
 *   library -> harbour   forward, over the desk and out through the window.
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
    // 01 Sound. A museum gallery: damask, paintings of musicians, a violin in a case, a drum kit behind a rope.
    key: "violin",
    look: tone(1, { top: 0x080303, glow: 0.04, haze: 0.03, at: [0.6, 0.4], vignette: 0.5, grid: 0, fog: 0.006, bloom: 0.3, env: 0.4, key: 1.35, rim: 0.7 }),
    arrive: {
      // The gallery's doorway stands where the thread's star is, square to the line of flight.
      into: { at: [24.0, 11.23, -113.08], turn: [-0.1896, 0.0809, 0] },
      via: [
        { at: [0, -0.3, 47], turn: [0, -0.1, 0], when: 0.52 },
        { at: [0, 0.7, 37.5], turn: [0, -0.5, 0], when: 0.63 }, // on the threshold, looking down at the carpet
        { at: [2.8, 0.5, 29.5], turn: [0.24, -0.2, 0], when: 0.75 }, // out to the right, eyes left
        { at: [-1.9, 0.2, 20.5], turn: [-0.17, -0.04, 0], when: 0.88 }, // back across, eyes right
      ],
      rush: 0.3,
    },
    enter: c(0, 0, 0, 0, 0, 0, 1),
    exit: c(0, 0, 0, 0, 0, 0, 1),
    stages: [{ ch: c(0, 0, 0, 0, 0, 0, 1), dist: DIST, side: "L", deep: -3 }],
  },
  {
    // 02 Code. The study next door. A desk at night: screens of source, a browser, an artboard.
    key: "editor",
    look: tone(2, { top: 0x020a0e, glow: 0.06, haze: 0.05, at: [0.3, 0.5], vignette: 0.6, grid: 0, fog: 0.014, bloom: 0.5, env: 0.3, key: 1.0, rim: 1.4 }),
    arrive: {
      // Through the door in the gallery's right-hand wall; the study faces along the gallery's +x.
      into: { at: [48, 0, 4], turn: [-HALF, 0, 0] },
      via: [
        { at: [2.2, -0.1, 36], turn: [0.55, 0, 0], when: 0.45 },
        { at: [0, -0.2, 29], turn: [0.1, 0, 0], when: 0.62 }, // in the doorway
      ],
    },
    enter: c(0, 0, 0, 0, 0, 0, 1, 0),
    exit: c(0, 0, 0, 0, 0, 0, 1, 1),
    stages: [{ ch: c(0, 0, 0, 0, 0, 0, 1, 0), dist: DIST, side: "R" }],
  },
  {
    // 03 Orbit. Indigo. The Earth's limb, a belt of debris, the satellite and its net.
    key: "orbit",
    look: tone(3, { top: 0x01010a, glow: 0.03, haze: 0.03, at: [0.7, 0.3], vignette: 0.5, grid: 0, fog: 0.007, bloom: 0.5, env: 0.3, key: 2.0, rim: 1.6 }),
    arrive: {
      // Orbit is on the far side of the main monitor: nine units behind the glass, along its axis.
      into: { at: [-4.48, 1.27, -31.2], turn: [0.06, 0, 0] },
      via: [
        { at: [0, 0, 35], when: 0.34 }, // squared up to the screen
        { at: [0, 0, 21], when: 0.62 }, // through it
      ],
      rush: 0.22,
    },
    enter: c(0, 0, 0, 0, 0, 0, 1),
    exit: c(0, 0, 0, 0, 0, 0, 1),
    stages: [{ ch: c(0, 0, 0, 0, 0, 0, 1), dist: DIST, side: "L" }],
  },
  {
    // 04 Machine. A drawing board: the competition table and its robot on a blueprint.
    key: "bench",
    look: tone(4, { top: 0x0d329c, glow: 0.0, haze: 0.0, at: [0.3, 0.5], vignette: 0.3, grid: 0, fog: 0.004, bloom: 0.22, env: 0.42, key: 1.35, rim: 0.5 }),
    arrive: {
      // The sheet lies on the ground far below, on the lit side of the Earth; everything here is 1/166 the size.
      into: { at: [13.12, -7.14, -0.8], turn: [0.5748, -0.8618, 0], scale: 0.006 },
      pivot: [0, 0, -9.4],
      rush: 0.3,
    },
    enter: c(0, 0, 0, 0, 0, 0, 1),
    exit: c(0, 0, 0, 0, 0, 0, 1),
    stages: [{ ch: c(0, 0, 0, 0, 0, 0, 1), dist: DIST, side: "R" }],
  },
  {
    // 05 Markets. The newspaper beside the blueprint: candles, simulated paths, the podium.
    key: "chart",
    look: tone(5, { top: 0xf6e4d4, glow: 0, haze: 0, at: [0.5, 0.5], vignette: 0.14, grid: 0, fog: 0.008, bloom: 0, env: 0.36, key: 1.15, rim: 0.25, light: true }),
    arrive: {
      // Its page lies to the right of the blueprint, four units of bare desk between them.
      into: { at: [70, 0, 0] },
      via: [{ at: [-35, 0.4, 9.4], turn: [-0.12, 0, 0], when: 0.5 }],
    },
    enter: c(0, 0, 0, 0, 0, 0, 0, 0),
    exit: c(0, 0, 0, 0, 0, 0, 1, 0),
    stages: [{ ch: c(0, 0, 0, 0, 0, 0, 1, 0), dist: DIST, side: "L" }],
  },
  {
    // 06 Stage. The auditorium, from the lectern: curtains, a balcony, 3,500 lights.
    key: "forum",
    look: tone(6, { top: 0x070102, glow: 0.1, haze: 0.07, at: [0.5, 0.3], vignette: 0.6, grid: 0, fog: 0.011, bloom: 0.7, env: 0.34, key: 1.2, rim: 1.2 }),
    arrive: {
      // The newspaper page is the sheet lying on the lectern.
      from: { at: [3.168, 0.044, 1.827], turn: [0.42, -1.2508, 0], scale: 0.015 },
      pivot: [3.18, -0.07, 1.78],
    },
    enter: c(0, 0, 0, 0, 0, 0, 1),
    exit: c(0, 0, 0, 0, 0, 0, 1),
    stages: [{ ch: c(0, 0, 0, 0, 0, 0, 1), dist: DIST, side: "L" }],
  },
  {
    // 07 Mind. The floor above. Cream paper and ink: a stair of books past a colonnade; then, tracking, the desk by the window.
    key: "library",
    // From the desk, the harbour can be seen through the window: draw it whenever the camera is within this of the desk.
    outlook: 21,
    look: tone(7, { top: 0xf3eee2, glow: 0, haze: 0, at: [0.5, 0.5], vignette: 0.15, grid: -0.035, fog: 0.022, bloom: 0, env: 0.36, key: 1.15, rim: 0.2, light: true }),
    arrive: {
      into: { at: [0, 46, 0] },
      via: [
        { at: [-2.4, -27, 3], turn: [0, 1.1, 0], when: 0.34 }, // rising, eyes up on the opening
        { at: [-3.4, -9.5, -4.2], turn: [0, 1.25, 0], when: 0.58 }, // under it: the stair of books winds up overhead
        { at: [-3.3, -0.7, -3.8], turn: [0.06, 0.4, 0], when: 0.76 }, // up inside the stair, levelling off (and out between two turns of it)
      ],
    },
    enter: c(0, 0, 0, 0, 0, 0, 0, 0),
    exit: c(24, 0, 0, 0, 0, 0, 1, 1),
    stages: [
      { ch: c(0, 0, 0, 0, 0, 0, 0, 0), dist: DIST, side: "R" },
      { ch: c(24, 0, 0, 0, 0, 0, 1, 1), dist: DIST, side: "L" },
    ],
  },
  {
    // 08 Now. Outside the window: Helsinki across the water under the aurora; then an arc round the cathedral.
    key: "aurora",
    look: tone(8, { top: 0x01040d, glow: 0.05, haze: 0.1, at: [0.5, 0.78], vignette: 0.45, grid: 0, fog: 0.006, bloom: 0.8, env: 0.5, key: 1.2, rim: 1.6 }),
    arrive: {
      into: { at: [3, 1.6, -42] },
      via: [{ at: [0, -0.5, 26.3], when: 0.5 }], // through the open window
    },
    enter: c(0, -1.5, 0, -0.07, 0, 0, 0),
    exit: c(-1.5, -1.9, 9, -0.1, 0.34, 0, 1),
    stages: [
      { ch: c(0, -1.5, 0, -0.07, 0, 0, 0), dist: DIST, side: "L" },
      { ch: c(-1.5, -1.9, 9, -0.1, 0.34, 0, 1), dist: DIST, side: "R" },
    ],
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
