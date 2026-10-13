/**
 * Sound for the page, synthesised with Web Audio: no files to download.
 *
 *  - a quiet drone whose note follows the chapter
 *  - air that rises with scroll speed, and a ratchet that clicks as the page moves
 *  - a tone when a chapter arrives, a rush when the camera dives between places
 *  - the opener: a riser while the core assembles, an impact when it locks
 *
 * Everything is kept low and soft: slow attacks, nothing above a gentle
 * low-pass on the way out, no hard clicks.
 *
 * Sound is off until the visitor switches it on (this is a portfolio: nobody
 * opening it in a meeting should be surprised), and the choice lasts for the
 * visit. Every cue is a no-op until then, and nothing in the page waits for it.
 */

export type SoundState = "off" | "waiting" | "on";

const STORAGE_KEY = "site-sound";
/** Overall level once the engine is running. */
const LEVEL = 0.3;
/** A minor pentatonic, one note per chapter: up through the first six, back down to the end. */
const NOTES = [440, 523.25, 587.33, 659.25, 783.99, 880, 659.25, 587.33, 523.25];
/** Drone roots, an octave or three below. */
const ROOTS = [55, 65.41, 73.42, 82.41, 98, 110, 82.41, 73.42, 65.41];

type Engine = {
  ctx: AudioContext;
  out: GainNode;
  wet: GainNode;
  noise: AudioBuffer;
  drone: { a: OscillatorNode; b: OscillatorNode; gain: GainNode };
  air: { filter: BiquadFilterNode; gain: GainNode };
};

let engine: Engine | null = null;
let wanted = false;
let chapter = 0;
let lastTick = 0;
let travelled = 0;
let greeted = false;
const listeners = new Set<(state: SoundState) => void>();

const state = (): SoundState => (!wanted ? "off" : engine && engine.ctx.state === "running" ? "on" : "waiting");
const announce = () => listeners.forEach((listener) => listener(state()));

function build(): Engine | null {
  const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Context) return null;
  const ctx = new Context();

  const out = ctx.createGain();
  out.gain.value = 0;
  // Everything leaves through a low-pass, so nothing is ever sharp.
  const soften = ctx.createBiquadFilter();
  soften.type = "lowpass";
  soften.frequency.value = 4200;
  soften.Q.value = 0.4;
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -18;
  limiter.ratio.value = 6;
  out.connect(soften).connect(limiter).connect(ctx.destination);

  // One second of white noise serves every whoosh and click.
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const samples = noise.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;

  // A small hall: decaying noise as the impulse response. (Built with a running
  // multiplier rather than a power per sample: this runs inside the visitor's first click.)
  const hall = ctx.createConvolver();
  const length = Math.floor(ctx.sampleRate * 1.7);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  const decay = Math.pow(0.001, 1 / length);
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    let level = 1;
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * level;
      level *= decay;
    }
  }
  hall.buffer = impulse;
  const wet = ctx.createGain();
  wet.gain.value = 0.45;
  wet.connect(hall).connect(out);

  // Drone: two slightly detuned voices under a low filter.
  const droneGain = ctx.createGain();
  droneGain.gain.value = 0.03;
  const droneFilter = ctx.createBiquadFilter();
  droneFilter.type = "lowpass";
  droneFilter.frequency.value = 190;
  droneFilter.connect(droneGain).connect(out);
  droneGain.connect(wet);
  const a = ctx.createOscillator();
  a.type = "triangle";
  a.frequency.value = ROOTS[0];
  const b = ctx.createOscillator();
  b.type = "sine";
  b.frequency.value = ROOTS[0] * 1.5;
  b.detune.value = 7;
  a.connect(droneFilter);
  b.connect(droneFilter);
  a.start();
  b.start();

  // Air: looping noise whose level and brightness follow scroll speed.
  const source = ctx.createBufferSource();
  source.buffer = noise;
  source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 260;
  filter.Q.value = 0.5;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  source.connect(filter).connect(gain).connect(out);
  gain.connect(wet);
  source.start();

  return { ctx, out, wet, noise, drone: { a, b, gain: droneGain }, air: { filter, gain } };
}

