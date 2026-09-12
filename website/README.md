# WA Rich Export — website

The marketing site for the [WA Rich Export](../README.md) browser extension. Next.js (App Router), plain CSS design system, no other dependencies.

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

```
app/
├── layout.js          # fonts (next/font/google), <Header>/<Footer>, metadata defaults
├── globals.css         # the whole design system — tokens, components, one file
├── page.js             # home
├── features/page.js
├── install/page.js
├── faq/page.js
├── privacy/page.js     # ← the privacy policy URL the stores ask for
├── not-found.js         # custom 404
└── icon.svg              # favicon
components/
├── Header.js           # nav + mobile menu ('use client')
├── Footer.js
└── ScrollReveal.js      # IntersectionObserver fade-in for .reveal elements
```

## Build & deploy

```bash
npm run build
```

See the [root README](../README.md#website) for the full Vercel deployment and custom-domain walkthrough — root directory is `website`, everything else is zero-config.
