import { type ComponentProps } from "react";

import { cn } from "@nimara/ui/lib/utils";

import ProductPlaceholder from "./assets/product_placeholder.svg";

type ProductImagePlaceholderProps = ComponentProps<"svg">;

export const ProductImagePlaceholder = ({
  className,
  ...props
}: ProductImagePlaceholderProps) => (
  <ProductPlaceholder className={cn("h-auto w-full", className)} {...props} />
);
