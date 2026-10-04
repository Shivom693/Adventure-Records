import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createVinylTextures } from './vinylTexture';

const VinylScene = ({
  isPaused,
  onInteractionStart,
  onInteractionEnd
}) => {
  const mountRef = useRef(null);
  const [isWebGlSupported, setIsWebGlSupported] = useState(true);

  // Interaction targets & spring physics state
  const physicsRef = useRef({
    targetRotX: 0,
    targetRotY: 0,
    targetRotZ: 0,
    targetPosX: 0,
    targetPosY: 0,
    targetPosZ: 0,
    targetScale: 1,
    currentRotX: 0,
    currentRotY: 0,
    currentRotZ: 0,
    currentPosX: 0,
    currentPosY: 0,
    currentPosZ: 0,
    currentScale: 1,
    isDragging: false,
    dragStart: { x: 0, y: 0 }
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setIsWebGlSupported(false);
        return;
      }
    } catch (e) {
      setIsWebGlSupported(false);
      return;
    }

    // ----------------------------------------------------
    // 1. THREE.JS SCENE, CAMERA & RENDERER
    // ----------------------------------------------------
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.appendChild(renderer.domElement);

    // ----------------------------------------------------
    // 2. STUDIO MONOCHROME LIGHTING (PREMIUM STUDIO LIGHTS)
    // ----------------------------------------------------
    // Ambient Light (Soft overall fill)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // Key Directional Light (Creates glossy specular highlights on vinyl grooves)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    // Neutral White Edge Rim Light (Highlights 3D bevel contour of record)
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.4);
    rimLight.position.set(-4, 5, -3);
    scene.add(rimLight);

    // Neutral White Soft Fill Light
    const fillLight = new THREE.PointLight(0xe4e4e7, 0.8, 10);
    fillLight.position.set(-3, 3, 3);
    scene.add(fillLight);

    // ----------------------------------------------------
    // 3. 3D EXTRUDED GLOSSY VINYL RECORD MESH
    // ----------------------------------------------------
    const { labelTexture, bumpTexture, roughnessTexture } = createVinylTextures();

    // Shape profile with center spindle hole cutout
    const shape = new THREE.Shape();
    const outerRadius = 2.4;
    const holeRadius = 0.14;
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);

    const holePath = new THREE.Path();
    holePath.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
    shape.holes.push(holePath);

    const extrudeSettings = {
      depth: 0.05,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 1,
      bevelSize: 0.025,
      bevelThickness: 0.02,
      curveSegments: 96
    };

    const vinylGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    vinylGeometry.center();

    // Disc face material: Glossy near-black #050505 with grooves & label texture
    const faceMaterial = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughnessMap: roughnessTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.018,
      map: labelTexture,
      metalness: 0.45,
      roughness: 0.18,
      side: THREE.DoubleSide
    });

    // Outer edge plastic rim material
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0x080808,
      roughness: 0.2,
      metalness: 0.6
    });

    const vinylMesh = new THREE.Mesh(vinylGeometry, [faceMaterial, edgeMaterial]);
    vinylMesh.castShadow = true;
    vinylMesh.receiveShadow = true;

    const vinylGroup = new THREE.Group();
    vinylGroup.add(vinylMesh);
    scene.add(vinylGroup);

    // Initial presentation tilt angle
    vinylGroup.rotation.x = 0.45;
    vinylGroup.rotation.y = -0.3;

    // ----------------------------------------------------
    // 4. SOFT DROP SHADOW PLANE & DUST PARTICLES
    // ----------------------------------------------------
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    const sGrad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
    sGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    sGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
    sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 256, 256);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);

    const shadowGeo = new THREE.PlaneGeometry(6.5, 6.5);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.5,
      depthWrite: false
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -2.8;
    scene.add(shadowPlane);

    // Floating subtle dust particles
    const particleCount = 30;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 12;
      particlePos[i + 1] = (Math.random() - 0.5) * 10;
      particlePos[i + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.03,
      transparent: true,
      opacity: 0.25
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ----------------------------------------------------
    // 5. ANIMATION LOOP & PHYSICS INTERPOLATION
    // ----------------------------------------------------
    let animationFrameId = null;
    let clock = new THREE.Clock();
    let isVisible = true;

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(container);

    const renderLoop = () => {
      animationFrameId = requestAnimationFrame(renderLoop);

      if (!isVisible) return;

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const p = physicsRef.current;

      // Continuous Smooth Idle Spin
      if (!p.isDragging && !isPaused) {
        p.targetRotY += delta * 0.55;
      }

      // Floating Bobbing Effect
      const idleBob = Math.sin(time * 1.4) * 0.08;
      const targetY = p.targetPosY + idleBob;

      // Smooth Interpolation (Lerp)
      const lerpSpeed = 8.0 * delta;
      p.currentRotX += (p.targetRotX - p.currentRotX) * lerpSpeed;
      p.currentRotY += (p.targetRotY - p.currentRotY) * lerpSpeed;
      p.currentRotZ += (p.targetRotZ - p.currentRotZ) * lerpSpeed;

      p.currentPosX += (p.targetPosX - p.currentPosX) * lerpSpeed;
      p.currentPosY += (targetY - p.currentPosY) * lerpSpeed;
      p.currentPosZ += (p.targetPosZ - p.currentPosZ) * lerpSpeed;

      p.currentScale += (p.targetScale - p.currentScale) * lerpSpeed;

      // Apply transformations to Vinyl Mesh Group
      vinylGroup.rotation.x = 0.35 + p.currentRotX;
      vinylGroup.rotation.y = p.currentRotY;
      vinylGroup.rotation.z = p.currentRotZ;

      vinylGroup.position.set(p.currentPosX, p.currentPosY, p.currentPosZ);
      vinylGroup.scale.setScalar(p.currentScale);

      // Shadow Plane tracking
      shadowPlane.position.x = p.currentPosX * 0.8;
      shadowPlane.position.z = p.currentPosZ * 0.8;
      shadowPlane.scale.setScalar(p.currentScale * (1 - p.currentPosY * 0.05));

      // Dust particles subtle movement
      particles.rotation.y = time * 0.02;

      renderer.render(scene, camera);
    };

    renderLoop();

    // ----------------------------------------------------
    // 6. RESIZE & CLEANUP
    // ----------------------------------------------------
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      vinylGeometry.dispose();
      faceMaterial.dispose();
      edgeMaterial.dispose();
      labelTexture.dispose();
      bumpTexture.dispose();
      roughnessTexture.dispose();
      shadowTex.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isPaused]);

  // ----------------------------------------------------
  // 7. MOUSE CONTROLS (DESKTOP)
  // ----------------------------------------------------
  const handleMouseDown = (e) => {
    const p = physicsRef.current;
    p.isDragging = true;
    p.dragStart = { x: e.clientX, y: e.clientY };
    if (onInteractionStart) onInteractionStart();
  };

  const handleMouseMove = (e) => {
    const p = physicsRef.current;
    const container = mountRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    if (p.isDragging) {
      const dx = e.clientX - p.dragStart.x;
      const dy = e.clientY - p.dragStart.y;
      p.targetRotY += dx * 0.01;
      p.targetRotX += dy * 0.01;
      p.dragStart = { x: e.clientX, y: e.clientY };
    } else {
      p.targetRotX = normY * 0.45;
      p.targetRotY += normX * 0.005;
    }
  };

  const handleMouseUp = () => {
    const p = physicsRef.current;
    p.isDragging = false;
    p.targetPosX = 0;
    p.targetPosY = 0;
    if (onInteractionEnd) onInteractionEnd();
  };

  const handleWheel = (e) => {
    const p = physicsRef.current;
    p.targetScale = Math.min(Math.max(p.targetScale - e.deltaY * 0.0015, 0.6), 1.8);
  };

  // ----------------------------------------------------
  // 8. TOUCH CONTROLS (MOBILE)
  // ----------------------------------------------------
  const touchStateRef = useRef({ dist: 0 });

  const handleTouchStart = (e) => {
    const p = physicsRef.current;

    if (e.touches.length === 1) {
      p.isDragging = true;
      p.dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStateRef.current.dist = Math.sqrt(dx * dx + dy * dy);
    }
    if (onInteractionStart) onInteractionStart();
  };

  const handleTouchMove = (e) => {
    const p = physicsRef.current;

    if (e.touches.length === 1 && p.isDragging) {
      const dx = e.touches[0].clientX - p.dragStart.x;
      const dy = e.touches[0].clientY - p.dragStart.y;
      p.targetRotY += dx * 0.012;
      p.targetRotX += dy * 0.012;
      p.dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.sqrt(dx * dx + dy * dy);
      const deltaDist = newDist - touchStateRef.current.dist;
      p.targetScale = Math.min(Math.max(p.targetScale + deltaDist * 0.005, 0.5), 2.0);
      touchStateRef.current.dist = newDist;
    }
  };

  const handleTouchEnd = () => {
    const p = physicsRef.current;
    p.isDragging = false;
    p.targetPosX = 0;
    p.targetPosY = 0;
    if (onInteractionEnd) onInteractionEnd();
  };

  if (!isWebGlSupported) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#18181B] rounded-3xl border border-white/12 text-center space-y-4 shadow-2xl">
        <div className="w-24 h-24 rounded-full border-4 border-white/20 bg-black flex items-center justify-center text-white font-bold text-xl animate-spin-slow shadow-2xl">
          AR
        </div>
        <p className="text-zinc-400 text-xs">
          3D WebGL mode isn't supported on this device. Fallback audio player enabled.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="w-full h-[380px] sm:h-[480px] lg:h-[540px] relative cursor-grab active:cursor-grabbing select-none overflow-hidden touch-none"
    />
  );
};

export default VinylScene;
