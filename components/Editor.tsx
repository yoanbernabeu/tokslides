import React, { useRef, useState, useEffect } from 'react';
import { X, Check, Crop, ImageIcon } from 'lucide-react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onUploadImage: (file: File) => Promise<string>;
}

interface PendingImage {
  file: File;
  url: string;
  naturalWidth: number;
  naturalHeight: number;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const Editor: React.FC<EditorProps> = ({ value, onChange, onUploadImage }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);

  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState<number>(0);

  useEffect(() => {
    return () => {
      if (pendingImage?.url) {
        URL.revokeObjectURL(pendingImage.url);
      }
    };
  }, [pendingImage]);

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();

          if (textareaRef.current) {
            setCursorPosition(textareaRef.current.selectionStart);
          }

          const url = URL.createObjectURL(file);
          const img = new Image();
          img.onload = () => {
            setPendingImage({
              file,
              url,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight
            });
            setCropArea({ x: 0, y: 0, width: 100, height: 100 });
          };
          img.src = url;
          return;
        }
      }
    }
  };

  const handleCropMouseDown = (e: React.MouseEvent) => {
    if (!cropContainerRef.current) return;
    setIsDragging(true);
    const rect = cropContainerRef.current.getBoundingClientRect();
    setDragStart({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    });
  };

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !cropContainerRef.current) return;
    const rect = cropContainerRef.current.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;

    const x = Math.max(0, Math.min(dragStart.x, currentX));
    const y = Math.max(0, Math.min(dragStart.y, currentY));
    const width = Math.min(100 - x, Math.abs(currentX - dragStart.x));
    const height = Math.min(100 - y, Math.abs(currentY - dragStart.y));

    setCropArea({ x, y, width, height });
  };

  const handleCropMouseUp = () => {
    setIsDragging(false);
  };

  const resetCrop = () => {
    setCropArea({ x: 0, y: 0, width: 100, height: 100 });
  };

  const processAndInsertImage = async () => {
    if (!pendingImage || !canvasRef.current) return;

    const img = new Image();
    img.src = pendingImage.url;
    await new Promise(resolve => { img.onload = resolve; });

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate crop in pixels
    const cropX = (cropArea.x / 100) * img.naturalWidth;
    const cropY = (cropArea.y / 100) * img.naturalHeight;
    const cropW = (cropArea.width / 100) * img.naturalWidth;
    const cropH = (cropArea.height / 100) * img.naturalHeight;

    canvas.width = cropW;
    canvas.height = cropH;
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, 'image/png', 0.9)
    );

    if (!blob) return;

    const file = new File([blob], 'image.png', { type: 'image/png' });

    try {
      const imageId = await onUploadImage(file);
      // Insert with default width stored in title (can be resized later in preview)
      const insertText = `\n![image](local://${imageId} "280")\n`;

      const textarea = textareaRef.current;
      if (textarea) {
        const text = textarea.value;
        const newText = text.substring(0, cursorPosition) + insertText + text.substring(cursorPosition);
        onChange(newText);
      }
    } catch (err) {
      console.error("Erreur upload image", err);
    }

    URL.revokeObjectURL(pendingImage.url);
    setPendingImage(null);
  };

  const cancelImage = () => {
    if (pendingImage?.url) {
      URL.revokeObjectURL(pendingImage.url);
    }
    setPendingImage(null);
  };

  const getPreviewDimensions = () => {
    if (!pendingImage) return { width: 400, height: 300 };
    const maxSize = 400;
    const ratio = pendingImage.naturalWidth / pendingImage.naturalHeight;
    if (ratio > 1) {
      return { width: maxSize, height: maxSize / ratio };
    }
    return { width: maxSize * ratio, height: maxSize };
  };

  const previewDims = getPreviewDimensions();

  // Calculate cropped dimensions
  const getCroppedDimensions = () => {
    if (!pendingImage) return { width: 0, height: 0 };
    return {
      width: Math.round((cropArea.width / 100) * pendingImage.naturalWidth),
      height: Math.round((cropArea.height / 100) * pendingImage.naturalHeight)
    };
  };

  const croppedDims = getCroppedDimensions();

  return (
    <div className="h-full w-full flex flex-col bg-[#1E1E1E]">
      <canvas ref={canvasRef} className="hidden" />

      {/* Crop Modal */}
      {pendingImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-[#1E1E1E] rounded-t-2xl md:rounded-2xl border border-gray-700 shadow-2xl w-full md:max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-[#181818]">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-blue-400" />
                <span className="font-semibold text-white">Recadrer l'image</span>
              </div>
              <button onClick={cancelImage} className="p-1 hover:bg-gray-700 rounded">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="p-4 overflow-auto flex-1">
              <div
                ref={cropContainerRef}
                className="relative mx-auto bg-gray-900 rounded-lg overflow-hidden cursor-crosshair select-none"
                style={{ width: Math.min(previewDims.width, window.innerWidth - 32), height: Math.min(previewDims.height, (window.innerWidth - 32) * previewDims.height / previewDims.width) }}
                onMouseDown={handleCropMouseDown}
                onMouseMove={handleCropMouseMove}
                onMouseUp={handleCropMouseUp}
                onMouseLeave={handleCropMouseUp}
              >
                <img
                  src={pendingImage.url}
                  alt="Preview"
                  className="w-full h-full object-contain pointer-events-none"
                  draggable={false}
                />
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute bg-black/60" style={{ top: 0, left: 0, right: 0, height: `${cropArea.y}%` }} />
                  <div className="absolute bg-black/60" style={{ top: `${cropArea.y + cropArea.height}%`, left: 0, right: 0, bottom: 0 }} />
                  <div className="absolute bg-black/60" style={{ top: `${cropArea.y}%`, left: 0, width: `${cropArea.x}%`, height: `${cropArea.height}%` }} />
                  <div className="absolute bg-black/60" style={{ top: `${cropArea.y}%`, left: `${cropArea.x + cropArea.width}%`, right: 0, height: `${cropArea.height}%` }} />
                  <div
                    className="absolute border-2 border-white/80 border-dashed"
                    style={{
                      top: `${cropArea.y}%`,
                      left: `${cropArea.x}%`,
                      width: `${cropArea.width}%`,
                      height: `${cropArea.height}%`
                    }}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>Dessinez pour recadrer</span>
                <span className="font-mono">{croppedDims.width}×{croppedDims.height}px</span>
              </div>
            </div>

            <div className="px-4 pb-4">
              <button
                onClick={resetCrop}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
              >
                <Crop size={14} />
                Réinitialiser
              </button>
            </div>

            <div className="flex gap-2 p-4 border-t border-gray-700 bg-[#181818]">
              <button
                onClick={cancelImage}
                className="flex-1 px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={processAndInsertImage}
                className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Check size={16} />
                Insérer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-[#181818]">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Markdown Source</span>
        <div className="flex gap-2 text-xs text-gray-500">
          <span>--- pour nouvelle slide</span>
        </div>
      </div>
      <div className="hidden md:flex px-4 py-2 border-b border-gray-700/50 bg-[#161616] flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-500 font-mono">
        <span><span className="text-gray-400"># </span>Titre</span>
        <span><span className="text-gray-400">## </span>Sous-titre</span>
        <span><span className="text-gray-400">**</span>gras<span className="text-gray-400">**</span></span>
        <span><span className="text-gray-400">*</span>italique<span className="text-gray-400">*</span></span>
        <span><span className="text-gray-400">- </span>liste</span>
        <span><span className="text-gray-400">1. </span>num.</span>
        <span><span className="text-gray-400">`</span>code<span className="text-gray-400">`</span></span>
        <span><span className="text-gray-400">&gt; </span>citation</span>
        <span className="text-blue-400">Ctrl+V image (crop + resize)</span>
      </div>
      <textarea
        ref={textareaRef}
        className="flex-1 w-full h-full p-6 bg-[#1E1E1E] text-gray-300 font-mono text-sm resize-none focus:outline-none focus:ring-0 leading-relaxed"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        spellCheck={false}
        placeholder="# Commencez à écrire vos slides ici... ou collez une image (Ctrl+V) !"
      />
    </div>
  );
};

export default Editor;
