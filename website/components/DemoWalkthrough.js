'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

// This walkthrough is built against the real extension source, not invented:
// - The floating panel's colors, copy and layout are ported from
//   src/ui/panel.css and src/ui/panel.js (it's a widget that's already open
//   the moment WhatsApp Web loads — there's no toolbar icon to click).
// - The archive's colors are ported from src/export/whatsapp-theme.css.js.
// - Message types shown (text formatting, replies, mentions, forwards,
//   stickers, photos, documents, voice notes) are the real supported set —
//   see the hint string in panel.js. Reactions are intentionally left out:
//   the extension doesn't capture them.
const CHAT_NAME = 'Design Team';
const MSG_COUNT = 842;
const MEDIA_COUNT = 240;
const ZIP_NAME = 'design-team-export.zip';

const STEP_ORDER = ['history', 'normalize', 'media', 'zip'];
const STEP_LABEL = { history: 'Load', normalize: 'Structure', media: 'Media', zip: 'Package' };

function progressAt(percent) {
  if (percent < 6) return { step: null, text: `Exporting "${CHAT_NAME}"…` };
  if (percent < 45) {
    const loaded = Math.min(MSG_COUNT, Math.round((percent / 45) * MSG_COUNT));
    return { step: 'history', text: `Loading history… ${loaded} / 5000 messages` };
  }
  if (percent < 60) {
    const done = Math.min(MSG_COUNT, Math.round(((percent - 45) / 15) * MSG_COUNT));
    return { step: 'normalize', text: `Structuring messages… ${done}/${MSG_COUNT}` };
  }
  if (percent < 92) {
    const done = Math.min(MEDIA_COUNT, Math.round(((percent - 60) / 32) * MEDIA_COUNT));
    return { step: 'media', text: `Downloading media… ${done}/${MEDIA_COUNT} (image)` };
  }
  return { step: 'zip', text: 'Building ZIP archive…' };
}

const PHASES = [
  {
    id: 'browse',
    label: '1. Open the chat',
    title: 'Open the chat you want to keep',
    body: 'The panel is already sitting there the moment WhatsApp Web loads — it just doesn’t have a chat to work with yet.',
    duration: 4000,
    cursorPath: [
      { t: 1000, target: 'row-design-team' },
      { t: 2300, target: 'row-design-team', click: true },
    ],
  },
  {
    id: 'chat-open',
    label: '2. It already knows',
    title: 'No second click needed',
    body: 'The panel polls the open chat itself: name, group badge and message count update on their own the moment a chat is open.',
    duration: 3400,
  },
  {
    id: 'export',
    label: '3. Pick a depth',
    title: 'Choose how far back, then export',
    body: 'Last 1,000 for a quick save, 5,000 for a fuller thread, or everything this session has synced — a real <select>, then the Export chat button.',
    duration: 4600,
    cursorPath: [
      { t: 900, target: 'xp-select' },
      { t: 1900, target: 'xp-select', click: true },
      { t: 2800, target: 'xp-export-btn' },
      { t: 3600, target: 'xp-export-btn', click: true },
    ],
  },
  {
    id: 'processing',
    label: '4. It processes',
    title: 'Load, structure, fetch media, package',
    body: 'Straight out of WhatsApp’s own in-page Store — the exact status text and step order from the extension itself.',
    duration: 6200,
  },
  {
    id: 'download',
    label: '5. It downloads',
    title: 'Saved through the normal browser download',
    body: 'The panel reports success at the same moment the .zip lands in Downloads — no upload, no server in between.',
    duration: 3400,
  },
  {
    id: 'folder',
    label: '6. Open the folder',
    title: 'Open the folder it saved to',
    body: 'Unzipped, it’s four plain files — index.html, styles.css, chat.json and a media/ folder.',
    duration: 4200,
    cursorPath: [
      { t: 1200, target: 'file-index' },
      { t: 2300, target: 'file-index', click: true },
      { t: 2550, target: 'file-index', click: true },
    ],
  },
  {
    id: 'result',
    label: '7. The result',
    title: 'Everything comes back the way it looked',
    body: 'Text formatting, a reply that jumps to its source, a sender label, a mention, a forward, a sticker, a photo, a document and a voice note — all offline.',
    duration: 6400,
    cursorPath: [{ t: 2600, target: 'archive-reply', click: true }],
  },
];

