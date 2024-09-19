import { type PropsWithChildren } from "react";

export const Pricing = ({ children }: PropsWithChildren) => (
  <div className="flex flex-col gap-2 py-4">{children}</div>
);
