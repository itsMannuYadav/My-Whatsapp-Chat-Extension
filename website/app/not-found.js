import Link from 'next/link';

export const metadata = {
  title: 'Page not found',
};

export default function NotFound() {
  return (
    <main id="main">
      <section className="center" style={{ paddingBlock: 120, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
        <span className="eyebrow">404</span>
        <h1 style={{ fontSize: 'clamp(30px, 5vw, 48px)' }}>This chat was never synced.</h1>
        <p className="lede" style={{ maxWidth: '48ch' }}>Whatever you were looking for isn&rsquo;t at this address - same idea as history WhatsApp Web never loaded. Let&rsquo;s get you back.</p>
        <div className="hero-ctas">
          <Link className="btn btn-primary" href="/">Back to home</Link>
          <Link className="btn btn-ghost" href="/faq">Read the FAQ</Link>
        </div>
      </section>
    </main>
  );
}
