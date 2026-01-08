import { toPng } from 'html-to-image';

// Helper to create a fallback image if rasterization completely dies
const createErrorImage = (width: number, height: number, message: string): HTMLImageElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#ff0050';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Erreur de rendu', width / 2, height / 2 - 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.fillText(message, width / 2, height / 2 + 20);
  }
  const img = new Image();
  img.src = canvas.toDataURL();
  return img;
};

// Utility to snapshot a DOM element into an Image object
export const rasterizeElement = async (element: HTMLElement, width: number, height: number): Promise<HTMLImageElement> => {
  
  // 1. Get computed styles to ensure we capture the background even if styles fail to load
  let bgColor = '#000000';
  try {
     const computed = window.getComputedStyle(element);
     if (computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        bgColor = computed.backgroundColor;
     }
     // If the element has a gradient class but no bg color computed (common in Tailwind), 
     // we rely on html-to-image capturing the class styles. 
     // But we set a fallback just in case.
  } catch(e) { /* ignore */ }

  const baseOptions = {
    quality: 0.95,
    width: 360, 
    height: 640,
    pixelRatio: 3, // 360 * 3 = 1080
    cacheBust: true,
    backgroundColor: bgColor, // Force background color
    style: {
      transform: 'none', 
      margin: '0',
      width: '360px',  
      height: '640px',
      display: 'flex', 
      flexDirection: 'column'
    },
    filter: (node: any) => {
       return !node.classList?.contains('webcam-overlay');
    }
  };

  const createImage = (dataUrl: string): Promise<HTMLImageElement> => {
     return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = dataUrl;
    });
  };

  try {
    // Attempt 1: Full fidelity
    const dataUrl = await toPng(element, baseOptions);
    return await createImage(dataUrl);
  } catch (error: any) {
    console.warn("Rasterization full fidelity failed, retrying without fonts...", error);
    
    try {
      // Attempt 2: Skip fonts (fixes CORS issues with remote stylesheets)
      // We also clear styling transforms to be safe
      const fallbackOptions = { 
          ...baseOptions, 
          skipFonts: true,
          fontEmbedCSS: '' // Ensure no font CSS is injected
      };
      
      const dataUrl = await toPng(element, fallbackOptions as any);
      return await createImage(dataUrl);
    } catch (retryError: any) {
      console.error("Rasterization failed completely", retryError);
      // Return a generated error image instead of throwing, so the recording continues
      return createErrorImage(width, height, "Impossible de capturer la slide");
    }
  }
};