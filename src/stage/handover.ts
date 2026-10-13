import * as THREE from "three";

/**
 * Getting from one place to the next.
 *
 * The places are not separate scenes that get cut or wiped between: they
 * are parts of one world. The gallery has a door in its side wall and the
 * study is through it; the study's monitor is a window onto orbit; the
 * drawing board lies on the Earth below; the newspaper is the sheet beside
 * the blueprint and, further on, the page on the lectern; the library is
 * the floor above the auditorium, and Helsinki is outside its window.
 *
 * So a hand-over is a camera move and nothing else. Each one says where the
 * place being left sits in the coordinates of the place being reached, and
 * the camera travels, in those coordinates, from where it rested in the one
 * to where it rests in the other. Both places are drawn for the whole of
 * the move, so nothing appears or disappears: things come into the frame
 * and leave it because the camera went past them.
 *
 * Two ways to describe the journey:
 *
 *   via    waypoints (position, turn, when), for walking through a door,
 *          rising through a floor, flying down a thread;
 *   pivot  a point the camera closes in on or pulls back from while the
 *          scale of things changes by orders of magnitude (down to a table
 *          on the Earth; back from a page to the hall it is being read in).
 */

/** A position, a turn (yaw to the left, pitch up, roll; radians) and a scale. */
export type Pose3 = { at: [number, number, number]; turn?: [number, number, number]; scale?: number };

export type Via = { at: [number, number, number]; turn?: [number, number, number]; when: number };

export type Travel = {
  /** Where the place being reached sits, in the coordinates of the place being left. Give this or `from`. */
  into?: Pose3;
  /** Where the place being left sits, in the coordinates of the place being reached. */
  from?: Pose3;
  /** Waypoints for the camera, in the coordinates of the place being reached. */
  via?: Via[];
  /** For a move across scales: the point (in the coordinates of the place being reached) the camera homes on. */
  pivot?: [number, number, number];
  /** How much the frame streaks at the fastest part of the move (0 to 1). */
  rush?: number;
};

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function poseMatrix(pose: Pose3, out = new THREE.Matrix4()) {
  const turn = pose.turn ?? [0, 0, 0];
  const s = pose.scale ?? 1;
  return out.compose(new THREE.Vector3(...pose.at), new THREE.Quaternion().setFromEuler(new THREE.Euler(turn[1], turn[0], turn[2], "YXZ")), new THREE.Vector3(s, s, s));
}

type Key = { c: THREE.Vector3; q: THREE.Quaternion; s: number; when: number };

const position = new THREE.Vector3();
const rotation = new THREE.Quaternion();
const scale = new THREE.Vector3();
const camera = new THREE.Matrix4();
const tangentA = new THREE.Vector3();
const tangentB = new THREE.Vector3();
const offset = new THREE.Vector3();

/** One hand-over, worked out once: the camera's path through the place being reached. */
export class Route {
  /** The place being left, in the coordinates of the place being reached. */
  readonly seat = new THREE.Matrix4();
  readonly rush: number;
  private readonly keys: Key[];
  private readonly pivot: THREE.Vector3 | null;
  private readonly dist: number;

  constructor(travel: Travel, dist: number) {
    this.dist = dist;
    this.rush = travel.rush ?? 0;
    if (travel.from) poseMatrix(travel.from, this.seat);
    else poseMatrix(travel.into!, this.seat).invert();
    this.pivot = travel.pivot ? new THREE.Vector3(...travel.pivot) : null;

    // Where the camera starts, in the coordinates of the place being reached: its rest in the place being left.
    const start = new THREE.Matrix4().multiplyMatrices(this.seat, new THREE.Matrix4().makeTranslation(0, 0, dist));
    const first: Key = { c: new THREE.Vector3(), q: new THREE.Quaternion(), s: 1, when: 0 };
    start.decompose(first.c, first.q, scale);
    first.s = scale.x;
    const last: Key = { c: new THREE.Vector3(0, 0, dist), q: new THREE.Quaternion(), s: 1, when: 1 };
    const between = (travel.via ?? []).map((via) => {
      const turn = via.turn ?? [0, 0, 0];
      // A waypoint's scale lies on the straight line (in log) between the two ends.
      return { c: new THREE.Vector3(...via.at), q: new THREE.Quaternion().setFromEuler(new THREE.Euler(turn[1], turn[0], turn[2], "YXZ")), s: Math.pow(first.s, 1 - via.when), when: via.when };
    });
    this.keys = [first, ...between, last];
    // Take the short way round between successive turns.
    for (let i = 1; i < this.keys.length; i++) if (this.keys[i].q.dot(this.keys[i - 1].q) < 0) this.keys[i].q.set(-this.keys[i].q.x, -this.keys[i].q.y, -this.keys[i].q.z, -this.keys[i].q.w);
  }

