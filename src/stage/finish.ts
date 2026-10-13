import * as THREE from "three";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

/**
 * The last pass of the lit pipeline, replacing three's OutputPass. One
 * full-screen shader does everything that would otherwise be separate passes
 * (or DOM overlays):
 *
 *  - tone mapping (Khronos neutral) and sRGB encoding
 *  - FXAA, so the scene can render without multisampling. MSAA on a
 *    half-float target is by far the most expensive thing this page could do
 *    on a high-density display.
 *  - a chromatic split along the scroll axis that scales with scroll speed,
 *    so long jumps between chapters read as motion, with the accent bleeding
 *    in from the edges of the frame
 *  - the hand-overs: a zoom blur for a dive, a directional smear for a pan, a
 *    fall or a rise, and a hot edge along every seam where two places meet
 *  - film grain
 */

const VERTEX = /* glsl */ `
  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D tDiffuse;
  uniform vec2 uTexel;
  uniform float uShift;
  uniform float uWarp;
  uniform vec2 uCentre;
  uniform vec3 uTint;
  uniform vec3 uSeam;
  uniform vec4 uBox;
  uniform vec2 uSmear;
  uniform float uAspect;
  uniform float uTime;
  uniform float uGrain;

  #include <tonemapping_pars_fragment>
  #include <colorspace_pars_fragment>

  varying vec2 vUv;

  float hash(vec2 p) {
    vec3 q = fract(vec3(p.xyx) * 0.1031);
    q += dot(q, q.yzx + 33.33);
    return fract((q.x + q.y) * q.z);
  }

  vec3 grade(vec2 uv) {
    return NeutralToneMapping(texture2D(tDiffuse, uv).rgb * toneMappingExposure);
  }

  float luma(vec3 c) {
    return dot(c, vec3(0.299, 0.587, 0.114));
  }

  float seam(float d) {
    return exp(-d * 900.0) * 1.4 + exp(-d * 60.0) * 0.16;
  }

  void main() {
    // FXAA (after Timothy Lottes), run on tone-mapped colour.
    vec3 m = grade(vUv);
    vec3 nw = grade(vUv + vec2(-1.0, -1.0) * uTexel);
    vec3 ne = grade(vUv + vec2(1.0, -1.0) * uTexel);
    vec3 sw = grade(vUv + vec2(-1.0, 1.0) * uTexel);
    vec3 se = grade(vUv + vec2(1.0, 1.0) * uTexel);
    float lM = luma(m);
    float lNW = luma(nw);
    float lNE = luma(ne);
    float lSW = luma(sw);
    float lSE = luma(se);
    float lMin = min(lM, min(min(lNW, lNE), min(lSW, lSE)));
    float lMax = max(lM, max(max(lNW, lNE), max(lSW, lSE)));

    vec3 colour = m;
    if (lMax - lMin > max(0.03, lMax * 0.1)) {
      vec2 dir = vec2(-((lNW + lNE) - (lSW + lSE)), (lNW + lSW) - (lNE + lSE));
      float reduce = max((lNW + lNE + lSW + lSE) * 0.03125, 0.0078125);
      dir = clamp(dir / (min(abs(dir.x), abs(dir.y)) + reduce), -8.0, 8.0) * uTexel;
      vec3 a = 0.5 * (grade(vUv + dir * (1.0 / 3.0 - 0.5)) + grade(vUv + dir * (2.0 / 3.0 - 0.5)));
      vec3 b = a * 0.5 + 0.25 * (grade(vUv - dir * 0.5) + grade(vUv + dir * 0.5));
      float lB = luma(b);
      colour = (lB < lMin || lB > lMax) ? a : b;
    }

    // Scroll speed pulls red and blue apart along the scroll axis, more towards the edges.
    if (uShift > 0.00005) {
      vec2 c = vUv - 0.5;
      vec2 offset = vec2(0.0, uShift * (0.35 + dot(c, c) * 2.4));
      colour.r = mix(colour.r, grade(vUv + offset).r, 0.85);
      colour.b = mix(colour.b, grade(vUv - offset).b, 0.85);
    }

    vec2 fromCentre = vUv - 0.5;
    float edge = smoothstep(0.3, 0.72, length(fromCentre * vec2(0.9, 1.0)));
    colour += uTint * edge * uShift * 34.0;

    // The dive: a zoom blur towards the vanishing point. It dims a little and never goes dark.
    if (uWarp > 0.002) {
      // Streaked in linear light and graded once, so bright things leave bright trails.
      vec2 ray = vUv - uCentre;
      vec3 sum = vec3(0.0);
      float total = 0.0;
      for (int i = 1; i <= 6; i++) {
        float k = float(i) / 6.0;
        float weight = 1.0 - k * 0.6;
        sum += texture2D(tDiffuse, uCentre + ray * (1.0 - uWarp * 0.26 * k)).rgb * weight;
        total += weight;
      }
      colour = mix(colour, NeutralToneMapping(sum / total * toneMappingExposure), min(1.0, uWarp * 2.5));
      colour *= 1.0 - uWarp * uWarp * 0.3;
      colour += uTint * uWarp * uWarp * uWarp * 0.1 * (1.0 - smoothstep(0.0, 0.45, length(ray)));
    }

    // A pan, a fall or a rise: smear along the way the frame is moving.
    if (dot(uSmear, uSmear) > 0.0000001) {
      vec3 sum = vec3(0.0);
      float total = 0.0;
      float jitter = hash(gl_FragCoord.xy + uTime * 61.0) - 0.5;
      for (int i = -7; i <= 7; i++) {
        float k = (float(i) + jitter) / 7.0;
        float weight = 1.0 - abs(k) * 0.55;
        sum += texture2D(tDiffuse, vUv + uSmear * k).rgb * weight;
        total += weight;
      }
      colour = mix(colour, NeutralToneMapping(sum / total * toneMappingExposure), 0.88);
    }

    // Seams: where two places meet on screen, a hot edge in the accent with a short glow.
    if (uSeam.x >= 0.0) colour += uTint * seam(abs(vUv.x - uSeam.x) * uAspect);
    if (uSeam.y >= 0.0) colour += uTint * seam(abs(vUv.x - uSeam.y) * uAspect);
    if (uSeam.z >= 0.0) colour += uTint * seam(abs(vUv.y - uSeam.z));
    if (uBox.x >= 0.0) {
      vec2 q = abs(vUv - (uBox.xy + uBox.zw) * 0.5) - (uBox.zw - uBox.xy) * 0.5;
      q.x *= uAspect;
      colour += uTint * seam(abs(length(max(q, 0.0)) + min(max(q.x, q.y), 0.0)));
    }

    // Fine grain, re-seeded 24 times a second, a touch stronger in the shadows.
    float grain = hash(gl_FragCoord.xy + floor(uTime * 24.0) * vec2(37.0, 17.0)) - 0.5;
    colour += grain * uGrain * (1.0 - 0.6 * luma(colour));
    gl_FragColor = sRGBTransferOETF(vec4(colour, 1.0));
  }
`;

