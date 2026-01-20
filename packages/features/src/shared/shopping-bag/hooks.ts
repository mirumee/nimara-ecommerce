import { createContext, useContext } from "react";

import { type DiscountCodeActions } from "./types";

export const DiscountCodeActionsContext =
  createContext<DiscountCodeActions | null>(null);

export const useDiscountCodeActions = () => {
  return useContext(DiscountCodeActionsContext);
};
