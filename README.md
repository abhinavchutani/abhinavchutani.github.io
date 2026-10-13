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

Nine chapters, ten resting stages, in the order of what matters most to him now: what he studies,
what he has led, what he has built, the making behind it, and then the person. Scroll is the
timeline: one screen of scroll per move, and the camera goes as fast as the hand does. Every move
is a single gesture, and neighbours never share an axis.

| # | Chapter | On the card | Place | How the camera gets there |
| --- | --- | --- | --- | --- |
| 00 | Origin | name, one line | a thread of light, one strand per discipline, in a nebula | the opener: a flight down a tunnel of streaks |
| 01 | Markets | Economics · Monte Carlo · Blockchain | a newspaper page: candlesticks, 180 simulated paths, their histogram, a podium (FairBench, third place) | forwards down the thread to the point of light it comes from, which is the last price on the chart, where the paths fan out |
| 02 | Stage | Leadership · Public Speaking · Symposium | an auditorium from beside the lectern: curtains, a gilded balcony, 3,500 lights | eyes up from the page: it is lying on the lectern, and there is the hall |
| 03 | Projects | Orbital Guardian · FairBench · Engram · Shravan Doot · Terra Mitra | Earth's limb, debris, the satellite, its detector and its net | up: one tilt of the head, then straight through the oculus in the ceiling to the stars |
| 04 | Machine | Robotics · Techne | an FLL table and robot on a blueprint | down: the sea turns blueprint blue and its grid closes up into the sheet |
| 05 | Code | Syntax · Web & App Design · Design | a desk at night: Python on two monitors, a browser window, a brand board | backwards: the blueprint is a drawing open on the main monitor, and the camera pulls out of the screen |
| 06 | Sound | Strings · Musicality | a museum gallery: damask, five paintings of musicians, a violin in a glass case, a drum kit behind a rope | sideways to the right, into the room next door, which stands open like a film set |
| 07 | Mind | Reading · Philosophy | a stair of 50 books past a colonnade | forwards and round to the left, through the tall doorway at the end of the gallery's far wall |
| 07 | Mind | Journaling · Fountain Pens · Art & Illustration · Discipline | the desk by the window: journal, a pen that writes, a tray of pens, sketchbook, iron | sideways to the left along the floor |
| 08 | Contact | email, LinkedIn, where | Helsinki across the harbour under the aurora; every discipline as one constellation | forwards over the desk and out through the open window |

Nothing is cut, wiped or cross-faded. While the camera is between two places both are drawn, each
in its own light, into one depth buffer, so the next place is seen through the door, the screen or
the window before the camera goes through it.

## Where things live

| | |
| --- | --- |
| `src/content.ts` | **All copy,** in order of importance. Chapters, stages, skills, projects, contact. Edit text here and nowhere else. |
| `src/render.ts` | Turns the content into HTML at build time (see `vite.config.ts`), so the shipped page is real markup. |
| `src/stage/table.ts` | The storyboard as numbers: where each place sits relative to the one before, the camera's waypoints, each place's light. |
| `src/stage/handover.ts` | Camera routes between places: one smooth line through a few waypoints, or a move across scales (down the thread to a point on the page, the fall to Earth, the look up from the page). |
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
- **The camera has weight.** Scroll says where it should be; the camera (its position, its
  direction and its scale, together) follows with one damping. Stopped at a stage it settles on
  the composed frame. Carried through a stage at speed it never stops there: it sweeps round from
  the line it came in on to the line it leaves on, so there is no halt and no sudden change of
  axis. For that moment three places are drawn: the one behind, the one being passed and the one
  ahead.
- **Something answers every bit of scroll.** The easing never reaches a standstill, things in every
  place turn with distance scrolled, and the world leans towards the pointer.
- **One gesture, one stage.** A swipe with all its momentum reaches the next stage and stops there,
  so the copy can be read. What is left of the swipe is not thrown away: the camera leans in on it
  and springs back. A fresh push, or a steady scroll held for a beat, moves on.
- **It never rests between two stages, but it is in no hurry.** A move can be scrubbed a notch at a
  time, with pauses. Only when the wheel has been quiet for half a second does the page finish the
  move it was making, gently, in the direction of travel (or fall back, if it was under a third of
  the way).
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
| This site, two rounds ago | 324 | 9.0% | 8.8% |
| This site, now | 600 | 1.4% | 1.0% |

**Frame times.** Production build, Chromium on the machine's GPU (Metal), 1440 × 900 at device
pixel ratio 2, once headless and once in a real window, with other applications running (load
average about 5). A frame is "late" over 22 ms.

| Scenario | Headless: frames | late | Real window: frames | late |
| --- | --- | --- | --- | --- |
| Opener | 342 | 0 | 339 | 0 |
| Scrub down through every move | 1,879 | 1 (33 ms, on the first frame) | 1,458 | 0 |
| Scrub back up, faster | 1,777 | 0 | 1,248 | 0 |

The two moves that used to stutter were the two dearest to draw: the hero, and the middle of the
fall to Earth, which with the frame-rate limit off cost a whole 60 Hz frame on its own. The
nebula is now a baked picture, the planet reads its noise from a small 3D texture and works
nothing out inside the patch of sea that becomes the drawing, and the gallery's walls use a
cheaper material; the fall now peaks at under 10 ms a frame.

**Gestures**, with wheel events timed inside the page: flicks from gentle to very hard, each with
a long tail of momentum, all stopped on the next stage (and one upwards on the stage above);
letting go 7% into a move fell back, 32% in carried on; nine mouse-wheel notches 350 ms apart
scrubbed a move 100 px at a time and were never pulled back; a slow scrub of 400 px moved the
page 353 px (the rest is the smoothing still catching up).

Also checked from captures: all ten stages and the half-way frame of every move at 1200 × 750,
the cards at 1440 × 790, and a steady scroll carried through three stages without stopping.
Reduced motion, no WebGL, no JavaScript and phone width (430 × 900) were each rendered and looked
at. **Not checked:** the feel on a real trackpad, the sound by ear, a real phone. These numbers
are this machine on one evening, and it was often too busy to measure at all: open the page with
`?fps` to see what your own browser does.

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
   colour per chapter. Third place at the Hanken Quantum × Finance Hackathon added.
2. Second cut: stepped scrolling, a different screen-space transition per hand-over. → Scrubbed
   scroll, one continuous world with real camera travel, a flight-through opener, the violin in a
   museum case. Ventures removed; Engram listed as a project.
3. Third cut: two screens of scroll per move, multi-part camera paths. → One screen per move, every
   move a single gesture with measured pacing, the copy on cards made of each place's own material,
   one contact finale.
4. Fourth cut: the order was the order things were built in, and the camera stopped at each stage
   before setting off on a new axis. → Chapters in his order of importance (from his CV and the
   profile he wrote), the projects together on one card, fountain pens on the desk, five new moves
   to join the new neighbours, and a camera with weight that is carried through a stage.
5. No portrait, no phone number. Every fact on the page comes from his previous site, his CV or
   his own profile.
