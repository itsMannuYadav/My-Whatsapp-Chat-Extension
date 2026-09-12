import Link from 'next/link';
import Accordion from '@/components/Accordion';

export const metadata = {
  title: 'FAQ',
  description:
    'Answers about how WA Rich Export handles groups, video, history limits, privacy, and contact renaming.',
};

const ITEMS = [
  {
    q: 'Does this work on group chats, not just DMs?',
    a: (
      <>Yes. Group exports label each message with its sender&rsquo;s name, render @mentions as chips, and flag forwarded messages — all of that is DM-only content otherwise, since a one-to-one chat has no sender labels to show.</>
    ),
  },
  {
    q: 'Will a WhatsApp Web update break this?',
    a: (
      <>It&rsquo;s possible. The extension reads WhatsApp&rsquo;s internal <code className="inline-code">WAWeb*</code> modules by name, and WhatsApp occasionally renames or restructures them. The injector uses defensive fallbacks across a few known module shapes, but a large WhatsApp Web release can still require an update on this end.</>
    ),
  },
  {
    q: 'Does WA Rich Export send my messages anywhere?',
    a: (
      <>No. The extension makes no network requests of its own. It only reads data already decrypted in your browser&rsquo;s memory and calls WhatsApp Web&rsquo;s own media-download functions — the same ones the page already uses when you view an image or play a voice note yourself.</>
    ),
  },
  {
    q: 'Can it export video messages?',
    a: (
      <>Not yet as playable video. A video message keeps its exact place in the conversation but comes through as a labelled placeholder rather than a downloaded file, for now.</>
    ),
  },
  {
    q: 'How far back in history can I go?',
    a: (
      <>Only as far as WhatsApp Web has already synced to this session — older messages that live solely on your phone aren&rsquo;t reachable from the browser tab. Within that, you choose the last 1,000 messages, the last 5,000, or everything currently synced.</>
    ),
  },
  {
    q: 'Is this affiliated with WhatsApp or Meta?',
    a: (
      <>No. WA Rich Export is an independent, unofficial project. WhatsApp is a trademark of WhatsApp LLC, and this extension is not endorsed by or associated with WhatsApp or Meta.</>
    ),
  },
  {
    q: 'Where does the exported file go?',
    a: (
      <>Wherever your browser normally saves downloads. The export finishes as a single <code className="inline-code">.zip</code> — unzip it and open <code className="inline-code">index.html</code> in any browser, any time, with no internet connection or extension required to read it later.</>
    ),
  },
  {
    q: 'Can I rename people in an exported chat?',
    a: (
      <>Yes — every archive ends with a &ldquo;Recognize people&rdquo; panel where you can rename a contact for your own reading. It only changes what you see in that open browser tab; the archive file on disk keeps its original names, and a page refresh reverts to them.</>
    ),
  },
  {
    q: 'Do I need to keep the tab open while it exports?',
    a: (
      <>Yes. The export runs inside your live WhatsApp Web tab, so keep it open and on the same chat until the download finishes — closing it or navigating away mid-export cancels the job.</>
    ),
  },
  {
    q: 'The panel didn’t show up — what now?',
    a: (
      <>Confirm the extension is enabled on its extensions page, then reload the <code className="inline-code">web.whatsapp.com</code> tab. The panel only injects on that domain and appears once a chat is open.</>
    ),
  },
];

export default function FaqPage() {
  return (
    <main id="main">

      <section style={{ paddingBottom: 16 }}>
        <div className="container page-intro">
          <span className="eyebrow reveal">Questions, answered plainly</span>
          <h1 className="reveal h1-page">Frequently asked questions</h1>
          <p className="reveal lede">If something&rsquo;s missing here, the <Link href="/privacy" className="link-accent">privacy policy</Link> covers data handling in more depth.</p>
        </div>
      </section>

      <section style={{ paddingTop: 8 }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <Accordion items={ITEMS} />
        </div>
      </section>

      <section id="cta">
        <div className="container center" style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
          <h2 className="reveal">Still have a question?</h2>
          <p className="reveal lede">Check the full privacy policy, or dig into exactly what the extension exports.</p>
          <div className="hero-ctas reveal">
            <Link className="btn btn-primary" href="/privacy">Read the privacy policy</Link>
            <Link className="btn btn-ghost" href="/features">Browse all features</Link>
          </div>
        </div>
      </section>

    </main>
  );
}
