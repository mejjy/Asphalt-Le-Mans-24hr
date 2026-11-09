import * as THREE from 'three';
import {
  createDunlopBridgeTexture,
  createCountrysideTerrainTexture,
  createPitBuildingFacadeTexture,
  createGrandstandSpectatorsTexture,
} from './ProceduralTextures.js';

/**
 * Builds the Expansive French Countryside & Highland Mountain Pass Landscape
 * for ASPHALT: LE MANS 24H.
 *
 * Improvements:
 * - Zero floating mountains or hills: Every hill/mountain evaluates exact world-space
 *   ground elevation `getTerrainElevation(wx, wz)` at each perimeter vertex, flares out into
 *   a gradual grassy foothill apron, and extends its baseskirt 28mm deep into the terrain.
 * - Integrated rock strata & outcrops embedded directly into the hillside geometry with zero gaps.
 * - Extended northern/northeastern highland mountain pass terrain that rises and falls naturally
 *   alongside the new uphill climb, panoramic summit crest, and flowing downhill descent.
 * - Brighter, clearer natural daylight colors on grass, hills, trees, and lake, transitioning
 *   smoothly and cohesively into cooler, darker early-morning dawn tones over the 120s run.
 */
export function buildProceduralDeskDiorama(manifest, splineData, perfConfig = {}) {
  const isMobilePerf = Boolean(perfConfig.isMobileDevice);
  const dioramaRoot = new THREE.Group();
  dioramaRoot.name = 'LeMansFrenchLandscape';

  const nightGlowGroup = new THREE.Group();
  nightGlowGroup.name = 'LeMansNightGlowGroup';

  const samples = splineData?.samples || [];
  const sampleCount = samples.length;

  // Rolling Sarthe countryside hills ("Coteaux de la Sarthe") — moderate, natural French hill heights
  // rather than oversized mountains, positioned with generous clearance outside the circuit perimeter
  const hillSpecs = [
    // Layered Northern & Northwestern rolling Sarthe hills flanking the uphill climb & summit pass
    [-1.42, -0.66, 0.25, 0.19, 0.088,  0.25, 1.1],
    [-0.96, -1.06, 0.27, 0.20, 0.105, -0.18, 2.4],
    [-0.36, -1.16, 0.26, 0.19, 0.114,  0.42, 3.8],
    [ 0.18, -1.20, 0.27, 0.20, 0.122, -0.32, 5.2],
    [ 0.84, -1.14, 0.26, 0.19, 0.106,  0.15, 6.7],
    [ 1.40, -0.66, 0.25, 0.18, 0.088, -0.45, 8.1],
    // Distant background horizon ridge layer (gentle rolling French horizon)
    [-1.64, -1.30, 0.42, 0.30, 0.138,  0.12, 9.4],
    [-0.68, -1.50, 0.45, 0.32, 0.152, -0.22, 10.8],
    [ 0.28, -1.54, 0.46, 0.33, 0.158,  0.18, 12.1],
    [ 1.40, -1.30, 0.42, 0.30, 0.135, -0.28, 13.5],
    // Western & Southwestern rolling pasture hills (well outside Turn 1, Turn 2 & Turn 3)
    [-1.44, -0.18, 0.24, 0.19, 0.078,  0.55, 14.2],
    [-1.34,  0.36, 0.23, 0.18, 0.068, -0.35, 15.6],
    // Interior valley knolls framed deep inside the circuit loop
    [-0.26, -0.10, 0.092, 0.078, 0.042,  0.30, 4.5],
    [ 0.18, -0.12, 0.100, 0.085, 0.046, -0.25, 7.3],
    // Eastern & Southeastern lakeside overlook hills
    [ 1.42,  0.08, 0.24, 0.19, 0.082,  0.22, 16.8],
    [ 1.20,  0.64, 0.23, 0.18, 0.072, -0.19, 18.2],
  ];

  // Fast 2-pass strided lookup of closest track sample distance and elevation (~12x faster startup on mobile CPUs)
  function getClosestTrackInfo(x, z) {
    if (!sampleCount) return { minDist: 999.0, trackY: 0.025 };
    let minSq = 999999.0;
    let bestIdx = 0;
    const stride = 6;
    for (let s = 0; s < sampleCount; s += stride) {
      const p = samples[s].position;
      const dx = p[0] - x;
      const dz = p[2] - z;
      const dSq = dx * dx + dz * dz;
      if (dSq < minSq) {
        minSq = dSq;
        bestIdx = s;
      }
    }
    for (let offset = -stride; offset <= stride; offset++) {
      if (offset === 0) continue;
      const idx = (bestIdx + offset + sampleCount) % sampleCount;
      const p = samples[idx].position;
      const dx = p[0] - x;
      const dz = p[2] - z;
      const dSq = dx * dx + dz * dz;
      if (dSq < minSq) {
        minSq = dSq;
        bestIdx = idx;
      }
    }
    return { minDist: Math.sqrt(minSq), trackY: samples[bestIdx].position[1] };
  }

  function getTrackDistance(x, z) {
    return getClosestTrackInfo(x, z).minDist;
  }

  // Helper to check if a point is inside the eastern Lake Basin (crossed by the elevated Lake Viaduct Bridge)
  function getLakeBasinDepth(x, z) {
    const dx = (x - 0.80) / 0.27;
    const dz = (z - 0.10) / 0.22;
    const r = Math.hypot(dx, dz);
    if (r < 1.0) {
      return Math.cos(r * Math.PI * 0.5) * 0.011;
    }
    return 0.0;
  }

  function getTerrainElevation(x, z) {
    // 1. Inside the eastern Lake Basin, keep terrain submerged on the lakebed even beneath the elevated Lake Bridge
    const lakeDepth = getLakeBasinDepth(x, z);
    if (lakeDepth > 0.0) {
      return 0.0192 - lakeDepth;
    }

    const { minDist, trackY } = getClosestTrackInfo(x, z);
    const roadbedY = trackY - 0.0085; // Strictly 8.5mm below asphalt top surface (inside embankment skirt)

    // Lock terrain strictly to roadbedY within 92mm of track centerline so ZERO terrain triangles ever clip the 76mm road or curbs
    if (minDist <= 0.092) {
      return roadbedY;
    }

    // Smooth embankment transition so the countryside hills and valleys follow the uphill/downhill road naturally
    const blend = THREE.MathUtils.smoothstep(minDist, 0.092, 0.34);

    // Base rolling French countryside waves
    let naturalY =
      0.024 +
      (Math.sin(x * 0.85) * Math.cos(z * 0.85) * 0.055 +
        Math.sin(x * 1.55 + z * 1.20) * 0.032);

    // Northern & Northeastern Highland Mountain Pass uplift (supports the extended uphill & downhill road)
    if (z < -0.06) {
      const northFactor = THREE.MathUtils.smoothstep(-z, 0.06, 0.95);
      const ridgeWave =
        Math.pow(Math.max(0.0, Math.cos((x - 0.06) * 0.82)), 1.35) * 0.165 +
        Math.pow(Math.max(0.0, Math.sin(x * 1.9 + 0.4) * Math.cos(z * 1.6)), 1.5) * 0.085;
      naturalY += northFactor * (0.042 + ridgeWave);
    }

    // Gentle rolling hills in the western & southwestern countryside
    if (x < -0.55) {
      const westFactor = THREE.MathUtils.smoothstep(-x, 0.55, 1.40);
      naturalY += westFactor * (0.028 + 0.042 * Math.pow(Math.cos(z * 1.35), 2.0));
    }

    // Smooth foothill mound contribution beneath each hillSpec so the ground rises naturally to meet every mountain base
    for (let h = 0; h < hillSpecs.length; h++) {
      const [hx, hz, radX, radZ, hHeight] = hillSpecs[h];
      const maxR = Math.max(radX, radZ) * 1.35;
      const dNorm = Math.hypot((x - hx) / maxR, (z - hz) / maxR);
      if (dNorm < 1.0) {
        const mound = Math.pow(Math.cos(dNorm * Math.PI * 0.5), 1.8) * hHeight * 0.28;
        naturalY += mound;
      }
    }

    // Smoothly grade shoreline around the eastern Lake Basin
    const lakeShoreDist = Math.hypot((x - 0.80) / 0.34, (z - 0.10) / 0.29);
    if (lakeShoreDist < 1.0) {
      const shoreBlend = THREE.MathUtils.smoothstep(lakeShoreDist, 0.80, 1.0);
      naturalY = THREE.MathUtils.lerp(0.0202, naturalY, shoreBlend);
    }

    return THREE.MathUtils.lerp(roadbedY, Math.max(0.016, naturalY), blend);
  }

  // -------------------------------------------------------------------------
  // 1. EXPANSIVE FRENCH COUNTRYSIDE TERRAIN & HIGHLAND TOPOGRAPHY (260x260 Grid)
  // -------------------------------------------------------------------------
  const terrainTex = createCountrysideTerrainTexture();

  const terrainSegments = isMobilePerf ? 168 : 240;
  const terrainGeo = new THREE.PlaneGeometry(16.0, 16.0, terrainSegments, terrainSegments);
  terrainGeo.rotateX(-Math.PI * 0.5);

  const posAttr = terrainGeo.attributes.position;
  const terrainColors = new Float32Array(posAttr.count * 3);
  const cGrass = new THREE.Color(0xd8ebc4);     // Bright sunlit French meadow tint for the large square plots
  const cSand = new THREE.Color(0xcab996);      // Warm sandy lakeshore
  const tmpCol = new THREE.Color();

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    const y = getTerrainElevation(x, z);
    posAttr.setY(i, y);

    if (getLakeBasinDepth(x, z) > 0.0005) {
      tmpCol.copy(cSand);
    } else {
      tmpCol.copy(cGrass);
    }
    terrainColors[i * 3 + 0] = tmpCol.r;
    terrainColors[i * 3 + 1] = tmpCol.g;
    terrainColors[i * 3 + 2] = tmpCol.b;
  }
  terrainGeo.setAttribute('color', new THREE.BufferAttribute(terrainColors, 3));
  terrainGeo.computeVertexNormals();

  const terrainMat = new THREE.MeshStandardMaterial({
    map: terrainTex,
    vertexColors: true,
    roughness: 0.88,
    metalness: 0.02,
    envMapIntensity: 0.45,
    flatShading: false,
  });

  const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
  terrainMesh.receiveShadow = true;
  terrainMesh.name = 'FrenchCountrysideTerrain';
  dioramaRoot.add(terrainMesh);

  // -------------------------------------------------------------------------
  // 2. ZONE 2 — GROUNDED FRENCH COUNTRYSIDE HILLS & MOUNTAINS (100% Smooth, Dent-Free Surface)
  //    Built as pure, smooth convex elliptical domes with zero surface dents or fluted creases,
  //    and a deep underground root skirt anchored well below the surrounding terrain!
  // -------------------------------------------------------------------------
  const mountainGroup = new THREE.Group();
  mountainGroup.name = 'LeMansTemperateHillsZone';

  const cMountainBase = new THREE.Color(0x3a5926);  // Uniform earthy grassy-green matching the meadow palette
  const cMountainCrown = new THREE.Color(0x45692e); // Subtle sunlit upper-slope depth

  const hillVertexMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.90,
    metalness: 0.02,
    envMapIntensity: 0.38,
    flatShading: false,
  });

  function createTemperateCountrysideHill(px, pz, radiusX, radiusZ, height, yawAngle) {
    const hillGroup = new THREE.Group();
    hillGroup.position.set(px, 0.0, pz);
    hillGroup.rotation.y = yawAngle;

    const cosYaw = Math.cos(yawAngle);
    const sinYaw = Math.sin(yawAngle);

    // Sample terrain elevation around the mountain's footprint to establish a single, uniform
    // horizontal reference plane (preventing terrain waves from embossing dents onto the dome!)
    let minPerimeterY = getTerrainElevation(px, pz);
    let sumPerimeterY = minPerimeterY;
    const sampleCount = 16;
    for (let s = 0; s < sampleCount; s++) {
      const ang = (s / sampleCount) * Math.PI * 2;
      const lx = Math.cos(ang) * radiusX;
      const lz = Math.sin(ang) * radiusZ;
      const wx = px + lx * cosYaw + lz * sinYaw;
      const wz = pz - lx * sinYaw + lz * cosYaw;
      const gy = getTerrainElevation(wx, wz);
      if (gy < minPerimeterY) minPerimeterY = gy;
      sumPerimeterY += gy;
    }
    const avgPerimeterY = sumPerimeterY / (sampleCount + 1);
    const basePlaneY = avgPerimeterY - 0.006;
    const deepRootY = minPerimeterY - 0.040;

    // High-resolution smooth dome extending below equator (0.58 * PI) for a solid underground root skirt
    const domeGeo = new THREE.SphereGeometry(1.0, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.58);
    const pAttr = domeGeo.attributes.position;
    const vColors = new Float32Array(pAttr.count * 3);

    for (let v = 0; v < pAttr.count; v++) {
      const ux = pAttr.getX(v);
      const uy = pAttr.getY(v);
      const uz = pAttr.getZ(v);

      const hFrac = THREE.MathUtils.clamp(uy, 0.0, 1.0);

      // Pure, smooth elliptical cross-section with gentle outward foothill flare (zero fluted dents!)
      const skirtFlare = 1.0 + Math.pow(1.0 - hFrac, 2.4) * 0.22;
      const vx = ux * radiusX * skirtFlare;
      const vz = uz * radiusZ * skirtFlare;

      // Pure convex S-curve dome rising from a single uniform basePlaneY, with underground root skirt
      let vy;
      if (uy >= 0.0) {
        const smoothDome = Math.pow(hFrac, 1.18) * (1.52 - 0.52 * hFrac);
        vy = basePlaneY + smoothDome * height;
      } else {
        const subFrac = THREE.MathUtils.clamp(-uy / Math.sin(0.08 * Math.PI), 0.0, 1.0);
        vy = THREE.MathUtils.lerp(basePlaneY, deepRootY, subFrac);
      }

      pAttr.setXYZ(v, vx, vy, vz);

      // Smooth, continuous single-color mountain shading from base to peak (zero square plots)
      tmpCol.copy(cMountainBase).lerp(cMountainCrown, hFrac * 0.55);
      vColors[v * 3 + 0] = tmpCol.r;
      vColors[v * 3 + 1] = tmpCol.g;
      vColors[v * 3 + 2] = tmpCol.b;
    }

    domeGeo.setAttribute('color', new THREE.BufferAttribute(vColors, 3));
    domeGeo.computeVertexNormals();

    const hillMesh = new THREE.Mesh(domeGeo, hillVertexMat);
    hillMesh.castShadow = true;
    hillMesh.receiveShadow = true;
    hillGroup.add(hillMesh);

    return hillGroup;
  }

  for (const [hx, hz, radX, radZ, hHeight, hYaw] of hillSpecs) {
    // Ensure hill + full flared skirt stays safely outside the 76mm roadbed + embankments
    const maxSkirtRad = Math.max(radX, radZ) * 1.24;
    if (getTrackDistance(hx, hz) < maxSkirtRad + 0.085) continue;
    mountainGroup.add(createTemperateCountrysideHill(hx, hz, radX, radZ, hHeight, hYaw));
  }

  dioramaRoot.add(mountainGroup);

  // -------------------------------------------------------------------------
  // 3. ZONE 3 — REALISTIC & COMPLETELY CLEAR LAKE CROSSED BY THE ELEVATED BRIDGE
  // -------------------------------------------------------------------------
  const lakeGroup = new THREE.Group();
  lakeGroup.name = 'LeMansLakesideBayZone';
  lakeGroup.position.set(0.80, 0.0205, 0.10);

  const lakeShape = new THREE.Shape();
  lakeShape.moveTo(-0.24, -0.18);
  lakeShape.bezierCurveTo(-0.30, -0.06, -0.29, 0.09, -0.20, 0.19);
  lakeShape.bezierCurveTo(-0.08, 0.26, 0.12, 0.26, 0.23, 0.18);
  lakeShape.bezierCurveTo(0.31, 0.08, 0.30, -0.09, 0.20, -0.19);
  lakeShape.bezierCurveTo(0.08, -0.26, -0.12, -0.25, -0.24, -0.18);
  lakeShape.closePath();

  const lakeGeo = new THREE.ShapeGeometry(lakeShape, 48);
  lakeGeo.rotateX(-Math.PI * 0.5);

  const waterCanvas = document.createElement('canvas');
  waterCanvas.width = 512;
  waterCanvas.height = 512;
  const wCtx = waterCanvas.getContext('2d');
  const wGrad = wCtx.createRadialGradient(256, 256, 24, 256, 256, 248);
  wGrad.addColorStop(0.0, '#105c84');
  wGrad.addColorStop(0.58, '#1a76a0');
  wGrad.addColorStop(0.86, '#2b90ae');
  wGrad.addColorStop(1.0, '#44a4b6');
  wCtx.fillStyle = wGrad;
  wCtx.fillRect(0, 0, 512, 512);

  wCtx.strokeStyle = 'rgba(210, 242, 255, 0.10)';
  wCtx.lineWidth = 1.5;
  for (let i = 0; i < 140; i++) {
    const rx = (Math.sin(i * 73.1) * 0.5 + 0.5) * 480 + 16;
    const ry = (Math.cos(i * 41.7) * 0.5 + 0.5) * 480 + 16;
    const rw = 14 + (i % 5) * 6;
    wCtx.beginPath();
    wCtx.moveTo(rx - rw, ry);
    wCtx.quadraticCurveTo(rx, ry - 2.5, rx + rw, ry);
    wCtx.stroke();
  }
  const lakeColorTex = new THREE.CanvasTexture(waterCanvas);
  lakeColorTex.colorSpace = THREE.SRGBColorSpace;
  lakeColorTex.wrapS = THREE.ClampToEdgeWrapping;
  lakeColorTex.wrapT = THREE.ClampToEdgeWrapping;

  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = 256;
  normalCanvas.height = 256;
  const nCtx = normalCanvas.getContext('2d');
  const nImg = nCtx.createImageData(256, 256);
  for (let py = 0; py < 256; py++) {
    for (let px = 0; px < 256; px++) {
      const u = (px / 256) * Math.PI * 16.0;
      const v = (py / 256) * Math.PI * 16.0;
      const nx = Math.cos(u + Math.sin(v * 0.7)) * 0.18 + Math.cos(u * 2.3 - v * 1.4) * 0.10;
      const ny = Math.sin(v + Math.cos(u * 0.6)) * 0.18 + Math.sin(v * 2.1 + u * 1.2) * 0.10;
      const idx = (py * 256 + px) * 4;
      nImg.data[idx + 0] = Math.round((nx * 0.5 + 0.5) * 255);
      nImg.data[idx + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      nImg.data[idx + 2] = 255;
      nImg.data[idx + 3] = 255;
    }
  }
  nCtx.putImageData(nImg, 0, 0);
  const lakeNormalTex = new THREE.CanvasTexture(normalCanvas);
  lakeNormalTex.wrapS = THREE.RepeatWrapping;
  lakeNormalTex.wrapT = THREE.RepeatWrapping;
  lakeNormalTex.repeat.set(4, 4);

  // Deep underwater lakebed basin beneath the transparent water surface
  const lakeBedMat = new THREE.MeshStandardMaterial({
    color: 0x0c344a,
    roughness: 0.92,
    metalness: 0.02,
  });
  const lakeBedMesh = new THREE.Mesh(lakeGeo, lakeBedMat);
  lakeBedMesh.scale.set(0.96, 1.0, 0.96);
  lakeBedMesh.position.y = -0.0028;
  lakeBedMesh.receiveShadow = true;
  lakeGroup.add(lakeBedMesh);

  // Realistic transparent & sky-reflective water surface for Lac de la Gémerie
  const lakeMat = new THREE.MeshPhysicalMaterial({
    map: lakeColorTex,
    normalMap: lakeNormalTex,
    normalScale: new THREE.Vector2(0.28, 0.28),
    color: 0x1e7ba6,
    roughness: 0.06,
    metalness: 0.14,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    reflectivity: 1.0,
    transparent: true,
    opacity: 0.88,
    envMapIntensity: 1.65,
  });
  const lakeMesh = new THREE.Mesh(lakeGeo, lakeMat);
  lakeMesh.receiveShadow = true;
  lakeGroup.add(lakeMesh);

  const shoreMat = new THREE.MeshStandardMaterial({
    color: 0xa69678,
    roughness: 0.90,
    metalness: 0.0,
  });
  const shoreMesh = new THREE.Mesh(lakeGeo, shoreMat);
  shoreMesh.scale.set(1.07, 1.0, 1.07);
  shoreMesh.position.y = -0.0006;
  lakeGroup.add(shoreMesh);

  dioramaRoot.add(lakeGroup);

  // -------------------------------------------------------------------------
  // 4. THE ICONIC YELLOW DUNLOP ARCH BRIDGE (Generously Spaced After Ferrari Arch)
  // -------------------------------------------------------------------------
  const dunlopBridgeGroup = new THREE.Group();
  dunlopBridgeGroup.name = 'DunlopBridgeGroup';

  const dunlopSample = samples.length > 248 ? samples[248] : null;
  if (dunlopSample) {
    const pos = new THREE.Vector3(...dunlopSample.position);
    const tangent = new THREE.Vector3(...dunlopSample.tangent).normalize();
    const yawAngle = Math.atan2(tangent.x, tangent.z);
    dunlopBridgeGroup.position.copy(pos);
    dunlopBridgeGroup.rotation.set(0, yawAngle, 0);
  } else {
    dunlopBridgeGroup.position.set(-0.64, 0.102, -0.495);
    dunlopBridgeGroup.rotation.set(0, Math.PI * 0.25, 0);
  }

  const dunlopTex = createDunlopBridgeTexture();

  const dunlopHalfSpan = 0.054;
  const dunlopClearanceY = 0.028;
  const dunlopBannerHeight = 0.0115;
  const dunlopDepth = 0.010;

  const dunlopYellowMat = new THREE.MeshStandardMaterial({
    color: 0xffd000,
    roughness: 0.36,
    metalness: 0.18,
  });

  const dunlopNavyMat = new THREE.MeshStandardMaterial({
    color: 0x071430,
    roughness: 0.42,
    metalness: 0.35,
  });

  const pierMat = new THREE.MeshStandardMaterial({
    color: 0x3a424e,
    roughness: 0.45,
    metalness: 0.72,
  });

  for (const side of [-1, 1]) {
    const pierX = side * dunlopHalfSpan;

    // Deep concrete foundation pad extending 14mm below track level into the embankment
    const baseGeo = new THREE.BoxGeometry(0.009, 0.018, dunlopDepth * 1.35);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x7c8594, roughness: 0.85 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(pierX, -0.005, 0);
    dunlopBridgeGroup.add(baseMesh);

    const legHeight = dunlopClearanceY + dunlopBannerHeight + 0.008;
    const legGeo = new THREE.BoxGeometry(0.0052, legHeight, dunlopDepth);
    const legMesh = new THREE.Mesh(legGeo, dunlopYellowMat);
    legMesh.position.set(pierX, legHeight * 0.5 - 0.008, 0);
    legMesh.castShadow = true;
    legMesh.receiveShadow = true;
    dunlopBridgeGroup.add(legMesh);

    const trimGeo = new THREE.BoxGeometry(0.0056, legHeight * 0.85, dunlopDepth * 0.35);
    const trimMesh = new THREE.Mesh(trimGeo, dunlopNavyMat);
    trimMesh.position.set(pierX, legHeight * 0.5 - 0.006, 0);
    dunlopBridgeGroup.add(trimMesh);
  }

  const crownCurveShape = new THREE.Shape();
  crownCurveShape.moveTo(-dunlopHalfSpan - 0.002, dunlopClearanceY + dunlopBannerHeight - 0.001);
  crownCurveShape.quadraticCurveTo(
    0,
    dunlopClearanceY + dunlopBannerHeight + 0.009,
    dunlopHalfSpan + 0.002,
    dunlopClearanceY + dunlopBannerHeight - 0.001
  );
  crownCurveShape.lineTo(dunlopHalfSpan + 0.002, dunlopClearanceY + dunlopBannerHeight - 0.003);
  crownCurveShape.quadraticCurveTo(
    0,
    dunlopClearanceY + dunlopBannerHeight + 0.005,
    -dunlopHalfSpan - 0.002,
    dunlopClearanceY + dunlopBannerHeight - 0.003
  );
  crownCurveShape.closePath();

  const crownArchGeo = new THREE.ExtrudeGeometry(crownCurveShape, {
    steps: 1,
    depth: dunlopDepth * 0.92,
    bevelEnabled: false,
  });
  crownArchGeo.translate(0, 0, -dunlopDepth * 0.46);
  const crownArchMesh = new THREE.Mesh(crownArchGeo, dunlopYellowMat);
  crownArchMesh.castShadow = true;
  dunlopBridgeGroup.add(crownArchMesh);

  const beamWidth = dunlopHalfSpan * 2 + 0.004;
  const beamBox = new THREE.Mesh(
    new THREE.BoxGeometry(beamWidth, dunlopBannerHeight, dunlopDepth),
    dunlopYellowMat
  );
  beamBox.position.set(0, dunlopClearanceY + dunlopBannerHeight * 0.5, 0);
  beamBox.castShadow = true;
  beamBox.receiveShadow = true;
  dunlopBridgeGroup.add(beamBox);

  const dunlopSignMat = new THREE.MeshStandardMaterial({
    map: dunlopTex,
    roughness: 0.35,
    metalness: 0.15,
    emissiveMap: dunlopTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.08,
  });
  const signGeo = new THREE.PlaneGeometry(beamWidth - 0.002, dunlopBannerHeight * 0.96);

  const frontSign = new THREE.Mesh(signGeo, dunlopSignMat);
  frontSign.position.set(0, dunlopClearanceY + dunlopBannerHeight * 0.5, -dunlopDepth * 0.51);
  frontSign.rotation.y = Math.PI;
  dunlopBridgeGroup.add(frontSign);

  const rearSign = new THREE.Mesh(signGeo, dunlopSignMat);
  rearSign.position.set(0, dunlopClearanceY + dunlopBannerHeight * 0.5, dunlopDepth * 0.51);
  dunlopBridgeGroup.add(rearSign);

  dioramaRoot.add(dunlopBridgeGroup);

  // -------------------------------------------------------------------------
  // 5. ZONE 1 — LE MANS 24H PIT COMPLEX & GRANDSTANDS (Grounded into Terrain)
  // -------------------------------------------------------------------------
  const pitBuildingGroup = new THREE.Group();
  const pitGroundY = getTerrainElevation(-0.04, 0.392);
  pitBuildingGroup.position.set(-0.04, pitGroundY - 0.004, 0.392);

  const pitFacadeTex = createPitBuildingFacadeTexture();

  const pitLength = 0.50;
  const pitDepth = 0.055;
  const pitHeight = 0.042;

  const pitBuildingGeo = new THREE.BoxGeometry(pitLength, pitHeight, pitDepth);
  const pitBuildingMat = new THREE.MeshStandardMaterial({
    map: pitFacadeTex,
    roughness: 0.48,
    metalness: 0.18,
  });

  const pitMesh = new THREE.Mesh(pitBuildingGeo, pitBuildingMat);
  pitMesh.position.set(0, pitHeight * 0.5, 0);
  pitMesh.castShadow = true;
  pitMesh.receiveShadow = true;
  pitBuildingGroup.add(pitMesh);

  const pitWallGeo = new THREE.BoxGeometry(pitLength * 0.95, 0.010, 0.0030);
  const pitWallMat = new THREE.MeshStandardMaterial({
    color: 0x2d3440,
    roughness: 0.65,
    metalness: 0.4,
  });
  const pitWallMesh = new THREE.Mesh(pitWallGeo, pitWallMat);
  pitWallMesh.position.set(0, 0.005, -pitDepth * 0.5 - 0.012);
  pitWallMesh.castShadow = true;
  pitBuildingGroup.add(pitWallMesh);

  const antennaMat = new THREE.MeshStandardMaterial({ color: 0xdde5ed, metalness: 0.9, roughness: 0.2 });
  for (let i = -4; i <= 4; i += 2) {
    const antGeo = new THREE.CylinderGeometry(0.0004, 0.0006, 0.018, 6);
    const antMesh = new THREE.Mesh(antGeo, antennaMat);
    antMesh.position.set(i * 0.05, pitHeight + 0.009, 0);
    pitBuildingGroup.add(antMesh);
  }

  dioramaRoot.add(pitBuildingGroup);

  // -------------------------------------------------------------------------
  // 6. SPECTATOR GRANDSTANDS (Main Straight — Grounded Firmly in Terrain)
  // -------------------------------------------------------------------------
  const mainGrandstandGroup = new THREE.Group();
  const standGroundY = getTerrainElevation(-0.04, 0.145);
  mainGrandstandGroup.position.set(-0.04, standGroundY - 0.005, 0.145);

  const crowdTex = createGrandstandSpectatorsTexture();

  const standLength = 0.46;
  const standDepth = 0.045;
  const standHeight = 0.038;

  const standShape = new THREE.Shape();
  standShape.moveTo(0, 0);
  standShape.lineTo(standDepth, 0);
  standShape.lineTo(standDepth, standHeight);
  standShape.lineTo(0, 0.008);
  standShape.closePath();

  const standGeo = new THREE.ExtrudeGeometry(standShape, {
    steps: 1,
    depth: standLength,
    bevelEnabled: false,
  });
  standGeo.rotateY(Math.PI * 0.5);
  standGeo.translate(-standLength * 0.5, 0, 0);

  const standMat = new THREE.MeshStandardMaterial({
    map: crowdTex,
    roughness: 0.78,
    metalness: 0.08,
  });

  const standMesh = new THREE.Mesh(standGeo, standMat);
  standMesh.castShadow = true;
  standMesh.receiveShadow = true;
  mainGrandstandGroup.add(standMesh);

  const canopyGeo = new THREE.BoxGeometry(standLength * 1.02, 0.0025, standDepth * 1.15);
  const canopyMat = new THREE.MeshStandardMaterial({
    color: 0x364052,
    roughness: 0.45,
    metalness: 0.65,
  });
  const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
  canopyMesh.position.set(0, standHeight + 0.008, standDepth * 0.45);
  canopyMesh.rotation.x = 0.08;
  canopyMesh.castShadow = true;
  mainGrandstandGroup.add(canopyMesh);

  for (let x = -0.22; x <= 0.22; x += 0.11) {
    const colGeo = new THREE.CylinderGeometry(0.0008, 0.0008, standHeight + 0.008, 8);
    const colMesh = new THREE.Mesh(colGeo, pierMat);
    colMesh.position.set(x, (standHeight + 0.008) * 0.5, standDepth * 0.95);
    mainGrandstandGroup.add(colMesh);
  }

  dioramaRoot.add(mainGrandstandGroup);

  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // 7. NATURAL FRENCH COUNTRYSIDE TREES & DUNLOP-TO-PORSCHE FOREST CORRIDOR
  // -------------------------------------------------------------------------
  const numTrees = 760;

  function createNaturalFoliageGeometry(radius, widthSegs, heightSegs, tx, ty, tz, seedOffset) {
    const geo = new THREE.SphereGeometry(radius, widthSegs, heightSegs);
    const pAttr = geo.attributes.position;
    for (let v = 0; v < pAttr.count; v++) {
      const vx = pAttr.getX(v);
      const vy = pAttr.getY(v);
      const vz = pAttr.getZ(v);
      const len = Math.hypot(vx, vy, vz) || 1.0;
      const nx = vx / len;
      const ny = vy / len;
      const nz = vz / len;
      const wave =
        1.0 +
        0.14 * Math.sin(nx * 5.2 + ny * 3.8 + seedOffset) * Math.cos(nz * 4.7 - seedOffset) +
        0.08 * Math.cos(nx * 9.1 - nz * 7.3 + seedOffset * 1.7);
      const verticalShape = ny < 0 ? 0.78 : 1.04;
      pAttr.setXYZ(v, vx * wave + tx, vy * wave * verticalShape + ty, vz * wave + tz);
    }
    geo.computeVertexNormals();
    return geo;
  }

  // Tapered natural woody trunk sunk 6mm below ground origin so roots never float on slopes
  const trunkGeo = new THREE.CylinderGeometry(0.0014, 0.0032, 0.030, 8);
  trunkGeo.translate(0, 0.009, 0);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x4b3420,
    roughness: 0.92,
    metalness: 0.02,
  });
  const trunkInstanced = new THREE.InstancedMesh(trunkGeo, trunkMat, numTrees);
  trunkInstanced.castShadow = true;

  const crownMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.84,
    metalness: 0.02,
    envMapIntensity: 0.42,
    flatShading: false,
  });

  const crownMainGeo = createNaturalFoliageGeometry(0.0145, 14, 12, 0.0, 0.028, 0.0, 1.1);
  const crownUpperGeo = createNaturalFoliageGeometry(0.0112, 12, 10, 0.0032, 0.039, -0.0024, 3.7);
  const crownSideGeo = createNaturalFoliageGeometry(0.0118, 12, 10, -0.0042, 0.025, 0.0034, 6.4);

  const crownInstanced = new THREE.InstancedMesh(crownMainGeo, crownMat, numTrees);
  crownInstanced.castShadow = true;
  crownInstanced.receiveShadow = true;

  const crown2Instanced = new THREE.InstancedMesh(crownUpperGeo, crownMat, numTrees);
  crown2Instanced.castShadow = !isMobilePerf;
  crown2Instanced.receiveShadow = true;

  const crown3Instanced = new THREE.InstancedMesh(crownSideGeo, crownMat, numTrees);
  crown3Instanced.castShadow = !isMobilePerf;
  crown3Instanced.receiveShadow = true;

  const _treeMat = new THREE.Matrix4();
  const _treePos = new THREE.Vector3();
  const _treeQuat = new THREE.Quaternion();
  const _treeScale = new THREE.Vector3();
  const _treeCol = new THREE.Color();
  const _treeColUpper = new THREE.Color();

  const foliageTints = [
    0x376429, // Bright sunlit French oak green
    0x2d5522, // Rich woodland green
    0x447233, // Sunlit summer canopy
    0x3a632c, // Meadow tree green
    0x4e7030, // Warm olive-sage leaf tone
    0x315926, // Cypress green
  ];

  const treeRand = (seed) => {
    const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };

  let treeCount = 0;
  const placedTrees = [];

  // Pre-compute the 4 French Countryside Region physical roadside sign coordinates & sightline zones
  // Placed along straight/gentle approach stretches (away from sharp corners)
  const regionalSignSpecs = [
    { sampleIdx: 18,  side: 1,  latOffset: 0.062, title: 'PLAINE DU MAINE' },
    { sampleIdx: 150, side: -1, latOffset: 0.062, title: 'COTEAUX DE LA SARTHE' },
    { sampleIdx: 282, side: 1,  latOffset: 0.060, title: 'FORÊT DE BERCÉ' },
    { sampleIdx: 446, side: 1,  latOffset: 0.062, title: 'LAC DE LA GÉMERIE' },
  ];
  const regionalSignZones = [];
  for (const spec of regionalSignSpecs) {
    if (samples.length > spec.sampleIdx) {
      const s = samples[spec.sampleIdx];
      const rx = s.right[0];
      const rz = s.right[2];
      const rLen = Math.hypot(rx, rz) || 1.0;
      const sx = s.position[0] + (rx / rLen) * spec.side * spec.latOffset;
      const sz = s.position[2] + (rz / rLen) * spec.side * spec.latOffset;
      const approachX = sx - s.tangent[0] * 0.028 - (rx / rLen) * spec.side * 0.006;
      const approachZ = sz - s.tangent[2] * 0.028 - (rz / rLen) * spec.side * 0.006;
      regionalSignZones.push({ sx, sz, approachX, approachZ });
    }
  }

  function isBlockingRegionalSign(x, z) {
    for (let i = 0; i < regionalSignZones.length; i++) {
      const zInfo = regionalSignZones[i];
      if (Math.hypot(x - zInfo.sx, z - zInfo.sz) < 0.026) return true;
      if (Math.hypot(x - zInfo.approachX, z - zInfo.approachZ) < 0.032) return true;
    }
    return false;
  }

  // 7A. DENSE FOREST SETUP BETWEEN THE DUNLOP ARCH (Sample 248) AND PORSCHE ARCH (Sample 375)
  //     Multi-row woodland canopy flanking both left and right sides of the mountain pass road
  const forestStartSample = 251;
  const forestEndSample = 372;
  const numForestBroadleaf = 340;

  if (samples.length > forestEndSample) {
    for (let f = 0; f < numForestBroadleaf; f++) {
      const r1 = treeRand(f * 5 + 1001);
      const r2 = treeRand(f * 5 + 1002);
      const r3 = treeRand(f * 5 + 1003);
      const r4 = treeRand(f * 5 + 1004);

      const tSpan = (f + r1 * 0.85) / numForestBroadleaf;
      const exactSample = forestStartSample + tSpan * (forestEndSample - forestStartSample);
      const sIdx = Math.min(samples.length - 1, Math.max(0, Math.floor(exactSample)));
      const s = samples[sIdx];

      const side = f % 2 === 0 ? -1 : 1;
      const rowTier = Math.floor(f / 2) % 4; // 4 staggered woodland depth rows on each side
      const baseOffset = 0.064 + rowTier * 0.036;
      const latDist = baseOffset + r2 * 0.034;

      const rx = s.right[0];
      const rz = s.right[2];
      const rLen = Math.hypot(rx, rz) || 1.0;
      const txVec = s.tangent[0];
      const tzVec = s.tangent[2];
      const jitterAlong = (r4 - 0.5) * 0.018;

      const tx = s.position[0] + (rx / rLen) * side * latDist + txVec * jitterAlong;
      const tz = s.position[2] + (rz / rLen) * side * latDist + tzVec * jitterAlong;

      // Keep forest trees safely outside the drivable road & barriers, and clear of regional signs
      if (getTrackDistance(tx, tz) < 0.062 || isBlockingRegionalSign(tx, tz)) continue;

      let overlaps = false;
      for (let k = 0; k < placedTrees.length; k++) {
        if (Math.hypot(tx - placedTrees[k][0], tz - placedTrees[k][1]) < 0.017) {
          overlaps = true;
          break;
        }
      }
      if (overlaps) continue;
      placedTrees.push([tx, tz]);

      const ty = getTerrainElevation(tx, tz);
      const sVal = 0.82 + r3 * 0.56 + (rowTier * 0.06);
      _treePos.set(tx, ty, tz);
      _treeQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r1 * Math.PI * 2);
      _treeScale.set(
        sVal * (0.92 + r2 * 0.18),
        sVal * (0.94 + r1 * 0.30),
        sVal * (0.92 + r3 * 0.18)
      );
      _treeMat.compose(_treePos, _treeQuat, _treeScale);

      trunkInstanced.setMatrixAt(treeCount, _treeMat);
      crownInstanced.setMatrixAt(treeCount, _treeMat);
      crown2Instanced.setMatrixAt(treeCount, _treeMat);
      crown3Instanced.setMatrixAt(treeCount, _treeMat);

      const baseHex = foliageTints[f % foliageTints.length];
      _treeCol.setHex(baseHex);
      _treeColUpper.setHex(baseHex).offsetHSL(0.01, 0.04, 0.05);

      crownInstanced.setColorAt(treeCount, _treeCol);
      crown2Instanced.setColorAt(treeCount, _treeColUpper);
      crown3Instanced.setColorAt(treeCount, _treeCol);

      treeCount++;
    }
  }

  // 7B. GENERAL COUNTRYSIDE & PERIMETER WOODLAND TREES
  const generalTreeBudget = numTrees - treeCount;
  for (let i = 0; i < generalTreeBudget && treeCount < numTrees; i++) {
    const r1 = treeRand(i * 3 + 1);
    const r2 = treeRand(i * 3 + 2);
    const r3 = treeRand(i * 3 + 3);
    let tx = 0;
    let tz = 0;

    if (i < 150) {
      // Northern Highland Mountain Pass & Forest Esses outer woodland
      tx = -1.05 + r1 * 2.10;
      tz = -0.14 - r2 * 0.72;
    } else if (i < 250) {
      // Central valley & Esses interior groves
      tx = -0.72 + r1 * 1.38;
      tz = -0.32 + r2 * 0.44;
    } else if (i < 320) {
      // Western pasture hedgerows & outer groves
      tx = -1.12 + r1 * 0.48;
      tz = -0.15 + r2 * 0.54;
    } else {
      // Background rolling countryside hills & perimeter forests
      const angle = ((i - 320) / Math.max(1, generalTreeBudget - 320)) * Math.PI * 2;
      const rad = 0.96 + r1 * 0.95;
      tx = Math.cos(angle) * rad;
      tz = Math.sin(angle) * rad * 0.78;
    }

    // STRICT EXCLUSION 1: Keep general countryside trees >= 86mm outside the drivable road centerline
    if (getTrackDistance(tx, tz) < 0.086 || isBlockingRegionalSign(tx, tz)) continue;

    // STRICT EXCLUSION 2: Exclude the Eastern Lake Basin + shoreline beach rim
    const lakeOuterCheck = Math.hypot((tx - 0.80) / 0.34, (tz - 0.10) / 0.29);
    if (lakeOuterCheck < 1.06 || getLakeBasinDepth(tx, tz) > 0.0) continue;

    // STRICT EXCLUSION 3: Avoid paddock / pit building & main grandstand footprints
    if (tx > -0.36 && tx < 0.28 && tz > 0.09 && tz < 0.45) continue;

    // STRICT EXCLUSION 4: Keep trees off the steep domes of hillSpecs so they sit on natural ground & lower foothills
    let onHillCrest = false;
    for (let h = 0; h < hillSpecs.length; h++) {
      const [hx, hz, radX, radZ] = hillSpecs[h];
      const dHill = Math.hypot((tx - hx) / (radX * 0.92), (tz - hz) / (radZ * 0.92));
      if (dHill < 1.0) {
        onHillCrest = true;
        break;
      }
    }
    if (onHillCrest) continue;

    const ty = getTerrainElevation(tx, tz);

    // STRICT EXCLUSION 5: Prevent trees from overlapping each other
    let overlapsTree = false;
    for (let k = 0; k < placedTrees.length; k++) {
      if (Math.hypot(tx - placedTrees[k][0], tz - placedTrees[k][1]) < 0.026) {
        overlapsTree = true;
        break;
      }
    }
    if (overlapsTree) continue;
    placedTrees.push([tx, tz]);

    const sVal = 0.72 + r3 * 0.52;
    _treePos.set(tx, ty, tz);
    _treeQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r1 * Math.PI * 2);
    _treeScale.set(sVal * (0.92 + r2 * 0.18), sVal * (0.88 + r1 * 0.28), sVal * (0.92 + r3 * 0.18));
    _treeMat.compose(_treePos, _treeQuat, _treeScale);

    trunkInstanced.setMatrixAt(treeCount, _treeMat);
    crownInstanced.setMatrixAt(treeCount, _treeMat);
    crown2Instanced.setMatrixAt(treeCount, _treeMat);
    crown3Instanced.setMatrixAt(treeCount, _treeMat);

    const baseHex = foliageTints[i % foliageTints.length];
    _treeCol.setHex(baseHex);
    _treeColUpper.setHex(baseHex).offsetHSL(0.01, 0.04, 0.05);

    crownInstanced.setColorAt(treeCount, _treeCol);
    crown2Instanced.setColorAt(treeCount, _treeColUpper);
    crown3Instanced.setColorAt(treeCount, _treeCol);

    treeCount++;
  }

  trunkInstanced.count = treeCount;
  crownInstanced.count = treeCount;
  crown2Instanced.count = treeCount;
  crown3Instanced.count = treeCount;
  trunkInstanced.instanceMatrix.needsUpdate = true;
  crownInstanced.instanceMatrix.needsUpdate = true;
  crown2Instanced.instanceMatrix.needsUpdate = true;
  crown3Instanced.instanceMatrix.needsUpdate = true;
  if (crownInstanced.instanceColor) crownInstanced.instanceColor.needsUpdate = true;
  if (crown2Instanced.instanceColor) crown2Instanced.instanceColor.needsUpdate = true;
  if (crown3Instanced.instanceColor) crown3Instanced.instanceColor.needsUpdate = true;
  trunkInstanced.computeBoundingSphere();
  crownInstanced.computeBoundingSphere();
  crown2Instanced.computeBoundingSphere();
  crown3Instanced.computeBoundingSphere();

  dioramaRoot.add(trunkInstanced);
  dioramaRoot.add(crownInstanced);
  dioramaRoot.add(crown2Instanced);
  dioramaRoot.add(crown3Instanced);

  // 7C. LAYERED CONIFER PINES & WOODLAND UNDERGROWTH IN THE DUNLOP-TO-PORSCHE FOREST
  const maxPines = 240;
  const pineTrunkGeo = new THREE.CylinderGeometry(0.0011, 0.0028, 0.034, 8);
  pineTrunkGeo.translate(0, 0.011, 0);
  const pineTier1Geo = new THREE.ConeGeometry(0.0145, 0.024, 10);
  pineTier1Geo.translate(0, 0.024, 0);
  const pineTier2Geo = new THREE.ConeGeometry(0.0115, 0.022, 10);
  pineTier2Geo.translate(0, 0.036, 0);
  const pineTier3Geo = new THREE.ConeGeometry(0.0082, 0.019, 10);
  pineTier3Geo.translate(0, 0.047, 0);

  const pineTrunkInst = new THREE.InstancedMesh(pineTrunkGeo, trunkMat, maxPines);
  pineTrunkInst.castShadow = true;
  const pineTier1Inst = new THREE.InstancedMesh(pineTier1Geo, crownMat, maxPines);
  pineTier1Inst.castShadow = true;
  pineTier1Inst.receiveShadow = true;
  const pineTier2Inst = new THREE.InstancedMesh(pineTier2Geo, crownMat, maxPines);
  pineTier2Inst.castShadow = !isMobilePerf;
  pineTier2Inst.receiveShadow = true;
  const pineTier3Inst = new THREE.InstancedMesh(pineTier3Geo, crownMat, maxPines);
  pineTier3Inst.castShadow = !isMobilePerf;
  pineTier3Inst.receiveShadow = true;

  const pineTints = [0x23491d, 0x2b5522, 0x1e4119, 0x315d27, 0x274e20];
  let pineCount = 0;

  if (samples.length > forestEndSample) {
    for (let p = 0; p < maxPines; p++) {
      const r1 = treeRand(p * 7 + 3001);
      const r2 = treeRand(p * 7 + 3002);
      const r3 = treeRand(p * 7 + 3003);
      const r4 = treeRand(p * 7 + 3004);

      const tSpan = (p + r1 * 0.9) / maxPines;
      const exactSample = forestStartSample + tSpan * (forestEndSample - forestStartSample);
      const sIdx = Math.min(samples.length - 1, Math.max(0, Math.floor(exactSample)));
      const s = samples[sIdx];

      const side = p % 2 === 0 ? 1 : -1;
      const rowTier = Math.floor(p / 2) % 4;
      const latDist = 0.070 + rowTier * 0.038 + r2 * 0.032;

      const rx = s.right[0];
      const rz = s.right[2];
      const rLen = Math.hypot(rx, rz) || 1.0;
      const jitterAlong = (r4 - 0.5) * 0.020;

      const tx = s.position[0] + (rx / rLen) * side * latDist + s.tangent[0] * jitterAlong;
      const tz = s.position[2] + (rz / rLen) * side * latDist + s.tangent[2] * jitterAlong;

      if (getTrackDistance(tx, tz) < 0.065 || isBlockingRegionalSign(tx, tz)) continue;

      let overlaps = false;
      for (let k = 0; k < placedTrees.length; k++) {
        if (Math.hypot(tx - placedTrees[k][0], tz - placedTrees[k][1]) < 0.015) {
          overlaps = true;
          break;
        }
      }
      if (overlaps) continue;
      placedTrees.push([tx, tz]);

      const ty = getTerrainElevation(tx, tz);
      const sVal = 0.85 + r3 * 0.62 + rowTier * 0.05;
      _treePos.set(tx, ty, tz);
      _treeQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r1 * Math.PI * 2);
      _treeScale.set(sVal * (0.90 + r2 * 0.16), sVal * (0.96 + r1 * 0.28), sVal * (0.90 + r3 * 0.16));
      _treeMat.compose(_treePos, _treeQuat, _treeScale);

      pineTrunkInst.setMatrixAt(pineCount, _treeMat);
      pineTier1Inst.setMatrixAt(pineCount, _treeMat);
      pineTier2Inst.setMatrixAt(pineCount, _treeMat);
      pineTier3Inst.setMatrixAt(pineCount, _treeMat);

      const pHex = pineTints[p % pineTints.length];
      _treeCol.setHex(pHex);
      _treeColUpper.setHex(pHex).offsetHSL(0.01, 0.04, 0.04);

      pineTier1Inst.setColorAt(pineCount, _treeCol);
      pineTier2Inst.setColorAt(pineCount, _treeColUpper);
      pineTier3Inst.setColorAt(pineCount, _treeColUpper);
      pineCount++;
    }
  }

  pineTrunkInst.count = pineCount;
  pineTier1Inst.count = pineCount;
  pineTier2Inst.count = pineCount;
  pineTier3Inst.count = pineCount;
  pineTrunkInst.instanceMatrix.needsUpdate = true;
  pineTier1Inst.instanceMatrix.needsUpdate = true;
  pineTier2Inst.instanceMatrix.needsUpdate = true;
  pineTier3Inst.instanceMatrix.needsUpdate = true;
  if (pineTier1Inst.instanceColor) pineTier1Inst.instanceColor.needsUpdate = true;
  if (pineTier2Inst.instanceColor) pineTier2Inst.instanceColor.needsUpdate = true;
  if (pineTier3Inst.instanceColor) pineTier3Inst.instanceColor.needsUpdate = true;
  pineTrunkInst.computeBoundingSphere();
  pineTier1Inst.computeBoundingSphere();
  pineTier2Inst.computeBoundingSphere();
  pineTier3Inst.computeBoundingSphere();

  dioramaRoot.add(pineTrunkInst);
  dioramaRoot.add(pineTier1Inst);
  dioramaRoot.add(pineTier2Inst);
  dioramaRoot.add(pineTier3Inst);

  // Low roadside woodland shrubs & bushes along the Dunlop-to-Porsche forest floor
  const maxShrubs = 200;
  const shrubGeo = createNaturalFoliageGeometry(0.0085, 10, 8, 0.0, 0.0045, 0.0, 2.3);
  const shrubInst = new THREE.InstancedMesh(shrubGeo, crownMat, maxShrubs);
  shrubInst.castShadow = !isMobilePerf;
  shrubInst.receiveShadow = true;
  let shrubCount = 0;

  if (samples.length > forestEndSample) {
    for (let b = 0; b < maxShrubs; b++) {
      const r1 = treeRand(b * 5 + 5001);
      const r2 = treeRand(b * 5 + 5002);
      const r3 = treeRand(b * 5 + 5003);

      const tSpan = (b + r1 * 0.85) / maxShrubs;
      const exactSample = forestStartSample + tSpan * (forestEndSample - forestStartSample);
      const sIdx = Math.min(samples.length - 1, Math.max(0, Math.floor(exactSample)));
      const s = samples[sIdx];

      const side = b % 2 === 0 ? -1 : 1;
      const latDist = 0.056 + r2 * 0.068;
      const rx = s.right[0];
      const rz = s.right[2];
      const rLen = Math.hypot(rx, rz) || 1.0;

      const tx = s.position[0] + (rx / rLen) * side * latDist;
      const tz = s.position[2] + (rz / rLen) * side * latDist;
      if (getTrackDistance(tx, tz) < 0.054 || isBlockingRegionalSign(tx, tz)) continue;

      const ty = getTerrainElevation(tx, tz);
      const sVal = 0.75 + r3 * 0.65;
      _treePos.set(tx, ty, tz);
      _treeQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r1 * Math.PI * 2);
      _treeScale.set(sVal * 1.15, sVal * 0.78, sVal * 1.12);
      _treeMat.compose(_treePos, _treeQuat, _treeScale);

      shrubInst.setMatrixAt(shrubCount, _treeMat);
      _treeCol.setHex(foliageTints[(b + 2) % foliageTints.length]);
      shrubInst.setColorAt(shrubCount, _treeCol);
      shrubCount++;
    }
  }

  shrubInst.count = shrubCount;
  shrubInst.instanceMatrix.needsUpdate = true;
  if (shrubInst.instanceColor) shrubInst.instanceColor.needsUpdate = true;
  shrubInst.computeBoundingSphere();
  dioramaRoot.add(shrubInst);

  // -------------------------------------------------------------------------
  // 8. PERIMETER HIGH-MAST FLOODLIGHT TOWERS (Strictly Outside Track & Lake)
  // -------------------------------------------------------------------------
  const floodlightPositions = [
    [-0.38,  0.42], // Outside Pit Straight exit
    [-0.92,  0.10], // Outside Dunlop Curve
    [-0.58, -0.64], // Outside Esses & Uphill Climb
    [ 0.18, -0.78], // Outside Highland Summit Pass
    [ 1.08, -0.26], // Outside Downhill Mountain Descent
    [ 0.58,  0.46], // Outside Arnage Curves
  ];

  const towerMat = new THREE.MeshStandardMaterial({
    color: 0x6c7888,
    roughness: 0.45,
    metalness: 0.75,
  });

  const concreteBaseMat = new THREE.MeshStandardMaterial({
    color: 0x5c6470,
    roughness: 0.88,
    metalness: 0.05,
  });

  const lampClusterMat = new THREE.MeshStandardMaterial({
    color: 0xffe8c2,
    emissive: 0xffc870,
    emissiveIntensity: 0.14,
    roughness: 0.35,
  });

  const perimeterSpots = [];

  for (const fPos of floodlightPositions) {
    const fX = fPos[0];
    const fZ = fPos[1];
    if (getTrackDistance(fX, fZ) < 0.098 || getLakeBasinDepth(fX, fZ) > 0.0) continue;

    const fY = getTerrainElevation(fX, fZ);

    const towerGroup = new THREE.Group();
    towerGroup.position.set(fX, fY - 0.003, fZ);

    const mastHeight = 0.078;
    const mastGeo = new THREE.CylinderGeometry(0.0010, 0.0018, mastHeight, 6);
    const mastMesh = new THREE.Mesh(mastGeo, towerMat);
    mastMesh.position.y = mastHeight * 0.5;
    mastMesh.castShadow = true;
    towerGroup.add(mastMesh);

    const baseGeo = new THREE.CylinderGeometry(0.0034, 0.0042, 0.008, 8);
    const baseMesh = new THREE.Mesh(baseGeo, concreteBaseMat);
    baseMesh.position.y = 0.002;
    towerGroup.add(baseMesh);

    const headGeo = new THREE.BoxGeometry(0.012, 0.005, 0.004);
    const headMesh = new THREE.Mesh(headGeo, lampClusterMat);
    headMesh.position.set(0, mastHeight, 0);
    headMesh.rotation.x = 0.45;
    towerGroup.add(headMesh);

    if (!isMobilePerf) {
      const spot = new THREE.SpotLight(0xffecc4, 0.06, 0.32, Math.PI * 0.34, 0.72, 1.5);
      spot.position.set(0, mastHeight, 0);
      spot.target.position.set(0, -mastHeight, -0.04);
      towerGroup.add(spot);
      towerGroup.add(spot.target);
      perimeterSpots.push(spot);
    }

    dioramaRoot.add(towerGroup);
  }

  // -------------------------------------------------------------------------
  // 10. PLAINE DU MAINE — AUTHENTIC FRENCH COUNTRYSIDE FARMHOUSES ("Longères Sarthoises")
  // -------------------------------------------------------------------------
  const farmhouseGroup = new THREE.Group();
  farmhouseGroup.name = 'PlaineDuMaineFarmhouses';

  const tuffeauStoneMat = new THREE.MeshStandardMaterial({
    color: 0xd8cdb8, // Warm French Tuffeau limestone
    roughness: 0.86,
    metalness: 0.02,
    envMapIntensity: 0.35,
  });
  const slateRoofMat = new THREE.MeshStandardMaterial({
    color: 0x2f3640, // Loire/Sarthe dark slate roof tiles
    roughness: 0.68,
    metalness: 0.12,
    envMapIntensity: 0.45,
  });
  const terracottaRoofMat = new THREE.MeshStandardMaterial({
    color: 0x8f442e, // Weathered French clay roof tiles
    roughness: 0.74,
    metalness: 0.06,
    envMapIntensity: 0.38,
  });
  const timberTrimMat = new THREE.MeshStandardMaterial({
    color: 0x4a3525,
    roughness: 0.82,
    metalness: 0.04,
  });
  const farmhouseWinMat = new THREE.MeshStandardMaterial({
    color: 0x24303c,
    emissive: 0xffd584,
    emissiveIntensity: 0.12,
    roughness: 0.22,
    metalness: 0.45,
  });

  function createFrenchFarmhouse(fx, fz, yaw, scale = 1.0, useTerracotta = false) {
    const fg = new THREE.Group();
    const gy = getTerrainElevation(fx, fz);
    fg.position.set(fx, gy - 0.003, fz);
    fg.rotation.y = yaw;

    const w = 0.036 * scale;
    const h = 0.015 * scale;
    const d = 0.016 * scale;

    // Main limestone farmhouse body with deep foundation skirt
    const walls = new THREE.Mesh(
      new THREE.BoxGeometry(w, h + 0.006, d),
      tuffeauStoneMat
    );
    walls.position.y = (h + 0.006) * 0.5 - 0.003;
    walls.castShadow = true;
    walls.receiveShadow = true;
    fg.add(walls);

    // Pitched Gable Roof (4-sided prism oriented along X)
    const roofShape = new THREE.Shape();
    const overhang = 0.0018 * scale;
    const roofH = 0.010 * scale;
    roofShape.moveTo(-(d * 0.5 + overhang), 0);
    roofShape.lineTo(0, roofH);
    roofShape.lineTo(d * 0.5 + overhang, 0);
    roofShape.closePath();

    const roofGeo = new THREE.ExtrudeGeometry(roofShape, {
      steps: 1,
      depth: w + overhang * 2,
      bevelEnabled: false,
    });
    roofGeo.rotateY(Math.PI * 0.5);
    roofGeo.translate(-(w * 0.5 + overhang), h, 0);

    const roofMesh = new THREE.Mesh(roofGeo, useTerracotta ? terracottaRoofMat : slateRoofMat);
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    fg.add(roofMesh);

    // Stone Chimney stack
    const chimney = new THREE.Mesh(
      new THREE.BoxGeometry(0.0035 * scale, roofH * 1.15, 0.0035 * scale),
      tuffeauStoneMat
    );
    chimney.position.set(w * 0.28, h + roofH * 0.55, -d * 0.15);
    chimney.castShadow = true;
    fg.add(chimney);

    // Timber door & shuttered windows along the front and back facades
    for (const fSide of [-1, 1]) {
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(0.0034 * scale, 0.0075 * scale, 0.0006),
        timberTrimMat
      );
      door.position.set(0, 0.0038 * scale, fSide * (d * 0.5 + 0.0002));
      fg.add(door);

      for (const wx of [-0.32, 0.32]) {
        const win = new THREE.Mesh(
          new THREE.BoxGeometry(0.0036 * scale, 0.0040 * scale, 0.0006),
          farmhouseWinMat
        );
        win.position.set(wx * w, h * 0.56, fSide * (d * 0.5 + 0.0002));
        fg.add(win);
      }
    }

    return fg;
  }

  const farmhousePlacements = [
    // Plaine du Maine — Open Southern & Southwestern French Countryside
    [-0.58,  0.48,  0.24, 1.05, false],
    [-0.49,  0.54, -0.35, 0.85, true],
    [ 0.44,  0.48, -0.18, 1.10, false],
    [ 0.55,  0.53,  0.42, 0.88, true],
    [-0.92,  0.46,  0.52, 1.00, false],
    [ 0.12,  0.54,  0.08, 0.96, true],
    // Open infield meadow farmstead in Plaine du Maine
    [ 0.36,  0.14, -0.28, 0.90, false],
    [-0.48,  0.12,  0.32, 0.86, true],
  ];

  for (const [fx, fz, fyaw, fscale, isTerra] of farmhousePlacements) {
    if (getTrackDistance(fx, fz) < 0.128 || getLakeBasinDepth(fx, fz) > 0.0) continue;
    farmhouseGroup.add(createFrenchFarmhouse(fx, fz, fyaw, fscale, isTerra));
  }
  dioramaRoot.add(farmhouseGroup);

  // -------------------------------------------------------------------------
  // 11. AUTHENTIC FRENCH COUNTRYSIDE REGIONAL ROADSIDE SIGNS (4 Regions)
  // -------------------------------------------------------------------------
  const regionSignsGroup = new THREE.Group();
  regionSignsGroup.name = 'LeMansRegionalRoadSigns';

  function createCountrysideRegionSignTexture(regionTitle) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');

    // Authentic French geographical/forestry dark green enamel background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 360);
    bgGrad.addColorStop(0.0, '#104526');
    bgGrad.addColorStop(0.5, '#0b381e');
    bgGrad.addColorStop(1.0, '#082b16');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 360);

    // Subtle physical metallic-enamel micro-grain
    ctx.fillStyle = 'rgba(255, 255, 255, 0.018)';
    for (let i = 0; i < 300; i++) {
      const gx = ((i * 173) % 1004) + 10;
      const gy = ((i * 97) % 340) + 10;
      ctx.fillRect(gx, gy, 3, 2);
    }

    // Rounded rectangular white French geographical sign border filet
    const pad = 20;
    const w = 1024 - pad * 2;
    const h = 360 - pad * 2;
    const r = 20;

    ctx.strokeStyle = '#f8faf8';
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.moveTo(pad + r, pad);
    ctx.lineTo(pad + w - r, pad);
    ctx.quadraticCurveTo(pad + w, pad, pad + w, pad + r);
    ctx.lineTo(pad + w, pad + h - r);
    ctx.quadraticCurveTo(pad + w, pad + h, pad + w - r, pad + h);
    ctx.lineTo(pad + r, pad + h);
    ctx.quadraticCurveTo(pad, pad + h, pad, pad + h - r);
    ctx.lineTo(pad, pad + r);
    ctx.quadraticCurveTo(pad, pad, pad + r, pad);
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(248, 250, 248, 0.28)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(pad + 14, pad + 14, w - 28, h - 28);

    // Corner mounting rivets
    ctx.fillStyle = '#d0dad2';
    for (const [bx, by] of [
      [52, 52],
      [1024 - 52, 52],
      [52, 360 - 52],
      [1024 - 52, 360 - 52],
    ]) {
      ctx.beginPath();
      ctx.arc(bx, by, 5.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Clean, bold white lettering scaled cleanly to fit any region name
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fontSize = regionTitle.length > 16 ? 72 : 88;
    ctx.font = `800 ${fontSize}px "Inter", "Helvetica Neue", Arial, sans-serif`;

    ctx.fillStyle = 'rgba(0, 14, 6, 0.55)';
    ctx.fillText(regionTitle, 512, 187);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(regionTitle, 512, 183);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    return tex;
  }

  const signPostMat = new THREE.MeshStandardMaterial({
    color: 0x3b2d20,
    roughness: 0.72,
    metalness: 0.18,
  });
  const signPlinthMat = new THREE.MeshStandardMaterial({
    color: 0x6e736b,
    roughness: 0.88,
    metalness: 0.05,
  });
  const signFrameMat = new THREE.MeshStandardMaterial({
    color: 0x0d2918,
    roughness: 0.42,
    metalness: 0.36,
  });
  const signBracketMat = new THREE.MeshStandardMaterial({
    color: 0x5c6660,
    roughness: 0.46,
    metalness: 0.72,
  });

  for (const spec of regionalSignSpecs) {
    if (samples.length <= spec.sampleIdx) continue;
    const s = samples[spec.sampleIdx];
    const r = new THREE.Vector3(s.right[0], 0, s.right[2]).normalize();
    const t = new THREE.Vector3(s.tangent[0], 0, s.tangent[2]).normalize();

    const sx = s.position[0] + r.x * spec.side * spec.latOffset;
    const sz = s.position[2] + r.z * spec.side * spec.latOffset;
    const groundY = Math.max(s.position[1], getTerrainElevation(sx, sz));

    const signRoot = new THREE.Group();
    signRoot.position.set(sx, groundY, sz);

    const yaw = Math.atan2(t.x, t.z);
    signRoot.rotation.set(0, yaw + Math.PI - spec.side * 0.22, 0);

    const boardW = 0.045;
    const boardH = 0.016;
    const postH = 0.029;
    const boardCenterY = 0.021;

    for (const px of [-boardW * 0.35, boardW * 0.35]) {
      const plinth = new THREE.Mesh(
        new THREE.BoxGeometry(0.0036, 0.014, 0.0036),
        signPlinthMat
      );
      plinth.position.set(px, -0.004, -0.0012);
      plinth.castShadow = true;
      plinth.receiveShadow = true;
      signRoot.add(plinth);

      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0010, 0.0012, postH + 0.010, 10),
        signPostMat
      );
      post.position.set(px, (postH - 0.010) * 0.5, -0.0012);
      post.castShadow = true;
      post.receiveShadow = true;
      signRoot.add(post);

      const cap = new THREE.Mesh(
        new THREE.BoxGeometry(0.0025, 0.0010, 0.0025),
        signFrameMat
      );
      cap.position.set(px, postH + 0.0004, -0.0012);
      cap.castShadow = true;
      signRoot.add(cap);
    }

    for (const ry of [boardCenterY - boardH * 0.28, boardCenterY + boardH * 0.28]) {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(boardW * 0.88, 0.0014, 0.0014),
        signBracketMat
      );
      rail.position.set(0, ry, -0.0005);
      rail.castShadow = true;
      signRoot.add(rail);
    }

    const casing = new THREE.Mesh(
      new THREE.BoxGeometry(boardW + 0.0020, boardH + 0.0020, 0.0016),
      signFrameMat
    );
    casing.position.set(0, boardCenterY, 0.0004);
    casing.castShadow = true;
    casing.receiveShadow = true;
    signRoot.add(casing);

    const topHood = new THREE.Mesh(
      new THREE.BoxGeometry(boardW + 0.0026, 0.0010, 0.0024),
      signFrameMat
    );
    topHood.position.set(0, boardCenterY + boardH * 0.5 + 0.0010, 0.0006);
    topHood.castShadow = true;
    signRoot.add(topHood);

    const regionTex = createCountrysideRegionSignTexture(spec.title);
    const faceMat = new THREE.MeshStandardMaterial({
      map: regionTex,
      roughness: 0.34,
      metalness: 0.08,
      emissiveMap: regionTex,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.06,
    });

    const facePlane = new THREE.Mesh(new THREE.PlaneGeometry(boardW, boardH), faceMat);
    facePlane.position.set(0, boardCenterY, 0.00128);
    facePlane.receiveShadow = true;
    signRoot.add(facePlane);

    regionSignsGroup.add(signRoot);
  }
  dioramaRoot.add(regionSignsGroup);

  const _lakeDayColor = new THREE.Color(0x1e7ba6);
  const _lakeDawnColor = new THREE.Color(0x1b3450);
  const _lakeEmissiveDay = new THREE.Color(0x071e2e);
  const _lakeEmissiveDawn = new THREE.Color(0x101424);

  function calibrateDeskPropsGlb() {}
  function updateLightingMaterials(sunScale = 0.65) {
    if (terrainMat) {
      terrainMat.roughness = 0.86 - 0.04 * sunScale;
    }
  }

  function setDayToDawnProgress(progress = 0.0) {
    const p = THREE.MathUtils.clamp(progress, 0.0, 1.0);
    // Synchronize landscape, hills, foliage, farmhouses, and lake reflections with time of day
    const envScale = THREE.MathUtils.lerp(0.68, 0.22, p);
    if (terrainMat) terrainMat.envMapIntensity = envScale;
    if (hillVertexMat) hillVertexMat.envMapIntensity = envScale;
    if (crownMat) crownMat.envMapIntensity = envScale * 0.92;

    if (lakeMat) {
      lakeMat.color.copy(_lakeDayColor).lerp(_lakeDawnColor, p);
      lakeMat.emissive.copy(_lakeEmissiveDay).lerp(_lakeEmissiveDawn, p);
      lakeMat.envMapIntensity = THREE.MathUtils.lerp(1.65, 0.55, p);
    }
    if (farmhouseWinMat) {
      farmhouseWinMat.emissiveIntensity = 0.12 + 0.75 * p;
    }
    if (lampClusterMat) {
      lampClusterMat.emissiveIntensity = 0.12 + 0.58 * p;
    }
    for (let i = 0; i < perimeterSpots.length; i++) {
      perimeterSpots[i].intensity = 0.05 + 0.28 * p;
    }
  }

  function setMonitorHighScoresVisible() {}

  return {
    root: dioramaRoot,
    nightGlowGroup,
    getTerrainElevation,
    calibrateDeskPropsGlb,
    updateLightingMaterials,
    setDayToDawnProgress,
    setMonitorHighScoresVisible,
  };
}

export function createNightWindowTexture() {
  return createCountrysideTerrainTexture();
}
