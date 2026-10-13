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
    scroller = createScroll({ stops });
    scroller.lenis.stop();
  }
  const glide = (y: number) => {
    if (!scroller) return window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
    const screens = Math.abs(y - window.scrollY) / window.innerHeight;
    // Through every chapter on the way, never a jump.
    scroller.lenis.scrollTo(y, { duration: Math.min(3.4, 1.1 + screens * 0.2), easing: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) });
  };
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
    sound.click();
    glide(y);
  });

  // ---- chrome ----
  const rail = [...document.querySelectorAll<HTMLElement>("[data-rail]")];
  const readoutIndex = $("[data-readout-index]");
  const readoutName = $("[data-readout-name]");
  const readoutStage = $("[data-readout-stage]");
  const progress = $("[data-progress]");
  let place = -1;

  function arrive(index: number, at: number) {
    if (readoutStage) readoutStage.textContent = `${two(index + 1)} / ${two(stage ? stage.stops().length : 20)}`;
    if (at === place) {
      sound.tick();
      return;
    }
    place = at;
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
    sound.motion(Math.abs(moved) / window.innerHeight / Math.max(0.001, deltaMs / 1000));
    sound.travel(moved);
  });
  gsap.ticker.add(stage.frame);

  // ---- sound: off until asked for ----
  const soundButton = $<HTMLButtonElement>("[data-sound]");
  const label = (state: SoundState) => {
    if (!soundButton) return;
    soundButton.textContent = state === "on" ? "Sound on" : state === "waiting" ? "Sound: click" : "Sound off";
    soundButton.setAttribute("aria-pressed", String(state !== "off"));
  };
  sound.subscribe(label);
  sound.init();
  soundButton?.addEventListener("click", () => {
    sound.toggle();
    sound.click();
  });
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
