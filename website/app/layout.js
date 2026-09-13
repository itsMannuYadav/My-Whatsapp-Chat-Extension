import { Fraunces, Work_Sans, JetBrains_Mono } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-fraunces',
  display: 'swap',
});

const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-work-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'WA Rich Export',
    template: '%s - WA Rich Export',
  },
  description:
    'A Chrome & Edge extension that exports your open WhatsApp Web chat - replies, stickers, images, documents and voice notes - into an offline, WhatsApp-styled archive. No server, no upload.',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`no-js ${fraunces.variable} ${workSans.variable} ${jetbrainsMono.variable}`}
      // The inline script below strips "no-js" before React hydrates, by design —
      // this tells React that specific, expected mismatch is fine to skip over.
      suppressHydrationWarning
    >
      <body>
        {/* Runs before paint: drops no-js so real browsers get the scroll-reveal
            animation, while anyone without JS keeps content visible via the
            .no-js CSS fallback in globals.css instead of stuck at opacity:0. */}
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.remove('no-js')" }}
        />
        <a className="skip-link" href="#main">Skip to content</a>
        <Header />
        {children}
        <Footer />
        <ScrollReveal />
      </body>
    </html>
  );
}
