import Image from "next/image";

export const metadata = {
  title: "Install",
  description:
    "Install WA Rich Export from the Microsoft Edge Add-ons store, or load it as an unpacked extension in Chrome while it awaits Chrome Web Store review.",
};

export default function InstallPage() {
  return (
    <main id="main">

      <section style={{ paddingBottom: 16 }}>
        <div className="container page-intro">
          <span className="eyebrow reveal">Setup guide</span>
          <h1 className="reveal h1-page">One click on Edge. Six steps on Chrome.</h1>
          <p className="reveal lede">WA Rich Export is live on the Microsoft Edge Add-ons store - install it in one click with no developer mode required. For Chrome, use the unpacked install while it goes through Chrome Web Store review.</p>
        </div>
      </section>

      <section id="edge-install" style={{ paddingTop: 8 }}>
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Microsoft Edge</span>
            <h2>One click from the official store</h2>
            <p>No developer mode. No cloning. Just click and install.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }} className="reveal">
            <a
              href="https://microsoftedge.microsoft.com/addons/detail/whatsapp-rich-chat-export/gclbjkggcippmhbnfndeninmnmpclkjc"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Get WA Rich Export from Microsoft Edge Add-ons"
            >
              <Image src="/edge-badge.svg" alt="Get it from Microsoft Edge Add-ons" width={220} height={64} priority />
            </a>
            <p style={{ color: 'var(--ink-soft)', maxWidth: 480 }}>
              Opens the official listing on <strong>microsoftedge.microsoft.com</strong>. Click <strong>Get</strong> on that page, then <strong>Add extension</strong> in the confirmation dialog.
            </p>
          </div>
          <div style={{ marginTop: 40 }} className="reveal">
            <Image
              src="/extension-screenshot.svg"
              alt="WA Rich Export panel open on WhatsApp Web, showing an export in progress with the four-step progress bar"
              width={880}
              height={540}
              style={{ width: '100%', height: 'auto', borderRadius: 12, border: '1px solid var(--line)' }}
            />
            <p style={{ marginTop: 12, fontSize: 13, color: 'var(--ink-faint)', textAlign: 'center' }}>
              The floating panel attaches to WhatsApp Web automatically once the extension is installed.
            </p>
          </div>
        </div>
      </section>

      <section id="steps" style={{ paddingTop: 8 }}>
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Google Chrome</span>
            <h2>Load unpacked while store review clears</h2>
            <p>Chrome Web Store listing is pending. These six steps get you running today.</p>
          </div>
          <div className="ledger">
            <div className="ledger-row reveal">
              <div className="ledger-num">01</div>
              <div>
                <h3>Get the extension folder</h3>
                <p>Download or clone the project so you have a folder that contains <code>manifest.json</code> at its root - not nested inside another folder.</p>
              </div>
            </div>
            <div className="ledger-row reveal">
              <div className="ledger-num">02</div>
              <div>
                <h3>Open Chrome&rsquo;s extensions page</h3>
                <p>Go to <code>chrome://extensions</code> in the address bar.</p>
              </div>
            </div>
            <div className="ledger-row reveal">
              <div className="ledger-num">03</div>
              <div>
                <h3>Turn on Developer mode</h3>
                <p>It&rsquo;s a toggle in the top-right corner of the extensions page.</p>
              </div>
            </div>
            <div className="ledger-row reveal">
              <div className="ledger-num">04</div>
              <div>
                <h3>Click &ldquo;Load unpacked&rdquo;</h3>
                <p>Select the folder from step 1 - the one containing <code>manifest.json</code>. The extension appears in your toolbar immediately; no restart needed.</p>
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
            <span className="eyebrow">Official stores</span>
            <h2>Chrome Web Store &amp; Edge Add-ons</h2>
            <p>Edge is live now. Chrome listing is pending review - use the unpacked steps above in Chrome in the meantime.</p>
          </div>
          <div className="card-grid">
            <article className="card reveal">
              <span className="card-tag">In review</span>
              <h3>Chrome Web Store</h3>
              <p>Listing pending. Until it&rsquo;s approved, use the unpacked install steps above in Chrome.</p>
            </article>
            <article className="card reveal" style={{ borderColor: 'var(--accent)', position: 'relative' }}>
              <span className="card-tag" style={{ background: 'var(--accent-wash)', color: 'var(--accent-strong)' }}>Live now</span>
              <h3>Microsoft Edge Add-ons</h3>
              <p>Available in the official store - no developer mode required. One click installs it directly into Edge. <a className="link-accent" href="#edge-install">See install steps above.</a></p>
            </article>
          </div>
        </div>
      </section>

    </main>
  );
}
