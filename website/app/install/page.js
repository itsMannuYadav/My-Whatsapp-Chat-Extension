export const metadata = {
  title: 'Install',
  description:
    'How to install WA Rich Export in Chrome or Microsoft Edge, including loading it as an unpacked extension while it’s in store review.',
};

export default function InstallPage() {
  return (
    <main id="main">

      <section style={{ paddingBottom: 16 }}>
        <div className="container page-intro">
          <span className="eyebrow reveal">Setup guide</span>
          <h1 className="reveal h1-page">Installed and exporting in under a minute.</h1>
          <p className="reveal lede">WA Rich Export is currently distributed as source while it goes through Chrome Web Store and Microsoft Edge Add-ons review. Loading it as an unpacked extension takes the same six steps in either browser.</p>
        </div>
      </section>

      <section id="steps" style={{ paddingTop: 8 }}>
        <div className="container">
          <div className="ledger">
            <div className="ledger-row reveal">
              <div className="ledger-num">01</div>
              <div>
                <h3>Get the extension folder</h3>
                <p>Download or clone the project so you have a folder that contains <code>manifest.json</code> at its root — not nested inside another folder.</p>
              </div>
            </div>
            <div className="ledger-row reveal">
              <div className="ledger-num">02</div>
              <div>
                <h3>Open your browser&rsquo;s extensions page</h3>
                <p>Chrome: go to <code>chrome://extensions</code>. Edge: go to <code>edge://extensions</code>. Both are Chromium-based, so the rest of the steps look identical.</p>
              </div>
            </div>
            <div className="ledger-row reveal">
              <div className="ledger-num">03</div>
              <div>
                <h3>Turn on Developer mode</h3>
                <p>It&rsquo;s a toggle in the top-right corner of the extensions page in both browsers.</p>
              </div>
            </div>
            <div className="ledger-row reveal">
              <div className="ledger-num">04</div>
              <div>
                <h3>Click &ldquo;Load unpacked&rdquo;</h3>
                <p>Select the folder from step 1 — the one containing <code>manifest.json</code>. The extension appears in your toolbar immediately; no restart needed.</p>
              </div>
            </div>
            <div className="ledger-row reveal">
              <div className="ledger-num">05</div>
              <div>
                <h3>Open WhatsApp Web and log in</h3>
                <p>Go to <code>web.whatsapp.com</code> and scan in, as usual.</p>
              </div>
            </div>
            <div className="ledger-row reveal">
              <div className="ledger-num">06</div>
              <div>
                <h3>Open any chat</h3>
                <p>The WA Rich Export panel appears at the top-right. Pick a history depth, click <strong>Export chat</strong>, and the archive downloads as a <code>.zip</code> through your browser&rsquo;s normal Downloads flow.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">What the folder looks like</span>
            <h2>Point &ldquo;Load unpacked&rdquo; at this level</h2>
          </div>
          <div className="filetree reveal">{`whatsapp-rich-export/
├── `}<span className="hl">manifest.json</span>{`          ← select this folder, not a file
├── icons/
├── src/
│   ├── background/service_worker.js
│   ├── content/content_bridge.js
│   ├── injected/            (Store access, media downloader)
│   ├── export/               (HTML + ZIP renderer)
│   └── `}<span className="dir">ui/</span>{`panel.js, panel.css
└── README.md`}</div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="callout reveal">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            <div>
              <h3>Picking up a new version</h3>
              <p>Pulled newer code into the same folder? Go back to <code className="inline-code">chrome://extensions</code> (or <code className="inline-code">edge://extensions</code>) and click the refresh icon on the WA Rich Export card. Reload any open WhatsApp Web tab afterwards.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="stores">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Coming to the stores</span>
            <h2>Chrome Web Store &amp; Edge Add-ons</h2>
            <p>Once review clears, install becomes a single click from either official store — no developer mode required. This page will switch straight over to those links.</p>
          </div>
          <div className="card-grid">
            <article className="card reveal">
              <span className="card-tag">In review</span>
              <h3>Chrome Web Store</h3>
              <p>Listing pending. Until it&rsquo;s approved, use the unpacked install steps above in Chrome.</p>
            </article>
            <article className="card reveal">
              <span className="card-tag">In review</span>
              <h3>Microsoft Edge Add-ons</h3>
              <p>Listing pending. Until it&rsquo;s approved, use the unpacked install steps above in Edge.</p>
            </article>
          </div>
        </div>
      </section>

    </main>
  );
}
