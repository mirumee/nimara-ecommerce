import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { ShoppingBagSkeleton } from "@/components/shopping-bag";
import { COOKIE_KEY } from "@/config";

import { Cart } from "./components/cart";
import { EmptyCart } from "./components/empty-cart";

export async function generateMetadata() {
  const t = await getTranslations();

  return {
    title: t("cart.your-bag"),
  };
}

export default async function Page() {
  const checkoutId = (await cookies()).get(COOKIE_KEY.checkoutId)?.value;

  return (
    <div className="mx-auto flex justify-center">
      <div className="max-w-[616px] flex-1 basis-full py-8">
        {checkoutId ? (
          <Suspense fallback={<ShoppingBagSkeleton hasHeader />}>
            <Cart checkoutId={checkoutId} />
          </Suspense>
        ) : (
          <EmptyCart />
        )}
      </div>
    </div>
  );
}
