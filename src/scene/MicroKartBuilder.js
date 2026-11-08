import * as THREE from 'three';

/**
 * Builds the Authentic Le Mans 24H Endurance Hypercar Prototype (#51 Ferrari 499P LMH).
 *
 * Restores the classic endurance prototype design with refined, cohesive 3D proportions:
 * - Original overhead rod / roll-hoop air-intake tube & dorsal spine structure above the cockpit.
 * - Red bodywork over the roof crown and intake hood, matching the Rosso Corsa car body.
 * - Integrated wrap-around black smoked-glass cockpit window/canopy around the central bulb-like
 *   cockpit area so the black glazing sits flush inside the red monocoque tub.
 * - Smoothly lofted 3D compound-curved bodywork (zero blocky X-extruded LEGO bricks) where the
 *   front nose, front fenders, central cockpit cell, sculpted sidepods, fastback engine cover,
 *   and rear wheel arches flow together as one continuous racing prototype.
 * - Realistic tire-to-chassis proportions with all four BBS center-lock Michelin wheels aligned
 *   inside the wheel wells and sitting firmly on the road surface (y = 0).
 * - Synchronized daylight-to-dawn material response and subtle road-illuminating beam at dawn.
 */

// Procedural Canvas Texture for Ferrari 499P #51 Le Mans Livery Decals (1024x512)
function createFerrari499PLiveryTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 1024, 512);

  // -------------------------------------------------------------------------
  // 1. FRONT NOSE CIRCULAR #51 ROUNDEL (u in [0..256], v in [0..256])
  // -------------------------------------------------------------------------
  ctx.save();
  ctx.translate(128, 128);

  // Yellow central longitudinal stripe passing behind roundel
  ctx.fillStyle = '#fed100';
  ctx.fillRect(-22, -128, 44, 256);
  ctx.fillStyle = '#111317';
  ctx.fillRect(-25, -128, 3, 256);
  ctx.fillRect(22, -128, 3, 256);

  // Pure white circular roundel with subtle dark drop border
  ctx.beginPath();
  ctx.arc(0, 0, 78, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, -2, 75, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Thin red inner accent ring
  ctx.beginPath();
  ctx.arc(0, -2, 71, 0, Math.PI * 2);
  ctx.strokeStyle = '#d4101b';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Bold racing red "51"
  ctx.fillStyle = '#d4101b';
  ctx.font = 'italic 900 86px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '-4px';
  ctx.fillText('51', 0, 0);

  // Small yellow Ferrari shield badge at bottom of roundel
  ctx.fillStyle = '#fed100';
  ctx.beginPath();
  ctx.roundRect(-10, 48, 20, 24, [2, 2, 8, 8]);
  ctx.fill();
  ctx.fillStyle = '#111317';
  ctx.font = 'bold 9px sans-serif';
  ctx.fillText('SF', 0, 60);

  ctx.restore();

  // -------------------------------------------------------------------------
  // 2. BLUE "ADLER" WING DECALS (u in [256..512], v in [0..128])
  // -------------------------------------------------------------------------
  ctx.save();
  ctx.translate(384, 64);
  ctx.fillStyle = '#0f4ea6';
  ctx.beginPath();
  ctx.roundRect(-110, -32, 220, 64, 8);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'italic 900 38px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '6px';
  ctx.fillText('ADLER', 0, 0);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-85, 0);
  ctx.lineTo(-65, -8);
  ctx.lineTo(-65, 8);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(85, 0);
  ctx.lineTo(65, -8);
  ctx.lineTo(65, 8);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  // -------------------------------------------------------------------------
  // 3. WHITE "RICHARD MILLE" ARCHED SCRIPT (u in [256..512], v in [128..256])
  // -------------------------------------------------------------------------
  ctx.save();
  ctx.translate(384, 192);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "JetBrains Mono", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '4px';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 6;
  ctx.fillText('RICHARD MILLE', 0, 0);
  ctx.restore();

  // -------------------------------------------------------------------------
  // 4. WINDSHIELD SUNSTRIP BANNER "Ferrari" (u in [0..512], v in [256..384])
  // -------------------------------------------------------------------------
  ctx.save();
  ctx.translate(256, 320);
  ctx.fillStyle = '#0d0f12';
  ctx.fillRect(-240, -42, 480, 84);

  ctx.fillStyle = '#d4101b';
  ctx.fillRect(-240, 36, 480, 6);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'italic 900 48px "Orbitron", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '8px';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 8;
  ctx.fillText('Ferrari', 0, -2);
  ctx.restore();

  // -------------------------------------------------------------------------
  // 5. SHELL V-POWER LOGO (u in [0..256], v in [384..512])
  // -------------------------------------------------------------------------
  ctx.save();
  ctx.translate(128, 448);
  ctx.fillStyle = '#fed100';
  ctx.beginPath();
  ctx.arc(0, -18, 26, 0, Math.PI, true);
  ctx.lineTo(0, 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#d4101b';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('V-Power', 0, 24);
  ctx.restore();

  // -------------------------------------------------------------------------
  // 6. SIDE DOOR #51 RECTANGULAR NUMBER PLATE (u in [512..1024], v in [0..256])
  // -------------------------------------------------------------------------
  ctx.save();
  ctx.translate(768, 128);
  ctx.fillStyle = '#fed100';
  ctx.beginPath();
  ctx.roundRect(-160, -90, 320, 180, 14);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(-152, -82, 304, 164, 10);
  ctx.fill();

  ctx.fillStyle = '#d4101b';
  ctx.fillRect(-152, -82, 304, 32);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '3px';
  ctx.fillText('LE MANS 24H • HYPERCAR', 0, -66);

  ctx.fillStyle = '#d4101b';
  ctx.font = 'italic 900 88px "Orbitron", sans-serif';
  ctx.letterSpacing = '-4px';
  ctx.fillText('51', 0, 14);

  const ifw = 54;
  ctx.fillStyle = '#009246';
  ctx.fillRect(-ifw * 1.5, 62, ifw, 10);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-ifw * 0.5, 62, ifw, 10);
  ctx.fillStyle = '#ce2b37';
  ctx.fillRect(ifw * 0.5, 62, ifw, 10);
  ctx.restore();

  // -------------------------------------------------------------------------
  // 7. SCUDERIA FERRARI YELLOW SHIELD (u in [512..768], v in [256..512])
  // -------------------------------------------------------------------------
  ctx.save();
  ctx.translate(640, 384);
  ctx.fillStyle = '#fed100';
  ctx.beginPath();
  ctx.moveTo(-45, -60);
  ctx.lineTo(45, -60);
  ctx.lineTo(45, 10);
  ctx.quadraticCurveTo(45, 65, 0, 80);
  ctx.quadraticCurveTo(-45, 65, -45, 10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#111317';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#009246';
  ctx.fillRect(-42, -58, 28, 10);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-14, -58, 28, 10);
  ctx.fillStyle = '#ce2b37';
  ctx.fillRect(14, -58, 28, 10);

  ctx.fillStyle = '#111317';
  ctx.font = 'bold 42px "Orbitron", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('♞', 0, 10);

  ctx.font = 'bold 16px "Orbitron", sans-serif';
  ctx.fillText('S', -24, 48);
  ctx.fillText('F', 24, 48);
  ctx.restore();

  // -------------------------------------------------------------------------
  // 8. CHROME PRANCING HORSE BADGE (u in [768..1024], v in [256..512])
  // -------------------------------------------------------------------------
  ctx.save();
  ctx.translate(896, 384);
  ctx.fillStyle = '#111317';
  ctx.fillRect(-80, -60, 160, 120);

  const horseGrad = ctx.createLinearGradient(-40, -40, 40, 40);
  horseGrad.addColorStop(0.0, '#ffffff');
  horseGrad.addColorStop(0.5, '#c0c8d4');
  horseGrad.addColorStop(1.0, '#657082');
  ctx.fillStyle = horseGrad;
  ctx.font = 'bold 72px "Orbitron", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('♞', 0, 0);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  return tex;
}

// Procedural Michelin Yellow Tire Sidewall Texture
function createMichelinTireSidewallTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#131519';
  ctx.fillRect(0, 0, 256, 256);

  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, Math.PI * 2);
  ctx.strokeStyle = '#22262e';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#fed100';
  ctx.font = 'bold 16px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '3px';
  ctx.fillText('MICHELIN', 128, 28);
  ctx.fillText('PILOT SPORT', 128, 228);

  ctx.strokeStyle = '#fed100';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(128, 128, 108, -0.4, 0.4);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(128, 128, 108, Math.PI - 0.4, Math.PI + 0.4);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Creates a smooth 3D compound-curved lofted mesh across longitudinal Z stations,
 * where each station defines a rounded cross-section in (X, Y) so there are zero
 * blocky flat-extruded LEGO profiles from any camera angle.
 */
