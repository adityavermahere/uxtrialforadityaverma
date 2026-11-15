/**
 * Bake the deterministic pixel recipes directly from RoomScene.js without a browser.
 * Uint8ClampedArray performs the same pixel conversion as browser ImageData.
 * Canvas drawing recipes (e.g. randomized limewash brushwork) remain in the scene.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Script, createContext } from 'node:vm';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(resolve(root, 'src/scene/RoomScene.js'), 'utf8');
const output = resolve(root, 'public/assets/textures');
await mkdir(output, { recursive: true });

// Scan a JavaScript call without changing its expression or its numerical recipes.
function callExpression(start) {
  const open = source.indexOf('(', start);
  let depth = 0, quote = null;
  for (let index = open; index < source.length; index++) {
    const char = source[index];
    if (quote) {
      if (char === '\\') index++;
      else if (char === quote) quote = null;
    } else if (char === '"' || char === "'" || char === '`') quote = char;
    else if (char === '/' && source[index + 1] === '/') { index = source.indexOf('\n', index + 2); if (index === -1) break; }
    else if (char === '/' && source[index + 1] === '*') { index = source.indexOf('*/', index + 2) + 1; }
    else if (char === '(') depth++;
    else if (char === ')' && --depth === 0) return source.slice(start, index + 1);
  }
  throw new Error('Unbalanced texture call at ' + start);
}
class PixelCanvas {
  width = 0;
  height = 0;
  pixels = null;
  getContext(kind) {
    if (kind !== '2d') throw new Error('Offline baker supports pixel contexts only');
    return {
      createImageData: (width, height) => ({ width, height, data: new Uint8ClampedArray(width * height * 4) }),
      putImageData: image => { this.pixels = image.data; },
    };
  }
}
const captures = [];
const context = createContext({
  __math: Math,
  document: { createElement: tag => { if (tag !== 'canvas') throw new Error('Unexpected element'); return new PixelCanvas(); } },
  texturePair: (key, width, height, generate) => {
    const pair = generate();
    if (pair.some(canvas => canvas.width !== width || canvas.height !== height || !canvas.pixels)) throw new Error('Invalid texture ' + key);
    captures.push({ key, width, height, pair });
    return pair;
  },
});
const helpers = source.slice(source.indexOf('    const hash ='), source.indexOf('    const progress ='));
const floorDeclarationStart = source.indexOf('const N = 9, inner = woodFn(');
const floorDeclarationEnd = source.indexOf('const [c, b] = gen(', floorDeclarationStart);
if (floorDeclarationStart === -1 || floorDeclarationEnd === -1) throw new Error('Floor texture recipe changed; update baker scope');
const floorHelpers = source.slice(floorDeclarationStart, floorDeclarationEnd);
const calls = [];
for (const match of source.matchAll(/\b(?:woodMat|gen)\(/g)) {
  const expression = callExpression(match.index);
  // This is woodMat's definition; its four concrete calls are evaluated below.
  if (expression.startsWith('gen(op.size')) continue;
  calls.push(expression);
}
const program = helpers + '\n' + floorHelpers + '\n' +
  'const woodMat = (dark, light, options) => gen(options.size || 512, options.size || 512, woodFn(dark, light, options));\n' +
  calls.map(call => call + ';').join('\n');
const started = performance.now();
new Script('(function () { const Math = __math;\n' + program + '\n})();', { filename: 'RoomScene-texture-recipes.js' }).runInContext(context, { timeout: 180_000 });
if (captures.length !== 12 || new Set(captures.map(entry => entry.key)).size !== captures.length) throw new Error('Texture recipe inventory changed: ' + captures.length);
const entries = [], files = new Set();
let rawBytes = 0, bakedBytes = 0;
for (const { key, width, height, pair } of captures) {
  const paths = [];
  for (const canvas of pair) {
    const raw = Buffer.from(canvas.pixels);
    const webp = await sharp(raw, { raw: { width, height, channels: 4 } }).webp({ lossless: true, effort: 6 }).toBuffer();
    const decoded = await sharp(webp).ensureAlpha().raw().toBuffer();
    if (!raw.equals(decoded)) throw new Error('Lossless texture pixel mismatch: ' + key);
    const filename = createHash('sha256').update(webp).digest('hex').slice(0, 16) + '.webp';
    if (!files.has(filename)) { await writeFile(resolve(output, filename), webp); files.add(filename); bakedBytes += webp.length; }
    rawBytes += raw.length;
    paths.push('/assets/textures/' + filename);
  }
  entries.push({ key, width, height, color: paths[0], bump: paths[1] });
}
const manifest = { version: 1, sourceHash: createHash('sha256').update(source).digest('hex'), recipeSha256: createHash('sha256').update(program).digest('hex'), textures: entries };
await writeFile(resolve(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
const report = { method: 'offline-js-recipes', pairs: entries.length, uniqueFiles: files.size, decodedRgbaBytes: rawBytes, bakedWebpBytes: bakedBytes, losslessPixelsVerified: true, generationMilliseconds: performance.now() - started };
await mkdir(resolve(root, 'reports'), { recursive: true });
await writeFile(resolve(root, 'reports/texture-bake.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
