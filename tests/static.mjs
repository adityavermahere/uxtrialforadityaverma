import assert from 'node:assert/strict';
import { readFile, readdir, stat, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(new URL('..', import.meta.url).pathname);
process.chdir(root);
const report = {
  generatedAt: new Date().toISOString(),
  kind: 'Static build validation and Node VM integration; no browser or WebGL acceptance.',
  checks: [],
};
const read = name => readFile(name, 'utf8');
async function check(name, run) {
  try {
    const details = await run();
    report.checks.push({ name, passed: true, ...details });
    console.log(`PASS ${name}`);
  } catch (error) {
    report.checks.push({ name, passed: false, message: error.message, stack: error.stack });
    console.error(`FAIL ${name}: ${error.message}`);
  }
}
async function filesIn(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const name = path.join(directory, entry.name);
    result.push(...(entry.isDirectory() ? await filesIn(name) : [name]));
  }
  return result;
}
function scriptsIn(html) {
  return [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].map(([, attrs, code]) => ({ attrs, code }));
}
function logicIn(html) {
  const script = scriptsIn(html).find(item => /type="text\/x-dc"/.test(item.attrs));
  assert(script, 'Design component logic script exists');
  return script.code;
}
function sandbox(extra = {}) {
  const timers = new Map();
  const events = [];
  let nextTimer = 0;
  const context = {
    console,
    URL,
    URLSearchParams,
    Blob,
    performance: { mark() {}, measure() {}, now: () => 0 },
    document: { hidden: false },
    location: { search: '', href: 'https://example.test/' },
    window: {},
    React: { createRef: () => ({ current: null }) },
    setTimeout(fn) { const id = ++nextTimer; timers.set(id, fn); return id; },
    clearTimeout(id) { timers.delete(id); },
    setInterval() { return ++nextTimer; },
    clearInterval() {},
    requestAnimationFrame(fn) { queueMicrotask(() => fn(0)); return ++nextTimer; },
    cancelAnimationFrame() {},
    matchMedia: () => ({ matches: true }),
    ...extra,
  };
  context.window.matchMedia = context.matchMedia;
  context.window.addEventListener = (name, listener) => events.push({ name, listener });
  context.window.removeEventListener = () => {};
  context.DCLogic = class {
    constructor(props = {}) { this.props = props; }
    setState(update, callback) {
      this.state = { ...this.state, ...(typeof update === 'function' ? update(this.state) : update) };
      // The exported dc-runtime forwards previous props only, unlike React's
      // usual componentDidUpdate(prevProps, prevState) component signature.
      this.componentDidUpdate?.(this.props);
      callback?.();
    }
  };
  return {
    context: vm.createContext(context), timers, events,
    async settle() { for (let n = 0; n < 30; n++) await Promise.resolve(); },
    async flushTimers() {
      const pending = [...timers.values()]; timers.clear();
      pending.forEach(fn => fn());
      for (let n = 0; n < 30; n++) await Promise.resolve();
    },
    instantiate(code, props = {}) {
      const Constructor = vm.runInContext(`${code}\n;Component;`, this.context);
      return new Constructor(props);
    },
  };
}