  /** The camera, `t` of the way along: writes where the two places must stand for it to be there. */
  at(t: number, left: THREE.Matrix4, reached: THREE.Matrix4) {
    const keys = this.keys;
    const first = keys[0];
    if (this.pivot) {
      // Across scales: the scale changes at a steady rate (so the zoom feels even), the turn eases,
      // and the pivot slides to (or from) its resting place on screen while it is still small in the frame.
      const s = Math.pow(first.s, 1 - t);
      const closing = first.s > 1;
      const side = closing ? smooth(0, 0.55, t) : smooth(0.45, 1, t);
      rotation.slerpQuaternions(first.q, keys[keys.length - 1].q, smooth(0, 1, closing ? Math.min(1, t * 1.5) : Math.max(0, t * 1.5 - 0.5)));
      // The pivot as the camera sees it at each end (camera space: x right, y up, z towards the viewer).
      tangentA.copy(this.pivot).sub(first.c).applyQuaternion(rotationInverse(first.q)).divideScalar(first.s);
      tangentB.copy(this.pivot).sub(keys[keys.length - 1].c);
      offset.set(tangentA.x + (tangentB.x - tangentA.x) * side, tangentA.y + (tangentB.y - tangentA.y) * side, tangentA.z + (tangentB.z - tangentA.z) * smooth(0, 1, t));
      position.copy(this.pivot).sub(offset.applyQuaternion(rotation).multiplyScalar(s));
      scale.setScalar(s);
    } else {
      let i = 0;
      while (i < keys.length - 2 && t > keys[i + 1].when) i++;
      const a = keys[i];
      const b = keys[i + 1];
      const span = b.when - a.when;
      const u = Math.min(1, Math.max(0, (t - a.when) / span));
      // Hermite through the waypoints, with Catmull-Rom tangents: one smooth line, no corner at a waypoint.
      const before = keys[Math.max(0, i - 1)];
      const after = keys[Math.min(keys.length - 1, i + 2)];
      tangentA.copy(b.c).sub(before.c).multiplyScalar(span / (b.when - before.when));
      tangentB.copy(after.c).sub(a.c).multiplyScalar(span / (after.when - a.when));
      const u2 = u * u;
      const u3 = u2 * u;
      position
        .copy(a.c)
        .multiplyScalar(2 * u3 - 3 * u2 + 1)
        .addScaledVector(tangentA, u3 - 2 * u2 + u)
        .addScaledVector(b.c, -2 * u3 + 3 * u2)
        .addScaledVector(tangentB, u3 - u2);
      rotation.slerpQuaternions(a.q, b.q, smooth(0, 1, u));
      scale.setScalar(a.s * Math.pow(b.s / a.s, u));
    }
    // The place reached stands so that this camera pose falls on the real, fixed camera; the place left rides with it.
    camera.compose(position, rotation, scale).invert();
    reached.makeTranslation(0, 0, this.dist).multiply(camera);
    left.multiplyMatrices(reached, this.seat);
  }
}

const inverse = new THREE.Quaternion();
function rotationInverse(q: THREE.Quaternion) {
  return inverse.copy(q).invert();
}
