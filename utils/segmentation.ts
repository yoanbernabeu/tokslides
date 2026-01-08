import { ImageSegmenter, FilesetResolver } from '@mediapipe/tasks-vision';

let imageSegmenter: ImageSegmenter | null = null;
let isInitializing = false;

const WASM_PATH = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const MODEL_PATH = 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite';

export async function initSegmenter(): Promise<boolean> {
  if (imageSegmenter) return true;
  if (isInitializing) return false;

  isInitializing = true;

  try {
    const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
    imageSegmenter = await ImageSegmenter.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_PATH,
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      outputCategoryMask: true,
      outputConfidenceMasks: false
    });
    isInitializing = false;
    return true;
  } catch (error) {
    console.error('Failed to initialize segmenter:', error);
    isInitializing = false;
    return false;
  }
}

export function isSegmenterReady(): boolean {
  return imageSegmenter !== null;
}

export function segmentFrame(
  video: HTMLVideoElement,
  timestamp: number
): ImageData | null {
  if (!imageSegmenter || video.readyState < 2) return null;

  try {
    const result = imageSegmenter.segmentForVideo(video, timestamp);

    if (!result.categoryMask) return null;

    const mask = result.categoryMask;
    const width = mask.width;
    const height = mask.height;
    const maskData = mask.getAsUint8Array();

    // Create ImageData with RGBA
    const imageData = new ImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < maskData.length; i++) {
      // Selfie segmenter category mask: 0 = person, 1 = background (inverted from what you'd expect)
      const categoryValue = maskData[i];
      const idx = i * 4;

      // If category = 0, it's a person -> set to 255 (white/keep)
      // If category > 0, it's background -> set to 0 (black/remove)
      const val = categoryValue === 0 ? 255 : 0;
      data[idx] = val;     // R
      data[idx + 1] = val; // G
      data[idx + 2] = val; // B
      data[idx + 3] = 255; // A (always opaque)
    }

    mask.close();
    return imageData;
  } catch (error) {
    console.error('Segmentation error:', error);
    return null;
  }
}

export function disposeSegmenter(): void {
  if (imageSegmenter) {
    imageSegmenter.close();
    imageSegmenter = null;
  }
}