export type FinishPass = ShaderPass & {
  uniforms: {
    tDiffuse: { value: THREE.Texture | null };
    toneMappingExposure: { value: number };
    uTexel: { value: THREE.Vector2 };
    uShift: { value: number };
    uWarp: { value: number };
    uCentre: { value: THREE.Vector2 };
    uTint: { value: THREE.Color };
    uSeam: { value: THREE.Vector3 };
    uBox: { value: THREE.Vector4 };
    uSmear: { value: THREE.Vector2 };
    uAspect: { value: number };
    uTime: { value: number };
    uGrain: { value: number };
  };
};

export function createFinishPass(exposure: number): FinishPass {
  const material = new THREE.RawShaderMaterial({
    name: "FinishShader",
    uniforms: {
      tDiffuse: { value: null },
      toneMappingExposure: { value: exposure },
      uTexel: { value: new THREE.Vector2(1, 1) },
      uShift: { value: 0 },
      uWarp: { value: 0 },
      uCentre: { value: new THREE.Vector2(0.5, 0.5) },
      uTint: { value: new THREE.Color(0x00e5ff) },
      uSeam: { value: new THREE.Vector3(-1, -1, -1) },
      uBox: { value: new THREE.Vector4(-1, -1, -1, -1) },
      uSmear: { value: new THREE.Vector2(0, 0) },
      uAspect: { value: 1.6 },
      uTime: { value: 0 },
      uGrain: { value: 0.022 },
    },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    depthTest: false,
    depthWrite: false,
  });
  return new ShaderPass(material) as FinishPass;
}
