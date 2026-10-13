# Abhinav Chutani — portfolio

One page, one scroll, one continuous world. A thread of light leaves the hero; the camera follows
it into a museum, and from there never cuts: every section is a place, and every place is reached
by travelling to it, one screen of scroll at a time.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-checks, then writes dist/
npm run preview   # serves dist/ on http://localhost:4173
```

## The journey

Nine chapters, ten resting stages. Scroll is the timeline: one screen of scroll per move, and the
camera goes as fast as the hand does. Every move is a single gesture, and no two are along the
same axis.

| # | Chapter | On the card | Place | How the camera gets there |
| --- | --- | --- | --- | --- |
| 00 | Origin | name, one line | a thread of light, one strand per discipline, in a nebula | the opener: a flight down a tunnel of streaks |
| 01 | Sound | Strings · Musicality | a museum gallery: damask, five paintings of musicians, a violin in a glass case, a drum kit behind a rope | forwards down the thread and in through a gilt doorway standing at its end, with the gallery inside it |
| 02 | Code | Syntax · Web & App Design · Design | the study next door: Python on two monitors, a browser window, a brand board | sideways to the right, through the wall, without turning |
| 03 | Orbit | Orbital Guardian · Innovation | Earth's limb, debris, the satellite, its detector and its net | in through the main monitor; the Earth comes up from under the frame as the camera arrives |
| 04 | Machine | Robotics · Techne | an FLL table and robot on a blueprint | straight down: the sea turns blueprint blue and its grid closes up into the sheet |
| 05 | Markets | Economics + projects (Quantum × Finance 3rd place, Engram, Monte Carlo, Blockchain) | a newspaper page: candlesticks, 180 simulated paths, their histogram, a podium | down the desk, off the blueprint and on to the page lying across its foot |
| 06 | Stage | Leadership · Public Speaking · Symposium | an auditorium from beside the lectern: curtains, a gilded balcony, 3,500 lights | eyes up from the page: it is lying on the lectern, and there is the hall |
| 07 | Mind | Reading · Philosophy | a stair of 50 books past a colonnade | up through the opening in the ceiling, turning with the stair |
| 07 | Mind | Journaling · Art & Illustration · Discipline | the desk by the window: journal, a pen that writes, sketchbook, iron | sideways to the left along the floor |
| 08 | Contact | email, LinkedIn, where | Helsinki across the harbour under the aurora; every discipline as one constellation | forwards over the desk and out through the open window |

Nothing is cut, wiped or cross-faded. While the camera is between two places both are drawn, each
in its own light, into one depth buffer, so the next place is seen through the door, the screen or
the window before the camera goes through it.

## Where things live

| | |
| --- | --- |
| `src/content.ts` | **All copy.** Chapters, stages, skills, projects, contact. Edit text here and nowhere else. |
| `src/render.ts` | Turns the content into HTML at build time (see `vite.config.ts`), so the shipped page is real markup. |
| `src/stage/table.ts` | The storyboard as numbers: where each place sits relative to the one before, the camera's waypoints, each place's light. |
| `src/stage/handover.ts` | Camera routes between places: one smooth line through a few waypoints, or a move across scales (the fall to Earth, the look up from the page). |
| `src/stage/pace.ts` | How each move is timed against scroll. **Measured, not hand-written**: see "Pacing" below. |
| `src/stage/places/*.ts` | One file per place. Geometry is procedural; textures are drawn on canvas. |
| `src/stage/stage.ts` | Renderer, passes, the frame loop, cards standing in the scene, labels that follow things. |
| `src/scroll.ts` · `src/sound.ts` · `src/main.ts` | Scrolling (Lenis) · synthesised sound · the page controller and opener. |
| `public/art/` | Five paintings, used on the gallery walls (see Credits). |
| `src/style.css` | Two layouts: plain (no JS / no WebGL) and staged. Each chapter's card is styled from its own place. |
| `docs/BRIEF.md` | The brief the site is built against: the reference study, the journey, the motion rules, every review round. |

To change a fact: `content.ts`. To change a move: that place's `arrive` in `table.ts` (`into` is
where the place sits seen from the one before; `via` are camera waypoints in the place's own
coordinates), then re-measure its pacing. To change a colour world: the chapter's
`ground`/`accent` in `content.ts` and its `look` in `table.ts`.

## How it behaves

- **Scrolling is scrubbing.** The page follows the wheel or trackpad directly, so the camera moves
  at the speed of the hand. One screen of scroll is one move, everywhere.
- **Something answers every bit of scroll.** The easing never reaches a standstill, things in every
  place turn with distance scrolled, and the world leans towards the pointer.
- **One gesture, one stage.** A swipe with all its momentum reaches the next stage and stops there,
  so the copy can be read. What is left of the swipe is not thrown away: the camera leans in on it
  and springs back. A fresh push, or a steady scroll held for a beat, moves on.
- **It never rests between two stages.** When the wheel has been quiet for a fifth of a second the
  page finishes the move it was making, gently, in the direction of travel (or falls back, if it
  had barely set off).
- **Copy stands in the scene.** Each card is a DOM block placed with a `matrix3d` built from the
  camera every frame, so it is in the room as the camera comes in.
- **One finishing pass** does tone mapping, FXAA, a speed-linked colour split, the rush blur and
  grain. The lit pass renders to a pixel budget (about 2.7 million) with no MSAA. A governor trades
  resolution for frame rate if the display's own refreshes keep being missed.
- **Warm-up.** Every shader is compiled and every place drawn once, with culling off, before the
  canvas is shown, so nothing is built mid-scroll.
- **Sound** is synthesised (Web Audio, no files) and **off until switched on**, top right.
- Arrow keys / space step one stage; Home and End go to the ends; in-page links glide.
- Add `?fps` to the address for a readout of this browser's own frame times.

## Pacing

A camera path does not change the picture evenly: a long approach through empty space changes
little, and the moment of going through a doorway changes everything. So each move is timed by
measurement. A tool scrubs the move at an even rate along its path (`?raw` turns easing, pacing
and damping off for this), takes a small greyscale frame at each step and measures how much it
differs from the one before. From that it writes a table of knots into `src/stage/pace.ts` that
slows the camera where the picture changes fast and hurries it where it changes little, within
bounds. After changing a route, measure it again.

## Measured

Two things are measured: how the picture answers scroll, and whether frames arrive on time.

**Motion per scroll**, against the reference Abhinav named (his Aalto AI site), with the same
tool on both: an even scrub, a 192 × 120 greyscale frame at each step, copy and chrome hidden.

| | change per screen of scroll | steps with over 2.5× the usual change (pops) | steps with under 30% of it (lulls) |
| --- | --- | --- | --- |
| Aalto AI (reference) | 475 | 1.5% | 8.6% |
| This site, previous round | 324 | 9.0% | 8.8% |
| This site, now | 656 | 2.1% | 1.7% |

**Frame times.** Production build, Chromium on the machine's GPU (Metal), 1440 × 900 at device
pixel ratio 2, once headless and once in a real window, with other applications running (load
average about 7). A frame is "late" over 22 ms.

| Scenario | Headless: frames | late | Real window: frames | late |
| --- | --- | --- | --- | --- |
| Opener | 343 | 0 | 341 | 4 (33 ms each) |
| Scrub down through every move | 1,917 | 6 (0.31%) | 1,371 | 1 (51 ms, on the first frame) |
| Scrub back up, faster | 1,780 | 0 | 1,340 | 0 |

Five of the six late headless frames came together (33 to 35 ms each) as the rise from the hall to
the library began; they did not recur on the way back up or in the real window.

The two moves that used to stutter were the two dearest to draw. With the frame-rate limit off,
on a loaded machine, the hero cost 14.8 ms a frame and the middle of the fall to Earth 17.0 ms:
over a 60 Hz frame. After baking the nebula, reading the planet's noise from a texture and
simplifying the gallery's walls they cost 9.6 ms and 11.9 ms under the same load; everything else
is between 3 and 9 ms.

**Gestures**, with wheel events timed inside the page: flicks from gentle to very hard, each with
a long tail of momentum, all stopped on the next stage (and one upwards on the stage above);
letting go 7% into a move fell back, 32% in carried on; a slow scrub of 400 px moved the page
357 px (the rest is the smoothing still catching up).

Also checked from captures: all ten stages, and four frames inside every move, at 1440 × 900.
Reduced motion, no WebGL, no JavaScript and phone width (430 × 900) were each rendered and looked
at. **Not checked:** the feel on a real trackpad, the sound by ear, a real phone. These numbers
are this machine on one evening: open the page with `?fps` to see what your own browser does.

## Fallbacks

- **Reduced motion:** no opener, native scrolling, no travel between places; each stage is shown at rest.
- **No WebGL:** `html.no-stage`; every chapter becomes an ordinary block on its own ground colour.
- **No JavaScript:** the same plain page, straight from the built HTML.
- **Touch and narrow screens:** native scrolling that snaps near a stage; the same places with the
  subject centred above and the copy as a block at the foot.

## Deploy

`dist/` is a static site with relative asset paths. `.github/workflows/pages.yml` builds and
publishes it to GitHub Pages on every push to `main` (the repository's Pages source must be
"GitHub Actions"). The live site is published from `abhinavchutani/abhinavchutani.github.io`.

## Credits

The paintings in the gallery are public-domain works from The Metropolitan Museum of Art's Open
Access collection (CC0): Caravaggio, *The Musicians* (1597); Valentin de Boulogne, *Lute Player*
(c. 1625–26); Laurent de La Hyre, *Allegory of Music* (1649); Johannes Vermeer, *Young Woman with
a Lute* (c. 1662–63); Frans Hals, *Boy with a Lute* (c. 1625).

The code on the monitors in chapter 02 is set dressing written for the scene. It shows what the
projects do; it is not their source.

## Decisions from review

Every round, with what was said and what changed, is in `docs/BRIEF.md`. In short:

1. First cut: 20 stages, abstract line-worlds on black. → Fewer stages, modelled places, a ground
   colour per chapter. Third place at Ultrahack's Quantum × Finance added.
2. Second cut: stepped scrolling, a different screen-space transition per hand-over. → Scrubbed
   scroll, one continuous world with real camera travel, a flight-through opener, the violin in a
   museum case. Ventures removed; Engram listed as a project.
3. Third cut: two screens of scroll per move, multi-part camera paths. → One screen per move, every
   move a single gesture with measured pacing, the copy on cards made of each place's own material,
   one contact finale, and a frame rate that holds on the two moves that used to drop it.
4. No portrait. Every fact on the page comes from the previous site or from Abhinav directly.
