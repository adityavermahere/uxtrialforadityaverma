import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));
process.chdir(root);
const read = name => readFile(name, 'utf8');
const optionalJSON = async name => { try { return JSON.parse(await read(name)); } catch (error) { if (error.code === 'ENOENT') return {}; throw error; } };
await rm('dist', { recursive: true, force: true });
await mkdir('dist/assets', { recursive: true });
await mkdir('reports', { recursive: true });
const sizes = {};
async function asset(name, contents) {
  const hash = createHash('sha256').update(contents).digest('hex').slice(0, 12);
  const ext = path.extname(name), stem = path.basename(name, ext);
  const url = `/assets/${stem}.${hash}${ext}`;
  await writeFile(`dist${url}`, contents);
  sizes[url] = Buffer.byteLength(contents);
  return url;
}
const minJS = async code => (await transform(code, { minify: true, target: 'es2020', legalComments: 'inline' })).code;
const rawAssets = JSON.parse(await read('asset-map.json'));
const media = await optionalJSON('media-map.json');
const deployed = new Set();
async function copyPublic(url) {
  if (!url || deployed.has(url)) return;
  if (!url.startsWith('/assets/') || url.includes('..')) throw new Error(`Invalid local asset ${url}`);
  deployed.add(url);
  await mkdir(path.dirname(`dist${url}`), { recursive: true });
  await cp(`public${url}`, `dist${url}`);
}
function rewriteAssets(text, variant = 'display') {
  for (const [id, raw] of Object.entries(rawAssets)) {
    const url = media[id]?.[variant] || media[id]?.display || raw;
    // Only replace source UUID tokens, never UUIDs within already-generated URLs.
    text = text.replace(new RegExp(`(?<![\\w/\\-])${id}(?![\\w\\-])`, 'g'), url);
  }
  return text;
}
const originals = {};
for (const [id, record] of Object.entries(media)) {
  if (rawAssets[id]?.endsWith('.png')) {
    if (record.display) originals[record.display] = record.full;
  }
}

const vendor = {};
for (const name of ['react.production', 'react-dom.production', 'three-bundle', 'dc-runtime', 'lightbox', 'characters']) {
  let code = await read(`src/vendor/${name}.js`);
  if (name === 'dc-runtime') {
    // A portfolio transition and component mount share one in-flight request.
    code = code.replace('const blob = bundledBlob(target);', 'const preparedText = window.OC?.preparedText?.(target); const blob = preparedText ? { text: () => preparedText } : bundledBlob(target);');
  }
  if (name === 'characters') {
    // Stop shared animation schedulers once their last preview disconnects.
    code = code.replace('function tick(now){raf=requestAnimationFrame(tick);', 'function tick(now){if(!LOOP.size){raf=0;return;}raf=requestAnimationFrame(tick);');
    code = code.replace('function loop(ts){const t=', 'function loop(ts){if(!els.size){running=false;last=0;return;}const t=');
  }
  if (name === 'lightbox') {
    code = code.replace('const F = finalRect(el);', `
      const picture = c.querySelector('[role="img"]');
      if (picture) {
        const bg = el.querySelector('[role="img"]');
        const background = bg?.dataset.ocBackground || getComputedStyle(bg || el).backgroundImage;
        picture.style.backgroundImage = background.replace(/url\\(["']?([^"')]+)["']?\\)/g, (_, url) => 'url("' + window.OC.fullImage(url) + '")');
      }
      const F = finalRect(el);`);
  }
  vendor[name] = await asset(`${name}.js`, await minJS(code));
}

let sceneTemplate = await read('src/scene/template.html');
let portfolioTemplate = await read('src/portfolio/template.html');
let portfolioLogic = await read('src/portfolio/PortfolioBrowser.js');
for (const [id, record] of Object.entries(media)) {
  if (record.poster) portfolioLogic = portfolioLogic.replace(`video: '${id}',`, `video: '${id}', videoPoster: '${record.poster}',`);
}
const content = await optionalJSON('src/portfolio/projects.json');
portfolioLogic = portfolioLogic.replace('/* __PROJECT_DATA__ */', `D = ${JSON.stringify(content)};`);
portfolioLogic = rewriteAssets(portfolioLogic);
portfolioTemplate = rewriteAssets(portfolioTemplate)
  .replace('/* __PORTFOLIO_LOGIC__ */', await minJS(portfolioLogic))
  .replace(/<script src="[^"]+"><\/script>/g, '')
  .replace(/<link[^>]+fonts\.googleapis[^>]+>/g, '');