function createLoftedAeroMesh(stations, radialSegs = 28) {
  const numStations = stations.length;
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let s = 0; s < numStations; s++) {
    const st = stations[s];
    const z = st.z;
    const halfW = st.halfWidth;
    const botY = st.botY;
    const topY = st.topY;
    const crownPower = st.crownPower ?? 1.65;
    const sideBulge = st.sideBulge ?? 1.0;
    const vCoord = s / Math.max(1, numStations - 1);

    for (let r = 0; r <= radialSegs; r++) {
      const uCoord = r / radialSegs;
      // theta goes from 0 (bottom-left) -> PI/2 (top-center) -> PI (bottom-right)
      const theta = uCoord * Math.PI;
      const cosT = -Math.cos(theta); // -1 at left, 0 at center, +1 at right
      const sinT = Math.sin(theta);  // 0 at bottom edges, 1 at top crown

      const xSign = Math.sign(cosT);
      const xMag = Math.pow(Math.abs(cosT), sideBulge);
      const x = xSign * xMag * halfW;

      const yCurve = Math.pow(sinT, crownPower);
      const y = botY + (topY - botY) * yCurve;

      positions.push(x, y, z);
      uvs.push(uCoord, vCoord);
    }
  }

  const ringStride = radialSegs + 1;
  for (let s = 0; s < numStations - 1; s++) {
    for (let r = 0; r < radialSegs; r++) {
      const i0 = s * ringStride + r;
      const i1 = i0 + 1;
      const i2 = (s + 1) * ringStride + r;
      const i3 = i2 + 1;
      indices.push(i0, i2, i1);
      indices.push(i1, i2, i3);
    }
  }

  // Cap front and rear ends cleanly
  const rearCenterIdx = positions.length / 3;
  const st0 = stations[0];
  positions.push(0, (st0.botY + st0.topY) * 0.5, st0.z);
  uvs.push(0.5, 0.0);
  for (let r = 0; r < radialSegs; r++) {
    indices.push(rearCenterIdx, r + 1, r);
  }

  const frontCenterIdx = positions.length / 3;
  const stLast = stations[numStations - 1];
  const baseLast = (numStations - 1) * ringStride;
  positions.push(0, (stLast.botY + stLast.topY) * 0.5, stLast.z);
  uvs.push(0.5, 1.0);
  for (let r = 0; r < radialSegs; r++) {
    indices.push(frontCenterIdx, baseLast + r, baseLast + r + 1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates a smooth 3D compound-curved fender arch housing over a front or rear wheel
 * that blends inward into the central monocoque tub and curves down in front of and
 * behind the tire so the wheel sits inside a realistic sculpted wheel well.
 */
function createSculptedFenderPodGeo(side, zCenter, length, innerX, outerX, botY, peakY, wheelRadius) {
  const zSegs = 24;
  const xSegs = 16;
  const positions = [];
  const indices = [];

  const halfLen = length * 0.5;
  for (let iz = 0; iz <= zSegs; iz++) {
    const vz = iz / zSegs;
    const localZ = (vz - 0.5) * length;
    const z = zCenter + localZ;
    //Normalized longitudinal distance from wheel axle [-1..+1]
    const zn = localZ / halfLen;

    // Longitudinal arch envelope: peaks smoothly above wheel axle, curves down at leading & trailing edges
    const archProfile = Math.cos(zn * Math.PI * 0.46);
    const localPeakY = botY + (peakY - botY) * Math.pow(Math.max(0.0, archProfile), 0.78);

    // Wheel-well cutout along the outer flank so the tire sits cleanly framed inside the arch
    const wheelClearanceY =
      Math.abs(localZ) < wheelRadius * 1.18
        ? botY + Math.sqrt(Math.max(0.0, (wheelRadius * 1.16) ** 2 - localZ * localZ)) * 0.92
        : botY;

    // Slight aerodynamic planform taper at nose and tail of fender
    const widthTaper = 0.88 + 0.12 * Math.cos(zn * Math.PI * 0.42);
    const curOuterX = innerX + (outerX - innerX) * widthTaper;

    for (let ix = 0; ix <= xSegs; ix++) {
      const vx = ix / xSegs; // 0 = inner seam inside monocoque, 1 = outer flank
      // Transverse arch curve: rises from inner valley to crest, then wraps down outer flank
      const xAbs = THREE.MathUtils.lerp(innerX, curOuterX, Math.sin(vx * Math.PI * 0.5));
      const x = side * xAbs;

      // Crown peaks at vx ~ 0.58 and wraps down to wheelClearanceY at vx = 1.0
      const transverseDome = Math.sin(vx * Math.PI * 0.82);
      const outerEdgeBlend = Math.pow(vx, 3.2);
      const ySurface = botY + (localPeakY - botY) * Math.pow(transverseDome, 0.65);
      const y = THREE.MathUtils.lerp(ySurface, Math.max(botY, wheelClearanceY), outerEdgeBlend * 0.72);

      positions.push(x, y, z);
    }
  }

  const rowStride = xSegs + 1;
  for (let iz = 0; iz < zSegs; iz++) {
    for (let ix = 0; ix < xSegs; ix++) {
      const i0 = iz * rowStride + ix;
      const i1 = i0 + 1;
      const i2 = (iz + 1) * rowStride + ix;
      const i3 = i2 + 1;
      if (side > 0) {
        indices.push(i0, i1, i2);
        indices.push(i1, i3, i2);
      } else {
        indices.push(i0, i2, i1);
        indices.push(i1, i2, i3);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export function buildMicroKart() {
  const kartRoot = new THREE.Group();
  kartRoot.name = 'Ferrari499PHypercarRoot';

  // Inner suspension, drift yaw & body roll group
  const chassisGroup = new THREE.Group();
  chassisGroup.name = 'FerrariChassisBody';
  kartRoot.add(chassisGroup);

  // -------------------------------------------------------------------------
  // MATERIALS: Realistic Automotive Metallic Paint (MeshPhysicalMaterial),
  // Clearcoat Carbon Fiber, Reflective Smoked Glass Canopy & Forged Alloy Rims
  // -------------------------------------------------------------------------
  const rossoCorsaMat = new THREE.MeshPhysicalMaterial({
    color: 0xc80d15, // Deep Metallic Ferrari Rosso Corsa
    metalness: 0.68,
    roughness: 0.16,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 1.0,
    envMapIntensity: 1.45,
  });

  const gialloModenaMat = new THREE.MeshPhysicalMaterial({
    color: 0xfed100, // Ferrari Giallo Modena Metallic Racing Yellow
    metalness: 0.46,
    roughness: 0.18,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    reflectivity: 0.95,
    envMapIntensity: 1.35,
  });

  const carbonFiberMat = new THREE.MeshPhysicalMaterial({
    color: 0x13171d, // Lacquered Motorsport Carbon Fiber Weave
    metalness: 0.52,
    roughness: 0.30,
    clearcoat: 0.72,
    clearcoatRoughness: 0.16,
    envMapIntensity: 1.15,
  });

  const darkUndertrayMat = new THREE.MeshStandardMaterial({
    color: 0x090b0e,
    roughness: 0.68,
    metalness: 0.28,
    envMapIntensity: 0.75,
  });

  // High-gloss automotive smoked glass cockpit glazing integrated into the central cockpit bulb
  const smokedGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x05070b,
    metalness: 0.28,
    roughness: 0.04,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    reflectivity: 1.0,
    envMapIntensity: 1.75,
  });

  const chromeTitaniumMat = new THREE.MeshPhysicalMaterial({
    color: 0xc8d2e0,
    roughness: 0.12,
    metalness: 0.96,
    clearcoat: 0.5,
    envMapIntensity: 1.55,
  });

  const wheelRimMat = new THREE.MeshPhysicalMaterial({
    color: 0x22262e, // Forged BBS Satin Gunmetal / Dark Anthracite Alloy
    roughness: 0.20,
    metalness: 0.92,
    clearcoat: 0.65,
    clearcoatRoughness: 0.12,
    envMapIntensity: 1.35,
  });

  const wheelNutMat = new THREE.MeshPhysicalMaterial({
    color: 0xfed100, // Anodized Yellow Center-Lock Nut
    roughness: 0.16,
    metalness: 0.88,
    clearcoat: 0.6,
    envMapIntensity: 1.25,
  });

  const brakeDiscMat = new THREE.MeshStandardMaterial({
    color: 0x4c525c, // Carbon-ceramic drilled rotor
    roughness: 0.38,
    metalness: 0.82,
    envMapIntensity: 1.10,
  });

  const brakeCaliperMat = new THREE.MeshPhysicalMaterial({
    color: 0xd4101b, // Anodized Brembo Red Caliper
    roughness: 0.20,
    metalness: 0.62,
    clearcoat: 0.85,
    envMapIntensity: 1.20,
  });

  const tireRubberMat = new THREE.MeshPhysicalMaterial({
    color: 0x111317,
    roughness: 0.76,
    metalness: 0.06,
    clearcoat: 0.08,
    clearcoatRoughness: 0.55,
    envMapIntensity: 0.65,
  });

  const tireSidewallMat = new THREE.MeshStandardMaterial({
    map: createMichelinTireSidewallTexture(),
    roughness: 0.68,
    metalness: 0.08,
    envMapIntensity: 0.65,
  });

  // Quad-LED endurance headlights (top white DRL bar + quad diode cluster)
  const drlLightbarMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xfff6e5,
    emissiveIntensity: 0.82,
    roughness: 0.10,
  });

  const quadLedDiodeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xfff2d6,
    emissiveIntensity: 0.74,
    roughness: 0.10,
  });

  const headlightLensMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.04,
    metalness: 0.12,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    transparent: true,
    opacity: 0.88,
    envMapIntensity: 1.65,
  });

  const taillightEmissiveMat = new THREE.MeshStandardMaterial({
    color: 0xff1a24,
    emissive: 0xe60012,
    emissiveIntensity: 0.95,
    roughness: 0.16,
  });

  const fiaRainLightMat = new THREE.MeshStandardMaterial({
    color: 0xff222b,
    emissive: 0xff111e,
    emissiveIntensity: 0.88,
    roughness: 0.18,
  });

  // Livery Decal Texture
  const liveryTex = createFerrari499PLiveryTexture();
  function createDecalMat(uMin, uMax, vMin, vMax) {
    const texClone = liveryTex.clone();
    texClone.repeat.set(uMax - uMin, vMax - vMin);
    texClone.offset.set(uMin, vMin);
    texClone.needsUpdate = true;
    return new THREE.MeshStandardMaterial({
      map: texClone,
      transparent: true,
      roughness: 0.22,
      metalness: 0.25,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -3,
      polygonOffsetUnits: -3,
    });
  }

  const noseRoundelMat = createDecalMat(0.0, 0.25, 0.5, 1.0);
  const adlerMat = createDecalMat(0.25, 0.50, 0.75, 1.0);
  const richardMilleMat = createDecalMat(0.25, 0.50, 0.50, 0.75);
  const windshieldBannerMat = createDecalMat(0.0, 0.50, 0.25, 0.50);
  const shellVPowerMat = createDecalMat(0.0, 0.25, 0.0, 0.25);
  const sideNumberMat = createDecalMat(0.50, 1.0, 0.50, 1.0);
  const scuderiaShieldMat = createDecalMat(0.50, 0.75, 0.0, 0.50);
  const frontHorseMat = createDecalMat(0.75, 1.0, 0.0, 0.50);

  // -------------------------------------------------------------------------
  // CONTACT SHADOW DECAL (Wide Footprint for Le Mans Prototype)
  // -------------------------------------------------------------------------
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  const sCtx = shadowCanvas.getContext('2d');
  sCtx.clearRect(0, 0, 256, 256);

  sCtx.save();
  sCtx.translate(128, 128);
  sCtx.scale(0.88, 1.18);
  const penumbraGrad = sCtx.createRadialGradient(0, 0, 20, 0, 0, 114);
  penumbraGrad.addColorStop(0.0, 'rgba(2, 2, 6, 0.94)');
  penumbraGrad.addColorStop(0.55, 'rgba(3, 3, 7, 0.78)');
  penumbraGrad.addColorStop(0.82, 'rgba(5, 5, 10, 0.32)');
  penumbraGrad.addColorStop(1.0, 'rgba(6, 6, 12, 0.0)');
  sCtx.fillStyle = penumbraGrad;
  sCtx.beginPath();
  sCtx.arc(0, 0, 114, 0, Math.PI * 2);
  sCtx.fill();
  sCtx.restore();

  const kartShadowTex = new THREE.CanvasTexture(shadowCanvas);
  const kartShadowQuad = new THREE.Mesh(
    new THREE.PlaneGeometry(0.0195, 0.0365),
    new THREE.MeshBasicMaterial({
      map: kartShadowTex,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -8,
      polygonOffsetUnits: -8,
    })
  );
  kartShadowQuad.rotation.x = -Math.PI / 2;
  kartShadowQuad.position.set(0, 0.00055, 0);
  kartRoot.add(kartShadowQuad);

  const proceduralParts = [];

  // -------------------------------------------------------------------------
  // 1. CARBON FIBER GROUND-EFFECT FLOOR PAN, FRONT SPLITTER & SIDE SKIRTS
  // -------------------------------------------------------------------------
  const floorPanGeo = createLoftedAeroMesh(
    [
      { z: -0.0158, halfWidth: 0.0068, botY: 0.00075, topY: 0.00145, crownPower: 0.45, sideBulge: 0.55 },
      { z: -0.0088, halfWidth: 0.0064, botY: 0.00075, topY: 0.00145, crownPower: 0.45, sideBulge: 0.55 },
      { z:  0.0000, halfWidth: 0.0073, botY: 0.00075, topY: 0.00150, crownPower: 0.45, sideBulge: 0.55 },
      { z:  0.0088, halfWidth: 0.0064, botY: 0.00075, topY: 0.00145, crownPower: 0.45, sideBulge: 0.55 },
      { z:  0.0168, halfWidth: 0.0074, botY: 0.00075, topY: 0.00135, crownPower: 0.45, sideBulge: 0.55 },
      { z:  0.0178, halfWidth: 0.0068, botY: 0.00080, topY: 0.00125, crownPower: 0.45, sideBulge: 0.55 },
    ],
    20
  );
  const floorPan = new THREE.Mesh(floorPanGeo, darkUndertrayMat);
  floorPan.castShadow = true;
  chassisGroup.add(floorPan);
  proceduralParts.push(floorPan);

  // Sculpted Front Splitter Wing & Side Diveplanes
  for (const side of [-1, 1]) {
    const endplate = new THREE.Mesh(
      new THREE.BoxGeometry(0.00035, 0.0021, 0.0048),
      carbonFiberMat
    );
    endplate.position.set(side * 0.00735, 0.0018, 0.0148);
    chassisGroup.add(endplate);
    proceduralParts.push(endplate);

    const canard = new THREE.Mesh(
      new THREE.BoxGeometry(0.0018, 0.00026, 0.0030),
      carbonFiberMat
    );
    canard.position.set(side * 0.0068, 0.0025, 0.0142);
    canard.rotation.z = side * 0.20;
    canard.rotation.x = -0.16;
    chassisGroup.add(canard);
    proceduralParts.push(canard);

    // Giallo Modena Yellow Rocker Pinstripe along lower side skirt
    const skirtStripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.00028, 0.00036, 0.0124),
      gialloModenaMat
    );
    skirtStripe.position.set(side * 0.00738, 0.00115, 0.0000);
    chassisGroup.add(skirtStripe);
    proceduralParts.push(skirtStripe);
  }

  // Central Chrome Ferrari Prancing Horse in Front Grille Mouth
  const grilleHorse = new THREE.Mesh(
    new THREE.PlaneGeometry(0.0016, 0.0016),
    frontHorseMat
  );
  grilleHorse.position.set(0, 0.00165, 0.01785);
  chassisGroup.add(grilleHorse);
  proceduralParts.push(grilleHorse);

  // -------------------------------------------------------------------------
  // 2. CONTINUOUS 3D LOFTED CENTRAL MONOCOQUE, NOSE CONE, SIDEPOD BELT & FASTBACK
  //    (Compound-curved in X, Y, Z so it never looks like a rectangular block!)
  // -------------------------------------------------------------------------
  // Lower & Mid Full-Width Sculpted Body Tub connecting left sidepod -> center -> right sidepod
  const mainBodyTubGeo = createLoftedAeroMesh(
    [
      { z: -0.0160, halfWidth: 0.0068, botY: 0.0012, topY: 0.00335, crownPower: 0.72, sideBulge: 0.72 },
      { z: -0.0128, halfWidth: 0.0066, botY: 0.0011, topY: 0.00365, crownPower: 0.78, sideBulge: 0.75 },
      { z: -0.0088, halfWidth: 0.0056, botY: 0.0011, topY: 0.00385, crownPower: 0.82, sideBulge: 0.78 },
      { z: -0.0046, halfWidth: 0.0071, botY: 0.0011, topY: 0.00395, crownPower: 0.76, sideBulge: 0.68 },
      { z:  0.0000, halfWidth: 0.0073, botY: 0.0011, topY: 0.00405, crownPower: 0.74, sideBulge: 0.66 },
      { z:  0.0048, halfWidth: 0.0071, botY: 0.0011, topY: 0.00395, crownPower: 0.76, sideBulge: 0.68 },
      { z:  0.0088, halfWidth: 0.0054, botY: 0.0011, topY: 0.00365, crownPower: 0.85, sideBulge: 0.78 },
      { z:  0.0132, halfWidth: 0.0045, botY: 0.0011, topY: 0.00315, crownPower: 0.90, sideBulge: 0.82 },
      { z:  0.0166, halfWidth: 0.0036, botY: 0.0011, topY: 0.00225, crownPower: 0.95, sideBulge: 0.85 },
      { z:  0.0176, halfWidth: 0.0026, botY: 0.0011, topY: 0.00175, crownPower: 1.00, sideBulge: 0.90 },
    ],
    32
  );
  const mainBodyTub = new THREE.Mesh(mainBodyTubGeo, rossoCorsaMat);
  mainBodyTub.castShadow = true;
  mainBodyTub.receiveShadow = true;
  chassisGroup.add(mainBodyTub);
  proceduralParts.push(mainBodyTub);

  // Central Tapered Fastback Engine Spine & Nose Crest (smoothly domed along X and Z)
  const centralSpineGeo = createLoftedAeroMesh(
    [
      { z: -0.0156, halfWidth: 0.0028, botY: 0.0026, topY: 0.00355, crownPower: 1.15, sideBulge: 0.88 },
      { z: -0.0115, halfWidth: 0.0034, botY: 0.0026, topY: 0.00415, crownPower: 1.20, sideBulge: 0.90 },
      { z: -0.0070, halfWidth: 0.0039, botY: 0.0026, topY: 0.00475, crownPower: 1.22, sideBulge: 0.92 },
      { z: -0.0032, halfWidth: 0.0042, botY: 0.0028, topY: 0.00535, crownPower: 1.18, sideBulge: 0.90 },
      { z:  0.0052, halfWidth: 0.0041, botY: 0.0028, topY: 0.00445, crownPower: 1.15, sideBulge: 0.90 },
      { z:  0.0096, halfWidth: 0.0035, botY: 0.0022, topY: 0.00395, crownPower: 1.10, sideBulge: 0.88 },
      { z:  0.0142, halfWidth: 0.0029, botY: 0.0018, topY: 0.00315, crownPower: 1.08, sideBulge: 0.88 },
      { z:  0.0172, halfWidth: 0.0020, botY: 0.0013, topY: 0.00205, crownPower: 1.05, sideBulge: 0.90 },
    ],
    28
  );
  const centralSpine = new THREE.Mesh(centralSpineGeo, rossoCorsaMat);
  centralSpine.castShadow = true;
  centralSpine.receiveShadow = true;
  chassisGroup.add(centralSpine);
  proceduralParts.push(centralSpine);

  // Central Giallo Modena yellow racing stripe contoured along the nose
  const noseYellowStripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.0012, 0.00016, 0.0092),
    gialloModenaMat
  );
  noseYellowStripe.position.set(0, 0.00355, 0.0114);
  noseYellowStripe.rotation.x = 0.17;
  chassisGroup.add(noseYellowStripe);
  proceduralParts.push(noseYellowStripe);

  // Circular #51 Roundel Decal Plane on Nose
  const noseRoundel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.0044, 0.0044),
    noseRoundelMat
  );
  noseRoundel.position.set(0, 0.00368, 0.0116);
  noseRoundel.rotation.x = -Math.PI / 2 + 0.17;
  chassisGroup.add(noseRoundel);
  proceduralParts.push(noseRoundel);

  // -------------------------------------------------------------------------
  // 3. INTEGRATED CENTRAL COCKPIT BULB:
  //    - Wrap-Around Black Cockpit Glazing Window around the central bulb
  //    - Red Bodywork Over the Roof Crown & Roof Air Intake Scoop
  //    - Original Rod-Like Structure & Dorsal Spine Fin Above the Cockpit
  // -------------------------------------------------------------------------
  // 3A. Lower Red Cockpit Surround Collar blending smoothly into the monocoque tub
  const cockpitCollarGeo = createLoftedAeroMesh(
    [
      { z: -0.0062, halfWidth: 0.0034, botY: 0.0030, topY: 0.0046, crownPower: 1.15, sideBulge: 0.88 },
      { z: -0.0028, halfWidth: 0.0042, botY: 0.0030, topY: 0.0049, crownPower: 1.10, sideBulge: 0.86 },
      { z:  0.0010, halfWidth: 0.0043, botY: 0.0030, topY: 0.0048, crownPower: 1.10, sideBulge: 0.86 },
      { z:  0.0048, halfWidth: 0.0039, botY: 0.0029, topY: 0.0044, crownPower: 1.12, sideBulge: 0.88 },
      { z:  0.0074, halfWidth: 0.0030, botY: 0.0028, topY: 0.0038, crownPower: 1.18, sideBulge: 0.90 },
    ],
    28
  );
  const cockpitCollar = new THREE.Mesh(cockpitCollarGeo, rossoCorsaMat);
  cockpitCollar.castShadow = true;
  cockpitCollar.receiveShadow = true;
  chassisGroup.add(cockpitCollar);
  proceduralParts.push(cockpitCollar);

  // 3B. Black Smoked-Glass Cockpit Window/Canopy wrapping smoothly around the central bulb-like cockpit
  const canopyWindowGeo = createLoftedAeroMesh(
    [
      { z: -0.0046, halfWidth: 0.0024, botY: 0.0038, topY: 0.00545, crownPower: 1.05, sideBulge: 0.88 },
      { z: -0.0016, halfWidth: 0.0035, botY: 0.0038, topY: 0.00585, crownPower: 1.02, sideBulge: 0.85 },
      { z:  0.0014, halfWidth: 0.0036, botY: 0.0037, topY: 0.00580, crownPower: 1.02, sideBulge: 0.85 },
      { z:  0.0042, halfWidth: 0.0032, botY: 0.0036, topY: 0.00525, crownPower: 1.06, sideBulge: 0.88 },
      { z:  0.0064, halfWidth: 0.0022, botY: 0.0035, topY: 0.00425, crownPower: 1.12, sideBulge: 0.92 },
    ],
    28
  );
  const canopyMesh = new THREE.Mesh(canopyWindowGeo, smokedGlassMat);
  canopyMesh.castShadow = true;
  chassisGroup.add(canopyMesh);
  proceduralParts.push(canopyMesh);

  // Red A-Pillar & Rear Window Frame Strips integrating the black cockpit glazing into the red body
  for (const side of [-1, 1]) {
    const bPillarArch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.00022, 0.00028, 0.0032, 10),
      rossoCorsaMat
    );
    bPillarArch.position.set(side * 0.0027, 0.0049, -0.0024);
    bPillarArch.rotation.z = side * 0.52;
    bPillarArch.rotation.x = -0.35;
    chassisGroup.add(bPillarArch);
    proceduralParts.push(bPillarArch);
  }

  // 3C. RED BODYWORK OVER THE ROOF CROWN (matching the red car body above the black cockpit window!)
  const redRoofCapGeo = createLoftedAeroMesh(
    [
      { z: -0.0068, halfWidth: 0.0015, botY: 0.0046, topY: 0.00535, crownPower: 1.10, sideBulge: 0.90 },
      { z: -0.0035, halfWidth: 0.0024, botY: 0.0051, topY: 0.00595, crownPower: 0.95, sideBulge: 0.88 },
      { z: -0.0004, halfWidth: 0.0027, botY: 0.0053, topY: 0.00612, crownPower: 0.92, sideBulge: 0.86 },
      { z:  0.0024, halfWidth: 0.0024, botY: 0.0052, topY: 0.00592, crownPower: 0.95, sideBulge: 0.88 },
      { z:  0.0038, halfWidth: 0.0018, botY: 0.0049, topY: 0.00555, crownPower: 1.05, sideBulge: 0.92 },
    ],
    22
  );
  const redRoofCap = new THREE.Mesh(redRoofCapGeo, rossoCorsaMat);
  redRoofCap.castShadow = true;
  redRoofCap.receiveShadow = true;
  chassisGroup.add(redRoofCap);
  proceduralParts.push(redRoofCap);

  // Red Roof Air-Intake Scoop Hood on top of the red roof
  const roofScoopGeo = createLoftedAeroMesh(
    [
      { z: -0.0062, halfWidth: 0.00075, botY: 0.0052, topY: 0.00625, crownPower: 0.95, sideBulge: 0.85 },
      { z: -0.0022, halfWidth: 0.00105, botY: 0.0056, topY: 0.00658, crownPower: 0.90, sideBulge: 0.85 },
      { z:  0.0016, halfWidth: 0.00118, botY: 0.0057, topY: 0.00668, crownPower: 0.88, sideBulge: 0.85 },
      { z:  0.0026, halfWidth: 0.00105, botY: 0.0056, topY: 0.00652, crownPower: 0.90, sideBulge: 0.85 },
    ],
    16
  );
  const roofScoop = new THREE.Mesh(roofScoopGeo, rossoCorsaMat);
  roofScoop.castShadow = true;
  chassisGroup.add(roofScoop);
  proceduralParts.push(roofScoop);

  // Dark Carbon Air-Intake Mouth at front of Roof Scoop
  const scoopMouth = new THREE.Mesh(
    new THREE.BoxGeometry(0.0015, 0.00065, 0.0004),
    carbonFiberMat
  );
  scoopMouth.position.set(0, 0.00615, 0.00255);
  chassisGroup.add(scoopMouth);
  proceduralParts.push(scoopMouth);

  // 3D. RESTORED ORIGINAL ROD-LIKE STRUCTURE ABOVE THE COCKPIT & DORSAL SPINE ASSEMBLY
  // Overhead tubular aero rod / roll-hoop structure above the cockpit extending back to the rear wing
  const overheadRodCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.00615,  0.0034), // Anchored at front roof crown above windshield
    new THREE.Vector3(0, 0.00695,  0.0014), // Rising into the rod structure above the cockpit
    new THREE.Vector3(0, 0.00688, -0.0038), // Extending smoothly above the rear cockpit & engine spine
    new THREE.Vector3(0, 0.00675, -0.0098), // Continuing along top of dorsal spine
    new THREE.Vector3(0, 0.00668, -0.0150), // Joining the center of the high-downforce rear wing
  ]);
  const overheadRodGeo = new THREE.TubeGeometry(overheadRodCurve, 28, 0.00034, 12, false);
  const overheadRodMesh = new THREE.Mesh(overheadRodGeo, rossoCorsaMat);
  overheadRodMesh.castShadow = true;
  chassisGroup.add(overheadRodMesh);
  proceduralParts.push(overheadRodMesh);

  // Upper Giallo Modena yellow & chrome accent rod running atop the overhead cockpit rod structure
  const upperAccentRodCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.00655,  0.0026),
    new THREE.Vector3(0, 0.00722,  0.0008),
    new THREE.Vector3(0, 0.00712, -0.0045),
    new THREE.Vector3(0, 0.00695, -0.0102),
    new THREE.Vector3(0, 0.00685, -0.0148),
  ]);
  const upperAccentRodGeo = new THREE.TubeGeometry(upperAccentRodCurve, 24, 0.00018, 10, false);
  const upperAccentRod = new THREE.Mesh(upperAccentRodGeo, gialloModenaMat);
  upperAccentRod.castShadow = true;
  chassisGroup.add(upperAccentRod);
  proceduralParts.push(upperAccentRod);

  // Forward Aero Pitot / Roll-Hoop Telemetry Mast at the leading peak of the cockpit rod structure
  const pitotRod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.00010, 0.00014, 0.0024, 8),
    chromeTitaniumMat
  );
  pitotRod.rotation.x = Math.PI / 2 - 0.12;
  pitotRod.position.set(0, 0.00718, 0.0032);
  chassisGroup.add(pitotRod);
  proceduralParts.push(pitotRod);

  // Sculpted Dorsal Shark-Fin Web connecting the overhead rod structure to the fastback engine cover
  const finShape = new THREE.Shape();
  finShape.moveTo(-0.0005, 0.0056);
  finShape.lineTo(-0.0005, 0.00685);
  finShape.bezierCurveTo(-0.0050, 0.00680, -0.0105, 0.00672, -0.0149, 0.00665);
  finShape.lineTo(-0.0149, 0.0034);
  finShape.bezierCurveTo(-0.0105, 0.0039, -0.0055, 0.0046, -0.0005, 0.0056);
  finShape.closePath();

  const finGeo = new THREE.ExtrudeGeometry(finShape, {
    depth: 0.00032,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.00008,
    bevelThickness: 0.00008,
  });
  const fPos = finGeo.attributes.position;
  for (let i = 0; i < fPos.count; i++) {
    const zC = fPos.getX(i);
    const yC = fPos.getY(i);
    const xC = fPos.getZ(i) - 0.00016;
    fPos.setXYZ(i, xC, yC, zC);
  }
  finGeo.computeVertexNormals();
  const dorsalFin = new THREE.Mesh(finGeo, carbonFiberMat);
  dorsalFin.castShadow = true;
  chassisGroup.add(dorsalFin);
  proceduralParts.push(dorsalFin);

  // Black Windshield Sunstrip Banner featuring white "Ferrari" script
  const windshieldBanner = new THREE.Mesh(
    new THREE.PlaneGeometry(0.0046, 0.00125),
    windshieldBannerMat
  );
  windshieldBanner.position.set(0, 0.00548, 0.00385);
  windshieldBanner.rotation.x = -Math.PI / 2 + 0.44;
  chassisGroup.add(windshieldBanner);
  proceduralParts.push(windshieldBanner);

  // Diagonal Single Center Windshield Wiper Arm
  const wiperArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.00016, 0.00016, 0.0038),
    carbonFiberMat
  );
  wiperArm.position.set(0.0003, 0.00515, 0.0039);
  wiperArm.rotation.x = -0.38;
  wiperArm.rotation.y = 0.24;
  chassisGroup.add(wiperArm);
  proceduralParts.push(wiperArm);

  // Sculpted Aerodynamic Side View Mirrors in Rosso Corsa on Black Stalks
  const mirrorPodGeo = new THREE.SphereGeometry(0.00078, 16, 12);
  mirrorPodGeo.scale(1.05, 0.56, 1.50);
  for (const side of [-1, 1]) {
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.00015, 0.00020, 0.0016, 8),
      carbonFiberMat
    );
    stem.position.set(side * 0.0039, 0.0044, 0.0032);
    stem.rotation.z = -side * 1.15;
    chassisGroup.add(stem);
    proceduralParts.push(stem);

    const mirrorCap = new THREE.Mesh(mirrorPodGeo, rossoCorsaMat);
    mirrorCap.position.set(side * 0.0047, 0.0046, 0.0032);
    chassisGroup.add(mirrorCap);
    proceduralParts.push(mirrorCap);
  }

  // -------------------------------------------------------------------------
  // 4. COMPOUND-CURVED 3D FRONT & REAR WHEEL ARCH FENDERS & RADIATOR INTAKES
  //    (Smoothly domed in 3D, framing the four tires without blocky seams)
  // -------------------------------------------------------------------------
  const frontAxleZ = 0.0090;
  const rearAxleZ = -0.0090;
  const frontWheelRadius = 0.00235;
  const rearWheelRadius = 0.00250;

  for (const side of [-1, 1]) {
    // 4A. Sculpted 3D Front Fender Arch Housing
    const frontFenderGeo = createSculptedFenderPodGeo(
      side,
      frontAxleZ,
      0.0118,          // spans z = +0.0031 to +0.0149
      0.0026,          // blends seamlessly inside central nose/tub
      0.00745,         // wraps cleanly to outer tire width
      0.0011,          // floor level
      0.00495,         // smooth aerodynamic front fender crest
      frontWheelRadius
    );
    const frontFender = new THREE.Mesh(frontFenderGeo, rossoCorsaMat);
    frontFender.castShadow = true;
    frontFender.receiveShadow = true;
    chassisGroup.add(frontFender);
    proceduralParts.push(frontFender);

    // 4B. Sculpted 3D Rear Fender Haunch Housing
    const rearFenderGeo = createSculptedFenderPodGeo(
      side,
      rearAxleZ - 0.0004,
      0.0128,          // spans z = -0.0158 to -0.0030
      0.0024,          // blends seamlessly into fastback spine
      0.00755,         // wraps cleanly to outer rear tire width
      0.0011,          // floor level
      0.00515,         // muscular Le Mans hypercar rear haunch crest
      rearWheelRadius
    );
    const rearFender = new THREE.Mesh(rearFenderGeo, rossoCorsaMat);
    rearFender.castShadow = true;
    rearFender.receiveShadow = true;
    chassisGroup.add(rearFender);
    proceduralParts.push(rearFender);

    const archX = side * 0.0054;

    // Front Wheel Arch Cooling Louvers (3 recessed carbon slits)
    for (let l = -1; l <= 1; l++) {
      const louver = new THREE.Mesh(
        new THREE.BoxGeometry(0.0019, 0.00018, 0.00042),
        carbonFiberMat
      );
      louver.position.set(archX, 0.00492, frontAxleZ + l * 0.0013);
      louver.rotation.x = -0.22;
      louver.rotation.z = -side * 0.14;
      chassisGroup.add(louver);
      proceduralParts.push(louver);
    }

    // Rear Haunch Cooling Louvers
    for (let l = -1; l <= 1; l++) {
      const vent = new THREE.Mesh(
        new THREE.BoxGeometry(0.0017, 0.00015, 0.00042),
        carbonFiberMat
      );
      vent.position.set(archX - side * 0.0004, 0.00495, rearAxleZ + l * 0.0013);
      vent.rotation.x = 0.15;
      vent.rotation.z = -side * 0.12;
      chassisGroup.add(vent);
      proceduralParts.push(vent);
    }

    // Carbon Sidepod Radiator Inlet Duct Scoop
    const sideIntake = new THREE.Mesh(
      new THREE.BoxGeometry(0.0018, 0.0015, 0.0018),
      carbonFiberMat
    );
    sideIntake.position.set(side * 0.0052, 0.0029, 0.0042);
    sideIntake.rotation.y = side * 0.20;
    chassisGroup.add(sideIntake);
    proceduralParts.push(sideIntake);

    // BLUE "ADLER" WING DECAL above front headlights
    const adlerDecal = new THREE.Mesh(
      new THREE.PlaneGeometry(0.0026, 0.00095),
      adlerMat
    );
    adlerDecal.position.set(archX, 0.00395, frontAxleZ + 0.0034);
    adlerDecal.rotation.x = -Math.PI / 2 + 0.36;
    adlerDecal.rotation.y = -side * 0.10;
    chassisGroup.add(adlerDecal);
    proceduralParts.push(adlerDecal);

    // "RICHARD MILLE" WHITE SCRIPT along upper front fender crest
    const rmDecal = new THREE.Mesh(
      new THREE.PlaneGeometry(0.0028, 0.00078),
      richardMilleMat
    );
    rmDecal.position.set(archX, 0.00498, frontAxleZ + 0.0006);
    rmDecal.rotation.x = -Math.PI / 2 + 0.08;
    rmDecal.rotation.z = -side * 0.08;
    chassisGroup.add(rmDecal);
    proceduralParts.push(rmDecal);

    // "SHELL V-POWER" DECAL on lower front bumper flank
    const shellDecal = new THREE.Mesh(
      new THREE.PlaneGeometry(0.0016, 0.00125),
      shellVPowerMat
    );
    shellDecal.position.set(side * 0.00735, 0.0022, frontAxleZ + 0.0032);
    shellDecal.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
    chassisGroup.add(shellDecal);
    proceduralParts.push(shellDecal);

    // SCUDERIA FERRARI YELLOW SHIELD on front fender side
    const sfShield = new THREE.Mesh(
      new THREE.PlaneGeometry(0.00145, 0.0018),
      scuderiaShieldMat
    );
    sfShield.position.set(side * 0.00735, 0.0032, frontAxleZ - 0.0024);
    sfShield.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
    chassisGroup.add(sfShield);
    proceduralParts.push(sfShield);

    // Door Race Number Plate (#51) on sculpted sidepod flank
    const doorDecal = new THREE.Mesh(
      new THREE.PlaneGeometry(0.0042, 0.0022),
      sideNumberMat
    );
    doorDecal.position.set(side * 0.00732, 0.0027, 0.0000);
    doorDecal.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
    chassisGroup.add(doorDecal);
    proceduralParts.push(doorDecal);

    // -----------------------------------------------------------------------
    // QUAD-LED ENDURANCE HEADLIGHT CLUSTER
    // -----------------------------------------------------------------------
    const hHousing = new THREE.Mesh(
      new THREE.BoxGeometry(0.0023, 0.00105, 0.0011),
      carbonFiberMat
    );
    hHousing.position.set(archX, 0.00245, frontAxleZ + 0.0044);
    hHousing.rotation.x = 0.20;
    chassisGroup.add(hHousing);
    proceduralParts.push(hHousing);

    const drlBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.0022, 0.00024, 0.00038),
      drlLightbarMat
    );
    drlBar.position.set(archX, 0.00288, frontAxleZ + 0.0049);
    drlBar.rotation.y = -side * 0.14;
    chassisGroup.add(drlBar);
    proceduralParts.push(drlBar);

    for (const dx of [-0.00055, 0.00055]) {
      for (const dy of [-0.00018, 0.00018]) {
        const diode = new THREE.Mesh(
          new THREE.BoxGeometry(0.00042, 0.00032, 0.00038),
          quadLedDiodeMat
        );
        diode.position.set(archX + dx, 0.00235 + dy, frontAxleZ + 0.0049);
        chassisGroup.add(diode);
        proceduralParts.push(diode);
      }
    }

    const lens = new THREE.Mesh(
      new THREE.BoxGeometry(0.0023, 0.00105, 0.00028),
      headlightLensMat
    );
    lens.position.set(archX, 0.00250, frontAxleZ + 0.00515);
    lens.rotation.x = 0.22;
    chassisGroup.add(lens);
    proceduralParts.push(lens);
  }

  // -------------------------------------------------------------------------
  // 5. UNIFIED REAR FASCIA, DIFFUSER TUNNELS & SWAN-NECK REAR WING
  // -------------------------------------------------------------------------
  const rearFasciaBridge = new THREE.Mesh(
    new THREE.BoxGeometry(0.0138, 0.0016, 0.0020),
    carbonFiberMat
  );
  rearFasciaBridge.position.set(0, 0.00255, -0.0151);
  chassisGroup.add(rearFasciaBridge);
  proceduralParts.push(rearFasciaBridge);

  // 4 slim aerodynamic vertical diffuser strakes tucked neatly under the rear tail
  for (const s of [-1.5, -0.5, 0.5, 1.5]) {
    const strake = new THREE.Mesh(
      new THREE.BoxGeometry(0.00022, 0.0011, 0.0038),
      carbonFiberMat
    );
    strake.position.set(s * 0.0026, 0.00135, -0.0142);
    strake.rotation.x = -0.08;
    chassisGroup.add(strake);
    proceduralParts.push(strake);
  }

  const wingZ = -0.0152;
  const wingY = 0.0065;
  const wingSpan = 0.0150;

  // Cambered 3D Airfoil Rear Wing Mainplane
  const wingShape = new THREE.Shape();
  wingShape.moveTo(wingZ + 0.0017, wingY - 0.0001);
  wingShape.bezierCurveTo(
    wingZ + 0.0007, wingY - 0.00028,
    wingZ - 0.0006, wingY + 0.00008,
    wingZ - 0.0017, wingY + 0.00048
  );
  wingShape.lineTo(wingZ - 0.0017, wingY + 0.00074);
  wingShape.bezierCurveTo(
    wingZ + 0.0004, wingY + 0.00026,
    wingZ + 0.0013, wingY + 0.00008,
    wingZ + 0.0017, wingY - 0.0001
  );
  wingShape.closePath();

  const wingGeo = new THREE.ExtrudeGeometry(wingShape, {
    depth: wingSpan,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.00008,
    bevelThickness: 0.00008,
  });
  const wPos = wingGeo.attributes.position;
  for (let i = 0; i < wPos.count; i++) {
    const zC = wPos.getX(i);
    const yC = wPos.getY(i);
    const xC = wPos.getZ(i) - wingSpan * 0.5;
    wPos.setXYZ(i, xC, yC, zC);
  }
  wingGeo.computeVertexNormals();

  const mainWing = new THREE.Mesh(wingGeo, carbonFiberMat);
  mainWing.castShadow = true;
  chassisGroup.add(mainWing);
  proceduralParts.push(mainWing);

  // Giallo Modena trailing-edge trim line on main wing
  const wingTrim = new THREE.Mesh(
    new THREE.BoxGeometry(wingSpan - 0.0004, 0.00016, 0.00040),
    gialloModenaMat
  );
  wingTrim.position.set(0, wingY + 0.00064, wingZ - 0.0015);
  chassisGroup.add(wingTrim);
  proceduralParts.push(wingTrim);

  // Swan-neck mounting pylons & sculpted swept endplates
  const pylonShape = new THREE.Shape();
  pylonShape.moveTo(-0.0116, 0.0038);
  pylonShape.quadraticCurveTo(-0.0130, 0.0064, -0.0146, 0.00665);
  pylonShape.lineTo(-0.0152, 0.0062);
  pylonShape.quadraticCurveTo(-0.0136, 0.0055, -0.0126, 0.0036);
  pylonShape.closePath();
  const pylonGeo = new THREE.ExtrudeGeometry(pylonShape, { depth: 0.00024, bevelEnabled: false });
  const pPos = pylonGeo.attributes.position;
  for (let i = 0; i < pPos.count; i++) {
    const zC = pPos.getX(i);
    const yC = pPos.getY(i);
    const xC = pPos.getZ(i) - 0.00012;
    pPos.setXYZ(i, xC, yC, zC);
  }
  pylonGeo.computeVertexNormals();

  const endplateShape = new THREE.Shape();
  endplateShape.moveTo(wingZ + 0.0020, wingY - 0.0020);
  endplateShape.lineTo(wingZ + 0.0013, wingY + 0.0010);
  endplateShape.lineTo(wingZ - 0.0020, wingY + 0.0013);
  endplateShape.lineTo(wingZ - 0.0023, wingY - 0.0015);
  endplateShape.closePath();
  const endplateGeo = new THREE.ExtrudeGeometry(endplateShape, {
    depth: 0.00026,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.00005,
    bevelThickness: 0.00005,
  });
  const epPos = endplateGeo.attributes.position;
  for (let i = 0; i < epPos.count; i++) {
    const zC = epPos.getX(i);
    const yC = epPos.getY(i);
    const xC = epPos.getZ(i) - 0.00013;
    epPos.setXYZ(i, xC, yC, zC);
  }
  endplateGeo.computeVertexNormals();

  for (const side of [-1, 1]) {
    const pylon = new THREE.Mesh(pylonGeo, carbonFiberMat);
    pylon.position.set(side * 0.0024, 0, 0);
    chassisGroup.add(pylon);
    proceduralParts.push(pylon);

    const endplate = new THREE.Mesh(endplateGeo, rossoCorsaMat);
    endplate.position.set(side * (wingSpan * 0.5 + 0.0001), 0, 0);
    endplate.castShadow = true;
    chassisGroup.add(endplate);
    proceduralParts.push(endplate);
  }

  // -------------------------------------------------------------------------
  // 6. RAZOR-SLIM HORIZONTAL LED TAILLIGHT BAR & DUAL SIDE FIA RAIN LIGHTS
  // -------------------------------------------------------------------------
  const centerLightbar = new THREE.Mesh(
    new THREE.BoxGeometry(0.0134, 0.00026, 0.00032),
    taillightEmissiveMat
  );
  centerLightbar.position.set(0, 0.00332, -0.01605);
  chassisGroup.add(centerLightbar);
  proceduralParts.push(centerLightbar);

  for (const side of [-1, 1]) {
    const sideLedBlade = new THREE.Mesh(
      new THREE.BoxGeometry(0.0017, 0.00024, 0.00032),
      taillightEmissiveMat
    );
    sideLedBlade.position.set(side * 0.0061, 0.00320, -0.01595);
    sideLedBlade.rotation.z = -side * 0.14;
    chassisGroup.add(sideLedBlade);
    proceduralParts.push(sideLedBlade);
  }

  // Dual recessed blinking red FIA rain lights on both left and right sides
  const fiaRainLights = [];
  for (const side of [-1, 1]) {
    const sideRainLight = new THREE.Mesh(
      new THREE.BoxGeometry(0.00085, 0.00050, 0.00032),
      fiaRainLightMat
    );
    sideRainLight.position.set(side * 0.0050, 0.00192, -0.01605);
    chassisGroup.add(sideRainLight);
    proceduralParts.push(sideRainLight);
    fiaRainLights.push(sideRainLight);
  }

  // Twin recessed titanium exhaust tailpipes above rear lightbar
  for (const side of [-1, 1]) {
    const exhaustPipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.00044, 0.00048, 0.0013, 12),
      brakeDiscMat
    );
    exhaustPipe.rotation.x = Math.PI / 2;
    exhaustPipe.position.set(side * 0.0021, 0.00368, -0.0155);
    chassisGroup.add(exhaustPipe);
    proceduralParts.push(exhaustPipe);
  }

  const tailLightGlowPlanes = [];
  const flameCones = [];

  const sparkFireLight = new THREE.PointLight(0xff6818, 0.0, 0.01, 2.0);
  sparkFireLight.visible = false;

  function setFireLightMultiplier() {}

  // -------------------------------------------------------------------------
  // 7. PROPORTIONATE BBS RACING WHEELS (Grounded Firmly at y = 0 inside Arches)
  // -------------------------------------------------------------------------
  const frontPivots = [];
  const wheelMeshes = [];

  function createFerrariWheelMesh(isRear = false) {
    const wRadius = isRear ? rearWheelRadius : frontWheelRadius;
    const wWidth = isRear ? 0.0024 : 0.0021;
    const wGroup = new THREE.Group();

    // Rounded shoulder racing slick tire using Cylinder + Torus shoulders so tires look realistic
    const tire = new THREE.Mesh(
      new THREE.CylinderGeometry(wRadius, wRadius, wWidth * 0.88, 24),
      tireRubberMat
    );
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wGroup.add(tire);

    for (const sSide of [-1, 1]) {
      const shoulder = new THREE.Mesh(
        new THREE.TorusGeometry(wRadius * 0.86, wRadius * 0.14, 10, 22),
        tireRubberMat
      );
      shoulder.rotation.y = Math.PI / 2;
      shoulder.position.x = sSide * (wWidth * 0.42);
      wGroup.add(shoulder);
    }

    // Outer Michelin Yellow Lettering Sidewall Disc
    const sidewallDisc = new THREE.Mesh(
      new THREE.CircleGeometry(wRadius * 0.94, 20),
      tireSidewallMat
    );
    sidewallDisc.position.set(wWidth * 0.495, 0, 0);
    sidewallDisc.rotation.y = Math.PI / 2;
    wGroup.add(sidewallDisc);

    // BBS Forged Alloy Multi-Spoke Rim Barrel
    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(wRadius * 0.65, wRadius * 0.65, wWidth * 0.96, 20),
      wheelRimMat
    );
    rim.rotation.z = Math.PI / 2;
    wGroup.add(rim);

    // 10 Y-Spoke Forged Alloy Spokes
    const spokeGeo = new THREE.BoxGeometry(wWidth * 0.98, wRadius * 1.22, 0.00020);
    for (let s = 0; s < 5; s++) {
      const spoke = new THREE.Mesh(spokeGeo, wheelRimMat);
      spoke.rotation.x = (s * Math.PI) / 5;
      wGroup.add(spoke);
    }

    // Center-Lock Yellow Anodized Nut
    const nut = new THREE.Mesh(
      new THREE.CylinderGeometry(wRadius * 0.19, wRadius * 0.19, wWidth * 1.04, 12),
      wheelNutMat
    );
    nut.rotation.z = Math.PI / 2;
    wGroup.add(nut);

    // Drilled Carbon-Ceramic Brake Disc Rotor inside wheel
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(wRadius * 0.50, wRadius * 0.50, wWidth * 0.34, 16),
      brakeDiscMat
    );
    disc.rotation.z = Math.PI / 2;
    wGroup.add(disc);

    return wGroup;
  }

  // Front Left & Front Right Steerable Wheels on Pivots (Bottom sits firmly at y = 0)
  for (const sx of [-0.00595, 0.00595]) {
    const pivot = new THREE.Group();
    pivot.position.set(sx, frontWheelRadius, frontAxleZ);

    const caliper = new THREE.Mesh(
      new THREE.BoxGeometry(0.0007, 0.0014, 0.0016),
      brakeCaliperMat
    );
    caliper.position.set(-Math.sign(sx) * 0.00035, 0.0006, -0.0010);
    pivot.add(caliper);

    const wheel = createFerrariWheelMesh(false);
    if (sx < 0) {
      wheel.rotation.y = Math.PI; // Ensure outer Michelin sidewall faces outward on left side too
    }
    pivot.add(wheel);
    chassisGroup.add(pivot);
    frontPivots.push(pivot);
    wheelMeshes.push(wheel);
  }

  // Rear Left & Rear Right Drive Wheels (Bottom sits firmly at y = 0)
  for (const sx of [-0.00605, 0.00605]) {
    const rearMount = new THREE.Group();
    rearMount.position.set(sx, rearWheelRadius, rearAxleZ);

    const caliper = new THREE.Mesh(
      new THREE.BoxGeometry(0.0008, 0.0016, 0.0018),
      brakeCaliperMat
    );
    caliper.position.set(-Math.sign(sx) * 0.0004, 0.0007, -0.0011);
    rearMount.add(caliper);

    const wheel = createFerrariWheelMesh(true);
    if (sx < 0) {
      wheel.rotation.y = Math.PI;
    }
    rearMount.add(wheel);
    chassisGroup.add(rearMount);
    wheelMeshes.push(wheel);
  }

  // -------------------------------------------------------------------------
  // 8. NATURAL LOW-GLARE HEADLIGHT BEAM FOR DAWN VISIBILITY (ZERO CAMERA HALO)
  // -------------------------------------------------------------------------
  // Aims strictly forward and downward onto the road surface 25mm..120mm ahead of the nose
  // with zero volumetric sphere or halo around the car, activating smoothly as dawn approaches.
  const headlightTarget = new THREE.Object3D();
  headlightTarget.position.set(0, -0.0010, 0.095);
  chassisGroup.add(headlightTarget);

  const dawnHeadlightSpot = new THREE.SpotLight(0xfff4dc, 0.0, 0.22, Math.PI * 0.24, 0.78, 1.5);
  dawnHeadlightSpot.position.set(0, 0.0032, 0.0172);
  dawnHeadlightSpot.target = headlightTarget;
  dawnHeadlightSpot.castShadow = false;
  chassisGroup.add(dawnHeadlightSpot);

  function setDayToDawnProgress(progress = 0.0) {
    const p = THREE.MathUtils.clamp(progress, 0.0, 1.0);
    // Keep rich metallic clearcoat reflections across the day-to-dawn cycle
    const envScale = THREE.MathUtils.lerp(1.45, 0.52, p);
    rossoCorsaMat.envMapIntensity = envScale;
    gialloModenaMat.envMapIntensity = envScale * 0.94;
    carbonFiberMat.envMapIntensity = envScale * 0.82;
    smokedGlassMat.envMapIntensity = THREE.MathUtils.lerp(1.75, 0.68, p);
    wheelRimMat.envMapIntensity = THREE.MathUtils.lerp(1.35, 0.50, p);

    // Gently engage low-angle forward road headlights as dusk/dawn approaches (progress > 0.35)
    const beamFactor = THREE.MathUtils.smoothstep(p, 0.30, 0.95);
    dawnHeadlightSpot.intensity = beamFactor * 0.62;
    drlLightbarMat.emissiveIntensity = 0.82 + beamFactor * 0.45;
    quadLedDiodeMat.emissiveIntensity = 0.74 + beamFactor * 0.55;
    taillightEmissiveMat.emissiveIntensity = 0.92 + beamFactor * 0.38;
  }

  // -------------------------------------------------------------------------
  // 9. LIGHT GREY SIDE-WHEEL TIRE DUST EMITTER (SUBTLE, NON-GLOWING)
  // -------------------------------------------------------------------------
  const sparkCount = 120;
  const sparkPositions = new Float32Array(sparkCount * 3);
  const sparkColors = new Float32Array(sparkCount * 3);
  const sparkLifeAttr = new Float32Array(sparkCount);
  const sparkSizes = new Float32Array(sparkCount);
  const sparkVelocities = [];
  const sparkAges = new Float32Array(sparkCount);
  const sparkMaxAges = new Float32Array(sparkCount);

  for (let i = 0; i < sparkCount; i++) {
    sparkPositions[i * 3 + 1] = -10;
    sparkVelocities.push(new THREE.Vector3());
    sparkAges[i] = 999;
    sparkMaxAges[i] = 0.24;
    sparkLifeAttr[i] = 0.0;
    sparkSizes[i] = 0.65 + Math.random() * 0.65;
    const greyShade = 0.70 + Math.random() * 0.12;
    sparkColors[i * 3 + 0] = greyShade;
    sparkColors[i * 3 + 1] = greyShade + 0.01;
    sparkColors[i * 3 + 2] = greyShade + 0.02;
  }

  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
  sparkGeo.setAttribute('aColor', new THREE.BufferAttribute(sparkColors, 3));
  sparkGeo.setAttribute('aLife', new THREE.BufferAttribute(sparkLifeAttr, 1));
  sparkGeo.setAttribute('aSize', new THREE.BufferAttribute(sparkSizes, 1));

  const sparkMat = new THREE.ShaderMaterial({
    uniforms: {
      uSparkScale: { value: 0.42 },
      tSceneDepth: { value: null },
      uNearClip: { value: 0.0015 },
      uFarClip: { value: 12.0 },
      uFocus: { value: 0.12 },
      uAperture: { value: 0.0 },
      uMaxBlur: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(1440, 900) },
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.NormalBlending,
    vertexShader: /* glsl */ `
      uniform float uSparkScale;
      attribute vec3 aColor;
      attribute float aLife;
      attribute float aSize;
      varying vec3 vColor;
      varying float vLife;
      void main() {
        vColor = aColor;
        vLife = aLife;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float grow = 1.0 + (1.0 - aLife) * 0.45;
        gl_PointSize = clamp((aSize * grow * 7.5 * uSparkScale) / max(0.024, -mvPosition.z), 1.0, 9.5);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vLife;
      void main() {
        if (vLife <= 0.001) discard;
        vec2 coord = gl_PointCoord - vec2(0.5);
        float distSq = dot(coord, coord);
        if (distSq > 0.25) discard;
        float puff = smoothstep(0.25, 0.02, distSq);
        float fadeEnvelope = sin(clamp(vLife, 0.0, 1.0) * 3.14159265);
        vec3 dustColor = mix(vec3(0.62, 0.64, 0.66), vColor, vLife);
        float alpha = clamp(puff * fadeEnvelope * 0.14, 0.0, 0.15);
        gl_FragColor = vec4(dustColor, alpha);
      }
    `,
  });

  const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
  sparkPoints.frustumCulled = false;
  sparkPoints.name = 'FerrariSideTireDust';

  let nextSparkIdx = 0;
  let lastWheelUpdateTime = -1;
  const _worldPos = new THREE.Vector3();
  const _worldQuat = new THREE.Quaternion();
  const _backDir = new THREE.Vector3();
  const _rightDir = new THREE.Vector3();
  const _upDir = new THREE.Vector3();
  const _spawnPos = new THREE.Vector3();

  function updateWheels(dt, speed, steerAngle = 0.0) {
    const now = performance.now();
    if (Math.abs(now - lastWheelUpdateTime) < 1e-4) {
      return;
    }
    lastWheelUpdateTime = now;

    const wheelSpinDelta = (speed / 0.0025) * dt;
    for (let i = 0; i < wheelMeshes.length; i++) {
      const w = wheelMeshes[i];
      const spinSign = i % 2 === 0 ? -1 : 1; // Left wheels rotated PI on Y
      w.rotation.x += wheelSpinDelta * spinSign;
    }

    const targetSteerRad = THREE.MathUtils.clamp(steerAngle, -0.48, 0.48);
    for (const p of frontPivots) {
      p.rotation.y = THREE.MathUtils.lerp(p.rotation.y, targetSteerRad, Math.min(1, dt * 18));
    }
  }

  function updateKartVisuals(dt, state) {
    const steerAngle =
      state.steerAngle !== undefined
        ? state.steerAngle - (state.driftAngle || 0.0) * 0.35
        : -(state.steerInput || 0.0) * 0.45 - (state.driftAngle || 0.0) * 0.35;

    updateWheels(dt, state.speed, steerAngle);

    chassisGroup.rotation.y = THREE.MathUtils.lerp(
      chassisGroup.rotation.y,
      state.driftAngle || 0.0,
      Math.min(1, dt * 14)
    );
    // Realistic lateral body roll under cornering load
    const targetRoll =
      state.chassisRoll !== undefined
        ? state.chassisRoll
        : (state.steerInput || 0.0) * 0.048;
    chassisGroup.rotation.z = THREE.MathUtils.lerp(
      chassisGroup.rotation.z,
      targetRoll,
      Math.min(1, dt * 11)
    );
    // Realistic longitudinal weight transfer (nose dive on braking, rear squat on acceleration)
    const targetPitch = state.chassisPitch || 0.0;
    chassisGroup.rotation.x = THREE.MathUtils.lerp(
      chassisGroup.rotation.x,
      targetPitch,
      Math.min(1, dt * 10)
    );
    const roadRipple =
      Math.abs(state.speed) > 0.005
        ? Math.sin(performance.now() * 0.048) * 0.00007 * Math.min(1.0, Math.abs(state.speed) / 0.14)
        : 0.0;
    const curbJounce =
      (state.curbRumble || 0.0) > 0.01
        ? Math.sin(performance.now() * 0.16) * 0.00018 * (state.curbRumble || 0.0)
        : 0.0;
    chassisGroup.position.y = (state.hopHeight || 0.0) + roadRipple + curbJounce;

    const tSec = performance.now() * 0.001;
    for (const pGroup of flameCones) {
      pGroup.visible = false;
    }

    const rainLightBlinkOn = Math.floor(tSec * 12.0) % 2 === 0;
    for (const rainLight of fiaRainLights) {
      rainLight.visible = rainLightBlinkOn;
    }
    sparkFireLight.intensity = 0.0;

    const absSteer = Math.abs(state.steerInput || 0.0);
    const absDrift = Math.abs(state.driftAngle || 0.0);
    const absSpeed = Math.abs(state.speed || 0.0);
    const wantsSideDust =
      absSpeed > 0.065 &&
      (absSteer > 0.22 || (state.isDrifting && absDrift > 0.06));

    if (wantsSideDust) {
      chassisGroup.getWorldPosition(_worldPos);
      chassisGroup.getWorldQuaternion(_worldQuat);
      _backDir.set(0, 0, -1).applyQuaternion(_worldQuat).normalize();
      _rightDir.set(1, 0, 0).applyQuaternion(_worldQuat).normalize();
      _upDir.set(0, 1, 0).applyQuaternion(_worldQuat).normalize();

      const turnDir = Math.sign(state.steerInput || state.driftAngle || 1.0) || 1.0;
      for (let k = 0; k < 2; k++) {
        const idx = nextSparkIdx;
        nextSparkIdx = (nextSparkIdx + 1) % sparkCount;

        const sideSign = k === 0 ? -turnDir : (Math.random() < 0.7 ? -turnDir : turnDir);
        const lateralOffset = sideSign * (0.0068 + Math.random() * 0.0012);
        const backOffset = 0.0075 + Math.random() * 0.0045;
        const heightOffset = 0.0007 + Math.random() * 0.0007;

        _spawnPos
          .copy(_worldPos)
          .addScaledVector(_rightDir, lateralOffset)
          .addScaledVector(_backDir, backOffset)
          .addScaledVector(_upDir, heightOffset);

        sparkPositions[idx * 3 + 0] = _spawnPos.x;
        sparkPositions[idx * 3 + 1] = _spawnPos.y;
        sparkPositions[idx * 3 + 2] = _spawnPos.z;

        const backSpd = 0.016 + Math.random() * 0.022;
        const sideOutSpd = sideSign * (0.006 + Math.random() * 0.010);
        const upSpd = 0.0010 + Math.random() * 0.0022;

        sparkVelocities[idx]
          .copy(_backDir)
          .multiplyScalar(backSpd)
          .addScaledVector(_rightDir, sideOutSpd)
          .addScaledVector(_upDir, upSpd);

        sparkAges[idx] = 0.0;
        sparkMaxAges[idx] = 0.16 + Math.random() * 0.10;
        sparkLifeAttr[idx] = 1.0;
      }
    }

    let hasLiveSparks = false;
    for (let i = 0; i < sparkCount; i++) {
      if (sparkAges[i] < sparkMaxAges[i]) {
        hasLiveSparks = true;
        sparkAges[i] += dt;
        const progress = sparkAges[i] / sparkMaxAges[i];
        sparkLifeAttr[i] = Math.max(0.0, 1.0 - progress);

        sparkPositions[i * 3 + 0] += sparkVelocities[i].x * dt;
        sparkPositions[i * 3 + 1] += sparkVelocities[i].y * dt;
        sparkPositions[i * 3 + 2] += sparkVelocities[i].z * dt;

        sparkVelocities[i].multiplyScalar(Math.max(0.0, 1.0 - dt * 4.5));
      } else {
        sparkLifeAttr[i] = 0.0;
        sparkPositions[i * 3 + 1] = -10.0;
      }
    }

    if (hasLiveSparks || wantsSideDust) {
      sparkGeo.attributes.position.needsUpdate = true;
      sparkGeo.attributes.aLife.needsUpdate = true;
      sparkPoints.visible = true;
    } else {
      sparkPoints.visible = false;
    }
  }

  let attachedGlbScene = null;
  let cockpitRoadOnly = false;

  function setCockpitRoadOnly(isRoadOnly) {
    cockpitRoadOnly = Boolean(isRoadOnly);
    kartShadowQuad.visible = !cockpitRoadOnly;
    if (attachedGlbScene) {
      attachedGlbScene.visible = !cockpitRoadOnly;
    } else {
      for (const part of proceduralParts) {
        if (part) part.visible = !cockpitRoadOnly;
      }
    }
    for (const plane of tailLightGlowPlanes) {
      if (plane) plane.visible = !cockpitRoadOnly;
    }
    for (const pivot of frontPivots) {
      pivot.visible = !cockpitRoadOnly;
    }
    for (const w of wheelMeshes) {
      w.visible = !cockpitRoadOnly;
    }
  }

  function attachGlbKart(glbScene) {
    attachedGlbScene = glbScene;
  }

  return {
    kartRoot,
    chassisGroup,
    sparkPoints,
    sparkFireLight,
    setFireLightMultiplier,
    setDayToDawnProgress,
    setCockpitRoadOnly,
    updateWheels,
    updateKartVisuals,
    attachGlbKart,
  };
}
