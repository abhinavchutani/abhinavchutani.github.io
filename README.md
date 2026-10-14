# Abhinav Chutani — portfolio

One page, one scroll, one continuous world. Under the name the camera sinks through the roof of an
exchange, and from there never cuts: every section is a place, and every place is reached by
travelling to it, one screen of scroll at a time.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-checks, then writes dist/
npm run preview   # serves dist/ on http://localhost:4173
```

## The journey

Nine chapters, twelve resting stages, in the order of what matters most to him now: what he
studies, what he has led, what he has built, the making behind it, and then the person. Scroll is
the timeline: one screen of scroll per move, and the camera goes as fast as the hand does. Every
move is a single gesture, and neighbours never share an axis.

| # | Chapter | On the card | Place | How the camera gets there |
| --- | --- | --- | --- | --- |
| 00 | Origin | name, one line | a thread of light, one strand per discipline, in a nebula | the opener: a flight down a tunnel of streaks |
| 01 | Markets | Economics · Monte Carlo Options · Blockchain | the floor of an exchange at night: a quote board the width of the far wall, a ticker, trading posts ringed with screens, the bell on its balcony. Over the middle post, a month of candles and 180 simulated paths with their histogram; beside it a chain of blocks, the newest still being mined | down: the hall is under the nebula, and the camera sinks through its skylit roof, past the board, to the floor |
| 02 | Stage | Leadership · Public Speaking · Symposium | an auditorium from beside the lectern: curtains, a gilded balcony, 3,500 lights | forwards: the bronze doors under the board swing open on the wings of a stage, and the camera walks through to the lectern |
| 03 | Projects | Orbital Guardian | Earth's limb, debris, the satellite, its detector and its net | up: one tilt of the head, then straight through the oculus in the ceiling to the stars |
| 03 | Projects | FairBench · Engram · Shravan Doot · Terra Mitra | the same orbit, each project a thing on its own ring: portfolios in the box their constraints draw with a qubit beside it, documents round a question, glasses with their board on the arm, a probe in soil | sideways: the satellite drops back and the four come in round the frame |
| 04 | Machine | Robotics · Techne | an FLL table and robot on a blueprint | down: the sea turns blueprint blue and its grid closes up into the sheet |
| 05 | Code | Syntax · Web & App Design · Design | a desk at night: Python on two monitors, MarksMaxxing in a browser window, a brand board. The picture breaks into blocks at the edges of the frame | backwards: the blueprint is a drawing open on the main monitor, and the camera pulls out of the screen |
| 06 | Sound | Strings · Musicality | a museum gallery: damask, five paintings of musicians, a violin in a glass case, a drum kit behind a rope | sideways to the right, into the room next door, which stands open like a film set |
| 07 | Mind | Reading · Philosophy | a stair of 50 books past a colonnade, by day | forwards and round to the left: the gallery's double doors open as the camera makes for them |
| 07 | Mind | Journaling · Fountain Pens · Art & Illustration · Discipline | the same room at night, by one candle: the desk at the window, a journal, a pen that writes, a tray of pens, a sketchbook, iron | sideways to the left along the floor, as the daylight goes down to the candle |
| 08 | Beyond | Travel | mountains under the aurora, pines, a tent and its fire by the water | forwards over the desk and out through the open window (it is night out there too) |
| 08 | Beyond | email, LinkedIn, where | Helsinki across the harbour; every discipline as one constellation | a turn of the head along the shore |

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
| `public/tex/` | Photographed surfaces (walnut, limestone, plaster, paper grain), recompressed small; `kit.ts` tiles them on to floors, walls, desks, pages. The cards that are paper wear the same grain. |
| `src/ui/` | The corner pieces of the frame, one small SVG per chapter. |
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
- **The frame is dressed for the place.** A fixed edge and four corner pieces change with the
  chapter: an axis with ticks that run with the scroll on the exchange floor, a programme's gold rule
  on the stage, head-up brackets in orbit, registration marks on the blueprint, blocks at the desk, a
  gilt picture frame in the gallery, a double rule with volutes in the library. The pointer is the
  browser's own (custom pointers were tried in round 6 and taken out again).
- **One finishing pass** does tone mapping, FXAA, a speed-linked colour split, the rush blur and
  grain. A place can ask it for an edge of its own: at the Code desk the picture is sampled in
  blocks towards the frame, in three bands that double in size, and the band widens while the page
  moves. The lit pass renders to a pixel budget (about 2.7 million) with no MSAA. A governor trades
  resolution for frame rate if the display's own refreshes keep being missed.
- **Warm-up.** Every shader is compiled and every place drawn once, with culling off, before the
  canvas is shown, so nothing is built mid-scroll.
- **Sound** is synthesised (Web Audio, no files) and **off until switched on**, top right.
- Arrow keys / space step one stage; Home and End go to the ends; in-page links glide.
- In a short window everything set in `rem` comes down with the window's height, so a card never
  runs off the foot.
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
| This site, round 3 | 324 | 9.0% | 8.8% |
| This site, round 5 | 600 | 1.4% | 1.0% |
| This site, now (round 6: twelve stages, three new moves) | 576 | 4.3% | 3.6% |

Inside each move the pacing holds (the busiest step of any move is at most 2.8 times that move's
own middle). The two percentages are up on the round before because the moves now differ more
from each other: the walk through the doors and the descent past the board change the picture
about four times as much per step as the quietest move, where the four projects come in against
dark space. The flash this round's first measurement found (the camera left the desk straight
through the candle flame, which whited out the frame for a step) is gone: the candle now stands
clear of the way out.

**Frame times.** Production build, headless Chromium on the machine's GPU (Metal), 1440 × 900 at
device pixel ratio 2, with other applications running (load average about 5). A frame is "late"
over 22 ms.

| Scenario | Frames | Late |
| --- | --- | --- |
| Opener | 341 | 0 |
| Scrub down through every move | 2,811 | 8 (0.28%): 133 ms on the very first frame, one of 51 ms, six of 33 ms |
| Scrub back up, faster | 2,218 | 0 |

A second run a few minutes later, with the load average at 14 to 28, had 3% of frames late and two
long stalls; that run measured the machine. **A real-window run was not possible this round**: it
was made at night with the display asleep, and a window that is not being shown is given no
frames. The round before, the same build path measured 0 late frames of 3,045 in a real window;
this round's scene is heavier in the Markets hall, so that number should be taken again with
`?fps` on a screen that is awake.

**Gestures**, with wheel events timed inside the page, on this build: flicks from gentle to very
hard, each with a long tail of momentum, all stopped on the next stage (and one upwards on the
stage above); letting go 7% into a move fell back, 32% in carried on; nine mouse-wheel notches
350 ms apart scrubbed a move 100 px at a time and were never pulled back; a slow scrub of 400 px
moved the page 354 px (the rest is the smoothing still catching up).

Also checked from captures: all twelve stages at 1440 × 900, frames along the three new moves and
the two that were reported (study to gallery, desk to window), four stages in a short window
(960 × 600) and three in a very wide one (2400 × 900). Reduced motion, no WebGL, no JavaScript and
phone width (430 × 900) were each rendered and looked at. **Not checked:** the feel on a real
trackpad, the sound by ear, a real phone, a real window this round. These numbers are this machine
on one night: open the page with `?fps` to see what your own browser does.

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

The surfaces are CC0 photographs: black walnut veneer, marble slabs and painted plaster from Poly
Haven (polyhaven.com), and the paper grain from ambientCG (ambientcg.com, Paper005). Each is cropped
and recompressed to between 20 and 35 KB.

The code on the monitors in chapter 05 is set dressing written for the scene. It shows what the
projects do; it is not their source. The figures on the exchange's board and ticker are set
dressing too (no company's price), and so are the bars on the MarksMaxxing page.

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
5. Fifth cut: Markets was a page of trading graphs reached by a hard zoom, and left by a harder one;
   the study showed in the gallery doorway; the desk was daylit while outside it was night. →
   Markets is the floor of an exchange, entered by sinking through its roof and left by walking
   through its doors on to the stage. The gallery has doors, which open as the camera reaches them.
   The desk is a dark room with one candle. The four other projects stand in orbit as things, the
   two finance projects on the exchange floor, MarksMaxxing on a screen at the desk; mountains for
   travel. Photographed surfaces, a frame dressed for each place, blocks at the edge of the Code
   frame. The lean-in on a push is halved and the rush blur eased.
6. No portrait, no phone number. Every fact on the page comes from his previous site, his CV or
   his own profile.
