# Brief

The prompt this site is built against. It is edited whenever review changes the direction, so
the site and its brief do not drift apart.

## What it is

Abhinav Chutani's portfolio, as one page and one scroll: every discipline from his previous
site, squeezed into ten resting stages, each a place the camera travels to. No portrait. Every
fact comes from the previous site or from Abhinav directly; nothing is invented.

## The reference, studied

Abhinav named his own Aalto AI redesign (running locally) as the bar for smoothness, for how
scrolling relates to animation, for camera angles and world, and for finish. It was captured at
every stage and half-way between, its source was read, and its motion was measured (see
"Measured against the reference"). What it does:

1. **One screen of scroll per stage, everywhere.** Each step is one eased move from one pose to
   the next (a quintic ease after a short rest), then damped. Nothing has waypoints.
2. **One gesture, one stage.** Wheel speed is capped; a swipe with all its momentum goes to the
   next stage and stops; when the wheel rests between two stages the page finishes the move in
   the direction of travel.
3. **Something answers every bit of scroll.** Wheels and rings turn with distance scrolled, so
   the scene moves even while a pose rests. The subject leans to the pointer.
4. **The subject fills the frame and breaks it.** Each step is a new shot of something large:
   a different angle, distance or axis.
5. **Between places both are in sight.** A dive never hides behind a dark or blank frame.
6. **Finish.** Copy sits on solid cards with a rule, an index and corner ticks; the frame has
   brackets, a ruler and a readout; type has three voices (heavy caps, mono labels, one serif).

What is carried over is that structure and that restraint. The subject matter is not: every
place, card and colour here comes from the topic it shows.

## The journey

| # | Chapter | Place | The move that gets there (one gesture each) | Card |
| --- | --- | --- | --- | --- |
| 00 | Origin | a thread of light, one strand per discipline | opener: a flight down a tunnel of streaks | the name |
| 01 | Sound | a museum gallery: violin in a glass case, drum kit, five paintings | forwards down the thread, in through a gilt doorway standing at its end | museum label |
| 02 | Code | the study next door: screens of Python, a browser, a brand board | sideways to the right, through the wall | editor window |
| 03 | Orbit | Earth's limb, debris, the satellite and its net | in through the monitor; the Earth comes up as the camera arrives | head-up display |
| 04 | Machine | an FLL table and robot on a blueprint | straight down: the sea below turns blueprint blue, its grid closing up | title block |
| 05 | Markets | a newspaper page: candles, simulated paths, the podium | down the desk, off the blueprint on to the page | newspaper column |
| 06 | Stage | an auditorium from beside the lectern | eyes up from the page: it is on the lectern | programme |
| 07 | Mind | a stair of fifty books past a colonnade | up through the oculus, turning with the stair | index card |
| 07 | Mind | the desk by the window: journal, pen, sketchbook | sideways to the left | index card |
| 08 | Contact | Helsinki across the water under the aurora; every discipline one constellation | forwards, out through the open window | a wire |

## Motion rules

- Scroll is the timeline, one screen per move. The camera goes as fast as the hand does.
- A move is one gesture: at most a few waypoints, taken on one smooth line for position and one
  for direction, so the camera never stops or changes its mind part-way.
- Each move is paced by measurement: it is scrubbed at an even rate, the change in the picture
  is measured at every step, and the move is re-timed so that equal scroll gives about equal
  change (`src/stage/pace.ts`).
- Easing never reaches a standstill: at a stage the pose is still creeping.
- Things in every place turn with distance scrolled. The world leans to the pointer.
- One gesture reaches the next stage and no further. What is left of it pushes the camera in a
  little, so the hand never moves without an answer.
- Nothing pops. Both places are drawn for the whole of a move; a place entered through a door is
  drawn only inside that door until the camera is through it; the far plane holds a place a
  hundred times larger than the one beside it.

## Fallbacks

Reduced motion: no opener, native scroll, each stage shown at rest. No WebGL or no JavaScript:
the same content as an ordinary page. Touch and narrow screens: native scrolling that snaps near
a stage, the copy as a block at the foot.

## Review rounds

| # | Abhinav said | It meant | What changed |
| --- | --- | --- | --- |
| 1 | "20 is too much. The environments should be that of the thing itself. More playing around with background colours." | Too many stops; abstract line-worlds do not land. | Fewer stages; modelled places; a colour world per chapter. Third place at Ultrahack added. |
| 2 | "Remove the Ventures part." "Every transition should be unique." "Sometimes I overscroll." "Make this abhinavchutani.github.io." | Variety of axis; rests that hold; publish. | Ventures removed; one gesture, one stage; a pull request on the site's repository. |
| 3 | "I want to feel that my scrolling is leading to these animations." "Many are just transitions, not cinematography; the best is reading to journaling, because you are actually moving into that space." | Scrub, do not trigger. Travel, do not wipe. | Scroll scrubs the camera; one continuous world with real camera travel between places. |
| 4 | "The first animation is horrendous: random carpet angles, the wall suddenly appears." "Going into robotics is choppy: a random blueprint on Earth." "Leadership brings a whole big table." "I'm on the violin too long." "There should not be a single moment where I'm moving and nothing is happening." "Nothing in the last two; the final should just be my information." "Take the smoothness, the scroll-to-animation relation, the camera angles and the finish from the Aalto site; the design and vibe from the topic on screen." | Multi-part moves read as chop; things clipped at the far plane popped; two screens per move with a hold felt dead; the copy looked unfinished. | Every move rebuilt as one gesture at one screen of scroll, with smooth turns and measured pacing. The doorway stands alone in space with the gallery inside it. The fall lands on sea that turns to blueprint. The page is on the lectern from the first frame of looking up. Scroll and pointer move every place; a push at a stage leans the camera in. One contact finale. Cards made of each place's own material; a framed window. |

## Measured against the reference

How much the picture changes per step of an even scrub (mean absolute difference between
successive frames, 192 × 120 greyscale, copy and chrome hidden), on both sites with the same tool:

| | change per screen of scroll | steps with over 2.5× the usual change (pops) | steps with under 30% of it (lulls) |
| --- | --- | --- | --- |
| Aalto AI (reference) | 475 | 1.5% | 8.6% |
| This site, round 3 | 324 | 9.0% | 8.8% |
| This site, now | 656 | 2.1% | 1.7% |
