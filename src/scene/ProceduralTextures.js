import * as THREE from 'three';

/**
 * Procedural PBR Canvas Textures for ASPHALT: LE MANS 24H
 * Zero-404 dependencies: French countryside landscape, Dunlop bridge,
 * pit buildings, sponsor hoardings, spectator grandstands, and racing asphalt.
 */

export function createDunlopBridgeTexture() {
  const w = 1024;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Iconic Dunlop vibrant racing yellow background
  const yellowGrad = ctx.createLinearGradient(0, 0, 0, h);
  yellowGrad.addColorStop(0.0, '#ffe11e');
  yellowGrad.addColorStop(0.5, '#ffd000');
  yellowGrad.addColorStop(1.0, '#e5b200');
  ctx.fillStyle = yellowGrad;
  ctx.fillRect(0, 0, w, h);

  // Deep navy blue & black top/bottom aerodynamic racing borders
  ctx.fillStyle = '#071430';
  ctx.fillRect(0, 0, w, 24);
  ctx.fillRect(0, h - 44, w, 44);

  // Crisp red-and-yellow pinstripe above bottom bar
  ctx.fillStyle = '#d4101b';
  ctx.fillRect(0, h - 50, w, 6);

  // Left & Right Tire Tread Chevron Accents positioned safely near outer margins
  const drawTread = (startX) => {
    ctx.fillStyle = '#071430';
    for (let i = 0; i < 3; i++) {
      const bx = startX + i * 24;
      ctx.beginPath();
      ctx.moveTo(bx, 40);
      ctx.lineTo(bx + 14, (h - 26) / 2);
      ctx.lineTo(bx, h - 64);
      ctx.lineTo(bx + 10, h - 64);
      ctx.lineTo(bx + 24, (h - 26) / 2);
      ctx.lineTo(bx + 10, 40);
      ctx.closePath();
      ctx.fill();
    }
  };
  drawTread(32);
  drawTread(w - 104);

  // Red circular Dunlop flying-D arrow emblem to the left of DUNLOP title
  ctx.save();
  ctx.translate(210, (h - 26) / 2);
  ctx.fillStyle = '#d4101b';
  ctx.beginPath();
  ctx.arc(0, 0, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd000';
  ctx.beginPath();
  ctx.moveTo(-16, -18);
  ctx.lineTo(22, 0);
  ctx.lineTo(-16, 18);
  ctx.lineTo(-8, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Bold "DUNLOP" title in clean, centered, unclipped racing typography
  ctx.save();
  ctx.fillStyle = '#071430';
  ctx.font = 'italic 900 96px "Arial Black", "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DUNLOP', w / 2 + 32, (h - 26) / 2);
  ctx.restore();

  // Subtitle centered cleanly inside bottom navy bar
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "JetBrains Mono", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('24 HEURES DU MANS  •  CIRCUIT DE LA SARTHE', w / 2, h - 22);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  return tex;
}

export function createCountrysideTerrainTexture() {
  const w = 1024;
  const h = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // French rolling pasture green base
  ctx.fillStyle = '#2d4a23';
  ctx.fillRect(0, 0, w, h);

  // Patchwork agricultural fields (French farmland grid)
  const cols = 8;
  const rows = 8;
  const cw = w / cols;
  const ch = h / rows;

  const fieldColors = [
    '#345427', // Lush pasture
    '#2c451e', // Dark clover
    '#68582b', // Golden ripe wheat
    '#584b25', // Dry straw
    '#223a19', // Dense grass
    '#40361c', // Freshly plowed soil
    '#394f26', // Meadow green
    '#4a3f20', // Vineyard rows
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = (r * 13 + c * 7) % fieldColors.length;
      ctx.fillStyle = fieldColors[idx];
      ctx.fillRect(c * cw + 2, r * ch + 2, cw - 4, ch - 4);

      // Add agricultural furrows / crop stripes
      if (idx % 2 === 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        for (let y = r * ch + 4; y < (r + 1) * ch - 4; y += 8) {
          ctx.fillRect(c * cw + 4, y, cw - 8, 3);
        }
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let x = c * cw + 4; x < (c + 1) * cw - 4; x += 8) {
          ctx.fillRect(x, r * ch + 4, 3, ch - 8);
        }
      }

      // French hedgerows & stone walls dividing fields
      ctx.strokeStyle = '#182913';
      ctx.lineWidth = 4;
      ctx.strokeRect(c * cw, r * ch, cw, ch);
    }
  }

  // Organic noise & dirt speckles
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const s = 1 + Math.random() * 3;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.14)' : 'rgba(255,255,255,0.08)';
    ctx.fillRect(x, y, s, s);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(12, 12);
  tex.anisotropy = 16;
  return tex;
}

