import * as THREE from "three";

/**
 * Getting from one place to the next.
 *
 * The places are not separate scenes that get cut or wiped between: they
 * are parts of one world. So a hand-over is a camera move and nothing else.
 * Each one says where the place being left sits in the coordinates of the
 * place being reached, and the camera travels, in those coordinates, from
 * where it rested in the one to where it rests in the other. Both places
 * are drawn for the whole of the move, so nothing appears or disappears:
 * things come into the frame and leave it because the camera went past.
 *
 * A move is one gesture. Two ways to describe it:
 *
 *   via    a few waypoints (position, turn, when). The camera goes through
 *          them on one smooth line and turns on one smooth line: neither
 *          ever stops at a waypoint;
 *   pivot  a point the camera closes in on or pulls back from while the
 *          scale of things changes by orders of magnitude.
 *
 * `pace` re-times a move so that the picture changes by the same amount for
 * every bit of scroll (see pace.ts: it is measured, not guessed).
 */

/** A position, a turn (yaw to the left, pitch up, roll; radians) and a scale. */
export type Pose3 = { at: [number, number, number]; turn?: [number, number, number]; scale?: number };

export type Via = { at: [number, number, number]; turn?: [number, number, number]; when: number };

export type Travel = {
  /** Where the place being reached sits, in the coordinates of the place being left. Give this, `from` or `seat`. */
  into?: Pose3;
  /** Where the place being left sits, in the coordinates of the place being reached. */
  from?: Pose3;
  /** The same as `from`, as a matrix. */
  seat?: THREE.Matrix4;
  /** Waypoints for the camera, in the coordinates of the place being reached. */
  via?: Via[];
  /** For a move across scales: the point (in the coordinates of the place being reached) the camera homes on. */
  pivot?: [number, number, number];
  /** A move across scales: the part of it over which the camera turns, and the part over which the pivot slides to its place in the frame. */
  turning?: [number, number];
  sliding?: [number, number];
  /** How much the frame streaks at the fastest part of the move (0 to 1). */
  rush?: number;
  /** Where along the move the camera is for each even step of scroll (first 0, last 1). */
  pace?: number[];
};

const smoother = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * t * (t * (t * 6 - 15) + 10);
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
const inverse = new THREE.Quaternion();

/** One hand-over, worked out once: the camera's path through the place being reached. */
export class Route {
  /** The place being left, in the coordinates of the place being reached. */
  readonly seat = new THREE.Matrix4();
  readonly rush: number;
  private readonly keys: Key[];
  private readonly pivot: THREE.Vector3 | null;
  private readonly turning: [number, number];
  private readonly sliding: [number, number];
  private readonly dist: number;
  private pace: number[] | null;

