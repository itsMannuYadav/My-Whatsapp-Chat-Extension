(function () {
  'use strict';
  if (window.__WA_EXPORT_INJECTED__) return;
  window.__WA_EXPORT_INJECTED__ = true;

  const CHANNEL = 'WA_RICH_EXPORT';
  let cancelFlag = false;

  function post(type, payload) {
    window.postMessage({ channel: CHANNEL, source: 'injected', type, payload }, '*');
  }

  function cancelled() {
    return cancelFlag;
  }

  async function ensureReady() {
    const Store = window.__WA_EXPORT_STORE__;
    if (!Store) throw new Error('Store module missing');
    await Store.waitForStore(120000);
    return true;
  }

  async function handleGetActiveChat() {
    await ensureReady();
    const info = window.__WA_EXPORT_STORE__.getActiveChat();
    if (!info) {
      return { ok: false, error: 'No active chat. Open a chat first.' };
    }
    return {
      ok: true,
      chat: {
        id: info.id,
        name: info.name,
        isGroup: info.isGroup,
        approxMsgCount: info.approxMsgCount,
      },
    };
  }

  async function handleExport(payload) {
    cancelFlag = false;
    const Store = window.__WA_EXPORT_STORE__;
    const Collector = window.__WA_EXPORT_COLLECTOR__;
    const Media = window.__WA_EXPORT_MEDIA__;

    await ensureReady();
    const active = Store.getActiveChat();
    if (!active) {
      return { ok: false, error: 'No active chat. Open a chat first.' };
    }

    const limit = (payload && payload.limit) || 0;

    post('progress', { phase: 'start', chatName: active.name, isGroup: active.isGroup });

    const collected = await Collector.collectMessages(active, {
      limit,
      cancelled,
      onProgress: (p) => post('progress', p),
    });

    if (cancelled()) {
      return { ok: false, error: 'Cancelled', cancelled: true };
    }

    const withMedia = await Media.attachMedia(collected.messages, {
      cancelled,
      onProgress: (p) => post('progress', p),
      timeoutMs: (payload && payload.mediaTimeoutMs) || 12000,
    });

    if (cancelled()) {
      return { ok: false, error: 'Cancelled', cancelled: true };
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      chat: collected.chat,
      participants: collected.participants || [],
      messages: withMedia.messages,
    };

    // ZIP is built in the content-script world (JSZip lives there).
    return {
      ok: true,
      data: exportData,
      files: withMedia.files || [],
    };
  }

  window.addEventListener('message', async (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.channel !== CHANNEL || data.source !== 'content') return;

    const { type, requestId, payload } = data;

    try {
      if (type === 'ping') {
        post('pong', {
          requestId,
          storeReady: !!(window.__WA_EXPORT_STORE__ && window.__WA_EXPORT_STORE__.isStoreReady()),
        });
        return;
      }
      if (type === 'cancel') {
        cancelFlag = true;
        post('cancelled', { requestId: requestId });
        return;
      }
      if (type === 'getActiveChat') {
        const result = await handleGetActiveChat();
        post('getActiveChatResult', { requestId, ...result });
        return;
      }
      if (type === 'export') {
        const result = await handleExport(payload || {});
        post('exportResult', { requestId, ...result });
        return;
      }
    } catch (err) {
      post('error', {
        requestId,
        ok: false,
        error: (err && err.message) || String(err),
      });
    }
  });

  post('ready', {});
})();
