import Link from 'next/link';

export const metadata = {
  title: 'Features',
  description:
    'Every feature of WA Rich Export: formatting, jump-to reply threads, inline media, group senders and mentions, contact aliasing, live theme sync, and history depth control.',
};

export default function FeaturesPage() {
  return (
    <main id="main">

      <section style={{ paddingBottom: 24 }}>
        <div className="container page-intro">
          <span className="eyebrow reveal">Everything the archive keeps</span>
          <h1 className="reveal h1-page">A tour of what shows up in your export.</h1>
          <p className="reveal lede">Each of these is a real part of the same <code className="inline-code">index.html</code> the extension writes — not a promise, a rendering.</p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="container">

          <div className="feature-row">
            <div className="feature-copy reveal">
              <span className="card-tag">Formatting</span>
              <h2>WhatsApp&rsquo;s own markdown, rendered properly</h2>
              <p><code className="inline-code">*bold*</code>, <code className="inline-code">_italic_</code>, <code className="inline-code">~strike~</code> and <code className="inline-code">`code`</code> become real HTML, not literal asterisks. URLs and email addresses turn into clickable links automatically.</p>
              <ul>
                <li>Emoji-only messages render large, the way WhatsApp itself displays them</li>
                <li>Fenced <code className="inline-code">```code```</code> blocks keep their monospace formatting</li>
              </ul>
            </div>
            <div className="feature-visual reveal">
              <div className="mini-chat">
                <div className="bubble in">Check the <strong>final</strong> brief — it&rsquo;s in <code className="inline-code">brief_v3.pdf</code></div>
                <div className="bubble out">Got it, reviewing <em>now</em>. Ping me at ops@studio.example if it&rsquo;s urgent<span className="tick">10:12 ✓✓</span></div>
                <div className="bubble in emoji">🎉</div>
              </div>
            </div>
          </div>

          <div className="feature-row flip">
            <div className="feature-copy reveal">
              <span className="card-tag">Replies</span>
              <h2>Quoted replies that jump to their source</h2>
              <p>Every reply keeps its quote bar exactly as WhatsApp rendered it. Click a quote inside the exported archive and the page scrolls straight to the original message — even if it&rsquo;s thousands of lines up — and briefly highlights it.</p>
            </div>
            <div className="feature-visual reveal">
              <div className="mini-chat">
                <div className="bubble in">Reminder: standup moved to 9:30</div>
                <div className="bubble out">
                  <div className="quote">You: Reminder: standup moved to 9:30</div>
                  Got it, updating my calendar
                  <span className="tick">09:04 ✓✓</span>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-row">
            <div className="feature-copy reveal">
              <span className="card-tag">Media</span>
              <h2>Stickers, photos, documents and voice notes</h2>
              <p>Media is downloaded through WhatsApp&rsquo;s own decrypt path and saved into a <code className="inline-code">media/</code> folder next to the archive — images sit inline, documents become downloadable cards, voice notes become playable audio.</p>
              <ul>
                <li>Video keeps its place in the conversation as a labelled placeholder for now</li>
                <li>Only media already cached by this WhatsApp Web session can be recovered</li>
              </ul>
            </div>
            <div className="feature-visual reveal">
              <div className="mini-chat">
                <div className="bubble in emoji">🧋</div>
                <div className="bubble out">
                  <div className="doc-chip"><div className="doc-ico">PDF</div><div><div className="doc-name">Q3-report.pdf</div><div className="doc-sub">2.1 MB</div></div></div>
                  <span className="tick">14:20 ✓✓</span>
                </div>
                <div className="bubble in">
                  <div className="voice-note">
                    <span className="play"></span>
                    <span className="wave">
                      <span style={{ height: 6 }}></span><span style={{ height: 12 }}></span><span style={{ height: 5 }}></span>
                      <span style={{ height: 14 }}></span><span style={{ height: 8 }}></span><span style={{ height: 11 }}></span>
                      <span style={{ height: 5 }}></span><span style={{ height: 9 }}></span>
                    </span>
                    <span style={{ fontSize: 10.5, color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)' }}>0:14</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-row flip">
            <div className="feature-copy reveal">
              <span className="card-tag">Groups</span>
              <h2>Senders, mentions and forwards, labelled</h2>
              <p>Group exports show who sent each message, render <span className="mention-chip">@name</span> mentions as chips instead of raw phone IDs, and flag forwarded messages — matching what you&rsquo;d see live in WhatsApp Web.</p>
            </div>
            <div className="feature-visual reveal">
              <div className="mini-chat">
                <div className="sender-label">Vishal</div>
                <div className="bubble in">Looping in <span className="mention-chip">@Sundarbans</span> on this one</div>
                <div className="bubble in" style={{ marginTop: 6 }}>
                  <div className="fwd-label">↪ Forwarded</div>
                  Here&rsquo;s the finalized brand kit
                </div>
              </div>
            </div>
          </div>

          <div className="feature-row">
            <div className="feature-copy reveal">
              <span className="card-tag">Contact aliasing</span>
              <h2>Recognize people, without editing the file</h2>
              <p>Every archive ends with a small &ldquo;Recognize people&rdquo; panel. Match a saved contact to a phone number and rename it for your own reading — the change applies only in your open browser tab. The archive file on disk always keeps its original names.</p>
            </div>
            <div className="feature-visual reveal">
              <div className="mini-chat">
                <div className="alias-mock">
                  <div className="alias-row"><span className="alias-from">Exported as &ldquo;Ojha ji&rdquo;</span><span className="arrow">→</span><span className="alias-to">Ojha ji (Uncle)</span></div>
                  <div className="alias-row"><span className="alias-from">Exported as &ldquo;+91 98••• •••2&rdquo;</span><span className="arrow">→</span><span className="alias-to">Delivery bot</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-row flip">
            <div className="feature-copy reveal">
              <span className="card-tag">Theme sync</span>
              <h2>Follows WhatsApp Web&rsquo;s own theme, live</h2>
              <p>Toggle WhatsApp Web between light and dark and the export panel switches with it immediately — no separate setting to hunt for, no jarring mismatch floating over your chat.</p>
            </div>
            <div className="feature-visual reveal">
              <div className="mini-chat">
                <div className="theme-toggle-mock">
                  <div className="swatch dark"><div className="bar"></div><div className="bar short"></div><div className="label">Dark</div></div>
                  <div className="swatch light"><div className="bar"></div><div className="bar short"></div><div className="label">Light</div></div>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-row">
            <div className="feature-copy reveal">
              <span className="card-tag">History depth</span>
              <h2>You decide how far back it goes</h2>
              <p>Pick the last 1,000 messages for a quick save, 5,000 for a fuller thread, or everything this WhatsApp Web session has already synced. Only messages already loaded here are ever available — older history that lives solely on your phone can&rsquo;t be reached.</p>
            </div>
            <div className="feature-visual reveal">
              <div className="mini-chat">
                <div className="segmented">
                  <span className="active">1,000</span>
                  <span>5,000</span>
                  <span>All synced</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Said plainly</span>
            <h2>What it doesn&rsquo;t do — yet</h2>
            <p>A short, honest list, so there are no surprises after you export.</p>
          </div>
          <div className="card-grid">
            <article className="card reveal">
              <span className="card-tag">Video</span>
              <h3>Kept as a placeholder</h3>
              <p>Video messages stay in their exact spot in the conversation but download as a labelled placeholder rather than a playable file, for now.</p>
            </article>
            <article className="card reveal">
              <span className="card-tag">History</span>
              <h3>Synced messages only</h3>
              <p>WhatsApp Web only ever holds what it has synced from your phone. If a message never loaded here, the extension can&rsquo;t retrieve it either.</p>
            </article>
            <article className="card reveal">
              <span className="card-tag">Media recovery</span>
              <h3>Best-effort by design</h3>
              <p>If WhatsApp hasn&rsquo;t cached decryptable bytes for a file, that message keeps a typed placeholder instead of a broken link.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="cta">
        <div className="container center" style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
          <h2 className="reveal">Ready to try it on a real chat?</h2>
          <div className="hero-ctas reveal">
            <Link className="btn btn-primary" href="/install">Install in a minute</Link>
            <Link className="btn btn-ghost" href="/faq">Read the FAQ</Link>
          </div>
        </div>
      </section>

    </main>
  );
}