export function createPitBuildingFacadeTexture() {
  const w = 1024;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Modern concrete & composite dark pit building facade
  ctx.fillStyle = '#1c212a';
  ctx.fillRect(0, 0, w, h);

  // Upper VIP hospitality floor with illuminated panoramic windows
  const winGrad = ctx.createLinearGradient(0, 20, 0, 100);
  winGrad.addColorStop(0.0, '#3a5270');
  winGrad.addColorStop(0.5, '#769cc7');
  winGrad.addColorStop(1.0, '#253548');
  ctx.fillStyle = winGrad;
  ctx.fillRect(16, 22, w - 32, 70);

  // Window mullions
  ctx.strokeStyle = '#12151b';
  ctx.lineWidth = 3;
  for (let x = 16; x < w - 32; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 22);
    ctx.lineTo(x, 92);
    ctx.stroke();
  }

  // Horizontal sponsor strip above pit garages
  ctx.fillStyle = '#e10600'; // Racing Red accent strip
  ctx.fillRect(0, 96, w, 14);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px "Orbitron", sans-serif';
  ctx.fillText('24H LE MANS • PIT LANE OFFICIAL PADDOCK • FIA WEC', 32, 108);

  // Ground-floor pit garages (16 garage bays)
  const numGarages = 16;
  const gWidth = (w - 32) / numGarages;
  const teams = [
    { name: 'FERRARI AF CORSE', num: '51', col: '#d40000' },
    { name: 'PORSCHE PENSKE', num: '6', col: '#ffffff' },
    { name: 'TOYOTA GAZOO', num: '7', col: '#ff2222' },
    { name: 'PEUGEOT TOTAL', num: '93', col: '#90e000' },
    { name: 'CADILLAC RACING', num: '2', col: '#0055ff' },
    { name: 'ALPINE ENDURANCE', num: '35', col: '#0090ff' },
    { name: 'BMW M TEAM WRT', num: '15', col: '#ffffff' },
    { name: 'LAMBORGHINI IRON', num: '63', col: '#00dd44' },
    { name: 'ASTON MARTIN', num: '77', col: '#006644' },
    { name: 'CHEVROLET CORVETTE', num: '81', col: '#ffcc00' },
    { name: 'FORD MULTIMATIC', num: '64', col: '#0033aa' },
    { name: 'UNITED AUTOSPORTS', num: '22', col: '#0088cc' },
    { name: 'INTER EUROPOL', num: '34', col: '#ddff00' },
    { name: 'VECTOR SPORT', num: '10', col: '#ff4400' },
    { name: 'HERTZ TEAM JOTA', num: '12', col: '#d4af37' },
    { name: 'WRT HYPERCAR', num: '46', col: '#4444ff' },
  ];

  for (let i = 0; i < numGarages; i++) {
    const gx = 16 + i * gWidth;
    const gy = 118;
    const team = teams[i % teams.length];

    // Garage interior glow
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(gx + 3, gy, gWidth - 6, 120);

    // Warm fluorescent ceiling lights inside garage
    const bayGlow = ctx.createLinearGradient(0, gy, 0, gy + 50);
    bayGlow.addColorStop(0.0, 'rgba(255, 235, 190, 0.85)');
    bayGlow.addColorStop(1.0, 'rgba(20, 30, 45, 0.0)');
    ctx.fillStyle = bayGlow;
    ctx.fillRect(gx + 5, gy, gWidth - 10, 45);

    // Team nameboard above garage door
    ctx.fillStyle = team.col;
    ctx.fillRect(gx + 3, gy, gWidth - 6, 18);
    ctx.fillStyle = team.col === '#ffffff' ? '#000000' : '#ffffff';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${team.num} ${team.name.split(' ')[0]}`, gx + gWidth / 2, gy + 13);

    // Garage frame pillars
    ctx.fillStyle = '#323946';
    ctx.fillRect(gx, gy - 4, 3, 128);
    ctx.fillRect(gx + gWidth - 3, gy - 4, 3, 128);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export function createGrandstandSpectatorsTexture() {
  const w = 512;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Concrete terraced seating steps
  const rows = 16;
  const rHeight = h / rows;
  const crowdColors = [
    '#e10600', '#ffffff', '#0055ff', '#ffd200', '#222222',
    '#33bbff', '#ff6600', '#00aa44', '#dddddd', '#882299'
  ];

  for (let r = 0; r < rows; r++) {
    // Step concrete edge
    ctx.fillStyle = r % 2 === 0 ? '#383e4a' : '#2b303b';
    ctx.fillRect(0, r * rHeight, w, rHeight);

    // Cheering spectators heads and shirts
    for (let c = 4; c < w - 4; c += 7 + Math.sin(r * 3 + c) * 2) {
      const col = crowdColors[(r * 17 + Math.floor(c * 3.1)) % crowdColors.length];
      ctx.fillStyle = col;
      ctx.fillRect(c, r * rHeight + 3, 5, rHeight - 5);
      // Head
      ctx.fillStyle = '#f2c199';
      ctx.beginPath();
      ctx.arc(c + 2.5, r * rHeight + 4, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(4, 1);
  return tex;
}

export function createSponsorBoardTexture() {
  const w = 1024;
  const h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Repeating trackside sponsor hoardings
  const sponsors = [
    { bg: '#00552b', text: 'ROLEX', textCol: '#ffd200', sub: 'OFFICIAL TIMEPIECE' },
    { bg: '#c4121a', text: 'MOTUL', textCol: '#ffffff', sub: 'RACING OIL' },
    { bg: '#0b2055', text: 'MICHELIN', textCol: '#ffd200', sub: 'TOTAL PERFORMANCE' },
    { bg: '#e10600', text: 'TOTALENERGIES', textCol: '#ffffff', sub: 'EXCELLIUM RACING' },
    { bg: '#111822', text: '24H LE MANS', textCol: '#ffaa44', sub: 'SPIRIT OF LE MANS' },
  ];

  const spWidth = w / sponsors.length;
  for (let i = 0; i < sponsors.length; i++) {
    const sp = sponsors[i];
    const sx = i * spWidth;

    ctx.fillStyle = sp.bg;
    ctx.fillRect(sx, 0, spWidth, h);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx + 2, 2, spWidth - 4, h - 4);

    ctx.fillStyle = sp.textCol;
    ctx.font = 'italic 900 36px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(sp.text, sx + spWidth / 2, 58);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = 'bold 12px "JetBrains Mono", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText(sp.sub, sx + spWidth / 2, 88);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(6, 1);
  return tex;
}

export function createCheckeredGantryTexture() {
  const w = 1024;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0b0f17';
  ctx.fillRect(0, 0, w, h);

  // Black and white checkered borders on sides
  const sq = 32;
  for (let r = 0; r < h / sq; r++) {
    for (let c = 0; c < 5; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? '#ffffff' : '#14171f';
      ctx.fillRect(c * sq, r * sq, sq, sq);
      ctx.fillRect(w - (c + 1) * sq, r * sq, sq, sq);
    }
  }

  // Center motorsport header
  ctx.fillStyle = '#e10600';
  ctx.fillRect(160, 24, w - 320, 10);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'italic 900 52px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('START • FINISH', w / 2, 92);

  ctx.fillStyle = '#ffaa44';
  ctx.font = 'bold 22px "Orbitron", sans-serif';
  ctx.fillText('ASPHALT: LE MANS 24H', w / 2, 138);

  ctx.fillStyle = '#4cc2ff';
  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.fillText('CIRCUIT DE LA SARTHE • 24 HEURES DU MANS', w / 2, 178);

  ctx.fillStyle = '#e10600';
  ctx.fillRect(160, 214, w - 320, 10);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  return tex;
}

export function createAsphaltRoadTexture() {
  const w = 512;
  const h = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Dark crushed-basalt circuit asphalt base
  ctx.fillStyle = '#161920';
  ctx.fillRect(0, 0, w, h);

  // Rubberized racing groove in center
  const grooveGrad = ctx.createLinearGradient(0, 0, w, 0);
  grooveGrad.addColorStop(0.0, 'rgba(32, 36, 46, 0.4)');
  grooveGrad.addColorStop(0.2, 'rgba(14, 16, 22, 0.75)');
  grooveGrad.addColorStop(0.5, 'rgba(8, 10, 14, 0.92)');
  grooveGrad.addColorStop(0.8, 'rgba(14, 16, 22, 0.75)');
  grooveGrad.addColorStop(1.0, 'rgba(32, 36, 46, 0.4)');
  ctx.fillStyle = grooveGrad;
  ctx.fillRect(0, 0, w, h);

  // Fine mineral aggregate speckles
  for (let i = 0; i < 8000; i++) {
    const x = (i * 73) % w;
    const y = (i * 199) % h;
    const v = 22 + (i % 28);
    ctx.fillStyle = `rgb(${v}, ${v + 2}, ${v + 4})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Glowing white/cyan racing track boundary lines on left & right
  ctx.fillStyle = '#00e5ff';
  ctx.fillRect(14, 0, 4, h);
  ctx.fillRect(w - 18, 0, 4, h);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(18, 0, 6, h);
  ctx.fillRect(w - 24, 0, 6, h);

  // Subtle dashed white centerline for the long Mulsanne straight
  ctx.fillStyle = 'rgba(240, 248, 255, 0.65)';
  for (let y = 0; y < h; y += 64) {
    ctx.fillRect(w / 2 - 2, y + 8, 4, 32);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 48);
  tex.anisotropy = 16;
  return tex;
}

