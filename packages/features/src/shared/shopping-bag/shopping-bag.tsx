"use client";

import { createContext, useContext, type PropsWithChildren } from "react";

import { Discount } from "./components/discount";
import {
    DiscountCode,
    type DiscountCodeActions,
} from "./components/discount-code/discount-code";
import { Header } from "./components/header";
import { Lines } from "./components/lines";
import { Pricing } from "./components/pricing";
import { Shipping } from "./components/shipping";
import { Subtotal } from "./components/subtotal";
import { Total } from "./components/total";

const DiscountCodeActionsContext = createContext<DiscountCodeActions | null>(
    null,
);

export const useDiscountCodeActions = () => {
    return useContext(DiscountCodeActionsContext);
};

export interface ShoppingBagProps extends PropsWithChildren {
    discountCodeActions?: DiscountCodeActions;
}

export const ShoppingBag = ({
    children,
    discountCodeActions,
}: ShoppingBagProps) => {
    return (
        <DiscountCodeActionsContext.Provider value={discountCodeActions ?? null}>
            <div className="flex w-full flex-col">{children}</div>
        </DiscountCodeActionsContext.Provider>
    );
};

ShoppingBag.Lines = Lines;
ShoppingBag.Header = Header;
ShoppingBag.Subtotal = Subtotal;
ShoppingBag.Pricing = Pricing;
ShoppingBag.Total = Total;
ShoppingBag.Shipping = Shipping;
ShoppingBag.DiscountCode = DiscountCode;
ShoppingBag.Discount = Discount;

