/**
 * MediaPipe Hands Browser-based Realtime Hand Tracking Manager.
 * Loads MediaPipe CDN libraries dynamically, manages video stream,
 * detects single & two-hand gestures (pinch, drag, tilt, rotate, zoom),
 * and cleans up media streams cleanly on disable/unmount.
 */

let cameraInstance = null;
let handsInstance = null;
let videoElement = null;
let mediaStream = null;

export async function loadMediaPipeScripts() {
  if (window.Hands && window.Camera) {
    return true;
  }

  return new Promise((resolve, reject) => {
    // 1. Load Camera Utils
    const scriptCamera = document.createElement('script');
    scriptCamera.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
    scriptCamera.crossOrigin = 'anonymous';

    scriptCamera.onload = () => {
      // 2. Load Hands
      const scriptHands = document.createElement('script');
      scriptHands.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
      scriptHands.crossOrigin = 'anonymous';

      scriptHands.onload = () => resolve(true);
      scriptHands.onerror = (err) => reject(err);
      document.body.appendChild(scriptHands);
    };

    scriptCamera.onerror = (err) => reject(err);
    document.body.appendChild(scriptCamera);
  });
}

export async function startHandTracking(onFrameData, onError) {
  try {
    // Ensure CDN scripts are loaded
    await loadMediaPipeScripts();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera access API is not supported on this device/browser.');
    }

    // Create hidden video element for MediaPipe stream
    videoElement = document.createElement('video');
    videoElement.style.display = 'none';
    videoElement.playsInline = true;
    document.body.appendChild(videoElement);

    // Request camera permission explicitly
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user'
      }
    });

    videoElement.srcObject = mediaStream;
    await videoElement.play();

    // Initialize MediaPipe Hands
    handsInstance = new window.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    handsInstance.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.65,
      minTrackingConfidence: 0.65
    });

    let prevHandAngle = null;

    handsInstance.onResults((results) => {
      if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        onFrameData({
          detected: false,
          handCount: 0,
          rotX: 0,
          rotY: 0,
          isPinch: false,
          pinchPos: { x: 0.5, y: 0.5 },
          zoomFactor: 1,
          spinBoost: 0,
          cursorPos: null
        });
        return;
      }

      const landmarks = results.multiHandLandmarks;
      const handCount = landmarks.length;

      // ------------------------------------------------
      // SINGLE HAND GESTURES
      // ------------------------------------------------
      const hand1 = landmarks[0];
      
      // Hand Center (wrist [0] + middle finger MCP [9] average)
      const centerX = 1.0 - (hand1[0].x + hand1[9].x) / 2; // Flip horizontally for natural mirror feel
      const centerY = (hand1[0].y + hand1[9].y) / 2;

      // Normalized rotation offset (-1 to 1)
      const rotY = (centerX - 0.5) * 2.8; // Left/Right -> Horizontal rotation
      const rotX = (centerY - 0.5) * 1.8; // Up/Down -> Vertical tilt

      // Index finger tip (landmark 8) & Thumb tip (landmark 4)
      const thumbTip = hand1[4];
      const indexTip = hand1[8];

      // Distance between thumb & index tip (Pinch detection)
      const dx = (thumbTip.x - indexTip.x);
      const dy = (thumbTip.y - indexTip.y);
      const dz = (thumbTip.z - indexTip.z);
      const pinchDist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const isPinch = pinchDist < 0.08;

      // Single Hand Z-Distance (Depth approximation)
      const wristToIndexDist = Math.sqrt(
        Math.pow(hand1[0].x - indexTip.x, 2) + Math.pow(hand1[0].y - indexTip.y, 2)
      );
      const singleZoom = Math.min(Math.max((wristToIndexDist - 0.25) * 2.5, -0.6), 0.8);

      // Circular motion detection
      const currentAngle = Math.atan2(centerY - 0.5, centerX - 0.5);
      let spinBoost = 0;
      if (prevHandAngle !== null) {
        let diff = currentAngle - prevHandAngle;
        if (diff > Math.PI) diff -= Math.PI * 2;
        if (diff < -Math.PI) diff += Math.PI * 2;
        if (Math.abs(diff) > 0.05 && Math.abs(diff) < 1.0) {
          spinBoost = diff * 1.8;
        }
      }
      prevHandAngle = currentAngle;

      // ------------------------------------------------
      // TWO HAND GESTURES (IF 2 HANDS DETECTED)
      // ------------------------------------------------
      let twoHandZoom = 1;
      let twoHandRotZ = 0;

      if (handCount >= 2) {
        const hand2 = landmarks[1];
        const center2X = 1.0 - (hand2[0].x + hand2[9].x) / 2;
        const center2Y = (hand2[0].y + hand2[9].y) / 2;

        // Distance between two hands controls zoom
        const handDist = Math.sqrt(
          Math.pow(centerX - center2X, 2) + Math.pow(centerY - center2Y, 2)
        );
        twoHandZoom = Math.min(Math.max(handDist * 1.8, 0.5), 2.2);

        // Angle between two hands controls Z-rotation
        twoHandRotZ = Math.atan2(center2Y - centerY, center2X - centerX);
      }

      onFrameData({
        detected: true,
        handCount,
        rotX,
        rotY,
        rotZ: twoHandRotZ,
        isPinch,
        pinchPos: { x: centerX, y: centerY },
        zoomFactor: handCount >= 2 ? twoHandZoom : (1 + singleZoom),
        spinBoost,
        cursorPos: { x: centerX, y: centerY }
      });
    });

    // Start camera frame processing loop
    cameraInstance = new window.Camera(videoElement, {
      onFrame: async () => {
        if (handsInstance && videoElement && videoElement.readyState >= 2) {
          await handsInstance.send({ image: videoElement });
        }
      },
      width: 640,
      height: 480
    });

    await cameraInstance.start();
    return true;

  } catch (err) {
    console.warn('Hand tracking initialization failed:', err);
    stopHandTracking();
    if (onError) onError(err);
    return false;
  }
}

export function stopHandTracking() {
  if (cameraInstance) {
    try { cameraInstance.stop(); } catch (e) {}
    cameraInstance = null;
  }

  if (handsInstance) {
    try { handsInstance.close(); } catch (e) {}
    handsInstance = null;
  }

  if (mediaStream) {
    try {
      mediaStream.getTracks().forEach((track) => track.stop());
    } catch (e) {}
    mediaStream = null;
  }

  if (videoElement) {
    try { videoElement.remove(); } catch (e) {}
    videoElement = null;
  }
}