// ---------------------------------------------------------------------------
// AUTOMOTIVE MANUFACTURER & LE MANS ENDURANCE BRAND ARCH TEXTURES
// ---------------------------------------------------------------------------

export function createPorscheCurvesArchTexture() {
  const w = 1024;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Sophisticated Black, White, and Red colour scheme (Arch B: Porsche)
  ctx.fillStyle = '#0d0f14';
  ctx.fillRect(0, 0, w, h);

  // White top and bottom architectural framing bars
  ctx.fillStyle = '#f5f7fa';
  ctx.fillRect(0, 0, w, 22);
  ctx.fillRect(0, h - 22, w, 22);

  // Guards Red racing stripe accents
  ctx.fillStyle = '#d5001c';
  ctx.fillRect(0, 22, w, 14);
  ctx.fillRect(0, h - 36, w, 14);

  // Angled Red & White Penske Motorsport geometric side chevrons
  for (let side of [-1, 1]) {
    const cx = side < 0 ? 90 : w - 90;
    ctx.fillStyle = '#d5001c';
    ctx.beginPath();
    ctx.moveTo(cx - side * 55, 36);
    ctx.lineTo(cx - side * 15, 36);
    ctx.lineTo(cx + side * 20, h - 36);
    ctx.lineTo(cx - side * 20, h - 36);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(cx - side * 5, 36);
    ctx.lineTo(cx + side * 18, 36);
    ctx.lineTo(cx + side * 53, h - 36);
    ctx.lineTo(cx + side * 30, h - 36);
    ctx.closePath();
    ctx.fill();
  }

  // Bold "PORSCHE" typographic wordmark in crisp white
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 82px "Orbitron", "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PORSCHE', w / 2, h / 2 - 14);

  ctx.font = 'bold 22px "Orbitron", sans-serif';
  ctx.fillStyle = '#ff3b47';
  ctx.fillText('PORSCHE CURVES  •  963 HYPERCAR', w / 2, h / 2 + 48);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  return tex;
}

