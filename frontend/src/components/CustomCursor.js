import React, { useEffect, useRef, useState } from 'react';

const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const mousePos = useRef({ x: -200, y: -200 });
  const ringPos = useRef({ x: -200, y: -200 });

  useEffect(() => {
    let animFrame;

    const onMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    const handleEnter = () => setIsHovering(true);
    const handleLeave = () => setIsHovering(false);

    const addListeners = () => {
      document.querySelectorAll('a, button, select, input, label').forEach(el => {
        el.addEventListener('mouseenter', handleEnter);
        el.addEventListener('mouseleave', handleLeave);
      });
    };
    addListeners();

    const animate = () => {
      const { x: mx, y: my } = mousePos.current;
      if (dotRef.current) {
        dotRef.current.style.left = `${mx}px`;
        dotRef.current.style.top = `${my}px`;
      }
      ringPos.current.x += (mx - ringPos.current.x) * 0.10;
      ringPos.current.y += (my - ringPos.current.y) * 0.10;
      if (ringRef.current) {
        ringRef.current.style.left = `${ringPos.current.x}px`;
        ringRef.current.style.top = `${ringPos.current.y}px`;
      }
      animFrame = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    animFrame = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  const dotSize = isClicking ? 6 : 8;
  const ringSize = isHovering ? 44 : isClicking ? 22 : 32;

  return (
    <>
      {/* Inner dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          transform: 'translate(-50%, -50%)',
          background: '#f97316',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'left, top',
          transition: 'width 0.1s, height 0.1s',
          boxShadow: '0 0 10px rgba(249,115,22,0.9), 0 0 20px rgba(249,115,22,0.5)',
        }}
      />
      {/* Outer ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          width: `${ringSize}px`,
          height: `${ringSize}px`,
          transform: 'translate(-50%, -50%)',
          border: `1.5px solid ${isHovering ? 'rgba(249,115,22,0.85)' : 'rgba(249,115,22,0.45)'}`,
          background: isHovering ? 'rgba(249,115,22,0.07)' : 'transparent',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99998,
          willChange: 'left, top',
          transition: 'width 0.25s cubic-bezier(0.25,1,0.5,1), height 0.25s cubic-bezier(0.25,1,0.5,1), border-color 0.2s, background 0.2s',
        }}
      />
    </>
  );
};

export default CustomCursor;
