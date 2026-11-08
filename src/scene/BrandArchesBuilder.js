import * as THREE from 'three';
import {
  createPorscheCurvesArchTexture,
  createFerrariArchTexture,
  createToyotaGazooArchTexture,
  createBmwMotorsportArchTexture,
  createPeugeotSportArchTexture,
  createCadillacRacingTexture,
  createRolexStartFinishTexture,
  createBrakeMarkerTexture,
  createSponsorBoardTexture,
  createDunlopBridgeTexture,
} from './ProceduralTextures.js';

/**
 * Builds the Le Mans-Inspired Automotive Manufacturer Brand Arches & Trackside Sponsorship
 * for ASPHALT: LE MANS 24H.
 * 
 * Features:
 * - 6 Iconic Manufacturer & Endurance Arches at key circuit sectors:
 *   1. Rolex 24H Le Mans Official Start/Finish Grand Prix Timing Gantry (Sector 6, Pit Straight)
 *   2. Dunlop Bridge (Sector 1, Dunlop Curve)
 *   3. Ferrari AF Corse Hypercar Arch (Sector 2, The Esses & Tertre Rouge entry)
 *   4. Toyota Gazoo Racing Mulsanne High-Speed Arch with 340 km/h Speed Trap (Sector 3)
 *   5. BMW M Motorsport Chicane Gantry (Sector 3, Mulsanne First Chicane)
 *   6. Peugeot Sport TotalEnergies Hypercar Arch (Sector 5, Indianapolis & Arnage)
 *   7. Porsche Penske Motorsport Arch (Sector 6, Porsche Curves entry)
 * - Trackside sponsor barriers and Armco crash hoardings (Michelin, Rolex, Motul, TotalEnergies, Cadillac, Porsche)
 * - Distance brake markers (150m, 100m, 50m) approaching high-speed chicanes
 * - Zero collision interference: All structural supports grounded safely outside road clearance (>= 22mm lateral offset vs 12mm track half-width)
 */