export function createFerrariArchTexture() {
  const w = 1024;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Predominantly Ferrari Rosso Corsa racing red (matching reference image!)
  const redGrad = ctx.createLinearGradient(0, 0, 0, h);
  redGrad.addColorStop(0.0, '#d8121b');
  redGrad.addColorStop(0.5, '#be0d15');
  redGrad.addColorStop(1.0, '#96080f');
  ctx.fillStyle = redGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle dark structural border along bottom edge (as seen in reference gantry)
  ctx.fillStyle = '#14161b';
  ctx.fillRect(0, h - 22, w, 22);

  // Helper to draw the iconic yellow Scuderia Ferrari Shield on left and right of "Ferrari"
  const drawScuderiaShield = (cx, cy, scale = 1.0) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    // Giallo Modena Yellow Shield
    ctx.fillStyle = '#fed100';
    ctx.beginPath();
    ctx.moveTo(-44, -62);
    ctx.lineTo(44, -62);
    ctx.lineTo(44, 8);
    ctx.quadraticCurveTo(44, 62, 0, 78);
    ctx.quadraticCurveTo(-44, 62, -44, 8);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#111317';
    ctx.stroke();

    // Italian Tricolore top bar inside shield
    ctx.fillStyle = '#009246';
    ctx.fillRect(-40, -58, 26, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-13, -58, 26, 10);
    ctx.fillStyle = '#ce2b37';
    ctx.fillRect(14, -58, 26, 10);

    // Black Prancing Horse emblem
    ctx.fillStyle = '#111317';
    ctx.font = 'bold 54px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♞', 0, 6);

    ctx.font = 'bold 16px "Arial Black", sans-serif';
    ctx.fillText('S', -20, 46);
    ctx.fillText('F', 20, 46);
    ctx.restore();
  };

  drawScuderiaShield(175, h / 2 - 8, 1.05);
  drawScuderiaShield(w - 175, h / 2 - 8, 1.05);

  // Bold white "Ferrari" emblem lettering in the center (matching reference photo!)
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 108px "Georgia", "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Ferrari', w / 2, h / 2 - 4);

  // Characteristic extended top bar over the "F" through "rri"
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(w / 2 - 115, h / 2 - 58, 255, 9);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  return tex;
}

