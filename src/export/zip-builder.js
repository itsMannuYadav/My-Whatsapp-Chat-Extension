(function () {
  'use strict';

  function safeFolderName(name) {
    return (
      String(name || 'chat')
        .replace(/[\\/:*?"<>|]+/g, '_')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 60) || 'chat'
    );
  }

  function dateStamp() {
    const d = new Date();
    const p = (n) => (n < 10 ? '0' + n : '' + n);
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  function base64ToUint8Array(base64) {
    const bin = atob(base64);
    const len = bin.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  function getJSZip() {
    // Content-script world: jszip-forced.js defines global JSZip
    if (typeof JSZip === 'function') return JSZip;
    if (typeof globalThis !== 'undefined' && typeof globalThis.JSZip === 'function') {
      return globalThis.JSZip;
    }
    return null;
  }

  async function buildExportZip(exportData, files) {
    const Zip = getJSZip();
    if (!Zip) {
      throw new Error('JSZip not loaded');
    }
    if (typeof WA_EXPORT_RENDERER === 'undefined' || !WA_EXPORT_RENDERER) {
      throw new Error('Renderer not loaded');
    }
    const theme =
      (typeof WA_EXPORT_THEME_CSS !== 'undefined' && WA_EXPORT_THEME_CSS) ||
      (typeof window !== 'undefined' && window.WA_EXPORT_THEME_CSS);
    if (!theme) {
      throw new Error('Theme CSS not loaded');
    }

    const chatName = (exportData.chat && exportData.chat.name) || 'chat';
    const folder = safeFolderName(chatName) + '_' + dateStamp();
    const zip = new Zip();
    const root = zip.folder(folder);

    const html = WA_EXPORT_RENDERER.buildIndexHtml(exportData, theme);
    root.file('index.html', html);
    root.file('styles.css', theme);
    root.file('chat.json', JSON.stringify(exportData, null, 2));

    const mediaFolder = root.folder('media');
    const usedNames = {};
    const list = files || [];
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      if (!f || !f.base64) continue;
      let name = (f.path || '').replace(/^media\//, '') || 'file_' + i;
      name = name.replace(/[\\/:*?"<>|]+/g, '_');
      if (usedNames[name]) {
        const parts = name.split('.');
        const ext = parts.length > 1 ? parts.pop() : '';
        const base = parts.join('.') || 'file';
        name = base + '_' + i + (ext ? '.' + ext : '');
      }
      usedNames[name] = 1;
      mediaFolder.file(name, base64ToUint8Array(f.base64));
    }

    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    const filename = folder + '.zip';
    return { blob, filename, folder };
  }

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 4000);
  }

  // Expose on globalThis so content-script scope always finds it
  const api = {
    buildExportZip,
    triggerDownload,
    safeFolderName,
  };
  if (typeof globalThis !== 'undefined') globalThis.WA_EXPORT_ZIP = api;
  if (typeof window !== 'undefined') window.WA_EXPORT_ZIP = api;
})();
