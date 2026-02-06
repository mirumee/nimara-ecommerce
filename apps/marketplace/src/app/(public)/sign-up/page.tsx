"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";

import { InputField } from "@/components/fields/input-field";
import { PasswordField } from "@/components/fields/password-field";

import { registerAccount } from "./actions";

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  const form = useForm<SignUpFormData>({
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
    mode: "onChange",
    resolver: zodResolver(signUpSchema),
  });

  const isPending = form.formState.isSubmitting;

  const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
    try {
      const input = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        redirectUrl: `${window.location.origin}/account-confirm`,
        channel: process.env.NEXT_PUBLIC_SALEOR_MARKETPLACE_CHANNEL_SLUG ?? "default-channel",
      };

      const result = await registerAccount(input);

      if (!result.ok) {
        form.setError("root", {
          type: "server",
          message: result.errors[0]?.message || "Registration failed. Please try again.",
        });

        return;
      }

      const payload = (result.data as any).accountRegister;

      if (payload?.errors?.length) {
        const error = payload.errors[0];
        const field = (error?.field != null ? String(error.field) : "root") as keyof SignUpFormData;
        const message = error?.message != null ? String(error.message) : "Registration failed";

        form.setError(field, { type: "server", message });

        return;
      }

      if (payload?.requiresConfirmation) {
        setSuccess(true);
      } else {
        router.push("/sign-in?confirmed=true");
      }
    } catch (error) {
      form.setError("root", {
        type: "server",
        message: error instanceof Error ? error.message : "Registration failed. Please try again.",
      });
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent a confirmation link to your email address. Please click the link to activate your account.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/sign-in" className="w-full">
            <Button variant="outline" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your details to create a vendor account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form
            id="sign-up-form"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <div className="flex flex-col gap-4">
              {form.formState.errors.root && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {form.formState.errors.root.message}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  name="firstName"
                  label="First name"
                  inputProps={{
                    placeholder: "John",
                    autoComplete: "given-name",
                    disabled: isPending,
                  }}
                />
                <InputField
                  name="lastName"
                  label="Last name"
                  inputProps={{
                    placeholder: "Doe",
                    autoComplete: "family-name",
                    disabled: isPending,
                  }}
                />
              </div>
              <InputField
                name="email"
                label="Email"
                inputProps={{
                  placeholder: "john.doe@example.com",
                  autoComplete: "email",
                  type: "email",
                  disabled: isPending,
                }}
              />
              <PasswordField
                name="password"
                label="Password"
                inputProps={{
                  placeholder: "********",
                  autoComplete: "new-password",
                  disabled: isPending,
                }}
              />
            </div>
          </form>
        </FormProvider>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <Button
          type="submit"
          className="w-full"
          form="sign-up-form"
          disabled={isPending}
        >
          {isPending ? (
            <>
              Creating Account <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              Create Account <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        <Link
          href="/sign-in"
          className="inline-block text-sm underline-offset-4 hover:underline"
        >
          Already have an account? Sign In here. &rarr;
        </Link>
      </CardFooter>
    </Card>
  );
}
