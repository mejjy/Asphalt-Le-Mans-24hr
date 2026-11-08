import * as THREE from 'three';

/**
 * Outdoor Le Mans Lighting Rig & Daylight-to-Dawn Atmosphere for ASPHALT: LE MANS 24H
 * Smoothly transitions across 5 stages over the 120-second run:
 *   02:00 -> 01:30: Bright Daylight (crisp bright sunlight, clear sky fill, vibrant landscape)
 *   01:30 -> 01:00: Late Afternoon (warm sunlight, lengthening shadows)
 *   01:00 -> 00:30: Golden Hour Transition (amber-gold horizon, cooler zenith, softer ambient)
 *   00:30 -> 00:00: Dusk -> Darker Cinematic Dawn (deep indigo-slate sky, subtle dawn horizon,
 *                   cooler tones, comfortable road & car visibility)
 */
export function buildGoldenHourAtmosphere(scene) {
  const atmosphereGroup = new THREE.Group();
  atmosphereGroup.name = 'OutdoorLeMansLightingRig';

  // 1. Natural outdoor sky and earth hemisphere light (starts in bright, clear daylight)
  const hemiLight = new THREE.HemisphereLight(0x88c8f8, 0x526b3e, 0.74);
  atmosphereGroup.add(hemiLight);

  // 2. Directional sunlight (starts high & bright in daylight, lowers & dims smoothly toward dawn)
  const sunLight = new THREE.DirectionalLight(0xfffaf0, 1.42);
  sunLight.position.set(-1.2, 2.65, -1.7);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.1;
  sunLight.shadow.camera.far = 6.5;
  sunLight.shadow.camera.left = -1.75;
  sunLight.shadow.camera.right = 1.75;
  sunLight.shadow.camera.top = 1.75;
  sunLight.shadow.camera.bottom = -1.75;
  sunLight.shadow.bias = -0.0002;
  sunLight.shadow.normalBias = 0.0012;
  sunLight.shadow.radius = 1.2;
  atmosphereGroup.add(sunLight);

  // 3. Trackside fill light (subtle in daylight, provides gentle track definition as dawn darkens)
  const lampTarget = new THREE.Object3D();
  lampTarget.position.set(0.0, 0.024, 0.25);
  atmosphereGroup.add(lampTarget);

  const lampKeyLight = new THREE.SpotLight(
    0xffe8c4,
    0.22,
    2.8,
    Math.PI * 0.44,
    0.78,
    1.5
  );
  lampKeyLight.position.set(-0.15, 0.48, 0.12);
  lampKeyLight.target = lampTarget;
  lampKeyLight.castShadow = true;
  lampKeyLight.shadow.mapSize.width = 1024;
  lampKeyLight.shadow.mapSize.height = 1024;
  lampKeyLight.shadow.camera.near = 0.05;
  lampKeyLight.shadow.camera.far = 3.2;
  lampKeyLight.shadow.bias = -0.0003;
  lampKeyLight.shadow.normalBias = 0.001;
  lampKeyLight.shadow.radius = 1.2;
  atmosphereGroup.add(lampKeyLight);

  // 4. Subtle atmospheric god-ray curtains
  const godRayCurtainGroup = new THREE.Group();
  godRayCurtainGroup.name = 'DuskGodRayCurtains';

  const rayMat = new THREE.MeshBasicMaterial({
    color: 0xffc68a,
    transparent: true,
    opacity: 0.004,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const rayGeo = new THREE.PlaneGeometry(1.2, 0.6);
  for (let i = 0; i < 4; i++) {
    const rayMesh = new THREE.Mesh(rayGeo, rayMat);
    rayMesh.position.set(-0.2 + i * 0.15, 0.25, 0.1 + i * 0.06);
    rayMesh.rotation.set(-0.2, 0.35, -0.45);
    godRayCurtainGroup.add(rayMesh);
  }
  atmosphereGroup.add(godRayCurtainGroup);

  // 5. Subtle floating atmospheric motes
  const motesCount = 90;
  const motesGeo = new THREE.BufferGeometry();
  const motesPos = new Float32Array(motesCount * 3);
  for (let i = 0; i < motesCount; i++) {
    motesPos[i * 3 + 0] = (Math.random() - 0.5) * 1.8;
    motesPos[i * 3 + 1] = 0.02 + Math.random() * 0.35;
    motesPos[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
  }
  motesGeo.setAttribute('position', new THREE.BufferAttribute(motesPos, 3));

  const motesMat = new THREE.PointsMaterial({
    color: 0xffe8bb,
    size: 0.0026,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const motesPoints = new THREE.Points(motesGeo, motesMat);
  atmosphereGroup.add(motesPoints);

  scene.add(atmosphereGroup);

  // 5-stage lighting & fog keyframes synchronized with RoomEnvironmentBuilder
  const lightStages = [
    {
      // Stage 0 (02:00): Bright, Crisp Daylight — natural French sky, realistic shadows & metallic car reflections
      sunColor: new THREE.Color(0xfffaf0),
      hemiSky: new THREE.Color(0x88c8f8),
      hemiGround: new THREE.Color(0x526b3e),
      fogColor: new THREE.Color(0xbce0f8),
      bgColor: new THREE.Color(0x54a2e8),
      sunX: -1.15,
      sunY: 2.65,
      sunZ: -1.60,
      sunMult: 1.04,
      hemiMult: 1.02,
      exposure: 0.86,
      envIntensity: 0.68,
    },
    {
      // Stage 1 (01:30): Late Afternoon — slightly softer warm sunlight, lengthening shadows
      sunColor: new THREE.Color(0xffeec8),
      hemiSky: new THREE.Color(0x8cb8e4),
      hemiGround: new THREE.Color(0x4b5c38),
      fogColor: new THREE.Color(0xc8d4e2),
      bgColor: new THREE.Color(0x6296ce),
      sunX: -1.28,
      sunY: 2.02,
      sunZ: -1.68,
      sunMult: 0.88,
      hemiMult: 0.88,
      exposure: 0.80,
      envIntensity: 0.56,
    },
    {
      // Stage 2 (01:00): Golden Hour / Sunset Transition — longer shadows, warm horizon, cooler sky
      sunColor: new THREE.Color(0xffbe76),
      hemiSky: new THREE.Color(0x747aa4),
      hemiGround: new THREE.Color(0x3b3d2c),
      fogColor: new THREE.Color(0xc49478),
      bgColor: new THREE.Color(0x5a6088),
      sunX: -1.42,
      sunY: 1.42,
      sunZ: -1.76,
      sunMult: 0.68,
      hemiMult: 0.72,
      exposure: 0.74,
      envIntensity: 0.42,
    },
    {
      // Stage 3 (00:30): Twilight / Early Dusk — cooler blue-slate ambient, deep shadows
      sunColor: new THREE.Color(0xf09862),
      hemiSky: new THREE.Color(0x4c587c),
      hemiGround: new THREE.Color(0x252822),
      fogColor: new THREE.Color(0x7c5a64),
      bgColor: new THREE.Color(0x363e62),
      sunX: -1.55,
      sunY: 0.98,
      sunZ: -1.82,
      sunMult: 0.50,
      hemiMult: 0.56,
      exposure: 0.67,
      envIntensity: 0.30,
    },
    {
      // Stage 4 (00:00): Darker Cinematic Early-Morning Dawn — cool dark sky, subtle dawn horizon glow,
      // clear road and car visibility without artificial washout
      sunColor: new THREE.Color(0xe6926c),
      hemiSky: new THREE.Color(0x3c4868),
      hemiGround: new THREE.Color(0x1c1f1c),
      fogColor: new THREE.Color(0x584454),
      bgColor: new THREE.Color(0x222a46),
      sunX: -1.65,
      sunY: 0.72,
      sunZ: -1.88,
      sunMult: 0.38,
      hemiMult: 0.48,
      exposure: 0.62,
      envIntensity: 0.22,
    },
  ];

  let currentDayToDawnProgress = 0.0;

  function setDayToDawnProgress(progress = 0.0) {
    currentDayToDawnProgress = THREE.MathUtils.clamp(progress, 0.0, 1.0);
    const scaled = currentDayToDawnProgress * (lightStages.length - 1);
    const idx0 = Math.min(lightStages.length - 2, Math.floor(scaled));
    const idx1 = idx0 + 1;
    const t = scaled - idx0;

    const s0 = lightStages[idx0];
    const s1 = lightStages[idx1];

    sunLight.color.copy(s0.sunColor).lerp(s1.sunColor, t);
    hemiLight.color.copy(s0.hemiSky).lerp(s1.hemiSky, t);
    hemiLight.groundColor.copy(s0.hemiGround).lerp(s1.hemiGround, t);

    const sunX = THREE.MathUtils.lerp(s0.sunX, s1.sunX, t);
    const sunY = THREE.MathUtils.lerp(s0.sunY, s1.sunY, t);
    const sunZ = THREE.MathUtils.lerp(s0.sunZ, s1.sunZ, t);
    sunLight.position.set(sunX, sunY, sunZ);

    if (scene.fog) {
      scene.fog.color.copy(s0.fogColor).lerp(s1.fogColor, t);
      // Clear visibility in daylight (0.011), gently deepening mist toward dawn (0.024)
      scene.fog.density = 0.011 + 0.013 * currentDayToDawnProgress;
    }
    if (scene.background && scene.background.isColor) {
      scene.background.copy(s0.bgColor).lerp(s1.bgColor, t);
    }

    rayMat.opacity = 0.003 + 0.008 * Math.sin(currentDayToDawnProgress * Math.PI);
    motesMat.opacity = 0.06 + 0.06 * currentDayToDawnProgress;
  }

  function requestShadowMapUpdate() {
    sunLight.shadow.needsUpdate = true;
    lampKeyLight.shadow.needsUpdate = true;
  }

  function updateAtmosphere(elapsedTime, settings, renderer) {
    const sunScale = settings.sunIntensity ?? 0.65;
    const lampScale = settings.lampIntensity ?? 0.45;

    const scaled = currentDayToDawnProgress * (lightStages.length - 1);
    const idx0 = Math.min(lightStages.length - 2, Math.floor(scaled));
    const t = scaled - idx0;
    const s0 = lightStages[idx0];
    const s1 = lightStages[idx0 + 1];

    const stageSunMult = THREE.MathUtils.lerp(s0.sunMult, s1.sunMult, t);
    const stageHemiMult = THREE.MathUtils.lerp(s0.hemiMult, s1.hemiMult, t);
    const stageExposure = THREE.MathUtils.lerp(s0.exposure, s1.exposure, t);
    const stageEnvInt = THREE.MathUtils.lerp(s0.envIntensity, s1.envIntensity, t);

    sunLight.intensity = 1.54 * (0.55 + 0.45 * sunScale) * stageSunMult;
    hemiLight.intensity = (0.56 + 0.26 * sunScale) * stageHemiMult;
    lampKeyLight.intensity = (0.18 + 0.24 * currentDayToDawnProgress) * lampScale;

    // Synchronize renderer exposure & environment reflection intensity smoothly with time-of-day
    if (renderer) {
      renderer.toneMappingExposure = stageExposure;
    }
    scene.environmentIntensity = stageEnvInt;

    const pArr = motesGeo.attributes.position.array;
    for (let i = 0; i < motesCount; i++) {
      pArr[i * 3 + 1] += Math.sin(elapsedTime * 0.8 + i) * 0.00012;
    }
    motesGeo.attributes.position.needsUpdate = true;
  }

  setDayToDawnProgress(0.0);

  return {
    atmosphereGroup,
    sunLight,
    lampKeyLight,
    godRayCurtainGroup,
    updateAtmosphere,
    setDayToDawnProgress,
    requestShadowMapUpdate,
  };
}
