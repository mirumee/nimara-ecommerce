import { type BaseError } from "./Error";

export interface RefreshToken {
  errors: BaseError[];
  token: string | null;
}