export function createToyotaGazooArchTexture() {
  const w = 1024;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // White, Red, and Dark Grey colour scheme (Arch C: Toyota)
  ctx.fillStyle = '#f4f6f9'; // Clean white primary background
  ctx.fillRect(0, 0, w, h);

  // Dark Grey geometric flank blocks
  ctx.fillStyle = '#242830';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(210, 0);
  ctx.lineTo(150, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(w - 210, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w, h);
  ctx.lineTo(w - 150, h);
  ctx.closePath();
  ctx.fill();

  // Gazoo Racing Red diagonal slash ribbons
  ctx.fillStyle = '#e5001e';
  ctx.beginPath();
  ctx.moveTo(210, 0);
  ctx.lineTo(265, 0);
  ctx.lineTo(205, h);
  ctx.lineTo(150, h);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(w - 265, 0);
  ctx.lineTo(w - 210, 0);
  ctx.lineTo(w - 150, h);
  ctx.lineTo(w - 205, h);
  ctx.closePath();
  ctx.fill();

  // Top and bottom dark grey structural trim
  ctx.fillStyle = '#1c2026';
  ctx.fillRect(0, 0, w, 16);
  ctx.fillRect(0, h - 20, w, 20);

  // Bold "TOYOTA" in racing red & "GAZOO RACING" in dark grey
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 76px "Orbitron", "Arial Black", sans-serif';
  ctx.fillStyle = '#e5001e';
  ctx.fillText('TOYOTA', w / 2, h / 2 - 22);

  ctx.fillStyle = '#1c2026';
  ctx.font = 'bold 28px "Orbitron", sans-serif';
  ctx.fillText('GAZOO RACING  •  GR010 HYBRID', w / 2, h / 2 + 44);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  return tex;
}

export function createBmwMotorsportArchTexture() {
  const w = 1024;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Alpine white base
  ctx.fillStyle = '#f4f6fa';
  ctx.fillRect(0, 0, w, h);

  // BMW M iconic tricolor diagonal ribbon: Cyan (#00a0e3), Dark Blue (#002266), Red (#e4002b)
  const stripeW = 28;
  const mColors = ['#00a0e3', '#002266', '#e4002b'];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = mColors[i];
    ctx.beginPath();
    ctx.moveTo(80 + i * stripeW, 0);
    ctx.lineTo(120 + i * stripeW, 0);
    ctx.lineTo(40 + i * stripeW, h);
    ctx.lineTo(0 + i * stripeW, h);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(w - 120 + i * stripeW, 0);
    ctx.lineTo(w - 80 + i * stripeW, 0);
    ctx.lineTo(w - 160 + i * stripeW, h);
    ctx.lineTo(w - 200 + i * stripeW, h);
    ctx.closePath();
    ctx.fill();
  }

  // Dark border trim
  ctx.fillStyle = '#141822';
  ctx.fillRect(0, 0, w, 14);
  ctx.fillRect(0, h - 16, w, 16);

  // "BMW M MOTORSPORT"
  ctx.fillStyle = '#0a101d';
  ctx.font = '900 78px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '10px';
  ctx.fillText('BMW M MOTORSPORT', w / 2, h / 2 - 16);

  ctx.fillStyle = '#002266';
  ctx.font = 'bold 23px "Orbitron", sans-serif';
  ctx.letterSpacing = '5px';
  ctx.fillText('M HYBRID V8 • CHICANE PLAYSTATION / MOTUL', w / 2, h / 2 + 50);

  ctx.fillStyle = '#556075';
  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.letterSpacing = '3px';
  ctx.fillText('TEAM WRT • SHELL HELIX ULTRA • PUMA MOTORSPORT', w / 2, h - 14);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  return tex;
}

