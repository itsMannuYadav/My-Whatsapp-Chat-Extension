/* Exposes WA_EXPORT_THEME_CSS for the archive styles.css / inline style */
(function () {
  'use strict';
  window.WA_EXPORT_THEME_CSS = `
:root {
  --bg: #efeae2;
  --bg-pattern: rgba(0,0,0,0.04);
  --header: #008069;
  --header-text: #ffffff;
  --bubble-out: #d9fdd3;
  --bubble-in: #ffffff;
  --text: #111b21;
  --muted: #667781;
  --reply-bar: #06cf9c;
  --reply-bg: rgba(0,0,0,0.05);
  --sender: #008069;
  --shadow: 0 1px 0.5px rgba(11,20,26,0.13);
  --date-bg: #e1f2fa;
  --date-text: #54656f;
  --link: #027eb5;
}
* { box-sizing: border-box; }
html, body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--text);
  font-family: "Segoe UI", "Helvetica Neue", Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
  font-size: 14.2px;
  line-height: 1.4;
}
body {
  min-height: 100vh;
  background-color: var(--bg);
  background-image:
    radial-gradient(var(--bg-pattern) 1.2px, transparent 1.2px),
    radial-gradient(var(--bg-pattern) 1.2px, transparent 1.2px);
  background-size: 28px 28px;
  background-position: 0 0, 14px 14px;
}
.header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: var(--header);
  color: var(--header-text);
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.header h1 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.header .meta {
  font-size: 12px;
  opacity: 0.9;
  white-space: nowrap;
}
.badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: rgba(255,255,255,0.18);
  padding: 2px 8px;
  border-radius: 999px;
  margin-left: 8px;
  vertical-align: middle;
}
.wrap {
  max-width: 900px;
  margin: 0 auto;
  padding: 16px 12px 72px;
}
.day {
  display: flex;
  justify-content: center;
  margin: 14px 0;
}
.day span {
  background: var(--date-bg);
  color: var(--date-text);
  font-size: 12px;
  font-weight: 500;
  padding: 5px 12px;
  border-radius: 8px;
  box-shadow: var(--shadow);
  text-transform: uppercase;
}
.row {
  display: flex;
  margin: 2px 0 3px;
}
.row.out { justify-content: flex-end; }
.row.in { justify-content: flex-start; }
.bubble {
  position: relative;
  max-width: min(75%, 560px);
  padding: 6px 8px 4px;
  border-radius: 8px;
  box-shadow: var(--shadow);
  word-wrap: break-word;
  overflow-wrap: anywhere;
}
.row.out .bubble { background: var(--bubble-out); border-top-right-radius: 0; }
.row.in .bubble { background: var(--bubble-in); border-top-left-radius: 0; }
.sender {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--sender);
  margin: 0 2px 3px;
}
.reply {
  display: block;
  text-decoration: none;
  color: inherit;
  background: var(--reply-bg);
  border-left: 4px solid var(--reply-bar);
  border-radius: 6px;
  padding: 6px 8px;
  margin: 0 0 6px;
  cursor: pointer;
}
.reply .r-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--reply-bar);
}
.reply .r-text {
  font-size: 12.5px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.body-text {
  white-space: pre-wrap;
  padding: 0 2px;
}
.body-text strong { font-weight: 700; }
.body-text em { font-style: italic; }
.body-text s { text-decoration: line-through; }
.body-text .wa-code,
.body-text code.wa-code {
  font-family: "Consolas", "Courier New", monospace;
  font-size: 0.92em;
  background: rgba(0,0,0,0.06);
  padding: 1px 4px;
  border-radius: 4px;
}
.body-text pre.wa-code-block {
  font-family: "Consolas", "Courier New", monospace;
  font-size: 0.9em;
  background: rgba(0,0,0,0.06);
  padding: 8px 10px;
  border-radius: 6px;
  overflow-x: auto;
  white-space: pre-wrap;
  margin: 4px 0;
}
.body-text a.wa-link {
  color: var(--link);
  text-decoration: none;
}
.body-text a.wa-link:hover { text-decoration: underline; }
.wa-emoji {
  font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
  font-size: 1.2em;
  line-height: 1;
  vertical-align: -0.1em;
}
.wa-mention {
  color: #027eb5;
  font-weight: 600;
  cursor: pointer;
}
.row.out .wa-mention {
  color: #027eb5;
}
.system {
  display: flex;
  justify-content: center;
  margin: 8px 0;
}
.system span {
  background: #e1f2dc;
  color: #54656f;
  font-size: 12px;
  padding: 5px 12px;
  border-radius: 8px;
  box-shadow: var(--shadow);
  text-align: center;
  max-width: 85%;
}
.media-img {
  display: block;
  width: 100%;
  max-width: 330px;
  min-width: 220px;
  height: auto;
  border-radius: 6px;
  margin: 2px 0;
  background: #00000010;
}
.media-video {
  display: block;
  width: 100%;
  max-width: 330px;
  min-width: 220px;
  border-radius: 6px;
  margin: 2px 0;
  background: #000;
}
.sticker {
  display: block;
  width: 180px;
  height: auto;
  max-width: 180px;
  margin: 4px 2px;
  image-rendering: auto;
}
.bubble.sticker-wrap {
  background: transparent !important;
  box-shadow: none;
  padding: 2px 4px 0;
  max-width: 200px;
}
.doc-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: rgba(0,0,0,0.04);
  border-radius: 8px;
  text-decoration: none;
  color: var(--text);
  margin: 2px 0;
}
.doc-card .icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #008069;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}
.doc-card .name {
  font-size: 13px;
  font-weight: 500;
  word-break: break-all;
}
.audio-wrap {
  margin: 4px 0;
  min-width: 220px;
}
.audio-wrap audio {
  width: 100%;
  height: 36px;
}
.placeholder {
  display: inline-block;
  padding: 10px 12px;
  background: rgba(0,0,0,0.05);
  border-radius: 8px;
  color: var(--muted);
  font-style: italic;
  margin: 2px 0;
}
.meta-line {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 2px;
  padding: 0 2px 1px;
}
.time {
  font-size: 11px;
  color: var(--muted);
}
.fwd {
  font-size: 11px;
  color: var(--muted);
  font-style: italic;
  margin-bottom: 4px;
}
.deleted {
  font-style: italic;
  color: var(--muted);
}
.msg-highlight {
  animation: flash 1.2s ease;
}
@keyframes flash {
  0%, 100% { outline: 2px solid transparent; }
  20%, 60% { outline: 2px solid #00a884; outline-offset: 2px; }
}
.footer {
  text-align: center;
  font-size: 11px;
  color: var(--muted);
  padding: 20px 12px 28px;
}
a { color: var(--link); }
.alias-panel {
  margin: 28px 0 8px;
  padding: 18px 16px 16px;
  background: rgba(255,255,255,0.72);
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 12px;
  box-shadow: var(--shadow);
}
.alias-panel h2 {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}
.alias-help {
  margin: 0 0 14px;
  font-size: 12.5px;
  color: var(--muted);
  line-height: 1.45;
}
.alias-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.alias-row {
  display: grid;
  grid-template-columns: 1fr minmax(140px, 220px);
  gap: 10px 14px;
  align-items: end;
  padding: 10px 0;
  border-top: 1px solid rgba(0,0,0,0.06);
}
.alias-row:first-child { border-top: 0; padding-top: 0; }
.alias-default {
  font-size: 13px;
  color: var(--text);
}
.alias-phone {
  margin-top: 3px;
  font-size: 12px;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
.alias-phone-missing {
  font-style: italic;
}
.alias-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
  color: var(--muted);
  font-weight: 500;
}
.alias-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid rgba(0,0,0,0.14);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text);
  background: #fff;
}
.alias-input:focus {
  outline: 2px solid rgba(0,128,105,0.35);
  border-color: #008069;
}
.alias-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}
.alias-btn {
  border: 1px solid rgba(0,0,0,0.14);
  background: #fff;
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
}
.alias-btn.primary {
  background: #008069;
  border-color: #008069;
  color: #fff;
}
.alias-btn:hover { filter: brightness(0.98); }
.alias-note {
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--sender);
}
@media (max-width: 640px) {
  .alias-row {
    grid-template-columns: 1fr;
  }
}
`.trim();
  if (typeof globalThis !== 'undefined') globalThis.WA_EXPORT_THEME_CSS = window.WA_EXPORT_THEME_CSS;
})();
