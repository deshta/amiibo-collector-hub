import { useState, useRef, useCallback, useEffect } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
}

export function ImageZoom({ src, alt, className, onError }: ImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialDistance, setInitialDistance] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState(1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const MIN_SCALE = 1;
  const MAX_SCALE = 5;

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleClose = useCallback(() => {
    setIsZoomed(false);
    resetZoom();
  }, [resetZoom]);

  // Handle escape key
  useEffect(() => {
    if (!isZoomed) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed, handleClose]);

  // Handle wheel zoom on desktop
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.3 : 0.3;
    setScale(prev => Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta)));
  }, []);

  // Get distance between two touch points
  const getDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Touch start - for pinch zoom and drag
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      setInitialDistance(getDistance(e.touches));
      setInitialScale(scale);
    } else if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  }, [scale, position]);

  // Touch move - for pinch zoom and drag
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistance !== null) {
      e.preventDefault();
      const currentDistance = getDistance(e.touches);
      const scaleDelta = currentDistance / initialDistance;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, initialScale * scaleDelta));
      setScale(newScale);
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      e.preventDefault();
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  }, [initialDistance, initialScale, isDragging, dragStart, scale]);

  // Touch end
  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setInitialDistance(null);
    if (scale <= 1) {
      resetZoom();
    }
  }, [scale, resetZoom]);

  // Mouse drag for desktop
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  }, [scale, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart, scale]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Click on thumbnail to open zoom
  const handleImageClick = () => {
    setIsZoomed(true);
  };

  const zoomIn = () => {
    setScale(prev => Math.min(MAX_SCALE, prev + 0.5));
  };

  const zoomOut = () => {
    const newScale = Math.max(MIN_SCALE, scale - 0.5);
    setScale(newScale);
    if (newScale <= 1) {
      resetZoom();
    }
  };

  return (
    <>
      {/* Thumbnail */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn("cursor-zoom-in", className)}
        onClick={handleImageClick}
        onError={onError}
      />

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          {/* Controls */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={zoomOut}
              disabled={scale <= MIN_SCALE}
              className="rounded-full bg-background/80 backdrop-blur-sm"
            >
              <ZoomOut className="w-5 h-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={zoomIn}
              disabled={scale >= MAX_SCALE}
              className="rounded-full bg-background/80 backdrop-blur-sm"
            >
              <ZoomIn className="w-5 h-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={handleClose}
              className="rounded-full bg-background/80 backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Scale indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm text-sm">
            {Math.round(scale * 100)}%
          </div>

          {/* Zoomable image container */}
          <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center overflow-hidden touch-none"
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={src}
              alt={alt}
              className="max-w-[90vw] max-h-[90vh] object-contain select-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              }}
              draggable={false}
            />
          </div>
        </div>
      )}
    </>
  );
}
