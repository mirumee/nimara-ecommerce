import { type AccountError } from "./Error";

export interface RefreshToken {
  errors: AccountError[];
  token: string | null;
}
