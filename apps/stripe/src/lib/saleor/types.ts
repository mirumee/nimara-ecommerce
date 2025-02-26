import type { MarkRequired } from "ts-essentials";

import { type Manifest, type PermissionEnum } from "@nimara/codegen/schema";

export type SaleorAppManifest = MarkRequired<
  Partial<Omit<Manifest, "permissions">>,
  "name" | "version" | "tokenTargetUrl" | "webhooks"
> & {
  id: string;
  permissions: PermissionEnum[];
};
