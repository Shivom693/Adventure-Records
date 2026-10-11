import * as THREE from 'three';

/**
 * Premium 8-Color Palette for Interactive 3D Vinyl Record
 */
export const VINYL_COLORS = [
  { id: 'black',   name: 'Classic Black', hex: '#050505', color: 0x050505, edgeColor: 0x0a0a0a },
  { id: 'red',     name: 'Deep Red',      hex: '#7F1D1D', color: 0x7f1d1d, edgeColor: 0x4a0e0e },
  { id: 'blue',    name: 'Royal Blue',    hex: '#1D4ED8', color: 0x1d4ed8, edgeColor: 0x12328b },
  { id: 'emerald', name: 'Emerald Green', hex: '#047857', color: 0x047857, edgeColor: 0x024734 },
  { id: 'purple',  name: 'Purple',        hex: '#6D28D9', color: 0x6d28d9, edgeColor: 0x431887 },
  { id: 'gold',    name: 'Gold',          hex: '#B8860B', color: 0xb8860b, edgeColor: 0x785707 },
  { id: 'silver',  name: 'Silver',        hex: '#71717A', color: 0x71717a, edgeColor: 0x44444a },
  { id: 'orange',  name: 'Orange',        hex: '#C2410C', color: 0xc2410c, edgeColor: 0x7c2908 }
];

/**
 * Creates procedural canvas textures for the 3D Vinyl Record.
 * Features a procedural concentric sound grooves bump map, realistic roughness map,
 * and elegant PURE WHITE "ADVENTURE RECORDS" center label overlay.
 */
