import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { ShoppingBagSkeleton } from "@/components/shopping-bag";
import { getCheckoutId } from "@/lib/actions/cart";

import { Cart } from "./components/cart";
import { EmptyCart } from "./components/empty-cart";

export async function generateMetadata() {
  const t = await getTranslations();

  return {
    title: t("cart.your-bag"),
  };
}

export default async function Page() {
  const checkoutId = await getCheckoutId();

  return (
    <div className="mx-auto flex justify-center">
      <div className="max-w-[616px] flex-1 basis-full py-8">
        <Suspense fallback={<ShoppingBagSkeleton hasHeader />}>
          {checkoutId ? <Cart checkoutId={checkoutId} /> : <EmptyCart />}
        </Suspense>
      </div>
    </div>
  );
}
