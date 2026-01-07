import type { Cart } from "@nimara/domain/objects/Cart";
import type { User } from "@nimara/domain/objects/User";
import type { ServiceRegistry } from "@nimara/infrastructure/types";

export interface CartProviderData {
    cart: Cart;
    region: ServiceRegistry["region"];
    user: User | null;
}

export interface CartProviderProps {
    render: (data: CartProviderData) => React.ReactNode;
    emptyCartRender: () => React.ReactNode;
    services: ServiceRegistry;
    checkoutId: string | null;
    accessToken: string | null;
}

export const CartProvider = async ({
    render,
    emptyCartRender,
    services,
    checkoutId,
    accessToken,
}: CartProviderProps) => {
    if (!checkoutId) {
        services.logger.debug("No checkoutId cookie. Rendering empty cart.");

        return <>{emptyCartRender()}</>;
    }

    const resultCartGet = await services.cart.cartGet({
        cartId: checkoutId,
        languageCode: services.region.language.code,
        countryCode: services.region.market.countryCode,
        options: {
            next: { revalidate: services.config.cacheTTL.cart, tags: [`CHECKOUT:${checkoutId}`] },
        },
    });

    if (!resultCartGet.ok) {
        services.logger.error("Failed to fetch cart", {
            error: resultCartGet.errors,
        });

        return <>{emptyCartRender()}</>;
    }

    if (!resultCartGet.data.lines.length) {
        services.logger.error("Rendering empty Cart due to errors.", {
            error: resultCartGet.errors,
            checkoutId,
        });

        return <>{emptyCartRender()}</>;
    }

    const resultUserGet = accessToken
        ? await services.user.userGet(accessToken)
        : { ok: false as const, errors: [], data: null };

    const user = resultUserGet.ok ? resultUserGet.data : null;

    return (
        <>
            {render({
                cart: resultCartGet.data,
                user,
                region: services.region,
            })}
        </>
    );
};

