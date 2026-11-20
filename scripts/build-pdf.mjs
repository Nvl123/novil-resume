import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildHtml } from './build-html.mjs';

const __filename = fileURLToPath(import.meta.url);

function findBrowserBinary() {
  const candidates = [];

  if (process.env.CHROME_PATH) {
    candidates.push(process.env.CHROME_PATH);
  }

  if (process.platform === 'win32') {
    candidates.push(
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
    );
    if (process.env.LOCALAPPDATA) {
      candidates.push(
        path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe'),
        path.join(process.env.LOCALAPPDATA, 'Microsoft', 'Edge', 'Application', 'msedge.exe')
      );
    }
  } else if (process.platform === 'darwin') {
    candidates.push(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
    );
  } else {
    candidates.push(
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser'
    );
  }

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    'Could not find Chrome/Edge/Chromium binary. Set CHROME_PATH environment variable to your browser executable.'
  );
}

export function buildPdf() {
  const { htmlPath, pdfPath } = buildHtml();
  const browserPath = findBrowserBinary();

  const args = [
    '--headless',
    '--disable-gpu',
    '--no-pdf-header-footer',
  ];

  if (process.platform === 'linux') {
    args.push('--no-sandbox', '--disable-setuid-sandbox');
  }

  args.push(`--print-to-pdf=${pdfPath}`, pathToFileURL(htmlPath).href);

  execFileSync(browserPath, args, { stdio: 'pipe' });

  if (!fs.existsSync(pdfPath)) {
    throw new Error(`PDF was not generated at ${pdfPath}`);
  }

  const stat = fs.statSync(pdfPath);
  if (stat.size <= 1000) {
    throw new Error(`Generated PDF at ${pdfPath} is unexpectedly small (${stat.size} bytes).`);
  }

  const sizeKb = (stat.size / 1024).toFixed(1);
  console.log(`Built PDF: ${pdfPath} (${sizeKb} KB) using ${path.basename(browserPath)}`);
  return pdfPath;
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  buildPdf();
}