export function createPeugeotSportArchTexture() {
  const w = 1024;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Dark matte graphite / titanium base
  ctx.fillStyle = '#16191f';
  ctx.fillRect(0, 0, w, h);

  // Carbon weave texture
  ctx.fillStyle = 'rgba(30, 36, 46, 0.4)';
  for (let y = 0; y < h; y += 8) {
    for (let x = 0; x < w; x += 16) {
      ctx.fillRect(x + ((y / 8) % 2 === 0 ? 0 : 8), y, 8, 4);
    }
  }

  // Kryptonite Neon Green claw slash accents (#9bf00b)
  ctx.fillStyle = '#9bf00b';
  for (let c = 0; c < 3; c++) {
    const cx = 50 + c * 32;
    ctx.beginPath();
    ctx.moveTo(cx + 18, 20);
    ctx.lineTo(cx + 34, 20);
    ctx.lineTo(cx + 16, h - 20);
    ctx.lineTo(cx, h - 20);
    ctx.closePath();
    ctx.fill();

    const rx = w - 140 + c * 32;
    ctx.beginPath();
    ctx.moveTo(rx + 18, 20);
    ctx.lineTo(rx + 34, 20);
    ctx.lineTo(rx + 16, h - 20);
    ctx.lineTo(rx, h - 20);
    ctx.closePath();
    ctx.fill();
  }

  // Kryptonite top & bottom glowing accent lines
  ctx.fillRect(0, 0, w, 10);
  ctx.fillRect(0, h - 14, w, 14);

  // "PEUGEOT SPORT"
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 76px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '10px';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 10;
  ctx.fillText('PEUGEOT SPORT', w / 2, h / 2 - 16);

  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#9bf00b';
  ctx.font = 'bold 23px "Orbitron", sans-serif';
  ctx.letterSpacing = '5px';
  ctx.fillText('9X8 HYPERCAR • TOTALENERGIES • INDIANAPOLIS & ARNAGE', w / 2, h / 2 + 50);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.letterSpacing = '3px';
  ctx.fillText('CIRCUIT DE LA SARTHE SECTOR 5 • CAPGEMINI • MARELLI', w / 2, h - 14);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  return tex;
}

