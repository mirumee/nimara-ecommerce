import {
  type CheckoutCreateRequest,
  type CheckoutResponse,
  type CheckoutUpdateRequest,
  type CompleteCheckoutRequestWithAp2,
  type Order as UcpOrder,
  type UcpDiscoveryProfile,
} from "@ucp-js/sdk";

import type { BaseError } from "@nimara/domain/objects/Error";
import { type AsyncResult } from "@nimara/domain/objects/Result";

export type UCPServiceError = BaseError & {
  ucpCode?: string;
};

export type UCPResponse<TRes> = AsyncResult<TRes, UCPServiceError>;

export type UCPService = {
  /**
   * Cancels a checkout session.
   * @link https://ucp.dev/latest/specification/checkout/#cancel-checkout
   * @param input - The input data for the cancel checkout session.
   * @returns The result of the checkout session.
   */
  cancelCheckout: (input: { id: string }) => UCPResponse<CheckoutResponse>;
  /**
   * Completes a checkout session.
   * @param input - The input data for the complete checkout session.
   * @link https://ucp.dev/latest/specification/checkout/#complete-checkout
   * @returns The result of the checkout session.
   */
  completeCheckoutSession: (
    input: CompleteCheckoutRequestWithAp2,
  ) => UCPResponse<CheckoutResponse>;
  /**
   * Creates a checkout session.
   * @link https://ucp.dev/latest/specification/checkout/#create-checkout
   * @param input - The input data for the create checkout session.
   * @returns The result of the checkout session.
   */
  createCheckoutSession: (
    input: CheckoutCreateRequest,
  ) => UCPResponse<CheckoutResponse>;
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
  getCheckoutSession: (input: { id: string }) => UCPResponse<CheckoutResponse>;
  /**
   * Gets an order.
   * @link https://ucp.dev/latest/specification/order/#get-order
   * @param input - The input data for the get order.
   * @returns The result of the order.
   */
  getOrder: (input: { id: string }) => UCPResponse<UcpOrder>;
  /**
   * Updates a checkout session.
   * @link https://ucp.dev/latest/specification/checkout/#update-checkout
   * @param input - The input data for the update checkout session.
   * @returns The result of the checkout session.
   */
  updateCheckoutSession: (
    input: CheckoutUpdateRequest,
  ) => UCPResponse<CheckoutResponse>;
};
