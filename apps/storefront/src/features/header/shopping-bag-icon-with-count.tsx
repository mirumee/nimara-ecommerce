import { connection } from "next/server";

import { ShoppingBagIcon } from "./shopping-bag-icon";

export const ShoppingBagIconWithCount = async ({
  count,
}: {
  count: number;
}) => {
  await connection();

  return (
    <ShoppingBagIcon count={count}>
      {count > 0 && (
        <p
          className={`absolute -top-1 ${
            count > 99 ? "-right-4 px-2" : "-right-0 w-5"
          } flex h-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground`}
        >
          {count}
        </p>
      )}
    </ShoppingBagIcon>
  );
};
