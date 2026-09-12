'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const prefersMotion = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
    // Elements that manage their own reveal state in React (e.g. Accordion, which
    // also toggles className on click) opt out via data-self-managed — otherwise
    // our classList.add here gets wiped the next time React re-renders that node.
    const reveals = document.querySelectorAll('.reveal:not([data-self-managed])');

    if (!prefersMotion || !('IntersectionObserver' in window)) {
      reveals.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    reveals.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
