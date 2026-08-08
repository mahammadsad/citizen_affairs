import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const outputDirectory = path.join(root, 'public/uploads/articles/shared');
const widths = [480, 768, 1200];
const assets = [
  ['welfare-programmes-guide', 'src/assets/editorial/welfare-programmes-guide.svg'],
  ['exam-document-safety', 'src/assets/editorial/exam-document-safety.svg'],
  ['template-job-opportunity', 'src/assets/editorial/templates/job-opportunity.svg'],
  ['template-exam-update', 'src/assets/editorial/templates/exam-update.svg'],
  ['template-scheme-benefit', 'src/assets/editorial/templates/scheme-benefit.svg'],
  ['template-public-notice', 'src/assets/editorial/templates/public-notice.svg'],
  ['template-citizen-service', 'src/assets/editorial/templates/citizen-service.svg'],
  ['template-citizen-alert', 'src/assets/editorial/templates/citizen-alert.svg'],
];

await mkdir(outputDirectory, { recursive: true });
for (const [name, sourcePath] of assets) {
  const source = await readFile(path.join(root, sourcePath));
  for (const width of widths) {
    const height = Math.round(width * 9 / 16);
    const pipeline = sharp(source, { density: 192 }).resize(width, height, { fit: 'cover' });
    await writeFile(path.join(outputDirectory, `${name}-${width}.webp`), await pipeline.clone().webp({ quality: 82, effort: 6 }).toBuffer());
    await writeFile(path.join(outputDirectory, `${name}-${width}.avif`), await pipeline.clone().avif({ quality: 48, effort: 5 }).toBuffer());
  }
}
console.log(`Generated ${assets.length * widths.length * 2} owned editorial image derivatives.`);
