import { Matrix4 } from "three";

/**
 * DOM blocks that stand in the 3D scene.
 *
 * A block (a heading and a line of copy, say) is given a spot in front of the
 * camera for the stage it belongs to, pinned there to something in the world
 * (its anchor), and from then on drawn in perspective wherever the world
 * takes it: the block's own pixel grid is carried through anchor, view and
 * projection into one CSS `matrix3d`. The type stays real DOM: crisp,
 * selectable, accessible.
 *
 * CSS the element needs while placed:
 *   position: fixed; top: 0; left: 0; transform-origin: 0 0; will-change: transform, opacity;
 * and it must not sit inside any ancestor that has a transform, or "fixed"
 * stops meaning the viewport. To cut a block off at the edge of its section
 * (so a wipe uncovers it instead of fading it), put `clip-path: inset(0)` on
 * a non-transformed ancestor that has the section's box.
 */
export type Plane = {
  el: HTMLElement;
  /** Centre of the block, in its anchor's space. */
  local: Matrix4;
  /** World units per CSS pixel, and the block's size in CSS pixels. */
  scale: number;
  wide: number;
  tall: number;
};

const a = new Matrix4();
const b = new Matrix4();

/**
 * Pins a block. `restAnchor` is the anchor's world matrix when the page rests
 * on the block's stage (build it from that stage's pose, without sway);
 * `at` is where the block's centre should be then, in world units relative to
 * the point the camera looks at (x right, y up, z towards the camera);
 * `worldWidth` is how wide it should be there.
 */
export function pin(el: HTMLElement, restAnchor: Matrix4, at: [number, number, number], worldWidth: number): Plane {
  return {
    el,
    local: restAnchor.clone().invert().multiply(new Matrix4().makeTranslation(at[0], at[1], at[2])),
    scale: worldWidth / el.offsetWidth,
    wide: el.offsetWidth,
    tall: el.offsetHeight,
  };
}

/**
 * Draws a block where its anchor now is. Call after the scene's matrices are
 * up to date for the frame. Returns the distance to its nearest corner, or
 * null if it has reached the lens (hide it then; fade it a little before).
 */
export function stand(plane: Plane, anchorWorld: Matrix4, viewProjection: Matrix4, width: number, height: number): number | null {
  // Pixels (origin top-left, y down) -> block centre -> anchor -> world -> clip.
  a.multiplyMatrices(anchorWorld, plane.local);
  a.multiply(b.makeTranslation((-plane.wide * plane.scale) / 2, (plane.tall * plane.scale) / 2, 0));
  a.multiply(b.makeScale(plane.scale, -plane.scale, 1));
  const e = b.multiplyMatrices(viewProjection, a).elements;

  const depth = (x: number, y: number) => e[3] * x + e[7] * y + e[15];
  const nearest = Math.min(depth(0, 0), depth(plane.wide, 0), depth(0, plane.tall), depth(plane.wide, plane.tall));
  if (nearest <= 0.7) return null;

  const k = 1 / e[15];
  const X = (c: number) => ((e[c * 4] + e[c * 4 + 3]) * 0.5 * width * k).toPrecision(7);
  const Y = (c: number) => ((e[c * 4 + 3] - e[c * 4 + 1]) * 0.5 * height * k).toPrecision(7);
  const W = (c: number) => (e[c * 4 + 3] * k).toPrecision(7);
  plane.el.style.transform = `matrix3d(${X(0)},${Y(0)},0,${W(0)},${X(1)},${Y(1)},0,${W(1)},0,0,1,0,${X(3)},${Y(3)},0,${W(3)})`;
  return nearest;
}
