import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

/**
 * Initializes the @dimforge/rapier3d-compat 3D Physics World with colliders for the
 * oak desk, 8 monuments, and 720-sample coaster trimesh, paired with a 60FPS
 * Spline-Assisted Banked Coaster Surface & Raycast Vehicle Controller.
 */
export async function createKartPhysicsController(splineData, manifest, roadGeo) {
  await RAPIER.init();

  // Precompute spline table references first so initial kart position and sector boundaries are available
  const samples = splineData && Array.isArray(splineData.samples) ? splineData.samples : [];
  const N = samples.length;
  const totalLength = (splineData && splineData.total_length_m) || 3.8371;

  const gravity = { x: 0.0, y: -9.81, z: 0.0 };
  const world = new RAPIER.World(gravity);

  // 1. Static Ground Landscape Collider
  const groundBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0.0, -0.01, 0.0);
  const groundBody = world.createRigidBody(groundBodyDesc);
  world.createCollider(RAPIER.ColliderDesc.cuboid(8.0, 0.01, 8.0), groundBody);

  // 2. Coaster Roadbed Trimesh Collider inside Rapier World (zero legacy desk prop colliders on track)
  if (roadGeo && roadGeo.attributes.position && roadGeo.index) {
    const verts = new Float32Array(roadGeo.attributes.position.array);
    const indices = new Uint32Array(roadGeo.index.array);
    const trackBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
    world.createCollider(RAPIER.ColliderDesc.trimesh(verts, indices), trackBody);
  }

  // 4. Kinematic Position-Based RigidBody for the Racing Kart
  const kartStartPos = samples[37] ? samples[37].position : (samples[0] ? samples[0].position : [0.0, 0.024, 0.25]);
  const kartBodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
    kartStartPos[0],
    kartStartPos[1] + 0.006,
    kartStartPos[2]
  );
  const kartBody = world.createRigidBody(kartBodyDesc);
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(0.0075, 0.004, 0.016).setRestitution(0.4),
    kartBody
  );

  // -------------------------------------------------------------------------
  // PRECOMPUTE PERIODIC SPLINE TABLE & SECTOR START ARC-LENGTHS
  // -------------------------------------------------------------------------

  // C2 Position & Orientation Frame Smoothing:
  // track_spline.json has 18-sample Catmull-Rom knot boundaries in Sector 2 (Cat Helix) and Sector 4 (Lamp Corkscrew)
  // where adjacent tangents jump by up to 8.3°–10.1° across a single 3.1mm segment.
  // A 2-pass [0.2, 0.6, 0.2] position filter + 4-pass circular [1, 2, 3, 2, 1]/9 frame filter removes knot kinks
  // so position and tangent are 100% C2-consistent.
  const smoothPositions = samples.map((s) => new THREE.Vector3().fromArray(s.position));
  for (let pass = 0; pass < 2; pass++) {
    const nextP = smoothPositions.map((v) => v.clone());
    for (let i = 0; i < N; i++) {
      const pPrev = smoothPositions[(i - 1 + N) % N];
      const pCurr = smoothPositions[i];
      const pNext = smoothPositions[(i + 1) % N];
      nextP[i]
        .copy(pCurr)
        .multiplyScalar(0.6)
        .addScaledVector(pPrev, 0.2)
        .addScaledVector(pNext, 0.2);
    }
    for (let i = 0; i < N; i++) {
      smoothPositions[i].copy(nextP[i]);
    }
  }

  const smoothTangents = samples.map((s) => new THREE.Vector3().fromArray(s.tangent).normalize());
  const smoothNormals = samples.map((s) => new THREE.Vector3().fromArray(s.normal).normalize());
  const smoothRights = samples.map((s) => new THREE.Vector3().fromArray(s.right).normalize());
  const smoothBanks = samples.map((s) => s.bank_deg || 0);

  for (let pass = 0; pass < 4; pass++) {
    const nextT = smoothTangents.map((v) => v.clone());
    const nextN = smoothNormals.map((v) => v.clone());
    const nextB = smoothBanks.slice();
    const weights = [1, 2, 3, 2, 1];
    for (let i = 0; i < N; i++) {
      nextT[i].set(0, 0, 0);
      nextN[i].set(0, 0, 0);
      let bSum = 0;
      for (let k = -2; k <= 2; k++) {
        const idx = (i + k + N) % N;
        const w = weights[k + 2];
        nextT[i].addScaledVector(smoothTangents[idx], w);
        nextN[i].addScaledVector(smoothNormals[idx], w);
        bSum += smoothBanks[idx] * w;
      }
      nextT[i].normalize();
      nextN[i].normalize();
      nextB[i] = bSum / 9.0;
    }
    for (let i = 0; i < N; i++) {
      smoothTangents[i].copy(nextT[i]);
      // Re-orthonormalize right = tangent x normal, normal = right x tangent
      smoothRights[i].crossVectors(smoothTangents[i], nextN[i]).normalize();
      smoothNormals[i].crossVectors(smoothRights[i], smoothTangents[i]).normalize();
      smoothBanks[i] = nextB[i];
    }
  }

  // Precompute continuous per-sample signed horizontal curvature (smoothed across knots so Autopilot never chatters at 45Hz)
  const rawCurvatures = new Float32Array(N);
  const smoothCurvatures = new Float32Array(N);
  const _tmpDiff = new THREE.Vector3();
  for (let i = 0; i < N; i++) {
    const iPrev = (i - 3 + N) % N;
    const iNext = (i + 3) % N;
    _tmpDiff.subVectors(smoothTangents[iNext], smoothTangents[iPrev]);
    rawCurvatures[i] = _tmpDiff.dot(smoothRights[i]) * 8.0;
  }
  for (let i = 0; i < N; i++) {
    let cSum = 0;
    const weights = [1, 2, 3, 2, 1];
    for (let k = -2; k <= 2; k++) {
      cSum += rawCurvatures[(i + k + N) % N] * weights[k + 2];
    }
    smoothCurvatures[i] = cSum / 9.0;
  }

  // Anchor the main Start/Finish Line to sample 37 (X = 0.0016m, Z = 0.250m,
  // right at the Start/Finish gantry and checkered road stripes)
  let startFinishIdx = 37;
  const sectorStartArcs = {};

  for (let i = 0; i < N; i++) {
    const s = samples[i];
    if (sectorStartArcs[s.sector] === undefined) {
      sectorStartArcs[s.sector] = s.arc_length_m;
    }
  }

  const startFinishArc = samples[startFinishIdx].arc_length_m;
  // Position kart on starting grid right behind checkered line facing negative X down the straight
  sectorStartArcs[6] = (startFinishArc - 0.025 + totalLength) % totalLength;

  // Pre-allocated scratch vectors/matrices to avoid GC allocations on every physics step
  const _p1 = new THREE.Vector3();
  const _left = new THREE.Vector3();
  const _tangentDelta = new THREE.Vector3();
  const _rotMat = new THREE.Matrix4();
  const _baseQuat = new THREE.Quaternion();
  const _yawQuat = new THREE.Quaternion();
  const _sampleOut = {
    index: 0,
    sector: 6,
    position: new THREE.Vector3(),
    tangent: new THREE.Vector3(),
    right: new THREE.Vector3(),
    normal: new THREE.Vector3(),
    bankDeg: 0,
    signedCurvature: 0,
    slope: 0,
  };
  const _nextSampleOut = {
    index: 0,
    sector: 6,
    position: new THREE.Vector3(),
    tangent: new THREE.Vector3(),
    right: new THREE.Vector3(),
    normal: new THREE.Vector3(),
    bankDeg: 0,
    signedCurvature: 0,
    slope: 0,
  };

  function sampleTrackAtArcLength(sVal, out = _sampleOut) {
    const wrappedS = ((sVal % totalLength) + totalLength) % totalLength;

    // Binary search in samples[].arc_length_m
    let lo = 0;
    let hi = N - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (samples[mid].arc_length_m <= wrappedS) {
        lo = mid;
      } else {
        hi = mid - 1;
      }
    }

    const i0 = lo;
    const i1 = (lo + 1) % N;
    const s0 = samples[i0];
    const s1 = samples[i1];

    const arc0 = s0.arc_length_m;
    const arc1 = i1 === 0 ? totalLength : s1.arc_length_m;
    const segLen = Math.max(1e-6, arc1 - arc0);
    const alpha = THREE.MathUtils.clamp((wrappedS - arc0) / segLen, 0, 1);

    out.position.copy(smoothPositions[i0]).lerp(smoothPositions[i1], alpha);
    out.tangent.copy(smoothTangents[i0]).lerp(smoothTangents[i1], alpha).normalize();
    out.right.copy(smoothRights[i0]).lerp(smoothRights[i1], alpha).normalize();
    out.normal.copy(smoothNormals[i0]).lerp(smoothNormals[i1], alpha).normalize();

    const signedCurvature = THREE.MathUtils.lerp(
      smoothCurvatures[i0],
      smoothCurvatures[i1],
      alpha
    );
    const bankDeg = THREE.MathUtils.lerp(smoothBanks[i0], smoothBanks[i1], alpha);

    out.index = i0;
    out.sector = s0.sector;
    out.bankDeg = bankDeg;
    out.signedCurvature = signedCurvature;
    out.slope = out.tangent.y;
    return out;
  }

  // -------------------------------------------------------------------------
  // VEHICLE STATE & INPUT LISTENERS
  // -------------------------------------------------------------------------
  const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
  };
  const kbKeys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
  };
  const touchKeys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
  };

  const state = {
    s: sectorStartArcs[6], // Start on Sector 6 G915 Viaduct approaching Start/Finish gantry
    lateralOffset: 0.0, // -0.0078m to +0.0078m across the 22mm roadbed
    lateralVel: 0.0,
    speed: 0.0, // Stationary (0.0 m/s) in Manual Mode at startup until player presses W/Up or P
    headingYaw: 0.0, // World-differential heading yaw relative to track tangent (clamped to [-1.05, +1.05] = ±60°)
    turnRight: 0.0, // +1 for D/Right, -1 for A/Left
    steerSmooth: 0.0, // Progressive smoothed manual steering input
    steerAngle: 0.0, // Front wheel steering angle in radians (+0.45 Left A, -0.45 Right D)
    topSpeedMultiplier: 1.0,
    steerInput: 0.0,
    isDrifting: false,
    driftDir: 0, // -1 left, +1 right
    driftAngle: 0.0,
    driftChargeTimer: 0.0,
    cornerCleanTimer: 0.0,
    boostCharge: 1.0, // 0.0 to 1.0 (3 tiers)
    boostActive: 0.0, // remaining turbo boost timer
    hopHeight: 0.0,
    hopVel: 0.0,
    curbRumble: 0.0,
    railImpactActive: false,
    railHitCooldown: 0.0,
    downforceG: 1.0,
    longitudinalG: 0.0,
    chassisPitch: 0.0, // Positive = nose dive under braking, Negative = rear squat under acceleration
    chassisRoll: 0.0,  // Lateral body roll under cornering load
    autopilot: false, // Starts 100% in Manual Mode at 0.0 m/s!
    victoryCruise: false, // Celebratory AI cruise after completing 3 laps
    raceClockActive: false, // Starts ticking when F1 5-light countdown turns OFF (or when driving begins)
    countdownLocked: false, // Holds kart at starting grid while 5 F1 red lights count down
    wasCountdownLocked: false,
    launchWindowTimer: 0.0,
    paused: false,
    challengeDuration: 120.0, // Exactly 120 seconds (02:00)
    remainingTime: 120.0,     // Counts down continuously from 120.0 -> 0.0
    distanceMeters: 0.0,      // Real-scale metres accumulated from 3D world-space movement
    distanceKm: 0.0,          // distanceMeters / 1000.0
    maxSpeedKmh: 0.0,
    avgSpeedKmh: 0.0,
    lapCount: 1,
    currentLapTime: 0.0,
    totalRaceTime: 0.0,
    lapTimes: [],
    raceFinished: false,
    finishTotalTime: null,
    bestLapTime: null,
    lastLapTime: null,
    sector: 6,
    bankDeg: 0.0,
    altitudeMm: 35.0,
    activeKeysStr: 'NONE',
    lastRoadTurnDeg: 0.0,
    lastSteerTurnDeg: 0.0,
    signedCurvature: 0.0,
    distToLeftRailMm: 9.0,
    distToRightRailMm: 9.0,
    railZone: 'TRACK',
    angledIntoRail: false,
    steeringAway: false,
    position: new THREE.Vector3(0, 0.035, 0.255),
    tangent: new THREE.Vector3(-1, 0, 0),
    right: new THREE.Vector3(0, 0, -1),
    normal: new THREE.Vector3(0, 1, 0),
    quaternion: new THREE.Quaternion(),
  };

  const _prevWorldPos = new THREE.Vector3();
  const _worldDelta = new THREE.Vector3();
  const _carForward = new THREE.Vector3();
  let _hasPrevWorldPos = false;

  let onLapCompleteCallback = null;
  let onModeChangeCallback = null;
  let onRaceFinishCallback = null;
  let onRailImpactCallback = null;

  function computeActiveKeysStr() {
    return (
      [keys.forward && 'W', keys.left && 'A', keys.backward && 'S', keys.right && 'D']
        .filter(Boolean)
        .join('+') || 'NONE'
    );
  }

  function computeRailZone(latOffset) {
    if (latOffset <= -0.0375) return 'L-RAIL';
    if (latOffset >= 0.0375) return 'R-RAIL';
    if (latOffset <= -0.0345) return 'L-CURB';
    if (latOffset >= 0.0345) return 'R-CURB';
    return 'TRACK';
  }

  /**
   * Updates 3D world position and right-handed basis quaternion (det = +1)
   * from the current spline arc-length `state.s`, `state.lateralOffset`, and `state.headingYaw`.
   */
  function syncPoseFromSpline() {
    const newFrame = sampleTrackAtArcLength(state.s);
    state.sector = newFrame.sector;
    state.bankDeg = newFrame.bankDeg;
    state.slope = newFrame.slope;
    state.curvature = Math.abs(newFrame.signedCurvature);
    state.signedCurvature = newFrame.signedCurvature;
    state.distToLeftRailMm = (state.lateralOffset - -0.0380) * 1000;
    state.distToRightRailMm = (0.0380 - state.lateralOffset) * 1000;
    state.railZone = computeRailZone(state.lateralOffset);
    state.activeKeysStr = computeActiveKeysStr();
    state.tangent.copy(newFrame.tangent);
    state.right.copy(newFrame.right);
    state.normal.copy(newFrame.normal);

    // Compute magnetic/aerodynamic downforce G-load (1.0G + speed^2 banking G)
    state.downforceG =
      1.0 +
      (state.speed * state.speed) / 0.26 +
      Math.abs(Math.sin(THREE.MathUtils.degToRad(newFrame.bankDeg))) * 0.65;

    // World 3D position = spline center + right * lateralOffset + normal * surfaceClearance
    const rumbleLift =
      state.curbRumble > 0
        ? Math.abs(Math.sin(state.s * 620.0)) * 0.00028 * state.curbRumble
        : 0.0;

    state.position
      .copy(newFrame.position)
      .addScaledVector(newFrame.right, state.lateralOffset)
      .addScaledVector(newFrame.normal, 0.0003 + rumbleLift);

    state.altitudeMm = Math.max(0, state.position.y * 1000.0);

    // Right-handed orthonormal basis: +X = left = normal x tangent, +Y = normal, +Z = tangent (det = +1)
    _left.crossVectors(newFrame.normal, newFrame.tangent).normalize();
    _rotMat.makeBasis(_left, newFrame.normal, newFrame.tangent);
    _baseQuat.setFromRotationMatrix(_rotMat);
    _yawQuat.setFromAxisAngle(newFrame.normal, state.headingYaw);
    state.quaternion.copy(_yawQuat.multiply(_baseQuat));
  }

  // Initialize exact right-handed pose at the Start/Finish gantry before frame 1
  syncPoseFromSpline();
  _prevWorldPos.copy(state.position);
  _hasPrevWorldPos = true;

  function setPaused(val) {
    state.paused = Boolean(val);
  }

  function setAutopilot(val) {
    const nextVal = Boolean(val);
    const changed = state.autopilot !== nextVal;
    state.autopilot = nextVal;
    if (nextVal) {
      state.victoryCruise = false;
      state.raceFinished = false;
      state.raceClockActive = false;
      state.paused = false;
      state.remainingTime = state.challengeDuration;
      state.distanceMeters = 0.0;
      state.distanceKm = 0.0;
      state.maxSpeedKmh = 0.0;
      state.avgSpeedKmh = 0.0;
      state.totalRaceTime = 0.0;
      state.currentLapTime = 0.0;
      state.lapCount = 1;
      state.lapTimes = [];
      state.finishTotalTime = null;
      state.cornerCleanTimer = 0.0;
      state.railImpactActive = false;
      state.railHitCooldown = 0.0;
      if (state.speed < 0.10) {
        state.speed = 0.187;
      }
    }
    if (changed && onModeChangeCallback) {
      onModeChangeCallback(nextVal);
    }
  }

  function teleportToSector(sectorNum) {
    const targetArc = sectorStartArcs[sectorNum] ?? sectorStartArcs[6] ?? 0.0;
    state.s = targetArc;
    state.lateralOffset = 0.0;
    state.lateralVel = 0.0;
    state.headingYaw = 0.0;
    state.turnRight = 0.0;
    state.steerSmooth = 0.0;
    state.steerAngle = 0.0;
    state.steerInput = 0.0;
    state.driftAngle = 0.0;
    state.isDrifting = false;
    state.driftDir = 0;
    state.driftChargeTimer = 0.0;
    state.cornerCleanTimer = 0.0;
    state.railImpactActive = false;
    state.railHitCooldown = 0.0;
    state.angledIntoRail = false;
    state.steeringAway = false;
    state.lastRoadTurnDeg = 0.0;
    state.lastSteerTurnDeg = 0.0;
    state.boostActive = 0.0;
    state.speed = state.autopilot || state.victoryCruise ? 0.187 : 0.0;
    syncPoseFromSpline();
    _prevWorldPos.copy(state.position);
    _hasPrevWorldPos = true;
  }

  function resetToStart() {
    state.victoryCruise = false;
    state.raceFinished = false;
    state.paused = false;
    state.remainingTime = state.challengeDuration;
    state.distanceMeters = 0.0;
    state.distanceKm = 0.0;
    state.maxSpeedKmh = 0.0;
    state.avgSpeedKmh = 0.0;
    state.totalRaceTime = 0.0;
    state.currentLapTime = 0.0;
    state.lapCount = 1;
    state.lapTimes = [];
    state.finishTotalTime = null;
    state.raceClockActive = false;
    state.countdownLocked = false;
    state.wasCountdownLocked = false;
    state.launchWindowTimer = 0.0;
    state.cornerCleanTimer = 0.0;
    state.railImpactActive = false;
    state.railHitCooldown = 0.0;
    state.angledIntoRail = false;
    state.steeringAway = false;
    teleportToSector(6);
  }

  function notifyLightsOut() {
    state.countdownLocked = false;
    state.wasCountdownLocked = false;
    state.paused = false;
    state.raceClockActive = true;
    state.launchWindowTimer = 0.30;
    _prevWorldPos.copy(state.position);
    _hasPrevWorldPos = true;
    if (!state.autopilot && !state.victoryCruise && keys.forward) {
      state.boostActive = Math.max(state.boostActive, 0.75);
      state.launchWindowTimer = 0.0;
    }
  }

  function syncCombinedKeys() {
    keys.forward = Boolean(kbKeys.forward || touchKeys.forward);
    keys.backward = Boolean(kbKeys.backward || touchKeys.backward);
    keys.left = Boolean(kbKeys.left || touchKeys.left);
    keys.right = Boolean(kbKeys.right || touchKeys.right);
    state.activeKeysStr = computeActiveKeysStr();
  }

  function setTouchKey(dir, isDown) {
    if (!(dir in touchKeys)) return;
    const nextDown = Boolean(isDown);
    touchKeys[dir] = nextDown;
    if (nextDown && state.autopilot) {
      setAutopilot(false);
    }
    syncCombinedKeys();
  }

  function clearTouchKeys() {
    touchKeys.forward = false;
    touchKeys.backward = false;
    touchKeys.left = false;
    touchKeys.right = false;
    syncCombinedKeys();
  }

  // Pure Grip Racing (W/A/S/D or Arrow Keys only, plus P for Autopilot and R for Reset)
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('keydown', (e) => {
      if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName) && !e.target.readOnly) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (state.menuOpen || state.paused) return;
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') {
        kbKeys.forward = true;
        if (state.autopilot) setAutopilot(false);
      } else if (code === 'KeyS' || code === 'ArrowDown') {
        kbKeys.backward = true;
        if (state.autopilot) setAutopilot(false);
      } else if (code === 'KeyA' || code === 'ArrowLeft') {
        kbKeys.left = true;
        if (state.autopilot) setAutopilot(false);
      } else if (code === 'KeyD' || code === 'ArrowRight') {
        kbKeys.right = true;
        if (state.autopilot) setAutopilot(false);
      } else if (code === 'KeyP') {
        setAutopilot(!state.autopilot);
      } else if (code === 'KeyR') {
        resetToStart();
      }
      syncCombinedKeys();
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') kbKeys.forward = false;
      else if (code === 'KeyS' || code === 'ArrowDown') kbKeys.backward = false;
      else if (code === 'KeyA' || code === 'ArrowLeft') kbKeys.left = false;
      else if (code === 'KeyD' || code === 'ArrowRight') kbKeys.right = false;
      syncCombinedKeys();
    });

    window.addEventListener('blur', () => {
      kbKeys.forward = false;
      kbKeys.backward = false;
      kbKeys.left = false;
      kbKeys.right = false;
      clearTouchKeys();
    });
  }

  // -------------------------------------------------------------------------
  // 60FPS PHYSICS STEP
  // -------------------------------------------------------------------------
  function stepPhysics(dt) {
    // Pause freezes physics movement, countdown timer, and distance accumulation cleanly
    if (state.paused) {
      return state;
    }

    const clampedDt = Math.min(dt, 0.05);
    const frame = sampleTrackAtArcLength(state.s);
    state.activeKeysStr = computeActiveKeysStr();
    state.signedCurvature = frame.signedCurvature;

    // Calibrated speeds in real meters/second (1:150 N-scale)
    const manualMaxSpeed = 0.195 * state.topSpeedMultiplier;
    const boostMaxSpeed = 0.289 * state.topSpeedMultiplier;
    const autopilotCruiseSpeed = 0.204 * state.topSpeedMultiplier;
    const manualAccel = 0.204;

    if (state.railHitCooldown > 0) {
      state.railHitCooldown = Math.max(0.0, state.railHitCooldown - clampedDt);
    }

    // Track F1 5-light countdown lights-out transition for F1 Grid Launch Surge (0.30s window)
    if (state.countdownLocked) {
      state.wasCountdownLocked = true;
      state.launchWindowTimer = 0.0;
    } else if (state.wasCountdownLocked) {
      state.wasCountdownLocked = false;
      state.launchWindowTimer = 0.30;
    }

    if (state.launchWindowTimer > 0) {
      if (!state.autopilot && !state.victoryCruise && keys.forward) {
        state.boostActive = Math.max(state.boostActive, 0.75);
        state.launchWindowTimer = 0.0;
      } else {
        state.launchWindowTimer = Math.max(0.0, state.launchWindowTimer - clampedDt);
      }
    }

    const isAiCruise = state.autopilot;
    let throttle = 0.0;
    let turnRight = 0.0;

    if (isAiCruise) {
      throttle = 1.0;
      const idealApexOffset = THREE.MathUtils.clamp(
        -frame.signedCurvature * 0.0005,
        -0.0014,
        0.0014
      );
      const latError = idealApexOffset - state.lateralOffset;
      turnRight = THREE.MathUtils.clamp(latError * 36.0, -0.35, 0.35);
      state.steerSmooth = turnRight;

      const targetAutoYaw = THREE.MathUtils.clamp(-turnRight * 0.14, -0.14, 0.14);
      const yawAlpha = 1.0 - Math.exp(-10.5 * clampedDt);
      state.headingYaw = THREE.MathUtils.lerp(state.headingYaw, targetAutoYaw, yawAlpha);

      const driftAlpha = 1.0 - Math.exp(-8.0 * clampedDt);
      if (Math.abs(frame.signedCurvature) > 0.52 && state.speed > 0.10) {
        state.isDrifting = true;
        state.driftDir = Math.sign(frame.signedCurvature) || 1;
        state.driftAngle = THREE.MathUtils.lerp(
          state.driftAngle,
          -state.driftDir * 0.20,
          driftAlpha
        );
        state.boostCharge = Math.min(1.0, state.boostCharge + clampedDt * 0.28);
      } else {
        state.isDrifting = false;
        state.driftDir = 0;
        state.driftAngle = THREE.MathUtils.lerp(state.driftAngle, 0.0, driftAlpha);
      }

      if (frame.sector === 6 && state.boostCharge > 0.45) {
        state.boostActive = 0.45;
        state.boostCharge = Math.max(0.2, state.boostCharge - clampedDt * 0.35);
      }
    } else if (state.raceFinished) {
      // Post-finish stop when the 2-minute timer reaches 00:00:
      // lock out manual throttle/steering and gently straighten the car as it brakes to a clean stop
      throttle = 0.0;
      turnRight = 0.0;
      state.boostActive = 0.0;
      state.isDrifting = false;
      state.driftDir = 0;
      const stopAlpha = 1.0 - Math.exp(-8.0 * clampedDt);
      state.headingYaw = THREE.MathUtils.lerp(state.headingYaw, 0.0, stopAlpha);
      state.driftAngle = THREE.MathUtils.lerp(state.driftAngle, 0.0, stopAlpha);
    } else if (state.countdownLocked) {
      // Hold the car completely stationary on the starting grid throughout 5, 4, 3, 2, 1 until GO!
      throttle = 0.0;
      turnRight = 0.0;
      state.speed = 0.0;
      state.steerSmooth = 0.0;
      state.headingYaw = 0.0;
      state.driftAngle = 0.0;
      state.isDrifting = false;
      state.driftDir = 0;
    } else {
      // Manual Player Control (Pure Grip W/A/S/D or Arrow Keys)
      if (keys.forward) throttle += 1.0;
      if (keys.backward) throttle -= 1.0;
      turnRight = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    }

    if (state.boostActive > 0) {
      state.boostActive = Math.max(0.0, state.boostActive - clampedDt);
    } else if (!state.isDrifting) {
      state.boostCharge = Math.min(1.0, state.boostCharge + clampedDt * 0.06);
    }

    // Longitudinal speed update
    const sWrapped = ((state.s % totalLength) + totalLength) % totalLength;
    const curvatureNorm = THREE.MathUtils.clamp(Math.abs(frame.signedCurvature) / 1.25, 0.0, 1.0);
    const throttleCadenceWave =
      0.032 * Math.sin(sWrapped * 11.2) + 0.021 * Math.cos(sWrapped * 18.7);
    const slopeSpeedDelta = THREE.MathUtils.clamp(
      frame.slope > 0 ? -frame.slope * 0.68 : -frame.slope * 0.42,
      -0.25,
      0.18
    );

    const prevSpeedForG = state.speed;

    if (isAiCruise) {
      const baseSlowdown = curvatureNorm * 0.24;
      const cornerSpeedFactor = THREE.MathUtils.clamp(
        1.0 - baseSlowdown + slopeSpeedDelta + throttleCadenceWave,
        0.56,
        1.12
      );

      const baseAutoSpeed = autopilotCruiseSpeed * cornerSpeedFactor;
      const targetAutoSpeed =
        state.boostActive > 0 && (frame.sector === 6 || state.victoryCruise)
          ? boostMaxSpeed * 0.88
          : baseAutoSpeed;
      const gravitySlopeAccel = -frame.slope * 0.16;
      const speedErr = targetAutoSpeed - state.speed;
      const autoAccel = THREE.MathUtils.clamp(speedErr * 4.2, -0.95, 0.48);
      state.speed += (autoAccel + gravitySlopeAccel) * clampedDt;
      state.speed = THREE.MathUtils.clamp(state.speed, 0.0, boostMaxSpeed);
    } else {
      const dynamicManualTopFactor = THREE.MathUtils.clamp(
        1.0 + slopeSpeedDelta * 0.45,
        0.88,
        1.10
      );
      const currentManualMaxSpeed =
        (state.boostActive > 0 ? boostMaxSpeed : manualMaxSpeed) * dynamicManualTopFactor;
      if (throttle === 0) {
        // Realistic aerodynamic drag + tire rolling resistance + engine braking when off throttle
        const speedNorm = Math.min(1.0, Math.abs(state.speed) / Math.max(0.01, manualMaxSpeed));
        const coastDecelRate = state.raceFinished
          ? 2.45
          : 0.92 + 0.72 * speedNorm * speedNorm;
        const brakeDecel = coastDecelRate * clampedDt;
        if (Math.abs(state.speed) <= brakeDecel) {
          state.speed = 0.0;
        } else {
          state.speed -= Math.sign(state.speed) * brakeDecel;
        }
        if (Math.abs(state.speed) < 0.006) {
          state.speed = 0.0;
        }
      } else {
        const gravitySlopeAccel = -frame.slope * 0.24;
        const speedNorm = THREE.MathUtils.clamp(Math.abs(state.speed) / Math.max(0.01, manualMaxSpeed), 0.0, 1.2);
        // Subtle cornering scrub when turning hard at high speed
        const cornerDrag = Math.abs(turnRight) * curvatureNorm * speedNorm * 0.055;
        let engineAccel = 0.0;
        if (throttle > 0) {
          // Progressive V6 hybrid torque curve: strong launch & mid-range pull, smooth top-end taper
          const torqueCurve = 1.08 - 0.18 * Math.pow(Math.min(1.0, speedNorm), 1.6);
          engineAccel =
            state.speed < -0.01
              ? 1.38 * throttle
              : (state.boostActive > 0 ? 0.37 : manualAccel * torqueCurve) * throttle - cornerDrag;
        } else {
          // High-performance carbon-ceramic braking when moving forward, controlled reverse gear when backed up
          engineAccel = state.speed > 0.01 ? 1.48 * throttle : 0.19 * throttle;
        }
        state.speed += (engineAccel + gravitySlopeAccel) * clampedDt;
        if (state.speed > currentManualMaxSpeed) {
          state.speed = THREE.MathUtils.lerp(
            state.speed,
            currentManualMaxSpeed,
            1.0 - Math.exp(-8.5 * clampedDt)
          );
        } else {
          state.speed = Math.max(-0.12 * state.topSpeedMultiplier, state.speed);
        }
      }
    }

    if (state.countdownLocked) {
      state.speed = 0.0;
    }

    // Compute longitudinal weight transfer (pitch dive on braking, squat on acceleration)
    const rawLongAccel = (state.speed - prevSpeedForG) / Math.max(1e-4, clampedDt);
    state.longitudinalG = THREE.MathUtils.lerp(
      state.longitudinalG || 0.0,
      THREE.MathUtils.clamp(rawLongAccel, -1.8, 1.2),
      1.0 - Math.exp(-12.0 * clampedDt)
    );
    const targetPitch = THREE.MathUtils.clamp(-state.longitudinalG * 0.022 - frame.slope * 0.04, -0.028, 0.034);
    state.chassisPitch = THREE.MathUtils.lerp(
      state.chassisPitch || 0.0,
      targetPitch,
      1.0 - Math.exp(-11.0 * clampedDt)
    );

    const apexFactor = isAiCruise
      ? 1.0
      : THREE.MathUtils.clamp(
          1.0 - frame.signedCurvature * state.lateralOffset * 16.0,
          0.88,
          1.14
        );

    // 1. Damped Curvature-Matched Heading Model
    if (!isAiCruise) {
      const prevYaw = state.headingYaw;
      state.steerSmooth = THREE.MathUtils.lerp(
        state.steerSmooth,
        turnRight,
        1.0 - Math.exp(-(turnRight !== 0 ? 16.0 : 20.0) * clampedDt)
      );

      const speedRatio = THREE.MathUtils.clamp(Math.abs(state.speed) / manualMaxSpeed, 0.0, 1.15);
      const steerSpeedFactor = THREE.MathUtils.clamp(Math.abs(state.speed) / 0.11, 0.25, 1.0);

      const roadDriftYaw = Math.tanh(frame.signedCurvature * 0.55) * 0.29 * Math.max(0.25, speedRatio);

      const isSteeringWithCorner = turnRight !== 0 && turnRight * frame.signedCurvature > 0.20;
      const isWrongWaySteer = turnRight !== 0 && turnRight * frame.signedCurvature < -0.20;

      const insideProgress = turnRight * state.lateralOffset;
      const apexTargetOffset = 0.0140;

      let targetYaw = 0.0;
      if (turnRight === 0) {
        targetYaw = roadDriftYaw;
      } else if (isSteeringWithCorner) {
        const distToApex = apexTargetOffset - insideProgress;
        const apexSteerFactor = THREE.MathUtils.clamp(distToApex / 0.0090, -0.45, 1.0);
        const inwardCarveYaw = -state.steerSmooth * 0.21 * steerSpeedFactor * apexSteerFactor;
        targetYaw = roadDriftYaw * (1.0 - Math.abs(state.steerSmooth)) + inwardCarveYaw;
      } else if (isWrongWaySteer) {
        targetYaw = roadDriftYaw - state.steerSmooth * 0.20 * steerSpeedFactor;
      } else {
        targetYaw = roadDriftYaw - state.steerSmooth * 0.185 * steerSpeedFactor;
      }

      targetYaw = THREE.MathUtils.clamp(targetYaw, -0.34, 0.34);

      const yawResponseRate = turnRight !== 0 ? 11.5 : 10.5;
      const nextYaw = THREE.MathUtils.lerp(
        prevYaw,
        targetYaw,
        1.0 - Math.exp(-yawResponseRate * clampedDt)
      );

      const roadOnlyYaw = THREE.MathUtils.lerp(
        prevYaw,
        roadDriftYaw,
        1.0 - Math.exp(-yawResponseRate * clampedDt)
      );
      const roadStepRad = roadOnlyYaw - prevYaw;
      const steerStepRad = nextYaw - roadOnlyYaw;

      state.headingYaw = THREE.MathUtils.clamp(nextYaw, -0.42, 0.42);
      state.lastRoadTurnDeg = (roadStepRad * 180) / Math.PI;
      state.lastSteerTurnDeg = (steerStepRad * 180) / Math.PI;
    } else {
      state.lastRoadTurnDeg = 0.0;
      state.lastSteerTurnDeg = 0.0;
    }

    state.turnRight = turnRight;
    state.steerAngle = -(isAiCruise ? turnRight : state.steerSmooth) * 0.45;
    state.steerInput = THREE.MathUtils.lerp(
      state.steerInput,
      turnRight,
      1.0 - Math.exp(-12.0 * clampedDt)
    );
    // Lateral cornering body roll scaled by speed so stationary steering doesn't tilt the car unnaturally
    const rollSpeedScale = THREE.MathUtils.clamp(Math.abs(state.speed) / 0.12, 0.15, 1.0);
    const targetRoll = THREE.MathUtils.clamp(
      state.steerInput * 0.046 * rollSpeedScale - frame.signedCurvature * 0.012 * rollSpeedScale,
      -0.062,
      0.062
    );
    state.chassisRoll = THREE.MathUtils.lerp(
      state.chassisRoll || 0.0,
      targetRoll,
      1.0 - Math.exp(-11.5 * clampedDt)
    );

    if (!isAiCruise) {
      if (
        Math.abs(state.steerInput) > 0.35 &&
        Math.abs(frame.signedCurvature) > 0.30 &&
        state.speed > 0.11
      ) {
        state.isDrifting = true;
        state.driftDir = Math.sign(turnRight) || Math.sign(state.steerInput) || 1;
        state.driftAngle = THREE.MathUtils.lerp(
          state.driftAngle,
          -state.driftDir * 0.18,
          1.0 - Math.exp(-10.0 * clampedDt)
        );
        state.boostCharge = Math.min(1.0, state.boostCharge + clampedDt * 0.32);
      } else {
        state.isDrifting = false;
        state.driftDir = 0;
        state.driftAngle = THREE.MathUtils.lerp(
          state.driftAngle,
          0.0,
          1.0 - Math.exp(-11.0 * clampedDt)
        );
      }

      if (
        state.railImpactActive ||
        state.speed <= 0.08 ||
        Math.abs(state.lateralOffset) >= 0.0360
      ) {
        state.cornerCleanTimer = 0.0;
      } else if (
        Math.abs(frame.signedCurvature) > 0.35 &&
        state.speed > 0.11 &&
        Math.abs(state.lateralOffset) < 0.0355 &&
        !state.railImpactActive
      ) {
        state.cornerCleanTimer += clampedDt;
      } else if (Math.abs(frame.signedCurvature) < 0.26) {
        if (state.cornerCleanTimer >= 0.42 && throttle > 0) {
          state.boostActive = Math.max(state.boostActive, 0.65);
          state.cornerCleanTimer = 0.0;
        } else {
          state.cornerCleanTimer = Math.max(0.0, state.cornerCleanTimer - clampedDt * 2.0);
        }
      }
    }

    // 2. Pure Nose-Driven Lateral Velocity
    let lateralDot = 0.0;
    if (isAiCruise) {
      lateralDot =
        state.speed * (-Math.sin(state.headingYaw)) +
        turnRight * 0.028 * (0.35 + 0.65 * Math.min(1.0, Math.abs(state.speed) / 0.10));
    } else {
      lateralDot = state.speed * (-Math.sin(state.headingYaw)) * 1.05;
    }
    state.lateralVel = lateralDot;
    state.lateralOffset += lateralDot * clampedDt;

    // 3. Two-Stage Curb Warning & Outside-Guardrail Impact (Widened 76mm Road)
    state.curbRumble = 0.0;
    const absLat = Math.abs(state.lateralOffset);
    const signLatCurrent = Math.sign(state.lateralOffset) || 1;
    const isInsideApexRail =
      Math.abs(frame.signedCurvature) > 0.35 &&
      signLatCurrent * frame.signedCurvature > 0;
    state.angledIntoRail =
      absLat >= 0.0345 &&
      !isInsideApexRail &&
      ((signLatCurrent > 0 && state.headingYaw < -0.05) ||
        (signLatCurrent < 0 && state.headingYaw > 0.05));
    state.steeringAway =
      absLat >= 0.0345 &&
      ((signLatCurrent > 0 && turnRight < 0) || (signLatCurrent < 0 && turnRight > 0));

    if (absLat < 0.0365) {
      state.railImpactActive = false;
    }

    if (absLat >= 0.0345 && absLat < 0.0380) {
      state.curbRumble = THREE.MathUtils.clamp((absLat - 0.0345) / 0.0035, 0.0, 1.0);
      if (!isAiCruise && !isInsideApexRail) {
        state.speed *= 1.0 - 0.12 * state.curbRumble * clampedDt;
      }
    } else if (absLat >= 0.0380) {
      const signLat = Math.sign(state.lateralOffset) || 1;
      state.lateralOffset = signLat * 0.0380;
      state.lateralVel = 0.0;

      if (!isAiCruise) {
        const insideApexContact =
          Math.abs(frame.signedCurvature) > 0.35 && signLat * frame.signedCurvature > 0;
        const steeringAway =
          (signLat > 0 && turnRight < 0) || (signLat < 0 && turnRight > 0);
        const steeringIntoWall =
          (signLat > 0 && turnRight > 0) || (signLat < 0 && turnRight < 0);

        if (insideApexContact && !steeringIntoWall) {
          state.lateralOffset = signLat * 0.0360;
          state.headingYaw = signLat > 0
            ? Math.max(0.0, state.headingYaw)
            : Math.min(0.0, state.headingYaw);
          state.curbRumble = 0.5;
          state.angledIntoRail = false;
          state.steeringAway = steeringAway;
        } else {
          const wallIncidenceRad = -signLat * state.headingYaw;
          const hardCrashIntoWall =
            wallIncidenceRad >= 0.165 ||
            (steeringIntoWall && Math.abs(frame.signedCurvature) < 0.35);

          if (!hardCrashIntoWall && !steeringAway) {
            state.lateralOffset = signLat * 0.0358;
            state.headingYaw = signLat * 0.065;
            state.curbRumble = 0.85;
            state.isDrifting = true;
            state.driftDir = -signLat;
            state.angledIntoRail = false;
            state.steeringAway = false;
            if (state.railHitCooldown <= 0.0) {
              state.railHitCooldown = 0.22;
              state.speed *= 0.88;
              state.hopVel = Math.max(state.hopVel, 0.005);
              if (onRailImpactCallback) onRailImpactCallback(0.28);
            }
          } else {
            state.railImpactActive = true;
            state.headingYaw = 0.0;
            state.isDrifting = false;
            state.angledIntoRail = true;
            state.steeringAway = false;
            if (state.railHitCooldown <= 0.0) {
              state.railHitCooldown = 0.35;
              state.speed = Math.max(0.015, state.speed * 0.42);
              state.hopVel = Math.max(state.hopVel, 0.008);
              state.curbRumble = 1.0;
            } else if (steeringAway) {
              state.railImpactActive = false;
              state.headingYaw = signLat * 0.13;
              state.lateralOffset = signLat * 0.0352;
              state.speed = Math.max(state.speed, 0.085 * state.topSpeedMultiplier);
            }
          }
        }
      }
    }

    // Advance arc-length s along periodic loop projected by cos(headingYaw) and inside-apex racing line factor
    const forwardProjection = isAiCruise ? 1.0 : Math.max(0.0, Math.cos(state.headingYaw));
    const ds = (state.speed * forwardProjection * clampedDt) / apexFactor;
    state.s = ((state.s + ds) % totalLength + totalLength) % totalLength;

    // Vertical hop suspension spring
    if (state.hopHeight > 0 || state.hopVel !== 0) {
      state.hopHeight += state.hopVel * clampedDt;
      state.hopVel -= 0.18 * clampedDt;
      if (state.hopHeight <= 0) {
        state.hopHeight = 0;
        state.hopVel = 0;
      }
    }

    // Re-evaluate exact 3D pose & right-handed orientation quaternion on the banked spline
    syncPoseFromSpline();

    // -------------------------------------------------------------------------
    // TWO-MINUTE DISTANCE CHALLENGE CLOCK & 3D WORLD-SPACE DISTANCE ACCUMULATOR
    // -------------------------------------------------------------------------
    if (state.autopilot) {
      state.raceClockActive = false;
      state.currentLapTime = 0.0;
      state.totalRaceTime = 0.0;
      state.remainingTime = state.challengeDuration;
      _prevWorldPos.copy(state.position);
      _hasPrevWorldPos = true;
    } else if (!state.victoryCruise && !state.raceFinished) {
      if (!state.countdownLocked && Math.abs(state.speed) > 0.005) {
        state.raceClockActive = true;
      }

      if (!state.countdownLocked && state.raceClockActive) {
        // Measure actual 3D world-space FORWARD displacement along the car's direction of travel:
        // - Increases ONLY when the car moves forward (state.speed > 0.002 and positive forward displacement)
        // - Remains completely unchanged when reversing, rolling backward, stationary, spinning wheels, or sliding sideways
        // - Never subtracts distance already earned and never resets mid-run
        if (_hasPrevWorldPos && state.speed > 0.002 && ds > 0.0) {
          _worldDelta.subVectors(state.position, _prevWorldPos);
          // Remove any vertical suspension hop or curb vibration along the road normal
          const normalComp = _worldDelta.dot(state.normal);
          _worldDelta.addScaledVector(state.normal, -normalComp);

          const horizStepLen = _worldDelta.length();
          // Ignore teleportation jumps (> 40mm in a single physics step) or stationary micro-jitter
          if (horizStepLen > 1e-6 && horizStepLen < 0.040) {
            // Compute the car's actual 3D forward unit vector in world space
            _carForward
              .copy(state.tangent)
              .applyAxisAngle(state.normal, state.headingYaw || 0.0)
              .normalize();

            const forwardAlongCar = _worldDelta.dot(_carForward);
            const forwardAlongTrack = _worldDelta.dot(state.tangent);
            const forwardAlignment = forwardAlongCar / horizStepLen;

            // Require genuine forward movement along both the car's forward heading and travel direction,
            // rejecting reverse/backward movement (<= 0) and sideways sliding (forwardAlignment <= 0.35)
            if (forwardAlongCar > 0.0 && forwardAlongTrack > 0.0 && forwardAlignment > 0.35) {
              // Exclude lateral slide component so sideways drift cannot inflate forward distance
              const cosYaw = Math.max(0.75, Math.cos(state.headingYaw || 0.0));
              const pureForwardStep = Math.min(forwardAlongCar, forwardAlongTrack / cosYaw);
              if (pureForwardStep > 0.0) {
                const stepMeters = pureForwardStep * 102.35;
                state.distanceMeters += stepMeters;
                state.distanceKm = state.distanceMeters / 1000.0;
              }
            }
          }
        }

        const currentScaleKmh = Math.max(0.0, state.speed) * 102.35 * 3.6;
        if (currentScaleKmh > state.maxSpeedKmh) {
          state.maxSpeedKmh = currentScaleKmh;
        }

        state.currentLapTime += clampedDt;
        state.totalRaceTime += clampedDt;
        state.remainingTime = Math.max(0.0, state.challengeDuration - state.totalRaceTime);

        if (state.totalRaceTime > 0.1) {
          state.avgSpeedKmh = (state.distanceMeters / state.totalRaceTime) * 3.6;
        }

        // Note: Crossing the start/finish line does NOT reset the timer or trigger a lap!
        // The player drives continuously until the 120-second countdown reaches 0.0.
        if (state.remainingTime <= 0.0) {
          state.remainingTime = 0.0;
          state.totalRaceTime = state.challengeDuration;
          state.finishTotalTime = state.challengeDuration;
          state.raceFinished = true;
          state.raceClockActive = false;
          state.victoryCruise = false;
          state.boostActive = 0.0;
          if (onRaceFinishCallback) {
            onRaceFinishCallback(
              state.distanceKm,
              state.distanceMeters,
              Math.round(state.maxSpeedKmh),
              Math.round(state.avgSpeedKmh),
              state.challengeDuration
            );
          }
        }
      }
    }

    _prevWorldPos.copy(state.position);
    _hasPrevWorldPos = true;

    return state;
  }

  return {
    world,
    state,
    keys,
    stepPhysics,
    sampleTrackAtArcLength,
    teleportToSector,
    resetToStart,
    setAutopilot,
    setPaused,
    setTouchKey,
    clearTouchKeys,
    notifyLightsOut,
    onLapComplete: (cb) => {
      onLapCompleteCallback = cb;
    },
    onModeChange: (cb) => {
      onModeChangeCallback = cb;
    },
    onRaceFinish: (cb) => {
      onRaceFinishCallback = cb;
    },
    onRailImpact: (cb) => {
      onRailImpactCallback = cb;
    },
  };
}

