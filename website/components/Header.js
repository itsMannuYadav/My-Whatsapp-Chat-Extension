'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/install', label: 'Install' },
  { href: '/faq', label: 'FAQ' },
  { href: '/privacy', label: 'Privacy' },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className={`site-header${open ? ' nav-open' : ''}`}>
      <div className="container nav">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true"></span>WA Rich Export
        </Link>
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <Link className="btn btn-primary btn-sm" href="/install">
            Get started
          </Link>
          <button
            className="nav-toggle"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg className="icon-open" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <svg className="icon-close" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
