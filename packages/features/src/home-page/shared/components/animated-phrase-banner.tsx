"use client";

import { useEffect, useState } from "react";

const ANIMATED_PHRASES = [
  "open-source storefront",
  "built on Next.js & Saleor",
  "architected to scale",
] as const;

export const AnimatedPhraseBanner = () => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setPhraseIndex((i) => (i + 1) % ANIMATED_PHRASES.length);
        setVisible(true);
      }, 350);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-border mb-14 flex items-center">
      <div className="flex w-full flex-col gap-1 pr-8 pb-8 sm:flex-row sm:items-center sm:gap-2 sm:px-8 sm:py-0">
        <p className="text-muted-foreground mt-8 ml-8 shrink-0 text-2xl leading-none font-normal sm:mt-0 sm:ml-0 sm:whitespace-nowrap">
          Nimara is
        </p>
        <div className="relative w-full overflow-hidden sm:min-w-0 sm:flex-1">
          <p
            className="text-foreground ml-8 text-2xl leading-none font-normal transition-all duration-300 sm:my-8 sm:ml-0"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(-8px)",
            }}
          >
            {ANIMATED_PHRASES[phraseIndex]}
          </p>
        </div>
      </div>
    </div>
  );
};
