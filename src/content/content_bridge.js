(function () {
  'use strict';

  // Only Store / collector / media run in the page MAIN world.
  // JSZip + HTML/ZIP live in the isolated content-script world.
  const MAIN_FILES = [
    'src/injected/store-access.js',
    'src/injected/message-collector.js',
    'src/injected/media-downloader.js',
    'src/injected/injected.js',
  ];

  function isWhatsAppWeb() {
    try {
      return location.hostname === 'web.whatsapp.com';
    } catch (_) {
      return false;
    }
  }

  function injectScript(path) {
    return new Promise((resolve, reject) => {
      const url = chrome.runtime.getURL(path);
      const s = document.createElement('script');
      s.src = url;
      s.async = false;
      s.onload = () => {
        s.remove();
        resolve();
      };
      s.onerror = () => reject(new Error('Failed to inject ' + path));
      (document.documentElement || document.head).appendChild(s);
    });
  }

  async function injectAll() {
    if (!isWhatsAppWeb()) return;
    if (window.__WA_EXPORT_BRIDGE_INJECTED__) return;
    window.__WA_EXPORT_BRIDGE_INJECTED__ = true;

    try {
      for (let i = 0; i < MAIN_FILES.length; i++) {
        await injectScript(MAIN_FILES[i]);
      }
    } catch (err) {
      window.__WA_EXPORT_BRIDGE_INJECTED__ = false;
      throw err;
    }
  }

  function boot() {
    if (!isWhatsAppWeb()) return;

    if (typeof window.WA_EXPORT_CREATE_PANEL === 'function') {
      window.WA_EXPORT_CREATE_PANEL();
    }
    injectAll().catch((err) => {
      console.error('[WA Export] inject failed', err);
      const status = document.querySelector('#wa-rich-export-panel .wa-xp-status-text');
      if (status) status.textContent = 'Failed to inject into WhatsApp page: ' + err.message;
      const statusRow = document.querySelector('#wa-rich-export-panel .wa-xp-status');
      if (statusRow) statusRow.classList.add('error');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
