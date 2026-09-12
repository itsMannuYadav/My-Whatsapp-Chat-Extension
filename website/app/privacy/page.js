export const metadata = {
  title: 'Privacy Policy',
  description:
    'What WA Rich Export can see, what it stores locally, and what it never does: no servers, no analytics, no third-party sharing.',
};

export default function PrivacyPage() {
  return (
    <main id="main">

      <section className="doc-hero">
        <div className="container doc-hero-inner">
          <span className="eyebrow">Legal</span>
          <h1 className="h1-page" style={{ fontSize: 'clamp(30px, 4vw, 42px)' }}>Privacy Policy</h1>
          <p className="lede" style={{ maxWidth: '64ch' }}>The short version: WA Rich Export reads the chat you have open and writes a file to your own disk. It does not have a server, and it does not send your messages, media, or contacts to anyone — including its own developer.</p>
          <div className="doc-meta">Last updated 12 September 2026 · Applies to WA Rich Export v1.0.9 and later</div>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="table-wrap reveal">
            <table>
              <thead>
                <tr><th>Question</th><th>Answer</th></tr>
              </thead>
              <tbody>
                <tr><td>Does the extension operate a server?</td><td className="no">No</td></tr>
                <tr><td>Is any message, media, or contact data transmitted off your device by the extension?</td><td className="no">No</td></tr>
                <tr><td>Does it use analytics, telemetry, or crash reporting?</td><td className="no">No</td></tr>
                <tr><td>Does it sell or share data with third parties?</td><td className="no">No</td></tr>
                <tr><td>Does it store anything locally on your device?</td><td className="yes">Yes — UI preferences only, see below</td></tr>
                <tr><td>Can the developer see your chats?</td><td className="no">No</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 24 }}>
        <div className="container doc-body">
          <nav className="doc-toc" aria-label="On this page">
            <a href="#scope">Scope</a>
            <a href="#what-it-sees">What it can see</a>
            <a href="#what-happens">Where an export goes</a>
            <a href="#media">Media &amp; WhatsApp&rsquo;s servers</a>
            <a href="#permissions">Permissions, explained</a>
            <a href="#local-storage">Local preferences</a>
            <a href="#third-parties">Third parties</a>
            <a href="#children">Children&rsquo;s privacy</a>
            <a href="#changes">Changes to this policy</a>
            <a href="#contact">Contact</a>
          </nav>

          <div className="doc-content">

            <h2 id="scope">Scope</h2>
            <p>This policy covers the WA Rich Export browser extension for Chrome and Microsoft Edge. It does not cover WhatsApp Web itself, or WhatsApp LLC / Meta&rsquo;s own handling of your messages — see WhatsApp&rsquo;s own privacy policy for that. This extension is an independent project and is not affiliated with, endorsed by, or associated with WhatsApp or Meta.</p>

            <h2 id="what-it-sees">What it can see</h2>
            <p>The extension&rsquo;s code only runs on pages under <code className="inline-code">web.whatsapp.com</code> — that&rsquo;s the only site it&rsquo;s granted access to. On that page, it reads the chat you currently have open directly from WhatsApp Web&rsquo;s own in-memory data layer (the same decrypted data already available to the page you&rsquo;re looking at). It does not read other browser tabs, other websites, your file system, or any chat you haven&rsquo;t opened.</p>

            <h2 id="what-happens">Where an export goes</h2>
            <p>When you click <strong>Export chat</strong>:</p>
            <ul>
              <li>Messages are structured into a JSON timeline, in your browser&rsquo;s memory.</li>
              <li>Media is downloaded (see below) and held in memory alongside it.</li>
              <li>Everything is packaged into a <code className="inline-code">.zip</code> file using your browser&rsquo;s normal file-download mechanism.</li>
            </ul>
            <p>At no point does this data pass through a server operated by this extension&rsquo;s developer — there isn&rsquo;t one. The only network activity involved is WhatsApp Web&rsquo;s own traffic to WhatsApp&rsquo;s servers, which happens regardless of whether this extension is installed.</p>

            <h2 id="media">Media &amp; WhatsApp&rsquo;s servers</h2>
            <p>Stickers, images, documents, and voice notes are fetched using WhatsApp Web&rsquo;s own built-in media-download functions — the identical request the page would make if you clicked to view that media yourself. This extension does not introduce a new destination for that traffic; it only triggers a function that was already part of the page.</p>

            <h2 id="permissions">Permissions, explained</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Permission</th><th>Why it&rsquo;s requested</th></tr></thead>
                <tbody>
                  <tr>
                    <td><code className="inline-code">host_permissions:<br />web.whatsapp.com</code></td>
                    <td>Required so the extension&rsquo;s scripts can run on WhatsApp Web at all. It is not granted access to any other site.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>That&rsquo;s the only permission WA Rich Export requests. It does not ask for browsing history, bookmarks, other tabs, downloads-folder access, or general network access.</p>

            <h2 id="local-storage">Local preferences</h2>
            <p>The export panel remembers a handful of interface preferences — its position on screen, whether it&rsquo;s minimized, your last-chosen history depth, and whether the info hint is expanded. These are saved using your browser&rsquo;s standard <code className="inline-code">localStorage</code>, scoped only to the <code className="inline-code">web.whatsapp.com</code> origin. They never leave your device, are never read by anyone but this extension, and are cleared automatically if you clear that site&rsquo;s browsing data.</p>

            <h2 id="third-parties">Third parties</h2>
            <p>WA Rich Export does not integrate any third-party analytics, advertising, or crash-reporting service. It loads no remote scripts. The only third-party code it ships is a bundled copy of <a href="https://stuk.github.io/jszip/" className="link-accent">JSZip</a> (used entirely offline, in your browser, to build the archive) — nothing from it is transmitted anywhere.</p>

            <h2 id="children">Children&rsquo;s privacy</h2>
            <p>WA Rich Export is a general-purpose utility and is not directed at children. It does not knowingly collect personal information from anyone, of any age — see the sections above for exactly what it does and doesn&rsquo;t do with the data it can see.</p>

            <h2 id="changes">Changes to this policy</h2>
            <p>If this policy changes, the update will appear on this page with a revised &ldquo;last updated&rdquo; date above. Meaningful changes will also be noted in the extension&rsquo;s release notes.</p>

            <h2 id="contact">Contact</h2>
            <p>Questions about this policy or how the extension handles data can be sent to <a href="mailto:support@example.com" className="link-accent">support@example.com</a>. <em className="note-faint">(Replace this address with your own contact before submitting to either store.)</em></p>

          </div>
        </div>
      </section>

    </main>
  );
}