try {
  const html = await read('dist/index.html');
  const allFiles = await filesIn('dist');
  const textFiles = allFiles.filter(name => /\.(html|js|css|json)$/.test(name));
  const texts = await Promise.all(textFiles.map(async name => [name, await read(name)]));
  const portfolioPair = texts.find(([name]) => /portfolio\.dc\..*\.html$/.test(name));
  const bootstrapPair = texts.find(([name]) => /bootstrap\..*\.js$/.test(name));
  assert(portfolioPair && bootstrapPair, 'Built portfolio and bootstrap exist');
  const [portfolioFile, portfolio] = portfolioPair;
  const [, bootstrap] = bootstrapPair;
  const sceneLogic = logicIn(html);
  const portfolioLogic = logicIn(portfolio);

  await check('generated JavaScript and component logic parse', () => {
    for (const [name, text] of texts) {
      if (name.endsWith('.js')) new vm.Script(text, { filename: name });
      if (name.endsWith('.html')) {
        for (const { attrs, code } of scriptsIn(text)) {
          if (!/\bsrc=/.test(attrs) && code.trim()) new vm.Script(`(function(){${code}\n})`, { filename: name });
        }
      }
    }
    return { javascriptFiles: textFiles.filter(name => name.endsWith('.js')).length };
  });

  await check('every generated asset reference resolves to a deployed file', async () => {
    const references = new Set();
    for (const [name, text] of texts) {
      for (const match of text.matchAll(/\/assets\/[A-Za-z0-9_./-]+\.(?:json|html|woff2|webp|css|png|svg|mp3|mp4|js)(?![A-Za-z0-9_.-])/g)) {
        const url = match[0];
        assert(!url.includes('..'), `No traversal: ${name} ${url}`);
        assert(!url.includes('//'), `No malformed double slash in ${name}: ${url}`);
        const info = await stat(`dist${url}`).catch(() => null);
        assert(info?.isFile() && info.size > 0, `${name} references missing/empty ${url}`);
        references.add(url);
      }
    }
    return { verifiedReferences: references.size };
  });

  await check('standalone payload and external startup dependencies are removed', () => {
    assert(html.startsWith('<!DOCTYPE html>'), 'Document begins with its doctype');
    assert(!html.includes('__bundler/manifest'), 'No packed resource manifest');
    for (const [name, text] of texts) {
      assert(!/data:[^\s"']+;base64,[A-Za-z0-9+/]{256}/.test(text), `No large embedded Base64 resources in ${name}`);
      assert(!/["'][a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}["']/.test(text), `No naked asset UUID placeholders in ${name}`);
      assert(!/__SCENE_LOGIC__|__PORTFOLIO_LOGIC__|__PROJECT_DATA__|__OC_RESOURCES__|__OC_IMAGE_ORIGINALS__|__OC_TEXTURE_MANIFEST_URL__/.test(text), `No build substitution markers in ${name}`);
      if (name.endsWith('.html')) {
        for (const match of text.matchAll(/<(?:script|link|img|video|audio|source)\b[^>]*\b(?:src|href)="([^"]+)"/g)) {
          assert(!/^https?:\/\//.test(match[1]), `No externally hosted application dependency: ${match[1]}`);
        }
      }
    }
    return { htmlBytes: Buffer.byteLength(html) };
  });

  await check('startup scripts defer execution and omit portfolio, character and media loads', () => {
    const initialScripts = scriptsIn(html).filter(item => /\bsrc=/.test(item.attrs));
    assert(initialScripts.length >= 4);
    for (const script of initialScripts) {
      assert(/\bdefer\b/.test(script.attrs), 'Startup scripts use defer');
      assert(!/characters|lightbox|portfolio/.test(script.attrs), 'Feature scripts do not load initially');
    }
    assert(!/<(?:video|audio|source)\b/.test(html), 'Initial document contains no media-loading element');
    assert(/<sc-if value="\{\{ mountFiles \}\}">\s*<dc-import name="DrawerFiles"/.test(html), 'Portfolio mounts only after files have been opened');
    assert(!/<video\b/.test(portfolio), 'Portfolio video preview is an image poster');
    return { startupScriptCount: initialScripts.length };
  });

  await check('content hashes match generated immutable assets', async () => {
    const build = JSON.parse(await read('reports/build.json'));
    for (const [url, bytes] of Object.entries(build.generatedAssets)) {
      const content = await readFile(`dist${url}`);
      assert.equal(content.length, bytes, `Size manifest matches ${url}`);
      const expected = createHash('sha256').update(content).digest('hex').slice(0, 12);
      assert(url.includes(`.${expected}.`), `Content hash matches ${url}`);
    }
    const config = JSON.parse(await read('vercel.json'));
    assert.equal(config.outputDirectory, 'dist');
    assert(config.headers.find(rule => rule.source === '/assets/(.*)')?.headers.some(header => header.key === 'Cache-Control' && header.value.includes('immutable')));
    return { verifiedHashes: Object.keys(build.generatedAssets).length };
  });

  await check('bootstrap performs no eager feature requests and deduplicates deferred requests', async () => {
    const loads = [], fetches = [];
    const box = sandbox();
    box.context.document.createElement = () => ({});
    box.context.document.head = { append(script) { loads.push(script.src); queueMicrotask(() => script.onload()); } };
    box.context.fetch = async url => { fetches.push(url); return { ok: true, text: async () => portfolio }; };
    vm.runInContext(bootstrap, box.context);
    assert.equal(loads.length, 0);
    assert.equal(fetches.length, 0);
    const { OC, __resources: resources } = box.context.window;
    assert.equal(resources['./DrawerFiles.dc.html'], `/${portfolioFile.replace(/^dist\//, '')}`);
    assert(Object.values(resources).every(url => url.startsWith('/assets/')));
    const first = OC.preparePortfolio();
    assert.equal(first, OC.preparePortfolio(), 'Portfolio requests share one in-flight promise');
    await first;
    assert.deepEqual(loads, [resources.lightbox]);
    assert.deepEqual(fetches, [resources['./DrawerFiles.dc.html']]);
    assert.equal(await box.context.window.__resourceBlobs[resources['./DrawerFiles.dc.html']].text(), portfolio);
    assert.equal(await OC.preparedText(resources['./DrawerFiles.dc.html']), portfolio);
    assert(!loads.includes(resources.characters));
    await Promise.all([OC.loadCharacters(), OC.loadCharacters()]);
    assert.equal(loads.filter(url => url === resources.characters).length, 1);
    const mappings = JSON.parse(await read('media-map.json'));
    const image = Object.values(mappings).find(record => record.room && record.full);
    assert(image, 'Image variants are available');
    assert.equal(OC.fullImage(image.display), image.full);
    assert.equal(OC.fullImage(`https://example.test${image.display}`), image.full, 'Computed-style absolute URL maps to the full-resolution image');
    assert.equal(OC.fullImage('/not-an-image'), '/not-an-image');
    return { deferredRequests: loads.length + fetches.length };
  });

  await check('deferred portfolio fetch and character script failures can be retried', async () => {
    const box = sandbox();
    const scripts = [];
    let fetchAttempts = 0, characterAttempts = 0;
    box.context.document.createElement = () => ({});
    box.context.document.head = { append(script) {
      scripts.push(script.src);
      const fail = script.src.includes('characters') && ++characterAttempts === 1;
      queueMicrotask(() => fail ? script.onerror() : script.onload());
    } };
    box.context.fetch = async () => ({ ok: ++fetchAttempts > 1, text: async () => portfolio });
    vm.runInContext(bootstrap, box.context);
    const { OC, __resources: resources } = box.context.window;
    await assert.rejects(OC.preparePortfolio(), /Could not load the portfolio/);
    assert.equal(OC.preparedText(resources['./DrawerFiles.dc.html']), null);
    await OC.preparePortfolio();
    assert.equal(fetchAttempts, 2);
    assert.equal(scripts.filter(url => url === resources.lightbox).length, 1);
    await assert.rejects(OC.loadCharacters(), /Could not load/);
    await OC.loadCharacters();
    assert.equal(characterAttempts, 2);
  });

  await check('scene navigation guards, enter/skip, gallery, drawer and return flows work in VM', async () => {
    let prepareCount = 0;
    const box = sandbox();
    box.context.window.OC = { preparePortfolio: async () => { prepareCount++; } };
    const scene = box.instantiate(sceneLogic);
    scene.camera = { position: { clone: () => ({}) }, quaternion: { clone: () => ({}) }, fov: 36 };
    scene.setPhase('door');
    scene.reduced = false;
    scene.enter();
    assert.equal(scene.state.phase, 'opening');
    assert.equal(scene.dir, 1);
    scene.enter();
    scene.skip();
    await box.flushTimers();
    assert.equal(scene.state.phase, 'room');
    assert.equal(scene.Tl, scene.END);
    scene.gallery(true);
    assert.equal(scene.state.phase, 'gallery');
    scene.back();
    assert.equal(scene.state.phase, 'room');
    assert.equal(scene.renderVals().mountFiles, false);
    await scene.dive();
    assert.equal(scene.state.phase, 'diving');
    assert.equal(scene.renderVals().mountFiles, true);
    assert.equal(prepareCount, 1);
    await scene.dive();
    assert.equal(prepareCount, 1, 'Double activation is ignored');
    scene.setPhase('files');
    assert.equal(scene.renderVals().showFiles, true);
    scene.leaveFiles();
    await box.flushTimers();
    assert.equal(scene.state.phase, 'room');
    scene.reduced = true;
    scene.back();
    await box.flushTimers();
    assert.equal(scene.state.phase, 'door');
    return { note: 'State/controller behavior tested without WebGL or DOM layout.' };
  });

  await check('drawer load failure stays in room and a retry opens files once', async () => {
    let attempts = 0;
    const box = sandbox();
    box.context.window.OC = { preparePortfolio: async () => {
      if (++attempts === 1) throw new Error('Temporary connection failure');
    } };
    const scene = box.instantiate(sceneLogic);
    scene.camera = { position: { clone: () => ({}) }, quaternion: { clone: () => ({}) }, fov: 36 };
    scene.setPhase('room');
    await scene.dive();
    assert.equal(scene.state.phase, 'room');
    assert.equal(scene.renderVals().mountFiles, false);
    assert(scene.state.caption.includes('try again'));
    await Promise.all([scene.dive(), scene.dive()]);
    assert.equal(attempts, 2, 'Concurrent activation is deduplicated');
    assert.equal(scene.state.phase, 'diving');
    assert.equal(scene.renderVals().mountFiles, true);
  });

  await check('portfolio preserves all content and loads characters only for the Aetherion case', async () => {
    let characterLoads = 0;
    const box = sandbox();
    box.context.window.OC = { loadCharacters: async () => { characterLoads++; } };
    const portfolio = box.instantiate(portfolioLogic, { active: true });
    portfolio.reduced = true;
    portfolio.rootRef.current = { scrollTop: 0, getAnimations: () => [], animate: () => ({ finished: Promise.resolve() }) };
    const expected = ['Learning', 'Calfus One', 'Aegis', 'MVUE', 'Aetherion', 'Shark Tank'];
    assert.deepEqual(Array.from(portfolio.F, project => project.name), expected);
    assert.deepEqual(Array.from(Object.keys(portfolio.D)).sort(), ['01', '02', '03', '04', '05', '06']);
    for (const project of portfolio.F) {
      assert(Array.isArray(portfolio.D[project.no].sec), `Sections preserved for ${project.name}`);
      assert(project.cover.startsWith('/assets/'), 'Cover uses a local extracted asset');
    }
    for (const project of portfolio.F) {
      await portfolio.openFile(portfolio.F.indexOf(project));
      assert.equal(portfolio.state.view, 'case');
      assert.equal(portfolio.state.cur, portfolio.F.indexOf(project));
      assert.equal(characterLoads, portfolio.F.indexOf(project) >= 4 ? 1 : 0);
      const rendered = portfolio.renderVals();
      if (project.no === '06') {
        assert(rendered.cur.video.endsWith('.mp4'));
        assert(!rendered.cur.videoThumb?.includes('.mp4'), 'Video thumbnail does not point to MP4');
      }
      await portfolio.goHome();
      assert.equal(portfolio.state.view, 'home');
    }
    return { projectCount: portfolio.F.length, characterLoads };
  });

  await check('character preview failure resets navigation and pending loads respect unmount', async () => {
    const box = sandbox();
    let attempts = 0;
    box.context.window.OC = { loadCharacters: async () => {
      if (++attempts === 1) throw new Error('Temporary preview failure');
    } };
    const instance = box.instantiate(portfolioLogic, { active: true });
    instance.reduced = true;
    instance.rootRef.current = { scrollTop: 0, getAnimations: () => [], animate: () => ({ finished: Promise.resolve() }) };
    await instance.openFile(4);
    assert.equal(instance.busy, false);
    assert.equal(instance.state.view, 'home');
    assert(instance.state.loadError.includes('try opening'));
    await instance.openFile(4);
    assert.equal(instance.state.view, 'case');
    assert.equal(instance.state.cur, 4);
    assert.equal(instance.state.loadError, '');

    const secondBox = sandbox();
    let resolveCharacters;
    secondBox.context.window.OC = { loadCharacters: () => new Promise(resolve => { resolveCharacters = resolve; }) };
    const second = secondBox.instantiate(portfolioLogic, { active: true });
    second.reduced = true;
    second.rootRef.current = { scrollTop: 0 };
    const opening = second.openFile(4);
    second.componentWillUnmount();
    second.rootRef.current = null;
    resolveCharacters();
    await opening;
    assert.equal(second.state.view, 'home', 'Unmounted instance does not activate after its script resolves');
  });

  await check('a lazy-mounted active portfolio opens the gallery-selected case', async () => {
    const box = sandbox();
    box.context.window.OC = { observeImages: () => () => {}, loadCharacters: async () => {} };
    box.context.window.OCLightbox = { attach: () => ({ isOpen: () => false, destroy() {} }) };
    const portfolio = box.instantiate(portfolioLogic, { active: true, openFile: 5 });
    portfolio.rootRef.current = { scrollTop: 0, getAnimations: () => [], animate: () => ({ finished: Promise.resolve() }) };
    portfolio.componentDidMount();
    await box.settle();
    await box.flushTimers();
    assert.equal(portfolio.state.view, 'case');
    assert.equal(portfolio.state.cur, 5);
    portfolio.componentWillUnmount();
    assert.equal(box.context.window.__ocPortfolio, null);
  });

  await check('unmounted portfolios do not activate a stale gallery-selected case', async () => {
    const box = sandbox();
    box.context.window.OC = { observeImages: () => () => {}, loadCharacters: async () => {} };
    box.context.window.OCLightbox = { attach: () => ({ isOpen: () => false, destroy() {} }) };
    const portfolio = box.instantiate(portfolioLogic, { active: true, openFile: 5 });
    let openCalls = 0;
    portfolio.openFile = () => { openCalls++; };
    portfolio.rootRef.current = { scrollTop: 0 };
    portfolio.componentDidMount();
    portfolio.componentWillUnmount();
    portfolio.rootRef.current = null;
    await box.settle();
    await box.flushTimers();
    assert.equal(openCalls, 0, 'Unmount cancels the pending entrance continuation');
  });

  await check('prebaked texture recipes and deployed files are complete', async () => {
    const box = sandbox();
    box.context.document.createElement = () => ({});
    vm.runInContext(bootstrap, box.context);
    const manifestURL = box.context.window.__OC_TEXTURE_MANIFEST__;
    assert.equal(typeof manifestURL, 'string');
    const manifest = JSON.parse(await read(`dist${manifestURL}`));
    assert.equal(manifest.version, 1);
    assert(manifest.textures.length > 0);
    const keys = new Set();
    for (const texture of manifest.textures) {
      assert(!keys.has(texture.key), 'Texture recipe keys are unique');
      keys.add(texture.key);
      for (const url of [texture.color, texture.bump]) assert((await stat(`dist${url}`)).size > 0);
      assert(texture.width > 0 && texture.height > 0);
    }
    return { recipes: manifest.textures.length };
  });

  await check('full scene initialization, camera navigation and lighting run with real Three.js geometry and mocked graphics', async () => {
    const bootstrapBox = sandbox();
    vm.runInContext(bootstrap, bootstrapBox.context);
    const manifest = JSON.parse(await read(`dist${bootstrapBox.context.window.__OC_TEXTURE_MANIFEST__}`));
    const dimensions = new Map();
    for (const entry of manifest.textures) {
      dimensions.set(entry.color, [entry.width, entry.height]);
      dimensions.set(entry.bump, [entry.width, entry.height]);
    }
    const scenarios = [];
    for (const quality of ['lite', 'standard']) {
      const box = sandbox();
      const { context } = box;
      context.innerWidth = 1440;
      context.innerHeight = 900;
      context.navigator = { userAgent: 'Node integration test' };
      context.localStorage = { getItem: () => quality === 'lite' ? '1' : '0', setItem() {} };
      context.window.devicePixelRatio = 1;
      context.window.__OC_TEXTURE_MANIFEST__ = manifest;
      context.window.OC = { preparePortfolio: async () => {} };
      const scheduledFrames = [];
      context.requestAnimationFrame = callback => { scheduledFrames.push(callback); return scheduledFrames.length; };
      context.setTimeout = (callback, delay) => {
        if (!delay) queueMicrotask(callback);
        else box.timers.set(box.timers.size + 1, callback);
        return box.timers.size;
      };
      context.document.addEventListener = () => {};
      context.document.removeEventListener = () => {};
      context.document.getElementById = () => ({ remove() {} });
      context.document.fonts = { load: async () => [] };
      context.Image = class Image {
        constructor() { this.listeners = new Map(); this.style = {}; }
        addEventListener(name, listener) { this.listeners.set(name, listener); }
        removeEventListener(name) { this.listeners.delete(name); }
        set src(url) {
          this._src = url;
          [this.width, this.height] = dimensions.get(url) || [512, 512];
          this.naturalWidth = this.width;
          this.naturalHeight = this.height;
          queueMicrotask(() => { this.onload?.(); this.listeners.get('load')?.call(this, { target: this }); });
        }
        get src() { return this._src; }
      };
      function makeCanvas() {
        const canvas = { width: 1, height: 1, style: {}, addEventListener() {}, removeEventListener() {}, remove() {},
          getBoundingClientRect: () => ({ left: 0, top: 0, width: 1440, height: 900 }),
          toDataURL: () => 'data:image/png;base64,AA==',
        };
        const ctx = new Proxy({
          canvas,
          measureText: text => ({ width: String(text).length * 8 }),
          createImageData: (width, height) => ({ width, height, data: new Uint8ClampedArray(width * height * 4) }),
          getImageData: (_x, _y, width, height) => ({ width, height, data: new Uint8ClampedArray(width * height * 4) }),
          createLinearGradient: () => ({ addColorStop() {} }),
          createRadialGradient: () => ({ addColorStop() {} }),
          createPattern: () => ({}),
        }, { get: (target, property) => property in target ? target[property] : () => {} });
        canvas.getContext = () => ctx;
        return canvas;
      }
      context.document.createElement = name => name === 'canvas' ? makeCanvas() : new context.Image();
      context.document.createElementNS = (_namespace, name) => context.document.createElement(name);
      vm.runInContext(await read('src/vendor/three-bundle.js'), context);
      const original = vm.runInContext('__OC3', context);
      const T = { ...original.T };
      T.WebGLRenderer = class {
        constructor() {
          this.domElement = makeCanvas();
          this.shadowMap = {};
          this.capabilities = { isWebGL2: true, getMaxAnisotropy: () => 4 };
          this.info = { render: {}, memory: {} };
        }
        getContext() { return { getExtension: () => null }; }
        getPixelRatio() { return 1; }
        setPixelRatio() {}
        setSize() {}
        dispose() {}
      };
      T.PMREMGenerator = class {
        fromScene() { return { texture: new T.Texture(), dispose() {} }; }
        dispose() {}
      };
      const NoopPass = class {
        constructor(options = {}) { this.uniforms = options.uniforms || {}; }
        setSize() {}
        render() {}
        dispose() {}
        updateGtaoMaterial() {}
        updatePdMaterial() {}
      };
      const EffectComposer = class {
        constructor() { this.passes = []; }
        addPass(pass) { this.passes.push(pass); }
        setSize() {}
        setPixelRatio() {}
        render() {}
        dispose() {}
      };
      context.window.__OC3 = {
        ...original, T, EffectComposer,
        RenderPass: NoopPass, GTAOPass: NoopPass, UnrealBloomPass: NoopPass, OutputPass: NoopPass, ShaderPass: NoopPass,
      };
      const scene = box.instantiate(sceneLogic);
      scene.mountRef.current = { clientWidth: 1440, clientHeight: 900, appendChild() {} };
      scene.grainRef.current = { style: {} };
      await scene.init();
      assert.equal(scene.state.phase, 'door');
      assert.equal(context.window.__OC_TEXTURE_METRICS__.mode, 'baked');
      assert.equal(context.window.__OC_TEXTURE_METRICS__.count, manifest.textures.length);
      assert.equal(context.window.__OC_TEXTURE_METRICS__.cpuGenerationMs, 0);
      assert(scene.scene.isScene);
      let meshes = 0, vertices = 0;
      scene.scene.traverse(object => {
        if (object.isMesh) { meshes++; vertices += object.geometry.attributes.position.count; }
      });
      assert(meshes > 20);
      scene.update(1 / 60);
      assert(Number.isFinite(scene.camera.position.x));
      assert(Number.isFinite(scene.camera.position.y));
      assert(Number.isFinite(scene.camera.position.z));
      scene.reduced = true;
      scene.skip();
      await box.flushTimers();
      assert.equal(scene.state.phase, 'room');
      scene.update(.1);
      scene.gallery(true);
      scene.update(.1);
      assert(scene.galT > 0);
      await scene.dive();
      scene.update(.5);
      assert.equal(scene.state.phase, 'files');
      scene.raf = null;
      scene._filesFrames = 3;
      const framesBeforeReturn = scheduledFrames.length;
      scene.leaveFiles();
      await box.flushTimers();
      assert.equal(scene.state.phase, 'room');
      assert(scheduledFrames.length > framesBeforeReturn, 'Room return resumes a render loop paused behind the files view');
      scene.lampOn = true;
      scene.lampAt = scene.time - 1;
      scene.update(.1);
      assert(scene.nightK > 0, 'Lamp updates the day/night lighting transition');
      assert(Number.isFinite(scene.camera.position.x));
      scene.componentWillUnmount();
      assert.equal(context.window.__oc, null);
      scenarios.push({ quality, meshes, vertices, textureRecipes: manifest.textures.length });
    }
    return { scenarios, note: 'Real scene geometry, materials and state; canvas drawing, GPU passes and image pixels are mocked.' };
  });

  const totalBytes = (await Promise.all(allFiles.map(async name => (await stat(name)).size))).reduce((sum, bytes) => sum + bytes, 0);
  report.build = { htmlBytes: Buffer.byteLength(html), files: allFiles.length, totalBytes };
} catch (error) {
  report.failure = { message: error.message, stack: error.stack };
  console.error(error);
}
report.passed = !report.failure && report.checks.every(item => item.passed);
await mkdir('reports', { recursive: true });
await writeFile('reports/static-acceptance.json', `${JSON.stringify(report, null, 2)}\n`);
if (!report.passed) process.exitCode = 1;
