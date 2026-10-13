import * as THREE from "three";
import { ball, box, cyl, dust, field, glow, matte, paint, put, rng, shell, type Place } from "../kit";
import { proceduralRibbons } from "../ribbons";

/**
 * 02 Code. A desk at night: a monitor of Python (the debris detector), a
 * second turned on its side (Monte Carlo against Black-Scholes), a browser
 * window with a page being laid out, a tablet with a brand board, a
 * keyboard, a mug. `p` brings the windows up; `q` clears the main screen,
 * because the way on from here is in through it.
 *
 * The source on the screens is set dressing written for this scene: it
 * shows the kind of thing each project does, not the projects' own files.
 */

const DETECTOR = `import cv2
import numpy as np
from servo import NetArm

LOWER = np.array([0, 0, 180])
UPPER = np.array([180, 60, 255])

def detect(frame):
    """Find the largest piece of debris in the frame."""
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    mask = cv2.inRange(hsv, LOWER, UPPER)
    found, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL,
                                cv2.CHAIN_APPROX_SIMPLE)
    if not found:
        return None
    target = max(found, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(target)
    return x + w / 2, y + h / 2

arm = NetArm(pan=17, tilt=18)
camera = cv2.VideoCapture(0)

while True:
    ok, frame = camera.read()
    if not ok:
        break
    centre = detect(frame)
    if centre:
        arm.align(centre)   # servo-aligned net
        arm.deploy()`;

const PRICER = `import numpy as np
from scipy.stats import norm

def black_scholes(S, K, T, r, v):
    d1 = (np.log(S / K)
          + (r + v**2 / 2) * T)
    d1 /= v * np.sqrt(T)
    d2 = d1 - v * np.sqrt(T)
    return (S * norm.cdf(d1)
            - K * np.exp(-r * T)
            * norm.cdf(d2))

def monte_carlo(S, K, T, r, v,
                paths=100_000):
    z = np.random.standard_normal(paths)
    drift = (r - v**2 / 2) * T
    ST = S * np.exp(drift
                    + v * np.sqrt(T) * z)
    payoff = np.maximum(ST - K, 0)
    return np.exp(-r * T) * payoff.mean()

# theory against simulation
print(black_scholes(100, 105, 1, .03, .2))
print(monte_carlo(100, 105, 1, .03, .2))`;

