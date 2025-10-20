import React, { useState, useRef, useEffect, MouseEvent, WheelEvent } from 'react';
import { CloseIcon, ZoomInIcon, ZoomOutIcon, ResetZoomIcon } from './Icons';

interface ImagePreviewModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 4;
  const ZOOM_SENSITIVITY = 0.005;

  const handleZoom = (direction: 'in' | 'out', amount: number = 0.2) => {
    setScale(prevScale => {
      const newScale = direction === 'in' ? prevScale + amount : prevScale - amount;
      return Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
    });
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };
  
  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const newScale = scale - e.deltaY * ZOOM_SENSITIVITY;
    setScale(Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale)));
  };

  const handleMouseDown = (e: MouseEvent<HTMLImageElement>) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsPanning(true);
    lastMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };
  
  const handleMouseLeave = () => {
    setIsPanning(false);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    e.preventDefault();
    const dx = e.clientX - lastMousePosition.current.x;
    const dy = e.clientY - lastMousePosition.current.y;
    lastMousePosition.current = { x: e.clientX, y: e.clientY };
    setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 select-none animate-fade-in"
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
      >
        <img 
          src={imageUrl} 
          alt="Xem trước ảnh kết quả" 
          className="max-w-none max-h-none transition-transform duration-100 ease-out"
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            cursor: isPanning ? 'grabbing' : (scale > 1 ? 'grab' : 'default'),
          }}
          onMouseDown={handleMouseDown}
          draggable="false"
        />
      </div>
        
      {/* Controls */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-dark-surface backdrop-blur-md p-2 rounded-full shadow-lg border border-primary/20">
        <button onClick={() => handleZoom('out')} className="p-2 text-light-text hover:text-primary hover:shadow-glow-primary rounded-full transition-all" aria-label="Thu nhỏ">
          <ZoomOutIcon />
        </button>
        <button onClick={handleReset} className="p-2 text-light-text hover:text-primary hover:shadow-glow-primary rounded-full transition-all" aria-label="Khôi phục">
          <ResetZoomIcon />
        </button>
        <button onClick={() => handleZoom('in')} className="p-2 text-light-text hover:text-primary hover:shadow-glow-primary rounded-full transition-all" aria-label="Phóng to">
          <ZoomInIcon />
        </button>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-dark-surface text-light-text rounded-full p-2 hover:bg-secondary hover:text-dark-bg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-secondary hover:shadow-glow-secondary"
        aria-label="Đóng"
      >
        <CloseIcon />
      </button>
    </div>
  );
};

export default ImagePreviewModal;