const portfolio = await asset('portfolio.dc.html', portfolioTemplate);

const fontBlocks = [...sceneTemplate.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(match => match[1]);
const css = rewriteAssets(fontBlocks.join('\n'));
const stylesheet = await asset('app.css', (await transform(css, { loader: 'css', minify: true })).code);
sceneTemplate = sceneTemplate.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<helmet>\s*<\/helmet>/g, '');
const sceneSource = await read('src/scene/RoomScene.js');

// Every generated file has a content hash, including the texture manifest.
let textureManifestURL = '/assets/textures/manifest.json';
try {
  const textureManifest = await read('public/assets/textures/manifest.json');
  textureManifestURL = await asset('textures.json', textureManifest);
  const manifest = JSON.parse(textureManifest);
  const sourceHash = createHash('sha256').update(sceneSource).digest('hex');
  if (manifest.sourceHash !== sourceHash) throw new Error('Room source changed: run npm run bake:textures before building.');
  for (const entry of manifest.textures) { await copyPublic(entry.color); await copyPublic(entry.bump); }
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  throw new Error('Missing baked room textures. Run npm run bake:textures before building.');
}
const sceneLogic = await minJS(rewriteAssets(sceneSource, 'room').replaceAll('/assets/textures/manifest.json', textureManifestURL));
sceneTemplate = sceneTemplate.replace('/* __SCENE_LOGIC__ */', sceneLogic);
const resources = {
  'https://unpkg.com/react@18.3.1/umd/react.production.min.js': vendor['react.production'],
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js': vendor['react-dom.production'],
  './DrawerFiles.dc.html': portfolio,
  lightbox: vendor.lightbox,
  characters: vendor.characters,
};
const bootstrapSource = (await read('src/bootstrap.js'))
  .replace('__OC_RESOURCES__', JSON.stringify(resources))
  .replace('__OC_IMAGE_ORIGINALS__', JSON.stringify(originals))
  .replace('__OC_TEXTURE_MANIFEST_URL__', JSON.stringify(textureManifestURL));
const bootstrap = await asset('bootstrap.js', await minJS(bootstrapSource));
const scriptTags = [bootstrap, vendor['react.production'], vendor['react-dom.production'], vendor['three-bundle'], vendor['dc-runtime']]
  .map(url => `<script defer src="${url}"></script>`).join('\n');
sceneTemplate = sceneTemplate.replace(/<script src="[^"]+"><\/script>/g, '');
sceneTemplate = sceneTemplate.replace('<head>', `<head>\n<title>October Calibration — Aditya Verma</title>\n<meta name="description" content="An interactive portfolio of design work by Aditya Verma.">\n<link rel="stylesheet" href="${stylesheet}">\n${scriptTags}`);
sceneTemplate = sceneTemplate.replace('<body>', '<body>\n<div id="oc-loading" role="status" style="position:fixed;inset:0;display:grid;place-items:center;background:#0a0705;color:#bdae98;font:12px monospace">Preparing the room…</div>');
sceneTemplate = sceneTemplate.replace('</body>', '<noscript>This interactive portfolio needs JavaScript enabled.</noscript>\n</body>');
await writeFile('dist/index.html', sceneTemplate);
// Deploy only assets referenced by the generated documents and metadata.
const documents = [sceneTemplate, portfolioTemplate, css, JSON.stringify(originals)];
for (const doc of documents) for (const match of doc.matchAll(/\/assets\/(?:original|media)\/[\w.-]+/g)) await copyPublic(match[0]);
await writeFile('reports/build.json', JSON.stringify({ htmlBytes: Buffer.byteLength(sceneTemplate), generatedAssets: sizes, referencedPublicAssets: deployed.size }, null, 2) + '\n');
console.log(`Built dist/index.html (${(Buffer.byteLength(sceneTemplate) / 1024).toFixed(1)} KiB) with ${Object.keys(sizes).length + deployed.size} cacheable assets.`);
