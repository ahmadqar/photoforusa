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
      const isBorder =
        x < borderThickness ||
        y < borderThickness ||
        x >= width - borderThickness ||
        y >= height - borderThickness;
      if (!isBorder) continue;
      borderCount += 1;
      if (isForegroundValue(maskArray[y * width + x])) borderForegroundCount += 1;
    }
  }

  if (!borderCount) return false;
  const borderForegroundRatio = borderForegroundCount / borderCount;
  return borderForegroundRatio > 0.5;
}

function buildBinaryMask(maskArray, width, height) {
  const invertMask = shouldInvertMask(maskArray, width, height);
  const binary = new Uint8Array(maskArray.length);

  for (let i = 0; i < maskArray.length; i += 1) {
    const foreground = isForegroundValue(maskArray[i]);
    const keepPerson = invertMask ? !foreground : foreground;
    binary[i] = keepPerson ? 1 : 0;
  }

  return binary;
}

function dilateMask(binary, width, height, radius) {
  const out = new Uint8Array(binary.length);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let found = 0;
      for (let dy = -radius; dy <= radius && !found; dy += 1) {
        const yy = y + dy;
        if (yy < 0 || yy >= height) continue;
        for (let dx = -radius; dx <= radius; dx += 1) {
          const xx = x + dx;
          if (xx < 0 || xx >= width) continue;
          if (binary[yy * width + xx]) {
            found = 1;
            break;
          }
        }
      }
      out[y * width + x] = found;
    }
  }

  return out;
}

function blurMask(binary, width, height, radius) {
  const out = new Float32Array(binary.length);
  const size = radius * 2 + 1;
  const area = size * size;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let sum = 0;
      for (let dy = -radius; dy <= radius; dy += 1) {
        const yy = Math.min(height - 1, Math.max(0, y + dy));
        for (let dx = -radius; dx <= radius; dx += 1) {
          const xx = Math.min(width - 1, Math.max(0, x + dx));
          sum += binary[yy * width + xx];
        }
      }
      out[y * width + x] = sum / area;
    }
  }

  return out;
}

function buildWhiteBackgroundBlob(sourceCanvas, maskArray) {
  const { width, height } = sourceCanvas;
  const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
  const source = sourceCtx.getImageData(0, 0, width, height);
  const pixels = source.data;

  const binary = buildBinaryMask(maskArray, width, height);
  const dilationRadius = Math.max(2, Math.round(Math.min(width, height) * 0.006));
  const featherRadius = Math.max(1, Math.round(Math.min(width, height) * 0.004));

  const dilated = dilateMask(binary, width, height, dilationRadius);
  const softMask = blurMask(dilated, width, height, featherRadius);

  for (let i = 0; i < softMask.length; i += 1) {
    const alpha = Math.min(1, Math.max(0, softMask[i]));
    const offset = i * 4;

    pixels[offset] = Math.round(pixels[offset] * alpha + 255 * (1 - alpha));
    pixels[offset + 1] = Math.round(pixels[offset + 1] * alpha + 255 * (1 - alpha));
    pixels[offset + 2] = Math.round(pixels[offset + 2] * alpha + 255 * (1 - alpha));
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

