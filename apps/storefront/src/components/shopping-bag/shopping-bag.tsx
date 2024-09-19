import { type PropsWithChildren } from "react";

import { Discount } from "./components/discount";
import { DiscountCode } from "./components/discount-code/discount-code";
import { Header } from "./components/header";
import { Lines } from "./components/lines";
import { Pricing } from "./components/pricing";
import { Shipping } from "./components/shipping";
import { Subtotal } from "./components/subtotal";
import { Total } from "./components/total";

export const ShoppingBag = ({ children }: PropsWithChildren) => {
  return <div className="flex w-full flex-col">{children}</div>;
};

ShoppingBag.Lines = Lines;
ShoppingBag.Header = Header;
ShoppingBag.Subtotal = Subtotal;
ShoppingBag.Pricing = Pricing;
ShoppingBag.Total = Total;
ShoppingBag.Shipping = Shipping;
ShoppingBag.DiscountCode = DiscountCode;
ShoppingBag.Discount = Discount;
