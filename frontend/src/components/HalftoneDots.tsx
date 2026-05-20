/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';

interface HalftoneDotsProps {
  color?: string; // 'blue' | 'red' | 'both'
}

export default function HalftoneDots({ color = 'blue' }: HalftoneDotsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let tick = 0;

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = rect?.width || window.innerWidth;
      height = rect?.height || window.innerHeight;
      
      // Use device pixel ratio for super crisp rendering on modern screens
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    const resizeObserver = new ResizeObserver(() => resize());
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.parentElement?.addEventListener('mouseleave', handleMouseLeave);

    // Grid details
    const spacing = 18; // Distance between dots

    const draw = () => {
      if (!ctx || width === 0 || height === 0) return;
      
      tick += 0.015;
      
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;

      // Base coordinate offsets to align with center
      const startX = (width - (cols * spacing)) / 2;
      const startY = (height - (rows * spacing)) / 2;

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = startX + c * spacing;
          const y = startY + r * spacing;

          // 1. Distance from center of drawing canvas (radial center glow)
          const centerX = width / 2;
          const centerY = height / 2;
          const distToCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          
          // Max distance to corners for normalization
          const maxDist = Math.sqrt(centerX ** 2 + centerY ** 2);
          const centerFactor = Math.max(0, 1 - distToCenter / (maxDist * 0.75));

          // 2. Distance from mouse position
          let mouseFactor = 0;
          if (mouse.active) {
            const distToMouse = Math.sqrt((x - mouse.x) ** 2 + (y - mouse.y) ** 2);
            mouseFactor = Math.max(0, 1 - distToMouse / 180); // 180px operational radius
          }

          // 3. Gentle wave animation pulsing
          const wave = Math.sin(tick + (x * 0.003) + (y * 0.002)) * 0.15 + 0.85;

          // Combined influence
          // Base dot size based on center (oceanlab style radial halftone)
          const baseOpacity = Math.pow(centerFactor, 1.8) * 0.72;
          const combinedOpacity = Math.min(0.9, baseOpacity * wave + mouseFactor * 0.4);
          
          if (combinedOpacity < 0.01) continue;

          // Dot radius scales with brightness/influence
          const maxRadius = 3.2;
          const minRadius = 0.45;
          const radius = minRadius + (maxRadius - minRadius) * (combinedOpacity * 1.1);

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);

          // Color calculation
          if (color === 'red') {
            // Hot red / crimson neon
            ctx.fillStyle = `rgba(234, 56, 56, ${combinedOpacity * 0.65})`;
          } else if (color === 'both') {
            // Gradient mix based on coordinates
            const ratio = x / width;
            const rVal = Math.floor(234 * ratio + 0 * (1 - ratio));
            const gVal = Math.floor(56 * ratio + 82 * (1 - ratio));
            const bVal = Math.floor(56 * ratio + 255 * (1 - ratio));
            ctx.fillStyle = `rgba(${rVal}, ${gVal}, ${bVal}, ${combinedOpacity * 0.8})`;
          } else {
            // OceanLab true blue
            ctx.fillStyle = `rgba(0, 82, 255, ${combinedOpacity * 0.75})`;
          }

          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.parentElement?.removeEventListener('mouseleave', handleMouseLeave);
      resizeObserver.disconnect();
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none opacity-85 select-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
