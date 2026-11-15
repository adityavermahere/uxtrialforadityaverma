/**
 * Regenerate procedural room textures after changing a recipe in RoomScene.js.
 * Start the local preview first, then: node scripts/bake-textures.mjs http://localhost:4173
 * Production never runs this script or computes these pixel recipes.
 */
import { createHash } from 'node:crypto';
import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { homedir } from 'node:os';
import { chromium } from 'playwright';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const endpoint = new URL(process.argv[2] || 'http://127.0.0.1:4173');
endpoint.searchParams.set('bake', '1');
const output = resolve(root, 'public/assets/textures');
await mkdir(output, { recursive: true });
const candidates = [process.env.CHROMIUM_PATH, chromium.executablePath(), resolve(homedir(), '.cache/ms-playwright/chromium-1243/chrome-linux64/chrome')].filter(Boolean);
let executablePath;
for (const path of candidates) { try { await access(path); executablePath = path; break; } catch {} }
const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(endpoint.href, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__oc?.state.phase === 'door', { timeout: 180_000 });
  const capture = await page.evaluate(() => ({ textures: window.__OC_CAPTURE_TEXTURES, metrics: performance.getEntriesByName('oc-scene-initialization').map(entry => ({ duration: entry.duration })) }));
  if (!capture.textures?.length || errors.length) throw new Error('Texture capture failed: ' + errors.join('; '));
  const entries = [], saved = new Set();
  let sourceBytes = 0, bakedBytes = 0;
  for (const { key, width, height, color, bump } of capture.textures) {
    const paths = [];
    for (const dataUrl of [color, bump]) {
      const png = Buffer.from(dataUrl.split(',')[1], 'base64');
      const webp = await sharp(png).webp({ lossless: true, effort: 6 }).toBuffer();
      // Lossless storage preserves the generated color and bump pixels.
      const before = await sharp(png).ensureAlpha().raw().toBuffer();
      const after = await sharp(webp).ensureAlpha().raw().toBuffer();
      if (!before.equals(after)) throw new Error('Lossless texture pixel mismatch: ' + key);
      const digest = createHash('sha256').update(webp).digest('hex').slice(0, 16);
      const filename = `${digest}.webp`;
      if (!saved.has(filename)) { await writeFile(resolve(output, filename), webp); saved.add(filename); bakedBytes += webp.length; }
      sourceBytes += png.length;
      paths.push('/assets/textures/' + filename);
    }
    entries.push({ key, width, height, color: paths[0], bump: paths[1] });
  }
  const sourceHash = createHash('sha256').update(await readFile(resolve(root, 'src/scene/RoomScene.js'))).digest('hex');
  const manifest = { version: 1, sourceHash, textures: entries };
  await writeFile(resolve(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  await mkdir(resolve(root, 'reports'), { recursive: true });
  const report = { pairs: entries.length, uniqueFiles: saved.size, capturedPngBytes: sourceBytes, bakedWebpBytes: bakedBytes, losslessPixelsVerified: true, captureSceneMilliseconds: capture.metrics[0]?.duration };
  await writeFile(resolve(root, 'reports/texture-bake.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
} finally { await browser.close(); }
