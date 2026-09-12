'use client';

import { useEffect, useRef, useState } from 'react';

export default function StatCounter({ value, duration = 1100 }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const prefersMotion = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
    if (!prefersMotion) return undefined;

    let frame;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          setDisplay(0);
          const start = performance.now();
          const tick = (now) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * value));
            if (progress < 1) frame = requestAnimationFrame(tick);
          };
          frame = requestAnimationFrame(tick);
          io.unobserve(node);
        });
      },
      { threshold: 0.4 }
    );
    io.observe(node);

    return () => {
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <b ref={ref} className="tabular">
      {display}
    </b>
  );
}
