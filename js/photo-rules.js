import { APP_CONFIG } from './config.js';
import { formatBytes } from './utils.js';

const EXPORT_WORK_SIZE = 1800; // أعلى من 600 للحفاظ على التفاصيل
const FINAL_SIZE = APP_CONFIG.exportSize;

function setHighQuality(ctx) {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
}

export function drawPreview({ canvas, sourceImage, crop, offsetX = 0, offsetY = 0, zoom = 1 }) {
  const ctx = canvas.getContext('2d');
  const size = FINAL_SIZE;

  canvas.width = size;
  canvas.height = size;

  setHighQuality(ctx);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  const cropSize = crop.size / zoom;
  const x = crop.x + crop.size * offsetX;
  const y = crop.y + crop.size * offsetY;

  ctx.drawImage(sourceImage, x, y, cropSize, cropSize, 0, 0, size, size);
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

function pick(locale, en, ar) {
  return locale === 'ar' ? ar : en;
}

function buildExportCanvas({ sourceImage, crop, offsetX = 0, offsetY = 0, zoom = 1 }) {
  const workCanvas = document.createElement('canvas');
  const workCtx = workCanvas.getContext('2d');

  workCanvas.width = EXPORT_WORK_SIZE;
  workCanvas.height = EXPORT_WORK_SIZE;

  setHighQuality(workCtx);
  workCtx.fillStyle = '#ffffff';
  workCtx.fillRect(0, 0, EXPORT_WORK_SIZE, EXPORT_WORK_SIZE);

  const cropSize = crop.size / zoom;
  const x = crop.x + crop.size * offsetX;
  const y = crop.y + crop.size * offsetY;

  workCtx.drawImage(
    sourceImage,
    x,
    y,
    cropSize,
    cropSize,
    0,
    0,
    EXPORT_WORK_SIZE,
    EXPORT_WORK_SIZE
  );

  return workCanvas;
}

function downscaleToFinal(workCanvas) {
  const finalCanvas = document.createElement('canvas');
  const finalCtx = finalCanvas.getContext('2d');

  finalCanvas.width = FINAL_SIZE;
  finalCanvas.height = FINAL_SIZE;

  setHighQuality(finalCtx);
  finalCtx.fillStyle = '#ffffff';
  finalCtx.fillRect(0, 0, FINAL_SIZE, FINAL_SIZE);

  finalCtx.drawImage(
    workCanvas,
    0,
    0,
    workCanvas.width,
    workCanvas.height,
    0,
    0,
    FINAL_SIZE,
    FINAL_SIZE
  );

  return finalCanvas;
}

export async function exportJpeg(
  {
    sourceImage,
    crop,
    offsetX = 0,
    offsetY = 0,
    zoom = 1
  },
  locale = 'en'
) {
  const workCanvas = buildExportCanvas({
    sourceImage,
    crop,
    offsetX,
    offsetY,
    zoom
  });

  const finalCanvas = downscaleToFinal(workCanvas);

  let quality = Math.max(APP_CONFIG.defaultQuality, 0.96);
  let blob = await canvasToBlob(finalCanvas, APP_CONFIG.exportMime, quality);

  while (blob && blob.size > APP_CONFIG.exportMaxBytes && quality > APP_CONFIG.minQuality) {
    quality = Number((quality - APP_CONFIG.qualityStep).toFixed(2));
    blob = await canvasToBlob(finalCanvas, APP_CONFIG.exportMime, quality);
  }

  const facts = [
    pick(locale, 'Format: JPEG', 'الصيغة: JPEG'),
    pick(locale, `Size: ${finalCanvas.width}×${finalCanvas.height} pixels`, `المقاس: ${finalCanvas.width}×${finalCanvas.height} بكسل`),
    pick(locale, `Export pipeline: ${EXPORT_WORK_SIZE}→${FINAL_SIZE}`, `مسار التصدير: ${EXPORT_WORK_SIZE}→${FINAL_SIZE}`),
    pick(locale, `Compression quality: ${quality}`, `جودة الضغط: ${quality}`),
    pick(locale, `Final file size: ${formatBytes(blob.size)}`, `حجم الملف النهائي: ${formatBytes(blob.size)}`)
  ];

  if (blob.size > APP_CONFIG.exportMaxBytes) {
    facts.push(
      pick(
        locale,
        `Warning: file size is still above ${formatBytes(APP_CONFIG.exportMaxBytes)}. Try a simpler source image.`,
        `تنبيه: حجم الملف ما يزال أعلى من ${formatBytes(APP_CONFIG.exportMaxBytes)}.`
      )
    );
  } else {
    facts.push(
      pick(
        locale,
        'File size is within the digital target.',
        'حجم الملف ضمن النطاق المناسب للرفع الرقمي.'
      )
    );
  }

  return { blob, facts };
}
