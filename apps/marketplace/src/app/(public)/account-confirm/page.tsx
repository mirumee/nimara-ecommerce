"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";

import { confirmAccount } from "./actions";

type ConfirmStatus = "loading" | "success" | "error";

export default function AccountConfirmPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [status, setStatus] = useState<ConfirmStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!email || !token) {
      setStatus("error");
      setErrorMessage(
        t("marketplace.pages.account-confirm-error-invalid-link"),
      );

      return;
    }

    const confirmAccountAction = async () => {
      try {
        const result = await confirmAccount({ email, token });

        if (!result.ok) {
          setStatus("error");
          setErrorMessage(
            result.errors[0]?.message ||
              t("marketplace.pages.account-confirm-error-generic-failed"),
          );

          return;
        }

        const payload = result.data.confirmAccount;

        if (payload?.errors?.length) {
          setStatus("error");
          setErrorMessage(
            payload.errors[0]?.message != null
              ? String(payload.errors[0].message)
              : t("account-confirm-error-generic-failed"),
          );

          return;
        }

        if (payload?.user?.isActive) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage(
            t("marketplace.pages.account-confirm-error-account-failed"),
          );
        }
      } catch (error) {
        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : t("marketplace.pages.account-confirm-error-generic"),
        );
      }
    };

    void confirmAccountAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- t is stable; avoid re-running confirm on locale change
  }, [email, token]);

  return (
    <Card className="w-full max-w-sm">
      {status === "loading" && (
        <>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <CardTitle>
              {t("marketplace.pages.account-confirm-loading-title")}
            </CardTitle>
            <CardDescription>
              {t("marketplace.pages.account-confirm-loading-description")}
            </CardDescription>
          </CardHeader>
        </>
      )}

      {status === "success" && (
        <>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle>
              {t("marketplace.pages.account-confirm-success-title")}
            </CardTitle>
            <CardDescription>
              {t("marketplace.pages.account-confirm-success-description")}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/sign-in" className="w-full">
              <Button className="w-full">
                {t("marketplace.pages.account-confirm-button-sign-in")}
              </Button>
            </Link>
          </CardFooter>
        </>
      )}

      {status === "error" && (
        <>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle>
              {t("marketplace.pages.account-confirm-error-title")}
            </CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            {t("marketplace.pages.account-confirm-error-support")}
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Link href="/sign-up" className="w-full">
              <Button variant="outline" className="w-full">
                {t("marketplace.pages.account-confirm-button-try-again")}
              </Button>
            </Link>
            <Link href="/sign-in" className="w-full">
              <Button variant="ghost" className="w-full">
                {t("marketplace.pages.account-confirm-button-back-to-sign-in")}
              </Button>
            </Link>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
