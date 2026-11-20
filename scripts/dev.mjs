import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildHtml } from './build-html.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.pdf': 'application/pdf',
  '.json': 'application/json; charset=utf-8',
};

function safeBuildHtml() {
  try {
    return buildHtml();
  } catch (err) {
    console.error(`[build error] ${err.message}`);
    return null;
  }
}

safeBuildHtml();

const watchDirs = [path.join(rootDir, 'data'), path.join(rootDir, 'src')];
for (const dir of watchDirs) {
  if (fs.existsSync(dir)) {
    fs.watch(dir, { persistent: false }, (_eventType, filename) => {
      if (filename) {
        console.log(`Detected change in ${filename}, rebuilding HTML...`);
        safeBuildHtml();
      }
    });
  }
}

const port = Number(process.env.PORT) || 3000;

const server = http.createServer((req, res) => {
  const urlPath = (req.url || '/').split('?')[0];
  const relativePath = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
  const safePath = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(distDir, safePath);

  if (!filePath.startsWith(distDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  if (safePath === 'index.html' || safePath === 'styles.css') {
    safeBuildHtml();
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(port, () => {
  console.log(`CV preview server running at http://localhost:${port}`);
  console.log('Edit data/cv.json or src/styles.css and refresh browser to see changes.');
});
