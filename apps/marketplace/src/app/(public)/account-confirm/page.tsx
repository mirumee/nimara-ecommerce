"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [status, setStatus] = useState<ConfirmStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!email || !token) {
      setStatus("error");
      setErrorMessage("Invalid confirmation link. Please request a new one.");

      return;
    }

    const confirmAccountAction = async () => {
      try {
        const result = await confirmAccount({ email, token });

        if (!result.ok) {
          setStatus("error");
          setErrorMessage(
            result.errors[0]?.message || "Confirmation failed"
          );

          return;
        }

        const payload = result.data.confirmAccount;

        if (payload?.errors?.length) {
          setStatus("error");
          setErrorMessage(
            payload.errors[0]?.message != null
              ? String(payload.errors[0].message)
              : "Confirmation failed"
          );

          return;
        }

        if (payload?.user?.isActive) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage("Account confirmation failed. Please try again.");
        }
      } catch (error) {
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "An unexpected error occurred."
        );
      }
    };

    void confirmAccountAction();
  }, [email, token]);

  return (
    <Card className="w-full max-w-sm">
      {status === "loading" && (
        <>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <CardTitle>Confirming your account</CardTitle>
            <CardDescription>
              Please wait while we verify your email address...
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
            <CardTitle>Account confirmed!</CardTitle>
            <CardDescription>
              Your email has been verified. You can now sign in to your account.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/sign-in" className="w-full">
              <Button className="w-full">Sign In</Button>
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
            <CardTitle>Confirmation failed</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            If you continue to have issues, please contact support.
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Link href="/sign-up" className="w-full">
              <Button variant="outline" className="w-full">
                Try Again
              </Button>
            </Link>
            <Link href="/sign-in" className="w-full">
              <Button variant="ghost" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
