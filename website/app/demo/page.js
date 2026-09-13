import Link from 'next/link';
import DemoWalkthrough from '@/components/DemoWalkthrough';

export const metadata = {
  title: 'Demo',
  description:
    'Watch the whole WA Rich Export flow, step by step: the panel detecting your open chat, choosing a history depth, the extension processing and packaging the archive, the browser download, and the exported chat opening offline with its stickers, photos, documents and voice notes intact.',
};

const STEPS = [
  { title: 'Open the chat you want to keep', body: 'The export panel is already floating over WhatsApp Web the moment the page loads - it just has no chat to work with yet.' },
  { title: 'No second click needed', body: 'The panel polls the page itself: chat name, group badge and message count fill in on their own the instant a chat is open.' },
  { title: 'Choose how far back, then export', body: 'Last 1,000 messages for a quick save, 5,000 for a fuller thread, or everything this session has already synced - a real dropdown, then Export chat.' },
  { title: 'It reads, structures, fetches media, and packages', body: 'The extension reads the open chat out of WhatsApp’s own in-page Store, normalizes it into one timeline, pulls cached media, then writes and zips the archive.' },
  { title: 'Your browser downloads the archive', body: 'The finished .zip comes down through the browser’s own download flow, the same one every other download uses, the moment the panel reports success.' },
  { title: 'Open the folder it saved to', body: 'Unzipped, it’s four plain files: index.html, styles.css, chat.json and a media/ folder - nothing proprietary and nothing that needs the extension again.' },
  { title: 'Everything comes back the way it looked', body: 'Text formatting, a reply that jumps to its source, sender labels, a mention, a forward, a sticker, a photo, a document and a voice note - all rendered offline.' },
];

export default function DemoPage() {
  return (
    <main id="main">

      <section style={{ paddingBottom: 8 }}>
        <div className="container page-intro">
          <span className="eyebrow reveal">See it in action</span>
          <h1 className="reveal h1-page">Watch an export happen, start to finish.</h1>
          <p className="reveal lede">A scripted, pixel-matched walkthrough of the real sequence - the export panel&rsquo;s own colors and copy, WhatsApp Web&rsquo;s own layout, and the archive&rsquo;s own styling. Use the controls to pause, step back, or jump straight to any stage.</p>
        </div>
      </section>

      <section style={{ paddingTop: 24 }}>
        <div className="container reveal">
          <DemoWalkthrough />
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Same seven steps, in writing</span>
            <h2>If you&rsquo;d rather read it than watch it</h2>
            <p>Nothing in the animation above is invented for the demo - this is the same order of operations the extension itself follows every time.</p>
          </div>
          <div className="ledger">
            {STEPS.map((step, i) => (
              <div className="ledger-row reveal" key={step.title}>
                <div className="ledger-num">{String(i + 1).padStart(2, '0')}</div>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cta">
        <div className="container center" style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
          <h2 className="reveal">Ready to try it on a chat of your own?</h2>
          <div className="hero-ctas reveal">
            <Link className="btn btn-primary" href="/install">Install in a minute</Link>
            <Link className="btn btn-ghost" href="/features">Explore every feature</Link>
          </div>
        </div>
      </section>

    </main>
  );
}
