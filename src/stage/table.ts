import { chapters } from "../content";
import type { Travel } from "./handover";
import { PACE } from "./pace";

/**
 * The storyboard, as numbers. One row per resting stage; twelve in all, in the
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
 *   thread  -> exchange  straight down, without turning: the roof of the hall comes up past the camera.
 *   exchange -> forum    forwards across the floor, through the doors under the board, and out on to the stage.
 *   forum   -> orbit     up: one tilt of the head, then straight through the oculus in the ceiling to the stars.
 *   orbit   -> bench     down: the sea below turns out to be blueprint blue.
 *   bench   -> study     backwards: the drawing is on a screen, and the camera pulls out of it to the desk it stands on.
 *   study   -> gallery   sideways to the right, into the room next door, opened up like a film set.
 *   gallery -> library   forwards and round to the left, through the tall doorway at the end of the wall.
 *   books   -> desk      sideways to the left (inside the library; no hand-over).
 *   library -> night     forwards, over the desk and out through the open window, to the mountains.
 *   mountains -> harbour the whole night turns, and the town comes round (inside the same place; no hand-over).
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
  /** How bright the place's lamp is, if it has one (a candle on a desk). */
  lamp?: number;
  /** How far in from the frame the picture breaks into blocks (0 none, 1 a fifth of the way). */
  pixel?: number;
};

export type PlaceRow = {
  key: PlaceKey;
  look: Look;
  /** A second look, for a place that changes within itself: its channel's `q` runs from `look` (0) to this (1). */
  look2?: Look;
  /** How the camera gets here from the place before. */
  arrive?: Travel;
  /** If the next place can be seen from this one at rest (through a window): how near its last stage the camera must be for that. */
  outlook?: number;
  /** The channel while the camera is on its way in, and on its way out. */
  enter: Channel;
  exit: Channel;
  stages: StageRow[];
};

/** A channel: where the slide sits, how it is turned, and the place's own parameters (`p`, `q`, and for a few a third). */
const c = (px: number, py: number, pz: number, rx: number, ry: number, rz: number, p = 0, q = 0, r?: number): Channel => (r === undefined ? [px, py, pz, rx, ry, rz, p, q] : [px, py, pz, rx, ry, rz, p, q, r]);
const tone = (index: number, rest: Omit<Look, "ground" | "accent">): Look => ({ ground: chapters[index].ground, accent: chapters[index].accent, ...rest });
const HALF = Math.PI / 2;

