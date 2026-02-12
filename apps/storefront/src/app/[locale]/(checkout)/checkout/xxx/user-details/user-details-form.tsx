"use client";

import type { Checkout } from "@nimara/domain/objects/Checkout";

import { UserDetailsForm as FoundationUserDetailsForm } from "@/foundation/checkout/sections/user-details/form";
import { paths } from "@/foundation/routing/paths";
import { useRouterWithState } from "@/foundation/use-router-with-state";

interface Props {
  checkout: Checkout;
}

export const UserDetailsForm = ({ checkout }: Props) => {
  const { push } = useRouterWithState();

  const handleComplete = () => {
    const nextStep = checkout.isShippingRequired
      ? "shipping-address"
      : "payment";

    push(
      paths.checkout.asPath({
        query: { step: nextStep },
      }),
    );
  };

  return (
    <FoundationUserDetailsForm
      checkout={checkout}
      user={null}
      onComplete={handleComplete}
    />
  );
};
