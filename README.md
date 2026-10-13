# Abhinav Chutani — portfolio

One page, one scroll, one continuous world. A thread of light leaves the hero; the camera follows
it into a museum, and from there never cuts: every section is a place, and every place is reached
by travelling to it.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-checks, then writes dist/
npm run preview   # serves dist/ on http://localhost:4173
```

## The journey

Nine chapters, eleven resting stages. Scroll is the timeline: two screens of scroll per move, and
the camera goes as fast as the hand does.

| # | Chapter | On the sign | Place | How the camera gets there |
| --- | --- | --- | --- | --- |
| 00 | Origin | name, one line | a thread of light, one strand per discipline, in a nebula | the opener: a flight down a tunnel of streaks |
| 01 | Sound | Strings · Musicality | a museum gallery: damask, five paintings of musicians, a violin in a glass case, a drum kit behind a rope | down the thread to the light at its end, which is a doorway; in, looking down at the carpet, then through the room in a curve |
| 02 | Code | Syntax · Web & App Design · Design | the study next door: Python on two monitors, a browser window, a brand board | a turn to the right and through the door in the gallery's side wall |
| 03 | Orbit | Orbital Guardian · Innovation | Earth's limb, debris, the satellite, its detector and its net | in through the main monitor: the code clears off the glass and space is behind it |
| 04 | Machine | Robotics · Techne | an FLL table and robot on a blueprint | tip forward and fall: 166× closer, down to a drawing board lying on the ground |
| 05 | Markets | Economics + projects (Quantum × Finance 3rd place, Engram, Monte Carlo, Blockchain) | a newspaper page: candlesticks, 180 simulated paths, their histogram, a podium | track right across the desk, off the blueprint and on to the page beside it |
| 06 | Stage | Leadership · Public Speaking · Symposium | an auditorium from the lectern: curtains, a gilded balcony, 3,500 lights | pull back: the page is lying on the lectern. Look up, and there is the hall |
| 07 | Mind | Reading · Philosophy | a stair of 50 books past a colonnade | straight up through the opening in the ceiling, and up the middle of the stair |
| 07 | Mind | Journaling · Art & Illustration · Discipline | the desk by the window: journal, a pen that writes, sketchbook, iron | track right to left along the floor |
| 08 | Now | how it connects, four numbers | Helsinki across the harbour under the aurora; every discipline as one constellation | forward over the desk and out through the open window |
| 08 | Now | what I am building, contact | the same, closer | an arc towards the cathedral |

Nothing is cut, wiped or cross-faded. While the camera is between two places both are drawn, each
in its own light, into one depth buffer, so the next place is seen through the door, the screen or
the window before the camera goes through it.

## Where things live

| | |
| --- | --- |
| `src/content.ts` | **All copy.** Chapters, stages, skills, projects, the "now" list, contact. Edit text here and nowhere else. |
| `src/render.ts` | Turns the content into HTML at build time (see `vite.config.ts`), so the shipped page is real markup. |
| `src/stage/table.ts` | The storyboard as numbers: where each place sits relative to the one before, the camera's waypoints, each place's light. |
| `src/stage/handover.ts` | Camera routes between places: waypoint paths, and scale-linked moves (the fall to Earth, the pull-back from the page). |
| `src/stage/places/*.ts` | One file per place. Geometry is procedural; textures are drawn on canvas. |
| `src/stage/stage.ts` | Renderer, passes, the frame loop, copy standing in the scene, labels that follow things. |
| `src/scroll.ts` · `src/sound.ts` · `src/main.ts` | Scrolling (Lenis) · synthesised sound · the page controller and opener. |
| `public/art/` | Five paintings, used on the gallery walls (see Credits). |
| `src/style.css` | Two layouts: plain (no JS / no WebGL) and staged. |

To change a fact: `content.ts`. To change a move: that place's `arrive` in `table.ts` (`into` is
where the place sits seen from the one before; `via` are camera waypoints in the place's own
coordinates). To change a colour world: the chapter's `ground`/`accent` in `content.ts` and its
`look` in `table.ts`.

## How it behaves

- **Scrolling is scrubbing.** The page follows the wheel or trackpad directly, so the camera moves
  at the speed of the hand. It does not play a move on its own.
- **It comes to rest on a stage.** One gesture can reach the next stage but not pass it: trackpad
  momentum is absorbed there, so the copy can be read. If the hand lets go between two stages the
  page waits a third of a second and glides to the nearer one.
- **Copy stands in the scene.** Each sign is a DOM block placed with a `matrix3d` built from the
  camera every frame, so it is in the room as the camera comes in.
- **One finishing pass** does tone mapping, FXAA, a speed-linked colour split, the rush blur and
  grain. The lit pass renders to a pixel budget (about 2.7 million) with no MSAA, and a governor
  trades resolution for frame rate if a run of frames comes in late.
- **Warm-up.** Every shader is compiled and every place drawn once, with culling off, before the
  canvas is shown, so nothing is built mid-scroll.
- **Sound** is synthesised (Web Audio, no files) and **off until switched on**, top right.
- Arrow keys / space step one stage; Home and End go to the ends; in-page links glide.

## Measured

Production build, headless Chromium on the machine's GPU (Metal), 1440 × 900 at device pixel
ratio 2, nothing else rendering. A frame is "late" over 22 ms.

| Scenario | Frames | Late | p99 | Worst |
| --- | --- | --- | --- | --- |
| Opener | 341 | 0 | 17.6 ms | 17.7 ms |
| Scrub down through every move | 4,179 | 4 (0.10%) | 17.7 ms | 50.6 ms |
| Scrub back up, faster | 3,811 | 9 (0.24%) | 17.7 ms | 250.9 ms (once, on the first frame of the run) |

Scroll behaviour, same run: a hard flick with a long momentum tail stopped on the next stage;
letting go a quarter of the way into a move glided back, three quarters glided on.

Also checked from captures: all eleven stages, and several frames inside every move, at
1440 × 900; ten frames at 430 × 900. **Not checked:** the feel on a real trackpad, the sound by
ear, a real phone. A headless run is necessary, not sufficient.

## Fallbacks

- **Reduced motion:** no opener, native scrolling, no travel between places; each stage is shown at rest.
- **No WebGL:** `html.no-stage`; every chapter becomes an ordinary block on its own ground colour.
- **No JavaScript:** the same plain page, straight from the built HTML.
- **Touch and narrow screens:** native scrolling that snaps near a stage; the same places with the
  subject centred above and the copy as a block at the foot.

## Deploy

`dist/` is a static site with relative asset paths. `.github/workflows/pages.yml` builds and
publishes it to GitHub Pages on every push to `main` (the repository's Pages source must be
"GitHub Actions").

## Credits

The paintings in the gallery are public-domain works from The Metropolitan Museum of Art's Open
Access collection (CC0): Caravaggio, *The Musicians* (1597); Valentin de Boulogne, *Lute Player*
(c. 1625–26); Laurent de La Hyre, *Allegory of Music* (1649); Johannes Vermeer, *Young Woman with
a Lute* (c. 1662–63); Frans Hals, *Boy with a Lute* (c. 1625).

The code on the monitors in chapter 02 is set dressing written for the scene. It shows what the
projects do; it is not their source.

## Decisions from review

1. First cut: 20 stages, abstract line-worlds on black. Review: too many stops; environments
   should be of the thing itself, with more play in colour and setting. → Fewer stages, modelled
   places, a ground colour per chapter. Added third place at Ultrahack's Quantum × Finance.
2. Second cut: stepped scrolling and a different screen-space transition per hand-over. Review:
   scrolling should scrub, not trigger; transitions should be cinematography, like the track from
   the books to the desk; the Earth popped out; the hero's small objects and the lettering on the
   violin looked poor; the opener should be bigger; the finale had no shoreline. → This version:
   scrubbed scroll, one continuous world with real camera travel, a flight-through opener, the
   violin in a museum case, a quay with reflections. Ventures removed; Engram listed as a project.
3. No portrait. Every fact on the page comes from the previous site or from Abhinav directly.
