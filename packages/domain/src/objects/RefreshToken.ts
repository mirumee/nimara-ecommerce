import { type BaseError } from "./Error";


// TODO this is not used anywhere, we should remove it
export interface RefreshToken {
  errors: BaseError[];
  token: string | null;
}
