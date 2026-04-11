import { APP_CONFIG } from './config.js';
import { formatBytes } from './utils.js';

export function drawPreview({ canvas, sourceImage, crop, offsetX = 0, offsetY = 0, zoom = 1 }) {
  const ctx = canvas.getContext('2d');
  const size = APP_CONFIG.exportSize;
  canvas.width = size;
  canvas.height = size;
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

export async function exportJpeg(canvas) {
  let quality = APP_CONFIG.defaultQuality;
  let blob = await canvasToBlob(canvas, APP_CONFIG.exportMime, quality);

  while (blob && blob.size > APP_CONFIG.exportMaxBytes && quality > APP_CONFIG.minQuality) {
    quality = Number((quality - APP_CONFIG.qualityStep).toFixed(2));
    blob = await canvasToBlob(canvas, APP_CONFIG.exportMime, quality);
  }

  const facts = [
    `Format: JPEG`,
    `Size: ${canvas.width}×${canvas.height} pixels`,
    `Compression quality: ${quality}`,
    `Final file size: ${formatBytes(blob.size)}`
  ];

  if (blob.size > APP_CONFIG.exportMaxBytes) {
    facts.push(`Warning: file size is still above ${formatBytes(APP_CONFIG.exportMaxBytes)}. Try a simpler source image.`);
  } else {
    facts.push(`File size is within the digital target.`);
  }

  return { blob, facts };
}
