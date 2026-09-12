'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

// Each scene mirrors one real step of the extension (see src/export/renderer.js,
// src/injected/message-collector.js and src/injected/media-downloader.js) — the
// cursor waypoints and status copy are illustrative but the sequence itself
// (Load -> Structure -> Media -> Package, then a normal browser download) is the
// actual pipeline, not a made-up demo flow.
const SCENES = [
  {
    id: 'browse',
    label: '1. Open the chat',
    title: 'Open the chat you want to keep',
    body: 'WA Rich Export works on whatever chat is already open in WhatsApp Web — there’s no separate app to sign into.',
    duration: 4200,
    cursorPath: [
      { t: 1100, x: 24, y: 44 },
      { t: 2500, x: 24, y: 44, click: true },
    ],
  },
  {
    id: 'chat-open',
    label: '2. Click the icon',
    title: 'Click the icon in the toolbar',
    body: 'A small icon appears next to the open chat the moment it loads. Clicking it opens the export panel — nothing else on the page changes.',
    duration: 4200,
    cursorPath: [
      { t: 1200, x: 89, y: 12 },
      { t: 2500, x: 89, y: 12, click: true },
    ],
  },
  {
    id: 'panel',
    label: '3. Pick a depth',
    title: 'Choose how far back to go',
    body: 'Last 1,000 messages for a quick save, 5,000 for a fuller thread, or everything this session has already synced. Then click Export chat.',
    duration: 5200,
    cursorPath: [
      { t: 900, x: 65, y: 44 },
      { t: 1900, x: 65, y: 44, click: true },
      { t: 2900, x: 50, y: 62 },
      { t: 3900, x: 50, y: 62, click: true },
    ],
  },
  {
    id: 'processing',
    label: '4. It processes',
    title: 'Read, structure, fetch media, package',
    body: 'The extension reads the open chat straight out of WhatsApp’s own in-page Store, fetches cached media, then writes and zips the archive.',
    duration: 6000,
  },
  {
    id: 'download',
    label: '5. It downloads',
    title: 'Your browser downloads the archive',
    body: 'The finished .zip comes through your browser’s normal download flow — the same one every other download uses. No upload, no server in between.',
    duration: 3400,
  },
  {
    id: 'folder',
    label: '6. Open the folder',
    title: 'Open the folder it saved to',
    body: 'Unzipped, it’s four plain files: index.html, styles.css, chat.json, and a media/ folder — nothing proprietary, nothing that needs this extension again.',
    duration: 4400,
    cursorPath: [
      { t: 1300, x: 30, y: 34 },
      { t: 2500, x: 30, y: 34, click: true },
      { t: 2760, x: 30, y: 34, click: true },
    ],
  },
  {
    id: 'result',
    label: '7. The result',
    title: 'The chat opens exactly as it looked',
    body: 'Double-clicking index.html opens the archive in a normal browser tab — replies still jump to their source, media still plays, all of it offline.',
    duration: 5400,
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

// A scene component only ever mounts while its scene is on screen — switching
// away and back always remounts it — so its own progress can live as local
// state seeded straight from props, with no reset-on-change effect needed.
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

function phaseAt(percent) {
  if (percent < 20) return { step: 1, status: 'Reading WhatsApp’s own Store…' };
  if (percent < 45) return { step: 2, status: 'Structuring the timeline…' };
  if (percent < 85) {
    const count = Math.min(240, Math.round(((percent - 45) / 40) * 240));
    return { step: 3, status: `Downloading media… ${count}/240` };
  }
  return { step: 4, status: 'Packaging the archive…' };
}

function DemoCursor({ pos, clicking }) {
  return (
    <div
      className={`demo-cursor${clicking ? ' is-clicking' : ''}`}
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
    >
      <span className="ring" aria-hidden="true"></span>
      <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
        <path
          d="M3 1.5 L3 16.5 L7 12.8 L9.6 18 L12.2 16.7 L9.6 11.5 L15 11.2 Z"
          fill="var(--ink)"
          stroke="var(--surface)"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function SceneBrowse() {
  return (
    <div className="demo-sidebar">
      <div className="demo-chat-row">
        <div className="demo-avatar">P</div>
        <div><div className="demo-chat-name">Priya Nair</div><div className="demo-chat-snip">Sent a photo</div></div>
        <span className="demo-chat-time">09:14</span>
      </div>
      <div className="demo-chat-row is-active">
        <div className="demo-avatar">D</div>
        <div><div className="demo-chat-name">Design Team</div><div className="demo-chat-snip">On it — exporting now 🗂️</div></div>
        <span className="demo-chat-time">10:42</span>
      </div>
      <div className="demo-chat-row">
        <div className="demo-avatar">M</div>
        <div><div className="demo-chat-name">Mom</div><div className="demo-chat-snip">Call me when free</div></div>
        <span className="demo-chat-time">Yest.</span>
      </div>
    </div>
  );
}

function SceneChatOpen() {
  return (
    <>
      <div className="demo-toolbar-icon" aria-hidden="true">⇩</div>
      <div className="chat-day">Today</div>
      <div className="bubble in">Can you pull the design thread before Friday?</div>
      <div className="bubble out">On it — exporting the whole channel now 🗂️<span className="tick">10:42 ✓✓</span></div>
      <div className="bubble in">Perfect, ping me the zip</div>
    </>
  );
}

function ScenePanel() {
  return (
    <div className="export-panel demo-panel-lg">
      <div className="ep-head">WA Rich Export<span className="ep-dot"></span></div>
      <div className="ep-body">
        <div className="ep-chat">
          <div className="ep-avatar">D</div>
          <div><div className="ep-chat-name">Design Team</div><div className="ep-chat-sub">~842 msgs loaded</div></div>
        </div>
        <div className="segmented">
          <span>1,000</span>
          <span className="active">5,000</span>
          <span>All synced</span>
        </div>
        <button type="button" className="btn btn-primary btn-sm demo-export-btn" tabIndex={-1}>Export chat</button>
      </div>
    </div>
  );
}

function SceneProcessing({ duration, reducedMotion }) {
  const percent = useTimedPercent(duration, reducedMotion);
  const { step, status } = phaseAt(percent);
  const stepClass = (n) => (n < step ? 'done' : n === step ? 'active' : '');
  return (
    <div className="demo-processing">
      <div className="ep-chat">
        <div className="ep-avatar">D</div>
        <div><div className="ep-chat-name">Design Team</div><div className="ep-chat-sub">~842 msgs loaded</div></div>
      </div>
      <div className="ep-steps">
        <div className={`ep-step ${stepClass(1)}`}><i></i><span>Load</span></div>
        <div className={`ep-step ${stepClass(2)}`}><i></i><span>Structure</span></div>
        <div className={`ep-step ${stepClass(3)}`}><i></i><span>Media</span></div>
        <div className={`ep-step ${stepClass(4)}`}><i></i><span>Package</span></div>
      </div>
      <div className="ep-bar-wrap"><div className="ep-bar" style={{ width: `${Math.max(4, percent)}%` }}></div></div>
      <div className="ep-status tabular">{status}</div>
    </div>
  );
}

function SceneDownload({ duration, reducedMotion }) {
  const percent = useTimedPercent(duration, reducedMotion);
  const done = percent >= 100;
  return (
    <div className="demo-download-shelf">
      <div className="demo-download-chip">
        <div className={`demo-download-ring${done ? ' is-done' : ''}`} style={{ '--p': percent }}></div>
        <div>
          <div className="demo-download-name">design-team-export.zip</div>
          <div className="demo-download-sub">{done ? '6.8 MB — saved to Downloads' : '6.8 MB'}</div>
        </div>
      </div>
    </div>
  );
}

function SceneFolder({ reducedMotion }) {
  // Mirrors the second click waypoint on this scene (t: 2760) plus a short settle —
  // local to this component since it always remounts fresh when this scene comes on screen.
  const [opening, setOpening] = useState(false);
  useEffect(() => {
    if (reducedMotion) return undefined;
    const t = setTimeout(() => setOpening(true), 2960);
    return () => clearTimeout(t);
  }, [reducedMotion]);

  return (
    <div className="demo-folder">
      <div className="demo-folder-path">Downloads / design-team-export</div>
      <div className={`demo-file-row${opening ? ' is-opening' : ''}`}>
        <span className="demo-file-ico html">‹h›</span>index.html<span className="demo-file-size">312 KB</span>
      </div>
      <div className="demo-file-row"><span className="demo-file-ico css">#</span>styles.css<span className="demo-file-size">8 KB</span></div>
      <div className="demo-file-row"><span className="demo-file-ico json">{'{}'}</span>chat.json<span className="demo-file-size">96 KB</span></div>
      <div className="demo-file-row"><span className="demo-file-ico folder">▸</span>media/<span className="demo-file-size">240 files</span></div>
    </div>
  );
}

function SceneResult() {
  return (
    <>
      <span className="demo-result-badge">Opened locally — works offline</span>
      <div className="chat-day">Today</div>
      <div className="bubble in">Can you pull the design thread before Friday?</div>
      <div className="bubble out demo-highlight-pulse">
        <div className="quote">Priya: the export needs to keep reply threads intact</div>
        On it — exporting the whole channel now 🗂️
        <span className="tick">10:42 ✓✓</span>
      </div>
      <div className="bubble in">Perfect, ping me the zip</div>
    </>
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
  const [cursorPos, setCursorPos] = useState({ x: 24, y: 44 });
  const [clicking, setClicking] = useState(false);

  const scene = SCENES[index];

  // Cursor waypoints + click ripples for the current scene. The cursor node
  // lives outside the remounting scene stack so its left/top glides via CSS
  // transition across scene changes instead of teleporting.
  useEffect(() => {
    if (reducedMotion || !scene.cursorPath) return undefined;
    const timers = [];
    scene.cursorPath.forEach((wp) => {
      timers.push(
        setTimeout(() => {
          setCursorPos({ x: wp.x, y: wp.y });
          if (wp.click) {
            setClicking(true);
            timers.push(setTimeout(() => setClicking(false), 380));
          }
        }, wp.t)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [index, reducedMotion, scene]);

  // Autoplay advance.
  useEffect(() => {
    if (!playing || reducedMotion) return undefined;
    const t = setTimeout(() => setIndex((i) => (i + 1) % SCENES.length), scene.duration);
    return () => clearTimeout(t);
  }, [index, playing, reducedMotion, scene]);

  const goTo = (i) => setIndex(((i % SCENES.length) + SCENES.length) % SCENES.length);

  const renderStage = () => {
    switch (scene.id) {
      case 'browse': return <SceneBrowse />;
      case 'chat-open': return <SceneChatOpen />;
      case 'panel': return <ScenePanel />;
      case 'processing': return <SceneProcessing duration={scene.duration} reducedMotion={reducedMotion} />;
      case 'download': return <SceneDownload duration={scene.duration} reducedMotion={reducedMotion} />;
      case 'folder': return <SceneFolder reducedMotion={reducedMotion} />;
      case 'result': return <SceneResult />;
      default: return null;
    }
  };

  return (
    <div className="demo-shell">
      <div className="demo-frame">
        <div className="browser-chrome">
          <div className="browser-dots"><span></span><span></span><span></span></div>
          <div className="browser-url">
            {scene.id === 'folder' ? 'Downloads' : scene.id === 'result' ? 'file:///design-team-export/index.html' : 'web.whatsapp.com'}
          </div>
        </div>
        <div className="demo-viewport" aria-hidden="true">
          <div className="demo-scene" key={scene.id}>
            {renderStage()}
          </div>
          {!reducedMotion && scene.cursorPath && <DemoCursor pos={cursorPos} clicking={clicking} />}
        </div>
      </div>

      <div className="demo-timebar">
        <div
          key={`${scene.id}-${playing}`}
          className={`demo-timebar-fill${playing && !reducedMotion ? ' is-animating' : ''}`}
          style={{
            animationDuration: `${scene.duration}ms`,
            width: !playing || reducedMotion ? '100%' : undefined,
          }}
        ></div>
      </div>

      <div className="demo-caption" aria-live="polite">
        <span className="eyebrow">{scene.label}</span>
        <h3>{scene.title}</h3>
        <p>{scene.body}</p>
      </div>

      <div className="demo-controls">
        <button type="button" className="demo-iconbtn" onClick={() => goTo(index - 1)} aria-label="Previous step">
          <svg viewBox="0 0 16 16" fill="none"><path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        {!reducedMotion && (
          <button
            type="button"
            className="demo-iconbtn"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause the walkthrough' : 'Play the walkthrough'}
          >
            <PlayIcon playing={playing} />
          </button>
        )}
        <button type="button" className="demo-iconbtn" onClick={() => goTo(index + 1)} aria-label="Next step">
          <svg viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

      <div className="demo-dots">
        {SCENES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className="demo-dot"
            aria-current={i === index ? 'step' : undefined}
            onClick={() => {
              setPlaying(false);
              goTo(i);
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
