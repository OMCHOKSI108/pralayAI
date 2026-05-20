/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [clicked, setClicked] = useState(false);
  const [linkHovered, setLinkHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };

    const handleMouseDown = () => setClicked(true);
    const handleMouseUp = () => setClicked(false);
    
    // Add hover detection for links, buttons, interactive parts
    const addHoverEvents = () => {
      const interactiveElements = document.querySelectorAll('a, button, [role="button"], input, select, textarea');
      interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', () => setLinkHovered(true));
        el.addEventListener('mouseleave', () => setLinkHovered(false));
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    // Check initial and set an observer for dynamic DOM changes
    addHoverEvents();
    const observer = new MutationObserver(addHoverEvents);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      observer.disconnect();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      {/* Dynamic Cursor Ring */}
      <div
        id="custom-cursor-ring"
        className={`fixed top-0 left-0 w-8 h-8 rounded-full border pointer-events-none z-50 transition-transform duration-100 -translate-x-1/2 -translate-y-1/2 hidden md:block ${
          linkHovered 
            ? 'border-cyber-blue scale-150 bg-cyber-blue/10' 
            : clicked 
              ? 'border-cyber-red scale-75 bg-cyber-red/5' 
              : 'border-white/20'
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
      {/* Dynamic Cursor Dot */}
      <div
        id="custom-cursor-dot"
        className={`fixed top-0 left-0 w-1.5 h-1.5 rounded-full pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 hidden md:block transition-all duration-75 ${
          linkHovered 
            ? 'bg-cyber-blue scale-125' 
            : clicked 
              ? 'bg-cyber-red scale-150' 
              : 'bg-white'
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
    </>
  );
}
