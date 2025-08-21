"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@nimara/ui/components/carousel";

import { cn } from "@/lib/utils";

type Props = {
  banners: Banner[];
  intervalTimeInMs: number;
};

type Banner = {
  bgColor: string;
  imageSrc?: string;
  link?: string;
  subtitle?: string;
  textColor?: string;
  title: string;
};

export const HeroCarousel = ({ banners, intervalTimeInMs = 4000 }: Props) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasMultipleBanners = banners.length > 1;

  const startInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      api?.scrollNext();
    }, intervalTimeInMs);
  }, [api, intervalTimeInMs]);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });

    startInterval();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [api, startInterval]);

  const handleManualNavigation = (action: () => void) => {
    action();
    startInterval();
  };

  return (
    <div>
      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          loop: true,
        }}
      >
        <CarouselContent>
          {banners.map((banner, index) => (
            <CarouselItem key={banner.title || index}>
              <div
                className={cn(
                  banner.bgColor,
                  banner.textColor,
                  "from-secondary-foreground grid aspect-[3/1] content-center rounded-lg bg-gradient-to-tr p-4 text-center sm:aspect-[4/1]",
                )}
              >
                <h3 className="text-lg font-semibold">{banner.title}</h3>
                <p className="text-sm">{banner.subtitle}</p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {hasMultipleBanners && (
          <>
            <CarouselPrevious
              className="left-4 opacity-20 hover:opacity-100"
              onClick={() => handleManualNavigation(() => api?.scrollPrev())}
            />
            <CarouselNext
              className="right-4 opacity-20 hover:opacity-100"
              onClick={() => handleManualNavigation(() => api?.scrollNext())}
            />
          </>
        )}
      </Carousel>

      {hasMultipleBanners && (
        <div className="mt-6 flex justify-center space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-300",
                current === index ? "bg-primary w-8" : "bg-muted-foreground/30",
              )}
              onClick={() => handleManualNavigation(() => api?.scrollTo(index))}
            />
          ))}
        </div>
      )}
    </div>
  );
};
