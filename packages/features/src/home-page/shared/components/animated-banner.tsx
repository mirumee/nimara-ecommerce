"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const phases = [
  {
    id: 0,
    sentence:
      "architected to scale from a single brand to a multi-vendor platform",
    duration: 3850,
  },
  {
    id: 1,
    sentence: "the open-source storefront built on Next.js and Saleor",
    duration: 3150,
  },
  {
    id: 2,
    sentence: "fast, composable, and engineered to grow with your business",
    duration: 3150,
  },
];

export const AnimatedBanner = () => {
  const [index, setIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 720px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % phases.length);
    }, phases[index].duration);
    return () => clearTimeout(timer);
  }, [index]);

  const initial = isDesktop ? { y: -10, opacity: 0 } : { x: -10, opacity: 0 };
  const animate = isDesktop ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 };
  const exit = isDesktop ? { y: 10, opacity: 0 } : { x: 10, opacity: 0 };

  return (
    <div className="mb-12 flex items-center bg-border">
      {/*
        Padding lives on the outer wrapper only on the sides that don't clip the animation.
        Desktop (y-animation ±10px): keep left/right on outer, move top/bottom to motion.p margins.
        Mobile (x-animation ±10px): keep right/bottom on outer, move top/left to respective margins.
      */}
      <div className="flex w-full max-w-[1024px] flex-col gap-1 pb-8 pr-8 sm:flex-row sm:items-center sm:gap-2 sm:px-8 sm:py-0">
        <p className="ml-8 mt-8 shrink-0 text-2xl font-normal leading-none text-muted-foreground sm:ml-0 sm:mt-0 sm:whitespace-nowrap">
          Nimara is
        </p>
        <div className="relative w-full overflow-hidden sm:min-w-0 sm:flex-1">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={initial}
              animate={animate}
              exit={exit}
              transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
              className="ml-8 text-2xl font-normal leading-none text-foreground sm:ml-0 sm:my-8"
            >
              {phases[index].sentence}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
