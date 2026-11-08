import * as THREE from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

/**
 * High-Speed Arcade Racing Motion Blur Post-Processing Pass (ASPHALT: LE MANS 24H)
 *
 * Implements a 16-tap directional radial + angular velocity motion blur inspired by
 * Asphalt 8: Airborne and Le Mans broadcast chase cameras:
 * - Radiates from the dynamic 3D forward vanishing point on screen (`uVanishingPoint`).
 * - Incorporates lateral cornering camera swing (`uLateralSwing`) when carving turns at speed.
 * - Preserves 100% razor-sharp clarity on the player's Ferrari 499P (`uCarScreenPos` + chassis mask)
 *   and the central horizon arches ahead, while streaking the peripheral asphalt, FIA kerbs,
 *   white track-edge lines, and trackside barriers rushing past the car.
 * - Uses Interleaved Gradient Noise (IGN) phase jitter for silky, band-free sampling.
 */
export function createSpeedMotionBlurPass() {
  const SpeedMotionBlurShader = {
    name: 'SpeedMotionBlurShader',
    uniforms: {
      tDiffuse: { value: null },
      uStrength: { value: 0.0 },
      uBoostFactor: { value: 0.0 },
      uVanishingPoint: { value: new THREE.Vector2(0.5, 0.56) },
      uCarScreenPos: { value: new THREE.Vector2(0.5, 0.26) },
      uProtectCar: { value: 1.0 },
      uLateralSwing: { value: 0.0 },
      uAspect: { value: window.innerWidth / Math.max(1, window.innerHeight) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse;
      uniform float uStrength;
      uniform float uBoostFactor;
      uniform vec2 uVanishingPoint;
      uniform vec2 uCarScreenPos;
      uniform float uProtectCar;
      uniform float uLateralSwing;
      uniform float uAspect;

      varying vec2 vUv;

      void main() {
        vec4 baseColor = texture2D(tDiffuse, vUv);

        // Early exit when stationary or moving slowly
        if (uStrength <= 0.001) {
          gl_FragColor = baseColor;
          return;
        }

        // 1. Vector from screen-space vanishing point to current pixel (aspect-corrected for mask)
        vec2 rel = vUv - uVanishingPoint;
        vec2 relAspect = vec2(rel.x * uAspect, rel.y);
        float radialDist = length(relAspect);

        // Keep the central horizon & overhead arches ahead clear, ramping blur toward the periphery
        float peripheryMask = smoothstep(0.14, 0.68, radialDist);

        // Emphasize motion blur on the lower half / road surface & trackside barriers rushing past
        float roadMask = 0.62 + 0.58 * smoothstep(0.62, 0.08, vUv.y);

        // 2. Protect the Ferrari 499P hero car in 3rd-person Chase View so the car stays 100% tack-sharp
        float carKeepSharp = 1.0;
        if (uProtectCar > 0.5) {
          vec2 dCar = vUv - uCarScreenPos;
          // Elliptical silhouette mask covering the rear wing, diffuser, canopy, and wide fenders
          vec2 carEllip = vec2(dCar.x / 0.21, dCar.y / 0.19);
          float carDist = length(carEllip);
          carKeepSharp = smoothstep(0.68, 1.18, carDist);
        }

        float localBlurAmount = uStrength * peripheryMask * roadMask * carKeepSharp;
        if (localBlurAmount <= 0.0004) {
          gl_FragColor = baseColor;
          return;
        }

        // 3. Compute directional velocity vector: radial outflow from vanishing point + cornering swing
        vec2 radialDir = radialDist > 0.0001 ? (rel / radialDist) : vec2(0.0, -1.0);
        vec2 swingVec = vec2(uLateralSwing * (0.35 + 0.65 * (1.0 - vUv.y)), 0.0);
        vec2 blurVec = (radialDir * (0.28 + 0.72 * radialDist) + swingVec) * localBlurAmount;

        // Clamp maximum UV sample span so extreme speeds stay cinematic and never tear
        float maxUvSpan = 0.052 + 0.024 * uBoostFactor;
        float blurLen = length(blurVec);
        if (blurLen > maxUvSpan) {
          blurVec *= maxUvSpan / blurLen;
        }

        // 4. Interleaved Gradient Noise (IGN) per-pixel jitter to eliminate sample stepping/banding
        float ign = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
        float jitter = (ign - 0.5) / 16.0;

        // 5. 16-tap directional velocity integration with tapered energy weights
        vec3 accColor = baseColor.rgb;
        float totalWeight = 1.0;

        for (int i = 1; i <= 16; i++) {
          float t = (float(i) / 16.0) - 0.5 + jitter;
          vec2 sampleUv = clamp(vUv + blurVec * t, vec2(0.001), vec2(0.999));

          // Prevent peripheral road blur taps from bleeding colors out of the car's silhouette
          float tapCarMask = 1.0;
          if (uProtectCar > 0.5) {
            vec2 tapDCar = sampleUv - uCarScreenPos;
            float tapCarDist = length(vec2(tapDCar.x / 0.19, tapDCar.y / 0.17));
            tapCarMask = smoothstep(0.62, 1.05, tapCarDist);
          }

          float w = (1.0 - abs(t) * 0.65) * (0.25 + 0.75 * tapCarMask);
          accColor += texture2D(tDiffuse, sampleUv).rgb * w;
          totalWeight += w;
        }

        vec3 finalRgb = accColor / totalWeight;

        // 6. Subtle peripheral high-speed chromatic dispersion at top speed / boost
        float chromaAmt = localBlurAmount * (0.045 + 0.055 * uBoostFactor);
        if (chromaAmt > 0.0005) {
          vec2 chromaOffset = radialDir * chromaAmt;
          float rCh = texture2D(tDiffuse, clamp(vUv - chromaOffset, vec2(0.001), vec2(0.999))).r;
          float bCh = texture2D(tDiffuse, clamp(vUv + chromaOffset, vec2(0.001), vec2(0.999))).b;
          finalRgb.r = mix(finalRgb.r, rCh, 0.32);
          finalRgb.b = mix(finalRgb.b, bCh, 0.32);
        }

        gl_FragColor = vec4(finalRgb, baseColor.a);
      }
    `,
  };

  const pass = new ShaderPass(SpeedMotionBlurShader);
  return pass;
}
