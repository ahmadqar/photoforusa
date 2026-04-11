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

function isForegroundValue(value) {
  return value > 0;
}

function shouldInvertMask(maskArray, width, height) {
  const borderThickness = Math.max(4, Math.floor(Math.min(width, height) * 0.04));
  let borderCount = 0;
  let borderForegroundCount = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const isBorder = x < borderThickness || y < borderThickness || x >= width - borderThickness || y >= height - borderThickness;
      if (!isBorder) continue;
      borderCount += 1;
      if (isForegroundValue(maskArray[y * width + x])) borderForegroundCount += 1;
    }
  }

  if (!borderCount) return false;
  const borderForegroundRatio = borderForegroundCount / borderCount;
  return borderForegroundRatio > 0.5;
}

function buildWhiteBackgroundBlob(sourceCanvas, maskArray) {
  const { width, height } = sourceCanvas;
  const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
  const source = sourceCtx.getImageData(0, 0, width, height);
  const pixels = source.data;
  const invertMask = shouldInvertMask(maskArray, width, height);

  for (let i = 0; i < maskArray.length; i += 1) {
    const foreground = isForegroundValue(maskArray[i]);
    const keepPerson = invertMask ? !foreground : foreground;
    if (keepPerson) continue;
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
