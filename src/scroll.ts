import gsap from "gsap";
import Lenis from "lenis";

/**
 * Scrolling for a staged page: Lenis on GSAP's ticker (so the page, the 3D
 * stage and every tween advance on the same frame).
 *
 * The hand is in charge. The page follows the wheel or the trackpad
 * directly, and since scroll position is the timeline, how fast the camera
 * travels is how fast the hand is scrolling. Three things are added, all
 * of them about where it comes to rest:
 *
 *  - a top speed, so a hard flick cannot throw the page across chapters;
 *  - one gesture can reach the next stage but not pass it: the momentum a
 *    trackpad adds after the fingers lift is absorbed there, so the page
 *    stays put where the copy can be read until the next deliberate scroll;
 *  - if the hand lets go between two stages, the page waits a moment and
 *    then glides, gently, to whichever of the two is nearer.
 *
 * It never plays a move on its own beyond that last glide. Skip all of it
 * under prefers-reduced-motion and on touch screens, which keep native
 * scrolling.
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
};

export function createScroll({ stops, topSpeed = 2.6, rest = 320, staged = () => true }: ScrollOptions) {
  let points: number[] = [];
  let lastWheel = 0;
  let timer = 0;

  // The gesture in progress: which way, the one stage it may reach, and when it got there.
  const gesture = { dir: 0, limit: 0, reached: 0, level: 0 };

  /** The next stage from `y` in direction `dir` (or the one `y` is on, if there is none beyond). */
  const beyond = (y: number, dir: number) => {
    if (dir > 0) return points.find((point) => point > y + 4) ?? points[points.length - 1];
    return [...points].reverse().find((point) => point < y - 4) ?? points[0];
  };

  const lenis = new Lenis({
    lerp: 0.11,
    wheelMultiplier: 1,
    autoRaf: false,
    anchors: false,
    virtualScroll: (data) => {
      if (!data.event.type.includes("wheel") || !staged() || points.length < 2) return true;
      const now = performance.now();
      const gap = now - lastWheel;
      const elapsed = Math.min(0.1, Math.max(0.004, gap / 1000));
      lastWheel = now;
      if (data.deltaY === 0) return true;
      const dir = Math.sign(data.deltaY);
      // A mouse wheel turns in coarse notches; give each a little more travel than a trackpad's fine deltas.
      const notch = Number.isInteger(data.deltaY) && Math.abs(data.deltaY) >= 100;
      const size = Math.abs(data.deltaY) * (notch ? 1.5 : 1);

      // A new gesture: the wheel was quiet, the hand reversed, or (the page already holding at a stage, with
      // only trackpad momentum still trickling in) the deltas suddenly jump: that is a fresh swipe.
      const fresh = gesture.reached > 0 && now - gesture.reached > 260 && size > gesture.level * 2.4 + 10;
      if (gap > 140 || dir !== gesture.dir || fresh) {
        gesture.dir = dir;
        gesture.limit = beyond(lenis.scroll, dir);
        gesture.reached = 0;
        gesture.level = 0;
      }
      gesture.level = gesture.level === 0 ? size : gesture.level * 0.8 + size * 0.2;

      window.clearTimeout(timer);
      timer = window.setTimeout(settle, rest);

      // Follow the hand, no faster than the top speed, and not past the one stage this gesture may reach.
      const most = Math.max(30, topSpeed * window.innerHeight * elapsed);
      const want = lenis.targetScroll + dir * Math.min(size, most);
      const next = dir > 0 ? Math.min(want, gesture.limit) : Math.max(want, gesture.limit);
      data.deltaY = next - lenis.targetScroll;
      if (Math.abs(next - gesture.limit) < 0.5 && gesture.reached === 0) gesture.reached = now;
      if (Math.abs(data.deltaY) < 0.01) {
        // Holding at the stage: what is left of this gesture is momentum, and goes nowhere.
        data.event.preventDefault();
        return false;
      }
      return true;
    },
  });

  /** The hand has let go between two stages: after a pause, glide to the nearer one. */
  function settle() {
    if (!staged() || lenis.isStopped) return;
    const here = lenis.targetScroll;
    if (points.some((point) => Math.abs(point - here) <= 2)) return;
    const below = [...points].reverse().find((point) => point <= here) ?? points[0];
    const above = points.find((point) => point >= here) ?? points[points.length - 1];
    const target = here - below < above - here ? below : above;
    // Anything still to come from this gesture must not start the page moving again.
    gesture.limit = target;
    gesture.reached = performance.now();
    const screens = Math.abs(target - here) / window.innerHeight;
    lenis.scrollTo(target, { duration: 0.9 + screens * 1.5, easing: sineInOut });
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
    lenis.scrollTo(next, { duration: Math.min(9, 1.2 + screens * 0.9), easing: screens > 3 ? cubicInOut : quartOut });
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