/** A sine (or other) voice with an exponential decay. */
function voice(
  e: Engine,
  options: { from: number; to?: number; seconds: number; level: number; type?: OscillatorType; delay?: number; wet?: number; attack?: number },
) {
  const at = e.ctx.currentTime + (options.delay ?? 0);
  const oscillator = e.ctx.createOscillator();
  oscillator.type = options.type ?? "sine";
  oscillator.frequency.setValueAtTime(options.from, at);
  if (options.to) oscillator.frequency.exponentialRampToValueAtTime(options.to, at + options.seconds);
  const gain = e.ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(options.level, at + (options.attack ?? 0.008));
  gain.gain.exponentialRampToValueAtTime(0.0001, at + options.seconds);
  oscillator.connect(gain).connect(e.out);
  if (options.wet) {
    const send = e.ctx.createGain();
    send.gain.value = options.wet;
    gain.connect(send).connect(e.wet);
  }
  oscillator.start(at);
  oscillator.stop(at + options.seconds + 0.05);
}

/** A burst of filtered noise, optionally swept. */
function burst(
  e: Engine,
  options: { from: number; to?: number; seconds: number; level: number; type?: BiquadFilterType; q?: number; delay?: number; wet?: number; attack?: number },
) {
  const at = e.ctx.currentTime + (options.delay ?? 0);
  const source = e.ctx.createBufferSource();
  source.buffer = e.noise;
  source.loop = true;
  const filter = e.ctx.createBiquadFilter();
  filter.type = options.type ?? "bandpass";
  filter.Q.value = options.q ?? 1;
  filter.frequency.setValueAtTime(options.from, at);
  if (options.to) filter.frequency.exponentialRampToValueAtTime(options.to, at + options.seconds);
  const gain = e.ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(options.level, at + (options.attack ?? 0.005));
  gain.gain.exponentialRampToValueAtTime(0.0001, at + options.seconds);
  source.connect(filter).connect(gain).connect(e.out);
  if (options.wet) {
    const send = e.ctx.createGain();
    send.gain.value = options.wet;
    gain.connect(send).connect(e.wet);
  }
  source.start(at, Math.random() * 0.5);
  source.stop(at + options.seconds + 0.05);
}

const live = () => (wanted && engine && engine.ctx.state === "running" ? engine : null);

function fade(level: number, seconds: number) {
  if (!engine) return;
  const now = engine.ctx.currentTime;
  engine.out.gain.cancelScheduledValues(now);
  engine.out.gain.setTargetAtTime(level, now, seconds / 3);
}

