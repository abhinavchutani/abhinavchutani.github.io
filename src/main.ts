import "./style.css";
import gsap from "gsap";
import { chapters } from "./content";
import { createScroll } from "./scroll";
import { sound, type SoundState } from "./sound";
import type { Stage } from "./stage/stage";

/**
 * The page's controller. The markup is already in the document (render.ts
 * wrote it at build time); this starts the 3D stage behind it, hands scroll
 * to Lenis, keeps the chrome in step, and plays the opener.
 */

const html = document.documentElement;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const two = (n: number) => String(n).padStart(2, "0");
const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector);

// The read-out under the opener. While the stage is being built (the real loading) it creeps up to a
// third; the flight takes it the rest of the way.
let shown = 0;
let loaded = false;
function readout(percent: number) {
  shown = percent;
  const count = $("[data-count]");
  const bar = $("[data-bar]");
  if (count) count.textContent = String(Math.round(percent)).padStart(3, "0");
  if (bar) bar.style.transform = `scaleX(${(percent / 100).toFixed(3)})`;
}
function creep() {
  if (loaded) return;
  readout(shown + (34 - shown) * 0.035);
  requestAnimationFrame(creep);
}

async function boot() {
  const canvas = $<HTMLCanvasElement>("#stage");
  if (!canvas) return;
  creep();

  let scroller: ReturnType<typeof createScroll> | null = null;
  let stage: Stage;
  try {
    // three.js stays behind a dynamic import, so the text paints first.
    const { createStage } = await import("./stage/stage");
    stage = await createStage(canvas, {
      reduced,
      scroll: () => scroller?.lenis.scroll ?? window.scrollY,
      onStage: arrive,
      onDive: () => sound.dive(),
    });
  } catch (error) {
    // No WebGL (or a lost context): the plain layout is the page.
    console.warn("3D stage unavailable, showing the plain page.", error);
    html.classList.add("no-stage");
    html.dataset.intro = "done";
    return;
  }

  // ---- scroll ----
  const stops = () => stage.stops();
  // Touch screens keep native scrolling (CSS snaps it to the stages); so does reduced motion.
  const touch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  if (!reduced && !touch) {
    scroller = createScroll({ stops, onPush: (screens) => stage.nudge(screens) });
    scroller.lenis.stop();
  }
  const glide = (y: number) => {
    if (!scroller) return window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
    const screens = Math.abs(y - window.scrollY) / window.innerHeight;
    scroller.lenis.scrollTo(y, { duration: Math.min(2.2, 1.1 + screens * 0.4), easing: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) });
  };

  // A jump of more than one stage is not scrolled (a whole journey at speed is a blur of other places). A drop
  // falls from what was clicked, lands, and spreads into a pool of the destination's colour that fills the
  // screen, with its name in it; the page is moved under the pool; then the pool draws back into a drop, which
  // falls away, and the new place is there.
  const drop = $("[data-drop]");
  const dropName = $("[data-drop-name]");
  const dropIndex = $("[data-drop-index]");
  const later = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
  const frames = (n: number) => new Promise<void>((resolve) => {
    const step = () => (--n <= 0 ? resolve() : requestAnimationFrame(step));
    requestAnimationFrame(step);
  });
  let jumping = false;
  async function go(y: number, from: Element | null) {
    const all = stops();
    const here = all.reduce((best, stop, i) => (Math.abs(stop - window.scrollY) < Math.abs(all[best] - window.scrollY) ? i : best), 0);
    const there = all.reduce((best, stop, i) => (Math.abs(stop - y) < Math.abs(all[best] - y) ? i : best), 0);
    if (!drop || !scroller || reduced || Math.abs(there - here) <= 1) {
      sound.click();
      return glide(y);
    }
    if (jumping) return;
    jumping = true;
    const chapter = chapters[chapterOf(there)];
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Where the drop starts (what was clicked) and where it lands (straight below, well down the screen).
    const box = from?.getBoundingClientRect();
    const x = box ? box.left + box.width / 2 : vw / 2;
    const y0 = box ? box.top + box.height / 2 : vh * 0.3;
    const y1 = Math.min(vh * 0.86, Math.max(y0 + vh * 0.24, vh * 0.56));
    // The pool must reach the furthest corner from where it lands.
    const reach = 2 * Math.hypot(Math.max(x, vw - x), Math.max(y1, vh - y1)) * 1.06;
    drop.style.cssText = `--ground:${chapter.ground};--tint:${chapter.accent};--x:${x}px;--y0:${y0}px;--y1:${y1}px;--reach:${reach}px`;
    if (dropName) dropName.textContent = chapter.name;
    if (dropIndex) dropIndex.textContent = two(chapters.indexOf(chapter));
    drop.dataset.state = "fall";
    sound.click();
    await later(430);
    drop.dataset.state = "spread";
    sound.dive();
    await later(640);
    drop.dataset.state = "full";
    scroller.lenis.scrollTo(y, { immediate: true, force: true });
    stage.snap();
    await frames(4);
    await later(260);
    drop.dataset.state = "drain";
    await later(600);
    drop.dataset.state = "drip";
    await later(420);
    delete drop.dataset.state;
    drop.style.cssText = "";
    jumping = false;
  }
  /** The chapter a stage belongs to, from the stages' own markup. */
  function chapterOf(stageIndex: number) {
    const sign = document.querySelector<HTMLElement>(`.sign[data-stage="${stageIndex}"]`);
    const id = sign?.closest<HTMLElement>("section[data-chapter]")?.dataset.chapter;
    return Math.max(0, chapters.findIndex((chapter) => chapter.id === id));
  }

  document.addEventListener("click", (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute("href")!.slice(1);
    const all = stops();
    let y: number | undefined;
    if (id === "contact") y = all[all.length - 1];
    else {
      const section = document.getElementById(id);
      if (section?.matches("section[data-chapter]")) y = Math.round(section.getBoundingClientRect().top + window.scrollY);
    }
    if (y === undefined) return;
    event.preventDefault();
    void go(y, link);
  });

  // ---- chrome ----
  const rail = [...document.querySelectorAll<HTMLElement>("[data-rail]")];
  const readoutIndex = $("[data-readout-index]");
  const readoutName = $("[data-readout-name]");
  const readoutStage = $("[data-readout-stage]");
  const progress = $("[data-progress]");
  const ticks = [...document.querySelectorAll<HTMLElement>("[data-tick]")];
  const frame = $("[data-frame]");
  let place = -1;
  let swap = 0;

  /** The frame belongs to the place: its ornament, its colour. */
  function dress(at: number) {
    if (frame) frame.dataset.vibe = chapters[at].id;
  }

  const hint = $("[data-hint]");
  function arrive(index: number, at: number) {
    hint?.toggleAttribute("data-away", index !== 0);
    if (readoutStage) readoutStage.textContent = `${two(index + 1)} / ${two(ticks.length)}`;
    ticks.forEach((tick, i) => tick.toggleAttribute("data-live", i === index));
    if (at === place) {
      sound.tick();
      return;
    }
    const first = place < 0;
    place = at;
    // The frame blinks out, changes its dress, and comes back.
    window.clearTimeout(swap);
    if (first || reduced) dress(at);
    else {
      frame?.setAttribute("data-swap", "");
      swap = window.setTimeout(() => {
        dress(at);
        frame?.removeAttribute("data-swap");
      }, 170);
    }
    rail.forEach((item, i) => item.toggleAttribute("data-live", i === at));
    if (readoutIndex) readoutIndex.textContent = two(at);
    if (readoutName) readoutName.textContent = chapters[at].name;
    sound.chapter(at);
  }
  arrive(0, 0);

  let lastScroll = window.scrollY;
  gsap.ticker.add((_time, deltaMs) => {
    const y = scroller?.lenis.scroll ?? window.scrollY;
    const limit = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (progress) progress.style.transform = `scaleX(${Math.min(1, y / limit).toFixed(4)})`;
    const moved = y - lastScroll;
    lastScroll = y;
    // The frame's ticks run with the page.
    if (moved !== 0) frame?.style.setProperty("--y", String(Math.round(y)));
    sound.motion(Math.abs(moved) / window.innerHeight / Math.max(0.001, deltaMs / 1000));
    sound.travel(moved);
  });
  gsap.ticker.add(stage.frame);

  // ---- `?fps`: how this browser is running the page. Click the readout to start counting again. ----
  // It counts the display's own refreshes (the timestamps requestAnimationFrame is given); a frame is late
  // when it took more than one and a half of this display's usual interval.
  const gauge = new URLSearchParams(window.location.search).has("fps") ? $("[data-gauge]") : null;
  if (gauge) {
    const frames = { last: 0, count: 0, late: 0, worst: 0, since: 0, recent: 0, usual: 16.7 };
    gauge.hidden = false;
    gauge.addEventListener("click", () => Object.assign(frames, { count: 0, late: 0, worst: 0 }));
    const tick = (now: number) => {
      const took = now - frames.last;
      frames.last = now;
      if (took > 0 && took < 250) {
        frames.usual += (Math.min(took, 34) - frames.usual) * (took < frames.usual ? 0.2 : 0.002);
        frames.count++;
        frames.recent++;
        if (took > Math.max(20, frames.usual * 1.5)) frames.late++;
        if (took > frames.worst) frames.worst = took;
      }
      if (now - frames.since > 500) {
        const fps = Math.round((frames.recent * 1000) / (now - frames.since));
        frames.since = now;
        frames.recent = 0;
        gauge.textContent = `${fps} fps · ${frames.late} late of ${frames.count} (${((frames.late / Math.max(1, frames.count)) * 100).toFixed(1)}%) · worst ${Math.round(frames.worst)} ms · click to reset`;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ---- sound: off until asked for ----
  const soundButton = $<HTMLButtonElement>("[data-sound]");
  const soundHint = $<HTMLButtonElement>("[data-sound-hint]");
  const label = (state: SoundState) => {
    if (soundHint) {
      soundHint.setAttribute("aria-pressed", String(state === "on"));
      soundHint.querySelector("span")!.textContent = state === "on" ? "Sound on" : state === "waiting" ? "Sound: click" : "Turn sound on";
    }
    if (!soundButton) return;
    soundButton.textContent = state === "on" ? "Sound on" : state === "waiting" ? "Sound: click" : "Sound off";
    soundButton.setAttribute("aria-pressed", String(state !== "off"));
  };
  sound.subscribe(label);
  sound.init();
  for (const button of [soundButton, soundHint]) {
    button?.addEventListener("click", () => {
      sound.toggle();
      sound.click();
    });
  }
  const unlock = () => sound.unlock();
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);

  // ---- opener: a flight through space down the thread, then the name ----
  html.classList.add("has-stage");
  loaded = true;
  const finish = () => {
    stage.state.intro = 1;
    stage.state.rush = 0;
    stage.state.ready = true;
    html.dataset.intro = "done";
    scroller?.lenis.start();
  };
  if (reduced || window.scrollY > 8) {
    finish();
    return;
  }
  await document.fonts.ready;
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  const seconds = 4.8;
  const from = shown;
  const timeline = gsap.timeline({ onComplete: finish });
  timeline.to(stage.state, {
    intro: 1,
    duration: seconds,
    ease: "none",
    onUpdate: () => {
      const t = stage.state.intro;
      // The frame streaks while the flight is at speed.
      stage.state.rush = 0.55 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.08)), 1.5);
      readout(from + (100 - from) * Math.min(1, t * 1.25));
    },
  });
  // The lock: the flight is nearly over, and the name comes up.
  timeline.call(
    () => {
      stage.state.ready = true;
      html.dataset.intro = "lock";
      sound.impact();
    },
    [],
    seconds * 0.8,
  );
  sound.riser(seconds * 0.8);

  const hurry = () => timeline.timeScale(7);
  const onKey = (event: KeyboardEvent) => event.key === "Escape" && hurry();
  window.addEventListener("keydown", onKey);
  window.addEventListener("wheel", hurry, { passive: true, once: true });
  window.addEventListener("touchmove", hurry, { passive: true, once: true });
  $("[data-skip]")?.addEventListener("click", hurry);
  timeline.eventCallback("onComplete", () => {
    window.removeEventListener("keydown", onKey);
    finish();
  });
}

void boot();
