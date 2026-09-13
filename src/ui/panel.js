(function () {
  'use strict';

  const CHANNEL = 'WA_RICH_EXPORT';
  const STORAGE_KEY = 'wa-rich-export-ui';
  let requestSeq = 1;
  const pending = new Map();
  let exporting = false;
  let storeReady = false;

  function request(type, payload, timeoutMs) {
    const requestId = 'r' + requestSeq++;
    const timeout = timeoutMs || 300000;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(requestId);
        reject(new Error('Timed out waiting for ' + type));
      }, timeout);
      pending.set(requestId, {
        resolve: (v) => {
          clearTimeout(timer);
          resolve(v);
        },
        reject: (e) => {
          clearTimeout(timer);
          reject(e);
        },
      });
      window.postMessage(
        { channel: CHANNEL, source: 'content', type, requestId, payload: payload || {} },
        '*'
      );
    });
  }

  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.channel !== CHANNEL || data.source !== 'injected') return;

    if (data.type === 'ready') {
      storeReady = true;
      if (window.WA_EXPORT_PANEL) window.WA_EXPORT_PANEL.onReady();
      return;
    }

    if (data.type === 'progress') {
      if (window.WA_EXPORT_PANEL) window.WA_EXPORT_PANEL.onProgress(data.payload || {});
      return;
    }

    if (
      data.type === 'pong' ||
      data.type === 'getActiveChatResult' ||
      data.type === 'exportResult' ||
      data.type === 'error' ||
      data.type === 'cancelled'
    ) {
      const body = data.payload || {};
      const requestId = body.requestId;
      if (!requestId || !pending.has(requestId)) return;
      const waiter = pending.get(requestId);
      pending.delete(requestId);
      waiter.resolve(body);
    }
  });

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function setSvg(node, markup) {
    node.innerHTML = markup;
    return node;
  }

  const ICONS = {
    logo:
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3Z" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 10.5v3a3 3 0 0 0 6 0v-3" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>',
    minimize:
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    info:
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 11v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="8" r="1" fill="currentColor"/></svg>',
    download:
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 11l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 19h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    refresh:
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18 3v4h-4M6 21v-4h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    cancel:
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" stroke-width="2"/></svg>',
    check:
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    warn:
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4l9 16H3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 10v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>',
    spinner:
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="wa-xp-spin"><path d="M12 3a9 9 0 1 0 9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  };

  const STEPS = [
    { key: 'history', label: 'Load' },
    { key: 'normalize', label: 'Structure' },
    { key: 'media', label: 'Media' },
    { key: 'zip', label: 'Package' },
  ];

  function loadUiState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  function saveUiState(patch) {
    try {
      const cur = loadUiState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.assign(cur, patch)));
    } catch (_) {
      /* ignore quota/availability errors */
    }
  }

  function detectDarkTheme() {
    try {
      const html = document.documentElement;
      if (html.classList.contains('dark')) return true;
      if (html.getAttribute('data-theme') === 'dark') return true;
      const bodyBg = getComputedStyle(document.body).backgroundColor;
      if (bodyBg) {
        const m = bodyBg.match(/\d+/g);
        if (m && m.length >= 3) {
          const lum = (parseInt(m[0], 10) + parseInt(m[1], 10) + parseInt(m[2], 10)) / 3;
          return lum < 100;
        }
      }
    } catch (_) {
      /* fall through */
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  // Keep draggable elements clear of WhatsApp's own fixed UI: the left icon
  // rail and the bottom strip where call-control widgets float. Otherwise a
  // dragged (and persisted) position can park an element where it looks
  // stuck behind/under WhatsApp's native elements.
  const SAFE_LEFT = 72;
  const SAFE_BOTTOM = 96;
  const SAFE_EDGE = 8;

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  // Generic free-drag with position persistence, shared by the panel and
  // the minimized FAB so both can be moved anywhere on screen.
  function makeDraggable(node, handle, options) {
    const opts = options || {};
    const storageKey = opts.storageKey;
    const defaultW = opts.defaultW || 100;
    const defaultH = opts.defaultH || 40;
    const skipSelector = opts.skipSelector;
    const onClick = opts.onClick;
    const DRAG_THRESHOLD = 4;

    let dragging = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    function applyPosition(left, top) {
      const w = node.offsetWidth || defaultW;
      const h = node.offsetHeight || defaultH;
      const maxLeft = window.innerWidth - w - SAFE_EDGE;
      const maxTop = window.innerHeight - h - SAFE_BOTTOM;
      const clampedLeft = clamp(left, SAFE_LEFT, Math.max(SAFE_LEFT, maxLeft));
      const clampedTop = clamp(top, SAFE_EDGE, Math.max(SAFE_EDGE, maxTop));
      node.style.left = clampedLeft + 'px';
      node.style.top = clampedTop + 'px';
      node.style.right = 'auto';
      node.style.bottom = 'auto';
      return { left: clampedLeft, top: clampedTop };
    }

    if (opts.initialPos && typeof opts.initialPos.left === 'number') {
      requestAnimationFrame(() => applyPosition(opts.initialPos.left, opts.initialPos.top));
    }

    handle.addEventListener('pointerdown', (e) => {
      if (skipSelector && e.target.closest(skipSelector)) return;
      dragging = true;
      moved = false;
      const rect = node.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      startX = e.clientX;
      startY = e.clientY;
      handle.setPointerCapture(e.pointerId);
    });

    handle.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!moved && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
        moved = true;
        node.classList.add('wa-xp-dragging');
      }
      if (moved) applyPosition(startLeft + dx, startTop + dy);
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      node.classList.remove('wa-xp-dragging');
      if (moved && storageKey) {
        const rect = node.getBoundingClientRect();
        saveUiState({ [storageKey]: { left: rect.left, top: rect.top } });
      }
      try {
        handle.releasePointerCapture(e.pointerId);
      } catch (_) {
        /* no-op */
      }
    }

    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);

    if (onClick) {
      handle.addEventListener('click', (e) => {
        if (moved) {
          e.preventDefault();
          e.stopPropagation();
          moved = false;
          return;
        }
        onClick(e);
      });
    }

    window.addEventListener('resize', () => {
      if (!node.style.left) return;
      const rect = node.getBoundingClientRect();
      applyPosition(rect.left, rect.top);
    });

    return { applyPosition };
  }

  function createPanel() {
    if (document.getElementById('wa-rich-export-panel')) return;

    const uiState = loadUiState();

    const panel = el('div');
    panel.id = 'wa-rich-export-panel';

    function applyTheme() {
      const dark = detectDarkTheme();
      panel.setAttribute('data-wa-theme', dark ? 'dark' : 'light');
    }

    // ---- Header ----
    const head = el('div', 'wa-xp-head');
    const brand = el('div', 'wa-xp-brand');
    const logo = setSvg(el('span', 'wa-xp-logo'), ICONS.logo);
    brand.appendChild(logo);
    brand.appendChild(el('span', 'wa-xp-title', 'WA Rich Export'));
    head.appendChild(brand);

    const headActions = el('div', 'wa-xp-head-actions');
    const dotWrap = el('span', 'wa-xp-dot-wrap');
    const dot = el('span', 'wa-xp-dot');
    dot.title = 'Connecting…';
    dotWrap.appendChild(dot);

    const infoBtn = setSvg(el('button', 'wa-xp-iconbtn'), ICONS.info);
    infoBtn.type = 'button';
    infoBtn.title = 'About this export';
    infoBtn.setAttribute('aria-label', 'About this export');

    const minBtn = setSvg(el('button', 'wa-xp-iconbtn'), ICONS.minimize);
    minBtn.type = 'button';
    minBtn.title = 'Hide panel';
    minBtn.setAttribute('aria-label', 'Hide panel');

    headActions.appendChild(dotWrap);
    headActions.appendChild(infoBtn);
    headActions.appendChild(minBtn);
    head.appendChild(headActions);
    panel.appendChild(head);

    // ---- Body ----
    const body = el('div', 'wa-xp-body');

    body.appendChild(el('div', 'wa-xp-label', 'Active chat'));
    const chatBox = el('div', 'wa-xp-chat');
    const avatar = el('div', 'wa-xp-avatar', '?');
    const chatInfo = el('div', 'wa-xp-chat-info');
    const chatName = el('div', 'wa-xp-chat-name', 'Detecting…');
    const chatMeta = el('div', 'wa-xp-chat-meta');
    chatInfo.appendChild(chatName);
    chatInfo.appendChild(chatMeta);
    chatBox.appendChild(avatar);
    chatBox.appendChild(chatInfo);
    body.appendChild(chatBox);

    body.appendChild(el('div', 'wa-xp-label', 'History depth'));
    const selectWrap = el('div', 'wa-xp-select-wrap');
    const select = document.createElement('select');
    select.id = 'wa-xp-limit';
    select.setAttribute('aria-label', 'History depth');
    [
      { v: '1000', t: 'Last 1,000 messages' },
      { v: '5000', t: 'Last 5,000 messages' },
      { v: '0', t: 'All available on WhatsApp Web' },
    ].forEach((o) => {
      const opt = document.createElement('option');
      opt.value = o.v;
      opt.textContent = o.t;
      if (o.v === (uiState.limit || '1000')) opt.selected = true;
      select.appendChild(opt);
    });
    selectWrap.appendChild(select);
    body.appendChild(selectWrap);

    const row = el('div', 'wa-xp-row');
    const exportBtn = el('button', 'wa-xp-btn wa-xp-primary');
    exportBtn.type = 'button';
    exportBtn.appendChild(setSvg(el('span'), ICONS.download));
    exportBtn.appendChild(document.createTextNode('Export chat'));

    const refreshBtn = el('button', 'wa-xp-btn wa-xp-secondary');
    refreshBtn.type = 'button';
    refreshBtn.title = 'Refresh active chat info';
    refreshBtn.setAttribute('aria-label', 'Refresh active chat info');
    refreshBtn.appendChild(setSvg(el('span'), ICONS.refresh));

    const stopBtn = el('button', 'wa-xp-btn wa-xp-danger');
    stopBtn.type = 'button';
    stopBtn.hidden = true;
    stopBtn.appendChild(setSvg(el('span'), ICONS.cancel));
    stopBtn.appendChild(document.createTextNode('Cancel'));

    row.appendChild(exportBtn);
    row.appendChild(refreshBtn);
    row.appendChild(stopBtn);
    body.appendChild(row);

    const progress = el('div', 'wa-xp-progress');
    progress.hidden = true;
    const stepsRow = el('div', 'wa-xp-steps');
    const stepEls = {};
    STEPS.forEach((s) => {
      const stepEl = el('div', 'wa-xp-step');
      stepEl.dataset.step = s.key;
      const stepDot = el('span', 'wa-xp-step-dot');
      const stepLabel = el('span', 'wa-xp-step-label', s.label);
      stepEl.appendChild(stepDot);
      stepEl.appendChild(stepLabel);
      stepsRow.appendChild(stepEl);
      stepEls[s.key] = stepEl;
    });
    progress.appendChild(stepsRow);

    const barRow = el('div', 'wa-xp-bar-row');
    const barWrap = el('div', 'wa-xp-bar-wrap');
    const bar = el('div', 'wa-xp-bar');
    barWrap.appendChild(bar);
    const pct = el('span', 'wa-xp-pct', '0%');
    barRow.appendChild(barWrap);
    barRow.appendChild(pct);
    progress.appendChild(barRow);
    body.appendChild(progress);

    const status = el('div', 'wa-xp-status');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    const statusIcon = el('span', 'wa-xp-status-icon');
    const statusText = el('span', 'wa-xp-status-text', 'Waiting for WhatsApp…');
    status.appendChild(statusIcon);
    status.appendChild(statusText);
    body.appendChild(status);

    const hint = el(
      'div',
      'wa-xp-hint',
      'Exports text, replies, stickers, images, documents, and voice notes into an offline WhatsApp-style HTML archive. Videos keep their place as placeholders. Only messages synced to this WhatsApp Web session are available.'
    );
    hint.hidden = uiState.hintOpen !== true;
    body.appendChild(hint);

    panel.appendChild(body);
    document.documentElement.appendChild(panel);

    // ---- FAB ----
    const fab = el('button');
    fab.id = 'wa-rich-export-fab';
    fab.type = 'button';
    const fabIcon = setSvg(el('span', 'wa-fab-icon'), ICONS.download);
    const fabLabel = el('span', 'wa-fab-label', 'Export');
    const fabBadge = el('span', 'wa-fab-badge');
    fab.appendChild(fabIcon);
    fab.appendChild(fabLabel);
    fab.appendChild(fabBadge);
    fab.title = 'Show WA Rich Export';
    fab.setAttribute('aria-label', 'Show WA Rich Export');
    document.documentElement.appendChild(fab);

    applyTheme();

    // React to WhatsApp's own theme toggle live.
    try {
      const themeObserver = new MutationObserver(applyTheme);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme'],
      });
      if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
      }
    } catch (_) {
      /* MutationObserver unsupported — theme stays at initial detection */
    }

    // ---- Show / hide ----
    let repositionPanel = null;
    function hidePanel() {
      panel.classList.add('hidden-panel');
      fab.style.display = 'flex';
      saveUiState({ hidden: true });
    }
    function showPanel() {
      panel.classList.remove('hidden-panel');
      fab.style.display = 'none';
      saveUiState({ hidden: false });
      // Re-validate a previously dragged position against the current
      // viewport/layout so restoring never drops the panel somewhere it
      // now overlaps WhatsApp's own UI (e.g. after a window resize or a
      // call widget appearing while the panel was minimized).
      if (repositionPanel && panel.style.left) {
        requestAnimationFrame(() => {
          const rect = panel.getBoundingClientRect();
          repositionPanel(rect.left, rect.top);
        });
      }
    }

    minBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      hidePanel();
    });
    head.addEventListener('dblclick', hidePanel);

    infoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      hint.hidden = !hint.hidden;
      saveUiState({ hintOpen: !hint.hidden });
    });

    if (uiState.hidden === true) {
      panel.classList.add('hidden-panel');
      fab.style.display = 'flex';
    }

    // ---- Draggable header (position persisted) ----
    const panelDrag = makeDraggable(panel, head, {
      storageKey: 'pos',
      defaultW: 336,
      defaultH: 200,
      skipSelector: '.wa-xp-iconbtn',
      initialPos: uiState.pos,
    });
    repositionPanel = panelDrag.applyPosition;

    // ---- Draggable FAB (position persisted independently of the panel) ----
    makeDraggable(fab, fab, {
      storageKey: 'fabPos',
      defaultW: 140,
      defaultH: 52,
      initialPos: uiState.fabPos,
      onClick: (e) => {
        e.preventDefault();
        showPanel();
      },
    });

    function setBar(pct2, isError) {
      bar.style.width = Math.max(0, Math.min(100, pct2)) + '%';
      bar.classList.toggle('error', !!isError);
      pct.textContent = Math.round(Math.max(0, Math.min(100, pct2))) + '%';
    }

    function setStatus(text, kind, icon) {
      statusText.textContent = text;
      status.classList.remove('success', 'error');
      if (kind) status.classList.add(kind);
      statusIcon.innerHTML = icon ? ICONS[icon] || '' : '';
    }

    function setDot(state) {
      dot.classList.remove('ready', 'error', 'busy');
      if (state) dot.classList.add(state);
      dot.title =
        state === 'ready' ? 'Ready' : state === 'error' ? 'Error' : state === 'busy' ? 'Working…' : 'Connecting…';
    }

    function setStep(activeKey) {
      const idx = STEPS.findIndex((s) => s.key === activeKey);
      STEPS.forEach((s, i) => {
        const node = stepEls[s.key];
        node.classList.remove('active', 'done');
        if (idx < 0) return;
        if (i < idx) node.classList.add('done');
        else if (i === idx) node.classList.add('active');
      });
    }

    function avatarLetter(name) {
      const trimmed = (name || '').trim();
      return trimmed ? trimmed[0].toUpperCase() : '?';
    }

    async function refreshChat() {
      try {
        setStatus('Reading active chat…', null, 'spinner');
        const res = await request('getActiveChat', {}, 30000);
        if (!res.ok) {
          chatName.textContent = 'No chat open';
          chatMeta.innerHTML = '';
          avatar.textContent = '?';
          setStatus(res.error || 'Open a chat in WhatsApp Web.', 'error', 'warn');
          setDot('error');
          return null;
        }
        chatName.textContent = res.chat.name;
        avatar.textContent = avatarLetter(res.chat.name);
        chatMeta.innerHTML = '';
        const badge = el(
          'span',
          'wa-xp-badge' + (res.chat.isGroup ? ' group' : ''),
          res.chat.isGroup ? 'Group' : 'Chat'
        );
        chatMeta.appendChild(badge);
        chatMeta.appendChild(
          document.createTextNode('~' + (res.chat.approxMsgCount || 0) + ' msgs loaded')
        );
        setStatus('Ready to export.', null, null);
        setDot('ready');
        return res.chat;
      } catch (err) {
        setStatus((err && err.message) || String(err), 'error', 'warn');
        setDot('error');
        return null;
      }
    }

    function onProgress(p) {
      if (!p) return;
      progress.hidden = false;
      if (p.phase === 'history') {
        setStep('history');
        const lim = p.limit ? ' / ' + p.limit : '';
        setStatus('Loading history… ' + (p.loaded || 0) + lim + ' messages', null, 'spinner');
        if (p.limit) setBar(((p.loaded || 0) / p.limit) * 40);
        else setBar(Math.min(35, (p.loaded || 0) / 50));
      } else if (p.phase === 'normalize') {
        setStep('normalize');
        setStatus('Structuring messages… ' + (p.done || 0) + '/' + (p.total || 0), null, 'spinner');
        setBar(40 + ((p.done || 0) / Math.max(p.total || 1, 1)) * 15);
      } else if (p.phase === 'media') {
        setStep('media');
        setStatus(
          'Downloading media… ' +
            (p.done || 0) +
            '/' +
            (p.total || 0) +
            (p.currentType ? ' (' + p.currentType + ')' : ''),
          null,
          'spinner'
        );
        setBar(55 + ((p.done || 0) / Math.max(p.total || 1, 1)) * 30);
      } else if (p.phase === 'zip') {
        setStep('zip');
        setStatus('Building ZIP archive…', null, 'spinner');
        setBar(92);
      } else if (p.phase === 'start') {
        setStep('history');
        setStatus('Exporting "' + (p.chatName || 'chat') + '"…', null, 'spinner');
        setBar(5);
      }
    }

    async function runExport() {
      if (exporting) return;
      exporting = true;
      exportBtn.disabled = true;
      stopBtn.hidden = false;
      refreshBtn.hidden = true;
      progress.hidden = false;
      setStep('history');
      setDot('busy');
      setBar(0);
      saveUiState({ limit: select.value });
      try {
        if (typeof JSZip !== 'function' && !(globalThis && typeof globalThis.JSZip === 'function')) {
          throw new Error('JSZip not loaded in extension (reload the extension)');
        }
        if (!globalThis.WA_EXPORT_ZIP && !window.WA_EXPORT_ZIP) {
          throw new Error('ZIP builder not loaded (reload the extension)');
        }

        const limit = parseInt(select.value, 10);
        setStatus('Collecting chat from WhatsApp Store…', null, 'spinner');
        const res = await request('export', { limit, mediaTimeoutMs: 35000 }, 600000);
        if (!res.ok) {
          setStatus(res.cancelled ? 'Cancelled.' : res.error || 'Export failed.', res.cancelled ? null : 'error', res.cancelled ? null : 'warn');
          setBar(res.cancelled ? 0 : 100, !res.cancelled);
          setDot(res.cancelled ? 'ready' : 'error');
          return;
        }

        setStep('zip');
        setStatus('Building ZIP archive…', null, 'spinner');
        setBar(92);
        const zipApi = globalThis.WA_EXPORT_ZIP || window.WA_EXPORT_ZIP;
        const { blob, filename } = await zipApi.buildExportZip(res.data, res.files || []);
        zipApi.triggerDownload(blob, filename);

        const count = (res.data && res.data.messages && res.data.messages.length) || 0;
        setBar(100);
        setStatus(count + ' messages saved as ' + filename, 'success', 'check');
        setDot('ready');
      } catch (err) {
        setStatus((err && err.message) || String(err), 'error', 'warn');
        setBar(100, true);
        setDot('error');
      } finally {
        exporting = false;
        exportBtn.disabled = false;
        stopBtn.hidden = true;
        refreshBtn.hidden = false;
      }
    }

    exportBtn.addEventListener('click', runExport);
    refreshBtn.addEventListener('click', refreshChat);
    stopBtn.addEventListener('click', () => {
      window.postMessage({ channel: CHANNEL, source: 'content', type: 'cancel', requestId: 'cancel' }, '*');
      setStatus('Cancel requested…', null, 'spinner');
    });
    select.addEventListener('change', () => saveUiState({ limit: select.value }));

    window.WA_EXPORT_PANEL = {
      onReady() {
        setDot('ready');
        fabBadge.classList.add('ready');
        setStatus('WhatsApp bridge ready.', null, null);
        refreshChat();
      },
      onProgress,
      refreshChat,
    };

    // Periodic refresh of active chat name
    setInterval(() => {
      if (!exporting && storeReady) refreshChat();
    }, 8000);

    // Initial attempts
    setTimeout(refreshChat, 1500);
    setTimeout(refreshChat, 4000);
  }

  window.WA_EXPORT_CREATE_PANEL = createPanel;
  window.WA_EXPORT_REQUEST = request;
})();
