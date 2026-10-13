import gsap from "gsap";
import Lenis from "lenis";

/**
 * Scrolling for a staged page: Lenis on GSAP's ticker (so the page, the 3D
 * stage and every tween advance on the same frame).
 *
 * The hand is in charge: the page follows the wheel or the trackpad
 * directly, and since scroll position is the timeline, how fast the camera
 * travels is how fast the hand is scrolling. What is added is about where
 * it comes to rest:
 *
 *  - a top speed, so a hard flick cannot throw the page across chapters;
 *  - one gesture (a swipe with all its momentum, or a run of notches) can
 *    take the page as far as the next stage and no further. What is left of
 *    it there is not thrown away: it is handed to the stage, which leans in
 *    on it, so the hand never moves without something answering. A fresh
 *    push after a pause, or a steady scroll kept up for a beat, moves on;
 *  - it never rests between two stages, but it is in no hurry about it: the
 *    hand can scrub a move a notch at a time, and pause on the way. Only when
 *    the wheel has been quiet for half a second does the page finish the move
 *    it was making, gently, into the next stage in the direction of travel
 *    (or fall back, if it was under a third of the way), and any new input
 *    takes over at once.
 *
 * Skip all of it under prefers-reduced-motion and on touch screens, which
 * keep native scrolling.
 */

const sineInOut = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;
const quartOut = (t: number) => 1 - Math.pow(1 - t, 4);
const cubicInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export type ScrollOptions = {
  /** Returns the scroll positions (px) of every resting stage, top to bottom. Called on resize. */
  stops: () => number[];
  /** Fastest the wheel may carry the page, in screens per second. */
  topSpeed?: number;
  /** How long the wheel must be quiet before the page settles, in ms. */
  rest?: number;
  /** Whether to hold at stages and settle (e.g. only on desktop layouts). */
  staged?: () => boolean;
  /** Scroll the hand asked for while the page was holding at a stage, in screens (signed). */
  onPush?: (screens: number) => void;
};

