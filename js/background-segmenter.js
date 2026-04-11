const VISION_BUNDLE_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm';
const WASM_ROOT = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL_ASSET_PATH = 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite';

let segmenterPromise = null;

async function loadSegmenter() {
  if (segmenterPromise) return segmenterPromise;
  segmenterPromise = (async () => {
    try {
      const vision = await import(VISION_BUNDLE_URL);
      const fileset = await vision.FilesetResolver.forVisionTasks(WASM_ROOT);
      return await vision.ImageSegmenter.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: MODEL_ASSET_PATH,
          delegate: 'CPU'
        },
        runningMode: 'IMAGE',
        outputCategoryMask: true,
        outputConfidenceMasks: false
      });
    } catch (error) {
      console.warn('Background segmenter could not load.', error);
      throw new Error('Background remover could not load on this browser.');
    }
  })();
  return segmenterPromise;
}

function imageToCanvas(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function buildWhiteBackgroundBlob(sourceCanvas, maskArray) {
  const { width, height } = sourceCanvas;
  const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
  const source = sourceCtx.getImageData(0, 0, width, height);
  const pixels = source.data;

  for (let i = 0; i < maskArray.length; i += 1) {
    const isForeground = maskArray[i] > 0;
    if (isForeground) continue;
    const offset = i * 4;
    pixels[offset] = 255;
    pixels[offset + 1] = 255;
    pixels[offset + 2] = 255;
    pixels[offset + 3] = 255;
  }

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = width;
  outputCanvas.height = height;
  const outputCtx = outputCanvas.getContext('2d');
  outputCtx.fillStyle = '#ffffff';
  outputCtx.fillRect(0, 0, width, height);
  outputCtx.putImageData(source, 0, 0);

  return new Promise((resolve, reject) => {
    outputCanvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Could not build the background-free image.'));
      resolve(blob);
    }, 'image/png');
  });
}

export async function removeBackgroundLocally(image) {
  const segmenter = await loadSegmenter();
  const canvas = imageToCanvas(image);
  const result = await segmenter.segment(canvas);
  const mask = result?.categoryMask?.getAsUint8Array?.();
  if (!mask?.length) {
    throw new Error('Person segmentation failed for this image. Try a clearer portrait with one face.');
  }
  return buildWhiteBackgroundBlob(canvas, mask);
}
