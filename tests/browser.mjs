import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { homedir } from 'node:os';
import { chromium } from 'playwright';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const screenshotEnabled = process.env.SKIP_SCREENSHOTS !== '1';
const testRenderScale = process.env.SOFTWARE_GPU === '1' ? Number(process.env.SOFTWARE_GPU_SCALE || '.5') : null;
if (testRenderScale !== null && !(testRenderScale > 0 && testRenderScale <= 1)) throw new Error('SOFTWARE_GPU_SCALE must be greater than zero and at most one');
const output = resolve('test-results');
await mkdir(output, { recursive: true });
await mkdir(resolve('reports'), { recursive: true });
const cachedChrome = resolve(homedir(), '.cache/ms-playwright/chromium-1243/chrome-linux64/chrome');
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
  (existsSync(chromium.executablePath()) ? undefined : existsSync(cachedChrome) ? cachedChrome : undefined);
const report = {
  baseURL,
  generatedAt: new Date().toISOString(),
  browser: null,
  rendering: 'Headless Chromium with software GPU; local timings are not a production/mobile hardware benchmark.',
  screenshotsEnabled: screenshotEnabled,
  testRenderScale,
  testRenderScaleNote: testRenderScale === null ? 'Application rendering configuration unchanged.' : 'Test-only pixel ratio applied after the initial door phase; production scene configuration is unchanged. This run cannot establish production visual quality or frame rate.',
  checks: [],
  runs: [],
  errors: [],
};
let browser;
try {
  browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'],
  });
  report.browser = browser.version();
} catch (error) {
  report.passed = false;
  report.status = 'unavailable';
  report.failure = { message: 'Browser launch failed; no browser acceptance was performed.', detail: error.message };
  await writeFile(resolve('reports/browser-acceptance.json'), `${JSON.stringify(report, null, 2)}\n`);
  throw error;
}

function pass(name, details) {
  report.checks.push({ name, passed: true, ...details });
  console.log(`PASS ${name}`);
}

async function screenshot(page, name) {
  if (screenshotEnabled) await page.screenshot({ path: resolve(output, name) });
}

async function applyTestRenderScale(page) {
  if (testRenderScale === null) return;
  await page.evaluate(scale => {
    const scene = window.__oc;
    scene.prMax = scale;
    scene.pr = scale;
    scene.renderer.setPixelRatio(scale);
    scene.composer?.setPixelRatio(scale);
    scene.layout();
  }, testRenderScale);
}

async function phase(page, expected, timeout = 45_000) {
  await page.waitForFunction(value => window.__oc?.state.phase === value, expected, { timeout });
}

async function sample(page) {
  return page.evaluate(() => ({
    elapsedMs: performance.now(),
    navigation: performance.getEntriesByType('navigation').map(x => ({
      transferSize: x.transferSize,
      encodedBodySize: x.encodedBodySize,
      decodedBodySize: x.decodedBodySize,
      domContentLoadedMs: x.domContentLoadedEventEnd,
    })),
    resources: performance.getEntriesByType('resource').map(x => ({
      name: x.name.replace(location.origin, ''),
      initiatorType: x.initiatorType,
      transferSize: x.transferSize,
      encodedBodySize: x.encodedBodySize,
      durationMs: x.duration,
    })),
    marks: performance.getEntriesByType('mark').map(x => ({ name: x.name, startTimeMs: x.startTime })),
    scene: window.__oc ? {
      phase: window.__oc.state.phase,
      lite: window.__oc.lite,
      reducedMotion: window.__oc.reduced,
      pixelRatio: window.__oc.pr,
      geometries: window.__oc.renderer?.info.memory.geometries,
      textures: window.__oc.renderer?.info.memory.textures,
      drawCalls: window.__oc.renderer?.info.render.calls,
      triangles: window.__oc.renderer?.info.render.triangles,
    } : null,
  }));
}

