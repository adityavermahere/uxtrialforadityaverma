/* Build replaces these constants with content-addressed same-origin URLs. */
const resources = __OC_RESOURCES__;
const imageOriginals = __OC_IMAGE_ORIGINALS__;
window.__resources = resources;
window.__OC_TEXTURE_MANIFEST__ = __OC_TEXTURE_MANIFEST_URL__;
performance.mark('oc:bootstrap');

const scripts = new Map();
function loadScript(url) {
  if (!scripts.has(url)) {
    const pending = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Could not load ${url}`));
      document.head.append(script);
    });
    scripts.set(url, pending);
    pending.catch(() => scripts.delete(url));
  }
  return scripts.get(url);
}

let portfolioReady, portfolioText;
window.OC = {
  loadCharacters: () => loadScript(resources.characters),
  fullImage(url) {
    return imageOriginals[url] || imageOriginals[new URL(url, location.href).pathname] || url;
  },
  preparedText: url => url === resources['./DrawerFiles.dc.html'] ? portfolioText : undefined,
  preparePortfolio() {
    if (!portfolioReady) {
      portfolioText = fetch(resources['./DrawerFiles.dc.html']).then(async response => {
        if (!response.ok) throw new Error('Could not load the portfolio');
        return response.text();
      });
      portfolioReady = Promise.all([
        loadScript(resources.lightbox),
        portfolioText.then(text => {
          // The runtime consumes this directly, avoiding a second request.
          const blob = new Blob([text], { type: 'text/html' });
          window.__resourceBlobs ||= {};
          window.__resourceBlobs[resources['./DrawerFiles.dc.html']] = blob;
        }),
      ]).catch(error => { portfolioReady = null; portfolioText = null; throw error; });
    }
    return portfolioReady;
  },
  observeImages(root) {
    if (!('IntersectionObserver' in window)) {
      root.querySelectorAll('[data-oc-background]').forEach(el => {
        el.style.backgroundImage = el.dataset.ocBackground;
      });
      return () => {};
    }
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.style.backgroundImage = entry.target.dataset.ocBackground;
        observer.unobserve(entry.target);
      }
    }, { root, rootMargin: '500px 0px' });
    const observe = () => root.querySelectorAll('[data-oc-background]').forEach(el => observer.observe(el));
    const mutations = new MutationObserver(observe);
    mutations.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-oc-background'] });
    observe();
    return () => { observer.disconnect(); mutations.disconnect(); };
  },
};

window.addEventListener('error', event => {
  const shell = document.getElementById('oc-loading');
  if (shell && event.message) {
    shell.textContent = 'The room could not load. Please refresh to try again.';
    console.error('[October Calibration]', event.error || event.message);
  }
});
