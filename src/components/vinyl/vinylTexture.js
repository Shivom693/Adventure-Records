import * as THREE from 'three';

/**
 * Creates ultra-high-resolution (2048x2048) procedural canvas textures for the 3D Vinyl Record.
 * Features a glossy black disc with crisp concentric sound grooves, specular highlights,
 * and elegant PURE WHITE "ADVENTURE RECORDS" center label branding.
 */

export function createVinylTextures() {
  const size = 2048; // High resolution for crisp details and smooth curves
  
  // ----------------------------------------------------
  // 1. CENTER LABEL & DISC SURFACE TEXTURE
  // ----------------------------------------------------
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = size;
  labelCanvas.height = size;
  const ctx = labelCanvas.getContext('2d');

  const center = size / 2;
  const labelRadius = size * 0.30; // 30% label size for balanced proportions

  // Clear canvas
  ctx.clearRect(0, 0, size, size);

  // Outer Vinyl Disc Base Surface (Glossy Near-Black #050505)
  ctx.beginPath();
  ctx.arc(center, center, size * 0.495, 0, Math.PI * 2);
  ctx.fillStyle = '#050505';
  ctx.fill();

  // Subtle Concentric Sound Groove Bands on Disc Surface (Light reflections)
  const grooveBands = [
    { start: 0.31, end: 0.36, alpha: 0.08 },
    { start: 0.365, end: 0.41, alpha: 0.12 },
    { start: 0.415, end: 0.455, alpha: 0.09 },
    { start: 0.46, end: 0.49, alpha: 0.14 }
  ];
  
  grooveBands.forEach(b => {
    ctx.beginPath();
    ctx.arc(center, center, size * b.end, 0, Math.PI * 2);
    ctx.arc(center, center, size * b.start, 0, Math.PI * 2, true);
    ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha})`;
    ctx.fill();
  });

  // Individual micro-groove sheen rings
  for (let r = size * 0.31; r < size * 0.49; r += 6) {
    ctx.beginPath();
    ctx.arc(center, center, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.03 + (Math.sin(r * 0.05) + 1) * 0.04})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

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

  drawSilverRing(labelRadius - 4, 6, 0.9);
  drawSilverRing(labelRadius - 18, 2.5, 0.75);
  drawSilverRing(labelRadius - 28, 1.2, 0.5);

  // Decorative Crest / Logo Icon (Top Center of Label)
  ctx.save();
  ctx.translate(center, center - 110);

  // Silver Circle Frame
  ctx.beginPath();
  ctx.arc(0, 0, 65, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // Mountain / Waveform Symbol
  ctx.beginPath();
  ctx.moveTo(-32, 14);
  ctx.lineTo(-14, -22);
  ctx.lineTo(0, 0);
  ctx.lineTo(14, -32);
  ctx.lineTo(32, 14);
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = '#ffffff';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  ctx.restore();

  // ----------------------------------------------------
  // CENTER BRAND TEXT: ADVENTURE RECORDS (PURE WHITE)
  // ----------------------------------------------------
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 1. Curved White Arch Text: "ADVENTURE RECORDS"
  const drawCurvedText = (text, radius, startAngle) => {
    ctx.save();
    ctx.font = '900 36px "Outfit", "Inter", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
    ctx.shadowBlur = 10;
    
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

  drawCurvedText('ADVENTURE RECORDS', labelRadius - 60, -Math.PI / 2);

  // 2. MAIN CENTERED BOLD BRANDING: "ADVENTURE RECORDS"
  ctx.save();
  ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
  ctx.shadowBlur = 20;

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 58px "Outfit", "Inter", sans-serif';
  ctx.fillText('ADVENTURE RECORDS', center, center + 38);

  ctx.restore();

  // Sub-tagline
  ctx.fillStyle = '#e4e4e7';
  ctx.font = '700 20px "Outfit", sans-serif';
  ctx.fillText('MUSIC DISTRIBUTION', center, center + 115);

  // Speed Badge: 33 ⅓ RPM • STEREO
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 18px "Outfit", sans-serif';
  ctx.fillText('★ 33 ⅓ RPM  •  HIGH FIDELITY STEREO ★', center, center + 160);

  // Center Spindle Hole Metallic Ring
  const holeRadius = size * 0.032;
  ctx.beginPath();
  ctx.arc(center, center, holeRadius + 8, 0, Math.PI * 2);
  ctx.lineWidth = 3.5;
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

  const minGrooveR = size * 0.305;
  const maxGrooveR = size * 0.49;

  for (let r = minGrooveR; r < maxGrooveR; r += 2.0) {
    const intensity = Math.sin(r * 0.4) * 60 + Math.random() * 30;
    bCtx.beginPath();
    bCtx.arc(center, center, r, 0, Math.PI * 2);
    bCtx.strokeStyle = `rgb(${128 + intensity}, ${128 + intensity}, ${128 + intensity})`;
    bCtx.lineWidth = 1.3;
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
  // 3. ROUGHNESS MAP TEXTURE (GLOSSY VINYL VS PAPER LABEL)
  // ----------------------------------------------------
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d');

  rCtx.fillStyle = '#141414'; // Glossy highly-reflective disc surface
  rCtx.fillRect(0, 0, size, size);

  rCtx.beginPath();
  rCtx.arc(center, center, labelRadius, 0, Math.PI * 2);
  rCtx.fillStyle = '#383838'; // Matte paper label
  rCtx.fill();

  const roughnessTexture = new THREE.CanvasTexture(roughCanvas);
  roughnessTexture.anisotropy = 16;
  roughnessTexture.needsUpdate = true;

  return { labelTexture, bumpTexture, roughnessTexture };
}