export function createScroll({ stops, topSpeed = 1.8, rest = 520, staged = () => true, onPush }: ScrollOptions) {
  let points: number[] = [];
  let lastWheel = 0;
  let heading = 1;
  let timer = 0;
  /** The gesture in progress: which way, the stage it may not pass, when it got there, its quietest and latest events since. */
  const gesture = { dir: 0, limit: null as number | null, held: 0, floor: Infinity, last: Infinity };
  const GESTURE_GAP = 160; // ms of quiet that makes the next event a new gesture
  const DETENT = 600; // ms a steady scroll is held at a stage before it may carry on
  const PUSH = 30; // px: an event this large, that long after arriving, is a hand and not momentum
  const COMMIT = 0.3; // of a move: let go before this, and the page falls back instead of going on

  const lenis = new Lenis({
    lerp: 0.12,
    wheelMultiplier: 1,
    autoRaf: false,
    anchors: false,
    virtualScroll: (data) => {
      if (!data.event.type.includes("wheel")) return true;
      // The event's own time, not the time this runs: a busy frame must not look like a pause.
      const now = data.event.timeStamp || performance.now();
      const quiet = now - lastWheel;
      const asked = data.deltaY;
      // Allow what the top speed permits since the last wheel event. A notched
      // mouse wheel passes untouched; trackpad momentum is held to the limit.
      const elapsed = Math.min(0.1, Math.max(0.004, quiet / 1000));
      lastWheel = now;
      const most = Math.max(24, topSpeed * window.innerHeight * elapsed);
      data.deltaY = Math.max(-most, Math.min(most, data.deltaY));
      if (data.deltaY !== 0) heading = Math.sign(data.deltaY);
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, rest);

      // No further than the next stage in one gesture.
      const dir = Math.sign(data.deltaY);
      if (dir !== 0 && staged() && points.length > 1) {
        if (quiet > GESTURE_GAP || dir !== gesture.dir) begin(dir);
        if (gesture.limit !== null && (gesture.limit - lenis.targetScroll) * dir <= 0.5) {
          // Arrived. The rest goes to the stage as a push, unless the hand is plainly at it again: an event
          // well above the momentum that was dying away, or a steady scroll kept up for a beat.
          const size = Math.abs(asked);
          if (gesture.held === 0) gesture.held = now;
          const again = now - gesture.held > 320 && size > gesture.floor * 3 + 8;
          const steady = now - gesture.held > DETENT && size >= PUSH && size >= gesture.last;
          gesture.floor = Math.min(gesture.floor, size);
          gesture.last = size;
          if (again || steady) begin(dir);
        }
        if (gesture.limit !== null) {
          const room = Math.max(0, (gesture.limit - lenis.targetScroll) * dir);
          if (room <= 0.5) {
            onPush?.(data.deltaY / window.innerHeight);
            // Lenis lets an event with no movement through to the browser: stop it here.
            if (data.event.cancelable) data.event.preventDefault();
            data.deltaY = 0;
          } else if (Math.abs(data.deltaY) > room) {
            data.deltaY = room * dir;
          }
        } else {
          // Nothing beyond: the top or the foot of the page.
          onPush?.(data.deltaY / window.innerHeight);
        }
      }
      return true;
    },
  });

  /** A new gesture: it may go as far as the first stage ahead of where the page is headed. */
  function begin(dir: number) {
    const here = lenis.targetScroll;
    gesture.dir = dir;
    gesture.limit = (dir > 0 ? points.find((point) => point > here + 3) : [...points].reverse().find((point) => point < here - 3)) ?? null;
    gesture.held = 0;
    gesture.floor = Infinity;
    gesture.last = Infinity;
  }

  /** The wheel has gone quiet between two stages: finish the move it was making. */
  function settle() {
    if (!staged() || lenis.isStopped) return;
    const here = lenis.targetScroll;
    if (points.some((point) => Math.abs(point - here) <= 3)) return;
    const ahead = heading > 0 ? points.find((point) => point > here + 3) : [...points].reverse().find((point) => point < here - 3);
    const behind = heading > 0 ? [...points].reverse().find((point) => point < here - 3) : points.find((point) => point > here + 3);
    if (ahead === undefined) return;
    // Barely set off: fall back. Otherwise carry on to the stage it was heading for.
    const done = behind === undefined ? 1 : Math.abs(here - behind) / Math.abs(ahead - behind);
    const next = done < COMMIT && behind !== undefined ? behind : ahead;
    const screens = Math.abs(next - here) / window.innerHeight;
    if (screens > 1.6) return;
    // What is still to come of this gesture must not set the page off again.
    gesture.limit = next;
    gesture.dir = Math.sign(next - here) || gesture.dir;
    lenis.scrollTo(next, { duration: 0.9 + screens * 1.3, easing: sineInOut });
  }

  // Prioritised on the shared ticker: scroll is resolved before the stage renders the frame.
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick, false, true);

  /** One key press, one stage, at a pace that lets the move be watched. */
  const onKey = (event: KeyboardEvent) => {
    if (!staged() || event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (target?.closest("input, textarea, select, button, [contenteditable='true']")) return;
    const forward = event.key === "ArrowDown" || event.key === "PageDown" || (event.key === " " && !event.shiftKey);
    const back = event.key === "ArrowUp" || event.key === "PageUp" || (event.key === " " && event.shiftKey);
    const first = event.key === "Home";
    const last = event.key === "End";
    if (!forward && !back && !first && !last) return;
    const here = lenis.targetScroll;
    const next = first ? points[0] : last ? points[points.length - 1] : forward ? points.find((point) => point > here + 4) : [...points].reverse().find((point) => point < here - 4);
    if (next === undefined) return;
    event.preventDefault();
    const screens = Math.abs(next - here) / window.innerHeight;
    lenis.scrollTo(next, { duration: Math.min(7, 1.25 + screens * 0.5), easing: screens > 2 ? cubicInOut : quartOut });
  };

  const place = () => {
    points = stops();
  };
  place();
  window.addEventListener("keydown", onKey);
  const observer = new ResizeObserver(place);
  observer.observe(document.body);

  return {
    lenis,
    destroy() {
      window.clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("keydown", onKey);
      gsap.ticker.remove(tick);
      lenis.destroy();
    },
  };
}
