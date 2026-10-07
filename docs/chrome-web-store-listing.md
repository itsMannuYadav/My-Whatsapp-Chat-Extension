# Chrome Web Store listing - copy/paste answers

Dashboard: https://chrome.google.com/webstore/devconsole

Build the upload package first (output: `dist/wa-rich-export-<version>.zip`):

```bash
python scripts/build_zip.py
```

## Store listing tab

**Name** (from manifest): WhatsApp Rich Chat Export

**Summary** (max 132 chars):
Export any WhatsApp Web chat into an offline, WhatsApp-styled HTML archive - replies, stickers, photos, docs & voice notes kept.

**Category:** Productivity

**Language:** English

**Description:**

> WA Rich Export saves the WhatsApp Web chat you have open as an offline, WhatsApp-styled HTML archive you can keep forever.
>
> What is kept:
> - Text with formatting (bold, italic, strike, code), links and emails
> - Reply quotes with click-to-jump to the original message
> - Stickers, images, documents (as downloadable cards) and voice notes (as playable audio)
> - Group sender names, @mentions and forwarded tags
>
> How it works: open a chat, choose a history depth (last 1,000 / last 5,000 / everything already synced), click Export chat. Your browser downloads a .zip - unzip it and open index.html any time, with no internet connection and no extension needed.
>
> Private by design: everything runs locally in your browser. No server, no upload, no analytics, no remote code. The extension asks for a single permission: access to web.whatsapp.com.
>
> Limitations: only messages already synced to your WhatsApp Web session can be exported. Video is shown as a placeholder for now. For your own chats only.
>
> Independent project - not affiliated with, endorsed by, or associated with WhatsApp or Meta. WhatsApp is a trademark of WhatsApp LLC.

**Graphics** (already in `website/store-assets/`):

| Slot | File | Size |
|---|---|---|
| Store icon | `icons/icon128.png` | 128x128 |
| Small promo tile | `website/store-assets/small-tile-440x280.png` | 440x280 |
| Marquee promo tile (optional) | `website/store-assets/large-tile-1400x560.png` | 1400x560 |
| Screenshots (1-5, required) | take these - see below | 1280x800 |

Screenshot ideas: (1) the floating panel open on a chat in WhatsApp Web, (2) export in progress, (3) the exported archive opened in a browser. The `/demo` page of the website can be used for clean frames. Use a test chat, never a real private one.

**Official URL / Homepage / Support URL:** your deployed website URL (and `https://github.com/itsMannuYadav/My-Whatsapp-Chat-Extension/issues` for support if you have no site yet).

## Privacy practices tab

**Single purpose:**
Export the currently open WhatsApp Web chat into an offline HTML archive saved to the user's computer.

**Host permission justification (`https://web.whatsapp.com/*`):**
The extension adds its export panel to WhatsApp Web and reads the messages already loaded in the page the user is viewing, in order to build the archive. It does not run on any other site.

**Remote code:** No, I am not using remote code. (All scripts, including the bundled JSZip, ship inside the package.)

**Data usage - what user data is collected:** none of the listed categories are collected or transmitted. Tick nothing, then tick all three certifications:
- I do not sell or transfer user data to third parties outside the approved use cases
- I do not use or transfer user data for purposes unrelated to the item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

Note: the chat content is processed locally to create the file the user asked for and never leaves the machine. Locally stored UI preferences (panel position, last history depth) are not user data sent anywhere.

**Privacy policy URL:** `<your-site>/privacy` (the website's privacy page - must be publicly reachable before you submit).

## Distribution tab

- Visibility: Public
- Regions: all regions

## Submit

Click **Submit for review**. Tick "Defer publishing" if you want to publish manually after approval. First reviews usually take a few days. Once approved, copy the listing URL and update the README badge, install page and home page links.
