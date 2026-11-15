(function () {
  const OPEN_E = 'cubic-bezier(0.2, 0.8, 0.2, 1)', CLOSE_E = 'cubic-bezier(0.4, 0, 0.2, 1)', POP_E = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
  const BLUE = '#2338D1', RED = '#E8000F';
  const css = (el, s) => { Object.assign(el.style, s); return el; };
  const mk = (tag, s, parent) => { const e = css(document.createElement(tag), s || {}); if (parent) parent.appendChild(e); return e; };
  const rotOf = (el) => { const t = getComputedStyle(el).transform; if (!t || t === 'none') return 0; const m = new DOMMatrix(t); return Math.atan2(m.b, m.a) * 180 / Math.PI; };
  const ytId = (u) => { const m = String(u || '').match(/(?:v=|youtu\.be\/|embed\/)([\w-]{6,})/); return m ? m[1] : u; };

  function attach(root, opts) {
    opts = opts || {};
    const reduced = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    let zTop = 10, lb = null;
    const layer = mk('div', { position: 'fixed', inset: '0', zIndex: '2147483000', pointerEvents: 'none' }, document.body);
    const overlay = mk('div', { position: 'absolute', inset: '0', background: '#000', opacity: '0', pointerEvents: 'none' }, layer);
    const card = mk('div', { position: 'absolute', left: '0', top: '0', width: '210px', minHeight: '190px', boxSizing: 'border-box', background: BLUE, color: '#fff', borderRadius: '14px', padding: '18px 18px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '22px', opacity: '0', pointerEvents: 'none', overflow: 'visible' }, layer);
    const notch = mk('div', { position: 'absolute', width: '0', height: '0' }, card);
    const cardIn = mk('div', { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '22px', flex: '1' }, card);
    const cTitle = mk('div', { fontFamily: "'Newsreader', Georgia, serif", fontSize: '16px', lineHeight: '1.3', textWrap: 'pretty' }, cardIn);
    const cSrc = mk('div', { fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: '12px', lineHeight: '1.45', opacity: '0.78' }, cardIn);
    const close = mk('button', { position: 'absolute', left: '0', top: '0', width: '48px', height: '48px', borderRadius: '50%', border: '0', padding: '0', background: RED, cursor: 'pointer', opacity: '0', pointerEvents: 'none', display: 'grid', placeItems: 'center' }, layer);
    close.setAttribute('aria-label', 'Close');
    close.innerHTML = '<svg width="18" height="18" viewBox="0 0 18 18"><path d="M2 2L16 16M16 2L2 16" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>';
    const arrow = (side) => { const b = mk('button', { position: 'absolute', top: '50%', [side]: '22px', marginTop: '-24px', width: '48px', height: '48px', borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.5)', padding: '0', zIndex: '6', background: 'rgba(20,20,20,0.55)', cursor: 'pointer', opacity: '0', pointerEvents: 'none', display: 'grid', placeItems: 'center', transition: 'background 150ms' }, layer);
      b.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14"><path d="' + (side === 'left' ? 'M9 2L4 7L9 12' : 'M5 2L10 7L5 12') + '" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      b.onmouseenter = () => b.style.background = 'rgba(60,60,60,0.85)'; b.onmouseleave = () => b.style.background = 'rgba(20,20,20,0.55)'; b.setAttribute('aria-label', side === 'left' ? 'Previous' : 'Next'); return b; };
    const prevB = arrow('left'), nextB = arrow('right');

    const items = () => [...root.querySelectorAll('[data-lb]')].filter(el => el.offsetParent !== null);
    const kindOf = (el) => el.dataset.video ? 'video' : (el.dataset.lb || 'image');

    function finalRect(el) {
      const vw = innerWidth, vh = innerHeight, mob = vw < 768, k = kindOf(el);
      const w0 = el.offsetWidth, h0 = el.offsetHeight, ar = k === 'video' ? 16 / 9 : w0 / h0;
      let W = mob ? vw * 0.94 : Math.min(vw * 0.78, vw - 210 - 88 - 180);
      if (k === 'note') { const fs = parseFloat(getComputedStyle(el.querySelector('[data-lb-text]') || el).fontSize) || 12; W = Math.min(W, w0 * (20 / fs)); }
      let H = W / ar; const maxH = vh * (mob ? 0.66 : 0.9); if (H > maxH) { H = maxH; W = H * ar; }
      let x, y;
      if (mob) { x = (vw - W) / 2; y = Math.max(64, (vh - H - 16 - 150) / 2); }
      else { const total = W + 88 + 210; x = (vw - total) / 2; y = (vh - H) / 2; }
      return { x, y, w: W, h: H, mob, sx: W / w0, sy: H / h0 };
    }
    function placeChrome(F, animate) {
      const cx = F.mob ? F.x + F.w - 30 : F.x + F.w + 20, cy = F.mob ? F.y - 18 : F.y;
      const kx = F.mob ? F.x : F.x + F.w + 88, ky = F.mob ? F.y + F.h + 18 : F.y + 30;
      const mv = (el, x, y) => { const from = el._pos; el._pos = [x, y]; el.style.left = x + 'px'; el.style.top = y + 'px';
        if (animate && from) el.animate([{ translate: (from[0] - x) + 'px ' + (from[1] - y) + 'px' }, { translate: '0px 0px' }], { duration: 300, easing: OPEN_E, composite: 'add' }); };
      mv(close, cx, cy); mv(card, kx, ky); card.style.width = (F.mob ? F.w : 210) + 'px';
      css(notch, F.mob ? { left: '22px', top: '-9px', borderLeft: '9px solid transparent', borderRight: '9px solid transparent', borderBottom: '10px solid ' + BLUE, borderTop: '0' }
        : { left: '-10px', top: '20px', borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderRight: '10px solid ' + BLUE, borderLeft: '0' });
    }
    function setCaption(el, animate) {
      const t = el.dataset.title || '', s = el.dataset.source || '';
      const apply = () => { cTitle.textContent = t; cSrc.innerHTML = 'Source:<br>'; cSrc.appendChild(document.createTextNode(s));
        if (el.dataset.link) { const a = document.createElement('a'); a.href = el.dataset.link; a.target = '_blank'; a.rel = 'noopener'; a.textContent = (el.dataset.linkLabel || 'Open') + ' ↗'; Object.assign(a.style, { display: 'inline-block', marginTop: '14px', padding: '9px 14px', background: '#fff', color: BLUE, borderRadius: '999px', textDecoration: 'none', letterSpacing: '0.04em', pointerEvents: 'auto', opacity: '1' }); cSrc.appendChild(document.createElement('br')); cSrc.appendChild(a); } };
      if (!animate) return apply();
      const h0 = card.offsetHeight;
      cardIn.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 75, fill: 'forwards' }).onfinish = () => {
        apply(); card.style.height = 'auto'; const h1 = card.offsetHeight;
        card.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: 180, easing: OPEN_E });
        cardIn.getAnimations().forEach(a => a.cancel()); cardIn.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 75 }); };
    }

    function makeClone(el) {
      const r = el.getBoundingClientRect(), w0 = el.offsetWidth, h0 = el.offsetHeight, rot = rotOf(el);
      const c = el.cloneNode(true); c.removeAttribute('data-lb');
      const F = finalRect(el);
      const fcx = F.x + F.w / 2, fcy = F.y + F.h / 2;
      css(c, { position: 'fixed', left: (fcx - w0 / 2) + 'px', top: (fcy - h0 / 2) + 'px', width: w0 + 'px', height: h0 + 'px', margin: '0', flex: 'none', maxWidth: 'none', boxSizing: 'border-box', transformOrigin: '50% 50%', zIndex: '1', pointerEvents: 'auto', cursor: 'grab', willChange: 'transform', boxShadow: '0 30px 80px rgba(0,0,0,0.45)', touchAction: 'pan-y', transition: 'none' }); c.querySelectorAll('*').forEach(n => { n.style.transition = 'none'; });
      layer.insertBefore(c, card);
      const dx = (r.left + r.width / 2) - fcx, dy = (r.top + r.height / 2) - fcy;
      const T = { origin: `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(1, 1)`, lift: `translate(${dx + 8}px, ${dy - 12}px) rotate(${rot + (rot >= 0 ? 2.5 : -2.5)}deg) scale(1.04, 1.04)`, final: `translate(0px, 0px) rotate(0deg) scale(${F.sx}, ${F.sy})` };
      if (kindOf(el) === 'video') { c.style.background = '#000'; [...c.children].forEach(ch => { if (!ch.hasAttribute('data-lb-keep')) ch.style.opacity = '0'; }); }
      return { el, c, F, T, w0, h0 };
    }
    function videoIn(L, delay) {
      const src = L.el.dataset.video, id = /youtu/i.test(src) || /^[\w-]{11}$/.test(src) ? ytId(src) : null;
      if (!id) { const v = mk('video', { position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'contain', background: '#000', opacity: '0', transition: 'opacity 300ms' }, L.c);
        v.controls = true; v.playsInline = true; v.setAttribute('data-lb-media', '');
        css(v, { width: (100 * L.F.sx) + '%', height: (100 * L.F.sy) + '%', transform: `scale(${1 / L.F.sx}, ${1 / L.F.sy})`, transformOrigin: '0 0' });
        ['pointerdown', 'mousedown', 'touchstart', 'click'].forEach(ev => v.addEventListener(ev, e => e.stopPropagation()));
        L.vt = setTimeout(() => { v.src = src; v.style.opacity = '1'; v.play().catch(() => {}); }, delay); return; }
      const f = mk('iframe', { position: 'absolute', inset: '0', width: '100%', height: '100%', border: '0', opacity: '0', transition: 'opacity 300ms' }, L.c);
      f.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture'; f.allowFullscreen = true;
      // counter-scale so the embed renders at its real size inside the scaled clone
      css(f, { width: (100 * L.F.sx) + '%', height: (100 * L.F.sy) + '%', transform: `scale(${1 / L.F.sx}, ${1 / L.F.sy})`, transformOrigin: '0 0' });
      L.vt = setTimeout(() => { f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0'; f.onload = () => f.style.opacity = '1'; }, delay);
    }
    const fade = (el, to, dur, delay, extra) => { const from = getComputedStyle(el).opacity; el.getAnimations().forEach(a => a.cancel());
      el.style.opacity = to; return el.animate([{ opacity: from, ...(extra && extra[0]) }, { opacity: to, ...(extra && extra[1]) }], { duration: dur, delay: delay || 0, easing: 'ease-out', fill: 'backwards' }); };

    function lockScroll(on) { root.style.overflowY = on ? 'hidden' : 'auto'; layer.style.pointerEvents = on ? 'auto' : 'none'; overlay.style.pointerEvents = on ? 'auto' : 'none'; [close, prevB, nextB].forEach(b => b.style.pointerEvents = on ? 'auto' : 'none'); }
    function chromeIn(el, F) {
      setCaption(el, false); card.style.height = 'auto'; placeChrome(F, false);
      const n = items().length > 1;
      fade(card, '1', 150, 0, [{ transform: 'translateX(12px)' }, { transform: 'translateX(0)' }]);
      fade(close, '1', 150, 100, [{ transform: 'scale(0.6)' }, { transform: 'scale(1)' }]).effect.updateTiming({ easing: POP_E });
      fade(overlay, '0.72', 300, 100);
      [prevB, nextB].forEach(b => fade(b, n ? '1' : '0', 200, 250));
    }

    function open(el) {
      if (lb && lb.closing && lb.el === el) return reopen();
      if (lb) finishNow();
      el.style.zIndex = ++zTop;
      const L = makeClone(el); lb = L; el.style.visibility = 'hidden';
      lockScroll(true); chromeIn(el, L.F);
      if (reduced) { L.c.style.transform = L.T.final; L.a = L.c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 }); }
      else { L.c.style.transform = L.T.final;
        L.a = L.c.animate([{ transform: L.T.origin, easing: 'ease-out' }, { transform: L.T.lift, offset: 0.27, easing: OPEN_E }, { transform: L.T.final }], { duration: 375, delay: 175, fill: 'backwards' }); }
      if (kindOf(el) === 'video') videoIn(L, reduced ? 150 : 850);
      bindDrag(L); bindLoupe(L);
    }
    function reopen() {
      const L = lb; L.closing = false; const cur = getComputedStyle(L.c).transform;
      L.a && L.a.cancel(); L.c.style.transform = L.T.final; L.a = L.c.animate([{ transform: cur }, { transform: L.T.final }], { duration: 320, easing: OPEN_E });
      L.a.onfinish = null; lockScroll(true); chromeIn(L.el, L.F);
    }
    function finishNow() { const L = lb; hideLoupe && hideLoupe(); if (!L) return; L.a && L.a.cancel(); clearTimeout(L.vt); L.c.remove(); L.el.style.visibility = ''; lb = null; }
    function closeLB() {
      const L = lb; if (!L || L.closing) return; L.closing = true; clearTimeout(L.vt); hideLoupe();
      fade(card, '0', 150); fade(close, '0', 150); fade(prevB, '0', 150); fade(nextB, '0', 150); fade(overlay, '0', 300);
      lockScroll(false); layer.style.pointerEvents = 'none'; L.c.style.pointerEvents = 'none';
      // re-measure: the page may have moved since opening
      const r = L.el.getBoundingClientRect(), rot = rotOf(L.el), fcx = L.F.x + L.F.w / 2, fcy = L.F.y + L.F.h / 2;
      const back = `translate(${r.left + r.width / 2 - fcx}px, ${r.top + r.height / 2 - fcy}px) rotate(${rot}deg) scale(1, 1)`;
      const cur = getComputedStyle(L.c).transform; L.a && L.a.cancel();
      const ifr = L.c.querySelector('iframe, [data-lb-media]'); if (ifr) { if (ifr.pause) ifr.pause(); ifr.remove(); } clearTimeout(L.vt); if (kindOf(L.el) === 'video') [...L.c.children].forEach(ch => ch.style.opacity = '');
      L.c.style.transform = back; L.c.style.boxShadow = getComputedStyle(L.el).boxShadow;
      L.a = reduced ? L.c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: 'forwards' }) : L.c.animate([{ transform: cur, boxShadow: '0 30px 80px rgba(0,0,0,0.45)' }, { transform: back, boxShadow: L.c.style.boxShadow }], { duration: 300, easing: CLOSE_E });
      L.a.onfinish = () => { if (lb !== L || !L.closing) return; L.el.style.zIndex = ++zTop; L.el.style.visibility = ''; L.c.remove(); lb = null; };
    }
    function slide(dir, fromDrag) {
      const L = lb; if (!L || L.closing || L.sliding) return;
      const list = items(), i = list.indexOf(L.el); if (list.length < 2 || i < 0) return;
      const nx = list[(i + dir + list.length) % list.length];
      L.sliding = true; clearTimeout(L.vt);
      const cur = getComputedStyle(L.c).transform, outX = -dir * L.F.w * 0.4; L.a && L.a.cancel();
      const old = L; old.c.style.pointerEvents = 'none';
      old.c.animate([{ transform: cur, opacity: 1 }, { transform: `translate(${outX}px, 0px) rotate(0deg) scale(${old.F.sx}, ${old.F.sy})`, opacity: 0 }], { duration: reduced ? 150 : 250, easing: 'ease-in', fill: 'forwards' })
        .onfinish = () => { old.c.remove(); old.el.style.visibility = ''; };
      nx.style.zIndex = ++zTop;
      const N = makeClone(nx); nx.style.visibility = 'hidden'; lb = N;
      N.c.style.transform = N.T.final;
      N.a = N.c.animate([{ transform: `translate(${dir * N.F.w * 0.4}px, 0px) rotate(0deg) scale(${N.F.sx}, ${N.F.sy})`, opacity: 0 }, { transform: N.T.final, opacity: 1 }], { duration: reduced ? 150 : 300, easing: 'ease-out' });
      setCaption(nx, true); placeChrome(N.F, true);
      if (kindOf(nx) === 'video') videoIn(N, 600);
      bindDrag(N); bindLoupe(N);
    }
    const loupe = mk('div', { position: 'fixed', left: '0', top: '0', width: '240px', height: '240px', borderRadius: '50%', border: '3px solid #fff', boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(0,0,0,0.2)', backgroundColor: '#111', backgroundRepeat: 'no-repeat', pointerEvents: 'none', opacity: '0', transform: 'translate(-50%, -50%) scale(0.6)', transition: 'opacity 140ms ease, transform 160ms ease', zIndex: '5' }, layer);
    const ZOOM = 2.6;
    const hideLoupe = () => { loupe.style.opacity = '0'; loupe.style.transform = 'translate(-50%, -50%) scale(0.6)'; };
    function bindLoupe(L) {
      if (kindOf(L.el) !== 'image') return;
      const img = L.c.querySelector('[role="img"]') || L.c; const bg = getComputedStyle(img).backgroundImage; if (!bg || bg === 'none') return;
      L.c.style.cursor = 'zoom-in';
      const move = (e) => { if (lb !== L || L.closing || e.buttons) return hideLoupe(); const R = img.getBoundingClientRect();
        if (e.clientX < R.left || e.clientX > R.right || e.clientY < R.top || e.clientY > R.bottom) return hideLoupe();
        const fx = (e.clientX - R.left) / R.width, fy = (e.clientY - R.top) / R.height, s = 240;
        css(loupe, { left: e.clientX + 'px', top: e.clientY + 'px', backgroundImage: bg, backgroundSize: (R.width * ZOOM) + 'px ' + (R.height * ZOOM) + 'px', backgroundPosition: (s / 2 - fx * R.width * ZOOM) + 'px ' + (s / 2 - fy * R.height * ZOOM) + 'px', opacity: '1', transform: 'translate(-50%, -50%) scale(1)' }); };
      L.c.addEventListener('pointermove', move); L.c.addEventListener('pointerleave', hideLoupe); L.c.addEventListener('pointerdown', hideLoupe);
    }
    function bindDrag(L) {
      let sx = 0, st = 0, dx = 0, on = false, id = null;
      L.c.addEventListener('pointerdown', (e) => { if (lb !== L || L.closing) return; on = true; id = e.pointerId; sx = e.clientX; st = performance.now(); dx = 0; L.c.setPointerCapture(id); L.c.style.cursor = 'grabbing'; L.a && L.a.finish(); });
      L.c.addEventListener('pointermove', (e) => { if (!on) return; const raw = e.clientX - sx; dx = raw / (1 + Math.abs(raw) / (L.F.w * 0.9)); L.c.style.transform = `translate(${dx}px, 0px) rotate(0deg) scale(${L.F.sx}, ${L.F.sy})`; });
      const up = (e) => { if (!on) return; on = false; L.c.style.cursor = 'grab'; const raw = e.clientX - sx, v = raw / Math.max(1, performance.now() - st);
        if (Math.abs(dx) > L.F.w * 0.25 || (Math.abs(v) > 0.6 && Math.abs(raw) > 20)) return slide(raw < 0 ? 1 : -1, true);
        const cur = L.c.style.transform; L.c.style.transform = L.T.final; L.a = L.c.animate([{ transform: cur }, { transform: L.T.final }], { duration: 320, easing: POP_E }); };
      L.c.addEventListener('pointerup', up); L.c.addEventListener('pointercancel', up);
    }

    overlay.addEventListener('click', closeLB); close.addEventListener('click', closeLB);
    prevB.addEventListener('click', () => slide(-1)); nextB.addEventListener('click', () => slide(1));
    let wx = 0, wt = 0;
    const onWheel = (e) => { if (!lb || lb.closing) return; e.preventDefault(); if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      const now = performance.now(); if (now - wt > 220) wx = 0; wt = now; wx += e.deltaX; if (Math.abs(wx) > 70 && !lb.sliding) { slide(wx > 0 ? 1 : -1); wx = -1e6 * Math.sign(wx); } };
    layer.addEventListener('wheel', onWheel, { passive: false });
    const onKey = (e) => { if (!lb || lb.closing) return; if (e.key === 'Escape') { e.stopPropagation(); closeLB(); } else if (e.key === 'ArrowRight') slide(1); else if (e.key === 'ArrowLeft') slide(-1); };
    addEventListener('keydown', onKey, true);
    const onOver = (e) => { const t = e.target.closest && e.target.closest('[data-lb]'); if (t && root.contains(t) && t.style.zIndex != zTop) t.style.zIndex = ++zTop; };
    const onClick = (e) => { const t = e.target.closest && e.target.closest('[data-lb]'); if (t && root.contains(t)) { e.preventDefault(); e.stopPropagation(); open(t); } };
    root.addEventListener('mouseover', onOver); root.addEventListener('click', onClick);
    const onResize = () => { if (!lb || lb.closing) return; const L = lb; finishNow(); const nl = makeClone(L.el); L.el.style.visibility = 'hidden'; nl.c.style.transform = nl.T.final; lb = nl; placeChrome(nl.F, false); bindDrag(nl); };
    addEventListener('resize', onResize);
    return { finishNow: () => { finishNow(); [card, close, prevB, nextB, overlay].forEach(e => { e.getAnimations().forEach(a => a.cancel()); e.style.opacity = '0'; }); lockScroll(false); }, close: closeLB, isOpen: () => !!lb && !lb.closing, destroy() { finishNow(); layer.remove(); removeEventListener('keydown', onKey, true); removeEventListener('resize', onResize); root.removeEventListener('mouseover', onOver); root.removeEventListener('click', onClick); lockScroll(false); } };
  }
  window.OCLightbox = { attach };
})();
