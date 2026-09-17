// frontend/src/components/SmileGallery/BeforeAfterSlider.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Interactive Before / After Dental Comparison Slider
// Pure React + CSS: Drag to reveal clinical transformation smoothly
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef, useCallback, useEffect } from 'react';

const BeforeAfterSlider = ({
  beforeSrc,
  afterSrc,
  beforeAlt = 'Before dental procedure',
  afterAlt = 'After dental procedure',
  className = '',
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback(
    (clientX) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPos(position);
    },
    []
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-xl shadow-md group ${className}`}
      style={{
        aspectRatio: '4 / 3',
        backgroundColor: '#0f172a',
        cursor: 'ew-resize',
        touchAction: 'none',
      }}
      onMouseDown={(e) => {
        setIsDragging(true);
        handleMove(e.clientX);
      }}
      onTouchStart={(e) => {
        setIsDragging(true);
        handleMove(e.touches[0].clientX);
      }}
    >
      {/* ── AFTER Image (Base layer) ── */}
      <img
        src={afterSrc}
        alt={afterAlt}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* "AFTER" Badge */}
      <div
        className="absolute top-3 right-3 z-10 px-2.5 py-1 text-xs font-semibold text-white rounded-full pointer-events-none"
        style={{
          background: 'rgba(13, 148, 136, 0.85)',
          backdropFilter: 'blur(4px)',
        }}
      >
        AFTER
      </div>

      {/* ── BEFORE Image (Clipped layer) ── */}
      <div
        className="absolute inset-0 h-full overflow-hidden pointer-events-none"
        style={{ width: `${sliderPos}%` }}
      >
        <img
          src={beforeSrc}
          alt={beforeAlt}
          loading="lazy"
          className="absolute inset-0 h-full object-cover"
          style={{
            width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
            maxWidth: 'none',
          }}
        />

        {/* "BEFORE" Badge */}
        <div
          className="absolute top-3 left-3 z-10 px-2.5 py-1 text-xs font-semibold text-white rounded-full pointer-events-none"
          style={{
            background: 'rgba(30, 41, 59, 0.85)',
            backdropFilter: 'blur(4px)',
          }}
        >
          BEFORE
        </div>
      </div>

      {/* ── Vertical Divider Line ── */}
      <div
        className="absolute top-0 bottom-0 z-20 pointer-events-none"
        style={{
          left: `${sliderPos}%`,
          transform: 'translateX(-50%)',
          width: '2px',
          backgroundColor: '#ffffff',
          boxShadow: '0 0 8px rgba(0,0,0,0.5)',
        }}
      >
        {/* Circular Drag Handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center rounded-full bg-white text-slate-800 shadow-xl"
          style={{
            width: '36px',
            height: '36px',
            border: '2px solid #0d9488',
            left: '50%',
          }}
        >
          <svg
            className="w-4 h-4 text-teal-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M8 9l-4 3 4 3m8-6l4 3-4 3"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
