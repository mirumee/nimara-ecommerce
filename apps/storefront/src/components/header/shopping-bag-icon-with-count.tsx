import { unstable_noStore } from "next/cache";

import { ShoppingBagIcon } from "./shopping-bag-icon";

export const ShoppingBagIconWithCount = ({ count }: { count: number }) => {
  unstable_noStore();

  return (
    <ShoppingBagIcon count={count}>
      {count > 0 && (
        <p
          className={`absolute -top-1 ${
            count > 99 ? "-right-4 px-2" : "-right-0 w-5"
          } flex h-5 items-center justify-center rounded-full bg-red-600 text-xs text-white`}
        >
          {count}
        </p>
      )}
    </ShoppingBagIcon>
  );
};
