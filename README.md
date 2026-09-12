# WhatsApp Rich Chat Export

Chrome extension (Manifest V3) that exports the **currently open** WhatsApp Web chat (DM or group) into an offline archive that looks like WhatsApp — including **replies**, **stickers**, **images**, **documents**, and **voice notes** in the correct message order.

## Why this works

It does **not** scrape the chat DOM. It injects into the WhatsApp Web **page main world** and reads decrypted messages from WhatsApp’s internal Store (`WAWebCollections`, etc.), then downloads media via WhatsApp’s own `downloadMedia` path when available.

## Install (Load unpacked)

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this folder: `Whatsapp Chrome Extension` (the folder that contains `manifest.json`)
5. Open [https://web.whatsapp.com](https://web.whatsapp.com) and log in
6. Open any chat — the **WA Rich Export** panel appears at the top-right

### Panel controls

- Drag the header to move the panel anywhere on screen — position is remembered.
- Click the minimize icon (or double-click the header) to tuck the panel into a floating button; click that button to bring it back.
- The **(i)** icon toggles the "what gets exported" hint.
- The panel automatically matches WhatsApp Web's light/dark theme.
- The status dot is amber while connecting, blue while an export is running, green when ready, and red on error.

## Export

1. Open the chat you want to keep
2. Choose history depth (Last 1,000 / 5,000 / All available)
3. Click **Export chat**
4. Wait for history load + media download
5. Unzip the downloaded file and open `index.html`

ZIP layout:

```
ChatName_YYYY-MM-DD/
  index.html
  styles.css
  chat.json
  media/
```

## What V1 includes

| Feature | Support |
|--------|---------|
| Text + timestamps | Yes |
| Reply quote bars + jump-to-parent | Yes |
| Stickers / images / documents / voice | Yes (best-effort download) |
| Groups (sender names) | Yes |
| Temporary name remap at end of archive | Yes (session-only; file keeps defaults) |
| Video | Placeholder in the same slot |
| Offline open | Yes (local files only) |

## Limitations

- Only messages **synced to this WhatsApp Web session** can be exported (older history may live only on the phone).
- Media is best-effort; if WhatsApp has not cached/decryptable bytes, the message stays with a typed placeholder.
- WhatsApp Web updates can break Store module names; the injector uses current `WAWeb*` modules with defensive fallbacks.
- For your own chats only. Keep archives private.

## Project layout

```
manifest.json
src/background/service_worker.js
src/content/content_bridge.js
src/injected/store-access.js
src/injected/message-collector.js
src/injected/media-downloader.js
src/injected/injected.js
src/ui/panel.js / panel.css
src/export/renderer.js
src/export/whatsapp-theme.css.js
src/export/zip-builder.js
src/lib/jszip.min.js
icons/
```

## Privacy

Everything runs locally in your browser. No server, no upload.