  constructor(travel: Travel, dist: number) {
    this.dist = dist;
    this.rush = travel.rush ?? 0;
    this.pace = travel.pace && travel.pace.length > 2 ? travel.pace : null;
    if (travel.seat) this.seat.copy(travel.seat);
    else if (travel.from) poseMatrix(travel.from, this.seat);
    else poseMatrix(travel.into!, this.seat).invert();
    this.pivot = travel.pivot ? new THREE.Vector3(...travel.pivot) : null;

    // Where the camera starts, in the coordinates of the place being reached: its rest in the place being left.
    const start = new THREE.Matrix4().multiplyMatrices(this.seat, new THREE.Matrix4().makeTranslation(0, 0, dist));
    const first: Key = { c: new THREE.Vector3(), q: new THREE.Quaternion(), s: 1, when: 0 };
    start.decompose(first.c, first.q, scale);
    first.s = scale.x;
    const closing = first.s > 1;
    this.turning = travel.turning ?? (closing ? [0, 0.66] : [0.34, 1]);
    this.sliding = travel.sliding ?? (closing ? [0, 0.55] : [0.45, 1]);
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

  /** Re-times the move (pace.ts is rewritten by a measuring tool; null takes it off). */
  retime(pace: number[] | null) {
    this.pace = pace && pace.length > 2 ? pace : null;
  }

  /** How far along the path the camera is when the page is `t` of the way through the move. */
  private along(t: number) {
    const pace = this.pace;
    if (!pace) return t;
    const x = Math.min(1, Math.max(0, t)) * (pace.length - 1);
    const i = Math.min(pace.length - 2, Math.floor(x));
    return pace[i] + (pace[i + 1] - pace[i]) * (x - i);
  }

  /** The camera, `t` of the way through the move: writes where the two places must stand for it to be there. */
  at(t: number, left: THREE.Matrix4, reached: THREE.Matrix4) {
    t = this.along(t);
    const keys = this.keys;
    const first = keys[0];
    const end = keys[keys.length - 1];
    if (this.pivot) {
      // Across scales: the scale changes at a steady rate (so the zoom is even), the camera turns over
      // part of the move, and the pivot slides to (or from) its resting place in the frame.
      const s = Math.pow(first.s, 1 - t);
      rotation.slerpQuaternions(first.q, end.q, smoother(this.turning[0], this.turning[1], t));
      // The pivot as the camera sees it at each end (camera space: x right, y up, z towards the viewer).
      tangentA.copy(this.pivot).sub(first.c).applyQuaternion(inverse.copy(first.q).invert()).divideScalar(first.s);
      tangentB.copy(this.pivot).sub(end.c);
      const side = smoother(this.sliding[0], this.sliding[1], t);
      offset.set(tangentA.x + (tangentB.x - tangentA.x) * side, tangentA.y + (tangentB.y - tangentA.y) * side, tangentA.z + (tangentB.z - tangentA.z) * smoother(0, 1, t));
      position.copy(this.pivot).sub(offset.applyQuaternion(rotation).multiplyScalar(s));
      scale.setScalar(s);
    } else {
      let i = 0;
      while (i < keys.length - 2 && t > keys[i + 1].when) i++;
      const a = keys[i];
      const b = keys[i + 1];
      const span = b.when - a.when;
      const u = Math.min(1, Math.max(0, (t - a.when) / span));
      // Hermite through the waypoints, with Catmull-Rom tangents, for where the camera is and for which
      // way it faces: one smooth line each, with no corner and no pause at a waypoint.
      const before = keys[Math.max(0, i - 1)];
      const after = keys[Math.min(keys.length - 1, i + 2)];
      const ka = span / (b.when - before.when);
      const kb = span / (after.when - a.when);
      const u2 = u * u;
      const u3 = u2 * u;
      const h00 = 2 * u3 - 3 * u2 + 1;
      const h10 = u3 - 2 * u2 + u;
      const h01 = -2 * u3 + 3 * u2;
      const h11 = u3 - u2;
      tangentA.copy(b.c).sub(before.c).multiplyScalar(ka);
      tangentB.copy(after.c).sub(a.c).multiplyScalar(kb);
      position.copy(a.c).multiplyScalar(h00).addScaledVector(tangentA, h10).addScaledVector(b.c, h01).addScaledVector(tangentB, h11);
      rotation.set(
        a.q.x * h00 + (b.q.x - before.q.x) * ka * h10 + b.q.x * h01 + (after.q.x - a.q.x) * kb * h11,
        a.q.y * h00 + (b.q.y - before.q.y) * ka * h10 + b.q.y * h01 + (after.q.y - a.q.y) * kb * h11,
        a.q.z * h00 + (b.q.z - before.q.z) * ka * h10 + b.q.z * h01 + (after.q.z - a.q.z) * kb * h11,
        a.q.w * h00 + (b.q.w - before.q.w) * ka * h10 + b.q.w * h01 + (after.q.w - a.q.w) * kb * h11,
      );
      rotation.normalize();
      scale.setScalar(a.s * Math.pow(b.s / a.s, u));
    }
    // The place reached stands so that this camera pose falls on the real, fixed camera; the place left rides with it.
    camera.compose(position, rotation, scale).invert();
    reached.makeTranslation(0, 0, this.dist).multiply(camera);
    left.multiplyMatrices(reached, this.seat);
  }
}
