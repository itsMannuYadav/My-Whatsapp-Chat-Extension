(function () {
  'use strict';
  if (window.__WA_EXPORT_MEDIA__) return;

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function extForMime(mime, type) {
    if (mime) {
      if (mime.indexOf('jpeg') >= 0 || mime.indexOf('jpg') >= 0) return 'jpg';
      if (mime.indexOf('png') >= 0) return 'png';
      if (mime.indexOf('webp') >= 0) return 'webp';
      if (mime.indexOf('gif') >= 0) return 'gif';
      if (mime.indexOf('mp4') >= 0) return 'mp4';
      if (mime.indexOf('ogg') >= 0) return 'ogg';
      if (mime.indexOf('opus') >= 0) return 'ogg';
      if (mime.indexOf('mpeg') >= 0 || mime.indexOf('mp3') >= 0) return 'mp3';
      if (mime.indexOf('pdf') >= 0) return 'pdf';
      if (mime.indexOf('word') >= 0) return 'docx';
    }
    if (type === 'sticker') return 'webp';
    if (type === 'image') return 'jpg';
    if (type === 'ptt' || type === 'audio') return 'ogg';
    if (type === 'video') return 'mp4';
    if (type === 'document') return 'bin';
    return 'bin';
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => {
        const result = fr.result || '';
        const comma = String(result).indexOf(',');
        resolve(comma >= 0 ? String(result).slice(comma + 1) : String(result));
      };
      fr.onerror = () => reject(fr.error || new Error('FileReader failed'));
      fr.readAsDataURL(blob);
    });
  }

  function base64ToBlob(b64, mime) {
    try {
      const clean = String(b64).replace(/\s+/g, '');
      const bin = atob(clean);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new Blob([bytes], { type: mime || 'application/octet-stream' });
    } catch (_) {
      return null;
    }
  }

  function detectMimeFromBase64(b64, typeHint) {
    const t = String(b64).replace(/\s+/g, '');
    if (/^\/9j\//.test(t)) return 'image/jpeg';
    if (/^iVBOR/.test(t)) return 'image/png';
    if (/^UklGR/.test(t)) return 'image/webp';
    if (/^R0lGOD/.test(t)) return 'image/gif';
    if (typeHint === 'sticker') return 'image/webp';
    if (typeHint === 'image' || typeHint === 'video') return 'image/jpeg';
    return 'application/octet-stream';
  }

  function looksLikeBase64Media(s) {
    if (!s || typeof s !== 'string') return false;
    const t = s.replace(/\s+/g, '');
    if (t.length < 64) return false;
    if (/^\/9j\//.test(t)) return true;
    if (/^iVBOR/.test(t)) return true;
    if (/^UklGR/.test(t)) return true;
    if (/^R0lGOD/.test(t)) return true;
    if (t.length > 400 && /^[A-Za-z0-9+/=]+$/.test(t.slice(0, 120))) return true;
    return false;
  }

  async function asBlob(maybe) {
    if (!maybe) return null;
    if (maybe instanceof Blob) return maybe;
    if (typeof maybe.forceToBlob === 'function') {
      try {
        const b = maybe.forceToBlob();
        const resolved = b && typeof b.then === 'function' ? await b : b;
        if (resolved instanceof Blob) return resolved;
      } catch (_) {}
    }
    if (maybe.blob instanceof Blob) return maybe.blob;
    if (maybe._blob instanceof Blob) return maybe._blob;
    return null;
  }

  function tryRequire(name) {
    try {
      const Store = window.__WA_EXPORT_STORE__;
      if (Store && Store.tryRequire) return Store.tryRequire(name);
      const req = window.require || (typeof self !== 'undefined' && self.require);
      return req ? req(name) : null;
    } catch (_) {
      return null;
    }
  }

  /** Last-resort tiny preview embedded in msg.body (often ~0.5KB) */
  function tryThumbnailFromMsg(rawMsg, type) {
    if (!rawMsg) return null;
    const candidates = [];
    try {
      if (typeof rawMsg.body === 'string') candidates.push(rawMsg.body);
      if (rawMsg._data && typeof rawMsg._data.body === 'string') candidates.push(rawMsg._data.body);
      if (typeof rawMsg.thumbnail === 'string') candidates.push(rawMsg.thumbnail);
    } catch (_) {}

    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];
      if (!looksLikeBase64Media(c)) continue;
      const mime = detectMimeFromBase64(c, type);
      const blob = base64ToBlob(c, mime);
      if (blob && blob.size > 32) {
        return { blob, mime, filename: null, fromThumb: true };
      }
    }
    return null;
  }

  async function readFromBlobCache(rawMsg) {
    try {
      const filehash =
        (rawMsg.mediaObject && rawMsg.mediaObject.filehash) ||
        rawMsg.filehash ||
        (rawMsg.mediaData && rawMsg.mediaData.filehash);
      if (!filehash) return null;

      const cacheMod = tryRequire('WAWebMediaInMemoryBlobCache');
      const cache =
        cacheMod &&
        (cacheMod.InMemoryMediaBlobCache ||
          cacheMod.default ||
          cacheMod);
      if (cache && typeof cache.get === 'function') {
        const cached = cache.get(filehash);
        const blob = await asBlob(cached);
        if (blob && blob.size > 0) return blob;
      }
    } catch (_) {}
    return null;
  }

  async function readFromMediaObject(rawMsg) {
    try {
      if (rawMsg.mediaObject && rawMsg.mediaObject.mediaBlob) {
        const blob = await asBlob(rawMsg.mediaObject.mediaBlob);
        if (blob && blob.size > 0) return blob;
      }
    } catch (_) {}
    try {
      if (rawMsg.mediaData && rawMsg.mediaData.mediaBlob) {
        const blob = await asBlob(rawMsg.mediaData.mediaBlob);
        if (blob && blob.size > 0) return blob;
      }
    } catch (_) {}
    return null;
  }

  async function downloadViaManager(rawMsg) {
    try {
      const dmMod = tryRequire('WAWebDownloadManager');
      const dm =
        (dmMod && (dmMod.downloadManager || dmMod.DownloadManager || dmMod)) ||
        null;
      if (!dm) return null;

      const params = {
        directPath: rawMsg.directPath,
        encFilehash: rawMsg.encFilehash,
        filehash: rawMsg.filehash,
        mediaKey: rawMsg.mediaKey,
        mediaKeyTimestamp: rawMsg.mediaKeyTimestamp,
        type: rawMsg.type,
        signal: new AbortController().signal,
      };

      if (typeof dm.downloadAndDecrypt === 'function') {
        const buf = await dm.downloadAndDecrypt(params);
        if (buf instanceof ArrayBuffer) {
          return new Blob([buf], { type: rawMsg.mimetype || 'application/octet-stream' });
        }
        const blob = await asBlob(buf);
        if (blob) return blob;
        if (buf && buf.byteLength) {
          return new Blob([buf], { type: rawMsg.mimetype || 'application/octet-stream' });
        }
      }

      if (typeof dm.downloadAndMaybeDecrypt === 'function') {
        const res = await dm.downloadAndMaybeDecrypt(params);
        if (res instanceof ArrayBuffer) {
          return new Blob([res], { type: rawMsg.mimetype || 'application/octet-stream' });
        }
        const blob = await asBlob(res);
        if (blob) return blob;
      }
    } catch (_) {}
    return null;
  }

  /**
   * Force WhatsApp to fetch + decrypt full media (same approach as whatsapp-web.js).
   * Returns full Blob when possible; never returns the tiny body thumbnail here.
   */
  async function resolveFullMediaBlob(rawMsg, timeoutMs) {
    if (!rawMsg) return null;
    const timeout = timeoutMs || 30000;
    const started = Date.now();

    // 1) Ask WA to download even if expensive / not cached
    try {
      if (typeof rawMsg.downloadMedia === 'function') {
        const p = rawMsg.downloadMedia({
          downloadEvenIfExpensive: true,
          rmrReason: 1,
          isUserInitiated: true,
        });
        await Promise.race([
          Promise.resolve(p).catch(() => null),
          sleep(Math.min(timeout, 20000)),
        ]);
      }
    } catch (_) {}

    // 2) Wait briefly for RESOLVED stage
    while (Date.now() - started < Math.min(timeout, 12000)) {
      try {
        const stage = rawMsg.mediaData && rawMsg.mediaData.mediaStage;
        if (stage && String(stage).indexOf('ERROR') >= 0) break;
        if (stage === 'RESOLVED') break;
      } catch (_) {}
      await sleep(250);
    }

    // 3) In-memory cache (preferred — full decrypted file)
    let blob = await readFromBlobCache(rawMsg);
    if (blob && blob.size > 1500) return blob;

    // 4) mediaObject.mediaBlob
    blob = await readFromMediaObject(rawMsg);
    if (blob && blob.size > 1500) return blob;

    // 5) DownloadManager decrypt from CDN
    if (Date.now() - started < timeout) {
      blob = await Promise.race([
        downloadViaManager(rawMsg),
        sleep(timeout - (Date.now() - started)).then(() => null),
      ]);
      if (blob && blob.size > 1500) return blob;
    }

    // Accept smaller blobs for stickers/ptt if that's all we got from full path
    blob = (await readFromBlobCache(rawMsg)) || (await readFromMediaObject(rawMsg)) || blob;
    if (blob && blob.size > 0) {
      // Reject obvious thumbnail sizes for images (<2KB jpeg thumbs)
      if (rawMsg.type === 'image' && blob.size < 2000) return null;
      return blob;
    }

    return null;
  }

  async function tryDownloadMedia(rawMsg, timeoutMs) {
    if (!rawMsg) return null;

    const full = await resolveFullMediaBlob(rawMsg, timeoutMs);
    if (full) {
      return {
        blob: full,
        mime: full.type || rawMsg.mimetype || 'application/octet-stream',
        filename: rawMsg.filename || null,
        fromThumb: false,
      };
    }
    return null;
  }

  async function downloadMediaForMessage(normalizedMsg, index, options) {
    const opts = options || {};
    const type = normalizedMsg.type;
    const raw = normalizedMsg._raw;
    const timeoutMs = opts.timeoutMs || 30000;

    const labelMap = {
      image: '[Photo]',
      sticker: '[Sticker]',
      document: '[Document]',
      ptt: '[Voice note]',
      audio: '[Audio]',
      video: '[Video]',
    };

    async function saveBlob(downloaded, typeName) {
      const mime = downloaded.mime || 'application/octet-stream';
      const ext = extForMime(mime, typeName);
      let filename = downloaded.filename;
      if (!filename) {
        const prefix =
          typeName === 'sticker'
            ? 'sticker'
            : typeName === 'video'
              ? 'vid'
              : typeName === 'image'
                ? 'img'
                : typeName === 'document'
                  ? 'doc'
                  : 'audio';
        const suffix = downloaded.fromThumb ? '_thumb' : '';
        filename = prefix + '_' + String(index).padStart(4, '0') + suffix + '.' + ext;
      }
      filename = String(filename).replace(/[\\/:*?"<>|]+/g, '_');
      const path = 'media/' + filename;
      const base64 = await blobToBase64(downloaded.blob);
      return {
        media: {
          path,
          mime,
          filename,
          duration: raw && (raw.duration || raw.mediaDuration) ? Number(raw.duration || raw.mediaDuration) : null,
          width: raw && raw.width ? raw.width : 0,
          height: raw && raw.height ? raw.height : 0,
          placeholder: false,
          label: null,
          fromThumb: !!downloaded.fromThumb,
        },
        file: { path, mime, base64 },
      };
    }

    if (!/^(image|sticker|document|ptt|audio|video)$/.test(type)) {
      return { media: null, file: null };
    }

    // Full-quality first
    let downloaded = await tryDownloadMedia(raw, timeoutMs);

    // For video: if we somehow got an image thumb labeled wrong, still try manager again
    if (downloaded && type === 'video' && downloaded.mime && downloaded.mime.indexOf('image') === 0) {
      const again = await downloadViaManager(raw);
      if (again && again.size > downloaded.blob.size) {
        downloaded = {
          blob: again,
          mime: raw.mimetype || 'video/mp4',
          filename: raw.filename || null,
          fromThumb: false,
        };
      }
    }

    // Thumbnail only as last resort (images/stickers/video preview)
    if (!downloaded && /^(image|sticker|video)$/.test(type)) {
      downloaded = tryThumbnailFromMsg(raw, type);
    }

    if (!downloaded || !downloaded.blob) {
      return {
        media: {
          path: null,
          mime: (raw && raw.mimetype) || '',
          filename: (raw && raw.filename) || null,
          duration: raw && (raw.duration || raw.mediaDuration) ? Number(raw.duration || raw.mediaDuration) : null,
          width: 0,
          height: 0,
          placeholder: true,
          label: labelMap[type] || '[Media]',
          fromThumb: false,
        },
        file: null,
      };
    }

    return saveBlob(downloaded, type);
  }

  async function attachMedia(messages, options) {
    const opts = options || {};
    const cancelled = opts.cancelled || (() => false);
    const onProgress = opts.onProgress || (() => {});
    const files = [];
    const mediaMsgs = messages.filter((m) => m._needsMedia);
    let done = 0;

    for (let i = 0; i < messages.length; i++) {
      if (cancelled()) break;
      const m = messages[i];
      if (!m._needsMedia) continue;

      const result = await downloadMediaForMessage(m, i, opts);
      m.media = result.media;
      if (result.file) files.push(result.file);

      done++;
      onProgress({ phase: 'media', done, total: mediaMsgs.length, currentType: m.type });
      if (done % 2 === 0) await sleep(50);
    }

    for (let i = 0; i < messages.length; i++) {
      delete messages[i]._raw;
      delete messages[i]._needsMedia;
    }

    return { messages, files };
  }

  window.__WA_EXPORT_MEDIA__ = {
    downloadMediaForMessage,
    attachMedia,
    tryDownloadMedia,
    resolveFullMediaBlob,
  };
})();
