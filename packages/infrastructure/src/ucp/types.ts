import {
  type CheckoutCreateRequest,
  type CheckoutResponse,
  type CheckoutUpdateRequest,
  type CompleteCheckoutRequestWithAp2,
  type UcpDiscoveryProfile,
} from "@ucp-js/sdk";

import { type AsyncResult } from "@nimara/domain/objects/Result";

import { type ErrorResponse } from "./error";

export type UCPResponse<TRes> = Promise<
  | { data: never; error: ErrorResponse; ok: false }
  | { data: TRes; errors?: never; ok: true }
>;

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
   * Gets the discovery profile.
   * @link https://ucp.dev/latest/specification/overview/#discovery-governance-and-negotiation
   * @returns The discovery profile.
   */
  discoveryProfile: () => UcpDiscoveryProfile;
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