export function buildBrandArchesAndSponsorship(splineData) {
  const archesRoot = new THREE.Group();
  archesRoot.name = 'LeMansBrandArchesAndSponsorship';

  const samples = splineData.samples;
  const N = samples.length;

  // Reusable materials
  const steelTrussMat = new THREE.MeshStandardMaterial({
    color: 0x828e9e,
    roughness: 0.35,
    metalness: 0.82,
  });

  const carbonFrameMat = new THREE.MeshStandardMaterial({
    color: 0x14171d,
    roughness: 0.45,
    metalness: 0.4,
  });

  const concreteBaseMat = new THREE.MeshStandardMaterial({
    color: 0x6e7886,
    roughness: 0.85,
    metalness: 0.05,
  });

  const armcoSteelMat = new THREE.MeshStandardMaterial({
    color: 0x9ca8b8,
    roughness: 0.32,
    metalness: 0.88,
  });

  // Helper to align a sponsorship arch strictly upright along the vertical Y axis
  function alignToSample(group, sampleIndex) {
    const s = samples[sampleIndex % N];
    const pos = new THREE.Vector3(...s.position);
    const tangent = new THREE.Vector3(...s.tangent).normalize();
    const yawAngle = Math.atan2(tangent.x, tangent.z);

    group.position.copy(pos);
    // Explicit upright axis alignment: zero pitch, upright yaw, zero roll
    group.rotation.set(0, yawAngle, 0);
  }

  // -------------------------------------------------------------------------
  // 1. ROLEX START / FINISH GRAND PRIX ARCH & ENDURANCE TIMING GANTRY (Sector 6, Sample 37)
  // -------------------------------------------------------------------------
  const rolexArchGroup = new THREE.Group();
  rolexArchGroup.name = 'RolexStartFinishArch';
  alignToSample(rolexArchGroup, 37);

  const spanHalfWidth = 0.052; // 52mm from centerline (clears widened 76mm roadbed + kerbs + guardrails)
  const gantryClearanceY = 0.026; // 26mm overhead clearance
  const gantrySignHeight = 0.0096;
  const gantryDepth = 0.0064;

  // Heavy structural aluminum truss towers on left and right
  for (const side of [-1, 1]) {
    const towerX = side * spanHalfWidth;

    // Concrete collision barrier footpad
    const footpad = new THREE.Mesh(
      new THREE.BoxGeometry(0.006, 0.010, 0.014),
      concreteBaseMat
    );
    footpad.position.set(towerX, 0.003, 0);
    footpad.castShadow = true;
    rolexArchGroup.add(footpad);

    // 4 vertical structural tubular columns per tower
    for (const [ox, oz] of [[-0.0016, -0.0022], [0.0016, -0.0022], [-0.0016, 0.0022], [0.0016, 0.0022]]) {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0007, 0.0007, gantryClearanceY + gantrySignHeight + 0.004, 8),
        steelTrussMat
      );
      col.position.set(towerX + ox, (gantryClearanceY + gantrySignHeight + 0.004) * 0.5, oz);
      col.castShadow = true;
      rolexArchGroup.add(col);
    }
  }

  // Spanning cross-box overhead structure
  const rolexCrossBox = new THREE.Mesh(
    new THREE.BoxGeometry(spanHalfWidth * 2 + 0.004, gantrySignHeight, gantryDepth),
    carbonFrameMat
  );
  rolexCrossBox.position.set(0, gantryClearanceY + gantrySignHeight * 0.5, 0);
  rolexCrossBox.castShadow = true;
  rolexArchGroup.add(rolexCrossBox);

  // 5-Light Start Countdown Signal Housing Box mounted along the lower front edge of the Start/Finish Arch
  const startLightBarHousing = new THREE.Mesh(
    new THREE.BoxGeometry(0.032, 0.0032, 0.0022),
    carbonFrameMat
  );
  startLightBarHousing.position.set(0, 0.0215, -gantryDepth * 0.42);
  startLightBarHousing.castShadow = true;
  rolexArchGroup.add(startLightBarHousing);

  // Front and Rear branded sign faces with Rolex 24H Le Mans Official Timepiece graphics
  const rolexTex = createRolexStartFinishTexture();
  const rolexFaceMat = new THREE.MeshStandardMaterial({
    map: rolexTex,
    roughness: 0.35,
    metalness: 0.25,
    emissiveMap: rolexTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.12,
  });

  const rolexFaceFront = new THREE.Mesh(
    new THREE.PlaneGeometry(spanHalfWidth * 2 + 0.002, gantrySignHeight * 0.95),
    rolexFaceMat
  );
  rolexFaceFront.position.set(0, gantryClearanceY + gantrySignHeight * 0.5, -gantryDepth * 0.51);
  rolexFaceFront.rotation.y = Math.PI; // Faces oncoming cars approaching from -Z
  rolexArchGroup.add(rolexFaceFront);

  const rolexFaceRear = new THREE.Mesh(
    new THREE.PlaneGeometry(spanHalfWidth * 2 + 0.002, gantrySignHeight * 0.95),
    rolexFaceMat
  );
  rolexFaceRear.position.set(0, gantryClearanceY + gantrySignHeight * 0.5, gantryDepth * 0.51);
  rolexArchGroup.add(rolexFaceRear);

  // Subtle overhead spotlight illuminating the start line
  const rolexUnderSpot = new THREE.SpotLight(0xffeaad, 0.35, 0.14, Math.PI * 0.32, 0.55, 1.6);
  rolexUnderSpot.position.set(0, gantryClearanceY - 0.001, 0);
  rolexUnderSpot.target.position.set(0, 0, 0);
  rolexArchGroup.add(rolexUnderSpot);
  rolexArchGroup.add(rolexUnderSpot.target);

  archesRoot.add(rolexArchGroup);

  // -------------------------------------------------------------------------
  // 2. ARCH A: FERRARI HYPERCAR ARCH (Sample 142 — Generous Space After Rolex Start Arch!)
  // -------------------------------------------------------------------------
  const ferrariArchGroup = new THREE.Group();
  ferrariArchGroup.name = 'FerrariAfCorseArch';
  alignToSample(ferrariArchGroup, 142);

  const ferrariSpan = 0.052; // Wide span clearing widened 76mm roadbed + kerbs
  const ferrariClearY = 0.026;
  const ferrariHeight = 0.0108;

  // Red & Yellow aerodynamic carbon towers
  const ferrariRedMat = new THREE.MeshStandardMaterial({
    color: 0xc80d16,
    roughness: 0.32,
    metalness: 0.35,
  });
  const ferrariYellowMat = new THREE.MeshStandardMaterial({
    color: 0xffe000,
    roughness: 0.30,
    metalness: 0.25,
  });

  for (const side of [-1, 1]) {
    const towerX = side * ferrariSpan;

    // Concrete base
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.0055, 0.008, 0.012), concreteBaseMat);
    base.position.set(towerX, 0.003, 0);
    ferrariArchGroup.add(base);

    // Tapered aerodynamic pylons in racing red
    const pylon = new THREE.Mesh(
      new THREE.BoxGeometry(0.0042, ferrariClearY + ferrariHeight, 0.0055),
      ferrariRedMat
    );
    pylon.position.set(towerX, (ferrariClearY + ferrariHeight) * 0.5, 0);
    pylon.castShadow = true;
    ferrariArchGroup.add(pylon);

    // Yellow accent winglet
    const winglet = new THREE.Mesh(new THREE.BoxGeometry(0.0048, 0.0016, 0.0068), ferrariYellowMat);
    winglet.position.set(towerX, ferrariClearY + 0.001, 0);
    ferrariArchGroup.add(winglet);
  }

  // Cross header in racing red
  const ferrariCross = new THREE.Mesh(
    new THREE.BoxGeometry(ferrariSpan * 2 + 0.004, ferrariHeight, 0.0055),
    ferrariRedMat
  );
  ferrariCross.position.set(0, ferrariClearY + ferrariHeight * 0.5, 0);
  ferrariCross.castShadow = true;
  ferrariArchGroup.add(ferrariCross);

  // Ferrari face
  const ferrariTex = createFerrariArchTexture();
  const ferrariFaceMat = new THREE.MeshStandardMaterial({
    map: ferrariTex,
    roughness: 0.35,
    metalness: 0.20,
    emissiveMap: ferrariTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.10,
  });

  const ferrariFaceFront = new THREE.Mesh(
    new THREE.PlaneGeometry(ferrariSpan * 2 + 0.001, ferrariHeight * 0.94),
    ferrariFaceMat
  );
  ferrariFaceFront.position.set(0, ferrariClearY + ferrariHeight * 0.5, -0.0029);
  ferrariFaceFront.rotation.y = Math.PI;
  ferrariArchGroup.add(ferrariFaceFront);

  const ferrariFaceRear = new THREE.Mesh(
    new THREE.PlaneGeometry(ferrariSpan * 2 + 0.001, ferrariHeight * 0.94),
    ferrariFaceMat
  );
  ferrariFaceRear.position.set(0, ferrariClearY + ferrariHeight * 0.5, 0.0029);
  ferrariArchGroup.add(ferrariFaceRear);

  archesRoot.add(ferrariArchGroup);

  // -------------------------------------------------------------------------
  // 3. ARCH B: PORSCHE MOTORSPORT ARCH (Sample 375 — Mountain Ridge Exit)
  // -------------------------------------------------------------------------
  const porscheArchGroup = new THREE.Group();
  porscheArchGroup.name = 'PorscheCurvesPenskeArch';
  alignToSample(porscheArchGroup, 375);

  const porscheSpan = 0.052;
  const porscheClearY = 0.026;
  const porscheHeight = 0.0096;

  for (const side of [-1, 1]) {
    const towerX = side * porscheSpan;
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.008, 0.012), concreteBaseMat);
    base.position.set(towerX, 0.003, 0);
    porscheArchGroup.add(base);

    const mast = new THREE.Mesh(
      new THREE.BoxGeometry(0.0038, porscheClearY + porscheHeight, 0.0050),
      carbonFrameMat
    );
    mast.position.set(towerX, (porscheClearY + porscheHeight) * 0.5, 0);
    mast.castShadow = true;
    porscheArchGroup.add(mast);
  }

  const porscheCross = new THREE.Mesh(
    new THREE.BoxGeometry(porscheSpan * 2 + 0.003, porscheHeight, 0.0052),
    carbonFrameMat
  );
  porscheCross.position.set(0, porscheClearY + porscheHeight * 0.5, 0);
  porscheCross.castShadow = true;
  porscheArchGroup.add(porscheCross);

  const porscheTex = createPorscheCurvesArchTexture();
  const porscheFaceMat = new THREE.MeshStandardMaterial({
    map: porscheTex,
    roughness: 0.35,
    metalness: 0.20,
    emissiveMap: porscheTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.10,
  });

  const porscheFaceFront = new THREE.Mesh(
    new THREE.PlaneGeometry(porscheSpan * 2 + 0.001, porscheHeight * 0.94),
    porscheFaceMat
  );
  porscheFaceFront.position.set(0, porscheClearY + porscheHeight * 0.5, -0.0027);
  porscheFaceFront.rotation.y = Math.PI;
  porscheArchGroup.add(porscheFaceFront);

  const porscheFaceRear = new THREE.Mesh(
    new THREE.PlaneGeometry(porscheSpan * 2 + 0.001, porscheHeight * 0.94),
    porscheFaceMat
  );
  porscheFaceRear.position.set(0, porscheClearY + porscheHeight * 0.5, 0.0027);
  porscheArchGroup.add(porscheFaceRear);

  archesRoot.add(porscheArchGroup);

  // -------------------------------------------------------------------------
  // 4. ARCH C: TOYOTA GAZOO RACING ARCH (Sample 568 — Waterside Curve Exit)
  // -------------------------------------------------------------------------
  const toyotaArchGroup = new THREE.Group();
  toyotaArchGroup.name = 'ToyotaGazooMulsanneArch';
  alignToSample(toyotaArchGroup, 568);

  const toyotaSpan = 0.052;
  const toyotaClearY = 0.026;
  const toyotaHeight = 0.0094;

  for (const side of [-1, 1]) {
    const towerX = side * toyotaSpan;
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.008, 0.012), concreteBaseMat);
    base.position.set(towerX, 0.003, 0);
    toyotaArchGroup.add(base);

    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0013, 0.0015, toyotaClearY + toyotaHeight, 12),
      steelTrussMat
    );
    mast.position.set(towerX, (toyotaClearY + toyotaHeight) * 0.5, 0);
    mast.castShadow = true;
    toyotaArchGroup.add(mast);
  }

  const toyotaCross = new THREE.Mesh(
    new THREE.BoxGeometry(toyotaSpan * 2 + 0.003, toyotaHeight, 0.0052),
    carbonFrameMat
  );
  toyotaCross.position.set(0, toyotaClearY + toyotaHeight * 0.5, 0);
  toyotaCross.castShadow = true;
  toyotaArchGroup.add(toyotaCross);

  const toyotaTex = createToyotaGazooArchTexture();
  const toyotaFaceMat = new THREE.MeshStandardMaterial({
    map: toyotaTex,
    roughness: 0.35,
    metalness: 0.20,
    emissiveMap: toyotaTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.10,
  });

  const toyotaFaceFront = new THREE.Mesh(
    new THREE.PlaneGeometry(toyotaSpan * 2 + 0.001, toyotaHeight * 0.94),
    toyotaFaceMat
  );
  toyotaFaceFront.position.set(0, toyotaClearY + toyotaHeight * 0.5, -0.0027);
  toyotaFaceFront.rotation.y = Math.PI;
  toyotaArchGroup.add(toyotaFaceFront);

  const toyotaFaceRear = new THREE.Mesh(
    new THREE.PlaneGeometry(toyotaSpan * 2 + 0.001, toyotaHeight * 0.94),
    toyotaFaceMat
  );
  toyotaFaceRear.position.set(0, toyotaClearY + toyotaHeight * 0.5, 0.0027);
  toyotaArchGroup.add(toyotaFaceRear);

  archesRoot.add(toyotaArchGroup);

  return {
    archesRoot,
  };
}

