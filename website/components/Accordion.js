'use client';

import { useEffect, useRef, useState } from 'react';

export default function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);
  // Tracked in React state (not via classList.add) because this element's className
  // also changes on click (is-open) — an externally-mutated class would get wiped
  // the next time React re-renders it for an unrelated reason. See ScrollReveal.js.
  // Starts false on both server and client (no window access here) so hydration
  // always matches; when reduced-motion is on, globals.css already shows .reveal
  // at full opacity regardless of this class, so no branching is needed here.
  const [visible, setVisible] = useState(() => items.map(() => false));
  const nodeRefs = useRef([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = Number(entry.target.dataset.index);
          setVisible((prev) => {
            if (prev[idx]) return prev;
            const next = prev.slice();
            next[idx] = true;
            return next;
          });
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    nodeRefs.current.forEach((node) => node && io.observe(node));
    return () => io.disconnect();
  }, []);

  return (
    <div className="faq-list">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        const className = [
          'faq-item',
          'reveal',
          visible[i] && 'is-visible',
          isOpen && 'is-open',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <div
            className={className}
            key={item.q}
            ref={(node) => {
              nodeRefs.current[i] = node;
            }}
            data-index={i}
            data-self-managed="true"
            style={{ '--i': i }}
          >
            <h3>
              <button
                className="faq-summary"
                id={`faq-trigger-${i}`}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                onClick={() => setOpenIndex(isOpen ? null : i)}
              >
                <span>{item.q}</span>
                <span className="plus" aria-hidden="true"></span>
              </button>
            </h3>
            <div
              className="faq-panel"
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-trigger-${i}`}
            >
              <div className="faq-panel-inner">
                <p className="faq-a">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
