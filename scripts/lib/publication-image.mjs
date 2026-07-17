import { createHash } from 'node:crypto';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export const EDITORIAL_IMAGE_BUCKET = 'editorial-assets';
const MAX_SOURCE_BYTES = 12 * 1024 * 1024;
const MAX_WEBP_BYTES = 350 * 1024;
const MAX_AVIF_BYTES = 250 * 1024;
const ALLOWED_FORMATS = new Set(['jpeg', 'png', 'webp', 'avif']);
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const WIDTHS = [480, 768, 1200];

const publicPath = (...parts) => `/${parts.join('/').replace(/^\/+/, '')}`;

export function normalizePrivateObjectPath(value) {
  const cleaned = String(value || '').trim().replace(/^\/+/, '');
  if (!cleaned || cleaned.includes('..') || cleaned.includes('\\')) throw new Error('Approved featured image has an invalid storage path');
  return cleaned.startsWith(`${EDITORIAL_IMAGE_BUCKET}/`) ? cleaned.slice(EDITORIAL_IMAGE_BUCKET.length + 1) : cleaned;
}

async function imageMetadata(buffer, sourceLabel) {
  if (buffer.length > MAX_SOURCE_BYTES) throw new Error(`${sourceLabel} exceeds the 12 MB publication limit`);
  const metadata = await sharp(buffer, { animated: false, limitInputPixels: 100_000_000 }).metadata();
  if (!ALLOWED_FORMATS.has(metadata.format || '')) throw new Error(`${sourceLabel} must be JPEG, PNG, WebP or AVIF`);
  if (!metadata.width || !metadata.height || metadata.width < 480 || metadata.height < 270) {
    throw new Error(`${sourceLabel} must be at least 480 × 270 pixels`);
  }
  if ((metadata.pages || 1) > 1) throw new Error(`${sourceLabel} must be a single-frame image`);
  return metadata;
}

async function encodeWithinLimit(pipeline, format, maxBytes) {
  const qualities = format === 'webp' ? [84, 78, 72, 66, 60] : [52, 46, 40, 34];
  for (const quality of qualities) {
    const output = format === 'webp'
      ? await pipeline.clone().webp({ quality, effort: 6, smartSubsample: true }).toBuffer()
      : await pipeline.clone().avif({ quality, effort: 5, chromaSubsampling: '4:2:0' }).toBuffer();
    if (output.length <= maxBytes) return output;
  }
  throw new Error(`Generated ${format.toUpperCase()} image exceeds ${Math.round(maxBytes / 1024)} KB`);
}

async function promoteBuffer({ buffer, root, language, slug }) {
  await imageMetadata(buffer, 'Approved featured image');
  const hash = createHash('sha256').update(buffer).digest('hex').slice(0, 16);
  const relativeDirectory = path.join('uploads', 'articles', language, slug);
  const directory = path.join(root, 'public', relativeDirectory);
  await mkdir(directory, { recursive: true });

  const webp = [];
  const avif = [];
  for (const width of WIDTHS) {
    const height = Math.round(width * 9 / 16);
    const pipeline = sharp(buffer, { animated: false, limitInputPixels: 100_000_000 })
      .rotate()
      .resize(width, height, { fit: 'contain', position: 'centre', background: '#ffffff', withoutEnlargement: false });
    const webpBuffer = await encodeWithinLimit(pipeline, 'webp', width === 1200 ? MAX_WEBP_BYTES : MAX_WEBP_BYTES);
    const avifBuffer = await encodeWithinLimit(pipeline, 'avif', width === 1200 ? MAX_AVIF_BYTES : MAX_AVIF_BYTES);
    const stem = `${slug}-${hash}-${width}`;
    await writeFile(path.join(directory, `${stem}.webp`), webpBuffer);
    await writeFile(path.join(directory, `${stem}.avif`), avifBuffer);
    webp.push({ path: publicPath(relativeDirectory, `${stem}.webp`), width });
    avif.push({ path: publicPath(relativeDirectory, `${stem}.avif`), width });
  }

  return {
    featuredImage: webp.at(-1).path,
    featuredImageAvif: avif.at(-1).path,
    featuredImageSrcSet: webp.map((item) => `${item.path} ${item.width}w`).join(', '),
    featuredImageAvifSrcSet: avif.map((item) => `${item.path} ${item.width}w`).join(', '),
    featuredImageWidth: 1200,
    featuredImageHeight: 675,
  };
}

export async function promoteEditorialImage({ supabase, imagePath, imageAlt, root, language, slug }) {
  if (!imagePath) return {};
  if (!String(imageAlt || '').trim()) throw new Error('Approved featured image needs descriptive alt text');

  if (imagePath.startsWith('/uploads/')) {
    const publicRoot = path.resolve(root, 'public');
    const localPath = path.resolve(publicRoot, imagePath.replace(/^\/+/, ''));
    if (!localPath.startsWith(`${publicRoot}${path.sep}`)) throw new Error('Public featured image path escapes the public directory');
    await access(localPath).catch(() => { throw new Error(`Generated image file was missing: ${imagePath}`); });
    const buffer = await readFile(localPath);
    const metadata = await imageMetadata(buffer, 'Public featured image');
    return {
      featuredImage: imagePath,
      featuredImageWidth: metadata.width,
      featuredImageHeight: metadata.height,
    };
  }

  const objectPath = normalizePrivateObjectPath(imagePath);
  const { data, error } = await supabase.storage.from(EDITORIAL_IMAGE_BUCKET).download(objectPath);
  if (error || !data) throw new Error(`Approved private image could not be downloaded: ${error?.message || objectPath}`);
  if (data.type && !ALLOWED_MIME_TYPES.has(data.type)) throw new Error(`Approved private image has unsupported MIME type: ${data.type}`);
  const buffer = Buffer.from(await data.arrayBuffer());
  return promoteBuffer({ buffer, root, language, slug });
}

export async function promoteImageBufferForTest(options) {
  return promoteBuffer(options);
}
