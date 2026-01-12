import { type PropsWithChildren } from "react";

// TODO this is weird component with this name, it suggest something else to me
export const Pricing = ({ children }: PropsWithChildren) => (
  <div className="flex flex-col gap-2 py-4">{children}</div>
);
