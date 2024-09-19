import { type User as SaleorUser } from "@nimara/domain/objects/User";

declare module "next-auth" {
  interface Session {
    user: SaleorUser;
  }
}
