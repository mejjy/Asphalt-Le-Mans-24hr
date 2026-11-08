import * as THREE from 'three';

/**
 * Builds the Expansive Outdoor Sky Dome, Billowy Clouds,
 * and Distant French Countryside Horizon for ASPHALT: LE MANS 24H.
 *
 * Synchronized 5-stage Daylight-to-Dawn transition over the 2-minute run:
 *   - 02:00 -> 01:30 (progress 0.00..0.25): Bright Daylight (Crisp blue sky, bright white clouds, clear horizon)
 *   - 01:30 -> 01:00 (progress 0.25..0.50): Late Afternoon (Warmer sunlight, softer azure sky)
 *   - 01:00 -> 00:30 (progress 0.50..0.75): Golden Hour Transition (Amber-gold horizon, deeper blue-slate zenith)
 *   - 00:30 -> 00:00 (progress 0.75..1.00): Dusk -> Darker Early-Morning Dawn (Deep twilight navy zenith,
 *                                           subtle rose-amber dawn glow low on the horizon)
 */
export function buildRoomEnvironment(scene, settings) {
  const roomRoot = new THREE.Group();
  roomRoot.name = 'OutdoorLeMansAtmosphere';

  const proceduralRoomGroup = new THREE.Group();
  proceduralRoomGroup.name = 'OutdoorSkyAndHorizonGroup';
  roomRoot.add(proceduralRoomGroup);

  const roomContactAoGroup = new THREE.Group();
  roomContactAoGroup.name = 'OutdoorContactGroup';
  roomRoot.add(roomContactAoGroup);

  // -------------------------------------------------------------------------
  // 1. 360° DAYLIGHT-TO-DAWN SKY DOME
  // -------------------------------------------------------------------------
  const skyRadius = 26.0;
  const skyGeo = new THREE.SphereGeometry(skyRadius, 36, 24);

  const skyMat = new THREE.ShaderMaterial({
    uniforms: {
      uSunIntensity: { value: settings.sunIntensity ?? 0.65 },
      uDawnProgress: { value: 0.0 },
      uZenithColor: { value: new THREE.Color(0x1d68b8) },   // Bright clear French daylight sky blue
      uMidColor: { value: new THREE.Color(0x54a2e8) },      // Crisp mid-sky azure
      uHorizonColor: { value: new THREE.Color(0xd4edff) },  // Bright daylight horizon
      uSunGlowColor: { value: new THREE.Color(0xfff6dc) },  // Natural solar corona
      uSunPos: { value: new THREE.Vector3(-0.45, 0.66, -0.55).normalize() },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform float uSunIntensity;
      uniform float uDawnProgress;
      uniform vec3 uZenithColor;
      uniform vec3 uMidColor;
      uniform vec3 uHorizonColor;
      uniform vec3 uSunGlowColor;
      uniform vec3 uSunPos;
      varying vec3 vWorldPosition;

      void main() {
        vec3 dir = normalize(vWorldPosition);
        float h = clamp(dir.y, 0.0, 1.0);

        // Smooth 3-stop vertical sky gradient
        vec3 sky = mix(uHorizonColor, uMidColor, smoothstep(0.0, 0.26, h));
        sky = mix(sky, uZenithColor, smoothstep(0.26, 0.84, h));

        // Directional sun/dawn horizon glow
        float sunDot = max(0.0, dot(dir, uSunPos));
        float sunDisk = pow(sunDot, 26.0) * (0.68 - 0.28 * uDawnProgress);
        float sunHalo = pow(sunDot, 4.2) * (0.28 - 0.08 * uDawnProgress);
        sky += uSunGlowColor * (sunDisk + sunHalo) * (0.55 + 0.35 * uSunIntensity);

        gl_FragColor = vec4(sky, 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
  });

  const skyMesh = new THREE.Mesh(skyGeo, skyMat);
  proceduralRoomGroup.add(skyMesh);

  // -------------------------------------------------------------------------
  // 2. LAYERED PROCEDURAL CLOUDS (Bright White in Daylight -> Soft Dusk-Rose at Dawn)
  // -------------------------------------------------------------------------
  const cloudGroup = new THREE.Group();
  const numCloudClusters = 14;

  const cloudPuffGeo = new THREE.SphereGeometry(0.65, 8, 6);
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xf8fbff,
    emissive: 0xe6f2fc,
    emissiveIntensity: 0.28,
    roughness: 0.90,
    metalness: 0.0,
    transparent: true,
    opacity: 0.86,
    depthWrite: false,
  });

  for (let c = 0; c < numCloudClusters; c++) {
    const cluster = new THREE.Group();
    const angle = (c / numCloudClusters) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const dist = 12.0 + Math.random() * 8.0;
    const alt = 2.8 + Math.random() * 3.5;

    cluster.position.set(Math.cos(angle) * dist, alt, Math.sin(angle) * dist);

    const puffs = 4 + Math.floor(Math.random() * 3);
    for (let p = 0; p < puffs; p++) {
      const puff = new THREE.Mesh(cloudPuffGeo, cloudMat);
      puff.position.set(
        (Math.random() - 0.5) * 1.8,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 1.8
      );
      const s = 0.8 + Math.random() * 0.8;
      puff.scale.set(s * 1.8, s * 0.65, s * 1.4);
      cluster.add(puff);
    }
    cloudGroup.add(cluster);
  }
  proceduralRoomGroup.add(cloudGroup);

  // -------------------------------------------------------------------------
  // 3. DISTANT FRENCH COUNTRYSIDE HORIZON (Grounded to Meet Outer Terrain)
  // -------------------------------------------------------------------------
  const horizonRingGeo = new THREE.CylinderGeometry(18.0, 18.0, 3.6, 48, 1, true);
  const horizonCanvas = document.createElement('canvas');
  horizonCanvas.width = 2048;
  horizonCanvas.height = 512;
  const hCtx = horizonCanvas.getContext('2d');

  hCtx.clearRect(0, 0, 2048, 512);

  hCtx.fillStyle = 'rgba(215, 228, 220, 0.65)';
  hCtx.beginPath();
  hCtx.moveTo(0, 512);
  for (let x = 0; x <= 2048; x += 16) {
    const y = 318 + Math.sin(x * 0.008) * 38 + Math.cos(x * 0.02) * 22 + Math.sin(x * 0.045) * 10;
    hCtx.lineTo(x, y);
  }
  hCtx.lineTo(2048, 512);
  hCtx.closePath();
  hCtx.fill();

  hCtx.fillStyle = 'rgba(170, 195, 174, 0.90)';
  hCtx.beginPath();
  hCtx.moveTo(0, 512);
  for (let x = 0; x <= 2048; x += 8) {
    let y = 368 + Math.sin(x * 0.012 + 1.2) * 32 + Math.cos(x * 0.035) * 16;
    if (Math.abs(x - 1450) < 18) {
      y -= (18 - Math.abs(x - 1450)) * 6.5;
    }
    if (Math.abs(x - 520) < 14) {
      y -= (14 - Math.abs(x - 520)) * 4.8;
    }
    hCtx.lineTo(x, y);
  }
  hCtx.lineTo(2048, 512);
  hCtx.closePath();
  hCtx.fill();

  const horizonTex = new THREE.CanvasTexture(horizonCanvas);
  horizonTex.colorSpace = THREE.SRGBColorSpace;
  horizonTex.wrapS = THREE.RepeatWrapping;

  const horizonMat = new THREE.MeshBasicMaterial({
    map: horizonTex,
    color: 0x587d72,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const horizonMesh = new THREE.Mesh(horizonRingGeo, horizonMat);
  horizonMesh.position.y = 1.05;
  proceduralRoomGroup.add(horizonMesh);

  // -------------------------------------------------------------------------
  // 4. OUTDOOR AMBIENT & BOUNCE LIGHTING
  // -------------------------------------------------------------------------
  const edisonPointLight = new THREE.PointLight(0xffe6ba, 0.36, 6.0, 1.2);
  edisonPointLight.position.set(-0.35, 1.2, -0.45);
  roomRoot.add(edisonPointLight);

  const roomBounceLight = new THREE.HemisphereLight(0x90ccf8, 0x566c42, 0.62);
  roomRoot.add(roomBounceLight);

  // 5-Stage Daylight-to-Dawn Palette Keyframes (progress 0.0 -> 0.25 -> 0.50 -> 0.75 -> 1.0)
  const skyStages = [
    {
      // Stage 0 (02:00): Bright Daylight — Crisp blue sky, bright white clouds, vibrant green bounce
      zenith: new THREE.Color(0x1d68b8),
      mid: new THREE.Color(0x54a2e8),
      horizon: new THREE.Color(0xd4edff),
      sunGlow: new THREE.Color(0xfff6dc),
      cloudColor: new THREE.Color(0xf8fbff),
      cloudEmissive: new THREE.Color(0xe6f2fc),
      horizonTint: new THREE.Color(0x5c8276),
      bounceSky: new THREE.Color(0x90ccf8),
      bounceGround: new THREE.Color(0x566c42),
      bounceMult: 1.00,
      sunElevation: 0.66,
    },
    {
      // Stage 1 (01:30): Late Afternoon — Soft warm sunlight, gentle sky transition
      zenith: new THREE.Color(0x24589c),
      mid: new THREE.Color(0x6296ce),
      horizon: new THREE.Color(0xdce4f0),
      sunGlow: new THREE.Color(0xffebb5),
      cloudColor: new THREE.Color(0xf6f2ec),
      cloudEmissive: new THREE.Color(0xdccbb2),
      horizonTint: new THREE.Color(0x566c68),
      bounceSky: new THREE.Color(0x8cb8e4),
      bounceGround: new THREE.Color(0x4c5c3a),
      bounceMult: 0.85,
      sunElevation: 0.48,
    },
    {
      // Stage 2 (01:00): Golden Hour Transition — Golden horizon, deeper slate-blue zenith
      zenith: new THREE.Color(0x243b6e),
      mid: new THREE.Color(0x686894),
      horizon: new THREE.Color(0xe4a878),
      sunGlow: new THREE.Color(0xffc470),
      cloudColor: new THREE.Color(0xdcc4b8),
      cloudEmissive: new THREE.Color(0xba8258),
      horizonTint: new THREE.Color(0x4c4854),
      bounceSky: new THREE.Color(0x747aa4),
      bounceGround: new THREE.Color(0x3c3e2c),
      bounceMult: 0.66,
      sunElevation: 0.30,
    },
    {
      // Stage 3 (00:30): Twilight / Dusk — Deeper indigo zenith, muted peach-amber horizon
      zenith: new THREE.Color(0x162244),
      mid: new THREE.Color(0x3e466c),
      horizon: new THREE.Color(0xc4725c),
      sunGlow: new THREE.Color(0xefa060),
      cloudColor: new THREE.Color(0x987882),
      cloudEmissive: new THREE.Color(0x7c4a3e),
      horizonTint: new THREE.Color(0x342c3c),
      bounceSky: new THREE.Color(0x4c587c),
      bounceGround: new THREE.Color(0x262822),
      bounceMult: 0.50,
      sunElevation: 0.18,
    },
    {
      // Stage 4 (00:00): Darker Cinematic Early-Morning Dawn — Deep early-morning sky with subtle dawn horizon
      zenith: new THREE.Color(0x0d152b),
      mid: new THREE.Color(0x26304e),
      horizon: new THREE.Color(0xb66858),
      sunGlow: new THREE.Color(0xe29068),
      cloudColor: new THREE.Color(0x786272),
      cloudEmissive: new THREE.Color(0x5c3838),
      horizonTint: new THREE.Color(0x242030),
      bounceSky: new THREE.Color(0x3c4868),
      bounceGround: new THREE.Color(0x1c1f1c),
      bounceMult: 0.40,
      sunElevation: 0.11,
    },
  ];

  let currentProgress = 0.0;

  function setDayToDawnProgress(progress = 0.0) {
    const p = THREE.MathUtils.clamp(progress, 0.0, 1.0);
    currentProgress = p;
    const scaled = p * (skyStages.length - 1);
    const idx0 = Math.min(skyStages.length - 2, Math.floor(scaled));
    const idx1 = idx0 + 1;
    const t = scaled - idx0;

    const s0 = skyStages[idx0];
    const s1 = skyStages[idx1];

    skyMat.uniforms.uDawnProgress.value = p;
    skyMat.uniforms.uZenithColor.value.copy(s0.zenith).lerp(s1.zenith, t);
    skyMat.uniforms.uMidColor.value.copy(s0.mid).lerp(s1.mid, t);
    skyMat.uniforms.uHorizonColor.value.copy(s0.horizon).lerp(s1.horizon, t);
    skyMat.uniforms.uSunGlowColor.value.copy(s0.sunGlow).lerp(s1.sunGlow, t);

    const sunElev = THREE.MathUtils.lerp(s0.sunElevation, s1.sunElevation, t);
    skyMat.uniforms.uSunPos.value.set(-0.48, sunElev, -0.58).normalize();

    cloudMat.color.copy(s0.cloudColor).lerp(s1.cloudColor, t);
    cloudMat.emissive.copy(s0.cloudEmissive).lerp(s1.cloudEmissive, t);
    cloudMat.emissiveIntensity = THREE.MathUtils.lerp(0.28, 0.12, p);

    horizonMat.color.copy(s0.horizonTint).lerp(s1.horizonTint, t);

    roomBounceLight.color.copy(s0.bounceSky).lerp(s1.bounceSky, t);
    roomBounceLight.groundColor.copy(s0.bounceGround).lerp(s1.bounceGround, t);
    const bounceMult = THREE.MathUtils.lerp(s0.bounceMult, s1.bounceMult, t);
    roomBounceLight.intensity = 0.60 * bounceMult;
    edisonPointLight.intensity = 0.36 * bounceMult;
  }

  function updateRoomLighting(sunScale = 0.65, lampScale = 1.0) {
    if (skyMat.uniforms.uSunIntensity) {
      skyMat.uniforms.uSunIntensity.value = sunScale;
    }
    const bounceMult = THREE.MathUtils.lerp(1.0, 0.40, currentProgress);
    edisonPointLight.intensity = 0.36 * lampScale * bounceMult;
    roomBounceLight.intensity = (0.42 + 0.24 * sunScale) * bounceMult;
  }

  setDayToDawnProgress(0.0);
  updateRoomLighting(settings.sunIntensity ?? 0.65, settings.lampIntensity ?? 1.0);

  return {
    roomRoot,
    proceduralRoomGroup,
    roomContactAoGroup,
    edisonPointLight,
    roomBounceLight,
    calibrateRoomEnvironmentGlb: () => {},
    updateRoomLighting,
    setDayToDawnProgress,
  };
}
