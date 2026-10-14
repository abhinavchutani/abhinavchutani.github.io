/**
 * The scroll model, with no rendering in it.
 *
 *   pose table -> sample(scroll) -> eased target pose -> follow() -> damped current pose
 *
 * A pose's `depth` counts the places along the journey: 3.4 is four tenths of
 * the way from the fourth place to the fifth (handover.ts turns that into
 * where the camera is on its way between them).
 *
 * A pose is a flat record of numbers and number arrays (distance, rotation,
 * and every scene parameter you want to animate). Nothing in a scene should
 * ever be set straight from scroll: sample, then follow.
 */

export type PoseShape = Record<string, number | number[]>;

export type Keyframe<P extends PoseShape> = {
  /** Scroll position, in px, at which the page rests on this pose. */
  y: number;
  pose: P;
  /** Index of the chapter it belongs to. */
  chapter: number;
  /** How much the step after this keyframe eases in and out: 0 is a straight line, 1 comes to rest at each end. */
  hold: number;
};

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
/** Quintic ease with zero velocity and acceleration at both ends. */
export const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
export const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
/** Frame-rate independent approach: `rate` is per second (6 to 7 feels weighty, 60 is instant). */
export const damp = (current: number, target: number, rate: number, dt: number) => current + (target - current) * (1 - Math.exp(-rate * dt));

/** Set while a move is being measured: scroll then maps straight on to the move, with no easing. */
export const tuning = { linear: false };

/**
 * Writes the pose for `scroll` into `out` (which must have the same shape as
 * the poses) and returns which keyframes it lies between.
 *
 * Scroll scrubs the move. It eases in and out of each stage, but never to a
 * standstill: even at a stage the pose is still creeping, so every bit of
 * scroll moves something. (Where the page comes to rest is the scroller's
 * business, not the easing's.)
 */
export function sample<P extends PoseShape>(frames: Keyframe<P>[], scroll: number, _viewport: number, out: P) {
  if (frames.length === 0) return null;
  let index = 0;
  while (index < frames.length - 1 && frames[index + 1].y <= scroll) index++;
  const from = frames[index];
  const to = frames[Math.min(index + 1, frames.length - 1)];

  let t = 0;
  if (to !== from) {
    const raw = clamp01((scroll - from.y) / (to.y - from.y));
    t = tuning.linear ? raw : raw + (smoother(raw) - raw) * from.hold;
  }

  const target = out as Record<string, number | number[]>;
  for (const key in from.pose) {
    const a = from.pose[key];
    const b = to.pose[key];
    if (typeof a === "number") target[key] = a + ((b as number) - a) * t;
    else {
      const o = target[key] as number[];
      for (let i = 0; i < a.length; i++) o[i] = a[i] + ((b as number[])[i] - a[i]) * t;
    }
  }
  return { from, to, t };
}

/** Moves `current` towards `target` with exponential damping. Call once per frame. */
export function follow<P extends PoseShape>(current: P, target: P, rate: number, dt: number) {
  const now = current as Record<string, number | number[]>;
  for (const key in target) {
    const goal = target[key];
    if (typeof goal === "number") now[key] = damp(now[key] as number, goal, rate, dt);
    else {
      const o = now[key] as number[];
      for (let i = 0; i < goal.length; i++) o[i] = damp(o[i], goal[i], rate, dt);
    }
  }
}
