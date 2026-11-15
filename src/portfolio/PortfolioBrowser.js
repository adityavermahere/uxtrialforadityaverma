class Component extends DCLogic {
  F = [
    { no: '01', name: 'Learning', cover: 'ac41b911-eda0-44fd-a322-78c096a44742', coverFit: 'cover', coverBg: '#33463f', scope: 'Topics', color: '#e3a72f', ink: '#1d1a16', note: '#f6e1b0' },
    { no: '02', name: 'Calfus One', cover: '1a44ea55-4a62-4b22-9699-ab25a9b87193', coverBg: '#f4f1ea', scope: 'Tracks', color: '#c4508a', ink: '#ffffff', note: '#f0c6da' },
    { no: '03', name: 'Aegis', cover: '283e7bcb-02de-475b-9d9f-9cc2c03d5742', scope: 'Small tasks', color: '#d3281f', ink: '#ffffff', note: '#f3df8e' },
    { no: '04', name: 'MVUE', cover: '26bf8d8a-5e0e-45c8-ab41-daa650699202', scope: '—', color: '#5c2470', ink: '#ffffff', note: '#e3b9c6' },
    { no: '05', name: 'Aetherion', cover: '3eb09b18-06c7-49a5-a7ff-0cf6af297965', scope: 'Many tasks', color: '#127a62', ink: '#ffffff', note: '#b6dfcf' },
    { no: '06', name: 'Shark Tank', cover: '702ce176-3746-4b5c-b0ad-3a6b06108006', scope: '—', color: '#2b55d6', ink: '#ffffff', note: '#b9c6f2', video: '725ced7d-30d3-4897-b0bc-54e44a6dc8a1', videoLabel: 'MoneyMitra desktop teaser' },
  ];
  /* __PROJECT_DATA__ */
  state = { view: 'home', cur: 0, hover: null, homeVis: 'visible', caseVis: 'visible', titleVis: 'visible', flapColor: '#000', showNext: false, atEnd: false, progress: 0, compact: false };
  rootRef = React.createRef();
  _pos = {};
  PETS = [['01','Pixel-native','ae-char','6px','C01:Caret,C02:Nodle,C03:Ledger,C04:Lumo,C05:Sprout'],['01','Geometric and modular','ae-char','6px','C06:Prism,C07:Quad,C08:Orbit,C09:Stack,C10:Knot'],['01','Mechanical','ae-char','6px','C11:Beacon,C12:Rover,C13:Hover,C14:Ferro,C15:Pod'],['01','Organic and floating','ae-char','6px','C16:Wisp,C17:Jelly,C18:Nimbus,C19:Mochi,C20:Kite'],['02','Brand marks','ae-mark','20px','A:Mark,B:Lens,C:Signal'],['03','Geometric','ae-mark','20px','D:Cube,E:Orbit,G:Shift'],['04','Geometric, refined','ae-mark','20px','H:Lattice,I:Gyro,J:Nested'],['05','Pixel','ae-pix','16px','byte:Byte,hover:Hover,quad:Quad,pip:Pip'],['06','Marks','ae-mark','20px','K:Facet,L:Stack,M:Hinge,N:Aperture'],['07','Marks, rounded','ae-mark','20px','K2:Facet,L2:Stack,M2:Hinge,N3:Aperture'],['08','Marks','ae-mark','20px','Rx:Roll,Tl:Tiles,Sg:Segments,Pb:Pebbles'],['09','Peek','ae-peek','12px','dome:Dome,pent:Pentagon,tile:Tile,halo:Halo'],['10','Bitsy','ae-bitsy','14px','classic:Classic,hub:Hub,visor:Visor,pent:Pentabit'],['11','Bitsy Soft','ae-bitsoft','14px','classic:Classic,hub:Hub,visor:Visor,pent:Pentabit,bean:Bean,squat:Twin'],['13','Ion','ae-ion','14px','ion:Ion,twin:Ion Twin,mini:Ion Mini,pro:Ion Pro,orb:Ion Orb,jet:Ion Jet'],['14','Ion HD','ae-ionhd','12px','light:Light,dark:Dark,walker:Walker'],['16','Pets','ae-pet','10px','tuft:Tuft,sprout:Sprout,bulb:Bulb,ears:Ears,crown:Crown,flame:Flame,mop:Mop,mini:Mini'],['17','Pets','ae-pet2','0px','bunny:Bloom,jelly:Jelly,bolt:Bolt,puffin:Puffin,drop:Drop,dome:Hover,tuftile:Tuft tile,buntile:Bloom tile'],['18','Cat','ae-cat','0px','cat:Cat']];
  PSTATES = [['idle','Default'],['thinking','Thinking'],['listening','Listening'],['helping','Helping'],['working','Working'],['success','Task completed'],['error','Error'],['waiting','Waiting'],['attention','Attention']];
  busy = false;
  prepareCase = async (index) => {
    if (this.F[index].no !== '05') return !this.dead;
    try {
      await window.OC.loadCharacters();
      if (!this.dead) this.setState({ loadError: '' });
      return !this.dead;
    } catch (error) {
      this.busy = false;
      if (!this.dead) this.setState({ loadError: 'This preview could not load. Please try opening the file again.' });
      return false;
    }
  };
  componentDidMount() { this._committedState = this.state; window.__ocPortfolio = this; this._stopImages = window.OC.observeImages(this.rootRef.current); this._pt = setInterval(() => { if (this.state.view === 'case' && this.F[this.state.cur].no === '05' && this.props.active && !document.hidden) this.setState(s => ({ petTick: (s.petTick || 0) + 1 })); }, 1700); this.reduced = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (this.props.active) this.entrance().then(() => { if (!this.dead && this.props.openFile != null && this.props.openFile >= 0 && this.props.active) this.openFile(this.props.openFile); });
    const go = () => { if (this._lb || !this.rootRef.current) return; if (window.OCLightbox) this._lb = window.OCLightbox.attach(this.rootRef.current); else this._lbT = setTimeout(go, 120); }; go(); }
  componentWillUnmount() { this.dead = true; if (window.__ocPortfolio === this) window.__ocPortfolio = null; this._stopImages?.(); clearInterval(this._pt); clearTimeout(this._lbT); this._lb && this._lb.destroy(); }
  entrance = async () => {
    if (this.dead) return;
    this.busy = false; await this.set({ view: 'home', hover: null, homeVis: 'visible', caseVis: 'visible', titleVis: 'visible', showNext: false, atEnd: false, progress: 0 });
    const root = this.rootRef.current; if (root) root.scrollTop = 0; await this.frame(); if (this.reduced) return;
    const hero = this.q('[data-hero]'), bands = this.qa('[data-band]');
    this.A(hero, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 620, delay: 120, easing: 'cubic-bezier(.2,.8,.2,1)' }).then(() => this.clear([hero]));
    await Promise.all(bands.map((b, k) => this.A(b, [{ transform: 'translate3d(0,70vh,0)' }, { transform: 'translateY(0)' }], { duration: 760, delay: 60 + k * 70, easing: 'cubic-bezier(.22,1.12,.36,1)' })));
    this.clear(bands);
  };
  componentDidUpdate(pp, ps = this._committedState || this.state) { this._committedState = this.state; if (this._lb && this._lb.isOpen() && ((!this.props.active && pp.active) || (ps.view === 'case' && this.state.view !== 'case') || ps.cur !== this.state.cur)) this._lb.close(); if (this.props.active && !pp.active) { const f = this.props.openFile; this.entrance().then(() => { if (!this.dead && f != null && f >= 0 && this.props.active) setTimeout(() => this.openFile(f), 90); }); } if (this.state.showNext && !ps.showNext) { const el = this.q('[data-next]'); el && el.animate([{ transform: 'scale(0.6)', opacity: 0 }, { transform: 'scale(1.04)', opacity: 1, offset: 0.7 }, { transform: 'scale(1)', opacity: 1 }], { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)' }); } }
  q = (s) => this.rootRef.current && this.rootRef.current.querySelector(s);
  qa = (s) => this.rootRef.current ? [...this.rootRef.current.querySelectorAll(s)] : [];
  wait = (ms) => new Promise(r => setTimeout(r, ms));
  frame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  set = (s) => new Promise(r => this.setState(s, r));
  A = (el, kf, o) => el ? el.animate(kf, { fill: 'forwards', ...o }).finished.catch(() => {}) : Promise.resolve();
  clear = (els) => els.forEach(el => el && el.getAnimations().forEach(a => a.cancel()));

  glitch(dir) {
    const ls = this.qa('[data-l]'); if (!ls.length) return Promise.resolve();
    const inn = dir !== 'out', n = ls.length;
    const kf = inn ? [{ opacity: 0, transform: 'translate3d(0,0.42em,0) rotate(4deg)' }, { opacity: 1, transform: 'translate3d(0,0,0) rotate(0deg)' }] : [{ opacity: 1, transform: 'translate3d(0,0,0)' }, { opacity: 0, transform: 'translate3d(0,-0.28em,0)' }];
    return Promise.all(ls.map((el, k) => { el.getAnimations().forEach(a => a.cancel()); return el.animate(kf, { duration: inn ? 560 : 260, delay: (inn ? k : n - 1 - k) * (inn ? 32 : 14), easing: inn ? 'cubic-bezier(.16,1,.3,1)' : 'cubic-bezier(.5,0,.75,0)', fill: 'both' }).finished.catch(() => {}); }));
  }
  vtabsIn() { this.qa('[data-vt]').forEach((el, k) => el.animate([{ transform: 'translateX(-50px)' }, { transform: 'translateX(0)' }], { duration: 440, delay: k * 70, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' })); }

  setupFlight(i, fr) {
    const fl = this.q('[data-flight]'), c = this.F[i];
    const Wc = fr.width, Hc = Math.max(200, Math.min(fr.height, innerHeight - fr.top));
    Object.assign(fl.style, { display: 'block', left: fr.left + 'px', top: fr.top + 'px', width: Wc + 'px', height: Hc + 'px' });
    const slab = this.q('[data-fslab]'); slab.style.background = c.color; slab.innerHTML = '';
    const paper = this.q('[data-paper]');
    if (this._lb) this._lb.finishNow();
    if (paper) { const pr = paper.getBoundingClientRect(); const cl = paper.cloneNode(true); cl.querySelectorAll('*').forEach(e => { if (e.tagName.indexOf('AE-') === 0) { const ph = document.createElement('div'); ph.style.cssText = 'width:100%;height:100%'; e.replaceWith(ph); } }); cl.querySelectorAll('[data-lb]').forEach(e => e.style.visibility = ''); Object.assign(cl.style, { position: 'absolute', left: (pr.left - fr.left) + 'px', top: (pr.top - fr.top) + 'px', width: pr.width + 'px', margin: 0 }); cl.setAttribute('data-fpaper', ''); slab.appendChild(cl); }
    this.q('[data-ftabpath]').setAttribute('fill', c.color);
    const lab = this.q('[data-ftabl]'); lab.textContent = c.name; lab.style.color = c.ink;
    return { fl, Wc, Hc };
  }
  homePose(i, Wc, Hc, fr) {
    const band = this.qa('[data-band]')[i], tab = this.qa('[data-tab]')[i]; const r = band.getBoundingClientRect(), tr = tab.getBoundingClientRect();
    const s = r.width / Hc; const cx = r.left + r.width / 2, cy = r.top + 44 + (Wc * s) / 2; const cx0 = fr.left + Wc / 2, cy0 = fr.top + Hc / 2;
    return { s, dx: cx - cx0, dy: cy - cy0, tabTop: (tr.left - r.left) / s, tabLen: tr.width / s, tabW: 44 / s, band, r };
  }
  flightFrames(p, vt) {
    const cl = (x) => Math.max(0, Math.min(1, x)), io = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, oq = (x) => 1 - Math.pow(1 - x, 4);
    const N = 48, kf = [], tkf = [];
    for (let i = 0; i <= N; i++) { const t = i / N, er = io(cl((t - 0.04) / 0.9)), k = 1 - io(cl((t - 0.1) / 0.88)), et = io(cl((t - 0.14) / 0.72));
      const rot = -90 + 90 * er + 1.6 * Math.sin(Math.PI * cl((t - 0.7) / 0.3)) * (t > 0.7 ? 1 : 0);
      kf.push({ transform: 'translate3d(' + (p.dx * k) + 'px,' + (p.dy * k) + 'px,0) rotate(' + rot + 'deg) scale(' + (1 + (p.s - 1) * k) + ')', offset: t });
      const top = p.tabTop + (vt.top - p.tabTop) * et, len = p.tabLen + (vt.h - p.tabLen) * et, w = p.tabW + (44 - p.tabW) * et;
      tkf.push({ transform: 'translate3d(0,' + (top - vt.top) + 'px,0) scale(' + (w / 44) + ',' + (len / vt.h) + ')', offset: t }); }
    return { kf, tkf };
  }
  paperFrames(out) { const N = 30, a = []; for (let i = 0; i <= N; i++) { const t = i / N, k = out ? Math.pow(Math.min(1, t / 0.85), 2.4) : 1 - (1 - Math.pow(1 - Math.max(0, Math.min(1, (t - 0.14) / 0.86)), 4)); a.push({ transform: 'translate3d(0,' + (72 * k) + '%,0)', offset: t }); } return a; }
  prepTab(vt) { const ft = this.q('[data-ftab]'); Object.assign(ft.style, { top: vt.top + 'px', height: vt.h + 'px', width: '44px', transformOrigin: '0 0', willChange: 'transform' }); return ft; }

  openFile = async (i) => {
    if (this.dead || this.busy || this.state.view !== 'home') return; this.busy = true; this.setState({ hover: null });
    if (!(await this.prepareCase(i))) return;
    if (this.dead) return;
    const root = this.rootRef.current;
    if (this.reduced) { await this.set({ view: 'case', cur: i, progress: 0 }); root.scrollTop = 0; await this.A(root, [{ opacity: 0 }, { opacity: 1 }], { duration: 220 }); this.clear([root]); this.busy = false; return; }
    const bands = this.qa('[data-band]'), clicked = bands[i], r = clicked.getBoundingClientRect(), body = this.qa('[data-body]')[i];
    body.style.height = (innerHeight - body.getBoundingClientRect().top + 60) + 'px';
    bands.slice(0, i).forEach((b, k) => this.A(b, [{ transform: 'translateY(0)' }, { transform: `translateY(${r.top - b.getBoundingClientRect().top + 24}px)` }], { duration: 300, delay: k * 40, easing: 'cubic-bezier(.55,0,.75,.2)' }));
    bands.slice(i + 1).forEach((b, k) => this.A(b, [{ transform: 'translateY(0)' }, { transform: `translateY(${innerHeight}px)` }], { duration: 360, delay: 150 + k * 50, easing: 'cubic-bezier(.55,0,.75,.2)' }));
    this.A(this.q('[data-hero]'), [{ opacity: 1 }, { opacity: 0.35, offset: 0.4 }, { opacity: 0.05 }], { duration: 480, delay: 120 });
    const d = this.q('[data-desc]'); if (d) this.A(d, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 });
    await this.wait(560);
    const homeData = { r, tabLeft: this.qa('[data-tab]')[i].getBoundingClientRect().left - r.left, tabW: this.qa('[data-tab]')[i].getBoundingClientRect().width };
    await this.set({ view: 'case', cur: i, caseVis: 'hidden', titleVis: 'hidden', progress: 0, atEnd: false, showNext: false, compact: false }); root.scrollTop = 0; await this.frame();
    const fr = this.q('[data-folder]').getBoundingClientRect(); const { fl, Wc, Hc } = this.setupFlight(i, fr);
    const s = homeData.r.width / Hc; const p = { s, dx: homeData.r.left + homeData.r.width / 2 - (fr.left + Wc / 2), dy: homeData.r.top + 44 + Wc * s / 2 - (fr.top + Hc / 2), tabTop: homeData.tabLeft / s, tabLen: homeData.tabW / s, tabW: 44 / s };
    const vtEl = this.qa('[data-vt]')[i], vr = vtEl.getBoundingClientRect(); const vt = { top: vr.top - fr.top, h: vr.height };
    const { kf, tkf } = this.flightFrames(p, vt);
    const fp = this.q('[data-fpaper]');
    fl.style.transform = kf[0].transform; const ft = this.prepTab(vt); ft.style.transform = tkf[0].transform;
    await this.frame();
    const D = 980;
    const swing = this.A(fl, kf, { duration: D, easing: 'linear' });
    this.A(ft, tkf, { duration: D, easing: 'linear' });
    if (fp) this.A(fp, this.paperFrames(false), { duration: D, easing: 'linear' });
    setTimeout(() => { this.qa('[data-l]').forEach(el => { el.style.opacity = 0; }); this.setState({ titleVis: 'visible' }); this.frame().then(() => { this.qa('[data-l]').forEach(el => { el.style.opacity = ''; }); this.glitch('in'); }); }, D * 0.55);
    await swing;
    await this.set({ caseVis: 'visible' }); this.vtabsIn();
    fl.style.display = 'none'; this.q('[data-fslab]').innerHTML = ''; this.clear([fl, this.q('[data-ftab]')]);
    this.busy = false;
  };

  goHome = async () => {
    if (this.dead || this.busy || this.state.view !== 'case') return; this.busy = true;
    const root = this.rootRef.current, i = this.state.cur;
    if (this.reduced) { await this.set({ view: 'home', showNext: false }); root.scrollTop = 0; await this.A(root, [{ opacity: 0 }, { opacity: 1 }], { duration: 220 }); this.clear([root]); this.busy = false; return; }
    if (root.scrollTop > 2) { root.scrollTo({ top: 0, behavior: 'smooth' }); await this.wait(450); }
    this.setState({ showNext: false });
    await this.glitch('out');
    const fr = this.q('[data-folder]').getBoundingClientRect(); const vr = this.qa('[data-vt]')[i].getBoundingClientRect();
    const { fl, Wc, Hc } = this.setupFlight(i, fr); fl.style.transform = 'none';
    await this.set({ view: 'home', homeVis: 'hidden' }); root.scrollTop = 0; await this.frame();
    const p = this.homePose(i, Wc, Hc, fr); const vt = { top: vr.top - fr.top, h: vr.height };
    const { kf, tkf } = this.flightFrames(p, vt);
    const rev = kf.slice().reverse().map((k, n) => ({ transform: k.transform, offset: n / (kf.length - 1) })), trev = tkf.slice().reverse().map((k, n) => ({ transform: k.transform, offset: n / (tkf.length - 1) }));
    const D = 900, fp = this.q('[data-fpaper]'), ft = this.prepTab(vt);
    const swing = this.A(fl, rev, { duration: D, easing: 'linear' });
    this.A(ft, trev, { duration: D, easing: 'linear' });
    if (fp) this.A(fp, this.paperFrames(true), { duration: D, easing: 'linear' });
    await swing;
    const bands = this.qa('[data-band]'), body = this.qa('[data-body]')[i];
    body.style.height = (innerHeight - body.getBoundingClientRect().top + 60) + 'px';
    const hero = this.q('[data-hero]'), desc = this.q('[data-desc]');
    hero.style.opacity = 0.05; if (desc) desc.style.opacity = 0;
    const r = bands[i].getBoundingClientRect();
    bands.forEach((b, k) => { if (k < i) b.style.transform = `translateY(${r.top - b.getBoundingClientRect().top + 24}px)`; if (k > i) b.style.transform = `translateY(${innerHeight}px)`; });
    await this.set({ homeVis: 'visible' }); fl.style.display = 'none'; this.q('[data-fslab]').innerHTML = ''; this.clear([fl, this.q('[data-ftab]')]);
    this.A(hero, [{ opacity: 0.05 }, { opacity: 0.5, offset: 0.5 }, { opacity: 1 }], { duration: 420 });
    const spring = 'cubic-bezier(.22,1.25,.36,1)'; let n = 0; const all = [];
    bands.forEach((b, k) => { if (k === i) return; const from = b.style.transform; b.style.transform = ''; all.push(this.A(b, [{ transform: from }, { transform: 'translateY(0)' }], { duration: 520, delay: 160 + (n++) * 70, easing: spring })); });
    await Promise.all(all);
    body.style.height = ''; this.clear(bands);
    if (desc) { desc.style.opacity = ''; this.A(desc, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 }); }
    hero.style.opacity = ''; this.clear([hero]);
    this.busy = false;
  };

  toTop = async () => { const root = this.rootRef.current; if (root.scrollTop <= 2) return; root.scrollTo({ top: 0, behavior: 'smooth' }); const t0 = performance.now(); while (root.scrollTop > 2 && performance.now() - t0 < 900) await new Promise(r => requestAnimationFrame(r)); };
  switchTo = async (j, skipScroll) => {
    if (this.dead || this.busy || this.state.view !== 'case' || j === this.state.cur) return; this.busy = true;
    if (!(await this.prepareCase(j))) return;
    if (this.dead) return;
    const root = this.rootRef.current;
    if (this.reduced) { await this.set({ cur: j, progress: 0 }); root.scrollTop = 0; this.busy = false; return; }
    if (!skipScroll) await this.toTop();
    const flap = this.q('[data-flap]'); flap.style.background = this.F[j].color; flap.style.visibility = 'visible';
    this.glitch('out');
    this.qa('[data-vtl]').forEach((el, k) => el.animate([{ opacity: 1, transform: 'translate3d(0,0,0)' }, { opacity: 0.25, transform: 'translate3d(0,8px,0)', offset: 0.45 }, { opacity: 1, transform: 'translate3d(0,0,0)' }], { duration: 760, delay: k * 40, easing: 'cubic-bezier(.45,0,.25,1)' }));
    const D = 1150, N = 40, kf = [];
    for (let i = 0; i <= N; i++) { const t = i / N; let r; if (t < 0.44) { const u = t / 0.44; r = 100 * (1 - (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2)); } else if (t < 0.54) r = 0; else { const u = (t - 0.54) / 0.46; r = 100 * (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2); }
      kf.push({ transform: 'rotateY(' + r + 'deg)', offset: t }); }
    const anim = flap.animate(kf, { duration: D, easing: 'linear', fill: 'both' });
    await new Promise(r => setTimeout(r, D * 0.46));
    this.qa('[data-l]').forEach(el => { el.style.opacity = 0; });
    await this.set({ cur: j, flapColor: this.F[j].color, titleVis: 'visible', progress: 0 }); root.scrollTop = 0;
    await new Promise(r => requestAnimationFrame(r));
    this.qa('[data-l]').forEach(el => { el.style.opacity = ''; }); this.glitch('in');
    await anim.finished.catch(() => {});
    anim.cancel(); flap.style.visibility = 'hidden'; this.busy = false;
  };

  commitNext = async () => {
    if (this.dead || this.busy) return; this.busy = true; const root = this.rootRef.current, j = (this.state.cur + 1) % this.F.length;
    if (!(await this.prepareCase(j))) return;
    if (this.dead) return;
    const pill = this.q('[data-next]'); if (pill) await this.A(pill, [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(80px)', opacity: 0 }], { duration: 250, easing: 'ease-in' });
    const nb = this.q('[data-nextband]'); root.scrollTo({ top: root.scrollTop + nb.getBoundingClientRect().top - 56 - 28, behavior: 'smooth' }); await this.wait(650);
    await this.set({ cur: j, progress: 0, showNext: false, atEnd: false }); root.scrollTop = 0; await this.frame();
    this.glitch('in');
    this.A(this.q('[data-folder]'), [{ transform: 'translateY(60px)' }, { transform: 'translateY(0)' }], { duration: 600, easing: 'cubic-bezier(.2,.8,.2,1)' });
    this.A(this.q('[data-paper]'), [{ transform: 'translateY(90px)' }, { transform: 'translateY(0)' }], { duration: 520, delay: 120, easing: 'cubic-bezier(.2,.8,.2,1)' });
    this.vtabsIn();
    await this.wait(700); this.clear([this.q('[data-folder]'), this.q('[data-paper]')]);
    this.busy = false;
  };

  onScroll = (e) => {
    const el = e.currentTarget; if (this.state.view !== 'case') return;
    if (this._sq) return; this._sq = requestAnimationFrame(() => { this._sq = 0; this.scrollCheck(el); }); };
  scrollCheck = (el) => { const showNext = el.scrollTop > innerHeight * 0.6, atEnd = el.scrollTop >= el.scrollHeight - el.clientHeight - 4, compact = el.scrollTop > 150;
    if (showNext !== this.state.showNext || atEnd !== this.state.atEnd || compact !== this.state.compact) this.setState({ showNext, atEnd, compact, progress: atEnd ? this.state.progress : 0 });
  };
  onWheel = (e) => {
    if (this.state.view !== 'case' || this.busy || !this.state.atEnd || e.deltaY <= 0) return;
    const p = Math.min(1, this.state.progress + e.deltaY / 900); this.setState({ progress: p }); if (p >= 1) this.commitNext();
  };

  renderVals() {
    const s = this.state, F = this.F, c = F[s.cur], n = F[(s.cur + 1) % this.F.length], hov = s.hover;
    const dd = this.D[c.no] || { intro: c.name, sec: [] }, text = dd.intro, pend = /need(s)? to be|will be added|not confirmed|may have|remains ongoing/i;
    const PAL = ['#f0a7b2', '#f6de7e', '#a9bff4', '#bfe0c8', '#f3c39b']; let sk = 0; const secs = dd.sec.map((x, si) => { const pk = c.no + ':' + si; if (Array.isArray(x)) { const [no, title, pts, lead, ev] = x; x = { no, title, pts, lead, ev }; } if (x.head) return { isHead: true, isSec: false, head: x.head, sub: x.sub || '', hasSub: !!x.sub, pts: [] }; const { no, title, pts, lead, ev } = x; const k = sk++, L = k % 2 === 0, ims = x.imgs || (x.img ? [{ src: x.img, title: x.imgTitle, link: x.imgLink, linkLabel: x.imgLinkLabel, ar: '16/9' }] : []), hasI = ims.length > 0, n = ims.length; const lay = { dir: L ? 'row' : 'row-reverse', noteW: hasI || x.pets ? '46%' : '62%', rowMl: L ? '0' : (hasI ? '0' : '8%'), rowMr: L ? (hasI ? 'calc(-1 * clamp(0px, 3vw, 54px))' : '0') : 'calc(-1 * clamp(0px, 3vw, 54px))', bg: PAL[(k + si) % PAL.length], rot: ([-1.2, 1, -0.6, 1.4, -1.6, 0.8])[k % 6] + 'deg', picMt: 'clamp(16px, 7vw, 110px)', picMl: L ? 'calc(-1 * clamp(0px, 1.4vw, 18px))' : '0', picMr: L ? '0' : 'calc(-1 * clamp(0px, 1.4vw, 18px))', picMb: n > 1 ? 'clamp(40px, ' + (4 + n * 2) + 'vw, ' + (60 + n * 30) + 'px)' : '0', fan: ims.map((im, j) => ({ url: im.ph ? 'none' : 'url("' + im.src + '")', isPh: !!im.ph, title: im.title || title, source: im.source || 'Claude Design', link: im.link || '', linkLabel: im.linkLabel || 'Open', ar: im.ar || '16/9', cap: j === 0 ? (im.cap || '') : '', hasCap: j === 0 && !!im.cap, more: j === 0 && n > 1 ? '+' + (n - 1) + ' more' : '', hasMore: j === 0 && n > 1, clip: j === 0, clipR: L ? '34px' : 'auto', w: j === 0 ? (/1648\/(2331|3389)/.test(im.ar || '') ? '62%' : '92%') : (j === 1 ? '62%' : '52%'), js: j === 0 ? (L ? 'end' : 'start') : (j % 2 ? (L ? 'start' : 'end') : (L ? 'end' : 'start')), z: String(10 - j), tx: j === 0 ? '0' : ((j % 2 ? -1 : 1) * (L ? 1 : -1) * (4 + j * 2)) + '%', ty: j === 0 ? '0' : (j * 26) + '%', rot: j === 0 ? (L ? '-1.8deg' : '1.6deg') : ((j % 2 ? 3.2 : -2.6) * (L ? 1 : -1)) + 'deg' })) }; return { isHead: false, isSec: true, ...lay, imgs: lay.fan, no, title, lead: lead || '', hasLead: !!lead, leadLabel: x.leadLabel || '', hasLeadLabel: !!x.leadLabel, ptsLabel: x.ptsLabel || '', hasPtsLabel: !!x.ptsLabel, impl: x.impl || '', hasImpl: !!x.impl, link: x.link || '', hasLink: !!x.link, linkLabel: x.linkLabel || 'Open', hasImg: hasI, hasPets: !!x.pets, hasBoard: !!x.board, board: (x.board || []).map((b, j) => ({ url: 'url("' + b.src + '")', title: b.title, source: b.source, link: b.link || '', linkLabel: b.linkLabel || 'Open', cap: b.cap, rot: ([-2.2, 1.6, -0.8, 2.4, -1.4])[j % 5] + 'deg', ty: ([0, 10, -4, 14, 4])[j % 5] + 'px', tape: j % 3 === 0 })), ev: ev || '', hasEv: false, pts: pts.map(t => ({ t, ink: pend.test(t) ? 'rgba(29,26,22,0.5)' : '#1d1a16', fs: pend.test(t) ? 'italic' : 'normal' })) }; });
    const grp = []; this.PETS.forEach(([turn, title, tag, pad, list]) => { let g = grp.find(x => x.turn === turn); if (!g) grp.push(g = { turn, titles: [], items: [] }); g.titles.push(title); list.split(',').forEach(p => { const [k, nm] = p.split(':'); g.items.push({ tag, k, n: nm, pad, title }); }); });
    const tick = s.petTick || 0, sel = s.petSel || { turn: '09', tag: 'ae-peek', k: 'dome', n: 'Dome', title: 'Peek' };
    const petStops = grp.map((g, i) => { const j = (tick + i * 3) % g.items.length, it = g.items[j], on = sel.turn === g.turn; return { turn: g.turn, tag: it.tag, k: it.k, pad: it.pad, name: it.n, title: g.titles.length > 1 ? g.titles.length + ' families' : g.titles[0], idx: j + 1, count: g.items.length, rot: ([-2.4, 1.8, -1.2, 2.6, -0.6, 1.4])[i % 6] + 'deg', ty: ([0, 14, -6, 18, 4, -10])[i % 6] + 'px', notLast: i < grp.length - 1, shadow: on ? '0 10px 24px rgba(29,91,245,0.28)' : '0 4px 12px rgba(0,0,0,0.16)', outline: on ? '2px solid #1D5BF5' : '0 solid transparent', pick: () => this.setState({ petSel: { turn: g.turn, tag: it.tag, k: it.k, n: it.n, title: it.title } }) }; });
    const ps = s.petState || 'idle';
    const petChips = this.PSTATES.map(([k, label]) => ({ label, bg: k === ps ? '#1d1a16' : 'transparent', ink: k === ps ? '#f6de7e' : '#1d1a16', go: () => this.setState({ petState: k }) }));
    return {
      charactersActive: !!this.props.active,
      loadError: this.state.loadError || '',
      showLoadError: !!this.state.loadError,
      clearLoadError: () => this.setState({ loadError: '' }),
      petFan: [{ tag: 'ae-char', k: 'C04', n: 'Lumo', turn: '01', pad: '10px', l: '2%', t: '6%', rot: '-6deg', z: '1', state: 'idle' }, { tag: 'ae-peek', k: 'dome', n: 'Dome', turn: '09', pad: '18px', l: '30%', t: '0', rot: '3deg', z: '3', state: 'thinking' }, { tag: 'ae-cat', k: 'cat', n: 'Cat', turn: '18', pad: '0px', l: '56%', t: '14%', rot: '-2deg', z: '2', state: 'success' }],
      petStops, petChips, petState: ps, petStateLabel: (this.PSTATES.find(x => x[0] === ps) || [0, ''])[1], hero: { tag: sel.tag, k: sel.k, name: sel.n, turn: sel.turn, title: sel.title }, petTotal: grp.reduce((a, g) => a + g.items.length, 0), petRounds: grp.length,
      rootRef: this.rootRef, onScroll: this.onScroll, onWheel: this.onWheel,
      backToRoom: () => this.props.onBack && this.props.onBack(), goHome: this.goHome,
      headerLabel: s.view === 'case' && s.compact ? c.name : 'Aditya Verma',
      isHome: s.view === 'home', isCase: s.view === 'case', homeVis: s.homeVis, caseVis: s.caseVis, titleVis: s.titleVis, flapColor: s.flapColor,
      leaveBand: () => this.setState({ hover: null }),
      bands: F.map((b, i) => ({ ...b, z: i + 1, mt: i ? '-44px' : '0', h: i === F.length - 1 ? 'max(62vh,420px)' : '102px', tabLeft: (2 + i * 14) + '%',
        label: `File ${b.no}${b.scope !== '—' ? ' · ' + b.scope : ''}`, last: i === F.length - 1,
        chevT: hov === i || (hov == null && i === F.length - 1) ? 'rotate(-90deg)' : 'none',
        hoverT: hov === i ? 'perspective(2400px) rotateX(3deg) translateY(-22px)' : 'perspective(2400px) rotateX(3deg)', pr: ([12, 22, 8, 30, 16, 10])[i % 6] + '%', pw: ([30, 24, 34, 22, 28, 32])[i % 6] + '%', pr2: ([8, 18, 5, 26, 12, 6])[i % 6] + '%', pw2: ([34, 28, 38, 26, 32, 36])[i % 6] + '%', paperT: hov === i ? 'translateY(-16px) rotate(-1.5deg)' : 'translateY(0) rotate(-0.6deg)', paper2T: hov === i ? 'translateY(-9px) rotate(1.8deg)' : 'translateY(0) rotate(1deg)', dimF: hov != null && hov !== i ? 'brightness(0.86)' : 'none',
        enter: () => !this.busy && this.setState({ hover: i }), open: () => this.openFile(i) })),
      letters: [...c.name],
      cur: { ...c, initial: text[0], rest: text.slice(1), hasCover: !!c.cover, noCover: !c.cover, coverBg: c.coverBg || '#171513', coverSize: c.coverFit || '76% auto', coverUrl: c.cover ? 'url("' + c.cover + '")' : 'none', coverSrc: c.cover ? 'Logo' : 'To be added', hasVideo: !!c.video, video: c.video || '', videoThumb: c.videoPoster || '', videoLabel: c.videoLabel || '' }, secs,
      next: { ...n, label: `File ${n.no}${n.scope !== '—' ? ' · ' + n.scope : ''}` },
      vtabs: F.map((v, i) => ({ ...v, go: () => this.switchTo(i), ml: i === s.cur ? '0px' : '-8px' })),
      showNext: s.view === 'case' && s.showNext, cardOpen: !s.atEnd,
      pillMt: s.atEnd ? '0px' : '-16px', pillW: s.atEnd ? '100%' : '62%',
      pillText: s.atEnd ? 'Keep scrolling for the next file' : 'Next →', progPct: Math.round(s.progress * 100) + '%',
      goNext: () => s.atEnd ? this.commitNext() : this.switchTo((s.cur + 1) % this.F.length),
    };
  }
}
