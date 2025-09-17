import { Suspense } from "react";

import { HeroCarousel } from "@/home/components/hero-carousel";
import {
  ProductsGridDynamic,
  ProductsGridDynamicSkeleton,
} from "@/home/components/products-grid-dynamic";
import { HomepageProvider } from "@/home/providers/homepage-provider";

export const CustomHomeView = () => {
  return (
    <HomepageProvider
      render={() => (
        <div className="flex flex-1 flex-col gap-8">
          <HeroCarousel
            banners={[
              {
                title: "Summer Sale",
                subtitle: "Don't miss out on our summer sale!",
                bgColor: "bg-blue-500",
                textColor: "text-white",
                link: "/search?q=sale", // Example link
              },
              {
                title: "New Arrivals",
                subtitle: "Check out our latest products!",
                bgColor: "bg-red-500",
                link: "/search?q=new", // Example link
                textColor: "text-white",
              },
              {
                title: "Limited Time Offer",
                subtitle: "Grab it before it's gone!",
                bgColor: "bg-green-500",
                textColor: "text-white",
              },
            ]}
            intervalTimeInMs={5000}
          />

          <Suspense fallback={<ProductsGridDynamicSkeleton />}>
            <ProductsGridDynamic />
          </Suspense>
        </div>
      )}
    />
  );
};
