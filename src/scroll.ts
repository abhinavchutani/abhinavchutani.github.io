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
 *  - it never rests between two stages. As soon as the hand lets go (the wheel
 *    goes quiet, or a trackpad's momentum dies away) the page glides on into
 *    the next stage in the direction of travel, carrying the speed it had, so
 *    there is no stop and no fresh start: one motion from the hand's push to the
 *    stage. (It falls back only if it had barely set off.) What is left of the
 *    gesture's momentum while it glides is taken up by the glide; a new push
 *    takes over at once.
 *
 * Skip all of it under prefers-reduced-motion and on touch screens, which
 * keep native scrolling.
 */

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

export function createScroll({ stops, topSpeed = 2.2, rest = 150, staged = () => true, onPush }: ScrollOptions) {
  let points: number[] = [];
  let lastWheel = 0;
  let heading = 1;
  let timer = 0;
  /** The gesture in progress: which way, the stage it may not pass, when it got there, its quietest and latest events since, its largest event. */
  const gesture = { dir: 0, limit: null as number | null, held: 0, floor: Infinity, last: Infinity, peak: 0 };
  /** Where the page is gliding to on its own, if it is. */
  let gliding: number | null = null;
  const GESTURE_GAP = 160; // ms of quiet that makes the next event a new gesture
  const DETENT = 600; // ms a steady scroll is held at a stage before it may carry on
  const PUSH = 30; // px: an event this large, that long after arriving, is a hand and not momentum
  const COMMIT = 0.04; // of a move: let go before this (a nudge, not a push), and the page falls back instead of going on

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
      const fresh = quiet > GESTURE_GAP || dir !== gesture.dir;
      if (gliding !== null && dir !== 0) {
        if (!fresh) {
          // The momentum of the gesture that set the glide off: it is already in the glide.
          window.clearTimeout(timer);
          if (data.event.cancelable) data.event.preventDefault();
          data.deltaY = 0;
          return true;
        }
        // A new push takes over at once. The same way, it carries on from where the glide was going (so it adds
        // to the glide instead of braking it); the other way, it turns back from where the page is.
        const from = gliding;
        gliding = null;
        if (dir === gesture.dir) lenis.targetScroll = from;
      }
      if (dir !== 0 && staged() && points.length > 1) {
        if (fresh) begin(dir);
        gesture.peak = Math.max(gesture.peak, Math.abs(asked));
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
            if (gliding === null) onPush?.(data.deltaY / window.innerHeight);
            // Lenis lets an event with no movement through to the browser: stop it here.
            if (data.event.cancelable) data.event.preventDefault();
            data.deltaY = 0;
          } else {
            if (Math.abs(data.deltaY) > room) data.deltaY = room * dir;
            // A trackpad's momentum dying away is the hand letting go: glide on now, not when the tail has crept out.
            if (gesture.peak >= 18 && Math.abs(asked) < Math.max(2.5, gesture.peak * 0.22)) {
              window.clearTimeout(timer);
              settle();
              if (gliding !== null) {
                if (data.event.cancelable) data.event.preventDefault();
                data.deltaY = 0;
              }
            }
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
    gesture.peak = 0;
  }

  /**
   * The hand has let go between two stages: glide on into the stage it was heading for, starting at the speed
   * the page already has (a cubic whose slope at the start is that speed), so the motion runs on unbroken and
   * eases into the stage.
   */
  function settle() {
    if (!staged() || lenis.isStopped || gliding !== null) return;
    const here = lenis.animatedScroll;
    if (points.some((point) => Math.abs(point - here) <= 3)) return;
    const ahead = heading > 0 ? points.find((point) => point > here + 3) : [...points].reverse().find((point) => point < here - 3);
    const behind = heading > 0 ? [...points].reverse().find((point) => point < here - 3) : points.find((point) => point > here + 3);
    if (ahead === undefined) return;
    // Barely set off: fall back. Otherwise carry on to the stage it was heading for.
    const done = behind === undefined ? 1 : Math.abs(here - behind) / Math.abs(ahead - behind);
    const next = done < COMMIT && behind !== undefined ? behind : ahead;
    const distance = Math.abs(next - here);
    const screens = distance / window.innerHeight;
    if (screens > 1.6 || distance < 1) return;
    const duration = Math.min(1.35, Math.max(0.5, 0.42 + screens * 0.95));
    // The speed it has now (px a frame at 60 a second), towards where it is going.
    const towards = Math.sign(next - here);
    const speed = Math.max(0, lenis.velocity * towards) * 60;
    const slope = Math.min(2.4, (speed * duration) / distance);
    const glide = (u: number) => slope * (u * u * u - 2 * u * u + u) + (3 * u * u - 2 * u * u * u);
    gesture.limit = next;
    gesture.dir = towards || gesture.dir;
    gliding = next;
    lenis.scrollTo(next, {
      duration,
      easing: glide,
      onComplete: () => {
        if (gliding === next) gliding = null;
      },
    });
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
    gliding = null;
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
