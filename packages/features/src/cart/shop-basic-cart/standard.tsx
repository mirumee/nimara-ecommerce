import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { ShoppingBagSkeleton } from "@nimara/features/shared/shopping-bag/shopping-bag-skeleton";

import { CartDetails } from "../shared/components/cart-details";
import { EmptyCart } from "../shared/components/empty-cart";
import { CartProvider } from "../shared/providers/cart-provider";
import { type CartViewProps } from "../shared/types";

/**
 * Standard view for the cart page.
 * @param props - The properties for the cart view.
 * @returns A React component rendering the standard cart page.
 */
export const StandardCartView = async (props: CartViewProps) => {
  const {
    services,
    checkoutId,
    accessToken,
    paths,
    onCartUpdate,
    onLineQuantityChange,
    onLineDelete,
  } = props;

  return (
    <div className="mx-auto flex justify-center">
      <div className="max-w-[616px] flex-1 basis-full py-8">
        <Suspense fallback={<ShoppingBagSkeleton hasHeader />}>
          <CartProvider
            services={services}
            checkoutId={checkoutId}
            accessToken={accessToken}
            emptyCartRender={() => <EmptyCart paths={{ home: paths.home }} />}
            render={({ cart, user }) => (
              <CartDetails
                cart={cart}
                user={user}
                onLineQuantityChange={onLineQuantityChange}
                onLineDelete={onLineDelete}
                onCartUpdate={onCartUpdate}
                paths={{
                  checkout: paths.checkout,
                  checkoutSignIn: paths.checkoutSignIn,
                }}
              />
            )}
          />
        </Suspense>
      </div>
    </div>
  );
};

/**
 * Generates metadata for the cart page.
 * @param props - The properties for generating metadata.
 * @returns Metadata object containing title for the cart page.
 */
export async function generateStandardCartMetadata(
  _props: Pick<CartViewProps, "params" | "searchParams">,
): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: t("cart.your-bag"),
  };
}
