# October Calibration

Optimized, static Vercel project extracted from `October Calibration (standalone)_1.html`. The original file outside this folder is unchanged.

## Run locally

Use Node.js 20.20 or newer.

```bash
npm ci
npm run build
npm run preview
```

Open `http://127.0.0.1:4173`. Set `PORT` to use another port. `npm run dev` serves the latest build; rerun the build after source edits.

## Vercel

Import `adityavermahere/uxtrialforadityaverma` into Vercel and use the repository root (`.`) as the Root Directory.

| Setting | Value |
| --- | --- |
| Framework Preset | Other |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Environment variables | None required |

`vercel.json` configures the build and immutable asset caching. The HTML entry revalidates so new releases can change the versioned asset URLs. All runtime dependencies and media are served from the deployment's own origin; no separate CDN account or storage service is required. External portfolio links still open their original destinations.

## Source layout

| Path | Purpose |
| --- | --- |
| `src/scene/RoomScene.js` | Three.js scene, lighting, camera, navigation, audio, and lifecycle |
| `src/scene/template.html` | Room interface and deferred portfolio mount |
| `src/portfolio/PortfolioBrowser.js` | Portfolio interaction and animation |
| `src/portfolio/projects.json` | Case-study text, evidence, and image references |
| `src/portfolio/template.html` | Portfolio layout and media presentation |
| `src/bootstrap.js` | Deferred feature loading and visible-image observation |
| `src/vendor/` | Libraries extracted from the supplied artifact, including their license comments |
| `public/assets/media/` | Optimized images, audio, video, and video poster |
| `public/assets/textures/` | Pre-generated room texture pairs |
| `asset-map.json`, `media-map.json` | Source UUID and image-variant mappings |
| `scripts/build.mjs` | Minification, URL rewriting, asset fingerprinting, and deployment packaging |
| `reports/` | Build, media, texture, and offline acceptance evidence |

The original React 18.3.1, Three.js r165, and design-component runtime are retained to preserve the existing implementation. Logic, templates, and content are editable separately; the build assembles the runtime documents. Repeated inline styling within the original design templates is retained.

## Loading and efficiency changes

- Removed the standalone manifest, Base64 unpacking, Blob reconstruction, and document replacement from startup.
- Extracted fonts and libraries into separately cacheable files. Browser font selection still honors each font's Unicode ranges.
- Added small room-image variants and display-image variants. The lightbox upgrades images to pixel-identical full-resolution copies.
- Portfolio code loads on the first drawer/gallery selection and remains available on return visits. Opening a portfolio waits for its required resources before mounting, so failed loading can be retried.
- Character code loads only for its relevant case study. Preview elements disconnect when the portfolio is inactive; their shared animation schedulers stop when empty.
- Case-study background images load as they approach the portfolio viewport. Video downloads begin in the lightbox, rather than through a video thumbnail.
- Audio remains gesture-initiated. Its playback derivative is 192 kbps; the original 320 kbps file remains in the local source assets. The derivative is a lossy quality tradeoff.
- The video is remuxed for fast start without reencoding its audio or video streams.
- Twelve expensive deterministic color/bump texture pairs are baked ahead of time. The randomized Canvas limewash and smaller procedural drawing operations remain in the browser.
- Scene callbacks pause while the portfolio covers the room and when the tab is hidden. Curtain updates, shadow refresh scheduling, ambient-occlusion object filtering, and decorative rug geometry are reduced. Adaptive resolution and lightweight mode are retained.
- Removed the global Canvas prototype modification and added scene-resource disposal.

## Verification

```bash
npm run build
npm test
```

The default tests verify deployment references and hashes, parse generated JavaScript, exercise deferred loading and navigation in a Node VM, and construct the scene using real Three.js geometry with mocked graphics. They do **not** validate actual WebGL output, browser layout, frame rate, or audiovisual quality.

For actual browser acceptance, install Chromium, start the local preview, and run:

```bash
npx playwright install chromium
npm run test:browser
```

The browser suite covers desktop/mobile, scene interactions, portfolio navigation, image/video viewers, character previews, deferred requests, and screenshots. Set `BASE_URL` to test a Vercel preview. Results are recorded in `reports/browser-acceptance.json`.

For an interaction smoke test on a machine using software graphics:

```bash
SKIP_SCREENSHOTS=1 SOFTWARE_GPU=1 SOFTWARE_GPU_SCALE=.25 npm run test:browser
```

This lowers only the test renderer's pixel resolution and skips screenshots. It does not establish full-resolution visual quality or hardware frame-rate performance. A normal browser run and hosted acceptance remain separate checks. No deployment was created as part of this project preparation.

## Regenerate assets

After changing `RoomScene.js`, run this before building:

```bash
npm run bake:textures
npm run build
```

The offline baker reads the exact deterministic recipes from the scene, saves lossless WebP files, and verifies decoded RGBA pixels. The build checks the source hash and rejects stale textures. Commit the generated texture files and manifest along with source changes. Baking is a local authoring step, not part of a normal Vercel build.

To regenerate media variants from the locally retained extracted originals, use `python scripts/optimize-media.py` with Pillow and FFmpeg installed. The media report records full-resolution pixel checks and the audio/video processing choices. Archival PNG/MP3/MP4 originals are excluded from Git and the Vercel upload; the repository builds using the prepared derivatives. Fonts and the SVG remain included. Keep the original standalone HTML as the source archive if transferring the project to another machine.

Keep `public/assets/original/` files immutable. Add a new source UUID for replacement assets; generated derivatives and build assets use content hashes.
