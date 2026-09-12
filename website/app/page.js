import Link from 'next/link';

export default function HomePage() {
  return (
    <main id="main">

      <section className="hero">
        <div className="container">
          <div className="hero-copy">
            <span className="eyebrow">Chrome &amp; Edge extension · Manifest V3</span>
            <h1>Every conversation, kept exactly as WhatsApp showed it to you.</h1>
            <p className="lede">WA Rich Export reads the chat you currently have open on WhatsApp Web and writes it to an offline archive on your disk — replies quoted, stickers and photos inline, documents and voice notes attached, group senders labelled. Nothing is uploaded anywhere.</p>
            <div className="hero-ctas">
              <Link className="btn btn-primary" href="/install">Get the extension</Link>
              <a className="btn btn-ghost" href="#how-it-works">See how it works</a>
            </div>
            <div className="hero-meta">
              <span>Zero servers</span>
              <span>One host permission</span>
              <span>Reads open chats only</span>
              <span>Works offline once exported</span>
            </div>
          </div>

          <div className="hero-visual reveal" aria-hidden="true">
            <div className="browser-mock">
              <div className="browser-chrome">
                <div className="browser-dots"><span></span><span></span><span></span></div>
                <div className="browser-url">web.whatsapp.com</div>
              </div>
              <div className="chat-stage">
                <div className="chat-day">Today</div>
                <div className="bubble in">Can you pull the design thread before Friday?</div>
                <div className="bubble out">
                  <div className="quote">Priya: the export needs to keep reply threads intact</div>
                  On it — exporting the whole channel now 🗂️
                  <span className="tick">10:42 ✓✓</span>
                </div>
                <div className="bubble in">Perfect, ping me the zip</div>

                <div className="export-panel">
                  <div className="ep-head">WA Rich Export<span className="ep-dot"></span></div>
                  <div className="ep-body">
                    <div className="ep-chat">
                      <div className="ep-avatar">D</div>
                      <div>
                        <div className="ep-chat-name">Design Team</div>
                        <div className="ep-chat-sub">~842 msgs loaded</div>
                      </div>
                    </div>
                    <div className="ep-steps">
                      <div className="ep-step done s1"><i></i><span>Load</span></div>
                      <div className="ep-step done s2"><i></i><span>Structure</span></div>
                      <div className="ep-step active s3"><i></i><span>Media</span></div>
                      <div className="ep-step s4"><i></i><span>Package</span></div>
                    </div>
                    <div className="ep-bar-wrap"><div className="ep-bar"></div></div>
                    <div className="ep-status">Downloading media… 128/240</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="what-you-get">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">What comes back in the .zip</span>
            <h2>Not a text dump. A chat, still looking like one.</h2>
            <p>Every message type WhatsApp Web can show you is preserved in the archive, formatted the way it appeared on screen.</p>
          </div>
          <div className="card-grid">
            <article className="card reveal">
              <span className="card-tag">Formatting</span>
              <h3>Bold, italic, code, links</h3>
              <p>WhatsApp&rsquo;s own markdown — *bold*, _italic_, ~strike~, `code` — plus auto-linked URLs and emails, rendered as real HTML, not asterisks.</p>
            </article>
            <article className="card reveal">
              <span className="card-tag">Replies</span>
              <h3>Quoted replies that jump to source</h3>
              <p>Every reply keeps its quote bar. Click one in the archive and it scrolls straight to the original message and highlights it.</p>
            </article>
            <article className="card reveal">
              <span className="card-tag">Media</span>
              <h3>Stickers, photos, docs, voice notes</h3>
              <p>Downloaded through WhatsApp&rsquo;s own media pipeline and saved next to the archive — images inline, documents as cards, voice notes as playable audio.</p>
            </article>
            <article className="card reveal">
              <span className="card-tag">Groups</span>
              <h3>Senders, mentions, and forwards</h3>
              <p>Group exports label who sent what, render @mentions as chips, and flag forwarded messages — same as the WhatsApp Web UI.</p>
            </article>
            <article className="card reveal">
              <span className="card-tag">Theme sync</span>
              <h3>Matches WhatsApp Web&rsquo;s own theme</h3>
              <p>The export panel follows WhatsApp Web&rsquo;s light or dark mode live, and the archive itself renders as a WhatsApp-style HTML page you open with a double-click.</p>
            </article>
            <article className="card reveal">
              <span className="card-tag">History depth</span>
              <h3>You choose how far back</h3>
              <p>Last 1,000 messages for a quick save, 5,000 for a fuller thread, or everything this WhatsApp Web session has already synced — your call, every export.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="how-it-works">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">How the export actually happens</span>
            <h2>The same four steps you&rsquo;d see in the panel.</h2>
            <p>No screen-scraping. The extension talks to WhatsApp Web&rsquo;s own in-page data layer, in this order, every time.</p>
          </div>
          <div className="ledger">
            <div className="ledger-row reveal">
              <div className="ledger-num">01</div>
              <div>
                <h3>Read from WhatsApp&rsquo;s own Store</h3>
                <p>A script runs inside the WhatsApp Web page itself and reads the open chat straight out of WhatsApp&rsquo;s internal <code>WAWebCollections</code> module — the same decrypted data the page already has in memory.</p>
              </div>
            </div>
            <div className="ledger-row reveal">
              <div className="ledger-num">02</div>
              <div>
                <h3>Structure the timeline</h3>
                <p>Messages, replies, mentions and forwards are normalized into one ordered JSON timeline before anything gets rendered.</p>
              </div>
            </div>
            <div className="ledger-row reveal">
              <div className="ledger-num">03</div>
              <div>
                <h3>Fetch the media</h3>
                <p>Stickers, images, documents and voice notes are pulled through WhatsApp&rsquo;s own <code>downloadMedia</code> path — best-effort, since only cached, decryptable media can be recovered.</p>
              </div>
            </div>
            <div className="ledger-row reveal">
              <div className="ledger-num">04</div>
              <div>
                <h3>Package the archive</h3>
                <p>Everything is written into <code>index.html</code>, <code>styles.css</code>, <code>chat.json</code> and a <code>media/</code> folder, then zipped and handed to your browser&rsquo;s normal download flow.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="privacy-strip">
        <div className="container">
          <div className="callout reveal">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <div>
              <h3>Nothing you export ever leaves your machine.</h3>
              <p>The extension asks for exactly one host permission — <code className="inline-code">web.whatsapp.com</code> — and makes no network requests of its own. Read the full <Link href="/privacy">privacy policy</Link>.</p>
            </div>
          </div>

          <div className="stat-strip mt-lg reveal">
            <div className="stat"><b>1</b><span>host permission requested</span></div>
            <div className="stat"><b>0</b><span>analytics or tracking scripts</span></div>
            <div className="stat"><b>0</b><span>servers involved in an export</span></div>
            <div className="stat"><b>4</b><span>media types recovered inline</span></div>
          </div>
        </div>
      </section>

      <section id="cta">
        <div className="container center" style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
          <h2 className="reveal">Your chats are already on your screen. Keep them properly.</h2>
          <p className="reveal lede">Load it in under a minute — no store account needed while it&rsquo;s in review.</p>
          <div className="hero-ctas reveal">
            <Link className="btn btn-primary" href="/install">Read the install guide</Link>
            <Link className="btn btn-ghost" href="/features">Explore every feature</Link>
          </div>
        </div>
      </section>

    </main>
  );
}
