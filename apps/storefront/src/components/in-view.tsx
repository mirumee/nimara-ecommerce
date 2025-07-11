"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

type InViewAnimatorProps = {
  children: ReactNode;
  className?: string;
};

export function InViewAnimator({ children, className }: InViewAnimatorProps) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
      },
    );

    // Start observing the element
    observer.observe(element);

    // Cleanup function to disconnect the observer
    return () => observer.disconnect();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Apply a class based on the isInView state for CSS transitions
  const animationClass = isInView
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-4";

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ${animationClass}`}
    >
      {children}
    </div>
  );
}
