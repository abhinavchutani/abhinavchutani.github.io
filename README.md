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

Ten chapters, fifteen resting stages, in the order of what matters most to him now: what he
studies, what he has led, what he has built, the making behind it, and then the person. Scroll is
the timeline: one screen of scroll per move, and the camera goes as fast as the hand does. Every
move is a single gesture, and neighbours never share an axis.

| # | Chapter | On the card | Place | How the camera gets there |
| --- | --- | --- | --- | --- |
| 00 | Origin | name, one line; a cue to scroll and one to turn the sound on | a thread of light, one strand per discipline, in a nebula | the opener: a flight down a tunnel of streaks |
| 01 | Markets | Economics · Monte Carlo Options · Blockchain | the floor of an exchange at night: a quote board the width of the far wall, a ticker, trading posts ringed with screens, the bell on its balcony. Over the middle post, a month of candles and 180 simulated paths with their histogram; beside it a chain of blocks, the newest still being mined | down: the hall is under the nebula, and the camera sinks to it through a skylight whose two doors swing open into the hall as it comes |
| 02 | Stage | Leadership · Public Speaking · Symposium | an auditorium from beside the lectern: curtains, a gilded balcony, 3,500 lights | forwards: the bronze doors under the board swing open on the wings of a stage, and the camera walks through to the lectern |
| 03 | Projects | Orbital Guardian | Earth's limb, debris, the satellite, its detector and its net | up: one tilt of the head to the opening in the ceiling, whose doors swing up on the stars, then straight through |
| 03 | Projects | FairBench · Engram · Shravan Doot · Terra Mitra, one each | the same orbit: each project a thing on its own ring, in a pool of its own colour (portfolios in the box their constraints draw with a qubit beside it; documents round a question; glasses with what is said arriving as rings and leaving as words on the lens; a probe in soil, pinging) | sideways, four times: the camera tracks along the row, one project to a stage, each brought up close |
| 04 | Travel | Travel | mountains at first light, from the air: a valley, a lake, a tent and its fire on the shore, the high range with the sun coming up behind it | down from orbit: the land is a patch of the planet at 1/166 the size, and the camera falls to it, levelling off as it comes |
| 05 | Machine | Robotics · Techne | an FLL table and robot on a blueprint | down again: the lake turns into the blue of a drawing, and the camera goes on down into it |
| 06 | Code | Syntax · Web & App Design · Design | a desk at night: Python on two monitors, MarksMaxxing in a browser window, a brand board. The picture breaks into blocks at the edges of the frame | backwards: the blueprint is a drawing open on the main monitor, and the camera pulls out of the screen |
| 07 | Sound | Strings · Musicality | a museum gallery: damask, five paintings of musicians, a violin in a glass case, a drum kit behind a rope | sideways to the right, into the room next door, which stands open like a film set |
| 08 | Mind | Reading · Philosophy | a stair of 50 books past a colonnade, by day | forwards and round to the left: the gallery's double doors open as the camera makes for them |
| 08 | Mind | Journaling · Fountain Pens · Art & Illustration · Discipline | the same room at night, by one candle: the desk at the window, a journal, a pen that writes, a tray of pens, a sketchbook, iron | sideways to the left along the floor, as the daylight goes down to the candle |
| 09 | Contact | email, LinkedIn, where | Helsinki across the harbour at night, under the aurora; every discipline as one constellation | forwards over the desk and out through the open window |

Nothing is cut, wiped or cross-faded. While the camera is between two places both are drawn, each
in its own light, into one depth buffer, so the next place is seen through the door, the screen or
the window before the camera goes through it.

## Where things live

| | |
| --- | --- |
| `src/content.ts` | **All copy,** in order of importance. Chapters, stages, skills, projects, contact. Edit text here and nowhere else. |
| `src/render.ts` | Turns the content into HTML at build time (see `vite.config.ts`), so the shipped page is real markup. |
| `src/stage/table.ts` | The storyboard as numbers: where each place sits relative to the one before, the camera's waypoints, each place's light. |
| `src/stage/handover.ts` | Camera routes between places: one smooth line through a few waypoints, or a move across scales (the fall from orbit to the mountains, the dive into the lake). |
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
- **A jump from the menu goes behind doors.** A link more than one stage away is not scrolled (a whole
  journey at speed is a blur of other places): two panelled doors close over the page in the
  destination's colours with its name on them, the page is moved behind them, and they open on the
  new place. A link to the next stage just glides there.
- **Motion blur.** Each frame, the point that was in the middle of the last one is followed to
  where it has got to, and the final pass smears the picture along that path (one frame's worth,
  capped). A fall, a rise or a pan streaks; a camera at rest, or one leaning to the pointer, stays
  sharp.
- **The first screen says what to do:** a cue to scroll, and a switch for the sound, both gone once
  the page moves on.
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
| This site, round 6 | 576 | 4.3% | 3.6% |
| This site, now (round 7: fifteen stages, motion blur on) | 518 | 7.7% | 1.4% |

Inside each move the pacing holds: the busiest step of any move is at most 2.4 times that move's
own middle, except the way out through the window to Helsinki (3.2, as the frame passes the
window's edge). The "pops" column counts steps against the middle of the whole journey, and it has
risen because the moves differ more from one another than they did: the descent into the
exchange, the walk on to the stage and the climb to orbit change the picture three or four times
as much per step as the track along the projects, which goes by against dark space.

**Frame times.** Production build, headless Chromium on the machine's GPU (Metal), 1440 × 900 at
device pixel ratio 2, with other applications running (load average 3 to 6). A frame is "late"
over 22 ms.

| Scenario | Frames | Late |
| --- | --- | --- |
| Opener | 340 | 0 |
| Scrub down through every move | 3,777 | 15 (0.40%): single frames of 33 to 83 ms, five of them on the way down into the exchange |
| Scrub back up, faster | 2,789 | 11 (0.39%): one of 133 ms going back from the reading room into the gallery, the rest 33 to 83 ms |

**Not measured this round:** a real window. A run in one needs the display awake; the night this
was built it was asleep. Open the page with `?fps` to see what your own browser does.

**Gestures**, with wheel events timed inside the page, on this build: flicks from gentle to very
hard, each with a long tail of momentum, all stopped on the next stage (and one upwards on the
stage above); letting go 7% into a move fell back, 32% in carried on; nine mouse-wheel notches
350 ms apart scrubbed a move 100 px at a time and were never pulled back; a slow scrub of 400 px
moved the page 352 px.

Also checked from captures: all fifteen stages at 1440 × 900; frames along every new move (the
skylight, the ceiling doors, the track along the projects, the fall to the mountains, the dive into
the lake, the way out of the window); a menu jump with the doors at five moments; the descent while
scrolling, for the motion blur; phone width (430 × 900); reduced motion, no WebGL and no JavaScript.
**Not checked:** the feel on a real trackpad, the sound by ear, a real phone.

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
6. Sixth cut: the four projects shared one card; the mountains stood beside Helsinki, which is at
   sea level; the menu's links scrolled the whole journey at speed; the reading room's colonnade
   showed through the window and around the camera on the way out. → Each project has its own stage.
   Travel is its own place, on the way down from orbit, and the fall from there goes on into a lake
   that turns into the blueprint. Menu jumps go behind doors. Motion blur. The skylight in the
   exchange and the opening in the auditorium's ceiling have doors that open as the camera comes
   (he liked the doors). A pane that writes depth and no colour keeps the window to Helsinki alone.
   The chrome stands clear of the frame; the first screen cues scrolling and sound.
7. No portrait, no phone number. Every fact on the page comes from his previous site, his CV or
   his own profile.
