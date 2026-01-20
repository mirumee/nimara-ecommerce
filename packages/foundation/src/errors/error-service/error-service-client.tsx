"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

type Props = {
  user: Sentry.User | null;
};

export const ErrorServiceClient = ({ user }: Props) => {
  useEffect(() => {
    // Add or remove the user from Sentry context
    Sentry.setUser(user);
  }, [user]);

  return null;
};