async function createPage(name, viewport, reducedMotion = 'reduce') {
  const context = await browser.newContext({ viewport, reducedMotion });
  const page = await context.newPage();
  page.setDefaultTimeout(30_000);
  const requests = [];
  const issues = [];
  const recordIssue = issue => {
    issues.push(issue);
    report.errors.push({ run: name, ...issue });
  };
  page.on('request', request => requests.push(request.url()));
  page.on('pageerror', error => recordIssue({ type: 'pageerror', message: error.message }));
  page.on('console', message => {
    if (message.type() === 'error') recordIssue({ type: 'console', message: message.text() });
  });
  page.on('response', response => {
    if (response.status() >= 400) recordIssue({ type: 'http', status: response.status(), url: response.url() });
  });
  page.on('requestfailed', request => {
    // Closing a playing media lightbox deliberately aborts its range request.
    const error = request.failure()?.errorText || '';
    if (error.includes('ERR_ABORTED') && /\.(mp3|mp4)(?:[?#]|$)/.test(request.url())) return;
    recordIssue({ type: 'requestfailed', url: request.url(), message: error });
  });
  return { name, context, page, requests, issues };
}

async function interactivePoint(page, tag) {
  return page.evaluate(target => {
    const s = window.__oc, T = s.T;
    s.scene.updateMatrixWorld(true);
    s.camera.updateMatrixWorld(true);
    const ray = new T.Raycaster();
    const rect = s.renderer.domElement.getBoundingClientRect();
    const roots = s.interactives.filter(object => object.userData.tag === target);
    const candidates = [];
    for (const root of roots) {
      root.traverse(object => {
        if (!object.isMesh || !object.visible) return;
        const box = new T.Box3().setFromObject(object);
        const center = box.getCenter(new T.Vector3());
        candidates.push(center);
      });
    }
    for (const candidate of candidates) {
      const p = candidate.clone().project(s.camera);
      if (p.z < -1 || p.z > 1 || Math.abs(p.x) > .96 || Math.abs(p.y) > .96) continue;
      ray.setFromCamera(new T.Vector2(p.x, p.y), s.camera);
      const hit = ray.intersectObjects(s.interactives, true)[0];
      let object = hit?.object;
      while (object && !object.userData.tag) object = object.parent;
      if (object?.userData.tag === target) {
        return { x: rect.left + (p.x + 1) * rect.width / 2, y: rect.top + (1 - p.y) * rect.height / 2 };
      }
    }
    throw new Error(`No clickable canvas point for ${target}`);
  }, tag);
}

async function clickInteractive(page, tag) {
  const point = await interactivePoint(page, tag);
  await page.mouse.click(point.x, point.y);
}

async function awaitCase(page, index) {
  await page.waitForFunction(i => {
    const p = window.__ocPortfolio;
    return p?.state.view === 'case' && p.state.cur === i && !p.busy;
  }, index);
}

async function switchCase(page, index) {
  await page.evaluate(i => window.__ocPortfolio.switchTo(i), index);
  await awaitCase(page, index);
}

try {
  const desktop = await createPage('desktop', { width: 1440, height: 900 });
  const { page, requests } = desktop;
  await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
  await phase(page, 'door', 120_000);
  const startup = await sample(page);
  assert(!requests.some(url => /\.(mp3|mp4)(?:[?#]|$)/.test(url)), 'Initial navigation must not request audio/video');
  assert.equal(await page.evaluate(() => !!window.__ocPortfolio), false, 'Portfolio is not mounted at the door');
  assert.equal(await page.evaluate(() => !!customElements.get('ae-char')), false, 'Characters are not registered at the door');
  pass('desktop cold startup defers portfolio, characters, audio and video', {
    elapsedMs: Math.round(startup.elapsedMs), requests: requests.length,
  });
  await applyTestRenderScale(page);
  await page.waitForTimeout(1750);
  await screenshot(page, 'desktop-door.png');

  await page.getByRole('button', { name: 'Enter the room', exact: true }).click();
  await phase(page, 'room');
  await page.waitForTimeout(1100);
  pass('enter room button works with reduced motion');
  await screenshot(page, 'desktop-room.png');

  // These use real canvas clicks after projecting actual interactive geometry.
  const wasOn = await page.evaluate(() => window.__oc.lampOn);
  await clickInteractive(page, 'lamp');
  await page.waitForFunction(old => window.__oc.lampOn !== old, wasOn);
  await clickInteractive(page, 'lamp');
  await page.waitForFunction(old => window.__oc.lampOn === old, wasOn);
  pass('lamp toggles through canvas hit testing');

  const wasPlaying = await page.evaluate(() => window.__oc.playing);
  await clickInteractive(page, 'gramophone');
  await page.waitForFunction(old => window.__oc.playing !== old, wasPlaying);
  await clickInteractive(page, 'gramophone');
  await page.waitForFunction(old => window.__oc.playing === old, wasPlaying);
  pass('gramophone toggles music through canvas hit testing');

  await clickInteractive(page, 'drawer');
  await phase(page, 'files');
  await page.waitForFunction(() => !!window.__ocPortfolio?.rootRef.current);
  await page.waitForTimeout(700);
  assert(!requests.some(url => /\.mp4(?:[?#]|$)/.test(url)), 'Opening portfolio must not fetch video');
  assert.equal(await page.evaluate(() => !!customElements.get('ae-char')), false);
  assert.equal(await page.locator('[data-band]').count(), 6);
  pass('drawer loads the six-folder portfolio without video or character code');
  await screenshot(page, 'desktop-portfolio.png');

  await page.locator('[data-body="0"]').click();
  await awaitCase(page, 0);
  await screenshot(page, 'desktop-case.png');
  const image = page.locator('[data-lb="image"]').first();
  await image.click();
  await page.waitForFunction(() => window.__ocPortfolio._lb?.isOpen());
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.waitForFunction(() => !window.__ocPortfolio._lb?.isOpen());
  pass('case study and image lightbox open and close');

  await switchCase(page, 5);
  assert(!requests.some(url => /\.mp4(?:[?#]|$)/.test(url)), 'Video cover must use a poster without requesting MP4');
  await page.locator('[data-lb="video"]').click();
  await page.waitForFunction(() => {
    const video = document.querySelector('video[data-lb-media]');
    return !!video?.currentSrc && video.readyState >= 2;
  });
  assert(requests.some(url => /\.mp4(?:[?#]|$)/.test(url)), 'Opening video must request MP4');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.waitForFunction(() => !window.__ocPortfolio._lb?.isOpen());
  pass('video remains deferred through case navigation and plays when opened');

  assert.equal(await page.evaluate(() => !!customElements.get('ae-char')), false);
  await switchCase(page, 4);
  await page.waitForFunction(() => !!customElements.get('ae-char'));
  const thinking = page.getByRole('button', { name: 'Thinking', exact: true });
  await thinking.click();
  await page.waitForFunction(() => window.__ocPortfolio.state.petState === 'thinking');
  pass('character bundle loads only for Aetherion and character state controls work');

  await page.getByRole('button', { name: 'Room', exact: true }).click();
  await phase(page, 'room');
  await page.waitForTimeout(800);
  await page.evaluate(() => window.__oc.gallery(true));
  await phase(page, 'gallery');
  await page.waitForFunction(() => window.__oc.galT >= .99);
  await clickInteractive(page, 'frame:5');
  await phase(page, 'files');
  await awaitCase(page, 5);
  pass('gallery frame opens its matching Shark Tank case');
  await page.getByRole('button', { name: 'Room', exact: true }).click();
  await phase(page, 'room');
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Back to the door', exact: true }).click();
  await phase(page, 'door');
  pass('portfolio returns to room and room returns to door');

  const completed = await sample(page);
  report.runs.push({ name: desktop.name, startup, completed, issues: desktop.issues });
  await desktop.context.close();

  const mobile = await createPage('mobile', { width: 390, height: 844 });
  await mobile.page.goto(baseURL, { waitUntil: 'domcontentloaded' });
  await phase(mobile.page, 'door', 120_000);
  const mobileStartup = await sample(mobile.page);
  await applyTestRenderScale(mobile.page);
  assert(!mobile.requests.some(url => /\.(mp3|mp4)(?:[?#]|$)/.test(url)));
  await mobile.page.getByRole('button', { name: 'Enter the room', exact: true }).click();
  await phase(mobile.page, 'room');
  await mobile.page.waitForTimeout(900);
  await screenshot(mobile.page, 'mobile-room.png');
  await mobile.page.evaluate(() => window.__oc.dive());
  await phase(mobile.page, 'files');
  await mobile.page.waitForFunction(() => !!window.__ocPortfolio?.rootRef.current);
  await mobile.page.waitForTimeout(700);
  const overflow = await mobile.page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert.equal(overflow, false, 'Mobile page has no horizontal overflow');
  await screenshot(mobile.page, 'mobile-portfolio.png');
  await mobile.page.locator('[data-body="0"]').click();
  await awaitCase(mobile.page, 0);
  await screenshot(mobile.page, 'mobile-case.png');
  pass('390px mobile reduced-motion room, portfolio and case navigation work without horizontal overflow');
  report.runs.push({ name: mobile.name, startup: mobileStartup, completed: await sample(mobile.page), issues: mobile.issues });
  await mobile.context.close();

  if (process.env.BASELINE === '1') {
    const baseline = await createPage('original-baseline', { width: 1440, height: 900 });
    await baseline.page.goto(`${baseURL}/__original.html`, { waitUntil: 'domcontentloaded' });
    await phase(baseline.page, 'door', 180_000);
    report.runs.push({ name: baseline.name, startup: await sample(baseline.page), issues: baseline.issues });
    await applyTestRenderScale(baseline.page);
    await baseline.page.waitForTimeout(1750);
    await screenshot(baseline.page, 'original-door.png');
    await baseline.page.getByRole('button', { name: 'Enter the room', exact: true }).click();
    await phase(baseline.page, 'room');
    await baseline.page.waitForTimeout(1100);
    await screenshot(baseline.page, 'original-room.png');
    await baseline.context.close();
    pass('original artifact baseline captured on the same local browser');
  }

  assert.deepEqual(report.errors, [], 'Browser runs must not produce JavaScript, HTTP or unexpected request errors');
  pass('desktop and mobile runs have no JavaScript, HTTP or unexpected request errors');
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.failure = { message: error.message, stack: error.stack };
  console.error(error);
  for (const context of browser.contexts()) {
    for (const page of context.pages()) {
      await screenshot(page, `failure-${Date.now()}.png`).catch(() => {});
      report.failure.page = await page.evaluate(() => ({
        url: location.href,
        scene: window.__oc?.state,
        portfolio: window.__ocPortfolio?.state,
        text: document.body.innerText.slice(-2000),
      })).catch(() => null);
    }
  }
  process.exitCode = 1;
} finally {
  await writeFile(resolve('reports/browser-acceptance.json'), `${JSON.stringify(report, null, 2)}\n`);
  await browser.close();
}
