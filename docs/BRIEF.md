# Brief

The prompt this site is built against. It is edited whenever review changes the direction, so
the site and its brief do not drift apart.

## What it is

Abhinav Chutani's portfolio, as one page and one scroll: every discipline from his previous
site and his CV, squeezed into fifteen resting stages, each a place the camera travels to. No portrait. Every
fact comes from the previous site, his CV or Abhinav directly; nothing is invented.

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

In his order of importance (from his CV and the profile he wrote for LinkedIn): what he studies
now, what he has led, what he has built, the making behind it, and then the person.

| # | Chapter | Place | The move that gets there (one gesture each) | Card | Frame |
| --- | --- | --- | --- | --- | --- |
| 00 | Origin | a thread of light, one strand per discipline | opener: a flight down a tunnel of streaks | the name, a cue to scroll, a sound switch | brackets |
| 01 | Markets | the floor of an exchange at night: quote board, ticker, trading posts, the bell; candles and simulated paths over the middle post; a chain of blocks | down, through a skylight whose doors swing open into the hall | a terminal: black glass, amber | an axis whose ticks run with the scroll |
| 02 | Stage | an auditorium from beside the lectern | forwards, through the bronze doors under the board, which open on the wings | programme | a programme's gold rule |
| 03 | Projects | Earth's limb, debris, the satellite and its net | up: one tilt to the opening in the ceiling, whose doors swing up, then straight through to the stars | head-up display | head-up brackets |
| 03 | Projects ×4 | the same orbit: FairBench, Engram, Shravan Doot, Terra Mitra, each on its ring in its own colour | sideways along the row, one project to a stage | head-up display in the project's colour | head-up brackets |
| 04 | Travel | mountains at first light, from the air: valley, lake, tent and fire, the range | down from orbit to a patch of the planet, levelling off | a dusk card | brackets |
| 05 | Machine | an FLL table and robot on a blueprint | down into the lake, which turns into the drawing's blue | title block | registration marks |
| 06 | Code | a desk at night: Python, MarksMaxxing in a browser, a brand board | backwards, out of the drawing open on the main monitor | editor window | blocks; the picture itself breaks into blocks at the edge |
| 07 | Sound | a museum gallery: violin in a glass case, drum kit, five paintings | sideways to the right, into the room next door, open like a set | museum label on paper | a gilt picture frame |
| 08 | Mind | a stair of fifty books past a colonnade, by day | forwards and round to the left; the gallery's doors open as the camera comes | index card on paper | a double rule with volutes |
| 08 | Mind | the same room at night: the desk by the window, one candle | sideways to the left, as the light goes down | index card on paper | a double rule with volutes |
| 09 | Contact | Helsinki across the water at night (at sea level: no mountains); every discipline one constellation | forwards, out through the open window | a wire | brackets |

## Motion rules

- Scroll is the timeline, one screen per move. The camera goes as fast as the hand does.
- A move is one gesture: at most a few waypoints, taken on one smooth line for position and one
  for direction, so the camera never stops or changes its mind part-way.
- Each move is paced by measurement: it is scrubbed at an even rate, the change in the picture
  is measured at every step, and the move is re-timed so that equal scroll gives about equal
  change (`src/stage/pace.ts`).
- The camera has weight: its position, direction and scale follow where scroll says they should be
  with one damping (as the reference damps its whole pose). At rest it settles on the composed
  frame; carried through a stage it sweeps from one line on to the next without stopping or
  switching axis.
- Easing never reaches a standstill: at a stage the pose is still creeping.
- Things in every place turn with distance scrolled. The world leans to the pointer.
- One gesture reaches the next stage and no further. What is left of it pushes the camera in a
  little, so the hand never moves without an answer.
- A place the camera will enter through a door keeps the door shut until the camera makes for it,
  so nothing of the place behind shows in the frame of the one in front.
- Where two places meet the light agrees: it is night at the desk because it is night outside its
  window.