export const sound = {
  state,

  subscribe(listener: (state: SoundState) => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  /** Reads this visit's choice. Call once on the client. */
  init() {
    try {
      wanted = window.sessionStorage.getItem(STORAGE_KEY) === "on";
    } catch {
      wanted = false;
    }
    announce();
    // If it was switched on earlier in this visit, the context stays suspended
    // until unlock() is called from a gesture.
    this.unlock();
  },

  /** Call from a click or key press: starts the engine if the visitor wants sound. */
  unlock() {
    if (!wanted) return;
    if (!engine) engine = build();
    if (!engine) return;
    void engine.ctx.resume().then(() => {
      if (!engine || !wanted) return;
      fade(LEVEL, 1.6);
      // One quiet note the first time it starts, so whatever started it is answered.
      if (!greeted) {
        greeted = true;
        voice(engine, { from: NOTES[chapter], seconds: 1.6, level: 0.03, wet: 0.9, attack: 0.08, delay: 0.1 });
      }
      announce();
    });
  },

  /** Switches sound on or off and remembers it. Call from a click. */
  toggle() {
    wanted = !wanted;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, wanted ? "on" : "off");
    } catch {
      // No storage: the choice lasts until the page is reloaded.
    }
    if (wanted) this.unlock();
    else if (engine) {
      fade(0, 0.25);
      const closing = engine;
      window.setTimeout(() => {
        if (!wanted) void closing.ctx.suspend().then(announce);
      }, 400);
    }
    announce();
    return wanted;
  },

  /** Scroll speed in screens per second: a little air, darker than a hiss, that comes and goes slowly. */
  motion(speed: number) {
    const e = live();
    if (!e) return;
    const now = e.ctx.currentTime;
    const amount = Math.min(1, speed / 3);
    e.air.gain.gain.setTargetAtTime(amount * 0.04, now, 0.28);
    e.air.filter.frequency.setTargetAtTime(220 + amount * 620, now, 0.3);
  },

  /** Scroll distance in pixels this frame: now and then, a soft tock. */
  travel(pixels: number) {
    travelled += Math.abs(pixels);
    if (travelled < 280) return;
    travelled = 0;
    const e = live();
    if (!e || e.ctx.currentTime - lastTick < 0.09) return;
    lastTick = e.ctx.currentTime;
    voice(e, { from: 300 + Math.random() * 60, to: 170, seconds: 0.09, level: 0.012, attack: 0.012 });
  },

  /** Something seats itself: a step of a chapter, a part of the core. */
  tick(strength = 1) {
    const e = live();
    if (!e || e.ctx.currentTime - lastTick < 0.05) return;
    lastTick = e.ctx.currentTime;
    voice(e, { from: 480 + Math.random() * 60, to: 260, seconds: 0.11, level: 0.016 * strength, attack: 0.012, wet: 0.5 });
    burst(e, { from: 1100, seconds: 0.05, level: 0.006 * strength, type: "lowpass", attack: 0.01 });
  },

  /** A mouse press: a soft tap. */
  click() {
    const e = live();
    if (!e) return;
    voice(e, { from: 400, to: 190, seconds: 0.08, level: 0.04, attack: 0.006 });
    burst(e, { from: 1500, seconds: 0.03, level: 0.012, type: "lowpass", attack: 0.004 });
  },

  /** The pointer finds something to press. */
  blip() {
    const e = live();
    if (!e) return;
    voice(e, { from: NOTES[chapter], seconds: 0.16, level: 0.007, wet: 0.7, attack: 0.03 });
  },

  /** A new chapter: its note swells in, a soft thump under it, and the drone moves to its root. */
  chapter(index: number) {
    chapter = ((index % NOTES.length) + NOTES.length) % NOTES.length;
    const e = live();
    if (!e) return;
    const now = e.ctx.currentTime;
    e.drone.a.frequency.setTargetAtTime(ROOTS[chapter], now, 0.8);
    e.drone.b.frequency.setTargetAtTime(ROOTS[chapter] * 1.5, now, 0.8);
    voice(e, { from: NOTES[chapter] / 2, seconds: 2.4, level: 0.032, wet: 1, attack: 0.09 });
    voice(e, { from: (NOTES[chapter] / 2) * 1.5, seconds: 1.9, level: 0.014, wet: 1, attack: 0.12, delay: 0.08 });
    voice(e, { from: 82, to: 44, seconds: 0.4, level: 0.05, attack: 0.03 });
  },

  /** The camera passes from one place to the next: a breath, falling. */
  dive() {
    const e = live();
    if (!e) return;
    burst(e, { from: 1300, to: 150, seconds: 1.1, level: 0.045, q: 0.9, wet: 0.6, attack: 0.3 });
    voice(e, { from: 200, to: 58, seconds: 1.0, level: 0.03, attack: 0.25 });
  },

  /** Opener: a rise that lasts as long as the core takes to assemble. */
  riser(seconds: number) {
    const e = live();
    if (!e) return;
    burst(e, { from: 150, to: 2200, seconds, level: 0.03, q: 1.2, attack: seconds * 0.9, wet: 0.5 });
    voice(e, { from: 55, to: 150, seconds, level: 0.025, type: "triangle", attack: seconds * 0.92 });
  },

  /** Opener: the core locks. A low bloom and a chord, not a bang. */
  impact() {
    const e = live();
    if (!e) return;
    voice(e, { from: 98, to: 38, seconds: 1.5, level: 0.16, attack: 0.02 });
    burst(e, { from: 500, to: 110, seconds: 0.8, level: 0.04, type: "lowpass", wet: 0.7, attack: 0.03 });
    [220, 329.63, 493.88, 659.25].forEach((note, index) => voice(e, { from: note, seconds: 3, level: 0.022, wet: 1, attack: 0.06, delay: 0.03 + index * 0.06 }));
  },

  /** Opener: the wordmark fills in. A few soft pips. */
  glitch() {
    const e = live();
    if (!e) return;
    for (let i = 0; i < 4; i++) {
      voice(e, { from: 500 + Math.random() * 700, seconds: 0.09, level: 0.008, attack: 0.015, wet: 0.8, delay: 0.05 + i * 0.09 + Math.random() * 0.03 });
    }
  },
};