function subscribeReducedMotion(callback) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}
function getReducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function getReducedMotionServerSnapshot() {
  return false;
}
function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, getReducedMotionServerSnapshot);
}

// Positions the cursor by measuring the real target element's on-screen box
// (data-cursor-target) relative to the stage container, instead of guessed
// coordinates — so it always lands on the control it's meant to click.
function useCursorDriver(stageRef, cursorPath, active) {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    if (!active || !cursorPath) return undefined;
    const timers = [];
    cursorPath.forEach((wp) => {
      timers.push(
        setTimeout(() => {
          const root = stageRef.current;
          const target = root && root.querySelector(`[data-cursor-target="${wp.target}"]`);
          if (root && target) {
            const rootRect = root.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            setPos({
              x: ((targetRect.left - rootRect.left + targetRect.width * 0.5) / rootRect.width) * 100,
              y: ((targetRect.top - rootRect.top + targetRect.height * 0.5) / rootRect.height) * 100,
            });
          }
          if (wp.click) {
            setClicking(true);
            timers.push(setTimeout(() => setClicking(false), 380));
          }
        }, wp.t)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [stageRef, cursorPath, active]);

  return { pos, clicking };
}

function useTimedPercent(duration, reducedMotion) {
  const [percent, setPercent] = useState(reducedMotion ? 100 : 0);
  useEffect(() => {
    if (reducedMotion) return undefined;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(100, ((now - start) / duration) * 100);
      setPercent(p);
      if (p < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, reducedMotion]);
  return percent;
}

/* ---------------- icons (kept tiny + generic; sized by parent CSS) ---------------- */
const Icon = {
  search: (
    <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
  ),
  newChat: (
    <svg viewBox="0 0 24 24" fill="none"><path d="M4 4h13a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H9l-5 4V4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M9 8h6M9 11.5h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
  ),
  menuDots: (
    <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5.5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="18.5" r="1.8" /></svg>
  ),
  emoji: (
    <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" /><circle cx="8.5" cy="10" r="1.1" fill="currentColor" /><circle cx="15.5" cy="10" r="1.1" fill="currentColor" /><path d="M8 14.5c1 1.3 2.4 2 4 2s3-0.7 4-2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
  ),
  attach: (
    <svg viewBox="0 0 24 24" fill="none"><path d="M8 12.5l6.5-6.5a3 3 0 0 1 4.2 4.2L11 18a5 5 0 1 1-7-7l7-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  mic: (
    <svg viewBox="0 0 24 24" fill="none"><rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.7" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none"><rect x="5" y="10.5" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.8" /></svg>
  ),
  bubbleOutline: (
    <svg viewBox="0 0 24 24" fill="none"><path d="M12 3C6.5 3 2 6.9 2 11.7c0 2.5 1.2 4.7 3.2 6.3-.1 1.2-.5 2.6-1.2 3.7 1.6-.3 3.1-1 4.3-1.9 1.1.4 2.4.6 3.7.6 5.5 0 10-3.9 10-8.7S17.5 3 12 3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
  ),
  folder: (
    <svg viewBox="0 0 24 24" fill="none"><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4l2 2h9A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-11Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
  ),
  photo: (
    <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" /><circle cx="9" cy="10.5" r="1.6" stroke="currentColor" strokeWidth="1.4" /><path d="M4.5 17l5-4.5 3 2.5 3.5-3.5L20 16" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
  ),
  fwdArrow: (
    <svg viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 12h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
  ),
  ticks: (
    <svg viewBox="0 0 20 12" fill="none"><path d="M1 6.5l3 3 5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 6.5l3 3 7-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  // exact path data from src/ui/panel.js ICONS.logo, for a pixel-true panel brand mark
  xpLogo: (
    <svg viewBox="0 0 24 24" fill="none"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3Z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" /><path d="M9 10.5v3a3 3 0 0 0 6 0v-3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" /></svg>
  ),
  xpMinimize: (
    <svg viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  xpDownload: (
    <svg viewBox="0 0 24 24" fill="none"><path d="M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M7 11l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
  ),
  xpRefresh: (
    <svg viewBox="0 0 24 24" fill="none"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M18 3v4h-4M6 21v-4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  xpCheck: (
    <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  xpWarn: (
    <svg viewBox="0 0 24 24" fill="none"><path d="M12 4l9 16H3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M12 10v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="17" r="1" fill="currentColor" /></svg>
  ),
  xpSpinner: (
    <svg viewBox="0 0 24 24" fill="none" className="is-spin"><path d="M12 3a9 9 0 1 0 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
  ),
};

/* ---------------- WhatsApp Web mock pieces ---------------- */

function Sidebar({ chatOpen }) {
  return (
    <div className="wa-sidebar">
      <div className="wa-sidebar-top">
        <div className="wa-me-avatar">Y</div>
        <div className="wa-icon-row">
          <span className="wa-icon-btn">{Icon.newChat}</span>
          <span className="wa-icon-btn">{Icon.menuDots}</span>
        </div>
      </div>
      <div className="wa-search">
        <div className="wa-search-pill">{Icon.search}<span>Search or start a new chat</span></div>
      </div>
      <div className="wa-chatlist">
        <div className="wa-chat-row">
          <div className="wa-chat-avatar" style={{ background: 'linear-gradient(135deg,#7c5cff,#5636d6)' }}>P</div>
          <div className="wa-chat-meta">
            <div className="wa-chat-line1"><span className="wa-chat-name">Priya Nair</span><span className="wa-chat-time">09:14</span></div>
            <div className="wa-chat-line2"><span className="wa-chat-snip">Sent a photo</span></div>
          </div>
        </div>
        <div className={`wa-chat-row${chatOpen ? ' is-active' : ''}`} data-cursor-target="row-design-team">
          <div className="wa-chat-avatar" style={{ background: 'linear-gradient(135deg,#00a884,#008069)' }}>D</div>
          <div className="wa-chat-meta">
            <div className="wa-chat-line1"><span className="wa-chat-name">{CHAT_NAME}</span><span className="wa-chat-time">10:42</span></div>
            <div className="wa-chat-line2"><span className="wa-chat-snip">On it — exporting now 🗂️</span><span className="wa-unread-badge">3</span></div>
          </div>
        </div>
        <div className="wa-chat-row">
          <div className="wa-chat-avatar" style={{ background: 'linear-gradient(135deg,#ff9472,#e0555a)' }}>M</div>
          <div className="wa-chat-meta">
            <div className="wa-chat-line1"><span className="wa-chat-name">Mom</span><span className="wa-chat-time">Yest.</span></div>
            <div className="wa-chat-line2"><span className="wa-chat-snip">Call me when free</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyMain() {
  return (
    <div className="wa-empty">
      {Icon.bubbleOutline}
      <h3>WhatsApp Web</h3>
      <p>Send and receive messages without keeping your phone online.</p>
      <div className="wa-encrypted">{Icon.lock}<span>End-to-end encrypted</span></div>
    </div>
  );
}

function ChatMain() {
  return (
    <>
      <div className="wa-chat-header">
        <div className="wa-chat-header-left">
          <div className="wa-chat-header-avatar" style={{ background: 'linear-gradient(135deg,#00a884,#008069)' }}>D</div>
          <div>
            <div className="wa-chat-header-name">{CHAT_NAME}</div>
            <div className="wa-chat-header-sub">Priya Nair, Ravi Shah, You +3</div>
          </div>
        </div>
        <div className="wa-icon-row">
          <span className="wa-icon-btn">{Icon.search}</span>
          <span className="wa-icon-btn">{Icon.menuDots}</span>
        </div>
      </div>
      <div className="wa-chat-body">
        <div className="wa-day-pill">TODAY</div>
        <div className="wa-row in">
          <div className="wa-bubble">
            <div className="wa-sender">Priya Nair</div>
            Can you pull the design thread before Friday?
            <div className="wa-meta-line"><span className="time">10:40</span></div>
          </div>
        </div>
        <div className="wa-row out">
          <div className="wa-bubble">
            On it — exporting the whole channel now 🗂️
            <div className="wa-meta-line"><span className="time">10:42</span><span className="ticks">{Icon.ticks}</span></div>
          </div>
        </div>
      </div>
      <div className="wa-chat-input">
        {Icon.emoji}
        {Icon.attach}
        <div className="wa-input-pill">Type a message</div>
        <span className="wa-mic">{Icon.mic}</span>
      </div>
    </>
  );
}

function ExportPanel({ phase, percent }) {
  const noChat = phase === 'browse';
  const exporting = phase === 'processing';
  const done = phase === 'download';
  const { step, text } = exporting ? progressAt(percent) : { step: null, text: '' };
  const showProgress = exporting || done;

  const dotClass = noChat ? 'error' : exporting ? 'busy' : 'ready';

  return (
    <div className="demo-xp">
      <div className="demo-xp-head">
        <span className="demo-xp-logo">{Icon.xpLogo}</span>
        <span className="demo-xp-title">WA Rich Export</span>
        <span className={`demo-xp-dot ${dotClass}`}></span>
        <span className="demo-xp-headbtn">{Icon.xpMinimize}</span>
      </div>
      <div className="demo-xp-body">
        <div className="demo-xp-label">Active chat</div>
        <div className="demo-xp-chat">
          <div className="demo-xp-avatar">{noChat ? '?' : 'D'}</div>
          <div>
            <div className="demo-xp-chat-name">{noChat ? 'No chat open' : CHAT_NAME}</div>
            {!noChat && (
              <div className="demo-xp-chat-meta">
                <span className="demo-xp-badge">Group</span>
                <span>~{MSG_COUNT} msgs loaded</span>
              </div>
            )}
          </div>
        </div>

        <div className="demo-xp-label">History depth</div>
        <div className="demo-xp-select" data-cursor-target="xp-select">Last 5,000 messages</div>

        <div className="demo-xp-row">
          <div className="demo-xp-btn demo-xp-primary" data-cursor-target="xp-export-btn">{Icon.xpDownload}Export chat</div>
          <div className="demo-xp-btn demo-xp-secondary">{Icon.xpRefresh}</div>
        </div>

        {showProgress && (
          <div className="demo-xp-progress">
            <div className="demo-xp-steps">
              {STEP_ORDER.map((key, i) => {
                const activeIdx = STEP_ORDER.indexOf(step);
                const cls = done ? 'done' : activeIdx < 0 ? '' : i < activeIdx ? 'done' : i === activeIdx ? 'active' : '';
                return (
                  <div className={`demo-xp-step ${cls}`} key={key}>
                    <span className="demo-xp-step-dot"></span>
                    <span className="demo-xp-step-label">{STEP_LABEL[key]}</span>
                  </div>
                );
              })}
            </div>
            <div className="demo-xp-bar-row">
              <div className="demo-xp-bar-wrap"><div className="demo-xp-bar" style={{ width: `${done ? 100 : Math.max(4, percent)}%` }}></div></div>
              <span className="demo-xp-pct tabular">{done ? 100 : Math.round(percent)}%</span>
            </div>
          </div>
        )}

        <div className={`demo-xp-status${done ? ' success' : ''}${noChat ? ' error' : ''}`}>
          {noChat && <>{Icon.xpWarn}<span>Open a chat in WhatsApp Web.</span></>}
          {phase === 'chat-open' && <>{Icon.xpCheck}<span>Ready to export.</span></>}
          {phase === 'export' && <>{Icon.xpCheck}<span>Ready to export.</span></>}
          {exporting && <>{Icon.xpSpinner}<span>{text}</span></>}
          {done && <>{Icon.xpCheck}<span>{MSG_COUNT} messages saved as {ZIP_NAME}</span></>}
        </div>
      </div>
    </div>
  );
}

function DownloadShelf({ percent }) {
  const done = percent >= 100;
  return (
    <div className="demo-download-shelf">
      <div className="demo-download-chip">
        <div className={`demo-download-ring${done ? ' is-done' : ''}`} style={{ '--p': percent }}></div>
        <div>
          <div className="demo-download-name">{ZIP_NAME}</div>
          <div className="demo-download-sub">{done ? '6.8 MB — saved to Downloads' : '6.8 MB'}</div>
        </div>
      </div>
    </div>
  );
}

function FolderScreen({ reducedMotion }) {
  const [opening, setOpening] = useState(false);
  useEffect(() => {
    if (reducedMotion) return undefined;
    const t = setTimeout(() => setOpening(true), 2680);
    return () => clearTimeout(t);
  }, [reducedMotion]);

  return (
    <div className="demo-folder">
      <div className="demo-folder-path">{Icon.folder}<span>Downloads / design-team-export</span></div>
      <div className={`demo-file-row${opening ? ' is-opening' : ''}`} data-cursor-target="file-index">
        <span className="demo-file-ico html">‹h›</span>index.html<span className="demo-file-size">312 KB</span>
      </div>
      <div className="demo-file-row"><span className="demo-file-ico css">#</span>styles.css<span className="demo-file-size">8 KB</span></div>
      <div className="demo-file-row"><span className="demo-file-ico json">{'{}'}</span>chat.json<span className="demo-file-size">96 KB</span></div>
      <div className="demo-file-row"><span className="demo-file-ico folder">▸</span>media/<span className="demo-file-size">{MEDIA_COUNT} files</span></div>
    </div>
  );
}

function ArchiveScreen({ reducedMotion }) {
  const [highlighted, setHighlighted] = useState(false);
  useEffect(() => {
    if (reducedMotion) return undefined;
    const t = setTimeout(() => setHighlighted(true), 2900);
    const t2 = setTimeout(() => setHighlighted(false), 4200);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [reducedMotion]);

  return (
    <div className="demo-archive">
      <div className="demo-archive-header">
        <h4>{CHAT_NAME}<span className="demo-archive-badge">Group</span></h4>
        <span className="demo-archive-count">{MSG_COUNT} messages</span>
      </div>
      <div className="demo-archive-body">
        <div className="wa-day-pill">TODAY</div>

        <div className="wa-row in" id="archive-original-msg">
          <div className={`wa-bubble${highlighted ? ' msg-highlight' : ''}`}>
            <div className="wa-sender">Priya Nair</div>
            The export needs to keep <strong>reply threads</strong> intact
            <div className="wa-meta-line"><span className="time">10:38</span></div>
          </div>
        </div>

        <div className="wa-row out">
          <div className="wa-bubble" data-cursor-target="archive-reply">
            <div className="wa-reply"><div className="r-name">Priya Nair</div><div className="r-text">The export needs to keep reply threads intact</div></div>
            On it — exporting the whole channel now, check <span className="wa-mention">@Ravi Shah</span> too 🗂️
            <div className="wa-meta-line"><span className="time">10:42</span><span className="ticks">{Icon.ticks}</span></div>
          </div>
        </div>

        <div className="wa-row in">
          <div className="wa-bubble wa-sticker-wrap">
            <div className="wa-sender">Ravi Shah</div>
            <div className="wa-sticker">🎉</div>
          </div>
        </div>

        <div className="wa-row out">
          <div className="wa-bubble">
            <div className="wa-fwd">{Icon.fwdArrow}Forwarded</div>
            <div className="wa-media-img">{Icon.photo}</div>
            Final mockup, approved by the client
            <div className="wa-meta-line"><span className="time">10:47</span><span className="ticks">{Icon.ticks}</span></div>
          </div>
        </div>

        <div className="wa-row in">
          <div className="wa-bubble">
            <div className="wa-sender">Priya Nair</div>
            <div className="wa-doc-card"><div className="icon">PDF</div><div><div className="name">brief_v3.pdf</div><div className="sub">2.1 MB</div></div></div>
            <div className="wa-meta-line"><span className="time">10:49</span></div>
          </div>
        </div>

        <div className="wa-row out">
          <div className="wa-bubble">
            <div className="wa-audio"><span className="play"></span>
              <span className="wave">
                <span style={{ height: 6 }}></span><span style={{ height: 12 }}></span><span style={{ height: 5 }}></span>
                <span style={{ height: 14 }}></span><span style={{ height: 8 }}></span><span style={{ height: 11 }}></span>
                <span style={{ height: 5 }}></span><span style={{ height: 9 }}></span>
              </span>
              <span className="dur">0:14</span>
            </div>
            <div className="wa-meta-line"><span className="time">10:51</span><span className="ticks">{Icon.ticks}</span></div>
          </div>
        </div>
      </div>
      <div className="demo-archive-footer">Exported today · WhatsApp Rich Chat Export · Offline archive</div>
    </div>
  );
}

function PlayIcon({ playing }) {
  return playing ? (
    <svg viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="2" width="3.4" height="12" rx="1" /><rect x="9.6" y="2" width="3.4" height="12" rx="1" /></svg>
  ) : (
    <svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.4v11.2c0 .8.9 1.3 1.6.9l9-5.6c.7-.4.7-1.4 0-1.8l-9-5.6c-.7-.4-1.6.1-1.6.9Z" /></svg>
  );
}

export default function DemoWalkthrough() {
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const stageRef = useRef(null);

  const phase = PHASES[index];
  const { pos, clicking } = useCursorDriver(stageRef, phase.cursorPath, !reducedMotion);
  const percentRelevant = phase.id === 'processing' || phase.id === 'download';
  const percent = useTimedPercent(phase.duration, reducedMotion || !percentRelevant);

  useEffect(() => {
    if (!playing || reducedMotion) return undefined;
    const t = setTimeout(() => setIndex((i) => (i + 1) % PHASES.length), phase.duration);
    return () => clearTimeout(t);
  }, [index, playing, reducedMotion, phase]);

  const goTo = (i) => setIndex(((i % PHASES.length) + PHASES.length) % PHASES.length);

  const showEmpty = phase.id === 'browse';
  const showFolder = phase.id === 'folder';
  const showArchive = phase.id === 'result';
  const showWaWindow = !showFolder && !showArchive;

  return (
    <div className="demo-shell">
      <div className="demo-frame">
        <div className="browser-chrome">
          <div className="browser-dots"><span></span><span></span><span></span></div>
          <div className="browser-url">
            {showFolder ? 'Downloads' : showArchive ? 'file:///design-team-export/index.html' : 'web.whatsapp.com'}
          </div>
        </div>
        <div className="demo-viewport" ref={stageRef}>
          {showWaWindow && (
            <div className="wa-window">
              <Sidebar chatOpen={phase.id !== 'browse'} />
              <div className="wa-main">
                {showEmpty ? <EmptyMain /> : <ChatMain />}
                {(phase.id === 'chat-open' || phase.id === 'export' || phase.id === 'processing' || phase.id === 'download') && (
                  <ExportPanel phase={phase.id} percent={percent} />
                )}
                {phase.id === 'browse' && <ExportPanel phase="browse" percent={0} />}
              </div>
              {phase.id === 'download' && <DownloadShelf percent={percent} />}
            </div>
          )}
          {showFolder && <FolderScreen reducedMotion={reducedMotion} />}
          {showArchive && <ArchiveScreen reducedMotion={reducedMotion} />}

          {!reducedMotion && phase.cursorPath && (
            <div className={`demo-cursor${clicking ? ' is-clicking' : ''}`} style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
              <span className="ring" aria-hidden="true"></span>
              <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
                <path d="M3 1.5 L3 16.5 L7 12.8 L9.6 18 L12.2 16.7 L9.6 11.5 L15 11.2 Z" fill="#111b21" stroke="#fff" strokeWidth="1.1" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
      </div>

      <div className="demo-timebar">
        <div
          key={`${phase.id}-${playing}`}
          className={`demo-timebar-fill${playing && !reducedMotion ? ' is-animating' : ''}`}
          style={{ animationDuration: `${phase.duration}ms`, width: !playing || reducedMotion ? '100%' : undefined }}
        ></div>
      </div>

      <div className="demo-caption" aria-live="polite">
        <span className="eyebrow">{phase.label}</span>
        <h3>{phase.title}</h3>
        <p>{phase.body}</p>
      </div>

      <div className="demo-controls">
        <button type="button" className="demo-iconbtn" onClick={() => goTo(index - 1)} aria-label="Previous step">
          <svg viewBox="0 0 16 16" fill="none"><path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        {!reducedMotion && (
          <button type="button" className="demo-iconbtn" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause the walkthrough' : 'Play the walkthrough'}>
            <PlayIcon playing={playing} />
          </button>
        )}
        <button type="button" className="demo-iconbtn" onClick={() => goTo(index + 1)} aria-label="Next step">
          <svg viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

      <div className="demo-dots">
        {PHASES.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className="demo-dot"
            aria-current={i === index ? 'step' : undefined}
            onClick={() => { setPlaying(false); goTo(i); }}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