export function createCadillacRacingTexture() {
  const w = 1024;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Deep Navy Blue base (#0a1628)
  ctx.fillStyle = '#0a1628';
  ctx.fillRect(0, 0, w, h);

  // Cadillac Racing Gold (#d4af37)
  ctx.fillStyle = '#d4af37';
  ctx.fillRect(0, 0, w, 14);
  ctx.fillRect(0, h - 18, w, 18);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 74px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '10px';
  ctx.fillText('CADILLAC RACING', w / 2, h / 2 - 16);

  ctx.fillStyle = '#d4af37';
  ctx.font = 'bold 23px "Orbitron", sans-serif';
  ctx.letterSpacing = '5px';
  ctx.fillText('V-SERIES.R HYPERCAR • CHIP GANASSI RACING', w / 2, h / 2 + 50);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.letterSpacing = '3px';
  ctx.fillText('MOBIL 1 • MICHELIN PILOT SPORT • DALLARA', w / 2, h - 14);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  return tex;
}

export function createRolexStartFinishTexture() {
  const w = 1024;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Deep Rolex British Racing Green (#004c24)
  const greenGrad = ctx.createLinearGradient(0, 0, 0, h);
  greenGrad.addColorStop(0.0, '#00582b');
  greenGrad.addColorStop(0.5, '#003e1e');
  greenGrad.addColorStop(1.0, '#002813');
  ctx.fillStyle = greenGrad;
  ctx.fillRect(0, 0, w, h);

  // Rich Metallic Gold borders (#ffd200 / #d4af37)
  ctx.fillStyle = '#ffd200';
  ctx.fillRect(0, 0, w, 16);
  ctx.fillRect(0, h - 20, w, 20);

  // Checkered black and white side gantry wings
  const sq = 28;
  for (let r = 0; r < h / sq; r++) {
    for (let c = 0; c < 4; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? '#ffffff' : '#10141a';
      ctx.fillRect(c * sq, r * sq, sq, sq);
      ctx.fillRect(w - (c + 1) * sq, r * sq, sq, sq);
    }
  }

  // Rolex Crown representation in gold
  ctx.fillStyle = '#ffd200';
  ctx.beginPath();
  const crownX = w / 2;
  const crownY = 52;
  ctx.moveTo(crownX - 30, crownY);
  ctx.lineTo(crownX - 42, crownY - 26);
  ctx.lineTo(crownX - 18, crownY - 14);
  ctx.lineTo(crownX, crownY - 32);
  ctx.lineTo(crownX + 18, crownY - 14);
  ctx.lineTo(crownX + 42, crownY - 26);
  ctx.lineTo(crownX + 30, crownY);
  ctx.closePath();
  ctx.fill();

  // "ROLEX" gold typography
  ctx.font = '900 68px "Orbitron", serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '14px';
  ctx.fillText('ROLEX', w / 2, 116);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px "Orbitron", sans-serif';
  ctx.letterSpacing = '6px';
  ctx.fillText('START • FINISH • 24 HEURES DU MANS', w / 2, 168);

  ctx.fillStyle = '#ffe082';
  ctx.font = 'bold 14px "JetBrains Mono", monospace';
  ctx.letterSpacing = '4px';
  ctx.fillText('OFFICIAL TIMEPIECE • CIRCUIT DE LA SARTHE', w / 2, 208);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  return tex;
}

export function createBrakeMarkerTexture(distanceStr = '100') {
  const w = 256;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Clean white reflective board
  ctx.fillStyle = '#f8fafd';
  ctx.fillRect(0, 0, w, h);

  // Black / Red racing border
  ctx.strokeStyle = '#141822';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, w - 14, h - 14);

  // Blue or Red top accent stripe
  ctx.fillStyle = distanceStr === '150' ? '#0066cc' : distanceStr === '100' ? '#e5001e' : '#ffd200';
  ctx.fillRect(14, 14, w - 28, 22);

  // Large high-contrast distance number
  ctx.fillStyle = '#10141d';
  ctx.font = '900 120px "Orbitron", "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(distanceStr, w / 2, h / 2 + 10);

  ctx.font = 'bold 18px "JetBrains Mono", monospace';
  ctx.letterSpacing = '2px';
  ctx.fillStyle = '#445065';
  ctx.fillText('METERS', w / 2, h - 34);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// Retain compatibility exports for any existing callers
export function createOakWoodTextures() {
  return {
    colorTex: createCountrysideTerrainTexture(),
    bumpTex: createCountrysideTerrainTexture(),
  };
}

export function createMonitorScreenTexture() {
  return createCheckeredGantryTexture();
}
