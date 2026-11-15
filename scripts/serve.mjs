import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4' };
createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    // Baseline comparison is local-only and never included in the deployment.
    const filename = pathname === '/__original.html'
      ? path.resolve(root, '../../October Calibration (standalone)_1.html')
      : path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (pathname !== '/__original.html' && !filename.startsWith(root)) { response.writeHead(403).end(); return; }
    const info = await stat(filename);
    if (!info.isFile()) throw new Error('Not a file');
    response.setHeader('Content-Type', types[path.extname(filename)] || 'application/octet-stream');
    response.setHeader('Cache-Control', pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate');
    response.setHeader('Accept-Ranges', 'bytes');
    const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range || '');
    let start = 0, end = info.size - 1;
    if (range) {
      start = range[1] ? Number(range[1]) : Math.max(0, info.size - Number(range[2]));
      end = range[1] && range[2] ? Math.min(Number(range[2]), end) : end;
      if (start > end || start >= info.size) { response.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end(); return; }
      response.statusCode = 206;
      response.setHeader('Content-Range', `bytes ${start}-${end}/${info.size}`);
    }
    response.setHeader('Content-Length', end - start + 1);
    if (request.method === 'HEAD') { response.end(); return; }
    createReadStream(filename, { start, end }).pipe(response);
  } catch { response.writeHead(404).end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`October Calibration: http://127.0.0.1:${port}`));