export function createVinylTextures() {
  const size = 2048; // High resolution for crisp micro-details
  const center = size / 2;
  
  // ----------------------------------------------------
  // 1. CENTER PAPER LABEL OVERLAY TEXTURE
  // ----------------------------------------------------
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = size;
  labelCanvas.height = size;
  const ctx = labelCanvas.getContext('2d');

  // Clear canvas (transparent background)
  ctx.clearRect(0, 0, size, size);

  const labelRadius = size * 0.48; // Fills circle geometry bounds smoothly

  // Center Paper Label Background (Charcoal to Onyx Black Gradient)
  ctx.beginPath();
  ctx.arc(center, center, labelRadius, 0, Math.PI * 2);
  const labelGrad = ctx.createRadialGradient(center, center, 20, center, center, labelRadius);
  labelGrad.addColorStop(0, '#222228');
  labelGrad.addColorStop(0.5, '#141418');
  labelGrad.addColorStop(1, '#09090b');
  ctx.fillStyle = labelGrad;
  ctx.fill();

  // Outer Metallic Silver & White Double Border Rings
  const drawSilverRing = (radius, width, opacity = 1) => {
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.lineWidth = width;
    const silverGrad = ctx.createLinearGradient(center - radius, center - radius, center + radius, center + radius);
    silverGrad.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
    silverGrad.addColorStop(0.3, `rgba(228, 228, 231, ${opacity * 0.9})`);
    silverGrad.addColorStop(0.6, `rgba(161, 161, 170, ${opacity * 0.8})`);
    silverGrad.addColorStop(1, `rgba(255, 255, 255, ${opacity})`);
    ctx.strokeStyle = silverGrad;
    ctx.stroke();
  };

  drawSilverRing(labelRadius - 10, 10, 0.9);
  drawSilverRing(labelRadius - 40, 4, 0.75);
  drawSilverRing(labelRadius - 65, 2, 0.5);

  // Decorative Crest / Logo Icon (Top Center of Label)
  ctx.save();
  ctx.translate(center, center - 240);

  // Silver Circle Frame
  ctx.beginPath();
  ctx.arc(0, 0, 140, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // Mountain / Waveform Symbol
  ctx.beginPath();
  ctx.moveTo(-70, 30);
  ctx.lineTo(-30, -50);
  ctx.lineTo(0, 0);
  ctx.lineTo(30, -70);
  ctx.lineTo(70, 30);
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#ffffff';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  ctx.restore();

  // ----------------------------------------------------
  // BRAND TEXT: ADVENTURE RECORDS (PURE WHITE)
  // ----------------------------------------------------
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 1. Curved White Arch Text: "ADVENTURE RECORDS"
  const drawCurvedText = (text, radius, startAngle) => {
    ctx.save();
    ctx.font = '900 76px "Outfit", "Inter", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
    ctx.shadowBlur = 15;
    
    const anglePerChar = 0.115;
    const initialAngle = startAngle - (text.length * anglePerChar) / 2;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const charAngle = initialAngle + i * anglePerChar;

      ctx.save();
      ctx.translate(center + radius * Math.cos(charAngle), center + radius * Math.sin(charAngle));
      ctx.rotate(charAngle + Math.PI / 2);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  };

  drawCurvedText('ADVENTURE RECORDS', labelRadius - 140, -Math.PI / 2);

  // 2. MAIN CENTERED BOLD BRANDING: "ADVENTURE RECORDS"
  ctx.save();
  ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
  ctx.shadowBlur = 25;

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 115px "Outfit", "Inter", sans-serif';
  ctx.fillText('ADVENTURE RECORDS', center, center + 85);

  ctx.restore();

  // Sub-tagline
  ctx.fillStyle = '#e4e4e7';
  ctx.font = '700 42px "Outfit", sans-serif';
  ctx.fillText('MUSIC DISTRIBUTION', center, center + 240);

  // Speed Badge: 33 ⅓ RPM • STEREO
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 38px "Outfit", sans-serif';
  ctx.fillText('★ 33 ⅓ RPM  •  HIGH FIDELITY STEREO ★', center, center + 330);

  // Center Spindle Hole Metallic Ring
  const holeRadius = size * 0.08;
  ctx.beginPath();
  ctx.arc(center, center, holeRadius + 16, 0, Math.PI * 2);
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // Center Hole Cutout
  ctx.beginPath();
  ctx.arc(center, center, holeRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#050505';
  ctx.fill();

  const labelTexture = new THREE.CanvasTexture(labelCanvas);
  labelTexture.anisotropy = 16;
  labelTexture.needsUpdate = true;

  // ----------------------------------------------------
  // 2. GROOVES BUMP MAP TEXTURE
  // ----------------------------------------------------
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  const minGrooveR = size * 0.28;
  const maxGrooveR = size * 0.495;

  for (let r = minGrooveR; r < maxGrooveR; r += 2.0) {
    const intensity = Math.sin(r * 0.4) * 60 + Math.random() * 30;
    bCtx.beginPath();
    bCtx.arc(center, center, r, 0, Math.PI * 2);
    bCtx.strokeStyle = `rgb(${128 + intensity}, ${128 + intensity}, ${128 + intensity})`;
    bCtx.lineWidth = 1.4;
    bCtx.stroke();
  }

  bCtx.beginPath();
  bCtx.arc(center, center, minGrooveR - 2, 0, Math.PI * 2);
  bCtx.fillStyle = '#808080';
  bCtx.fill();

  const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
  bumpTexture.wrapS = THREE.RepeatWrapping;
  bumpTexture.wrapT = THREE.RepeatWrapping;
  bumpTexture.anisotropy = 16;
  bumpTexture.needsUpdate = true;

  // ----------------------------------------------------
  // 3. ROUGHNESS MAP TEXTURE (ANISOTROPIC VINYL SHEEN)
  // ----------------------------------------------------
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d');

  rCtx.fillStyle = '#141414'; // Glossy disc surface
  rCtx.fillRect(0, 0, size, size);

  // Concentric groove bands roughness variation
  for (let r = minGrooveR; r < maxGrooveR; r += 8) {
    rCtx.beginPath();
    rCtx.arc(center, center, r, 0, Math.PI * 2);
    rCtx.strokeStyle = `rgba(255, 255, 255, ${0.05 + Math.random() * 0.1})`;
    rCtx.lineWidth = 4;
    rCtx.stroke();
  }

  const roughnessTexture = new THREE.CanvasTexture(roughCanvas);
  roughnessTexture.anisotropy = 16;
  roughnessTexture.needsUpdate = true;

  return { labelTexture, bumpTexture, roughnessTexture };
}

