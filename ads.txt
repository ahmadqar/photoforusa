let detectorPromise = null;

async function loadDetector() {
  if (detectorPromise) return detectorPromise;
  detectorPromise = (async () => {
    try {
      const vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm');
      const filesetResolver = await vision.FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
      );
      return vision.FaceDetector.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite'
        },
        runningMode: 'IMAGE'
      });
    } catch (error) {
      console.warn('Falling back to manual crop because face detector could not load.', error);
      return null;
    }
  })();
  return detectorPromise;
}

function drawImageToCanvas(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export async function detectFace(image) {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const detector = await loadDetector();
  const base = {
    sourceWidth: width,
    sourceHeight: height
  };

  if (!detector) {
    return fallbackAnalysis(width, height, base);
  }

  try {
    const canvas = drawImageToCanvas(image);
    const result = detector.detect(canvas);
    const detection = result?.detections?.[0];
    if (!detection?.boundingBox) {
      return fallbackAnalysis(width, height, base, 'No face was detected. A centered crop was suggested instead.');
    }
    const box = detection.boundingBox;
    const faceCenterX = box.originX + box.width / 2;
    const faceCenterY = box.originY + box.height / 2;
    const headRatioTarget = 0.6;
    const cropSize = Math.max(
      box.height / headRatioTarget,
      box.width / 0.5,
      Math.min(width, height) * 0.72
    );
    const safeCrop = Math.min(Math.max(cropSize, Math.min(width, height) * 0.45), Math.min(width, height));
    let cropX = faceCenterX - safeCrop / 2;
    let cropY = faceCenterY - safeCrop * 0.42;
    cropX = clamp(cropX, 0, width - safeCrop);
    cropY = clamp(cropY, 0, height - safeCrop);

    const leftEye = detection.keypoints?.[0];
    const rightEye = detection.keypoints?.[1];
    const eyeTilt = leftEye && rightEye
      ? Math.atan2((rightEye.y - leftEye.y), (rightEye.x - leftEye.x)) * (180 / Math.PI)
      : 0;
    const headRatio = box.height / safeCrop;

    return {
      message: 'Face detected successfully.',
      crop: { x: cropX, y: cropY, size: safeCrop },
      diagnostics: {
        width,
        height,
        headRatio,
        eyeTilt,
        faceWidth: box.width,
        faceHeight: box.height
      }
    };
  } catch (error) {
    console.warn(error);
    return fallbackAnalysis(width, height, base, 'Face analysis failed. A centered crop was suggested.');
  }
}

function fallbackAnalysis(width, height, base, message = 'Face detection is unavailable. A centered crop was suggested.') {
  const size = Math.min(width, height);
  return {
    message,
    crop: {
      x: Math.max(0, (width - size) / 2),
      y: Math.max(0, (height - size) / 2),
      size
    },
    diagnostics: {
      width,
      height,
      headRatio: 0,
      eyeTilt: 0,
      faceWidth: 0,
      faceHeight: 0,
      ...base
    }
  };
}

export function buildComplianceChecks(analysis, image, file) {
  const items = [];
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const fileSize = file?.size || 0;
  const headRatio = analysis?.diagnostics?.headRatio || 0;
  const eyeTilt = Math.abs(analysis?.diagnostics?.eyeTilt || 0);

  items.push({
    state: sourceWidth >= 600 && sourceHeight >= 600 ? 'pass' : 'warn',
    label: sourceWidth >= 600 && sourceHeight >= 600
      ? `Source image is at least 600 px on both sides (${sourceWidth}×${sourceHeight}).`
      : `Source image is smaller than ideal (${sourceWidth}×${sourceHeight}); export quality may be limited.`
  });

  items.push({
    state: fileSize <= 8 * 1024 * 1024 ? 'pass' : 'warn',
    label: fileSize <= 8 * 1024 * 1024
      ? 'Uploaded file size is suitable for browser processing.'
      : 'Uploaded file is large; browser processing may be slower.'
  });

  items.push({
    state: headRatio >= 0.5 && headRatio <= 0.69 ? 'pass' : (headRatio === 0 ? 'warn' : 'warn'),
    label: headRatio
      ? `Estimated head height in crop is ${(headRatio * 100).toFixed(1)}%. Target guidance is roughly 50%–69%.`
      : 'Head height could not be estimated. Manual review is recommended.'
  });

  items.push({
    state: eyeTilt <= 8 ? 'pass' : 'warn',
    label: eyeTilt <= 8
      ? `Face alignment looks reasonably straight (tilt ${eyeTilt.toFixed(1)}°).`
      : `The face may be tilted (${eyeTilt.toFixed(1)}°). Consider a straighter photo.`
  });

  items.push({
    state: 'warn',
    label: 'Background color, shadows, glasses glare, and exact acceptance still require manual review.'
  });

  return items;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
