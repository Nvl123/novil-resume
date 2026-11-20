import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderCvHtml } from '../src/render.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export function buildHtml() {
  const dataPath = path.join(rootDir, 'data', 'cv.json');
  const cssSourcePath = path.join(rootDir, 'src', 'styles.css');
  const distDir = path.join(rootDir, 'dist');

  const rawJson = fs.readFileSync(dataPath, 'utf8');
  let cvData;
  try {
    cvData = JSON.parse(rawJson);
  } catch (err) {
    throw new Error(`Invalid JSON in data/cv.json: ${err.message}`);
  }

  if (!cvData || typeof cvData !== 'object' || !cvData.profile) {
    throw new Error('data/cv.json must contain a "profile" object.');
  }

  fs.mkdirSync(distDir, { recursive: true });

  const html = renderCvHtml(cvData);
  const htmlPath = path.join(distDir, 'index.html');
  const cssDestPath = path.join(distDir, 'styles.css');
  const pdfFileName = cvData.meta?.pdfFileName || 'CV.pdf';
  const pdfPath = path.join(distDir, pdfFileName);

  fs.writeFileSync(htmlPath, html, 'utf8');
  fs.copyFileSync(cssSourcePath, cssDestPath);

  return { cvData, htmlPath, pdfPath, distDir };
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const { htmlPath } = buildHtml();
  console.log(`Built HTML: ${htmlPath}`);
}
