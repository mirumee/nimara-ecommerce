import { type AccountError } from "./Error";
import { type Metadata } from "./Metadata";

export interface User {
  checkoutIds: string[];
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  metadata: Metadata;
}

export interface RefreshToken {
  errors: AccountError[];
  token: string | null;
}
