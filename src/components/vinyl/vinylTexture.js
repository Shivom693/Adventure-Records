import * as THREE from 'three';

/**
 * Creates ultra-high-resolution (2048x2048) procedural canvas textures for the 3D Vinyl Record.
 * Features a glossy black disc with crisp, ultra-legible PURE WHITE "ADVENTURE RECORDS" branding.
 */

export function createVinylTextures() {
  const size = 2048; // Double resolution for crystal-clear readability
  
  // ----------------------------------------------------
  // 1. CENTER LABEL TEXTURE (BRIGHT WHITE & ONYX BLACK DESIGN)
  // ----------------------------------------------------
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = size;
  labelCanvas.height = size;
  const ctx = labelCanvas.getContext('2d');

  const center = size / 2;
  const labelRadius = size * 0.32; // Generous label size for maximum readability

  // Clear background
  ctx.clearRect(0, 0, size, size);

  // Outer Vinyl Disc Base Color (Deep Glossy Black)
  ctx.beginPath();
  ctx.arc(center, center, size * 0.49, 0, Math.PI * 2);
  ctx.fillStyle = '#08080a';
  ctx.fill();

  // Subtle Concentric Sound Groove Reflections on Disc Surface
  const grooveBands = [
    { start: 0.33, end: 0.38, alpha: 0.18 },
    { start: 0.39, end: 0.44, alpha: 0.15 },
    { start: 0.45, end: 0.485, alpha: 0.22 }
  ];
  
  grooveBands.forEach(b => {
    ctx.beginPath();
    ctx.arc(center, center, size * b.end, 0, Math.PI * 2);
    ctx.arc(center, center, size * b.start, 0, Math.PI * 2, true);
    ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha})`;
    ctx.fill();
  });

  // Center Paper Label Background (Onyx Black with Radial Shimmer)
  ctx.beginPath();
  ctx.arc(center, center, labelRadius, 0, Math.PI * 2);
  const labelGrad = ctx.createRadialGradient(center, center, 20, center, center, labelRadius);
  labelGrad.addColorStop(0, '#1c1c22');
  labelGrad.addColorStop(0.6, '#111116');
  labelGrad.addColorStop(1, '#07070a');
  ctx.fillStyle = labelGrad;
  ctx.fill();

  // Outer Metallic Silver & White Double Border Rings
  const drawSilverRing = (radius, width) => {
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.lineWidth = width;
    const silverGrad = ctx.createLinearGradient(center - radius, center - radius, center + radius, center + radius);
    silverGrad.addColorStop(0, '#ffffff');
    silverGrad.addColorStop(0.25, '#e4e4e7');
    silverGrad.addColorStop(0.5, '#a1a1aa');
    silverGrad.addColorStop(0.75, '#f4f4f5');
    silverGrad.addColorStop(1, '#ffffff');
    ctx.strokeStyle = silverGrad;
    ctx.stroke();
  };

  drawSilverRing(labelRadius - 4, 8);
  drawSilverRing(labelRadius - 20, 3);
  drawSilverRing(labelRadius - 32, 1.5);

  // Decorative Luxury Music & Adventure Logo (Top Center)
  ctx.save();
  ctx.translate(center, center - 120);

  // Silver Crest Frame
  ctx.beginPath();
  ctx.arc(0, 0, 70, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // Waveform / Mountain Adventure Icon
  ctx.beginPath();
  ctx.moveTo(-35, 15);
  ctx.lineTo(-15, -25);
  ctx.lineTo(0, 0);
  ctx.lineTo(15, -35);
  ctx.lineTo(35, 15);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#ffffff';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  ctx.restore();

  // ----------------------------------------------------
  // CENTER BRAND TEXT: ADVENTURE RECORDS (PURE WHITE COLOR)
  // ----------------------------------------------------
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 1. Curved White Text around Top Arch: "ADVENTURE RECORDS"
  const drawCurvedText = (text, radius, startAngle) => {
    ctx.save();
    ctx.font = '900 38px "Orbitron", "Outfit", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 12;
    
    const anglePerChar = 0.12;
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

  drawCurvedText('ADVENTURE RECORDS', labelRadius - 65, -Math.PI / 2);

  // 2. MAIN CENTERED BOLD BRANDING: "ADVENTURE RECORDS" IN PURE WHITE
  ctx.save();

  // Text Shadow Glow in White
  ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
  ctx.shadowBlur = 28;

  // Main centered line: ADVENTURE RECORDS (PURE WHITE)
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 62px "Orbitron", "Outfit", sans-serif';
  ctx.letterSpacing = '10px';
  ctx.fillText('ADVENTURE RECORDS', center, center + 40);

  ctx.restore();

  // Sub-tagline: YOUR MUSIC. EVERYWHERE.
  ctx.fillStyle = '#e4e4e7';
  ctx.font = '700 22px "Outfit", sans-serif';
  ctx.letterSpacing = '8px';
  ctx.fillText('YOUR MUSIC. EVERYWHERE.', center, center + 125);

  // Format / Speed badge: 33 ⅓ RPM • STEREO
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 20px "Outfit", sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText('★ 33 ⅓ RPM  •  HIGH FIDELITY STEREO ★', center, center + 175);

  // Center Spindle Hole Ring & Cutout
  const holeRadius = size * 0.032;
  ctx.beginPath();
  ctx.arc(center, center, holeRadius + 10, 0, Math.PI * 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(center, center, holeRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#000000';
  ctx.fill();

  // Convert label canvas to Three.js Texture
  const labelTexture = new THREE.CanvasTexture(labelCanvas);
  labelTexture.anisotropy = 16;
  labelTexture.needsUpdate = true;

  // ----------------------------------------------------
  // 2. REALISTIC GROOVES BUMP MAP TEXTURE
  // ----------------------------------------------------
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  const minGrooveR = size * 0.33;
  const maxGrooveR = size * 0.488;

  for (let r = minGrooveR; r < maxGrooveR; r += 2.2) {
    const intensity = Math.sin(r * 0.5) * 50 + Math.random() * 25;
    bCtx.beginPath();
    bCtx.arc(center, center, r, 0, Math.PI * 2);
    bCtx.strokeStyle = `rgb(${128 + intensity}, ${128 + intensity}, ${128 + intensity})`;
    bCtx.lineWidth = 1.2;
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

  rCtx.fillStyle = '#1c1c1c'; // Highly reflective vinyl grooves
  rCtx.fillRect(0, 0, size, size);

  rCtx.beginPath();
  rCtx.arc(center, center, labelRadius, 0, Math.PI * 2);
  rCtx.fillStyle = '#3a3a3a'; // Matte paper label
  rCtx.fill();

  const roughnessTexture = new THREE.CanvasTexture(roughCanvas);
  roughnessTexture.anisotropy = 16;
  roughnessTexture.needsUpdate = true;

  return { labelTexture, bumpTexture, roughnessTexture };
}