- Doors: a move that goes into a new space goes through something that opens as the camera comes (a
  skylight, doors under the board, doors in a ceiling, the gallery's doors, a window). He likes the
  doors; a menu jump uses them too.
- The world is where it is: the mountains are not beside Helsinki, which is at sea level.
- No light stands in the camera's way: flying through a flame whites the frame out for a moment,
  and that reads as a flash.
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
| 5 | "The transition between reading and leadership is too clanky and big." "Add Engram, Terra Mitra, Shravan Doot, FairBench into the projects." "Have my stuff shown in my priority list." "Add fountain pens: this website is about my personality and not just my CV." "Why can I see the museum door on the hero?" "The camera should be like an object which accelerates and slows down with my scroll: it comes into a section, jolts, and then suddenly goes to the axis of right." "No sudden direction shifts. There must always be something on my screen which reacts with my scroll wheel." | Order by importance; the corkscrew was too much; a stop at every stage followed by a new axis reads as a jolt. | Chapters reordered (Markets, Stage, Projects, Machine, Code, Sound, Mind, Contact) with content from his CV and profile; projects together on one card; fountain pens as a discipline and a tray on the desk. Five new moves for the new neighbours, the door gone from the hero. The camera's pose itself is damped, so it is carried through a stage on one line. A push against a holding stage leans the camera in and keeps things turning. |
| 6 | "Hero to economics is still jerky, the zooming is too strong." "I don't like the trading graphs and one, two, three; maybe Wall Street." "The zoom out to the podium is too extreme and too sudden." "From Syntax to Strings I can see the code in the doorway, and the floor glitches." "At the journaling desk it is daytime, outside it is night: make it a dark room with a candle." "Add the other topics: more 3D structures." "More of the projects in my CV; this doesn't feel like me enough. A mountain for my travels." "Download more textures: the paper, the desk, everything." "Edges and borders of the places: Renaissance, pixelated on Syntax." A custom pointer per place was asked for, built, and then: "just remove the cursors." | A scale change reads as a zoom, and he wants less of it. A chart is a picture of a market, not a place. Light has to agree across a doorway. He wants to see his projects as things. | Markets rebuilt as the floor of an exchange, entered by sinking through its roof and left on foot through its doors. Doors on the gallery; the two floors no longer share a plane. The desk at night by one candle. Four projects as exhibits in orbit, the blockchain and the Monte Carlo fan labelled on the exchange floor, MarksMaxxing on a screen. Mountains, a tent and a Travel stage. CC0 photographs on floors, walls, desks and pages, and paper grain on the paper cards. A frame dressed per chapter and a block edge at the Code desk. The lean-in on a push halved; the rush blur eased. Remaining CV honours added to the copy. Custom pointers removed. |
| 7 | "Make the four projects more prominent: each its own section, focused on that product." "On the first transition the upper wall of the exchange shows, which looks weird: add motion blur." "Give the buttons padding from the border; they are fighting for space." "Menu links should not do this glitchy fast scroll; they should be a seamless transition." "Add a scroll and a sound cue to the hero." "After journaling the pillars and floor of the reading room bug out of the window." "Helsinki is at sea level: put the mountains somewhere else, perhaps after space." "I like the door opening; take inspiration from it in other animations." | One card for four things buried them. A fast scroll through every place reads as a glitch. Geography matters to him. The door is the move he likes best. | Four project stages along a row in orbit. Travel moved to just after space, with the fall from orbit landing on it and a new dive into a lake that becomes the blueprint; no mountains in Helsinki. Menu jumps behind doors. Camera motion blur. Doors on the exchange's skylight and the auditorium's ceiling. A depth-only pane in the window. Chrome inset; hero cues. |

## Measured against the reference

How much the picture changes per step of an even scrub (mean absolute difference between
successive frames, 192 × 120 greyscale, copy and chrome hidden), on both sites with the same tool:

| | change per screen of scroll | steps with over 2.5× the usual change (pops) | steps with under 30% of it (lulls) |
| --- | --- | --- | --- |
| Aalto AI (reference) | 475 | 1.5% | 8.6% |
| This site, round 3 | 324 | 9.0% | 8.8% |
| This site, round 4 | 656 | 2.1% | 1.7% |
| This site, round 5 (new order, new moves) | 600 | 1.4% | 1.0% |
| This site, round 6 (twelve stages, three new moves) | 576 | 4.3% | 3.6% |
| This site, now (round 7: fifteen stages, motion blur) | 518 | 7.7% | 1.4% |

Inside each move the pacing holds; the percentages rose because the moves now differ more from one
another (see the README). The first measurement of this round found a flash: the camera left the
desk through the candle flame. The candle was moved clear of the way out.
