import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Theme, SlideData, Coordinates, CameraShape } from '../types';
import { getImageFromDB } from '../utils/storage';

interface PreviewProps {
  currentSlide: SlideData;
  theme: Theme;
  totalSlides: number;
  currentIndex: number;
  isFullScreen?: boolean;
  cameraStream: MediaStream | null;
  cameraPosition: Coordinates;
  onCameraPositionChange: (pos: Coordinates) => void;
  cameraScale: number;
  onCameraScaleChange: (scale: number) => void;
  cameraShape: CameraShape;
  captureRef?: React.RefObject<HTMLDivElement | null>;
  showFooter?: boolean;
  onImageResize?: (src: string, newWidth: number) => void;
}

const BASE_WIDTH = 360;
const BASE_HEIGHT = 640;

// Cache for data URLs to be reusable and work with rasterization
const dataUrlCache = new Map<string, string>();

// Helper to convert blob to data URL
const blobToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Resizable Image Component - memoized to prevent flickering on parent re-renders
const ResizableImage = React.memo(({
  src,
  alt,
  title,
  onResize,
  previewScale = 1
}: {
  src?: string;
  alt?: string;
  title?: string;
  onResize?: (src: string, newWidth: number) => void;
  previewScale?: number;
}) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(280);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLSpanElement>(null);
  const dragStartRef = useRef<{ x: number; width: number } | null>(null);

  // Parse width from title (format: "280")
  const titleWidth = title ? parseInt(title, 10) || 280 : 280;

  // Sync currentWidth with title when not dragging
  useEffect(() => {
    if (!isDragging) {
      setCurrentWidth(titleWidth);
    }
  }, [titleWidth, isDragging]);

  const width = isDragging ? currentWidth : titleWidth;

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!src) return;

      if (src.startsWith('local://')) {
        // Check cache first
        if (dataUrlCache.has(src)) {
          if (active) setDataUrl(dataUrlCache.get(src)!);
          return;
        }

        const id = src.replace('local://', '');
        try {
          const blob = await getImageFromDB(id);
          if (blob && active) {
            // Convert to data URL for rasterization compatibility
            const url = await blobToDataUrl(blob);
            dataUrlCache.set(src, url); // Cache it
            setDataUrl(url);
          } else if (active) {
            setError(true);
          }
        } catch (e) {
          if (active) setError(true);
        }
      } else {
        if (active) setDataUrl(src);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [src]);

  // Get natural dimensions when image loads
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
  };

  // Ref to track final width during drag (to avoid stale closures)
  const finalWidthRef = useRef(currentWidth);
  finalWidthRef.current = currentWidth;

  // Handle corner drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current || !src) return;

      // Account for the preview scale - deltaX needs to be divided by scale
      const deltaX = (e.clientX - dragStartRef.current.x) / previewScale;
      const newWidth = Math.max(50, Math.min(320, dragStartRef.current.width + deltaX));
      const roundedWidth = Math.round(newWidth);

      // Update local state for immediate visual feedback
      setCurrentWidth(roundedWidth);
      finalWidthRef.current = roundedWidth;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;

      // Only update markdown on mouse up to avoid constant re-renders
      if (onResize && src) {
        onResize(src, finalWidthRef.current);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, src, onResize, previewScale]);

  // Click outside to deselect
  useEffect(() => {
    if (!isSelected) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsSelected(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSelected]);

  const handleCornerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, width };
  };

  if (error) {
    return (
      <span className="inline-flex w-full h-20 bg-red-900/20 border border-red-500/50 rounded-xl items-center justify-center text-xs text-red-400">
        Image introuvable
      </span>
    );
  }

  if (!dataUrl) {
    return (
      <span className="inline-flex w-full h-40 bg-gray-800/50 animate-pulse rounded-xl items-center justify-center text-xs text-gray-500">
        Chargement...
      </span>
    );
  }

  // Calculate height based on aspect ratio
  const aspectRatio = naturalSize.width > 0 ? naturalSize.height / naturalSize.width : 1;
  const displayHeight = width * aspectRatio;

  return (
    <span
      ref={containerRef}
      className={`relative inline-block my-2 ${isSelected ? 'z-20' : ''}`}
      style={{ width, height: displayHeight || 'auto' }}
      onClick={(e) => {
        e.stopPropagation();
        setIsSelected(true);
      }}
    >
      <img
        src={dataUrl}
        alt={alt}
        onLoad={handleImageLoad}
        className={`rounded-xl object-cover shadow-lg cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
        style={{ width: '100%', height: '100%' }}
        draggable={false}
      />

      {/* Resize handles - only show when selected */}
      {isSelected && onResize && (
        <>
          {/* Corner handles */}
          <span
            onMouseDown={handleCornerMouseDown}
            className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-sm cursor-nwse-resize hover:bg-blue-100 shadow-md z-30 inline-block"
          />
          <span
            onMouseDown={handleCornerMouseDown}
            className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-sm cursor-nesw-resize hover:bg-blue-100 shadow-md z-30 inline-block"
          />

          {/* Size indicator */}
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded font-mono whitespace-nowrap inline-block">
            {width}px
          </span>
        </>
      )}
    </span>
  );
});

const Preview: React.FC<PreviewProps> = ({
  currentSlide,
  theme,
  totalSlides,
  currentIndex,
  isFullScreen = false,
  cameraStream,
  cameraPosition,
  onCameraPositionChange,
  cameraScale,
  onCameraScaleChange,
  cameraShape,
  captureRef,
  showFooter = true,
  onImageResize
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraOverlayRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{x: number, y: number} | null>(null);

  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();

      const scaleX = width / BASE_WIDTH;
      const scaleY = height / BASE_HEIGHT;
      const marginFactor = isFullScreen ? 1 : 0.98;
      const newScale = Math.min(scaleX, scaleY) * marginFactor;
      setScale(newScale);
    };

    calculateScale();

    const observer = new ResizeObserver(calculateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isFullScreen]);

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  // Non-passive wheel event for camera zoom (to allow preventDefault)
  useEffect(() => {
    const overlay = cameraOverlayRef.current;
    if (!overlay || !cameraStream) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY * -0.001;
      const newScale = Math.max(0.5, Math.min(3.0, cameraScale + delta));
      onCameraScaleChange(newScale);
    };

    overlay.addEventListener('wheel', handleWheel, { passive: false });
    return () => overlay.removeEventListener('wheel', handleWheel);
  }, [cameraScale, onCameraScaleChange, cameraStream]);

  const getShapeStyles = () => {
    const base = "overflow-hidden border-4 border-white/20 shadow-xl relative ring-2 ring-black/10 transition-all duration-100";
    switch (cameraShape) {
      case 'circle': return `${base} w-32 h-32 rounded-full`;
      case 'square': return `${base} w-32 h-32 rounded-none`;
      case 'rounded': return `${base} w-32 h-32 rounded-2xl`;
      case 'portrait': return `${base} w-24 h-40 rounded-xl`;
      case 'landscape': return `${base} w-40 h-24 rounded-xl`;
      default: return `${base} w-32 h-32 rounded-full`;
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!cameraStream) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging && dragStartRef.current) {
      e.preventDefault();
      const renderedWidth = BASE_WIDTH * scale;
      const renderedHeight = BASE_HEIGHT * scale;

      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      const percentDeltaX = (deltaX / renderedWidth) * 100;
      const percentDeltaY = (deltaY / renderedHeight) * 100;

      let newX = Math.max(0, Math.min(100, cameraPosition.x + percentDeltaX));
      let newY = Math.max(0, Math.min(100, cameraPosition.y + percentDeltaY));

      onCameraPositionChange({ x: newX, y: newY });
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    dragStartRef.current = null;
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  const getLayoutClasses = () => {
    switch(currentSlide.layout) {
      case 'center': return 'justify-center items-center text-center';
      case 'top': return 'justify-start items-center text-center pt-10';
      case 'bottom': return 'justify-end items-center text-center pb-10';
      case 'left': return 'justify-center items-start text-left';
      case 'right': return 'justify-center items-end text-right';
      case 'top-left': return 'justify-start items-start text-left pt-10';
      case 'top-right': return 'justify-start items-end text-right pt-10';
      case 'bottom-left': return 'justify-end items-start text-left pb-10';
      case 'bottom-right': return 'justify-end items-end text-right pb-10';
      default: return 'justify-center items-center text-center';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`h-full w-full flex items-center justify-center bg-[#0F0F0F] overflow-hidden relative select-none`}
    >
      <div className={`absolute inset-0 opacity-20 blur-3xl ${theme.bgGradient} transition-all duration-700`} />

      <div
        style={{
          width: BASE_WIDTH,
          height: BASE_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
        className="relative transition-transform duration-100 ease-out overflow-visible"
      >
        <div
          className={`
          w-full h-full relative flex flex-col overflow-hidden bg-black
          ${!isFullScreen ? 'rounded-[30px] shadow-2xl ring-4 ring-gray-800' : ''}
          `}
        >

          {cameraStream && (
            <div
              ref={cameraOverlayRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{
                left: `${cameraPosition.x}%`,
                top: `${cameraPosition.y}%`,
                transform: `translate(-50%, -50%) scale(${cameraScale})`,
                cursor: isDragging ? 'grabbing' : 'grab',
                touchAction: 'none'
              }}
              className={`absolute z-30 group origin-center`}
            >
              <div className={getShapeStyles()}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1] pointer-events-none"
                />
              </div>
              {/* Tooltip hint on hover */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                <div className="bg-black/90 text-white text-[9px] px-2 py-1 rounded-md border border-white/10 shadow-lg">
                  Glisser pour déplacer • Scroll pour zoomer
                </div>
              </div>
            </div>
          )}

          <div
            ref={captureRef}
            className={`slide-content flex-1 w-full h-full p-6 flex flex-col relative z-10 ${theme.bgGradient} ${theme.textColor} ${theme.fontFamily} transition-colors duration-500 overflow-hidden min-w-0`}
          >

            <div className={`flex-1 flex flex-col ${getLayoutClasses()} w-full h-full min-w-0`}>
              <div className={`prose prose-invert prose-p:leading-snug prose-headings:font-bold prose-li:my-0 prose-ul:my-1 prose-ol:my-1 prose-li:marker:${theme.accentColor.replace('text-', '')} max-w-none w-full break-words whitespace-pre-wrap min-w-0 leading-snug`}>
                <ReactMarkdown
                  urlTransform={(url) => url}
                  components={{
                    h1: ({node, ...props}) => <h1 className={`text-4xl mb-2 ${theme.headingColor}`} {...props} />,
                    h2: ({node, ...props}) => <h2 className={`text-2xl mb-2 ${theme.headingColor}`} {...props} />,
                    h3: ({node, ...props}) => <h3 className={`text-xl mb-1 ${theme.headingColor}`} {...props} />,
                    p: ({node, ...props}) => <p className={`mb-2 text-lg opacity-90 break-words w-full leading-snug`} {...props} />,
                    ul: ({node, ...props}) => <ul className={`!list-disc !mb-2 !mt-0 ${currentSlide.layout.includes('left') ? 'pl-5' : 'list-inside'} w-full`} {...props} />,
                    ol: ({node, ...props}) => <ol className={`!list-decimal !mb-2 !mt-0 ${currentSlide.layout.includes('left') ? 'pl-5' : 'list-inside'} w-full`} {...props} />,
                    li: ({node, ...props}) => <li className="!my-0 !py-0 pl-1 break-words w-full leading-tight [&>p]:!m-0 [&>p]:inline" {...props} />,
                    blockquote: ({node, ...props}) => (
                      <blockquote className={`border-l-4 pl-4 py-2 my-6 italic opacity-80 ${theme.accentColor.replace('text-', 'border-')}`} {...props} />
                    ),
                    code: ({node, inline, className, children, ...props}: any) => {
                      return !inline ? (
                        <div className={`p-3 rounded-lg my-4 text-sm overflow-x-auto ${theme.codeBg} border border-white/10 shadow-inner text-left max-w-full`}>
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </div>
                      ) : (
                        <code className={`px-1.5 py-0.5 rounded text-sm ${theme.codeBg} ${theme.accentColor}`} {...props}>
                          {children}
                        </code>
                      )
                    },
                    img: ({node, src, alt, title, ...props}) => (
                      <ResizableImage
                        src={src}
                        alt={alt}
                        title={title}
                        onResize={onImageResize}
                        previewScale={scale}
                      />
                    )
                  }}
                >
                  {currentSlide.content}
                </ReactMarkdown>
              </div>
            </div>

            {showFooter && (
              <div className="mt-auto pt-6 flex justify-between items-center opacity-50 text-xs shrink-0 w-full animate-fade-in">
                <span className="font-mono">TokSlides</span>
                <span className="font-mono">{currentIndex + 1} / {totalSlides}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;
