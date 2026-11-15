class Component extends DCLogic {
  state = { phase: 'loading', hover: null, caption: '', fade: 1, fadeMs: 1600, msg: 'Preparing the room', cursor: 'default' };
  mountRef = React.createRef();
  grainRef = React.createRef();
  END = 5.2;
  Tl = 0; dir = 0; time = 0; idle = 0;

  componentDidMount() {
    this.reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    this.init().catch(e => { if (this.dead) return; console.error(e); const loading = document.getElementById('oc-loading'); if (loading) loading.textContent = 'The room could not be loaded. Refresh to try again.'; const c = document.createElement('canvas'), gl = !!(c.getContext('webgl2') || c.getContext('webgl')); this.setState({ msg: gl ? 'The room could not be loaded — refresh to try again' : 'Your browser has paused 3D graphics — close this tab and reopen it (or restart the browser) to re-enter the room' }); });
  }
  componentDidUpdate() {
    // The design-component runtime supplies previous props only. The scheduler
    // itself guards duplicate frames and phases that should remain paused.
    this.resumeRendering?.();
  }
  componentWillUnmount() {
    this.dead = true; cancelAnimationFrame(this.raf); clearTimeout(this._ft); clearTimeout(this._pt); clearTimeout(this._fadeTimer);
    document.removeEventListener('visibilitychange', this._visibility);
    this.disposeScene();
    window.removeEventListener('resize', this._resize); window.removeEventListener('keydown', this._key); window.removeEventListener('pointerdown', this._gest); window.removeEventListener('keydown', this._gest); if (this.audioEl) { this.audioEl.pause(); this.audioEl.src = ''; } if (this.ac) this.ac.close(); if (window.__ocAudio && window.__ocAudio.owner === this) window.__ocAudio = null;
    if (this.renderer) { this.renderer.dispose(); this.renderer.domElement.remove(); }
    if (window.__oc === this) window.__oc = null;
  }
  // Shared materials, geometries and textures are disposed once when the room unmounts.
  disposeScene() {
    const geometries = new Set(), materials = new Set(), textures = new Set();
    this.scene?.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        if (!material) continue;
        materials.add(material);
        for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
        for (const uniform of Object.values(material.uniforms || {})) if (uniform.value?.isTexture) textures.add(uniform.value);
      }
      if (object.isLight) object.shadow?.dispose();
    });
    if (this.scene?.environment) textures.add(this.scene.environment);
    for (const texture of this._environmentTextures || []) textures.add(texture);
    for (const pass of this.composer?.passes || []) pass.dispose?.();
    this.composer?.dispose();
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    for (const texture of textures) texture.dispose();
  }
  setPhase(p) { if (this.state.phase !== p) this.setState({ phase: p }); }
  pace() { return this.props.introPace === 'Measured' ? 0.78 : 1; }

  FOLDERS = [
    { no: '01', name: 'Shark Tank', note: '', color: '#2b55d6', inner: '#2246b4', ink: '#ffffff', count: 3 },
    { no: '02', name: 'Aetherion', note: 'Many tasks', color: '#127a62', inner: '#0e6450', ink: '#ffffff', count: 7 },
    { no: '03', name: 'MVUE', note: '', color: '#5c2470', inner: '#4b1d5c', ink: '#ffffff', count: 3 },
    { no: '04', name: 'Aegis', note: 'Small tasks', color: '#d3281f', inner: '#b3211a', ink: '#ffffff', count: 5 },
  ];
  gallery = (on) => { if (on && this.state.phase !== 'room') return; if (!on && this.state.phase !== 'gallery') return; this.setHover(null); this.galDir = on ? 1 : -1; if (this.galT == null) this.galT = 0; this.setPhase(on ? 'gallery' : 'room'); this.setState({ caption: on ? 'Choose a file' : '' }); };
  dive = async () => {
    if (this._preparingFiles || (this.state.phase !== 'room' && this.state.phase !== 'gallery')) return;
    this._preparingFiles = true;
    try {
      await window.OC?.preparePortfolio?.();
    } catch {
      this.setState({ phase: 'room', hover: 'drawer', cursor: 'pointer', caption: 'The files could not load. Click the drawer to try again.' });
      return;
    } finally {
      this._preparingFiles = false;
    }
    if (this.dead || (this.state.phase !== 'room' && this.state.phase !== 'gallery')) return;
    this.drawerOpen = true; this.setHover(null); this._fadedIn = false; this.setState({ phase: 'diving', filesMounted: true });
    this.diveT = 0; this.diveFrom = { p: this.camera.position.clone(), q: this.camera.quaternion.clone(), fov: this.camera.fov };
  };
  leaveFiles = () => {
    clearTimeout(this._ft); this.setState({ fade: 1, fadeMs: 360 });
    this._ft = setTimeout(() => { this.diveT = null; this._fadedIn = false; this.drawerOpen = false; this.Tl = this.END; this.galT = 0; this.galDir = 0; this.setPhase('room'); this.setState({ fade: 0, fadeMs: 700, folder: null, openFile: null }); }, 380);
  };
  openFolder = (i) => { this.setState({ folder: i }); const el = this.filesRef.current; if (el) el.scrollTop = 0; };
  filesRef = React.createRef();
  playing = true;
  initAudio = () => {
    if (this.dead) return;
    if (this.ac) { if (this.ac.state === 'suspended') this.ac.resume(); return; }
    const old = window.__ocAudio; if (old && old.owner !== this) { try { old.el.pause(); old.el.src = ''; old.ac.close(); } catch (e) {} }
    try {
      const el = new Audio('7befd1a6-98e1-42db-b010-c7660795e312'); el.loop = true; el.preload = 'auto';
      const ac = new (window.AudioContext || window.webkitAudioContext)(); const src = ac.createMediaElementSource(el);
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 450; lp.Q.value = 0.4;
      const g = ac.createGain(); g.gain.value = 0; src.connect(lp); lp.connect(g); g.connect(ac.destination);
      Object.assign(this, { ac, audioEl: el, lp, gainNode: g, _lg: -1, _lf: -1 }); window.__ocAudio = { el, ac, owner: this };
      if (this.playing) el.play().catch(() => {});
    } catch (e) { console.warn(e); }
  };
  toggleMusic = () => {
    this.initAudio(); this.playing = !this.playing;
    clearTimeout(this._pt);
    if (this.playing) { this.audioEl && this.audioEl.play().catch(() => {}); }
    else this._pt = setTimeout(() => { if (!this.playing && this.audioEl) this.audioEl.pause(); }, 1500);
  };
  audioTick(open, p, ph) {
    if (!this.ac) return;
    const o = Math.max(open, p), tg = this.playing ? (ph === 'files' ? 0.45 : 0.06 + 0.64 * o) : 0, tf = 450 + 17500 * o * o;
    if (Math.abs(tg - this._lg) > 0.005) { this.gainNode.gain.setTargetAtTime(tg, this.ac.currentTime, this.playing ? 0.3 : 0.25); this._lg = tg; }
    if (Math.abs(tf - this._lf) > 40) { this.lp.frequency.setTargetAtTime(tf, this.ac.currentTime, 0.2); this._lf = tf; }
  }
  enter = () => {
    if (this.state.phase !== 'door') return;
    if (this.reduced) return this.cut(this.END, 'room');
    this.dir = 1; this.setPhase('opening'); this.setHover(null);
  };
  skip = () => { const p = this.state.phase; if (p === 'door' || p === 'opening') this.cut(this.END, 'room'); };
  back = () => {
    if (this.state.phase === 'gallery') return this.gallery(false);
    if (this.state.phase !== 'room') return;
    this.drawerOpen = false; this.setHover(null);
    if (this.reduced) return this.cut(0, 'door');
    this.dir = -1; this.setPhase('closing');
  };
  cut(T, phase) {
    this.dir = 0; this.setState({ fade: 1, fadeMs: 420 }); clearTimeout(this._ft);
    this._ft = setTimeout(() => {
      this.Tl = T; this.setPhase(phase); if (phase === 'room') this.arrived();
      this.setState({ fade: 0, fadeMs: 800 });
    }, 440);
  }
  arrived() { this.nudgeAt = this.time + 1.1; }
  setHover(h) {
    const FN = ['Shark Tank', 'Aetherion', 'MVUE', 'Aegis']; const labels = { gallery: 'View the gallery', 'frame:0': 'Open ' + FN[0], 'frame:1': 'Open ' + FN[1], 'frame:2': 'Open ' + FN[2], 'frame:3': 'Open ' + FN[3], drawer: 'Open the drawer', lamp: this.lampOn ? 'Turn off the lamp' : 'Turn on the lamp', gramophone: this.playing ? 'Stop the music' : 'Play the music' };
    const cursor = h ? 'pointer' : 'default';
    if (h !== this.state.hover || cursor !== this.state.cursor) this.setState(s => ({ hover: h, cursor, caption: labels[h] || s.caption }));
  }

  async init() {
    performance.mark('oc-scene-start');
    const bake = new URLSearchParams(location.search).get('bake') === '1';
    const bakedTextures = new Map();
    if (bake) window.__OC_CAPTURE_TEXTURES = [];
    else {
      const source = window.__OC_TEXTURE_MANIFEST__ || '/assets/textures/manifest.json';
      const response = typeof source === 'string' ? await fetch(source) : null;
      if (response && !response.ok) throw new Error('Room texture manifest could not be loaded');
      const manifest = response ? await response.json() : source;
      if (manifest.version !== 1 || !Array.isArray(manifest.textures)) throw new Error('Unsupported room texture manifest');
      const loadingImages = new Map();
      const loadImage = url => {
        if (!loadingImages.has(url)) loadingImages.set(url, new Promise((resolve, reject) => {
          const image = new Image(); image.onload = () => { const decoded = image.decode ? image.decode() : Promise.resolve(); decoded.then(() => resolve(image), reject); }; image.onerror = () => reject(new Error('Room texture failed: ' + url)); image.src = url;
        }));
        return loadingImages.get(url);
      };
      await Promise.all(manifest.textures.map(async entry => {
        const images = await Promise.all([loadImage(entry.color), loadImage(entry.bump)]);
        if (images.some(image => image.naturalWidth !== entry.width || image.naturalHeight !== entry.height)) throw new Error('Room texture dimensions do not match the recipe');
        bakedTextures.set(entry.key, { ...entry, images });
      }));
      window.__OC_TEXTURE_METRICS__ = { mode: 'baked', count: bakedTextures.size, cpuGenerationMs: 0 };
    }
    const texturePair = (key, w, h, generate) => {
      if (!bake) {
        const entry = bakedTextures.get(key);
        if (!entry || entry.width !== w || entry.height !== h) throw new Error('Rebake room textures: recipe mismatch at ' + key);
        return entry.images;
      }
      const pair = generate();
      window.__OC_CAPTURE_TEXTURES.push({ key, width: w, height: h, color: pair[0].toDataURL('image/png'), bump: pair[1].toDataURL('image/png') });
      return pair;
    };
    const __B = window.__OC3; const T = __B.T;
    const { RoundedBoxGeometry, RoomEnvironment, mergeGeometries, EffectComposer, RenderPass, GTAOPass, UnrealBloomPass, OutputPass, ShaderPass } = __B;
    try { await Promise.all([document.fonts.load('600 92px "Cormorant Garamond"'), document.fonts.load('500 64px "Cormorant Garamond"')]); } catch (e) {}
    if (this.dead) return;
    const mount = this.mountRef.current;
    const wait = async () => { await new Promise(resolve => setTimeout(resolve, 0)); if (this.dead) throw new Error('Room initialization cancelled'); };

    // ---------- grain ----------
    { const c = document.createElement('canvas'); c.width = c.height = 192; const x = c.getContext('2d'); const d = x.createImageData(192, 192);
      for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
      x.putImageData(d, 0, 0); const g = this.grainRef.current; if (g) { g.style.backgroundImage = `url(${c.toDataURL()})`; g.style.backgroundSize = '192px 192px'; } }

    // ---------- renderer ----------
    const renderer = new T.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: false });
    this.renderer = renderer; window.__oc = this;
    { let gpu = ''; try { const g = renderer.getContext(), ex = g.getExtension('WEBGL_debug_renderer_info'); gpu = ex ? String(g.getParameter(ex.UNMASKED_RENDERER_WEBGL)) : ''; } catch (e) {}
      let ls = null; try { ls = localStorage.getItem('oc-lite'); } catch (e) {}
      this.lite = ls === '1' || (ls !== '0' && /intel|swiftshader|llvmpipe|angle \(.*(hd|uhd|iris)/i.test(gpu)); this.gpu = gpu; }
    this.prMax = this.lite ? 1 : Math.max(1, Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(2.6e6 / Math.max(1, innerWidth * innerHeight)))); this.pr = this.prMax; renderer.setPixelRatio(this.pr);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;';
    mount.appendChild(renderer.domElement);
    renderer.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.lost = true; try { localStorage.setItem('oc-lite', '1'); } catch (er) {} this.setState({ msg: 'The graphics card needed a moment — refresh to re-enter the room' }); });
    renderer.domElement.addEventListener('webglcontextrestored', () => { this.lost = false; this.setState({ msg: '' }); renderer.shadowMap.needsUpdate = true; this.resumeRendering?.(); });
    const aniso = renderer.capabilities.getMaxAnisotropy();
    const scene = new T.Scene(); this.scene = scene; scene.background = new T.Color('#0a0705');
    const pmrem = new T.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; this._environmentTextures = [scene.environment]; scene.environmentIntensity = 0.2;
    const camera = new T.PerspectiveCamera(36, 1, 0.03, 120);

    // ---------- procedural textures ----------
    const hash = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
    const vn = (x, y, px, py, s) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi; const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      const x0 = ((xi % px) + px) % px, x1 = (x0 + 1) % px, y0 = ((yi % py) + py) % py, y1 = (y0 + 1) % py;
      const a = hash(x0, y0, s), b = hash(x1, y0, s), c = hash(x0, y1, s), d = hash(x1, y1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
    const fbm = (x, y, px, py, s, o) => { let t = 0, a = 0.5, n = 0; for (let i = 0; i < o; i++) { t += a * vn(x, y, px, py, s + i * 17); n += a; x *= 2; y *= 2; px *= 2; py *= 2; a *= 0.5; } return t / n; };
    let textureIndex = 0;
    const gen = (w, h, fn) => texturePair('gen:' + textureIndex++, w, h, () => { const c = document.createElement('canvas'); c.width = w; c.height = h; const b = document.createElement('canvas'); b.width = w; b.height = h;
      const cx = c.getContext('2d'), bx = b.getContext('2d'); const ci = cx.createImageData(w, h), bi = bx.createImageData(w, h); const o = [0, 0, 0, 0];
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { fn(x / w, y / h, o); const i = (y * w + x) * 4; ci.data[i] = o[0]; ci.data[i + 1] = o[1]; ci.data[i + 2] = o[2]; ci.data[i + 3] = 255; const g = Math.max(0, Math.min(255, o[3] * 255)); bi.data[i] = bi.data[i + 1] = bi.data[i + 2] = g; bi.data[i + 3] = 255; }
      cx.putImageData(ci, 0, 0); bx.putImageData(bi, 0, 0); return [c, b]; });
    const tex = (c, srgb = true, clamp = false) => { const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = clamp ? T.ClampToEdgeWrapping : T.RepeatWrapping; t.anisotropy = aniso; if (srgb) t.colorSpace = T.SRGBColorSpace; return t; };
    const mix3 = (d, l, k, o) => { o[0] = d[0] + (l[0] - d[0]) * k; o[1] = d[1] + (l[1] - d[1]) * k; o[2] = d[2] + (l[2] - d[2]) * k; };
    const woodFn = (d, l, op) => (u, v, o) => { const s = op.seed || 1;
      const w = fbm(u * 2, v * 1, 2, 1, s, 3);
      const t = u * op.rings + w * (op.warp || 0.9) + fbm(u * 4, v * 2, 4, 2, s + 5, 2) * 0.35;
      let band = 0.5 + 0.5 * Math.sin(t * 6.2832); band = Math.pow(band, 3);
      const streak = fbm(u * 48, v * 2, 48, 2, s + 7, 3), pore = vn(u * 256, v * 20, 256, 20, s + 3), tone = fbm(u * 2, v * 1, 2, 1, s + 11, 3);
      const m = band * 0.46 + streak * 0.26 + pore * 0.12 + 0.06;
      mix3(d, l, Math.max(0, 1 - m) * (0.62 + 0.7 * tone), o); o[3] = 0.9 - band * 0.45 - pore * 0.35; };
    const progress = async (m) => { this.setState({ msg: m }); await wait(); };

    await progress('Preparing the wood');
    const woodMat = (d, l, op, mo = {}) => { const [c, b] = gen(op.size || 512, op.size || 512, woodFn(d, l, op)); return new T.MeshStandardMaterial({ map: tex(c), bumpMap: tex(b, false), bumpScale: op.bump ?? 1.2, roughness: op.rough ?? 0.55, ...mo }); };
    const walnut = woodMat([58, 36, 23], [96, 63, 42], { rings: 14, seed: 3, rough: 0.5, warp: 1.5 });
    await wait();
    const oak = woodMat([122, 74, 36], [196, 138, 80], { rings: 9, seed: 8, rough: 0.5, warp: 1.6, size: 1024 });
    await wait();
    const tableWood = woodMat([84, 50, 28], [150, 98, 58], { rings: 18, seed: 14 });
    await wait();
    const mahog = woodMat([46, 16, 9], [112, 46, 24], { rings: 24, seed: 21, rough: 0.32, size: 1024 });
    await progress('Laying the floor');
    { const N = 9, inner = woodFn([104, 66, 38], [164, 114, 70], { rings: 3, seed: 31, warp: 0.8 });
      const [c, b] = gen(1024, 1024, (u, v, o) => { const pi = Math.floor(u * N), pu = u * N - pi, sv = hash(pi, 5, 3);
        let dv = (((v - sv) % 0.5) + 0.5) % 0.5; dv = Math.min(dv, 0.5 - dv); const seg = Math.floor((((v - sv) % 1) + 1) % 1 * 2); const off = hash(pi, seg, 9);
        inner(pu * 0.18 + off * 7.3, v, o); const tint = 0.84 + 0.3 * off; o[0] *= tint; o[1] *= tint * (0.98 + 0.03 * off); o[2] *= tint;
        const edge = Math.min(pu, 1 - pu) * 1024 / N; const e = Math.min(1, edge / 1.6) * Math.min(1, dv * 1024 / 1.6);
        const k = 0.45 + 0.55 * e; o[0] *= k; o[1] *= k; o[2] *= k; o[3] = o[3] * e; });
      const [rc] = gen(512, 512, (u, v, o) => { const n = fbm(u * 6, v * 3, 6, 3, 57, 4), s = vn(u * 90, v * 10, 90, 10, 58), sc = Math.pow(vn(u * 30, v * 4, 30, 4, 61), 6); const r = 0.48 + 0.4 * n + 0.08 * s + 0.25 * sc; o[0] = o[1] = o[2] = Math.min(255, r * 255); o[3] = 0; });
      this.floorMat = new T.MeshStandardMaterial({ map: tex(c), bumpMap: tex(b, false), bumpScale: 1.6, roughness: 0.78, roughnessMap: tex(rc, false) }); }
    await progress('Plastering the walls');
    const [plC, plB] = gen(512, 512, (u, v, o) => { const a = fbm(u * 5, v * 5, 5, 5, 41, 5), g = vn(u * 320, v * 320, 320, 320, 4); const m = 0.95 + 0.08 * a + 0.012 * g; o[0] = 236 * m; o[1] = 224 * m; o[2] = 204 * m; o[3] = a * 0.85 + g * 0.15; });
    const plaster = new T.MeshStandardMaterial({ map: tex(plC), bumpMap: tex(plB, false), bumpScale: 0.14, roughness: 0.9 });
    const hallPlaster = plaster.clone(); hallPlaster.color = new T.Color('#cbc1b3');
    const doorPaint = new T.MeshStandardMaterial({ color: '#efe9de', roughness: 0.42, bumpMap: plaster.bumpMap, bumpScale: 0.25 });
    const ceiling = plaster.clone(); plaster.color = new T.Color('#f6e7cf'); ceiling.color = new T.Color('#f2ebe0');
    const trim = new T.MeshStandardMaterial({ color: '#ece2d0', roughness: 0.55 });
    await progress('Weaving the linen');
    const [lnC, lnB] = gen(512, 512, (u, v, o) => { const F = 110; const wx = 0.5 + 0.5 * Math.cos(u * F * 6.2832), wy = 0.5 + 0.5 * Math.cos(v * F * 6.2832);
      const ch = (Math.floor(u * F * 2) + Math.floor(v * F * 2)) & 1; const th = ch ? wx : wy; const sl = fbm(u * 8, v * 48, 8, 48, 5, 2), n = vn(u * 420, v * 420, 420, 420, 8);
      const m = 0.8 + 0.12 * th + 0.1 * sl + 0.05 * n; o[0] = 234 * m; o[1] = 222 * m; o[2] = 202 * m; o[3] = th * 0.6 + sl * 0.2 + n * 0.2; });
    const linen = new T.MeshStandardMaterial({ map: tex(lnC), bumpMap: tex(lnB, false), bumpScale: 1.4, roughness: 0.95, color: '#e6d6bc' });
    const olive = linen.clone(); olive.color = new T.Color('#7f7a55');
    const [juC, juB] = gen(512, 512, (u, v, o) => { const F = 44, row = Math.floor(v * F), ru = u * F + (row % 2) * 0.5; const fu = ru - Math.floor(ru), fv = v * F - row;
      const loop = Math.sin(fu * Math.PI) * Math.sin(fv * Math.PI); const fib = fbm(u * 60, v * 200, 60, 200, 12, 2); const m = 0.62 + 0.38 * loop + 0.14 * (fib - 0.5);
      o[0] = 198 * m; o[1] = 160 * m; o[2] = 112 * m; o[3] = loop * 0.8 + fib * 0.2; });
    const jute = new T.MeshStandardMaterial({ map: tex(juC), bumpMap: tex(juB, false), bumpScale: 3, roughness: 1 });
    const brass = new T.MeshStandardMaterial({ color: '#c9a04c', metalness: 1, roughness: 0.3 });
    const darkBronze = new T.MeshStandardMaterial({ color: '#2f2620', metalness: 0.8, roughness: 0.42 });
    const blackMetal = new T.MeshStandardMaterial({ color: '#1d1a17', metalness: 0.6, roughness: 0.5 });
    const kraft = new T.MeshStandardMaterial({ color: '#c39a66', roughness: 0.85 });
    const ceramic = new T.MeshStandardMaterial({ color: '#e9e1d2', roughness: 0.45 });
    const paperMat = new T.MeshStandardMaterial({ color: '#eae0cf', roughness: 0.9 });
    const slotMat = new T.MeshStandardMaterial({ color: '#ddd2bf', roughness: 0.95 });
    const frameMat = new T.MeshStandardMaterial({ color: '#efe7d8', roughness: 0.45 });
    const canvasTex = (w, h, draw, srgb = true, clamp = true) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return tex(c, srgb, clamp); };

    // nameplate
    await progress('Engraving the nameplate');
    const plateW = 1560, plateH = 600;
    const drawPlate = (x, isBump) => {
      if (isBump) { x.fillStyle = '#fff'; x.fillRect(0, 0, plateW, plateH); }
      else { const g = x.createLinearGradient(0, 0, plateW, plateH); g.addColorStop(0, '#a77f34'); g.addColorStop(0.45, '#d4b062'); g.addColorStop(1, '#9c7530'); x.fillStyle = g; x.fillRect(0, 0, plateW, plateH);
        for (let i = 0; i < 2600; i++) { x.fillStyle = Math.random() < 0.5 ? 'rgba(255,240,200,0.05)' : 'rgba(60,40,10,0.06)'; x.fillRect(Math.random() * plateW - 200, Math.random() * plateH, 200 + Math.random() * 600, 1 + Math.random() * 1.5); } }
      const ink = isBump ? '#000' : '#050302', hi = 'rgba(255,244,215,0.9)';
      const txt = (s, font, ls, y) => { x.font = font; x.letterSpacing = ls; x.textAlign = 'center'; x.textBaseline = 'alphabetic'; if (!isBump) { x.fillStyle = hi; x.fillText(s, plateW / 2 + 1, y + 3); } x.fillStyle = ink; x.fillText(s, plateW / 2, y); };
      x.strokeStyle = isBump ? '#000' : 'rgba(70,48,14,0.7)'; x.lineWidth = 5; x.strokeRect(34, 34, plateW - 68, plateH - 68);
      if (!isBump) { x.strokeStyle = hi; x.lineWidth = 1.5; x.strokeRect(38, 38, plateW - 76, plateH - 76); }
      txt('OCTOBER CALIBRATION', '700 104px "Cormorant Garamond", serif', '8px', 268);
      x.fillStyle = ink; x.fillRect(plateW / 2 - 90, 330, 180, 3);
      txt('ADITYA VERMA', '700 76px "Cormorant Garamond", serif', '20px', 448);
    };
    const plateMap = canvasTex(plateW, plateH, x => drawPlate(x, false));
    const plateBump = canvasTex(plateW, plateH, x => drawPlate(x, true), false);
    const plateMat = new T.MeshStandardMaterial({ map: plateMap, bumpMap: plateBump, bumpScale: 2.2, metalness: 0.85, roughness: 0.36 });

    const aoLin = canvasTex(4, 128, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.3, 'rgba(0,0,0,0.4)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
    const aoBlob = canvasTex(256, 256, (x) => { x.filter = 'blur(26px)'; x.fillStyle = '#000'; x.fillRect(56, 56, 144, 144); });
    const skyTex = canvasTex(512, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f7e6c4'); g.addColorStop(0.55, '#ffd9a0'); g.addColorStop(0.8, '#f2b467'); g.addColorStop(1, '#c98a4a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.filter = 'blur(16px)'; for (let i = 0; i < 26; i++) { x.fillStyle = `rgba(${110 + Math.random() * 40},${80 + Math.random() * 30},${40},${0.35 + Math.random() * 0.3})`; x.beginPath(); x.ellipse(Math.random() * w, h * 0.62 + Math.random() * h * 0.4, 40 + Math.random() * 80, 30 + Math.random() * 70, 0, 0, 6.3); x.fill(); }
      x.filter = 'blur(40px)'; x.fillStyle = 'rgba(255,240,205,0.8)'; x.beginPath(); x.ellipse(w * 0.3, h * 0.5, 120, 90, 0, 0, 6.3); x.fill(); });
    const recordTex = canvasTex(512, 512, (x, w) => { x.fillStyle = '#0d0c0b'; x.fillRect(0, 0, w, w); for (let r = 250; r > 90; r -= 1.5) { x.strokeStyle = `rgba(${40 + Math.random() * 30},${40 + Math.random() * 30},${40 + Math.random() * 30},0.5)`; x.lineWidth = 0.7; x.beginPath(); x.arc(256, 256, r, 0, 6.3); x.stroke(); }
      x.fillStyle = '#8f2f1c'; x.beginPath(); x.arc(256, 256, 84, 0, 6.3); x.fill(); x.strokeStyle = 'rgba(230,190,120,0.6)'; x.lineWidth = 2; x.beginPath(); x.arc(256, 256, 70, 0, 6.3); x.stroke(); x.fillStyle = '#ddd'; x.beginPath(); x.arc(256, 256, 5, 0, 6.3); x.fill(); });
    const recordMat = new T.MeshStandardMaterial({ map: recordTex, roughness: 0.28, metalness: 0.1 });
    const felt = new T.MeshStandardMaterial({ color: '#2a1612', roughness: 1 });

    await progress('Furnishing the room');
    // ---------- geometry helpers ----------
    const boxGeo = (w, h, d, s, rot, sharp) => { const rr = Math.min(0.014, 0.2 * Math.min(w, h, d)); const g = !sharp && rr > 0.0008 ? new RoundedBoxGeometry(w, h, d, 3, rr) : new T.BoxGeometry(w, h, d);
      const P = g.attributes.position, Nn = g.attributes.normal, uv = g.attributes.uv, ou = Math.random() * 4, ov = Math.random() * 4;
      for (let i = 0; i < P.count; i++) { const x = P.getX(i) + w / 2, y = P.getY(i) + h / 2, z = P.getZ(i) + d / 2, nx = Math.abs(Nn.getX(i)), ny = Math.abs(Nn.getY(i)), nz = Math.abs(Nn.getZ(i));
        let u, v; if (nx >= ny && nx >= nz) { u = z; v = y; } else if (ny >= nz) { u = x; v = z; } else { u = x; v = y; } u /= s; v /= s; if (rot) { const t = u; u = v; v = t; } uv.setXY(i, u + ou, v + ov); } return g; };
    const add = (geo, mat, x, y, z, parent, o = {}) => { const me = new T.Mesh(geo, mat); me.position.set(x, y, z); me.castShadow = o.cast !== false; me.receiveShadow = o.recv !== false; (parent || scene).add(me); return me; };
    const B = (w, h, d, mat, x, y, z, parent, o = {}) => add(boxGeo(w, h, d, o.s || 0.7, o.rot, o.sharp), mat, x, y, z, parent, o);
    const BX = (x0, x1, y0, y1, z0, z1, mat, parent, o = {}) => B(x1 - x0, y1 - y0, z1 - z0, mat, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, parent, o);
    const RB = (w, h, d, r, mat, x, y, z, parent, o = {}) => { const g = new RoundedBoxGeometry(w, h, d, 6, r); const uv = g.attributes.uv; const k = Math.max(w, h, d) / (o.s || 0.35); for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * k, uv.getY(i) * k); return add(g, mat, x, y, z, parent, o); };
    const CY = (rt, rb, h, mat, x, y, z, parent, o = {}) => add(new T.CylinderGeometry(rt, rb, h, o.seg || 48), mat, x, y, z, parent, o);
    const aoPlane = (w, h, t, op) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: 0, map: t, transparent: true, opacity: op, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 })); m.renderOrder = 2; return m; };
    const floorSeam = (x, z, len, yaw, op, depth = 0.42) => { const g = new T.Group(); g.position.set(x, 0.002, z); g.rotation.y = yaw; const p = aoPlane(len, depth, aoLin, op); p.rotation.x = -Math.PI / 2; p.position.z = depth / 2; g.add(p); scene.add(g); };
    const wallSeam = (x, z, len, yaw, op, ht = 0.3, y0 = 0) => { const g = new T.Group(); g.position.set(x, y0, z); g.rotation.y = yaw; const p = aoPlane(len, ht, aoLin, op); p.rotation.z = Math.PI; p.position.set(0, ht / 2, 0.002); g.add(p); scene.add(g); };
    const cornerAO = (x, z, yaw, side, op, h, w = 0.5) => { const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = yaw; const p = aoPlane(h, w, aoLin, op); p.rotation.z = side * Math.PI / 2; p.position.set(-side * w / 2, h / 2, 0.002); g.add(p); scene.add(g); };
    const blob = (x, y, z, w, d, op, parent) => { const p = aoPlane(w, d, aoBlob, op); p.rotation.x = -Math.PI / 2; p.position.set(x, y, z); (parent || scene).add(p); return p; };

    // ---------- architecture ----------
    const RX0 = -2.0, RX1 = 3.4, RZB = -4.0, H = 2.9, TW = 0.16, HX = 0.92, HZ = 4.8, RLX = -0.8, SWX = -2.0, SY = -2.7;
    const WZ0 = -3.72, WZ1 = -1.62, WY0 = 0.62, WY1 = 2.52;
    { const fg = new T.PlaneGeometry(RX1 - RX0 + 0.4, 0.1 - RZB + 0.2); const uv = fg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 5.8 / 1.2, uv.getY(i) * 10 / 2.4);
      const f = add(fg, this.floorMat, 0, 0, (0.1 + RZB - 0.2) / 2, scene, { cast: false }); f.rotation.x = -Math.PI / 2;
      const hm = this.floorMat.clone(); hm.color = new T.Color('#5b3d2b'); hm.roughness = 0.32;
      const hg = new T.PlaneGeometry(HX - RLX, HZ); const hu = hg.attributes.uv; for (let i = 0; i < hu.count; i++) hu.setXY(i, hu.getX(i) * (HX - RLX) / 1.2, hu.getY(i) * HZ / 2.4);
      const hf = add(hg, hm, (HX + RLX) / 2, 0.001, HZ / 2 + 0.04, scene, { cast: false }); hf.rotation.x = -Math.PI / 2;
      const sf = add(new T.PlaneGeometry(RLX - SWX, HZ), new T.MeshStandardMaterial({ color: '#3a2a20', roughness: 0.8 }), (RLX + SWX) / 2, SY, HZ / 2, scene, { cast: false }); sf.rotation.x = -Math.PI / 2; }
    const ws = { s: 1.3 };
    const R0x = (a, b) => a + Math.random() * (b - a);
    const lime = (() => { const S = 1024, mk = () => { const c = document.createElement('canvas'); c.width = c.height = S; return [c, c.getContext('2d', { willReadFrequently: true })]; };
      const layer = (dst, n, rMax, blur, col, aspect) => { const [t, tx] = mk(); for (let k = 0; k < n; k++) { tx.fillStyle = col(); const px = Math.random() * S, py = Math.random() * S, rr = rMax * (0.4 + Math.random()), an = Math.random() * 3;
          for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) { if (px + ox + rr * 1.5 < 0 || px + ox - rr * 1.5 > S || py + oy + rr * 1.5 < 0 || py + oy - rr * 1.5 > S) continue; tx.beginPath(); tx.ellipse(px + ox, py + oy, rr * 1.4, rr * aspect, an, 0, 6.3); tx.fill(); } }
        dst.filter = 'blur(' + blur + 'px)'; for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) dst.drawImage(t, ox, oy); dst.filter = 'none'; };
      const [c, x] = mk(); x.fillStyle = '#d6c2a2'; x.fillRect(0, 0, S, S);
      const tone = (a) => () => { const t = Math.random(); return t < 0.5 ? 'rgba(' + (168 + t * 40 | 0) + ',' + (146 + t * 30 | 0) + ',' + (112 + t * 20 | 0) + ',' + a + ')' : 'rgba(' + (228 + t * 24 | 0) + ',' + (216 + t * 22 | 0) + ',' + (192 + t * 20 | 0) + ',' + a + ')'; };
      layer(x, 40, 120, 60, tone(0.22), 1); layer(x, 140, 50, 26, tone(0.14), 1); layer(x, 500, 18, 8, tone(0.08), 1);
      const img = x.getImageData(0, 0, S, S), d = img.data; for (let k = 0; k < d.length; k += 4) { const n = (Math.random() - 0.5) * 14; d[k] += n; d[k + 1] += n; d[k + 2] += n; } x.putImageData(img, 0, 0);
      const [bc, bx] = mk(); bx.fillStyle = '#808080'; bx.fillRect(0, 0, S, S);
      const gv = (a) => () => { const v = Math.random() < 0.5 ? 40 : 215; return 'rgba(' + v + ',' + v + ',' + v + ',' + a + ')'; };
      layer(bx, 260, 70, 10, gv(0.22), 0.28); layer(bx, 1400, 22, 2, gv(0.12), 0.28);
      const bi = bx.getImageData(0, 0, S, S), bd = bi.data; for (let k = 0; k < bd.length; k += 4) { const n = (Math.random() - 0.5) * 60; bd[k] += n; bd[k + 1] += n; bd[k + 2] += n; } bx.putImageData(bi, 0, 0);
      for (let k = 0; k < 14; k++) { bx.strokeStyle = 'rgba(30,30,30,0.35)'; bx.lineWidth = 1.2; let px = Math.random() * S, py = Math.random() * S; bx.beginPath(); bx.moveTo(px, py); for (let q = 0; q < 8; q++) { px += R0x(-18, 18); py += R0x(4, 22); bx.lineTo(px, py); } bx.stroke(); }
      const bt = tex(bc, false); bt.repeat.set(0.45, 0.45);
      const m = new T.MeshStandardMaterial({ map: tex(c), bumpMap: bt, bumpScale: 2.4, roughness: 0.96 }); m.map.repeat.set(0.45, 0.45); return m; })();
    BX(RX0 - TW, RX1 + TW, 0, H, RZB - TW, RZB, lime, scene, ws);
    BX(RX1, RX1 + TW, 0, H, RZB, 0.08, plaster, scene, ws);
    BX(RX0 - TW, RX0, 0, H, RZB, WZ0, plaster, scene, ws);
    BX(RX0 - TW, RX0, 0, H, WZ1, 0.08, plaster, scene, ws);
    BX(RX0 - TW, RX0, 0, WY0, WZ0, WZ1, plaster, scene, ws);
    BX(RX0 - TW, RX0, WY1, H, WZ0, WZ1, plaster, scene, ws);
    BX(RX0 - TW, RX1 + TW, H, H + 0.12, RZB - TW, 0.08, ceiling, scene, ws);
    const fw = [plaster, plaster, plaster, plaster, hallPlaster, plaster];
    const FW = (x0, x1, y0, y1) => { const m = BX(x0, x1, y0, y1, -0.08, 0.08, plaster, scene, ws); m.material = fw; };
    FW(RX0 - TW, -0.49, 0, H); FW(0.49, RX1 + TW, 0, H); FW(-0.49, 0.49, 2.14, H);
    BX(SWX - TW, SWX, SY, H, 0, HZ, hallPlaster, scene, ws); BX(HX, HX + TW, 0, H, 0, HZ, hallPlaster, scene, ws);
    BX(SWX - TW, HX + TW, SY, H, HZ, HZ + TW, hallPlaster, scene, ws);
    BX(SWX - TW, HX + TW, H, H + 0.12, 0.08, HZ + TW, hallPlaster, scene, ws);
    BX(SWX, RLX, SY, 0, 0, 0.08, hallPlaster, scene, ws);
    BX(RLX - 0.03, RLX, -0.24, 0.0, 0.08, HZ, doorPaint, scene, { s: 1 }); BX(RLX - 0.04, RLX + 0.01, -0.01, 0.03, 0.08, HZ, doorPaint, scene, { s: 1 });
    // right wall: chair rail + framed blank print
    BX(HX - 0.022, HX, 0.86, 0.9, 0.1, HZ, doorPaint); BX(HX - 0.012, HX, 0.83, 0.86, 0.1, HZ, doorPaint);
    { const fz = 1.75, fy = 1.62, fw = 0.62, fh = 0.82, d = 0.035, fm = new T.MeshStandardMaterial({ color: '#141210', roughness: 0.5 });
      BX(HX - d, HX, fy - fh / 2, fy - fh / 2 + 0.03, fz - fw / 2, fz + fw / 2, fm); BX(HX - d, HX, fy + fh / 2 - 0.03, fy + fh / 2, fz - fw / 2, fz + fw / 2, fm);
      BX(HX - d, HX, fy - fh / 2, fy + fh / 2, fz - fw / 2, fz - fw / 2 + 0.03, fm); BX(HX - d, HX, fy - fh / 2, fy + fh / 2, fz + fw / 2 - 0.03, fz + fw / 2, fm);
      BX(HX - 0.012, HX - 0.004, fy - fh / 2 + 0.03, fy + fh / 2 - 0.03, fz - fw / 2 + 0.03, fz + fw / 2 - 0.03, new T.MeshStandardMaterial({ color: '#cfc6b6', roughness: 0.9 }));
      BX(HX - 0.014, HX - 0.011, fy - 0.2, fy + 0.22, fz - 0.17, fz + 0.17, new T.MeshStandardMaterial({ color: '#8f877a', roughness: 0.6 })); }
    // banister over the stairwell
    { const hr = walnut; BX(RLX - 0.035, RLX + 0.035, 0.9, 0.95, 0.32, HZ, hr, scene, { rot: true }); BX(RLX - 0.03, RLX + 0.03, 0.03, 0.07, 0.32, HZ, doorPaint);
      BX(RLX - 0.05, RLX + 0.05, 0, 1.08, 0.22, 0.32, doorPaint); BX(RLX - 0.065, RLX + 0.065, 1.08, 1.12, 0.205, 0.335, doorPaint); add(new T.SphereGeometry(0.04, 18, 12), doorPaint, RLX, 1.15, 0.27);
      const bal = new T.LatheGeometry([[0, 0], [0.024, 0], [0.024, 0.09], [0.017, 0.12], [0.022, 0.16], [0.013, 0.22], [0.012, 0.7], [0.017, 0.74], [0.013, 0.77], [0.013, 0.83], [0, 0.83]].map(p => new T.Vector2(p[0], p[1])), 14);
      for (let z = 0.44; z < HZ - 0.05; z += 0.125) add(bal, doorPaint, RLX, 0.07, z); }
    // baseboards
    const bbR = { s: 1 };
    BX(RX0, RX1, 0, 0.12, RZB, RZB + 0.018, trim, scene, bbR); BX(RX1 - 0.018, RX1, 0, 0.12, RZB, -0.08, trim, scene, bbR);
    BX(RX0, RX0 + 0.018, 0, 0.12, RZB, -0.08, trim, scene, bbR);
    BX(RX0, -0.6, 0, 0.12, -0.098, -0.08, trim, scene, bbR); BX(0.6, RX1, 0, 0.12, -0.098, -0.08, trim, scene, bbR);
    BX(RLX, -0.62, 0, 0.16, 0.08, 0.1, doorPaint, scene, { rot: true }); BX(0.62, HX, 0, 0.16, 0.08, 0.1, doorPaint, scene, { rot: true });  BX(HX - 0.02, HX, 0, 0.16, 0.08, HZ, doorPaint, scene, { rot: true });
    // door surround (hallway side doorPaint, room side trim)
    BX(-0.49, -0.47, 0, 2.14, -0.08, 0.08, doorPaint); BX(0.47, 0.49, 0, 2.14, -0.08, 0.08, doorPaint); BX(-0.49, 0.49, 2.12, 2.14, -0.08, 0.08, doorPaint, scene, { rot: true });
    BX(-0.62, -0.47, 0, 2.27, 0.08, 0.102, doorPaint); BX(0.47, 0.62, 0, 2.27, 0.08, 0.102, doorPaint);
    BX(-0.66, 0.66, 2.12, 2.3, 0.08, 0.104, doorPaint, scene, { rot: true }); BX(-0.69, 0.69, 2.3, 2.345, 0.08, 0.125, doorPaint, scene, { rot: true }); BX(-0.67, 0.67, 2.345, 2.36, 0.08, 0.112, doorPaint, scene, { rot: true });
    BX(-0.635, -0.455, 0, 0.21, 0.08, 0.112, doorPaint); BX(0.455, 0.635, 0, 0.21, 0.08, 0.112, doorPaint);
    BX(-0.49, 0.49, 0, 0.012, -0.06, 0.09, doorPaint, scene, { rot: true });
    BX(-0.6, -0.47, 0, 2.25, -0.1, -0.08, trim); BX(0.47, 0.6, 0, 2.25, -0.1, -0.08, trim); BX(-0.6, 0.6, 2.12, 2.25, -0.1, -0.08, trim);
    // window — stained wood double-hung pair, tree outside
    { const wm = tableWood, wo = { s: 0.5 }, wr = { s: 0.5, rot: true }, zm = (WZ0 + WZ1) / 2;
      BX(RX0 - TW, RX0 + 0.07, WY0 - 0.04, WY0, WZ0 - 0.1, WZ1 + 0.1, wm, scene, wr);
      BX(RX0, RX0 + 0.022, WY0 - 0.15, WY0 - 0.04, WZ0 - 0.07, WZ1 + 0.07, wm, scene, wr);
      BX(RX0, RX0 + 0.024, WY0 - 0.04, WY1 + 0.1, WZ0 - 0.1, WZ0, wm, scene, wo); BX(RX0, RX0 + 0.024, WY0 - 0.04, WY1 + 0.1, WZ1, WZ1 + 0.1, wm, scene, wo);
      BX(RX0, RX0 + 0.024, WY1, WY1 + 0.1, WZ0 - 0.1, WZ1 + 0.1, wm, scene, wr);
      BX(RX0 - TW, RX0, WY0, WY1, WZ0, WZ0 + 0.008, wm, scene, wo); BX(RX0 - TW, RX0, WY0, WY1, WZ1 - 0.008, WZ1, wm, scene, wo); BX(RX0 - TW, RX0, WY1 - 0.008, WY1, WZ0, WZ1, wm, scene, wr);
      BX(RX0 - TW + 0.01, RX0 + 0.024, WY0, WY1, zm - 0.055, zm + 0.055, wm, scene, wo);
      const sash = (x0, x1, z0, z1, y0, y1, cols, rows) => { const fb = 0.05, mb = 0.022;
        BX(x0, x1, y0, y0 + fb, z0, z1, wm, scene, wr); BX(x0, x1, y1 - fb, y1, z0, z1, wm, scene, wr); BX(x0, x1, y0, y1, z0, z0 + fb, wm, scene, wo); BX(x0, x1, y0, y1, z1 - fb, z1, wm, scene, wo);
        for (let c = 1; c < cols; c++) { const z = z0 + fb + (z1 - z0 - 2 * fb) * c / cols; BX(x0 + 0.006, x1 - 0.006, y0, y1, z - mb / 2, z + mb / 2, wm, scene, wo); }
        for (let r = 1; r < rows; r++) { const y = y0 + fb + (y1 - y0 - 2 * fb) * r / rows; BX(x0 + 0.006, x1 - 0.006, y - mb / 2, y + mb / 2, z0, z1, wm, scene, wr); } };
      const ys = WY0 + (WY1 - WY0) * 0.58;
      [[WZ0 + 0.008, zm - 0.055], [zm + 0.055, WZ1 - 0.008]].forEach(([z0, z1]) => { sash(RX0 - 0.075, RX0 - 0.03, z0, z1, WY0, ys + 0.025, 2, 3); sash(RX0 - 0.125, RX0 - 0.08, z0, z1, ys - 0.025, WY1 - 0.008, 2, 2); });
      const glass = add(new T.PlaneGeometry(WZ1 - WZ0, WY1 - WY0), new T.MeshStandardMaterial({ color: '#dfe7ea', transparent: true, opacity: 0.07, roughness: 0.05, depthWrite: false }), RX0 - 0.1, (WY0 + WY1) / 2, zm, scene, { cast: false, recv: false });
      glass.rotation.y = Math.PI / 2;
      // ---------- street outside: modelled suburban street, lit by the same sun ----------
      await progress('Building the street');
      { const SY0 = -0.5, oz = -14, LZ = 124, NX0 = RX0 - TW, PF = -14.1, HX = -21, zA = oz - LZ / 2, zB = oz + LZ / 2;
        this.outside = []; this.outGlow = []; this.outStd = []; this.litGlass = []; this.streetL = [];
        const R0 = (a, b) => a + Math.random() * (b - a), rgb = (r, g, b, a) => 'rgba(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ',' + (a == null ? 1 : a) + ')';
        const cv = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); return c; };
        const speck = (x, w, h, n, f) => { for (let i = 0; i < n; i++) { x.fillStyle = f(); x.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); } };
        const TR = (c, s = true) => tex(c, s, false), TC = (c) => tex(c, true, true);
        // sky dome + matching environment light for everything outside
        const skyC = cv(1024, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#c98a6a'); g.addColorStop(0.22, '#eba878'); g.addColorStop(0.38, '#f8c07a'); g.addColorStop(0.47, '#ffd08a'); g.addColorStop(0.52, '#ffbf72'); g.addColorStop(0.56, '#e8a46e'); g.addColorStop(1, '#b88a62'); x.fillStyle = g; x.fillRect(0, 0, w, h);
          const su = 0.112 * w, sv = 0.41 * h; [su - w, su, su + w].forEach(cx => { const r = x.createRadialGradient(cx, sv, 0, cx, sv, h * 0.45); r.addColorStop(0, 'rgba(255,240,200,1)'); r.addColorStop(0.1, 'rgba(255,206,120,0.7)'); r.addColorStop(0.4, 'rgba(255,170,90,0.3)'); r.addColorStop(1, 'rgba(255,150,80,0)'); x.fillStyle = r; x.fillRect(0, 0, w, h); });
          x.filter = 'blur(9px)'; for (let i = 0; i < 60; i++) { const cx = Math.random() * w, cy = h * (0.2 + Math.random() * 0.26), d = Math.min(Math.abs(cx - su), w - Math.abs(cx - su)), nr = Math.max(0, 1 - d / (w * 0.22));
            x.fillStyle = rgb(255, 196 - nr * 30, 150 - nr * 60, 0.22 + Math.random() * 0.3); x.beginPath(); x.ellipse(cx, cy, 60 + Math.random() * 240, 5 + Math.random() * 15, 0, 0, 6.3); x.fill(); } });
        const skyMat = new T.MeshBasicMaterial({ map: TR(skyC), side: T.BackSide, fog: false, depthWrite: false }); skyMat.color.setScalar(1.2);
        const dome = new T.Mesh(new T.SphereGeometry(100, 64, 32), skyMat); dome.renderOrder = -1; dome.userData.noAO = true; scene.add(dome); this.skyM = skyMat;
        const skyScene = new T.Scene(), skyGeo = new T.SphereGeometry(10, 32, 16); skyScene.add(new T.Mesh(skyGeo, skyMat)); const skyEnv = pmrem.fromScene(skyScene, 0.02).texture; this._environmentTextures.push(skyEnv); skyGeo.dispose();
        scene.fog = new T.Fog('#f0b880', 14, 110); this.fogDay = scene.fog.color.clone(); this.fogNight = new T.Color('#0a0e18');
        const OM = (p, e = 1) => { const m = new T.MeshStandardMaterial({ envMap: skyEnv, envMapIntensity: e, ...p }); this.outStd.push({ m, e }); return m; };
        // surface textures
        const brickC = cv(512, 512, (x, w, h) => { x.fillStyle = '#b3a894'; x.fillRect(0, 0, w, h); speck(x, w, h, 3000, () => 'rgba(120,110,95,0.4)');
          for (let r = 0; r < 16; r++) for (let c = -1; c < 6; c++) { const o = (r % 2) * 51.2, t = 0.74 + Math.random() * 0.42, q = Math.random(); x.fillStyle = rgb((152 + q * 34) * t, (76 + q * 16) * t, (52 + q * 8) * t); x.fillRect(c * 102.4 + o + 3, r * 32 + 3, 96, 26.5); }
          speck(x, w, h, 9000, () => Math.random() < 0.5 ? 'rgba(40,20,10,0.14)' : 'rgba(230,200,170,0.14)'); });
        const brickB = cv(512, 512, (x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); for (let r = 0; r < 16; r++) for (let c = -1; c < 6; c++) { const o = (r % 2) * 51.2, v = 170 + Math.random() * 60; x.fillStyle = rgb(v, v, v); x.fillRect(c * 102.4 + o + 3, r * 32 + 3, 96, 26.5); } speck(x, w, h, 8000, () => 'rgba(0,0,0,0.3)'); });
        const sidC = cv(512, 512, (x, w, h) => { const bh = h / 6; for (let i = 0; i < 6; i++) { const g = x.createLinearGradient(0, i * bh, 0, (i + 1) * bh); g.addColorStop(0, '#f7f4ee'); g.addColorStop(0.86, '#e0dbd1'); g.addColorStop(1, '#948e83'); x.fillStyle = g; x.fillRect(0, i * bh, w, bh); } speck(x, w, h, 2500, () => 'rgba(150,140,120,0.12)'); });
        const sidB = cv(512, 512, (x, w, h) => { const bh = h / 6; for (let i = 0; i < 6; i++) { const g = x.createLinearGradient(0, i * bh, 0, (i + 1) * bh); g.addColorStop(0, '#5a5a5a'); g.addColorStop(0.9, '#e6e6e6'); g.addColorStop(1, '#000'); x.fillStyle = g; x.fillRect(0, i * bh, w, bh); } });
        const shC = cv(512, 512, (x, w, h) => { x.fillStyle = '#242426'; x.fillRect(0, 0, w, h); const rh = h / 10; for (let r = 0; r < 10; r++) { const o = (r % 2) * 51.2 + (r % 3) * 17; for (let c = -1; c < 6; c++) { const v = 92 * (0.68 + Math.random() * 0.46); x.fillStyle = rgb(v, v - 2, v - 5); x.fillRect(c * 102.4 + o + 2, r * rh + 2, 98, rh - 5); } }
          speck(x, w, h, 16000, () => Math.random() < 0.5 ? 'rgba(0,0,0,0.2)' : 'rgba(205,198,186,0.18)'); });
        const shB = cv(512, 512, (x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); const rh = h / 10; for (let r = 0; r < 10; r++) { const o = (r % 2) * 51.2 + (r % 3) * 17; for (let c = -1; c < 6; c++) { const g = x.createLinearGradient(0, r * rh, 0, (r + 1) * rh); g.addColorStop(0, '#707070'); g.addColorStop(1, '#f0f0f0'); x.fillStyle = g; x.fillRect(c * 102.4 + o + 2, r * rh + 2, 98, rh - 5); } } speck(x, w, h, 9000, () => 'rgba(0,0,0,0.25)'); });
        const conC = cv(256, 256, (x, w, h) => { x.fillStyle = '#bdb7ac'; x.fillRect(0, 0, w, h); speck(x, w, h, 5000, () => { const v = 150 + Math.random() * 70; return rgb(v, v - 3, v - 10, 0.35); }); x.filter = 'blur(10px)'; for (let i = 0; i < 4; i++) { x.fillStyle = 'rgba(90,85,75,0.08)'; x.beginPath(); x.arc(Math.random() * w, Math.random() * h, 30 + Math.random() * 40, 0, 6.3); x.fill(); } x.filter = 'none'; x.fillStyle = 'rgba(80,75,68,0.6)'; x.fillRect(0, 0, w, 2); x.fillRect(0, 0, 2, h); });
        const conB = cv(256, 256, (x, w, h) => { x.fillStyle = '#999'; x.fillRect(0, 0, w, h); speck(x, w, h, 7000, () => Math.random() < 0.5 ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'); x.fillStyle = '#000'; x.fillRect(0, 0, w, 3); x.fillRect(0, 0, 3, h); });
        const asC = cv(512, 512, (x, w, h) => { x.fillStyle = '#404144'; x.fillRect(0, 0, w, h); speck(x, w, h, 26000, () => { const v = 48 + Math.random() * 64; return rgb(v, v, v + 2, 0.6); }); x.filter = 'blur(16px)'; for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(25,25,28,0.22)'; x.beginPath(); x.ellipse(Math.random() * w, Math.random() * h, 40 + Math.random() * 80, 20 + Math.random() * 50, Math.random() * 3, 0, 6.3); x.fill(); } x.filter = 'none';
          x.strokeStyle = 'rgba(16,16,18,0.75)'; x.lineWidth = 3; for (let i = 0; i < 3; i++) { let px = Math.random() * w, py = 0; x.beginPath(); x.moveTo(px, py); while (py < h) { py += 12 + Math.random() * 20; px += (Math.random() - 0.5) * 22; x.lineTo(px, py); } x.stroke(); } });
        const asB = cv(512, 512, (x, w, h) => { x.fillStyle = '#808080'; x.fillRect(0, 0, w, h); speck(x, w, h, 32000, () => Math.random() < 0.5 ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)'); });
        const grC = cv(512, 512, (x, w, h) => { x.fillStyle = '#4f6a26'; x.fillRect(0, 0, w, h); x.lineWidth = 1.4; for (let i = 0; i < 24000; i++) { const t = Math.random(), px = Math.random() * w, py = Math.random() * h, an = R0(-0.5, 0.5); x.strokeStyle = rgb(66 + t * 92, 96 + t * 72, 26 + t * 30, 0.55); x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.sin(an) * 6, py - Math.cos(an) * 9); x.stroke(); }
          x.filter = 'blur(22px)'; for (let i = 0; i < 10; i++) { x.fillStyle = Math.random() < 0.5 ? 'rgba(180,170,80,0.12)' : 'rgba(20,40,10,0.14)'; x.beginPath(); x.arc(Math.random() * w, Math.random() * h, 40 + Math.random() * 60, 0, 6.3); x.fill(); } });
        const grB = cv(512, 512, (x, w, h) => { x.fillStyle = '#777'; x.fillRect(0, 0, w, h); x.lineWidth = 1.4; for (let i = 0; i < 16000; i++) { const v = Math.random() * 255, px = Math.random() * w, py = Math.random() * h; x.strokeStyle = rgb(v, v, v, 0.5); x.beginPath(); x.moveTo(px, py); x.lineTo(px + R0(-3, 3), py - 9); x.stroke(); } });
        const bkC = cv(128, 256, (x, w, h) => { x.fillStyle = '#4a3b2e'; x.fillRect(0, 0, w, h); for (let i = 0; i < 280; i++) { const v = 40 + Math.random() * 60; x.fillStyle = rgb(v + 20, v + 8, v, 0.6); x.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 4, 20 + Math.random() * 60); } });
        const louC = cv(64, 256, (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); for (let y = 8; y < h - 8; y += 11) { const g = x.createLinearGradient(0, y, 0, y + 11); g.addColorStop(0, '#fff'); g.addColorStop(1, '#8a8a8a'); x.fillStyle = g; x.fillRect(6, y, w - 12, 11); } x.strokeStyle = '#bdbdbd'; x.lineWidth = 6; x.strokeRect(3, 3, w - 6, h - 6); });
        const garC = cv(512, 384, (x, w, h) => { x.fillStyle = '#f2efe9'; x.fillRect(0, 0, w, h); const rh = h / 4, cw = w / 4; for (let r = 0; r < 4; r++) { x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(0, r * rh, w, 3); for (let c = 0; c < 4; c++) { const px = c * cw + 12, py = r * rh + 14, pw = cw - 24, ph = rh - 28;
          if (r === 0) { x.fillStyle = '#39414a'; x.fillRect(px, py, pw, ph); x.fillStyle = 'rgba(255,255,255,0.18)'; x.fillRect(px, py, pw, 4); } else { x.fillStyle = 'rgba(0,0,0,0.08)'; x.fillRect(px, py, pw, ph); x.fillStyle = 'rgba(255,255,255,0.7)'; x.fillRect(px, py + ph - 3, pw, 3); x.fillRect(px + pw - 3, py, 3, ph); x.fillStyle = 'rgba(0,0,0,0.22)'; x.fillRect(px, py, pw, 3); x.fillRect(px, py, 3, ph); } } } });
        const glassC = (k) => cv(128, 192, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2b2824'); g.addColorStop(1, '#4b433a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
          if (k !== 1) for (const sx of [0, w - 30]) { x.fillStyle = '#e4dacb'; x.fillRect(sx, 0, 30, h); x.fillStyle = 'rgba(110,100,86,0.35)'; for (let i = 0; i < 5; i++) x.fillRect(sx + 3 + i * 6, 0, 2, h); }
          if (k > 0) { const bh = h * (k === 1 ? 0.46 : 0.26); x.fillStyle = '#efe7da'; x.fillRect(0, 0, w, bh); x.fillStyle = 'rgba(0,0,0,0.13)'; for (let y = 4; y < bh; y += 6) x.fillRect(0, y, w, 1); } });
        const leafC = cv(256, 256, (x, w, h) => { for (let i = 0; i < 14; i++) { x.save(); x.translate(w / 2 + R0(-58, 58), h / 2 + R0(-58, 58)); x.rotate(R0(0, 6.28)); const L = R0(46, 78), Wd = L * 0.4, t = Math.random();
          x.fillStyle = rgb(72 + t * 64, 104 + t * 58, 36 + t * 26); x.beginPath(); x.moveTo(0, -L / 2); x.quadraticCurveTo(Wd, 0, 0, L / 2); x.quadraticCurveTo(-Wd, 0, 0, -L / 2); x.fill(); x.strokeStyle = 'rgba(28,46,18,0.45)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(0, -L / 2); x.lineTo(0, L / 2); x.stroke(); x.restore(); } });
        // materials
        const brT = [TR(brickC), TR(brickB, false)], siT = [TR(sidC), TR(sidB, false)], shT = [TR(shC), TR(shB, false)], coT = [TR(conC), TR(conB, false)];
        const brickMs = ['#ffffff', '#f2d4b2'].map(c => OM({ map: brT[0], bumpMap: brT[1], bumpScale: 2.2, roughness: 0.92, color: c }, 0.9));
        const sidingMs = ['#f4f1ea', '#c6d0d6', '#e2d6bd', '#b7c0ad'].map(c => OM({ map: siT[0], bumpMap: siT[1], bumpScale: 1.6, roughness: 0.72, color: c }));
        const roofMs = ['#d2d2d6', '#b8a898', '#8e8f93'].map(c => OM({ map: shT[0], bumpMap: shT[1], bumpScale: 2.6, roughness: 0.95, color: c, side: T.DoubleSide }, 0.8));
        const trimM = OM({ color: '#f4f1eb', roughness: 0.55 }), concM = OM({ map: coT[0], bumpMap: coT[1], bumpScale: 1, roughness: 0.88 }, 0.9);
        const asphM = OM({ map: TR(asC), bumpMap: TR(asB, false), bumpScale: 1.2, roughness: 0.84 }, 0.9), grassM = OM({ map: TR(grC), bumpMap: TR(grB, false), bumpScale: 2, roughness: 0.96 }, 0.7);
        const barkM = OM({ map: TR(bkC), bumpMap: TR(bkC, false), bumpScale: 3, roughness: 0.95 }, 0.6), darkM = OM({ color: '#1e2022', metalness: 0.55, roughness: 0.45 });
        const doorMs = ['#5a1e1b', '#1e3242', '#2f4232', '#efe9df'].map(c => OM({ color: c, roughness: 0.4 })), louT = TC(louC), shutMs = ['#2a3036', '#3b2b22', '#33403a'].map(c => OM({ map: louT, color: c, roughness: 0.55 }));
        const garM = OM({ map: TC(garC), roughness: 0.5 }), glassMs = [0, 1, 2].map(k => OM({ map: TC(glassC(k)), roughness: 0.05, metalness: 0.1 }, 1.8));
        const glassLit = [0, 1, 2].map(k => { const t = TC(glassC(k)); const m = OM({ map: t, roughness: 0.05, metalness: 0.1, emissive: '#ffb660', emissiveMap: t, emissiveIntensity: 0 }, 1.8); this.litGlass.push(m); return m; });
        const porchM = OM({ color: '#f6ead4', emissive: '#ffc070', emissiveIntensity: 0, roughness: 0.4 }); this.litGlass.push(porchM);
        const mailM = OM({ color: '#202326', metalness: 0.4, roughness: 0.4 }), redM = OM({ color: '#a8231c', roughness: 0.5 }), leafM = OM({ map: TC(leafC), alphaTest: 0.45, side: T.DoubleSide, roughness: 0.8 }, 0.7);
        const lensM = OM({ color: '#f3ead8', emissive: '#ffc27a', emissiveIntensity: 0, roughness: 0.3 }); this.lampHeadM = lensM;
        // geometry helpers
        const roofGeo = (len, span, rise, oh, s) => { const hw = span / 2 + oh, yE = -oh * rise / (span / 2), sl = Math.hypot(hw, rise - yE), pos = [], uv = [], idx = [];
          [1, -1].forEach(sx => { const b = pos.length / 3; pos.push(sx * hw, yE, -len / 2, sx * hw, yE, len / 2, 0, rise, len / 2, 0, rise, -len / 2); uv.push(0, 0, len / s, 0, len / s, sl / s, 0, sl / s);
            if (sx > 0) idx.push(b, b + 2, b + 1, b, b + 3, b + 2); else idx.push(b, b + 1, b + 2, b, b + 2, b + 3); });
          const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g; };
        const triGeo = (span, rise, s) => { const g = new T.ShapeGeometry(new T.Shape([new T.Vector2(-span / 2, 0), new T.Vector2(span / 2, 0), new T.Vector2(0, rise)])); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / s, uv.getY(i) / s); return g; };
        const ground = (x0, x1, z0, z1, y, mat, s) => { const g = new T.PlaneGeometry(x1 - x0, z1 - z0); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (x1 - x0) / s, uv.getY(i) * (z1 - z0) / s); const p = add(g, mat, (x0 + x1) / 2, y, (z0 + z1) / 2, scene, { cast: false }); p.rotation.x = -Math.PI / 2; return p; };
        const bake = (grp) => { grp.updateMatrixWorld(true); const by = new Map(); grp.traverse(o => { if (!o.isMesh) return; let g = o.geometry.clone().applyMatrix4(o.matrixWorld); if (g.index) g = g.toNonIndexed(); for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
            if (!by.has(o.material)) by.set(o.material, { gs: [], cast: false }); const e = by.get(o.material); e.gs.push(g); e.cast = e.cast || o.castShadow; });
          by.forEach((e, mat) => { const m = new T.Mesh(mergeGeometries(e.gs), mat); m.castShadow = e.cast; m.receiveShadow = true; scene.add(m); }); };
        const blocked = (x, z, r, top) => { const t = (x + 2.1) / -0.72; if (t < 0) return false; return Math.abs(z - (-2.67 + 0.61 * t)) < r + 1.4 && top > 0.62 + 0.28 * t; };
        const fol = [], folBg = [];
        const cards = (list, cx, cy, cz, rx, ry, rz, n, s0, s1, tone) => { for (let i = 0; i < n; i++) { let ux = R0(-1, 1), uy = R0(-1, 1), uz = R0(-1, 1); const l = Math.hypot(ux, uy, uz) || 1; ux /= l; uy /= l; uz /= l;
          const rad = 0.55 + 0.45 * Math.sqrt(Math.random()), sh = (0.5 + 0.5 * (uy * 0.5 + 0.5)) * (0.55 + 0.45 * rad) * R0(0.85, 1.15); list.push([cx + ux * rx * rad, cy + uy * ry * rad, cz + uz * rz * rad, R0(s0, s1), sh * tone[0], sh * tone[1], sh * tone[2]]); } };
        const trunks = new T.Group(), misc = new T.Group(), up = new T.Vector3(0, 1, 0);
        const tree = (x, z, ht, r, list, n, s0, s1, cast) => { const th = ht * 0.5, k = r / 2.5; CY(0.12 * k, 0.24 * k, th, barkM, x, SY0 + th / 2, z, trunks, { seg: 10, cast });
          for (let i = 0; i < 5; i++) { const an = R0(0, 6.28), tl = R0(0.45, 0.95), len = r * R0(0.7, 1.05), dir = new T.Vector3(Math.cos(an) * Math.sin(tl), Math.cos(tl), Math.sin(an) * Math.sin(tl)); const br = CY(0.03 * k, 0.09 * k, len, barkM, 0, 0, 0, trunks, { seg: 6, cast }); br.quaternion.setFromUnitVectors(up, dir); br.position.set(x, SY0 + th * R0(0.78, 1), z).addScaledVector(dir, len / 2); }
          const cy = SY0 + ht * 0.66, tone = [R0(1.0, 1.25), R0(1.0, 1.15), R0(0.65, 0.9)]; for (let c = 0; c < 6; c++) cards(list, x + R0(-0.45, 0.45) * r, cy + R0(-0.3, 0.35) * r * 0.8, z + R0(-0.45, 0.45) * r, r * 0.62, r * 0.5, r * 0.62, Math.round(n / 6), s0, s1, tone); };
        // ground: front yard, footpaths, verges, kerbs, road, lawns
        ground(-3.2, NX0, zA, zB, SY0, grassM, 2);
        B(1.2, 0.08, LZ, concM, -3.8, SY0 - 0.02, oz, scene, { s: 1.5, cast: false });
        ground(-4.85, -4.4, zA, zB, SY0, grassM, 2);
        B(0.15, 0.22, LZ, concM, -4.925, SY0 - 0.09, oz, scene, { s: 1.5, cast: false }); B(0.15, 0.22, LZ, concM, -12.275, SY0 - 0.09, oz, scene, { s: 1.5, cast: false });
        ground(-12.2, -5.0, zA, zB, SY0 - 0.15, asphM, 4);
        ground(-12.9, -12.35, zA, zB, SY0, grassM, 2);
        B(1.2, 0.08, LZ, concM, -13.5, SY0 - 0.02, oz, scene, { s: 1.5, cast: false });
        ground(-66, PF, oz - 66, oz + 66, SY0, grassM, 2.2);
        // grass blades along the near verge (the only lawn close enough to read blade by blade)
        { const bg = new T.BufferGeometry(); bg.setAttribute('position', new T.Float32BufferAttribute([-0.012, 0, 0, 0.012, 0, 0, 0.002, 0.12, 0.016], 3)); bg.setAttribute('normal', new T.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
          const N = this.lite ? 2500 : 6000, im = new T.InstancedMesh(bg, OM({ color: '#ffffff', roughness: 0.9, side: T.DoubleSide }, 0.7), N), mx = new T.Matrix4(), q = new T.Quaternion(), c = new T.Color();
          for (let i = 0; i < N; i++) { mx.compose(new T.Vector3(R0(-4.85, -4.4), SY0, R0(-42, 6)), q.setFromAxisAngle(up, R0(0, 6.28)), new T.Vector3(1, R0(0.6, 1.4), 1)); im.setMatrixAt(i, mx); im.setColorAt(i, c.setRGB(R0(0.2, 0.36), R0(0.32, 0.48), R0(0.08, 0.16))); }
          im.receiveShadow = true; im.userData.noAO = true; scene.add(im); }
        // houses across the street
        const house = (hx, zc, hk) => { const g = new T.Group(); g.position.set(hx, SY0, zc); const m = hk % 2 ? -1 : 1, brick = hk % 3 !== 1;
          const wallM = brick ? brickMs[hk % 2] : sidingMs[hk % 4], bayM = brick ? sidingMs[(hk >> 1) % 2 ? 0 : 2] : wallM, roofM = roofMs[hk % 3], doorM = doorMs[hk % 4];
          const W = 8, D = 8.5, H = 5.6, RS = 2.3, OH = 0.45, dr = OH * RS / (D / 2);
          const win = (fx, z, y, w, ht, sh) => { const k = Math.random() * 3 | 0, gm = Math.random() < 0.45 ? glassLit[k] : glassMs[k];
            add(new T.PlaneGeometry(w, ht), gm, fx + 0.004, y + ht / 2, z, g, { cast: false }).rotation.y = Math.PI / 2;
            const tw = 0.09, td = 0.06; B(td, tw, w + 2 * tw, trimM, fx + td / 2, y + ht + tw / 2, z, g); B(td, tw, w + 2 * tw, trimM, fx + td / 2, y - tw / 2, z, g);
            B(td, ht, tw, trimM, fx + td / 2, y + ht / 2, z - w / 2 - tw / 2, g); B(td, ht, tw, trimM, fx + td / 2, y + ht / 2, z + w / 2 + tw / 2, g);
            B(0.13, 0.05, w + 0.34, trimM, fx + 0.065, y - tw - 0.02, z, g); B(0.08, 0.06, w + 0.3, trimM, fx + 0.04, y + ht + tw + 0.03, z, g);
            B(0.025, ht, 0.035, trimM, fx + 0.016, y + ht / 2, z, g, { cast: false }); B(0.025, 0.035, w, trimM, fx + 0.016, y + ht * 0.52, z, g, { cast: false });
            if (sh) { const sm = shutMs[(k + hk) % 3]; [-1, 1].forEach(s => add(new T.BoxGeometry(0.035, ht + 0.1, w * 0.45), sm, fx + 0.02, y + ht / 2, z + s * (w / 2 + tw + w * 0.225 + 0.02), g)); } };
          const rake = (x, y0, zc2, span, rise, oh) => { const bd = oh * rise / (span / 2), half = span / 2 + oh, len = Math.hypot(half, rise + bd), an = Math.atan2(rise + bd, half);
            [1, -1].forEach(s => { const rb = B(0.06, 0.18, len, trimM, x, y0 + rise - (rise + bd) / 2 - 0.06, zc2 + s * half / 2, g); rb.rotation.x = s * an; }); };
          // main block
          B(D, H, W, wallM, -D / 2, H / 2, 0, g, { s: 1.2 }); B(D + 0.08, 0.45, W + 0.08, concM, -D / 2, 0.18, 0, g, { s: 1.5 });
          add(roofGeo(W + 2 * OH, D, RS, OH, 1.5), roofM, -D / 2, H, 0, g); [1, -1].forEach(s => { const t = add(triGeo(D, RS, 1.2), wallM, -D / 2, H, s * W / 2, g); if (s < 0) t.rotation.y = Math.PI; });
          [OH, -D - OH].forEach(xx => B(0.04, 0.2, W + 2 * OH, trimM, xx, H - dr - 0.08, 0, g)); B(OH, 0.02, W + 2 * OH, trimM, OH / 2, H - dr, 0, g); B(0.03, 0.18, W, trimM, 0.015, H - 0.09, 0, g);
          if (!brick) [-1, 1].forEach(s => B(0.03, H, 0.14, trimM, 0.015, H / 2, s * (W / 2 - 0.07), g));
          // projecting front gable bay
          const zb = m * 2.1, BW = 3.2, BP = 0.8, BR = 2.0, BO = 0.35, Lb = BP + BO + D / 2;
          B(BP, H, BW, bayM, BP / 2, H / 2, zb, g, { s: 1.2 }); B(BP + 0.08, 0.45, BW + 0.08, concM, BP / 2, 0.18, zb, g, { s: 1.5 });
          add(roofGeo(Lb, BW, BR, BO, 1.5), roofM, BP + BO - Lb / 2, H, zb, g).rotation.y = Math.PI / 2; add(triGeo(BW, BR, 1.2), bayM, BP, H, zb, g).rotation.y = Math.PI / 2; rake(BP + BO - 0.02, H, zb, BW, BR, BO);
          B(0.03, 0.18, BW, trimM, BP + 0.015, H - 0.09, zb, g); [-1, 1].forEach(s => B(0.03, H, 0.14, trimM, BP + 0.015, H / 2, zb + s * (BW / 2 - 0.07), g));
          win(BP, zb, H + 0.45, 0.75, 0.85, false); win(BP, zb - 0.55, 3.3, 0.82, 1.35, false); win(BP, zb + 0.55, 3.3, 0.82, 1.35, false); win(BP, zb, 0.95, 2.0, 1.55, false);
          // main facade windows, porch, door
          win(0, -m * 2.75, 3.3, 0.9, 1.35, true); win(0, -m * 0.95, 3.3, 0.9, 1.35, true); win(0, -m * 2.95, 0.95, 1.05, 1.5, true);
          const zp = -m * 1.75, zd = -m * 1.05; B(1.7, 0.4, 3.6, concM, 0.85, 0.2, zp, g, { s: 1.5 }); B(0.36, 0.27, 1.4, concM, 1.88, 0.135, zd, g, { s: 1.5 }); B(0.36, 0.13, 1.4, concM, 2.24, 0.065, zd, g, { s: 1.5 });
          [-1, 1].forEach(s => B(0.16, 2.2, 0.16, trimM, 1.55, 1.5, zp + s * 1.65, g)); B(0.16, 0.2, 3.7, trimM, 1.55, 2.68, zp, g); B(1.65, 0.03, 3.6, trimM, 0.82, 2.77, zp, g);
          const pr = B(1.95, 0.07, 3.95, roofM, 0.9, 3.0, zp, g, { s: 1.5 }); pr.rotation.z = -0.2;
          B(0.05, 2.15, 1.02, doorM, 0.025, 0.4 + 1.075, zd, g); B(0.07, 0.12, 1.28, trimM, 0.035, 2.66, zd, g); [-1, 1].forEach(s => B(0.07, 2.2, 0.12, trimM, 0.035, 1.5, zd + s * 0.57, g));
          [0.95, 1.85].forEach(yy => [-1, 1].forEach(s => B(0.016, yy > 1 ? 0.62 : 0.72, 0.34, doorM, 0.058, yy, zd + s * 0.21, g, { cast: false }))); B(0.04, 0.05, 0.05, brass, 0.075, 1.42, zd + m * 0.38, g, { cast: false });
          B(0.08, 0.24, 0.11, porchM, 0.06, 2.05, zd + m * 0.8, g, { cast: false });
          // garage wing, set back
          const zg = -m * 5.8, GW = 3.6, GD = 6.5, GH = 3.0, gx = -1.0;
          B(GD, GH, GW, wallM, gx - GD / 2, GH / 2, zg, g, { s: 1.2 }); B(GD + 0.08, 0.3, GW + 0.08, concM, gx - GD / 2, 0.1, zg, g, { s: 1.5 });
          add(roofGeo(GD + 0.3, GW, 1.4, 0.3, 1.5), roofM, gx - GD / 2 + 0.15, GH, zg, g).rotation.y = Math.PI / 2; add(triGeo(GW, 1.4, 1.2), bayM, gx, GH, zg, g).rotation.y = Math.PI / 2; rake(gx + 0.28, GH, zg, GW, 1.4, 0.3);
          add(new T.PlaneGeometry(2.8, 2.15), garM, gx + 0.006, 0.12 + 1.075, zg, g, { cast: false }).rotation.y = Math.PI / 2;
          B(0.07, 0.12, 3.06, trimM, gx + 0.035, 2.33, zg, g); [-1, 1].forEach(s => B(0.07, 2.2, 0.12, trimM, gx + 0.035, 1.2, zg + s * 1.47, g)); B(0.03, 0.18, GW, trimM, gx + 0.015, GH - 0.09, zg, g);
          // chimney on the far gable, unless it would shade the sunbeam into the room
          const t0 = (hx + 2.1) / -0.72; if (Math.abs(zc - (-2.67 + 0.61 * t0)) > 9) { const ch = H + RS + 1.1; B(1.0, ch, 0.7, brickMs[0], -D * 0.55, ch / 2, m * (W / 2 + 0.35), g, { s: 1.2 }); B(1.12, 0.12, 0.82, concM, -D * 0.55, ch + 0.06, m * (W / 2 + 0.35), g); }
          bake(g);
          // hard landscaping and planting (world space)
          B(PF - (hx + gx), 0.05, 3.4, concM, (hx + gx + PF) / 2, SY0 + 0.0, zc + zg, scene, { s: 1.5, cast: false });
          B(PF - (hx + 2.42), 0.05, 1.1, concM, (hx + 2.42 + PF) / 2, SY0 + 0.0, zc + zd, scene, { s: 1.5, cast: false });
          [[0.55, -m * 2.95, 0.7], [0.55, -m * 0.15, 0.45], [BP + 0.5, zb - 1.0, 0.6], [BP + 0.5, zb + 0.4, 0.55], [BP + 0.5, zb + 1.3, 0.5], [-D - 0.2, m * 4.6, 0.9]].forEach(([bx, bz, r]) => cards(fol, hx + bx, SY0 + r * 0.7, zc + bz, r, r * 0.8, r, Math.round(70 * r), 0.24, 0.38, [0.75, 0.92, 0.7]));
          const mx = -12.62, mz = zc + zg + m * 2.0; B(0.09, 1.05, 0.09, darkM, mx, SY0 + 0.52, mz, misc); RB(0.22, 0.24, 0.5, 0.08, mailM, mx, SY0 + 1.12, mz, misc); B(0.02, 0.16, 0.03, redM, mx - 0.12, SY0 + 1.24, mz + 0.12, misc, { cast: false });
          if (hk % 3 === 2) for (let p = 0; p < 22; p++) B(0.03, 0.9, 0.08, trimM, PF - 0.4, SY0 + 0.45, zc + m * (4.6 + p * 0.14), misc); };
        for (let i = 0; i < 10; i++) house(HX + R0(-0.9, 0.9), -62 + i * 11.4, i);
        // street trees, verge tree framing the window, distant canopy
        for (let i = 0; i < 10; i++) { const z = -62 + i * 11.4 + 5.7 + R0(-0.6, 0.6), ht = R0(8, 10.5), r = R0(2.3, 3.0); if (!blocked(-15.3, z, r, ht + SY0)) tree(-15.3, z, ht, r, fol, 780, 0.6, 1.0, true); }
        [-9.5, -21].forEach(z => tree(-4.65, z, 9.5, 3.0, fol, 900, 0.6, 1.0, true));
        for (let i = 0; i < 34; i++) { const x = R0(-33, -54), z = R0(-78, 48), ht = R0(9, 14), r = R0(3, 4.6); if (!blocked(x, z, r, ht + SY0)) tree(x, z, ht, r, folBg, 150, 1.5, 2.3, false); }
        bake(trunks);
        const mkFol = (list, cast) => { const im = new T.InstancedMesh(new T.PlaneGeometry(1, 1), leafM, list.length), mx = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(), sc = new T.Vector3(), ps = new T.Vector3(), c = new T.Color();
          list.forEach((d, i) => { q.setFromEuler(e.set(R0(0, 6.28), R0(0, 6.28), R0(0, 6.28))); mx.compose(ps.set(d[0], d[1], d[2]), q, sc.setScalar(d[3])); im.setMatrixAt(i, mx); im.setColorAt(i, c.setRGB(d[4], d[5], d[6])); });
          im.castShadow = cast; im.receiveShadow = true; im.userData.noAO = true; scene.add(im); };
        mkFol(fol, true); mkFol(folBg, false);
        // street lamps (lit at night), hydrant
        const poolT = canvasTex(128, 128, (x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, '#fff'); g.addColorStop(0.45, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
        [-27, -6, 16].forEach(z => { const x = -12.62; CY(0.055, 0.085, 5.6, darkM, x, SY0 + 2.8, z, misc, { seg: 12 }); B(1.4, 0.06, 0.06, darkM, x + 0.7, SY0 + 5.45, z, misc); RB(0.6, 0.14, 0.3, 0.04, darkM, x + 1.35, SY0 + 5.38, z, misc);
          add(new T.PlaneGeometry(0.5, 0.22), lensM, x + 1.35, SY0 + 5.305, z, misc, { cast: false }).rotation.x = Math.PI / 2;

          const pm = new T.MeshBasicMaterial({ map: poolT, color: '#ffb35c', transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, fog: false }); const p = add(new T.PlaneGeometry(9, 9), pm, x + 1.35, SY0 - 0.14, z, scene, { cast: false, recv: false }); p.rotation.x = -Math.PI / 2; p.renderOrder = 4; p.userData.noAO = true; this.outGlow.push(pm); });
        CY(0.11, 0.13, 0.55, redM, -12.62, SY0 + 0.27, -12.5, misc, { seg: 14 }); add(new T.SphereGeometry(0.12, 14, 8), redM, -12.62, SY0 + 0.55, -12.5, misc); B(0.36, 0.08, 0.08, redM, -12.62, SY0 + 0.38, -12.5, misc);
        bake(misc); }
      const haze = add(new T.PlaneGeometry(WZ1 - WZ0 + 0.2, WY1 - WY0 + 0.2), new T.MeshBasicMaterial({ color: '#ffd29a', transparent: true, opacity: 0.2, depthWrite: false }), RX0 - 0.14, (WY0 + WY1) / 2, zm, scene, { cast: false, recv: false });
      haze.rotation.y = Math.PI / 2; haze.material.color.setScalar(1.6); this.hazeM = haze.material;
      // tree branches between the sun and the glass — they paint the leaf shadows inside
      const leafTex = canvasTex(96, 256, (x, w, h) => { x.beginPath(); x.moveTo(w / 2, h * 0.98); x.bezierCurveTo(w * 0.02, h * 0.7, w * 0.08, h * 0.2, w / 2, h * 0.02); x.bezierCurveTo(w * 0.92, h * 0.2, w * 0.98, h * 0.7, w / 2, h * 0.98);
        const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#6f9640'); g.addColorStop(1, '#2f5a26'); x.fillStyle = g; x.fill(); x.strokeStyle = 'rgba(210,230,150,0.5)'; x.lineWidth = 2; x.beginPath(); x.moveTo(w / 2, h); x.lineTo(w / 2, h * 0.05); x.stroke(); });
      const lg = new T.PlaneGeometry(0.42, 1, 2, 4); lg.translate(0, 0.5, 0); { const lp = lg.attributes.position; for (let i = 0; i < lp.count; i++) { const y = lp.getY(i), xx = lp.getX(i); lp.setZ(i, 0.12 * y * y - 0.3 * xx * xx); } lg.computeVertexNormals(); }
      const leafMat = new T.MeshStandardMaterial({ map: leafTex, alphaTest: 0.5, side: T.DoubleSide, roughness: 0.6 });
      const tree = new T.Group(); scene.add(tree); this.tree = tree;
      const Dn = new T.Vector3(6.5, -2.5, -5.5).normalize(); const Wp = (zf, yf, t) => new T.Vector3(RX0 - TW, WY0 + (WY1 - WY0) * yf, WZ0 + (WZ1 - WZ0) * zf).addScaledVector(Dn, -t);
      const pivot = Wp(0.4, -0.4, 1.4); tree.position.copy(pivot);
      const dmy = new T.Object3D(), rnd = (a, b) => a + Math.random() * (b - a), M = [], toSun = Dn.clone().negate();
      const barkMat = new T.MeshStandardMaterial({ color: '#4a3a2a', roughness: 0.9 }), fruitMat = new T.MeshStandardMaterial({ color: '#e08a2c', roughness: 0.5 });
      const branch = (pts, n, r) => { const c = new T.CatmullRomCurve3(pts.map(p => Wp(...p).sub(pivot))); add(new T.TubeGeometry(c, 40, r, 6), barkMat, 0, 0, 0, tree, { recv: false });
        for (let i = 0; i < n; i++) { const tt = 0.15 + 0.85 * Math.random(); const p = c.getPoint(tt).add(new T.Vector3(rnd(-0.08, 0.08), rnd(-0.1, 0.1), rnd(-0.12, 0.12)));
          dmy.position.copy(p); dmy.lookAt(p.clone().add(toSun).add(new T.Vector3(rnd(-0.7, 0.7), rnd(-0.7, 0.7), rnd(-0.7, 0.7)))); dmy.rotateZ(rnd(-3.1, 3.1)); dmy.scale.setScalar(rnd(0.09, 0.16)); dmy.updateMatrix(); M.push(dmy.matrix.clone()); }
        for (let i = 0; i < 2; i++) { const p = c.getPoint(rnd(0.4, 0.9)); add(new T.SphereGeometry(0.036, 16, 12), fruitMat, p.x, p.y - 0.06, p.z, tree, { recv: false }); } };
      branch([[-0.15, -0.2, 1.5], [0.15, 0.2, 1.3], [0.38, 0.42, 1.1], [0.55, 0.55, 1.0]], 120, 0.012);
      branch([[1.15, 0.1, 1.4], [0.9, 0.35, 1.25], [0.72, 0.58, 1.1], [0.62, 0.78, 1.0]], 110, 0.011);
      branch([[0.1, 1.2, 1.6], [0.3, 0.95, 1.35], [0.5, 0.88, 1.2], [0.72, 1.0, 1.1]], 90, 0.01);
      branch([[0.15, 0.2, 1.3], [0.05, 0.45, 1.2], [0.1, 0.7, 1.1]], 50, 0.008);
      const leaves = new T.InstancedMesh(lg, leafMat, M.length); const col = new T.Color();
      M.forEach((m, i) => { leaves.setMatrixAt(i, m); col.setHSL(0.24 + rnd(-0.03, 0.03), rnd(0.3, 0.5), rnd(0.55, 0.8)); leaves.setColorAt(i, col); });
      leaves.castShadow = true; tree.add(leaves);
    }
    // curtains
    this.curtains = [];
    const curtain = (zA, zB) => { const w = zA - zB, hgt = 2.64; const geo = new T.PlaneGeometry(w, hgt, Math.ceil(w * 100), 34);
      const cz = (zA + zB) / 2; const glow = canvasTex(256, 4, (x, cw, ch) => { for (let i = 0; i < cw; i++) { const wz = cz - (i / cw - 0.5) * w; const inW = Math.max(0, Math.min(1, (Math.min(wz - WZ0, WZ1 - wz)) / 0.12 + 0.5)); const l = 0.08 + 0.92 * inW * (0.85 + 0.15 * Math.random()); x.fillStyle = `rgb(${255 * l | 0},${215 * l | 0},${160 * l | 0})`; x.fillRect(i, 0, 1, ch); } });
      const mat = new T.MeshStandardMaterial({ color: '#fbf8f2', roughness: 0.95, transparent: true, opacity: 0.74, side: T.DoubleSide, emissive: '#ffffff', emissiveMap: glow, emissiveIntensity: 0.75, depthWrite: false });
      const m = add(geo, mat, RX0 + 0.1, 0.02 + hgt / 2, cz, scene, { cast: false }); m.rotation.y = Math.PI / 2; m.renderOrder = 3;
      const base = Float32Array.from(geo.attributes.position.array), folds = new Float32Array(geo.attributes.position.count), weights = new Float32Array(folds.length);
      for (let i = 0; i < folds.length; i++) { const wz = cz - base[i * 3], top = Math.max(0, Math.min(1, (hgt / 2 - base[i * 3 + 1]) / hgt)); weights[i] = top * top; folds[i] = 0.032 * Math.sin(wz * 46 + 0.8 * Math.sin(wz * 11)) * (0.75 + 0.25 * top) + 0.035 * top; }
      this.curtains.push({ m, base, folds, weights, cz, hgt, updatedAt: -Infinity, normalsAt: -Infinity }); };
    curtain(WZ0 + 0.38, WZ0 - 0.26); curtain(WZ1 - 0.3, WZ1 - 0.95);
    // fairy lights — swags across the window head, strands down both jambs
    { const fx = RX0 + 0.05, pts = [], paths = []; const sw = 5, top = WY1 + 0.05;
      const head = []; for (let i = 0; i <= 200; i++) { const u = i / 200, z = WZ0 - 0.05 + (WZ1 - WZ0 + 0.1) * u, s = Math.sin(Math.PI * ((u * sw) % 1)); head.push(new T.Vector3(fx, top - 0.16 * Math.pow(s, 1.4), z)); } paths.push(head);
      [WZ0 - 0.04, WZ1 + 0.04].forEach((z, k) => { const p = []; for (let i = 0; i <= 80; i++) { const u = i / 80; p.push(new T.Vector3(fx, top - u * (top - WY0 + 0.05), z + (k ? -1 : 1) * 0.025 * Math.sin(u * 22))); } paths.push(p); });
      const wireM = new T.MeshStandardMaterial({ color: '#2f3326', roughness: 0.6 });
      paths.forEach(p => { const c = new T.CatmullRomCurve3(p); add(new T.TubeGeometry(c, p.length, 0.0013, 4), wireM, 0, 0, 0, scene, { cast: false, recv: false }); const L = c.getLength(); for (let d = 0.02; d < L; d += 0.065) pts.push(c.getPointAt(d / L)); });
      const bm = new T.MeshStandardMaterial({ color: '#fff4dc', emissive: '#ffc777', emissiveIntensity: 0.5, roughness: 0.3 });
      const im = new T.InstancedMesh(new T.SphereGeometry(0.0075, 10, 8), bm, pts.length); const mx = new T.Matrix4();
      pts.forEach((p, i) => { mx.makeTranslation(p.x, p.y, p.z); im.setMatrixAt(i, mx); }); im.userData.noAO = true; scene.add(im);
      const fl = { intensity: 0 };
      this.fairy = { mat: bm, light: fl }; }
    { const rodM = new T.MeshStandardMaterial({ color: '#d9d3c8', metalness: 0.7, roughness: 0.35 }), z0 = WZ0 - 0.3, z1 = WZ1 + 0.34;
      CY(0.011, 0.011, z1 - z0, rodM, RX0 + 0.1, 2.69, (z0 + z1) / 2, scene, { seg: 16 }).rotation.x = Math.PI / 2;
      [z0, z1].forEach(z => { add(new T.SphereGeometry(0.022, 16, 12), rodM, RX0 + 0.1, 2.69, z, scene); BX(RX0, RX0 + 0.1, 2.68, 2.7, z + (z === z0 ? 0.04 : -0.06), z + (z === z0 ? 0.06 : -0.04), rodM); }); }


    await wait();
    // ---------- door ----------
    const door = new T.Group(); door.position.set(-0.465, 0.006, -0.052); door.userData.tag = 'door'; scene.add(door); this.door = door;
    { const W = 0.93, DH = 2.11, DT = 0.044, dz = 0.022, st = 0.13, ms = 0.1, tr = 0.13, lr0 = 0.9, lr1 = 1.18, br = 0.23;
      const P = (x0, x1, y0, y1, t, rot) => BX(x0, x1, y0, y1, dz - t / 2, dz + t / 2, doorPaint, door, { rot, s: 0.6, sharp: true });
      P(0, st, 0, DH, DT); P(W - st, W, 0, DH, DT);
      P(st, W - st, DH - tr, DH, DT, true); P(st, W - st, lr0, lr1, DT, true); P(st, W - st, 0, br, DT, true);
      P(W / 2 - ms / 2, W / 2 + ms / 2, br, lr0, DT); const fr0 = 1.47, fr1 = 1.73; P(st, W - st, fr0, fr1, DT, true); P(W / 2 - ms / 2, W / 2 + ms / 2, lr1, fr0, DT); P(W / 2 - ms / 2, W / 2 + ms / 2, fr1, DH - tr, DT);
      const panels = [[st, W / 2 - ms / 2, br, lr0], [W / 2 + ms / 2, W - st, br, lr0], [st, W / 2 - ms / 2, lr1, fr0], [W / 2 + ms / 2, W - st, lr1, fr0], [st, W / 2 - ms / 2, fr1, DH - tr], [W / 2 + ms / 2, W - st, fr1, DH - tr]];
      panels.forEach(([x0, x1, y0, y1]) => { P(x0, x1, y0, y1, 0.018); P(x0 + 0.045, x1 - 0.045, y0 + 0.045, y1 - 0.045, 0.03);
        [1, -1].forEach(sd => { const zf = dz + sd * (0.009 + 0.004), m = 0.014;
          const mo = { rot: true, cast: false }, mv = { cast: false };
          BX(x0, x1, y0, y0 + m, zf - 0.004, zf + 0.004, doorPaint, door, mo); BX(x0, x1, y1 - m, y1, zf - 0.004, zf + 0.004, doorPaint, door, mo);
          BX(x0, x0 + m, y0, y1, zf - 0.004, zf + 0.004, doorPaint, door, mv); BX(x1 - m, x1, y0, y1, zf - 0.004, zf + 0.004, doorPaint, door, mv); }); });
      const plate = add(new T.BoxGeometry(0.54, 0.2, 0.005), [brass, brass, brass, brass, plateMat, brass], W / 2, (fr0 + fr1) / 2, DT + 0.0025, door); plate.receiveShadow = false; plateMat.color = new T.Color('#c9bfae');
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { const sc = add(new T.SphereGeometry(0.0045, 12, 8), brass, W / 2 + a * 0.25, (fr0 + fr1) / 2 + b * 0.08, DT + 0.005, door); sc.scale.z = 0.4; });
      this.levers = [];
      [[1, DT], [-1, 0]].forEach(([sd, face]) => {
        const bp = add(new RoundedBoxGeometry(0.046, 0.19, 0.008, 2, 0.003), brass, W - 0.062, 0.95, face + sd * 0.004, door);
        const kh = add(new T.CylinderGeometry(0.004, 0.004, 0.004, 12), blackMetal, W - 0.062, 0.89, face + sd * 0.009, door); kh.rotation.x = Math.PI / 2;
        BX(W - 0.0645, W - 0.0595, 0.872, 0.888, face + sd * 0.008 - 0.001, face + sd * 0.008 + 0.001, blackMetal, door);
        const lv = new T.Group(); lv.position.set(W - 0.062, 1.0, face + sd * 0.008); door.add(lv); this.levers.push(lv);
        const rose = CY(0.022, 0.025, 0.012, brass, 0, 0, sd * 0.006, lv); rose.rotation.x = Math.PI / 2;
        const neck = CY(0.009, 0.01, 0.05, brass, 0, 0, sd * 0.03, lv); neck.rotation.x = Math.PI / 2;
        const arm = CY(0.0085, 0.0095, 0.12, brass, -0.058, 0, sd * 0.055, lv); arm.rotation.z = Math.PI / 2;
        add(new T.SphereGeometry(0.0115, 16, 12), brass, -0.118, 0, sd * 0.055, lv);
      });
      [0.25, 1.05, 1.85].forEach(y => CY(0.007, 0.007, 0.1, brass, 0, y, 0, door));
    }
    // light under the door
    this.glow = add(new T.PlaneGeometry(0.9, 0.5), new T.MeshBasicMaterial({ map: aoLin, color: '#ffbe78', transparent: true, opacity: 0.55, blending: T.AdditiveBlending, depthWrite: false }), 0, 0.003, 0.08 + 0.25, scene, { cast: false, recv: false });
    this.glow.rotation.x = -Math.PI / 2; this.glow.rotation.z = Math.PI;

    await wait();
    // ---------- cabinet ----------
    const cab = new T.Group(); cab.position.set(-0.1, 0, RZB + 0.272); cab.scale.setScalar(1.12); cab.userData.tag = 'drawer'; scene.add(cab);
    { const W = 1.12, D = 0.46, Y0 = 0.16, Y1 = 0.8;
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => CY(0.024, 0.022, Y1, oak, a * (W / 2 - 0.024), Y1 / 2, b * (D / 2 - 0.024), cab));
      RB(W + 0.02, 0.035, D + 0.02, 0.006, oak, 0, Y1 + 0.0175, 0, cab, { s: 0.7 });
      B(0.018, Y1 - Y0, D - 0.05, oak, -(W / 2 - 0.03), (Y0 + Y1) / 2, 0, cab); B(0.018, Y1 - Y0, D - 0.05, oak, W / 2 - 0.03, (Y0 + Y1) / 2, 0, cab);
      B(W - 0.05, 0.02, D - 0.04, oak, 0, Y0 + 0.01, 0, cab); B(W - 0.05, Y1 - Y0, 0.012, oak, 0, (Y0 + Y1) / 2, -D / 2 + 0.02, cab);
      const zf = D / 2 - 0.012;
      B(W - 0.048, 0.024, 0.024, oak, 0, Y1 - 0.012, zf, cab, { rot: true }); B(W - 0.048, 0.03, 0.024, oak, 0, Y0 + 0.015, zf, cab, { rot: true }); B(W - 0.048, 0.02, 0.024, oak, 0, 0.475, zf, cab, { rot: true });
      B(W - 0.06, 0.03, 0.02, oak, 0, Y0 - 0.01, zf, cab, { rot: true });
      const drawer = (y0, y1, files) => { const g = new T.Group(); cab.add(g); const h = y1 - y0, fwid = W - 0.066;
        B(fwid, h - 0.006, 0.02, oak, 0, (y0 + y1) / 2, zf - 0.002, g, { rot: true });
        const dd = 0.38, iw = fwid - 0.03, bz = zf - 0.012 - dd / 2;
        B(0.012, h - 0.05, dd, oak, -iw / 2, y0 + (h - 0.05) / 2 + 0.01, bz, g); B(0.012, h - 0.05, dd, oak, iw / 2, y0 + (h - 0.05) / 2 + 0.01, bz, g);
        B(iw, 0.01, dd, oak, 0, y0 + 0.012, bz, g); B(iw, h - 0.05, 0.012, oak, 0, y0 + (h - 0.05) / 2 + 0.01, bz - dd / 2, g);
        [-0.28, 0.28].forEach(x => { add(new T.SphereGeometry(0.014, 20, 14), darkBronze, x, (y0 + y1) / 2, zf + 0.026, g); CY(0.005, 0.005, 0.02, darkBronze, x, (y0 + y1) / 2, zf + 0.012, g).rotation.x = Math.PI / 2; });
        if (files) for (let i = 0; i < 11; i++) { const fh = h - 0.075 + Math.random() * 0.012, z = zf - 0.05 - i * 0.03; const pal = ['#2b55d6', '#127a62', '#5c2470', '#d3281f']; const m = i < 4 ? new T.MeshStandardMaterial({ color: pal[i], roughness: 0.8 }) : kraft.clone(); if (i >= 4) m.color.offsetHSL(0, (Math.random() - 0.5) * 0.06, (Math.random() - 0.5) * 0.06);
          const f = B(iw - 0.05, fh, 0.003, m, 0, y0 + 0.017 + fh / 2, z, g); f.rotation.x = -0.05 - Math.random() * 0.05;
          B(0.09, 0.022, 0.0032, m, -iw / 2 + 0.12 + (i % 4) * 0.21, y0 + 0.017 + fh + 0.009, z, g).rotation.x = f.rotation.x; }
        return g; };
      this.topDrawer = drawer(0.487, Y1 - 0.024, true); drawer(Y0 + 0.03, 0.465, false);
      // objects on top
      const vase = add(new T.LatheGeometry([[0, 0], [0.042, 0], [0.058, 0.03], [0.064, 0.085], [0.054, 0.135], [0.03, 0.172], [0.022, 0.2], [0.027, 0.212], [0.024, 0.214]].map(p => new T.Vector2(p[0], p[1])), 48), ceramic, -0.33, Y1 + 0.035, -0.02, cab);
      const bk = [[0.3, 0.036, 0.22, '#6d6b4b'], [0.27, 0.03, 0.2, '#e7ddca'], [0.25, 0.028, 0.185, '#2c2825']]; let by = Y1 + 0.035;
      bk.forEach(([w, h, d, c], i) => { const m = B(w, h, d, new T.MeshStandardMaterial({ color: c, roughness: 0.8 }), 0.22 + i * 0.006, by + h / 2, 0.01, cab); m.rotation.y = (i - 1) * 0.05; by += h; });
      blob(0, 0.003, 0, W + 0.3, D + 0.3, 0.55, cab); blob(-0.33, Y1 + 0.036, -0.02, 0.2, 0.2, 0.35, cab);
      const wb = aoPlane(W + 0.3, 1.05, aoBlob, 0.28); wb.position.set(0, 0.42, -D / 2 - 0.022); cab.add(wb);
    }
    // ---------- frames (blank display areas, reserved) ----------
    this.slots = [];
    this.frameGs = []; const frame = (cx, cy, w, h, img, ar, fill, file) => { const g = new T.Group(); g.position.set(cx, cy, RZB + 0.004); scene.add(g); if (file !== undefined) { g.userData.tag = 'frame:' + file; g.userData.z0 = g.position.z; this.frameGs.push(g); } const fb = 0.032, fd = 0.034, lip = 0.008;
      if (!this.whiteFM) { this.whiteFM = new T.MeshStandardMaterial({ color: '#f4f2ee', roughness: 0.42, metalness: 0 }); this.matFM = new T.MeshStandardMaterial({ color: '#fbfaf6', roughness: 0.92 }); this.bevFM = new T.MeshStandardMaterial({ color: '#fffefb', roughness: 0.85 }); this.lipFM = new T.MeshStandardMaterial({ color: '#e9e6e0', roughness: 0.5 }); }
      const WF = this.whiteFM;
      B(w, fb, fd, WF, 0, h / 2 - fb / 2, fd / 2, g); B(w, fb, fd, WF, 0, -h / 2 + fb / 2, fd / 2, g);
      B(fb, h - 2 * fb, fd, WF, -w / 2 + fb / 2, 0, fd / 2, g); B(fb, h - 2 * fb, fd, WF, w / 2 - fb / 2, 0, fd / 2, g);
      const ow = w - 2 * fb, oh = h - 2 * fb;
      B(ow, lip, fd - 0.01, this.lipFM, 0, oh / 2 - lip / 2, (fd - 0.01) / 2, g); B(ow, lip, fd - 0.01, this.lipFM, 0, -oh / 2 + lip / 2, (fd - 0.01) / 2, g);
      B(lip, oh - 2 * lip, fd - 0.01, this.lipFM, -ow / 2 + lip / 2, 0, (fd - 0.01) / 2, g); B(lip, oh - 2 * lip, fd - 0.01, this.lipFM, ow / 2 - lip / 2, 0, (fd - 0.01) / 2, g);
      const mw = ow - 2 * lip, mh = oh - 2 * lip, mz = 0.014;
      let iw = mw * (fill || (ar ? 0.74 : 0.62)), ih = ar ? iw / ar : mh * 0.6; if (ih > mh * 0.74) { ih = mh * 0.74; if (ar) iw = ih * ar; }
      const sideW = (mw - iw) / 2, sideH = (mh - ih) / 2, md = 0.004;
      B(mw, sideH, md, this.matFM, 0, ih / 2 + sideH / 2, mz, g); B(mw, sideH, md, this.matFM, 0, -ih / 2 - sideH / 2, mz, g);
      B(sideW, ih, md, this.matFM, -iw / 2 - sideW / 2, 0, mz, g); B(sideW, ih, md, this.matFM, iw / 2 + sideW / 2, 0, mz, g);
      const bv = 0.0035; B(iw + 2 * bv, bv, md, this.bevFM, 0, ih / 2 + bv / 2, mz + 0.0004, g); B(iw + 2 * bv, bv, md, this.bevFM, 0, -ih / 2 - bv / 2, mz + 0.0004, g);
      B(bv, ih, md, this.bevFM, -iw / 2 - bv / 2, 0, mz + 0.0004, g); B(bv, ih, md, this.bevFM, iw / 2 + bv / 2, 0, mz + 0.0004, g);
      B(ow, oh, 0.004, this.lipFM, 0, 0, 0.004, g);
      { const sh = aoPlane(w * 1.78 + 0.06, h * 1.78 + 0.06, aoBlob, 0.32); sh.position.set(0.008, -0.022, -0.001); g.add(sh); }
      const slot = B(iw, ih, 0.002, slotMat, 0, 0, 0.0085, g); slot.userData.slot = this.slots.length; this.slots.push(slot);
      if (img) { const it = new T.TextureLoader().load(img); it.colorSpace = T.SRGBColorSpace; it.anisotropy = aniso; add(new T.PlaneGeometry(iw, ih), new T.MeshStandardMaterial({ map: it, roughness: 0.55, transparent: true }), 0, 0, 0.0098, g, { cast: false }); }
    };
    frame(-0.38, 1.56, 0.56, 0.36, '702ce176-3746-4b5c-b0ad-3a6b06108006', 2576 / 1456, 0, 5); frame(0.12, 1.87, 0.32, 0.32, '26bf8d8a-5e0e-45c8-ab41-daa650699202', 1, 0.62, 3); frame(0.16, 1.43, 0.42, 0.24, '283e7bcb-02de-475b-9d9f-9cc2c03d5742', 580 / 212, 0.9, 2); frame(0.63, 1.67, 0.44, 0.29, '3eb09b18-06c7-49a5-a7ff-0cf6af297965', 2576 / 1456, 0, 4); frame(0.55, 1.25, 0.26, 0.32, 'ac41b911-eda0-44fd-a322-78c096a44742', 1, 0.9, 0); frame(-0.42, 1.95, 0.36, 0.24, '1a44ea55-4a62-4b22-9699-ab25a9b87193', 938 / 313, 0.82, 1);
    frame(2.52, 1.52, 0.7, 0.96);
    { const pt = new T.TextureLoader().load('63ca9260-e4f1-4204-a3ed-1617b9eee51c'); pt.colorSpace = T.SRGBColorSpace; pt.anisotropy = aniso;
      const pm = add(new T.PlaneGeometry(0.643, 0.907), new T.MeshStandardMaterial({ map: pt, roughness: 0.6 }), 2.52, 1.52, RZB + 0.004 + 0.0185, scene, { cast: false }); }

    // ---------- armchair (cognac leather tub chair, splayed black legs) ----------
    { const s = new T.Group(); s.position.set(-1.2, 0, -2.75); s.rotation.y = 0.62; scene.add(s); s.userData.tag = 'chair';
      const [lgC] = gen(512, 512, (u, v, o) => { const cr = Math.abs(fbm(u * 10, v * 10, 10, 10, 91, 3) - 0.5) * 2, g = vn(u * 220, v * 220, 220, 220, 92), w = fbm(u * 3, v * 3, 3, 3, 93, 2);
        const n = 0.55 + 0.3 * Math.pow(cr, 0.4) + 0.12 * g + 0.15 * (w - 0.5); o[0] = o[1] = o[2] = Math.max(0, Math.min(255, n * 255)); o[3] = 0; });
      const lgT = tex(lgC, false); lgT.repeat.set(3, 3);
      const leather = new T.MeshPhysicalMaterial({ color: '#8c4822', roughness: 0.78, roughnessMap: lgT, bumpMap: lgT, bumpScale: 1.1, clearcoat: 0.18, clearcoatRoughness: 0.55, sheen: 0.3, sheenColor: new T.Color('#e0a070'), sheenRoughness: 0.6 });
      const legM = new T.MeshStandardMaterial({ color: '#1b1714', roughness: 0.45 });
      const prof = []; for (let i = 0; i <= 24; i++) { const t = i / 24; prof.push(new T.Vector2(0.33 + 0.085 * Math.sin(t * Math.PI * 0.85), t)); }
      const p0 = 0.78, pl = Math.PI * 2 - 2 * p0;
      const sg = new T.LatheGeometry(prof, 72, p0, pl); const sp = sg.attributes.position;
      const H = (ph) => 0.25 + 0.38 * (1 - Math.cos(ph)) / 2;
      for (let i = 0; i < sp.count; i++) { const x = sp.getX(i), y = sp.getY(i), z = sp.getZ(i); const ph = Math.atan2(x, z); const r0 = Math.hypot(x, z);
        const r = r0 * (1 + 0.006 * Math.cos(ph * 22)) * (1 - 0.09 * Math.max(0, y - 0.82) / 0.18);
        sp.setXYZ(i, Math.sin(ph) * r * 1.06, 0.3 + y * H(ph), Math.cos(ph) * r); }
      sg.computeVertexNormals(); add(sg, leather, 0, 0, 0, s);
      { const ig = sg.clone(); const ip = ig.attributes.position; for (let i = 0; i < ip.count; i++) { const x = ip.getX(i), z = ip.getZ(i), k = 1 - 0.028 / Math.max(0.2, Math.hypot(x, z)); ip.setX(i, x * k); ip.setZ(i, z * k); }
        const idx = ig.index.array; for (let i = 0; i < idx.length; i += 3) { const t = idx[i]; idx[i] = idx[i + 2]; idx[i + 2] = t; } ig.index.needsUpdate = true; ig.computeVertexNormals(); add(ig, leather, 0, 0, 0, s); }
      const rim = []; for (let i = 0; i <= 40; i++) { const ph = p0 + pl * i / 40; const r = (0.33 + 0.085 * Math.sin(Math.PI * 0.85)) * 0.91 * (1 + 0.006 * Math.cos(ph * 22)); rim.push(new T.Vector3(Math.sin(ph) * r * 1.06, 0.3 + H(ph), Math.cos(ph) * r)); }
      add(new T.TubeGeometry(new T.CatmullRomCurve3(rim), 60, 0.034, 10, false), leather, 0, 0, 0, s);
      const base = add(new T.CylinderGeometry(0.35, 0.33, 0.1, 40), leather, 0, 0.33, 0, s); base.scale.x = 1.06;
      RB(0.6, 0.12, 0.54, 0.055, leather, 0, 0.43, 0.06, s);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => { const l = add(new T.CylinderGeometry(0.019, 0.01, 0.34, 12), legM, sx * 0.23, 0.15, sz * 0.21, s); l.rotation.z = sx * 0.26; l.rotation.x = -sz * 0.26; });
      blob(0, 0.003, 0, 1.0, 1.05, 0.5, s);
    }
    await wait();
    // ---------- bed (low oak platform, rumpled linen) ----------
    { const b = new T.Group(); b.position.set(2.52, 0, RZB + 0.02); scene.add(b);
      const bw = 1.62, bl = 2.06; const lin = (c) => { const m = linen.clone(); m.color = new T.Color(c); return m; };
      B(bw - 0.24, 0.15, bl - 0.24, oak, 0, 0.075, bl / 2 + 0.04, b, { s: 0.8 });
      RB(bw + 0.22, 0.07, bl + 0.14, 0.008, oak, 0, 0.185, bl / 2 + 0.04, b, { s: 0.9, rot: true });
      // under-bed LED strip + floor wash (night)
      { const cz = bl / 2 + 0.04, ex = bw / 2 + 0.1, z0 = -0.02, z1 = bl + 0.14;
        const stripM = new T.MeshStandardMaterial({ color: '#ffe2b8', emissive: '#ffb062', emissiveIntensity: 0, roughness: 0.5 });
        [-1, 1].forEach(s => B(0.02, 0.012, z1 - z0, stripM, s * ex, 0.146, (z0 + z1) / 2, b, { cast: false })); B(2 * ex + 0.02, 0.012, 0.02, stripM, 0, 0.146, z1, b, { cast: false });
        const GW = bw + 1.3, GD = bl + 1.2, glowT = canvasTex(512, 512, (x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); x.filter = 'blur(34px)'; x.fillStyle = '#fff';
          const fw = (2 * ex + 0.06) / GW * w, fd = (z1 - z0 + 0.1) / GD * h; x.fillRect((w - fw) / 2, (h - fd) / 2, fw, fd); });
        const glowM = new T.MeshBasicMaterial({ map: glowT, color: '#ff9a46', transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
        const gp = add(new T.PlaneGeometry(GW, GD), glowM, 0, 0.034, cz, b, { cast: false, recv: false }); gp.rotation.x = -Math.PI / 2; gp.renderOrder = 4; gp.userData.noAO = true;
        const lts = [];
        const hT = canvasTex(64, 8, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#000'); g.addColorStop(0.35, '#5a3a1c'); g.addColorStop(0.5, '#fff'); g.addColorStop(0.65, '#5a3a1c'); g.addColorStop(1, '#000'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
        const vT = canvasTex(8, 64, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#fff'); g.addColorStop(0.3, '#c08a4c'); g.addColorStop(1, '#8a5a2c'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
        const haloM = new T.MeshBasicMaterial({ map: hT, color: '#ffb066', transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide });
        const curtM = new T.MeshBasicMaterial({ map: vT, color: '#ffa452', transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide });
        const glo = (geo, m, x, y, z, rx, ry) => { const p = add(geo, m, x, y, z, b, { cast: false, recv: false }); p.rotation.set(rx, ry, 0, 'YXZ'); p.renderOrder = 5; p.userData.noAO = true; };
        const L = z1 - z0, zc = (z0 + z1) / 2;
        [-1, 1].forEach(s => { glo(new T.PlaneGeometry(0.075, L + 0.04), haloM, s * ex, 0.146, zc, -Math.PI / 2, 0); glo(new T.PlaneGeometry(0.2, L + 0.1), haloM, s * (ex + 0.05), 0.036, zc, -Math.PI / 2, 0); glo(new T.PlaneGeometry(L, 0.15), curtM, s * (ex + 0.008), 0.08, zc, 0, Math.PI / 2); });
        glo(new T.PlaneGeometry(0.075, 2 * ex + 0.06), haloM, 0, 0.146, z1, -Math.PI / 2, Math.PI / 2); glo(new T.PlaneGeometry(0.2, 2 * ex + 0.2), haloM, 0, 0.036, z1 + 0.05, -Math.PI / 2, Math.PI / 2); glo(new T.PlaneGeometry(2 * ex + 0.02, 0.15), curtM, 0, 0.08, z1 + 0.008, 0, 0);
        this.bedLed = { stripM, glowM, lts, haloM, curtM }; }
      RB(bw, 0.2, bl - 0.04, 0.05, lin('#efe7d8'), 0, 0.32, bl / 2 + 0.04, b);
      [[-0.4, 0.2, 0.42, -0.5], [0.4, 0.2, 0.42, -0.45], [-0.36, 0.38, 0.5, -0.25], [0.38, 0.4, 0.5, -0.22]].forEach(([x, z, y, rx], i) => { const p = RB(0.7, 0.17, 0.44, 0.08, lin(i < 2 ? '#e3d6bf' : '#ece2d0'), x, y + 0.02, z, b); p.rotation.set(rx, (i % 2 ? -1 : 1) * 0.04, (i % 2 ? 1 : -1) * 0.03); });
      const top = 0.43, z0 = 0.58, z1 = bl + 0.02, drop = 0.27, W2 = bw / 2 + 0.01;
      const g = new T.PlaneGeometry(bw + 2 * drop, (z1 - z0) + drop, 90, 90); g.rotateX(-Math.PI / 2); const ps = g.attributes.position;
      for (let i = 0; i < ps.count; i++) { const x = ps.getX(i), zz = ps.getZ(i) + ((z1 - z0) + drop) / 2 - drop; const lz = z0 + ((z1 - z0) + drop) - (zz + drop) - drop + 0;
        const wz = z0 + (ps.getZ(i) + ((z1 - z0) + drop) / 2);
        const sx = Math.max(0, Math.abs(x) - W2), sz = Math.max(0, wz - z1);
        const wr = 0.012 * Math.sin(x * 9 + wz * 4) + 0.008 * Math.sin(x * 23 - wz * 13) + 0.006 * Math.sin(x * 41 + wz * 31) + 0.01 * Math.sin(wz * 7 + 1);
        const puff = 0.035 * Math.min(1, (W2 - Math.min(W2, Math.abs(x))) * 6) * Math.min(1, (z1 - Math.min(z1, wz)) * 6) * Math.min(1, (wz - z0) * 4);
        let X = Math.sign(x) * Math.min(Math.abs(x), W2), Y = top + puff + wr * (0.6 + puff * 10), Z = Math.min(wz, z1);
        if (sx > 0) { Y -= sx; X += Math.sign(x) * (0.02 + 0.012 * Math.sin(wz * 14)); }
        if (sz > 0) { Y -= sz; Z += 0.02 + 0.012 * Math.sin(x * 14); }
        if (wz - z0 < 0.08) Y += (0.08 - (wz - z0)) * 0.5;
        ps.setXYZ(i, X, Math.max(0.24, Y), Z); }
      g.computeVertexNormals(); const duv = lin('#e6d9c2'); duv.side = T.DoubleSide; duv.bumpScale = 1.6; add(g, duv, 0, 0, 0, b);
      // chunky knit throw across the foot
      { const [kc, kb] = gen(512, 512, (u, v, o) => { const cu = u * 28, ci = Math.floor(cu), fu = cu - ci, rv = v * 44 + Math.abs(fu - 0.5) * 1.5; const st = Math.pow(0.5 + 0.5 * Math.sin(rv * 6.2832), 0.6), gap = Math.min(1, Math.min(fu, 1 - fu) * 7);
          const fib = vn(u * 500, v * 500, 500, 500, 141), tone = 0.94 + 0.08 * fbm(u * 4, v * 4, 4, 4, 142, 2); const m = (0.5 + 0.5 * st) * (0.62 + 0.38 * gap) * tone + 0.06 * (fib - 0.5);
          o[0] = 226 * m; o[1] = 208 * m; o[2] = 178 * m; o[3] = st * gap * 0.85 + fib * 0.15; });
        const kt = tex(kc), kbT = tex(kb, false); kt.repeat.set(1.6, 0.7); kbT.repeat.copy(kt.repeat);
        const knit = new T.MeshStandardMaterial({ map: kt, bumpMap: kbT, bumpScale: 6, roughness: 1, side: T.DoubleSide, color: '#efe4d2' });
        const TW = bw + 0.62, TD = 0.56, tz = bl - 0.36, tg = new T.PlaneGeometry(TW, TD, 120, 40); tg.rotateX(-Math.PI / 2); const tp = tg.attributes.position;
        for (let i = 0; i < tp.count; i++) { const x = tp.getX(i), z = tp.getZ(i); const sx = Math.max(0, Math.abs(x) - (W2 + 0.02));
          let Y = 0.515 + 0.012 * Math.sin(x * 7 + z * 5) + 0.008 * Math.sin(x * 19 - z * 11) + 0.02 * Math.exp(-Math.pow((z + 0.05) * 9, 2)) * (1 - Math.min(1, sx * 4)), X = x, Z = z;
          if (sx > 0) { const k = Math.min(sx, 0.05); X = Math.sign(x) * (W2 + 0.02 + k * 0.8 + 0.012 * Math.sin(z * 16)); Y -= sx * 0.96 + k * 0.4; Z += 0.03 * Math.sin(sx * 9) * Math.sign(z + 0.0001); }
          tp.setXYZ(i, X, Math.max(0.24, Y), Z + tz); }
        tg.computeVertexNormals(); const th = add(tg, knit, 0, 0, 0, b); th.rotation.y = 0.03; }
      blob(0, 0.003, bl / 2 + 0.04, bw + 0.6, bl + 0.6, 0.55, b);
    }
    // ---------- rubber plant in woven basket (back-left corner) ----------
    { const p = new T.Group(); p.position.set(-1.5, 0, RZB + 0.3); p.rotation.y = 0.4; scene.add(p); p.userData.tag = 'plant'; this.plantG = p;
      const weave = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#a77d4b'; x.fillRect(0, 0, w, h);
        for (let r = 0; r < 20; r++) for (let c = 0; c < 20; c++) { const o = (r % 2) * 6.4; const l = 0.85 + Math.random() * 0.3;
          x.fillStyle = `rgb(${190 * l | 0},${150 * l | 0},${98 * l | 0})`; x.beginPath(); x.ellipse(c * 12.8 + o, r * 12.8 + 6.4, 6.6, 4.6, 0.25 * (r % 2 ? 1 : -1), 0, Math.PI * 2); x.fill(); }
        x.strokeStyle = 'rgba(60,38,18,0.55)'; x.lineWidth = 1.5; for (let r = 0; r <= 20; r++) { x.beginPath(); x.moveTo(0, r * 12.8); x.lineTo(w, r * 12.8); x.stroke(); } }, true, false);
      weave.wrapS = weave.wrapT = T.RepeatWrapping; weave.repeat.set(5, 1.4);
      const bm = new T.MeshStandardMaterial({ map: weave, roughness: 0.95, bumpMap: weave, bumpScale: 2.5 });
      const BH = 0.3; CY(0.17, 0.14, BH, bm, 0, BH / 2, 0, p, { seg: 40 });
      add(new T.TorusGeometry(0.17, 0.014, 8, 40), bm, 0, BH, 0, p).rotation.x = Math.PI / 2;
      const soilT = canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#2e2117'; x.fillRect(0, 0, w, h); for (let i = 0; i < 500; i++) { x.fillStyle = Math.random() < 0.5 ? '#3d2c1e' : '#1f160f'; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); } });
      CY(0.158, 0.158, 0.02, new T.MeshStandardMaterial({ map: soilT, roughness: 1 }), 0, BH - 0.025, 0, p, { cast: false });
      // leaf texture: broad oval, soft tip, midrib + lateral veins
      const LW = 192, LH = 384;
      const leafShape = (x) => { x.beginPath(); x.moveTo(LW / 2, LH * 0.995); x.bezierCurveTo(LW * 0.2, LH * 0.98, LW * 0.03, LH * 0.78, LW * 0.03, LH * 0.52);
        x.bezierCurveTo(LW * 0.03, LH * 0.26, LW * 0.28, LH * 0.08, LW / 2, LH * 0.005); x.bezierCurveTo(LW * 0.72, LH * 0.08, LW * 0.97, LH * 0.26, LW * 0.97, LH * 0.52);
        x.bezierCurveTo(LW * 0.97, LH * 0.78, LW * 0.8, LH * 0.98, LW / 2, LH * 0.995); x.closePath(); };
      const leafTex = canvasTex(LW, LH, (x) => { leafShape(x); x.save(); x.clip();
        const g = x.createRadialGradient(LW / 2, LH * 0.55, 10, LW / 2, LH * 0.55, LH * 0.55); g.addColorStop(0, '#3f6a34'); g.addColorStop(0.7, '#2c5226'); g.addColorStop(1, '#1d3a1a');
        x.fillStyle = g; x.fillRect(0, 0, LW, LH);
        for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${Math.random() < 0.5 ? '20,40,15' : '80,120,60'},0.06)`; x.fillRect(Math.random() * LW, Math.random() * LH, 3, 3); }
        x.strokeStyle = 'rgba(150,175,100,0.28)'; x.lineWidth = 1.2;
        for (let i = 1; i < 15; i++) { const y = LH * (0.08 + i * 0.062); [-1, 1].forEach(s => { x.beginPath(); x.moveTo(LW / 2, y); x.quadraticCurveTo(LW / 2 + s * LW * 0.25, y - LH * 0.03, LW / 2 + s * LW * 0.46, y - LH * 0.075); x.stroke(); }); }
        x.strokeStyle = 'rgba(190,200,120,0.75)'; x.lineWidth = 3.5; x.beginPath(); x.moveTo(LW / 2, LH); x.lineTo(LW / 2, LH * 0.03); x.stroke();
        x.restore(); x.strokeStyle = 'rgba(15,30,12,0.6)'; x.lineWidth = 2; leafShape(x); x.stroke(); });
      leafTex.flipY = false;
      const tints = ['#c9d6bf', '#b4c4a6', '#a2b394', '#c2c9ae'];
      const leafMs = tints.map(c => new T.MeshStandardMaterial({ map: leafTex, color: c, alphaTest: 0.5, roughness: 0.32, metalness: 0.04, side: T.DoubleSide, bumpMap: leafTex, bumpScale: 0.6 }));
      const depthM = new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking, map: leafTex, alphaTest: 0.5 });
      const distM = new T.MeshDistanceMaterial({ map: leafTex, alphaTest: 0.5 });
      const mkLeafGeo = (droop, fold, twist) => { const g = new T.PlaneGeometry(0.5, 1, 6, 14); g.translate(0, 0.5, 0); const a = g.attributes.position, uv = g.attributes.uv;
        for (let i = 0; i < a.count; i++) { const u = a.getX(i) * 2, v = a.getY(i); uv.setXY(i, u * 0.5 + 0.5, 1 - v);
          const z = -droop * v * v + fold * Math.abs(u) * (0.4 + 0.6 * Math.sin(Math.PI * v)) + 0.015 * Math.sin(v * 9 + u * 3);
          const ang = twist * v; a.setXYZ(i, a.getX(i) * Math.cos(ang), v, z + a.getX(i) * Math.sin(ang)); }
        g.computeVertexNormals(); return g; };
      const leafGeos = [mkLeafGeo(0.18, 0.06, 0.15), mkLeafGeo(0.28, 0.09, -0.2), mkLeafGeo(0.1, 0.05, 0.05), mkLeafGeo(0.35, 0.1, 0.25)];
      const stemM = new T.MeshStandardMaterial({ color: '#5a4a32', roughness: 0.7 });
      const petM = new T.MeshStandardMaterial({ color: '#5d6b3a', roughness: 0.6 });
      const sheathM = new T.MeshStandardMaterial({ color: '#8a4a3a', roughness: 0.5 });
      let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      const up = new T.Vector3(0, 1, 0);
      const placeLeaf = (at, d, len) => { const Y = d.clone().normalize(); let X = new T.Vector3().crossVectors(up, Y); if (X.lengthSq() < 1e-4) X.set(1, 0, 0); X.normalize();
        const Z = new T.Vector3().crossVectors(X, Y).normalize(); const m = new T.Matrix4().makeBasis(X, Y, Z);
        const lf = new T.Mesh(leafGeos[Math.floor(rnd() * 4)], leafMs[Math.floor(rnd() * 4)]); lf.castShadow = lf.receiveShadow = true; lf.customDepthMaterial = depthM; lf.customDistanceMaterial = distM;
        lf.quaternion.setFromRotationMatrix(m); lf.rotateY((rnd() - 0.5) * 0.6); lf.position.copy(at); lf.scale.set(len * 0.9, len, len); p.add(lf); };
      const stems = [[0.0, 0.03, 1.38], [2.1, 0.19, 1.08], [4.0, 0.17, 1.2], [1.0, 0.26, 0.84], [5.2, 0.23, 0.95]];
      stems.forEach(([ang, lean, ht], si) => { const dx = Math.sin(ang), dz = Math.cos(ang); const b0 = new T.Vector3(dx * 0.035, BH - 0.02, dz * 0.035);
        const pts = [0, 0.33, 0.66, 1].map(t => new T.Vector3(b0.x + dx * lean * ht * t * t + Math.sin(t * 5 + si) * 0.012, b0.y + ht * t, b0.z + dz * lean * ht * t * t + Math.cos(t * 4 + si) * 0.012));
        const cv = new T.CatmullRomCurve3(pts); const tg = new T.TubeGeometry(cv, 24, 0.009, 6, false); const ta = tg.attributes.position;
        for (let i = 0; i < ta.count; i++) { const y = (ta.getY(i) - b0.y) / ht; const k = 1.25 - 0.6 * y; const c = cv.getPoint(Math.min(1, Math.max(0, y))); ta.setX(i, c.x + (ta.getX(i) - c.x) * k); ta.setZ(i, c.z + (ta.getZ(i) - c.z) * k); }
        tg.computeVertexNormals(); const sm = new T.Mesh(tg, stemM); sm.castShadow = sm.receiveShadow = true; p.add(sm);
        const n = 4 + Math.floor(ht * 6); let phi = rnd() * 6;
        for (let k = 0; k < n; k++) { const t = 0.32 + 0.68 * k / (n - 1); const at = cv.getPoint(t), tan = cv.getTangent(t); phi += 2.4 + (rnd() - 0.5) * 0.4;
          const out = new T.Vector3(Math.sin(phi), 0, Math.cos(phi)); const lift = 0.35 + 0.9 * t; const d = out.clone().multiplyScalar(1).add(tan.clone().multiplyScalar(lift)).normalize();
          const pl = 0.03 + 0.02 * (1 - t); const pe = at.clone().addScaledVector(d, pl);
          const pm = new T.Mesh(new T.CylinderGeometry(0.0035, 0.005, pl, 5), petM); pm.position.copy(at).lerp(pe, 0.5); pm.quaternion.setFromUnitVectors(up, d); pm.castShadow = true; p.add(pm);
          const dl = d.clone(); dl.y = dl.y * 0.6 + 0.25; const len = (0.15 + 0.1 * Math.sin(Math.PI * Math.min(1, t * 1.15))) * (0.9 + rnd() * 0.2);
          placeLeaf(pe, dl, len); }
        const tip = cv.getPoint(1), tt = cv.getTangent(1);
        const sh = new T.Mesh(new T.ConeGeometry(0.008, 0.07, 6), sheathM); sh.position.copy(tip).addScaledVector(tt, 0.03); sh.quaternion.setFromUnitVectors(up, tt); p.add(sh);
        placeLeaf(tip.clone().addScaledVector(tt, 0.01), tt.clone().add(new T.Vector3(dx * 0.4, 0, dz * 0.4)).normalize(), 0.11); });
      blob(0, 0.003, 0, 0.55, 0.55, 0.6, p);
    }
    // ---------- floor lamp (between plant and cabinet) ----------
    { const lx = -0.98, lz = RZB + 0.3; const lp = new T.Group(); lp.position.set(lx, 0, lz); lp.userData.tag = 'lamp'; scene.add(lp);
      const metal = new T.MeshStandardMaterial({ color: '#1b1a19', metalness: 0.85, roughness: 0.38 });
      CY(0.15, 0.158, 0.02, metal, 0, 0.01, 0, lp, { seg: 48 }); CY(0.03, 0.04, 0.03, metal, 0, 0.035, 0, lp);
      CY(0.0085, 0.0085, 1.36, metal, 0, 0.72, 0, lp, { seg: 12 }); CY(0.018, 0.018, 0.07, metal, 0, 1.42, 0, lp, { seg: 16, cast: false });
      const shadeMat = new T.MeshStandardMaterial({ map: linen.map, bumpMap: linen.bumpMap, bumpScale: 0.8, color: '#5a4636', roughness: 1, side: T.DoubleSide, emissive: '#ff9a4e', emissiveMap: linen.map, emissiveIntensity: 0 });
      add(new T.CylinderGeometry(0.215, 0.215, 0.32, 64, 1, true), shadeMat, 0, 1.54, 0, lp, { cast: false });
      [1.38, 1.7].forEach(y => { add(new T.TorusGeometry(0.215, 0.003, 6, 64), metal, 0, y, 0, lp, { cast: false }).rotation.x = Math.PI / 2; });
      B(0.43, 0.004, 0.004, metal, 0, 1.69, 0, lp, { cast: false }); B(0.004, 0.004, 0.43, metal, 0, 1.69, 0, lp, { cast: false });
      const discMat = new T.MeshStandardMaterial({ color: '#efe2cc', roughness: 0.9, emissive: '#ffcf96', emissiveIntensity: 0, side: T.DoubleSide });
      add(new T.CircleGeometry(0.212, 48), discMat, 0, 1.392, 0, lp, { cast: false }).rotation.x = Math.PI / 2;
      add(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(0.02, 0.006, -0.14), new T.Vector3(0.12, 0.004, -0.24), new T.Vector3(0.3, 0.004, -0.27), new T.Vector3(0.44, 0.004, -0.28)]), 24, 0.0035, 6), metal, 0, 0, 0, lp, { cast: false });
      blob(0, 0.003, 0, 0.42, 0.42, 0.55, lp);
      const down = new T.SpotLight('#ffb46a', 0, 0, 1.05, 0.65, 2); down.position.set(lx, 1.45, lz); down.target.position.set(lx, 0, lz);
      down.castShadow = true; down.shadow.mapSize.set(this.lite ? 512 : 1024, this.lite ? 512 : 1024); down.shadow.bias = -0.0005; down.shadow.normalBias = 0.02; down.shadow.camera.near = 0.05;
      const up = new T.SpotLight('#ffc07e', 0, 0, 1.0, 0.7, 2); up.position.set(lx, 1.6, lz); up.target.position.set(lx, 3, lz);
      const pt = new T.PointLight('#ffa35c', 0, 4.5, 2); pt.position.set(lx, 1.54, lz + 0.05);
      scene.add(down, down.target, up, up.target);
      this.lampG = lp; this.lamp = { k: 0, down, up, pt, shade: shadeMat, disc: discMat }; this.lampOn = false; this.nightK = 0; this.lampAt = 0;
    }
    // ---------- sunset projection lamp (floor, bed side) — halo around the poster at night ----------
    { const sx = 1.47, sz = RZB + 0.4, by = 0.6, hy = 0.2, aim = new T.Vector3(2.48, 1.56, RZB);
      const s = new T.Group(); s.position.set(sx, by, sz); s.userData.tag = 'lamp'; scene.add(s); this.sunsetG = s;
      const blk = new T.MeshStandardMaterial({ color: '#141312', metalness: 0.6, roughness: 0.42 });
      CY(0.062, 0.066, 0.016, blk, 0, 0.008, 0, s, { seg: 40, cast: false }); CY(0.007, 0.007, hy - 0.06, blk, 0, 0.016 + (hy - 0.06) / 2, 0, s, { seg: 10, cast: false });
      const head = new T.Group(); head.position.set(0, hy, 0); s.add(head); s.updateMatrixWorld(true); head.lookAt(aim);
      add(new T.SphereGeometry(0.058, 32, 20), blk, 0, 0, 0, head, { cast: false });
      const lensM = new T.MeshStandardMaterial({ color: '#2a1a10', roughness: 0.2, emissive: '#ff8a35', emissiveIntensity: 0 });
      add(new T.CylinderGeometry(0.036, 0.04, 0.03, 32), lensM, 0, 0, 0.05, head, { cast: false }).rotation.x = Math.PI / 2;
      blob(0, 0.002, 0, 0.16, 0.16, 0.5, s);
      const halo = canvasTex(512, 512, (x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); x.filter = 'blur(6px)';
        const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.46); g.addColorStop(0, '#c85418'); g.addColorStop(0.6, '#e2661e'); g.addColorStop(0.86, '#ff8a34'); g.addColorStop(0.95, '#ffc070'); g.addColorStop(1, '#000');
        x.fillStyle = g; x.beginPath(); x.arc(w / 2, h / 2, w * 0.46, 0, 6.2832); x.fill(); });
      const L = new T.SpotLight('#ff7a2a', 0, 0, 0.26, 1, 2); L.position.set(sx, by + hy, sz).addScaledVector(aim.clone().sub(new T.Vector3(sx, by + hy, sz)).normalize(), 0.07);
      L.target.position.copy(aim); L.castShadow = !this.lite; L.shadow.mapSize.set(1024, 1024); L.shadow.bias = -0.0004; L.shadow.camera.near = 0.05; scene.add(L, L.target);
      const ringT = canvasTex(512, 512, (x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); x.filter = 'blur(10px)';
        const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.46); g.addColorStop(0, 'rgb(46,16,4)'); g.addColorStop(0.55, 'rgb(70,24,6)'); g.addColorStop(0.78, 'rgb(170,64,14)'); g.addColorStop(0.9, 'rgb(255,120,40)'); g.addColorStop(0.96, 'rgb(255,170,90)'); g.addColorStop(1, '#000');
        x.fillStyle = g; x.beginPath(); x.arc(w / 2, h / 2, w * 0.46, 0, 6.2832); x.fill(); });
      const discM = new T.MeshBasicMaterial({ map: ringT, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, fog: false }); discM.color.setScalar(0.95);
      const dg = new T.PlaneGeometry(2.2, 1.7, 24, 24); { const p = dg.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) * (1 + 0.32 * p.getX(i) / 1.1)); p.needsUpdate = true; }
      const disc = add(dg, discM, aim.x, aim.y, RZB + 0.04, scene, { cast: false }); disc.renderOrder = 5; disc.rotation.z = Math.atan2(aim.y - (by + hy), aim.x - sx); disc.userData.noAO = true;
      this.sunset = { light: L, lens: lensM, disc: discM }; }
    // ---------- paper lantern pendant above the bed ----------
    { const px = 2.35, pz = RZB + 1.3, py = 2.22, r = 0.27; const lg = new T.Group(); lg.userData.tag = 'lamp'; scene.add(lg); this.lanternG = lg;
      const rib = canvasTex(256, 512, (x, w, h) => { x.fillStyle = '#f4ecdc'; x.fillRect(0, 0, w, h);
        for (let i = 0; i < 400; i++) { x.fillStyle = `rgba(190,170,140,${0.04 + Math.random() * 0.05})`; x.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 30, 1 + Math.random() * 3); }
        x.fillStyle = 'rgba(120,100,75,0.55)'; for (let i = 1; i < 26; i++) x.fillRect(0, (i / 26) * h - 1.5, w, 3);
        x.fillStyle = 'rgba(150,130,100,0.25)'; for (let i = 0; i < 8; i++) x.fillRect((i / 8) * w, 0, 1.5, h); }, true, false);
      const paper = new T.MeshStandardMaterial({ map: rib, color: '#f6efe2', roughness: 0.95, emissive: '#ffc77e', emissiveMap: rib, emissiveIntensity: 0, side: T.DoubleSide });
      add(new T.SphereGeometry(r, 48, 32), paper, px, py, pz, lg, { cast: false });
      const cordM = new T.MeshStandardMaterial({ color: '#e9e3d8', roughness: 0.7 });
      CY(0.003, 0.003, H - py - r, cordM, px, py + r + (H - py - r) / 2, pz, lg, { seg: 8, cast: false });
      CY(0.04, 0.045, 0.03, cordM, px, H - 0.015, pz, lg, { seg: 24, cast: false });
      const lt = new T.PointLight('#ffc480', 0, 7, 2); lt.position.set(px, py, pz); scene.add(lt);
      this.lantern = { light: lt, paper }; }
    // ---------- side table + gramophone ----------
    const gram = new T.Group(); gram.userData.tag = 'gramophone'; scene.add(gram);
    { const tx = 1.22, tz = RZB + 0.36; const t = new T.Group(); t.position.set(tx, 0, tz); gram.add(t);
      RB(0.72, 0.03, 0.48, 0.005, tableWood, 0, 0.585, 0, t, { s: 0.6 });
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => B(0.034, 0.57, 0.034, tableWood, a * 0.32, 0.285, b * 0.2, t));
      B(0.66, 0.018, 0.42, tableWood, 0, 0.18, 0, t, { rot: true }); B(0.62, 0.05, 0.016, tableWood, 0, 0.545, 0.2, t, { rot: true }); B(0.016, 0.05, 0.38, tableWood, -0.32, 0.545, 0, t);
      blob(0, 0.003, 0, 0.95, 0.7, 0.5, t);
      const y0 = 0.6, g = new T.Group(); g.position.set(-0.1, 0, 0.01); t.add(g);
      const brassP = new T.MeshPhysicalMaterial({ color: '#cc9e48', metalness: 1, roughness: 0.19, clearcoat: 0.45, clearcoatRoughness: 0.12 });
      const brassD = new T.MeshPhysicalMaterial({ color: '#9a7434', metalness: 1, roughness: 0.32 });
      const lacq = new T.MeshPhysicalMaterial({ map: mahog.map, bumpMap: mahog.bumpMap, bumpScale: 0.6, roughness: 0.34, clearcoat: 0.85, clearcoatRoughness: 0.1 });
      const lacqD = lacq.clone(); lacqD.color = new T.Color('#9a8a80');
      // cabinet: bun feet, plinth, fielded panels, fluted corner posts, lid
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { const f = add(new T.SphereGeometry(0.022, 32, 16), lacq, a * 0.16, y0 + 0.016, b * 0.16, g); f.scale.y = 0.75; });
      RB(0.385, 0.03, 0.385, 0.007, lacq, 0, y0 + 0.043, 0, g, { s: 0.5 });
      RB(0.33, 0.14, 0.33, 0.006, lacqD, 0, y0 + 0.128, 0, g, { s: 0.5 });
      [0, 1, 2, 3].forEach(k => { const p = new T.Group(); p.rotation.y = k * Math.PI / 2; g.add(p); RB(0.25, 0.095, 0.012, 0.004, lacq, 0, y0 + 0.128, 0.165, p, { s: 0.5 }); RB(0.21, 0.065, 0.016, 0.006, lacq, 0, y0 + 0.128, 0.166, p, { s: 0.5 }); });
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { CY(0.013, 0.013, 0.14, lacq, a * 0.165, y0 + 0.128, b * 0.165, g, { seg: 24 }); [0.062, 0.194].forEach(yy => CY(0.016, 0.016, 0.008, brassD, a * 0.165, y0 + yy, b * 0.165, g, { seg: 24 })); });
      RB(0.35, 0.008, 0.35, 0.003, brassD, 0, y0 + 0.06, 0, g); RB(0.35, 0.008, 0.35, 0.003, brassD, 0, y0 + 0.196, 0, g);
      RB(0.362, 0.018, 0.362, 0.006, lacq, 0, y0 + 0.207, 0, g, { s: 0.5 });
      RB(0.07, 0.034, 0.004, 0.003, brassP, 0, y0 + 0.128, 0.175, g);
      blob(0, y0 + 0.001, 0, 0.5, 0.5, 0.45, g);
      // crank on the right side
      { const cx = 0.165; const e = CY(0.022, 0.022, 0.004, brassP, cx + 0.008, y0 + 0.128, 0.02, g, { seg: 40 }); e.rotation.z = Math.PI / 2;
        const sh = CY(0.0055, 0.0055, 0.07, brassP, cx + 0.045, y0 + 0.128, 0.02, g, { seg: 20 }); sh.rotation.z = Math.PI / 2;
        RB(0.012, 0.07, 0.016, 0.005, brassP, cx + 0.082, y0 + 0.1, 0.02, g); const kn = CY(0.009, 0.011, 0.045, lacq, cx + 0.105, y0 + 0.072, 0.02, g, { seg: 24 }); kn.rotation.z = Math.PI / 2; }
      // platter, felt, record
      const yt = y0 + 0.216; CY(0.141, 0.143, 0.01, brassP, 0, yt + 0.005, 0, g, { seg: 128 }); CY(0.134, 0.134, 0.003, felt, 0, yt + 0.0115, 0, g, { seg: 128 });
      const spin = new T.Group(); spin.position.set(0, yt + 0.0135, 0); g.add(spin); this.spin = spin;
      const recT = canvasTex(1024, 1024, (x, w) => { const c = w / 2; x.fillStyle = '#0b0a0a'; x.fillRect(0, 0, w, w); for (let rr = 500; rr > 176; rr -= 1.25) { const v = 18 + Math.random() * 22; x.strokeStyle = 'rgba(' + (v | 0) + ',' + (v | 0) + ',' + ((v + 2) | 0) + ',0.9)'; x.lineWidth = 0.8; x.beginPath(); x.arc(c, c, rr, 0, 6.2832); x.stroke(); }
        [356, 292, 238].forEach(rr => { x.strokeStyle = '#050505'; x.lineWidth = 5; x.beginPath(); x.arc(c, c, rr, 0, 6.2832); x.stroke(); });
        x.fillStyle = '#8f2f1c'; x.beginPath(); x.arc(c, c, 168, 0, 6.2832); x.fill(); x.strokeStyle = 'rgba(232,196,126,0.75)'; x.lineWidth = 3; x.beginPath(); x.arc(c, c, 150, 0, 6.2832); x.stroke(); x.beginPath(); x.arc(c, c, 60, 0, 6.2832); x.stroke();
        x.fillStyle = 'rgba(236,204,140,0.9)'; x.font = '600 34px "Cormorant Garamond", serif'; x.textAlign = 'center'; x.fillText('OCTOBER', c, c - 86); x.font = '500 22px "Cormorant Garamond", serif'; x.fillText('CALIBRATION · 78', c, c + 104); x.fillStyle = '#0b0a0a'; x.beginPath(); x.arc(c, c, 8, 0, 6.2832); x.fill(); });
      const recR = canvasTex(1024, 1024, (x, w) => { const c = w / 2; x.fillStyle = '#3a3a3a'; x.fillRect(0, 0, w, w); for (let rr = 500; rr > 176; rr -= 2.5) { const v = 30 + Math.random() * 60; x.strokeStyle = 'rgb(' + (v | 0) + ',' + (v | 0) + ',' + (v | 0) + ')'; x.lineWidth = 1.4; x.beginPath(); x.arc(c, c, rr, 0, 6.2832); x.stroke(); } x.fillStyle = '#c8c8c8'; x.beginPath(); x.arc(c, c, 168, 0, 6.2832); x.fill(); }, false);
      const recP = new T.MeshPhysicalMaterial({ map: recT, roughnessMap: recR, roughness: 1, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06 });
      CY(0.131, 0.131, 0.0025, [new T.MeshPhysicalMaterial({ color: '#0d0c0b', roughness: 0.25, clearcoat: 1 }), recP, recP], 0, 0, 0, spin, { seg: 160 });
      CY(0.0035, 0.0035, 0.02, brassP, 0, 0.008, 0, spin, { seg: 20 }); add(new T.SphereGeometry(0.0036, 16, 8), brassP, 0, 0.018, 0, spin);
      // horn support (elbow), collars, tonearm and reproducer
      const A = new T.Vector3(-0.56, 0.5, 0.66).normalize(); const N = new T.Vector3(0.08, yt + 0.27, -0.1);
      const tube = new T.CatmullRomCurve3([new T.Vector3(0.12, yt, -0.12), new T.Vector3(0.12, yt + 0.13, -0.12), N.clone().addScaledVector(A, -0.08), N.clone()]);
      add(new T.TubeGeometry(tube, 128, 0.0118, 28), brassP, 0, 0, 0, g); CY(0.024, 0.029, 0.022, brassP, 0.12, yt + 0.011, -0.12, g, { seg: 48 });
      [0.02, 0.5, 0.97].forEach(u => { const p = tube.getPointAt(u), tg = tube.getTangentAt(u); const c = add(new T.TorusGeometry(0.0128, 0.0026, 12, 40), brassD, p.x, p.y, p.z, g); c.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), tg); });
      const arm = new T.CatmullRomCurve3([new T.Vector3(0.12, yt + 0.11, -0.12), new T.Vector3(0.105, yt + 0.095, -0.05), new T.Vector3(0.078, yt + 0.06, 0.012)]);
      add(new T.TubeGeometry(arm, 64, 0.0072, 20), brassP, 0, 0, 0, g);
      { const sb = new T.Group(); sb.position.set(0.07, yt + 0.042, 0.03); sb.rotation.set(0, 0.5, Math.PI / 2); g.add(sb);
        CY(0.027, 0.027, 0.013, brassP, 0, 0, 0, sb, { seg: 56 }); add(new T.TorusGeometry(0.027, 0.0022, 10, 56), brassD, 0, 0.0068, 0, sb).rotation.x = Math.PI / 2;
        CY(0.022, 0.022, 0.0016, new T.MeshPhysicalMaterial({ color: '#d9cfbd', roughness: 0.18, clearcoat: 1, sheen: 0.6, sheenColor: new T.Color('#fff2d6') }), 0, 0.0072, 0, sb, { seg: 56 });
        CY(0.006, 0.006, 0.006, brassD, 0, 0.0095, 0, sb, { seg: 20 }); }
      { const nd = add(new T.ConeGeometry(0.0016, 0.022, 10), new T.MeshStandardMaterial({ color: '#d8d8d8', metalness: 1, roughness: 0.2 }), 0.075, yt + 0.024, 0.052, g); nd.rotation.x = Math.PI; }
      // horn: eight soldered petals, seams, rolled rim
      const L = 0.5, R = 0.235, r0 = 0.0125, pts = []; for (let i = 0; i <= 90; i++) { const s = i / 90; pts.push(new T.Vector2(r0 + (R - r0) * Math.pow(s, 3.1) + 0.004 * Math.sin(s * 3), s * L)); }
      for (let i = 1; i <= 10; i++) { const a = (i / 10) * Math.PI * 1.15; pts.push(new T.Vector2(R + 0.006 * Math.sin(a), L - 0.006 * (1 - Math.cos(a)))); }
      const prof = (s) => r0 + (R - r0) * Math.pow(s, 3.1) + 0.004 * Math.sin(s * 3), bulge = (s, ph) => 1 + 0.055 * s * s * Math.pow(Math.abs(Math.sin(4 * ph)), 0.55);
      const hg = new T.LatheGeometry(pts, 256); const pos = hg.attributes.position, cols = new Float32Array(pos.count * 3);
      for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), s = Math.min(1, y / L), ph = Math.atan2(z, x), k = bulge(s, ph); pos.setX(i, x * k); pos.setZ(i, z * k);
        const c = 0.22 + 0.78 * Math.min(1, Math.pow(s / 0.72, 1.4)); cols[i * 3] = c; cols[i * 3 + 1] = c * 0.97; cols[i * 3 + 2] = c * 0.92; }
      hg.setAttribute('color', new T.BufferAttribute(cols, 3)); hg.computeVertexNormals();
      const hornM = new T.MeshPhysicalMaterial({ color: '#d2a24c', metalness: 1, roughness: 0.17, clearcoat: 0.55, clearcoatRoughness: 0.1, side: T.DoubleSide, vertexColors: true });
      const horn = add(hg, hornM, N.x, N.y, N.z, g);
      for (let k = 0; k < 8; k++) { const ph = k * Math.PI / 4, sp = []; for (let i = 6; i <= 90; i++) { const s = i / 90, rr = prof(s) * bulge(s, ph) + 0.0012; sp.push(new T.Vector3(Math.sin(ph) * rr, s * L, Math.cos(ph) * rr)); }
        add(new T.TubeGeometry(new T.CatmullRomCurve3(sp), 84, 0.0015, 6), brassD, 0, 0, 0, horn); }
      add(new T.TorusGeometry(0.0145, 0.003, 12, 40), brassD, 0, 0.004, 0, horn).rotation.x = Math.PI / 2;
      horn.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), A); this.hornMat = hornM;
    }
    // ---------- rug ----------
    // ---------- cozy tufted cotton rug, rectangular, running to the bed base ----------
    { const RR = 1.15, SX = 1.18, cx = 0.3, cz = -2.45;
      const [rc, rb] = gen(1024, 1024, (u, v, o) => { const t1 = vn(u * 260, v * 260, 260, 260, 201), t2 = vn(u * 520, v * 520, 520, 520, 202), cl = fbm(u * 60, v * 60, 60, 60, 203, 2);
        const tuft = Math.pow(t1, 1.4) * 0.6 + t2 * 0.25 + cl * 0.35, tone = 0.95 + 0.06 * fbm(u * 4, v * 4, 4, 4, 204, 3);
        const m = (0.6 + 0.4 * tuft) * tone; o[0] = 238 * m; o[1] = 229 * m; o[2] = 211 * m; o[3] = tuft; });
      const ct = tex(rc), cb = tex(rb, false); ct.repeat.set(2.6, 2.0); cb.repeat.copy(ct.repeat);
      const cotton = new T.MeshPhysicalMaterial({ map: ct, bumpMap: cb, bumpScale: 14, roughness: 1, sheen: 1, sheenColor: new T.Color('#fff1da'), sheenRoughness: 0.9, color: '#e9dcc6' });
      const RW = 2.7, RD = 2.0, rx = 0.4, rz = -2.5; const g = new T.PlaneGeometry(RW, RD, this.lite ? 90 : 135, this.lite ? 67 : 100); g.rotateX(-Math.PI / 2); const ps = g.attributes.position;
      for (let i = 0; i < ps.count; i++) { const x = ps.getX(i), z = ps.getZ(i); const dE = Math.min(RW / 2 - Math.abs(x), RD / 2 - Math.abs(z));
        const edge = Math.min(1, dE / 0.025); const lip = Math.sqrt(Math.max(0, edge * (2 - edge)));
        const wob = 0.004 * Math.sin(x * 31 + z * 7) + 0.003 * Math.sin(z * 43 - x * 5);
        ps.setXYZ(i, x + (Math.abs(z) > RD / 2 - 0.03 ? wob : 0), 0.003 + 0.022 * lip + 0.003 * Math.sin(x * 23) * Math.sin(z * 19), z + (Math.abs(x) > RW / 2 - 0.03 ? wob : 0)); }
      g.computeVertexNormals(); add(g, cotton, rx, 0, rz, scene, { cast: false }); }
    // ---------- ambient occlusion seams ----------
    floorSeam(0, RZB, RX1 - RX0, 0, 0.5); floorSeam(RX0, RZB / 2, -RZB, Math.PI / 2, 0.45); floorSeam(RX1, RZB / 2, -RZB, -Math.PI / 2, 0.45); floorSeam(0, -0.08, RX1 - RX0, Math.PI, 0.4);
    floorSeam(HX, 2.4, HZ, -Math.PI / 2, 0.5); floorSeam((HX + RLX) / 2, 0.08, HX - RLX, Math.PI, 0.35, 0.3);
    wallSeam(0, RZB, RX1 - RX0, 0, 0.22); wallSeam(RX1, RZB / 2, -RZB, -Math.PI / 2, 0.22); wallSeam(RX0, RZB / 2, -RZB, Math.PI / 2, 0.2);
    wallSeam(0, RZB, RX1 - RX0, 0, 0.18, 0.4, H - 0.4); { const g = scene.children[scene.children.length - 1]; g.children[0].rotation.z = 0; }
    cornerAO(RX0, RZB, 0, 1, 0.3, H); cornerAO(RX1, RZB, 0, -1, 0.3, H); cornerAO(RX0, RZB, Math.PI / 2, -1, 0.3, H); cornerAO(RX1, RZB, -Math.PI / 2, 1, 0.3, H);
    cornerAO(HX, 0.08, -Math.PI / 2, -1, 0.35, H, 0.6);

    await wait();
    // ---------- lights ----------
    const hemi = new T.HemisphereLight('#ffd9ad', '#5e3f26', 0.3); scene.add(hemi);
    const sun = new T.DirectionalLight('#ffa255', 9.5); const D = new T.Vector3(6.5, -2.5, -5.5).normalize();
    sun.target.position.set(0, 0.8, -1.2); sun.position.copy(sun.target.position).addScaledVector(D, -14);
    { const ms = this.lite ? 1024 : 2048; sun.castShadow = true; sun.shadow.mapSize.set(ms, ms); sun.position.copy(sun.target.position).addScaledVector(D, -70);
      const tc = new T.OrthographicCamera(); tc.position.copy(sun.position); tc.lookAt(sun.target.position); tc.updateMatrixWorld(true); const bb = new T.Box3();
      [[-2.3, 3.5, -0.1, 3.0, -4.1, 0.3], [-34, -2, -0.8, 11, -36, 12]].forEach(([x0, x1, y0, y1, z0, z1]) => { for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [z0, z1]) bb.expandByPoint(new T.Vector3(x, y, z).applyMatrix4(tc.matrixWorldInverse)); });
      Object.assign(sun.shadow.camera, { left: bb.min.x - 0.5, right: bb.max.x + 0.5, bottom: bb.min.y - 0.5, top: bb.max.y + 0.5, near: Math.max(0.5, -bb.max.z - 2), far: -bb.min.z + 2 }); sun.shadow.camera.updateProjectionMatrix(); }
    sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 5; scene.add(sun, sun.target);
    const skyFill = new T.SpotLight('#ffd6a2', 7, 0, 1.15, 1, 2); skyFill.position.set(-3.2, 1.8, (WZ0 + WZ1) / 2); skyFill.target.position.set(0.5, 0.6, -2.9); scene.add(skyFill, skyFill.target);
    const bounce = new T.PointLight('#ffc48a', 0, 6, 2); bounce.position.set(-0.4, 0.35, -3.0); scene.add(bounce);
    this.dayL = { hemi, sun, skyFill, bounce, c0: skyFill.color.clone(), c1: new T.Color('#7d93c9'), skyDay: this.skyM.color.clone(), skyNight: new T.Color(0.05, 0.07, 0.15), hazeDay: this.hazeM.color.clone(), hazeNight: new T.Color('#2a3550') };
    const hall = new T.SpotLight('#ffb866', 75, 0, 0.42, 0.35, 2); hall.position.set(-1.95, -0.25, 4.55); hall.target.position.set(0.15, 1.35, 0.05);
    hall.map = canvasTex(512, 512, (x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); x.filter = 'blur(7px)';
      const g = x.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.5); g.addColorStop(0, '#fff3dc'); g.addColorStop(1, '#d99a52'); x.fillStyle = g;
      const m = 14, cw = (w * 0.8 - m) / 2, ch = (h * 0.8 - 2 * m) / 3; for (let c = 0; c < 2; c++) for (let r = 0; r < 3; r++) x.fillRect(w * 0.1 + c * (cw + m), h * 0.1 + r * (ch + m), cw, ch);
      x.filter = 'blur(3px)'; x.fillStyle = 'rgba(0,0,0,0.75)'; for (let i = 0; i < 40; i++) { x.save(); x.translate(w * (0.55 + Math.random() * 0.4), h * (0.05 + Math.random() * 0.5)); x.rotate(Math.random() * 6.3); x.beginPath(); x.ellipse(0, 0, 14 + Math.random() * 16, 5 + Math.random() * 5, 0, 0, 6.3); x.fill(); x.restore(); }
      x.lineWidth = 3; x.strokeStyle = 'rgba(0,0,0,0.7)'; x.beginPath(); x.moveTo(w * 0.98, h * 0.08); x.quadraticCurveTo(w * 0.75, h * 0.3, w * 0.6, h * 0.5); x.stroke(); });
    hall.castShadow = true; hall.shadow.mapSize.set(this.lite ? 512 : 1024, this.lite ? 512 : 1024); hall.shadow.bias = -0.0003; hall.shadow.normalBias = 0.01; hall.shadow.camera.near = 0.3; scene.add(hall, hall.target); this.hall = hall;
    const hallFill = new T.PointLight('#ffc98f', 0.8, 7, 2); hallFill.position.set(-0.6, 0.4, 1.4); scene.add(hallFill);
    const stairGlow = new T.SpotLight('#ffb870', 22, 0, 0.9, 1, 2); stairGlow.position.set(-1.9, -0.6, 4.3); stairGlow.target.position.set(-1.4, 0.8, 0.5); scene.add(stairGlow, stairGlow.target);
    const spill = new T.SpotLight('#ffcb8c', 0, 0, 0.75, 0.7, 2); spill.position.set(0, 1.9, -1.8); spill.target.position.set(0, 0, 2.6); spill.castShadow = !this.lite; spill.shadow.mapSize.set(1024, 1024); spill.shadow.bias = -0.0006;
    scene.add(spill, spill.target); this.spill = spill;

    // ---------- light shafts + dust ----------
    { const L = 7.5, beamGeos = [];
      const panes = (z0, z1, y0, y1, cols, rows) => { const fb = 0.05, mb = 0.011, zs = (z1 - z0 - 2 * fb) / cols, yh = (y1 - y0 - 2 * fb) / rows;
        for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) beamGeos.push([z0 + fb + c * zs + mb, z0 + fb + (c + 1) * zs - mb, y0 + fb + r * yh + mb, y0 + fb + (r + 1) * yh - mb]); };
      const zm = (WZ0 + WZ1) / 2, ys = WY0 + (WY1 - WY0) * 0.58;
      [[WZ0 + 0.008, zm - 0.055], [zm + 0.055, WZ1 - 0.008]].forEach(([z0, z1]) => { panes(z0, z1, WY0, ys + 0.025, 2, 3); panes(z0, z1, ys - 0.025, WY1 - 0.008, 2, 2); });
      const beam = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide,
        uniforms: { uT: { value: 0 }, uC: { value: new T.Color('#ffb36a') }, uI: { value: 0.085 } },
        vertexShader: 'attribute float aT; varying float vT; varying vec3 vW; varying vec3 vN; void main(){ vT = aT; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }',
        fragmentShader: 'uniform float uT; uniform vec3 uC; uniform float uI; varying float vT; varying vec3 vW; varying vec3 vN; void main(){ vec3 v = normalize(cameraPosition - vW); float f = pow(abs(dot(normalize(vN), v)), 1.6); float n = 0.7 + 0.3 * sin(vW.x * 3.1 + vW.y * 2.3 + uT * 0.25) * sin(vW.z * 2.7 - uT * 0.18 + vW.y * 1.7); float a = uI * f * pow(1.0 - vT, 1.3) * smoothstep(0.08, 0.2, vT) * n; gl_FragColor = vec4(uC * a, 1.0); }' });
      beamGeos.forEach(([z0, z1, y0, y1]) => { const g = new T.BoxGeometry(1, 1, 1); const ps = g.attributes.position, at = new Float32Array(ps.count);
        for (let i = 0; i < ps.count; i++) { const t = ps.getX(i) + 0.5, u = ps.getZ(i) + 0.5, v = ps.getY(i) + 0.5; at[i] = t; ps.setXYZ(i, RX0 + D.x * t * L, y0 + (y1 - y0) * v + D.y * t * L, z0 + (z1 - z0) * u + D.z * t * L); }
        g.setAttribute('aT', new T.BufferAttribute(at, 1)); g.computeVertexNormals(); const m = new T.Mesh(g, beam); m.renderOrder = 5; m.frustumCulled = false; m.userData.noAO = true; scene.add(m); });
      const N = 900, pos = new Float32Array(N * 3), sd = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) { pos[i * 3] = RX0 + 0.05 + Math.random() * 3.6; pos[i * 3 + 1] = 0.1 + Math.random() * 2.6; pos[i * 3 + 2] = RZB + 0.1 + Math.random() * 3.3; sd[i * 3] = Math.random(); sd[i * 3 + 1] = Math.random(); sd[i * 3 + 2] = Math.random(); }
      const dg = new T.BufferGeometry(); dg.setAttribute('position', new T.BufferAttribute(pos, 3)); dg.setAttribute('seed', new T.BufferAttribute(sd, 3));
      const dust = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending,
        uniforms: { uT: { value: 0 }, uD: { value: D.clone() }, uWin: { value: new T.Vector4(WZ0, WZ1, WY0, WY1) }, uX0: { value: RX0 }, uSize: { value: 9 * renderer.getPixelRatio() }, uC: { value: new T.Color('#ffd7a3') } },
        vertexShader: 'attribute vec3 seed; uniform float uT; uniform vec3 uD; uniform vec4 uWin; uniform float uX0; uniform float uSize; varying float vA; void main(){ vec3 p = position + vec3(sin(uT * (0.05 + 0.08 * seed.x) + seed.y * 6.28) * 0.18, sin(uT * (0.04 + 0.05 * seed.y) + seed.z * 6.28) * 0.14, cos(uT * (0.05 + 0.06 * seed.z) + seed.x * 6.28) * 0.18); float s = (p.x - uX0) / uD.x; vec3 h = p - uD * s; float lit = step(0.0, s) * smoothstep(uWin.x, uWin.x + 0.08, h.z) * smoothstep(uWin.y, uWin.y - 0.08, h.z) * smoothstep(uWin.z, uWin.z + 0.08, h.y) * smoothstep(uWin.w, uWin.w - 0.08, h.y); vA = (0.03 + 0.97 * lit) * (0.55 + 0.45 * sin(uT * (0.6 + seed.x) + seed.z * 40.0)); vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_PointSize = uSize * (0.35 + seed.y) / -mv.z; gl_Position = projectionMatrix * mv; }',
        fragmentShader: 'uniform vec3 uC; varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.05, d) * vA * 1.1; gl_FragColor = vec4(uC * a, 1.0); }' });
      const pts = new T.Points(dg, dust); pts.frustumCulled = false; pts.renderOrder = 6; scene.add(pts);
      this.fx = { beam, dust };
      if (this.props.lightShafts === false) { scene.children.forEach(o => { if (o.material === beam || o === pts) o.visible = false; }); } }
    // ---------- post: ground-truth AO, bloom, lens grade ----------
    { const comp = new EffectComposer(renderer, new T.WebGLRenderTarget(4, 4, { type: T.HalfFloatType, samples: renderer.capabilities.isWebGL2 && this.pr < 1.4 ? (this.lite ? 0 : 2) : 0 })); comp.setPixelRatio(this.pr);
      comp.addPass(new RenderPass(scene, camera));
      const ao = new GTAOPass(scene, camera, 2, 2);
      ao.updateGtaoMaterial({ radius: 0.5, distanceExponent: 1.4, thickness: 1.4, scale: 1.15, samples: 16 });
      ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 }); ao.blendIntensity = 0.95;
      const aoSize = ao.setSize.bind(ao); ao.setSize = (w, h) => aoSize(Math.max(2, w >> 1), Math.max(2, h >> 1));
      // The object graph is fixed after construction; avoid traversing it on every AO pass.
      const aoExcluded = [], aoHidden = [];
      scene.traverse(o => { if (o.isPoints || o.userData.noAO || (o.material && !Array.isArray(o.material) && (o.material.transparent || o.material.alphaTest > 0))) aoExcluded.push(o); });
      const aoRender = ao.render.bind(ao); ao.render = (...args) => {
        for (const object of aoExcluded) if (object.visible) { object.visible = false; aoHidden.push(object); }
        try { aoRender(...args); } finally { for (const object of aoHidden) object.visible = true; aoHidden.length = 0; }
      };
      if (this.props.ambientOcclusion !== false && !this.lite) comp.addPass(ao);
      const bloom = new UnrealBloomPass(new T.Vector2(2, 2), 0.32, 0.6, 1.25); comp.addPass(bloom);
      comp.addPass(new OutputPass());
      const grade = new ShaderPass({ uniforms: { tDiffuse: { value: null }, uTexel: { value: new T.Vector2(1 / 1920, 1 / 1080) } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: 'uniform sampler2D tDiffuse; uniform vec2 uTexel; varying vec2 vUv; void main(){ vec2 d = vUv - 0.5; float r = dot(d, d); vec2 o = d * r * 0.0035; vec3 c = vec3(texture2D(tDiffuse, vUv + o).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - o).b); vec3 nb = texture2D(tDiffuse, vUv + vec2(uTexel.x, 0.0)).rgb + texture2D(tDiffuse, vUv - vec2(uTexel.x, 0.0)).rgb + texture2D(tDiffuse, vUv + vec2(0.0, uTexel.y)).rgb + texture2D(tDiffuse, vUv - vec2(0.0, uTexel.y)).rgb; c = mix(c, nb * 0.25, 0.06); c = mix(c, c * c * (3.0 - 2.0 * c), 0.16); float l = dot(c, vec3(0.299, 0.587, 0.114)); c = mix(vec3(l), c, 1.05); c += vec3(0.014, 0.007, 0.0) * (1.0 - l); c *= vec3(1.015, 1.0, 0.965); c *= 1.0 - r * 0.9; gl_FragColor = vec4(c, 1.0); }' });
      comp.addPass(grade); this.gradePass = grade; this.composer = comp; this.aoPass = ao; this.bloomPass = bloom; }
    pmrem.dispose();
    Object.assign(this, { T, scene, camera, renderer, mount, cab, gram });
    this.interactives = [door, cab, gram, this.lampG, this.sunsetG, this.lanternG, ...this.frameGs];
    this.layout(); this._resize = () => this.layout(); window.addEventListener('resize', this._resize);
    this.bindInput();
    this.setState({ phase: 'door', msg: '' });
    document.getElementById('oc-loading')?.remove();
    this._fadeTimer = setTimeout(() => { if (!this.dead) this.setState({ fade: 0, fadeMs: 1600 }); }, 60);
    let last = performance.now();
    let sdt = 1 / 60, fN = 0, slow = 0, fast = 0, prevSig = '';
    this._filesFrames = 0;
    const shouldRender = () => !this.dead && !this.lost && !document.hidden && (this.state.phase !== 'files' || this._filesFrames < 3);
    const loop = (now) => {
      this.raf = null;
      if (!shouldRender()) return;
      const raw = Math.min(0.1, (now - last) / 1000); last = now;
      sdt += (Math.min(0.05, raw) - sdt) * 0.18; const dt = sdt; fN++;
      if (raw > 0.024) { slow++; fast = 0; } else if (raw < 0.0175) { fast++; slow = Math.max(0, slow - 1); }
      if (slow > 70 && this.pr > 1) { this.pr = Math.max(1, this.pr - 0.25); slow = 0; renderer.setPixelRatio(this.pr); this.composer.setPixelRatio(this.pr); this.layout(); }
      else if (fast > 180 && this.pr < this.prMax) { this.pr = Math.min(this.prMax, this.pr + 0.25); fast = 0; renderer.setPixelRatio(this.pr); this.composer.setPixelRatio(this.pr); this.layout(); }
      this.update(dt);
      const sig = this.door.rotation.y.toFixed(4) + '|' + this.topDrawer.position.z.toFixed(4);
      // Moving foliage still needs shadow refreshes, but static/reduced-motion frames do not.
      if (sig !== prevSig || (!this.reduced && now - (this._shadowAt || 0) > (this.lite ? 100 : 66))) { renderer.shadowMap.needsUpdate = true; this._shadowAt = now; }
      prevSig = sig;
      this.composer.render(dt);
      if (this.state.phase === 'files') this._filesFrames++; else this._filesFrames = 0;
      if (shouldRender()) this.raf = requestAnimationFrame(loop);
    };
    this.resumeRendering = () => { if (!shouldRender() || this.raf != null) return; last = performance.now(); sdt = 1 / 60; this.raf = requestAnimationFrame(loop); };
    this._visibility = () => { if (document.hidden) { cancelAnimationFrame(this.raf); this.raf = null; } else this.resumeRendering(); };
    document.addEventListener('visibilitychange', this._visibility);
    this.resumeRendering();
    performance.mark('oc-scene-ready');
    performance.measure('oc-scene-initialization', 'oc-scene-start', 'oc-scene-ready');
  }

  layout() {
    const T = this.T, w = this.mount.clientWidth || 1, h = this.mount.clientHeight || 1, a = w / h, deg = 180 / Math.PI;
    this.renderer.setSize(w, h); if (this.composer) this.composer.setSize(w, h); if (this.gradePass) this.gradePass.uniforms.uTexel.value.set(1 / (w * this.pr), 1 / (h * this.pr)); this.camera.aspect = a; this.camera.updateProjectionMatrix();
    const dd = 4.35; this.fovDoor = Math.max(37, 2 * Math.atan(0.95 / dd / a) * deg);
    this.fovRoom = Math.min(76, Math.max(44, 2 * Math.atan(Math.tan(41 / deg) / a) * deg));
    const q = Math.max(0, Math.min(1, (a - 0.6) / 0.9)), L = (x, y) => x + (y - x) * q;
    const camDoor = new T.Vector3(0.22, 1.55, 3.7), camRoom = new T.Vector3(L(-0.1, 0.62), 1.3, -0.22);
    this.posCurve = new T.CatmullRomCurve3([camDoor, new T.Vector3(0, 1.47, 1.6), new T.Vector3(0.04, 1.46, 0.12), camRoom], false, 'centripetal');
    this.tgtCurve = new T.CatmullRomCurve3([new T.Vector3(-0.02, 1.12, 0), new T.Vector3(0, 1.18, -1.6), new T.Vector3(L(-0.1, 0.1), 0.96, -4.0)], false, 'centripetal');
  }

  bindInput() {
    const T = this.T, el = this.renderer.domElement, ray = new T.Raycaster(), v = new T.Vector2();
    this.ptr = { x: 0, y: 0 }; this.ptrS = { x: 0, y: 0 };
    const pick = (e) => { const r = el.getBoundingClientRect(); v.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(v, this.camera);
      const hit = ray.intersectObjects(this.interactives, true)[0]; if (!hit) return null; let o = hit.object; while (o && !o.userData.tag) o = o.parent; return o ? o.userData.tag : null; };
    let pq = null; el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); this.ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1; this.ptr.y = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (pq) { pq = e; return; } pq = e; requestAnimationFrame(() => { const ev = pq; pq = null; const ph = this.state.phase, t = (ph === 'door' || ph === 'room' || ph === 'gallery') ? pick(ev) : null, fr = t && t.startsWith('frame:');
      this.setHover(ph === 'door' ? (t === 'door' ? 'door' : null) : ph === 'gallery' ? (fr && t !== 'frame:-1' ? t : null) : (t === 'drawer' || t === 'gramophone' || t === 'lamp' ? t : fr ? 'gallery' : null)); }); });
    el.addEventListener('pointerleave', () => this.setHover(null));
    el.addEventListener('click', (e) => { const ph = this.state.phase, t = pick(e);
      if (ph === 'door' && t === 'door') this.enter();
      else if (ph === 'gallery') { if (t && t.startsWith('frame:') && t !== 'frame:-1') { const f = +t.slice(6); this.setState({ openFile: f }); this.dive(); } else this.back(); }
      else if (ph === 'room') { if (t && t.startsWith('frame:')) this.gallery(true); if (t === 'drawer') this.dive(); if (t === 'lamp') { this.lampOn = !this.lampOn; this.lampAt = this.time; this.setState({ caption: this.lampOn ? 'Turn off the lamp' : 'Turn on the lamp' }); } if (t === 'gramophone') { this.toggleMusic(); this.setState({ caption: this.playing ? 'Stop the music' : 'Play the music' }); } } });
    this._key = (e) => { const ph = this.state.phase; if ((e.key === 'Enter' || e.key === ' ') && ph === 'door' && e.target === document.body) { e.preventDefault(); this.enter(); } if (e.key === 'Escape' && ph === 'opening') this.skip(); if (e.key === 'Escape' && ph === 'gallery') this.gallery(false); };
    window.addEventListener('keydown', this._key);
    if (this.dead) return;
    this._gest = () => this.initAudio(); window.addEventListener('pointerdown', this._gest); window.addEventListener('keydown', this._gest);
  }

  update(dt) {
    if (!this.levers || !this.posCurve) return;
    this.time += dt; const t = this.time, cl = (x) => Math.max(0, Math.min(1, x));
    if (this.dir) { this.Tl += dt * this.dir * (this.dir < 0 ? 1.35 : this.pace()); if (this.Tl >= this.END) { this.Tl = this.END; this.dir = 0; this.setPhase('room'); this.arrived(); } if (this.Tl <= 0) { this.Tl = 0; this.dir = 0; this.setPhase('door'); } }
    const Tl = this.Tl, ph = this.state.phase;
    const ls = Tl < 0.5 ? Math.sin(Math.PI * Tl / 0.5) : 0; this.levers.forEach(l => l.rotation.z = 0.42 * ls);
    const dx = cl((Tl - 0.32) / 1.9), de = dx < 0.5 ? 4 * dx * dx * dx : 1 - Math.pow(-2 * dx + 2, 3) / 2; const ang = 1.72 * de; this.door.rotation.y = ang;
    const pr = cl((Tl - 0.9) / (this.END - 0.9)), p = 0.5 - 0.5 * Math.cos(Math.PI * pr);
    if (ph === 'door') this.idle += dt; const idleK = 1 - Math.exp(-this.idle / 9), idleOff = -0.75 * idleK;
    this.ptrS.x += (this.ptr.x - this.ptrS.x) * Math.min(1, dt * 2); this.ptrS.y += (this.ptr.y - this.ptrS.y) * Math.min(1, dt * 2);
    const par = 0.015 + 0.035 * Math.pow(p, 3);
    const pos = this.posCurve.getPoint(p), tgt = this.tgtCurve.getPoint(p);
    pos.z += idleOff * (1 - p); pos.x += this.ptrS.x * par; pos.y += -this.ptrS.y * par * 0.6 + Math.sin(t * 0.55) * 0.004;
    pos.x -= 0.12 * idleK * (1 - p); tgt.y += 0.3 * idleK * (1 - p); this.camera.position.copy(pos); this.camera.lookAt(tgt);
    const nextFov = this.fovDoor + (this.fovRoom - this.fovDoor) * p;
    if (this.camera.fov !== nextFov) { this.camera.fov = nextFov; this.camera.updateProjectionMatrix(); }
    this.renderer.toneMappingExposure = 0.8 + 0.08 * p;
    if (this.galDir) { this.galT = Math.max(0, Math.min(1, (this.galT || 0) + this.galDir * dt / (this.reduced ? 0.4 : 1.6))); if (this.galT === 0 && this.galDir < 0) this.galDir = 0; }
    if (this.galT > 0 && this.diveT == null) { const T = this.T, k = this.galT, e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      const gp = new T.Vector3(0.12 + this.ptrS.x * 0.03, 1.6 - this.ptrS.y * 0.02, -4 + 1.5), arc = Math.sin(Math.PI * e) * 0.12;
      const P0 = this.camera.position.clone(), pos3 = P0.clone().lerp(gp, e); pos3.y += arc * 0.4; pos3.x -= arc * 0.3;
      const q0 = this.camera.quaternion.clone(), q1 = new T.Quaternion().setFromRotationMatrix(new T.Matrix4().lookAt(pos3, new T.Vector3(0.12, 1.58, -4), new T.Vector3(0, 1, 0)));
      this.camera.position.copy(pos3); this.camera.quaternion.copy(q0).slerp(q1, Math.min(1, e * 1.1)); this.camera.fov += (36 - this.camera.fov) * e; this.camera.updateProjectionMatrix(); }
    if (this.frameGs) for (const g of this.frameGs) { const tz = g.userData.z0 + (this.state.hover === g.userData.tag ? 0.03 : 0); g.position.z += (tz - g.position.z) * Math.min(1, dt * 8); }
    if (this.diveT != null) { const T = this.T; if (ph === 'diving') this.diveT = Math.min(1, this.diveT + dt / (this.reduced ? 0.6 : 1.7));
      const k = this.diveT, e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      const tgt = new T.Vector3(-0.1, 0.7, -3.42), end = new T.Vector3(-0.1, 1.08, -3.18), mid = new T.Vector3(0.15, 1.5, -2.1);
      const pos2 = new T.QuadraticBezierCurve3(this.diveFrom.p, mid, end).getPoint(e); this.camera.position.copy(pos2);
      const q2 = new T.Quaternion().setFromRotationMatrix(new T.Matrix4().lookAt(pos2, tgt, new T.Vector3(0, 1, 0)));
      this.camera.quaternion.copy(this.diveFrom.q).slerp(q2, Math.min(1, e * 1.25));
      this.camera.fov = this.diveFrom.fov + (38 - this.diveFrom.fov) * e; this.camera.updateProjectionMatrix();
      if (k >= 0.66 && !this._fadedIn && ph === 'diving') { this._fadedIn = true; this.setState({ phase: 'files', folder: null }); } }
    const open = ang / 1.72; this.spill.intensity = 22 * Math.sin(Math.min(1, open * 1.2) * Math.PI / 2) * (1 - 0.6 * p);
    this.glow.material.opacity = 0.55 * (1 - cl(open * 3)); this.audioTick(open, p, ph);
    const hv = this.state.hover; this.hall.intensity += ((hv === 'door' ? 150 : 135) * (1 - cl(p * 1.6)) - this.hall.intensity) * Math.min(1, dt * 3); if (ph === 'room' || ph === 'gallery' || ph === 'diving' || ph === 'files') this.hall.intensity = 0;
    let dz = this.drawerOpen ? 0.27 : (hv === 'drawer' ? 0.035 : 0); if (this.nudgeAt != null) { const k = (t - this.nudgeAt) / 1.6; if (k > 0 && k < 1) dz += 0.022 * Math.sin(Math.PI * k); }
    this.topDrawer.position.z += (dz - this.topDrawer.position.z) * Math.min(1, dt * (this.drawerOpen ? 3.2 : 5));
    const st = this.playing ? 3.5 : (hv === 'gramophone' ? 0.7 : 0); this.spinV = (this.spinV || 0) + (st - (this.spinV || 0)) * Math.min(1, dt * 1.6); this.spin.rotation.y -= this.spinV * dt;
    this.hornMat.envMapIntensity += ((hv === 'gramophone' ? 1.6 : 1) - this.hornMat.envMapIntensity) * Math.min(1, dt * 4);
    for (const c of this.curtains) {
      if (this.reduced && c.updatedAt !== -Infinity) continue;
      if (t - c.updatedAt < 1 / 30) continue;
      const a = c.m.geometry.attributes.position, b = c.base;
      for (let i = 0; i < a.count; i++) { const ly = b[i * 3 + 1], wz = c.cz - b[i * 3];
        const sway = this.reduced ? 0 : (0.012 * Math.sin(t * 0.55 + wz * 2.2 + ly * 0.9) + 0.005 * Math.sin(t * 1.3 + wz * 5)) * c.weights[i];
        a.setZ(i, c.folds[i] + sway);
      }
      a.needsUpdate = true; c.updatedAt = t;
      if (t - c.normalsAt >= 1 / 15) { c.m.geometry.computeVertexNormals(); c.normalsAt = t; }
    }
    if (this.aoPass) { this.aoPass.blendIntensity = 0.4 + 0.55 * p; this.bloomPass.strength = 0.1 + 0.22 * p; }
    if (this.fx) { this.fx.beam.uniforms.uT.value = t; this.fx.dust.uniforms.uT.value = this.reduced ? 0 : t; }
    if (this.lamp && this.dayL) { const L = this.lamp, Dl = this.dayL;
      L.k += ((this.lampOn ? 1 : 0) - L.k) * Math.min(1, dt * (this.lampOn ? 2.2 : 3));
      const nt = this.lampOn && t - this.lampAt > 0.55 ? 1 : 0, dn = nt - this.nightK; this.nightK += Math.sign(dn) * Math.min(Math.abs(dn), dt / (nt ? 2 : 1.6));
      const n = this.nightK, ne = n * n * (3 - 2 * n), lk = L.k;
      L.down.intensity = 16 * lk; L.up.intensity = 11 * lk; L.pt.intensity = 1.4 * lk;
      L.shade.emissiveIntensity = 1.5 * lk + (hv === 'lamp' && !this.lampOn ? 0.12 : 0); L.disc.emissiveIntensity = 4 * lk;
      Dl.sun.intensity = 9.5 * (1 - ne); Dl.skyFill.intensity = 7 * (1 - ne) + 0.9 * ne; Dl.skyFill.color.copy(Dl.c0).lerp(Dl.c1, ne);
      Dl.hemi.intensity = 0.3 - 0.22 * ne; Dl.bounce.intensity = 0; this.scene.environmentIntensity = 0.2 - 0.13 * ne;
      this.skyM.color.copy(Dl.skyDay).lerp(Dl.skyNight, ne); if (this.outStd) { for (const o of this.outStd) o.m.envMapIntensity = o.e * (1 - 0.9 * ne); for (const m of this.litGlass) m.emissiveIntensity = 1.8 * ne; for (const g of this.outGlow) g.opacity = 0.45 * ne; for (const l of this.streetL) l.intensity = 60 * ne; if (this.lampHeadM) this.lampHeadM.emissiveIntensity = 6 * ne; if (this.scene.fog) this.scene.fog.color.copy(this.fogDay).lerp(this.fogNight, ne); } this.hazeM.opacity = 0.18 - 0.12 * ne; this.hazeM.color.copy(Dl.hazeDay).lerp(Dl.hazeNight, ne);
      for (const c of this.curtains) c.m.material.emissiveIntensity = 0.75 * (1 - ne) + 0.03;
      if (this.sunset) { this.sunset.light.intensity = 1.5 * ne; this.sunset.disc.opacity = ne; this.sunset.lens.emissiveIntensity = 3 * ne; }
      if (this.fairy) { const tw = 1 + 0.06 * Math.sin(t * 2.3) * Math.sin(t * 3.7); this.fairy.mat.emissiveIntensity = (0.6 + 4.4 * ne) * tw; this.fairy.light.intensity = 0.9 * ne * tw; }
      if (this.bedLed) { const B = this.bedLed; B.stripM.emissiveIntensity = 6 * ne; B.glowM.opacity = 0.85 * ne; B.haloM.opacity = 0.9 * ne; B.curtM.opacity = 0.6 * ne; B.lts.forEach(l => l.intensity = 0.7 * ne); }
      if (this.lantern) { this.lantern.light.intensity = 3.2 * ne; this.lantern.paper.emissiveIntensity = 1.6 * ne; }
      if (this.fx) { this._dustC = this._dustC || this.fx.dust.uniforms.uC.value.clone(); this.fx.beam.uniforms.uI.value = 0.085 * (1 - ne); this.fx.dust.uniforms.uC.value.copy(this._dustC).multiplyScalar(1 - 0.92 * ne); } }
    if (this.plantG && !this.reduced) { this.plantG.rotation.z = 0.006 * Math.sin(t * 0.7) + 0.003 * Math.sin(t * 1.9 + 1); this.plantG.rotation.x = 0.004 * Math.sin(t * 0.55 + 2); }
    if (this.tree && !this.reduced) { this.tree.rotation.z = 0.012 * Math.sin(t * 0.6) + 0.006 * Math.sin(t * 1.7); this.tree.rotation.x = 0.008 * Math.sin(t * 0.45 + 1); }
    const g = this.grainRef.current; if (g && ((t * 24) | 0) !== this._gf) { this._gf = (t * 24) | 0; g.style.backgroundPosition = `${(Math.random() * 192) | 0}px ${(Math.random() * 192) | 0}px`; }
  }

  renderVals() {
    const ph = this.state.phase;
    return {
      mountRef: this.mountRef, grainRef: this.grainRef, cursor: this.state.cursor,
      grainOpacity: this.props.filmGrain === false ? 0 : 0.085,
      fade: this.state.fade, fadeMs: this.state.fadeMs, msg: this.state.msg,
      isLoading: ph === 'loading', showEnter: ph === 'door', showSkip: ph === 'door' || ph === 'opening', showReturn: ph === 'room' || ph === 'gallery',
      caption: this.state.caption, captionOpacity: (ph === 'room' && (this.state.hover === 'drawer' || this.state.hover === 'gramophone' || this.state.hover === 'lamp' || this.state.hover === 'gallery')) || ph === 'gallery' ? 1 : 0,
      enter: this.enter, skip: this.skip, back: this.back,
      filesRef: this.filesRef, mountFiles: !!this.state.filesMounted, showFiles: ph === 'files', openFile: this.state.openFile ?? -1, backLabel: ph === 'gallery' ? 'Back to the room' : 'Back to the door',
      filesOpacity: ph === 'files' ? 1 : 0, filesVis: ph === 'files' ? 'visible' : 'hidden', filesPE: ph === 'files' ? 'auto' : 'none', filesVisDelay: ph === 'files' ? '0s' : '520ms', isIndex: this.state.folder == null, isOpen: this.state.folder != null,
      cur: (() => { const c = this.FOLDERS[this.state.folder ?? 0]; return { ...c, countLabel: String(c.count).padStart(2, '0') + ' sheets', total: String(c.count).padStart(2, '0') }; })(),
      sheets: Array.from({ length: (this.FOLDERS[this.state.folder ?? 0].count) - 1 }, (_, k) => ({ rot: (((k * 37) % 7) - 3) * 0.75, dx: (k % 2 ? 7 : -6) * (1 + k * 0.4), dy: 4 + k * 4 })),
      open0: () => this.openFolder(0), open1: () => this.openFolder(1), open2: () => this.openFolder(2), open3: () => this.openFolder(3),
      closeFolder: () => this.setState({ folder: null }),
      prevFolder: () => this.openFolder(((this.state.folder ?? 0) + 3) % 4), nextFolder: () => this.openFolder(((this.state.folder ?? 0) + 1) % 4),
      leaveFiles: this.leaveFiles,
      bands: this.FOLDERS.map((c, i) => { const open = (this.state.band ?? 3) === i; return { ...c, prev: i ? this.FOLDERS[i - 1].color : '#1a1715', tabLeft: [4, 20, 34, 12][i] + '%', open, chev: open ? '⌄' : '‹',
        label: 'File ' + c.no + (c.note ? ' · ' + c.note : ''), toggle: () => this.setState({ band: open ? -1 : i }), go: () => this.openFolder(i), last: i === 3 }; }),
    };
  }
}