/** How strongly a move eases in and out of its two stages (journey.ts). */
export const EASE = 0.72;

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
    // 01 Markets. The floor of an exchange at night: the board, the ticker, trading posts, a price series in the air.
    key: "chart",
    look: tone(1, { top: 0x020409, glow: 0.05, haze: 0.05, at: [0.5, 0.7], vignette: 0.5, grid: 0, fog: 0.008, bloom: 0.5, env: 0.4, key: 0.9, rim: 1.1 }),
    arrive: {
      // The hall is straight below. The camera does not turn or zoom: it sinks, and the roof comes up past it.
      into: { at: [0, -30, 0] },
      keepSky: true,
      pace: PACE.chart,
    },
    enter: c(0, 0, 0, 0, 0, 0, 0, 0),
    exit: c(0, 0, 0, 0, 0, 0, 1, 1),
    stages: [{ ch: c(0, 0, 0, 0, 0, 0, 1, 0), dist: DIST, side: "L" }],
  },
  {
    // 02 Stage. The auditorium, from beside the lectern: curtains, a balcony, 3,500 lights.
    key: "forum",
    look: tone(2, { top: 0x070102, glow: 0.1, haze: 0.07, at: [0.5, 0.3], vignette: 0.6, grid: 0, fog: 0.011, bloom: 0.7, env: 0.34, key: 1.2, rim: 1.2 }),
    arrive: {
      // The stage is through the doors under the board: forwards across the floor, through the wings, and out on to it.
      into: { at: [0, -0.35, -44] },
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
      rush: 0.16,
      pace: PACE.orbit,
    },
    // The whole sky is still swinging round into place as the camera comes out through the roof.
    // (A third parameter brings the other projects into the frame for the second stage, and sends the satellite back.)
    enter: c(-5, 1.5, 0, 0.05, 0.3, 0, 0, 0, 0),
    exit: c(0, 0, 0, 0, 0, 0, 1, 1, 1),
    stages: [
      { ch: c(0, 0, 0, 0, 0, 0, 1, 0, 0), dist: DIST, side: "L" },
      // The camera swings a little way round the orbit for the second stage, so the limb and the debris turn under it.
      { ch: c(0, 0, 0, -0.03, 0.24, 0, 1, 0, 1), dist: DIST, side: "L" },
    ],
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
      rush: 0.2,
      pace: PACE.bench,
    },
    enter: c(0, 0, 0, 0, 0, 0, 1),
    exit: c(0, 0, 0, 0, 0, 0, 1),
    stages: [{ ch: c(0, 0, 0, 0, 0, 0, 1), dist: DIST, side: "R" }],
  },
  {
    // 05 Code. A desk at night: screens of source, a browser, an artboard.
    key: "editor",
    look: tone(5, { top: 0x020a0e, glow: 0.06, haze: 0.05, at: [0.3, 0.5], vignette: 0.6, grid: 0, fog: 0.014, bloom: 0.5, env: 0.3, key: 1.0, rim: 1.4, pixel: 1 }),
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
    // `q` opens the doors to the library as the camera makes for them.
    enter: c(0, 0, 0, 0, 0, 0, 1, 0),
    exit: c(0, 0, 0, 0, 0, 0, 1, 1),
    stages: [{ ch: c(0, 0, 0, 0, 0, 0, 1, 0), dist: DIST, side: "L", deep: -3 }],
  },
  {
    // 07 Mind. Cream paper and ink: a stair of books past a colonnade; then, tracking, the desk by the window.
    key: "library",
    // From the desk, the harbour can be seen through the window: draw it whenever the camera is within this of the desk.
    outlook: 21,
    look: tone(7, { top: 0xf3eee2, glow: 0, haze: 0, at: [0.5, 0.5], vignette: 0.15, grid: -0.035, fog: 0.022, bloom: 0, env: 0.36, key: 1.15, rim: 0.2, light: true }),
    // By the desk it is night: the room is dark, and what light there is comes from a candle. (Outside the
    // window it is night too, so the way out matches.)
    look2: { ground: "#0c0806", accent: "#ffb070", top: 0x060404, glow: 0.05, haze: 0.04, at: [0.42, 0.5], vignette: 0.75, grid: 0, fog: 0.016, bloom: 0.3, env: 0.08, key: 0.08, rim: 0.2, lamp: 42 },
    arrive: {
      // The library is through the tall doorway at the left-hand end of the gallery's far wall, and faces
      // along the line from where the camera stood to that door: one straight walk, turning to it on the way.
      // (Its floor is a hand's breadth lower than the gallery's, so the two never lie in the same plane.)
      into: { at: [-41.3, 1.92, -40.2], turn: [0.67, 0, 0] },
      pace: PACE.library,
    },
    // (`r` is leaving by the window: the candle's glow goes down before the camera passes over it.)
    enter: c(0, 0, 0, 0, 0, 0, 0, 0, 0),
    exit: c(24, 0, 0, 0, 0, 0, 1, 1, 1),
    stages: [
      { ch: c(0, 0, 0, 0, 0, 0, 0, 0, 0), dist: DIST, side: "R" },
      { ch: c(24, 0, 0, 0, 0, 0, 1, 1, 0), dist: DIST, side: "L" },
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
    // Out of the window the camera is looking at the mountains, a long way round to the right of the town;
    // then the whole night turns, and Helsinki comes round across the water.
    enter: c(4.5, 0.8, -9, -0.02, 0.86, 0, 0),
    exit: c(0, -1.5, 0, -0.07, 0, 0, 1),
    stages: [
      { ch: c(0, -1.2, 0, -0.05, 1.0, 0, 0.5), dist: DIST, side: "L" },
      { ch: c(0, -1.5, 0, -0.07, 0, 0, 1), dist: DIST, side: "L" },
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
