import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-about">
            <Link className="brand" href="/">
              <span className="brand-mark" aria-hidden="true"></span>WA Rich Export
            </Link>
            <p style={{ marginTop: 14 }}>
              Turns the WhatsApp Web chat you have open into an offline, WhatsApp-styled archive -
              replies and media included. Runs entirely on your machine.
            </p>
          </div>
          <div>
            <h4>Product</h4>
            <ul>
              <li><Link href="/features">Features</Link></li>
              <li><Link href="/install">Install guide</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4>Legal</h4>
            <ul>
              <li><Link href="/privacy">Privacy policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>Independent project - not affiliated with WhatsApp or Meta.</span>
          <span>WhatsApp is a trademark of WhatsApp LLC.</span>
        </div>
      </div>
    </footer>
  );
}