const INK = { plain: "#d6e6e2", keyword: "#ff7eb6", text: "#ffd479", note: "#5f8a8b", number: "#ffa657", call: "#6fd3ff", rule: "#17343c" };
const TOKEN = /(#.*$)|("""[^"]*"""|"[^"]*"|'[^']*')|\b(import|from|def|return|if|not|while|True|None|break|for|in|as|print)\b|(\b\d[\d_.]*\b|\B\.\d+\b)|([A-Za-z_][\w.]*)(?=\()|(\s+)|([A-Za-z_]\w*|[^\sA-Za-z_])/gy;

/** A code editor window: title bar, tabs, gutter, highlighted source. */
function editorScreen(width: number, height: number, file: string, source: string, size: number) {
  return paint(width, height, (ctx, w, h) => {
    ctx.fillStyle = "#081a20";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#0d262e";
    ctx.fillRect(0, 0, w, size * 2.3);
    ["#ff6159", "#ffbd2e", "#28c941"].forEach((dot, i) => {
      ctx.fillStyle = dot;
      ctx.beginPath();
      ctx.arc(size * (1.1 + i * 1.05), size * 1.15, size * 0.32, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.font = `${size * 0.8}px "Space Mono", monospace`;
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#081a20";
    ctx.fillRect(size * 4.6, size * 0.5, ctx.measureText(file).width + size * 1.6, size * 1.8);
    ctx.fillStyle = "#9fd8c5";
    ctx.fillText(file, size * 5.4, size * 1.2);

    ctx.font = `${size}px "Space Mono", monospace`;
    const lines = source.split("\n");
    const pitch = size * 1.52;
    const top = size * 3.9;
    const gutter = size * 3.4;
    lines.forEach((line, n) => {
      const y = top + n * pitch;
      if (y > h - size) return;
      ctx.fillStyle = INK.rule;
      ctx.textAlign = "right";
      ctx.fillStyle = "#33606a";
      ctx.fillText(String(n + 1), gutter - size * 0.9, y);
      ctx.textAlign = "left";
      let x = gutter;
      TOKEN.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = TOKEN.exec(line))) {
        const piece = match[0];
        if (piece.length === 0) break;
        ctx.fillStyle = match[1] ? INK.note : match[2] ? INK.text : match[3] ? INK.keyword : match[4] ? INK.number : match[5] ? INK.call : INK.plain;
        if (!match[6]) ctx.fillText(piece, x, y);
        x += ctx.measureText(piece).width;
      }
    });
  });
}

/** A browser window with a page half laid out: boxes where the content will go. */
function browserScreen() {
  return paint(1024, 680, (ctx, w, h) => {
    ctx.fillStyle = "#f3f0e8";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#d9d5ca";
    ctx.fillRect(0, 0, w, 62);
    ["#ff6159", "#ffbd2e", "#28c941"].forEach((dot, i) => {
      ctx.fillStyle = dot;
      ctx.beginPath();
      ctx.arc(30 + i * 28, 31, 9, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "#f3f0e8";
    ctx.fillRect(130, 14, 620, 34);
    ctx.font = `20px "Space Mono", monospace`;
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#6b675e";
    ctx.fillText("localhost:5173", 150, 32);
    // The page: nav, a headline, a picture, three cards.
    ctx.fillStyle = "#17131a";
    ctx.fillRect(60, 104, 120, 16);
    for (let i = 0; i < 4; i++) ctx.fillRect(660 + i * 80, 106, 54, 10);
    ctx.font = `900 76px "Inter", sans-serif`;
    ctx.fillText("BUILD IT.", 56, 216);
    ctx.font = `italic 400 70px "Playfair Display", serif`;
    ctx.fillText("Ship it.", 60, 300);
    ctx.fillStyle = "#8d887c";
    for (let i = 0; i < 3; i++) ctx.fillRect(60, 362 + i * 22, 340 - i * 50, 9);
    ctx.fillStyle = "#17131a";
    ctx.fillRect(60, 446, 170, 50);
    ctx.strokeStyle = "#17131a";
    ctx.lineWidth = 3;
    ctx.strokeRect(540, 160, 424, 300);
    ctx.beginPath();
    ctx.moveTo(540, 160);
    ctx.lineTo(964, 460);
    ctx.moveTo(964, 160);
    ctx.lineTo(540, 460);
    ctx.stroke();
    for (let i = 0; i < 3; i++) {
      ctx.strokeRect(60 + i * 310, 540, 282, 110);
      ctx.fillStyle = ["#5cf2a0", "#ffb45c", "#a99bff"][i];
      ctx.fillRect(78 + i * 310, 558, 44, 44);
      ctx.fillStyle = "#17131a";
      ctx.fillRect(140 + i * 310, 562, 150, 12);
      ctx.fillStyle = "#8d887c";
      ctx.fillRect(140 + i * 310, 586, 110, 8);
    }
  });
}

/** A brand board: swatches, a type specimen, a curve with its handles. */
function boardScreen() {
  return paint(1024, 720, (ctx, w, h) => {
    ctx.fillStyle = "#16161c";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    for (let x = 0; x < w; x += 40) ctx.strokeRect(x, 0, 40, h);
    ["#ffb45c", "#5cf2a0", "#a99bff", "#ffd84a", "#9b1c2e", "#ff7d6e", "#3b33d6"].forEach((swatch, i) => {
      ctx.fillStyle = swatch;
      ctx.fillRect(60 + i * 96, 60, 80, 110);
    });
    ctx.fillStyle = "#f4efe4";
    ctx.textBaseline = "alphabetic";
    ctx.font = `italic 400 250px "Playfair Display", serif`;
    ctx.fillText("Aa", 50, 470);
    ctx.font = `900 190px "Inter", sans-serif`;
    ctx.fillText("AC", 420, 460);
    ctx.font = `22px "Space Mono", monospace`;
    ctx.fillStyle = "#8a8a94";
    ctx.fillText("PLAYFAIR DISPLAY ITALIC", 60, 520);
    ctx.fillText("INTER BLACK", 430, 520);
    // The pen tool: a curve, its anchors, its handles.
    ctx.strokeStyle = "#5cf2a0";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(90, 660);
    ctx.bezierCurveTo(260, 520, 420, 760, 600, 610);
    ctx.bezierCurveTo(720, 510, 820, 600, 940, 560);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#f4efe4";
    for (const [ax, ay, hx, hy] of [[90, 660, 190, 578], [600, 610, 500, 690], [940, 560, 870, 584]]) {
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(hx, hy);
      ctx.stroke();
      ctx.fillStyle = "#16161c";
      ctx.fillRect(ax - 8, ay - 8, 16, 16);
      ctx.strokeRect(ax - 8, ay - 8, 16, 16);
      ctx.fillStyle = "#f4efe4";
      ctx.beginPath();
      ctx.arc(hx, hy, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

/** A lit screen in a dark bezel. The screen and the panel behind it can be faded: the camera goes in through this one. */
function display(w: number, h: number, map: THREE.Texture, bright = 1.25) {
  const group = new THREE.Group();
  const shell = matte(0x0a0d10, 0.4, 0.5);
  const rim = 0.15;
  for (const side of [-1, 1]) {
    group.add(put(box(w + rim * 2, rim, 0.2, shell), 0, side * (h / 2 + rim / 2), -0.1));
    group.add(put(box(rim, h, 0.2, shell), side * (w / 2 + rim / 2), 0, -0.1));
  }
  const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: 0x05080a, transparent: true }));
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, color: new THREE.Color(bright, bright, bright), transparent: true }));
  group.add(put(back, 0, 0, -0.05), screen);
  /** 1: an ordinary screen. 0: nothing there but the frame. */
  const fade = (amount: number) => {
    screen.material.opacity = amount;
    back.material.opacity = amount;
    screen.visible = back.visible = amount > 0.005;
  };
  return { group, fade };
}

// Steam off the mug: a few wisps that rise, lean and thin out.
const STEAM = /* glsl */ `
  vec3 path(float u, float id, float seed) {
    float rise = u * 2.2;
    return vec3(sin(u * 5.0 + uTime * 0.9 + id * 2.1) * 0.12 * u + (id - 1.0) * 0.07, rise, cos(u * 4.0 + uTime * 0.7 + id) * 0.1 * u);
  }
  float gain(float u, float id, float seed) {
    return (1.0 - u) * smoothstep(0.0, 0.15, u) * (0.6 + 0.4 * sin(uTime * 1.3 + id * 2.0));
  }
`;

export function editor(): Place {
  const { root, slide } = shell();
  const random = rng(31);
  const set = put(new THREE.Group(), -3.6, 1.15, -8, 0.07, 0.1, 0);
  slide.add(set);

  // ---- the desk ----
  const desk = box(34, 0.4, 16, matte(0x060a0c, 0.62, 0.1));
  set.add(put(desk, 0, -4.05, 1.5));

  const { group: main, fade: fadeMain } = display(10.2, 6.1, editorScreen(1340, 800, "orbital_guardian.py", DETECTOR, 22));
  set.add(put(main, 0.6, 0.1, -2.2, 0, -0.04, 0));
  set.add(put(cyl(0.14, 0.14, 1.2, matte(0x14181c, 0.4, 0.6), 12), 0.6, -3.4, -2.5), put(cyl(1.4, 1.5, 0.08, matte(0x14181c, 0.4, 0.6), 32), 0.6, -3.82, -2.4));

  const { group: tall } = display(4.3, 7.4, editorScreen(660, 1140, "monte_carlo.py", PRICER, 21));
  set.add(put(tall, -5.0, -0.1, 2.6, 0, 0.5, 0));
  set.add(put(cyl(0.12, 0.12, 1.2, matte(0x14181c, 0.4, 0.6), 12), -5.0, -3.4, 2.4), put(cyl(1.0, 1.1, 0.08, matte(0x14181c, 0.4, 0.6), 32), -5.0, -3.82, 2.5));

  // A browser window, hanging in the air above and behind: the page being built.
  const page = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 4.25), new THREE.MeshBasicMaterial({ map: browserScreen(), color: new THREE.Color(0.9, 0.9, 0.9) }));
  const pageRig = put(new THREE.Group(), 3.4, 5.6, -7.5, 0.06, -0.2, 0.02);
  pageRig.add(page);
  set.add(pageRig);

  // The tablet on the desk, and its stylus.
  const tablet = new THREE.Group();
  tablet.add(box(5.0, 0.14, 3.6, matte(0x1b1d22, 0.35, 0.6)));
  tablet.add(put(new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.24), new THREE.MeshBasicMaterial({ map: boardScreen(), color: new THREE.Color(1.1, 1.1, 1.1) })), 0, 0.075, 0, -Math.PI / 2));
  tablet.add(put(cyl(0.05, 0.05, 2.4, matte(0xe8e4da, 0.3), 10), 2.9, 0.12, 0.6, Math.PI / 2, 0, 0.5));
  set.add(put(tablet, -1.4, -3.76, 6.6, 0, 0.3, 0));

  // Keyboard: sixty-odd caps, a few of them lit.
  const board = new THREE.Group();
  board.add(box(7.4, 0.2, 2.8, matte(0x101418, 0.4, 0.5)));
  const caps: [number, number, number][] = [];
  for (let row = 0; row < 5; row++) {
    let x = -3.45;
    while (x < 3.3) {
      const wide = row === 4 && Math.abs(x) < 1.2 ? 2.4 : random() < 0.12 ? 0.74 : 0.46;
      if (x + wide > 3.5) break;
      caps.push([x + wide / 2, row, wide]);
      x += wide + 0.05;
    }
  }
  const lit = new Set<number>();
  while (lit.size < 9) lit.add(Math.floor(random() * caps.length));
  const capShape = new THREE.BoxGeometry(1, 0.16, 0.44);
  board.add(
    field(capShape, matte(0x1c2227, 0.5, 0.2), caps.length, (i, d) => {
      d.position.set(caps[i][0], 0.17, -1.02 + caps[i][1] * 0.51);
      d.scale.set(lit.has(i) ? 0.0001 : caps[i][2], 1, 1);
    }),
  );
  const litCaps = [...lit];
  board.add(
    field(capShape, glow(0x5cf2a0, 1.05), litCaps.length, (i, d) => {
      const cap = caps[litCaps[i]];
      d.position.set(cap[0], 0.17, -1.02 + cap[1] * 0.51);
      d.scale.set(cap[2], 1, 1);
    }),
  );
  set.add(put(board, 1.9, -3.74, 4.2, 0.06, -0.08, 0));

  // Mouse and mug.
  const mouse = ball(0.5, matte(0x161a1e, 0.35, 0.4), 20);
  mouse.scale.set(0.62, 0.34, 1);
  set.add(put(mouse, 6.4, -3.72, 4.6));
  const mug = new THREE.Group();
  mug.add(cyl(0.48, 0.42, 0.95, matte(0xe9e4d8, 0.4), 28), put(new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.07, 8, 20, Math.PI), matte(0xe9e4d8, 0.4)), 0.46, 0, 0, 0, 0, -Math.PI / 2));
  mug.add(put(cyl(0.42, 0.42, 0.02, matte(0x1a0d06, 0.3), 24), 0, 0.44, 0));
  mug.add(put(proceduralRibbons(3, 40, STEAM, { width: 0.09, minPx: 1.2, hasGain: true, gain: 0.5, color: 0xcfe8e0, opacity: 0.6 }), 0, 0.5, 0));
  set.add(put(mug, 3.5, -3.38, -0.7));

  // The line the cursor is on, and the cursor.
  const lineBar = new THREE.Mesh(new THREE.PlaneGeometry(9.1, 0.24), new THREE.MeshBasicMaterial({ color: 0x5cf2a0, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false }));
  const cursor = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.22), glow(0x5cf2a0, 2.2));
  main.add(put(lineBar, 0.4, 0, 0.01), put(cursor, 0, 0, 0.02));

  // ---- far layer: other people's windows, as blocks of tokens ----
  const tokens: [number, number, number, number, number][] = [];
  for (let panel = 0; panel < 26; panel++) {
    const px = (random() - 0.5) * 110;
    const py = (random() - 0.35) * 46;
    const pz = -24 - random() * 46;
    let indent = 0;
    for (let line = 0; line < 22; line++) {
      if (random() < 0.14) continue;
      indent = Math.max(0, Math.min(4, indent + Math.floor(random() * 3) - 1));
      let x = indent * 0.7;
      const count = 1 + Math.floor(random() * 5);
      for (let t = 0; t < count; t++) {
        const wide = 0.4 + random() * 2.2;
        tokens.push([px + x + wide / 2, py - line * 0.46, pz, wide, random()]);
        x += wide + 0.3;
      }
    }
  }
  const green = new THREE.Color(0x5cf2a0);
  const wallOfCode = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.85, depthWrite: false });
  set.add(
    field(new THREE.BoxGeometry(1, 0.2, 0.02), wallOfCode, tokens.length, (i, d, color) => {
      const [x, y, z, wide, kind] = tokens[i];
      d.position.set(x, y, z);
      d.scale.set(wide, 1, 1);
      if (kind > 0.86) color.copy(green).multiplyScalar(1.5);
      else if (kind > 0.7) color.setRGB(0.1, 0.42, 0.5);
      else color.setRGB(0.07, 0.2, 0.24);
    }),
  );
  set.add(dust({ count: 1500, size: [70, 34, 70], centre: [0, 4, -18], color: 0x8ff5c8, gain: 0.8, point: 0.045, seed: 12 }));

  return {
    root,
    slide,
    update({ ch, time, theta }) {
      const up = ch[6];
      // The windows rise into place as the camera arrives.
      pageRig.position.y = 5.6 - (1 - up) * 4;
      tablet.position.y = -3.76 - (1 - up) * 1.5;
      // The cursor works its way down the file and starts again.
      const row = Math.floor((time * 1.4 + theta * 2.5) % 28);
      const y = 2.05 - row * 0.2065;
      lineBar.position.y = y;
      cursor.position.set(-3.2 + ((time * 9) % 1) * 0 + (row % 7) * 0.5, y, 0.02);
      cursor.visible = (time * 2) % 1 < 0.6;
      pageRig.rotation.z = 0.02 + Math.sin(time * 0.5) * 0.008;
      pageRig.rotation.y = -0.2 + Math.sin(theta * 0.35) * 0.07;
      // On the way out the camera goes in through the main screen: the code clears off it, and off the
      // wall of code behind, so that what is beyond the glass can be seen and nothing is left hanging there.
      const leaving = ch[7];
      const clear = Math.min(1, Math.max(0, (leaving - 0.3) / 0.22));
      fadeMain(1 - clear * clear * (3 - 2 * clear));
      lineBar.visible = clear < 0.5;
      cursor.visible = cursor.visible && clear < 0.5;
      wallOfCode.opacity = 0.85 * (1 - Math.min(1, Math.max(0, (leaving - 0.15) / 0.4)));
    },
  };
}
