import {
  type CheckoutCreateRequest,
  type CheckoutResponse,
  type CheckoutUpdateRequest,
  type CompleteCheckoutRequestWithAp2,
} from "@ucp-js/sdk";

import { type AsyncResult } from "@nimara/domain/objects/Result";

export type UCPService = {
  /**
   * Cancels a checkout session.
   * @link https://ucp.dev/latest/specification/checkout/#cancel-checkout
   * @param input - The input data for the cancel checkout session.
   * @returns The result of the checkout session.
   */
  cancelCheckout: (input: { id: string }) => AsyncResult<CheckoutResponse>;
  /**
   * Completes a checkout session.
   * @param input - The input data for the complete checkout session.
   * @link https://ucp.dev/latest/specification/checkout/#complete-checkout
   * @returns The result of the checkout session.
   */
  completeCheckoutSession: (
    input: CompleteCheckoutRequestWithAp2,
  ) => AsyncResult<CheckoutResponse>;
  /**
   * Creates a checkout session.
   * @link https://ucp.dev/latest/specification/checkout/#create-checkout
   * @param input - The input data for the create checkout session.
   * @returns The result of the checkout session.
   */
  createCheckoutSession: (
    input: CheckoutCreateRequest,
  ) => AsyncResult<CheckoutResponse>;
  /**
   * Gets a checkout session.
   * @link https://ucp.dev/latest/specification/checkout/#get-checkout
   * @param input - The input data for the get checkout session.
   * @returns The result of the checkout session.
   */
  getCheckoutSession: (input: { id: string }) => AsyncResult<CheckoutResponse>;
  /**
   * Updates a checkout session.
   * @link https://ucp.dev/latest/specification/checkout/#update-checkout
   * @param input - The input data for the update checkout session.
   * @returns The result of the checkout session.
   */
  updateCheckoutSession: (
    input: CheckoutUpdateRequest,
  ) => AsyncResult<CheckoutResponse>;
};
