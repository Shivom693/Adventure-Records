import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const Waveform = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e) => {
      mouseRef.current.targetX = (e.clientX - window.innerWidth / 2) * 0.05;
      mouseRef.current.targetY = (e.clientY - window.innerHeight / 2) * 0.05;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Draw faint dot grid (Notion / Linear style)
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)';
      const dotSpacing = 50;
      const startX = (mouse.x * 0.3) % dotSpacing;
      const startY = (mouse.y * 0.3) % dotSpacing;
      for (let x = startX; x < canvas.width; x += dotSpacing) {
        for (let y = startY; y < canvas.height; y += dotSpacing) {
          ctx.fillRect(x, y, 1.5, 1.5);
        }
      }

      phase += 0.002;

      // Draw a single ultra-fine wave line running across center height
      ctx.beginPath();
      ctx.strokeStyle = isDark ? 'rgba(168, 85, 247, 0.12)' : 'rgba(168, 85, 247, 0.18)';
      ctx.lineWidth = 1;

      const centerY = canvas.height * 0.65 + mouse.y;

      for (let x = 0; x < canvas.width; x++) {
        // Subtle wave calculation using double sine modulation
        const y = centerY + 
          Math.sin(x * 0.0015 + phase) * 20 * Math.sin(phase * 0.5) +
          Math.cos(x * 0.003 - phase * 0.5) * 8;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    />
  );
};

export default Waveform;
