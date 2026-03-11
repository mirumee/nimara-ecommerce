"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";
import { Input } from "@nimara/ui/components/input";
import { Label } from "@nimara/ui/components/label";
import { Skeleton } from "@nimara/ui/components/skeleton";
import { useToast } from "@nimara/ui/hooks";

import { InputField } from "@/components/fields/input-field";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Me_me_User } from "@/graphql/generated/client";

import { updateAccount } from "../actions";

const accountInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

type AccountInfoFormData = z.infer<typeof accountInfoSchema>;

interface Vendor {
  name: string;
  slug: string;
}

interface AccountInformationCardProps {
  isLoading?: boolean;
  user: Me_me_User | null;
  vendor: Vendor | null;
}

export function AccountInformationCard({
  user,
  isLoading = false,
  vendor,
}: AccountInformationCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const submittedDataRef = useRef<AccountInfoFormData | null>(null);

  const vendorName =
    vendor?.name || user?.firstName || user?.email || "Vendor name";
  const vendorUrl = vendor?.slug
    ? `marketplace.com/${vendor.slug}`
    : `marketplace.com/${String(vendorName).toLowerCase().replace(/\s+/g, "-")}`;
  const fullName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ")
    : "";

  const formConfig = useMemo(
    () => ({
      resolver: zodResolver(accountInfoSchema),
      defaultValues: {
        name: vendor?.name || "",
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
      },
    }),
    [vendor?.name, user?.firstName, user?.lastName],
  );

  const form = useForm<AccountInfoFormData>(formConfig);

  // Hide skeleton once refreshed user data includes the submitted values
  useEffect(() => {
    if (user && !isEditing && isPending && submittedDataRef.current) {
      const submitted = submittedDataRef.current;

      // Check if the submitted values match the current user data
      if (
        user.firstName === submitted.firstName &&
        user.lastName === submitted.lastName
      ) {
        setIsPending(false);
        submittedDataRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.firstName, user?.lastName, isEditing, isPending]);

  // Update form values when user data changes (only when not editing)
  useEffect(() => {
    if (user && !isEditing) {
      form.reset({
        name: vendor?.name || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, vendor?.name, user?.firstName, user?.lastName, isEditing]);

  const onSubmit: SubmitHandler<AccountInfoFormData> = async (data) => {
    setIsPending(true);

    try {
      const result = await updateAccount({
        firstName: data.firstName,
        lastName: data.lastName,
        vendorName: data.name,
      });

      if (!result.ok) {
        const errorMessage = result.errors
          .map((e: { message?: string | null }) => e.message || "Unknown error")
          .join(", ");

        toast({
          title: "Failed to update account",
          description: errorMessage,
          variant: "destructive",
        });
        setIsPending(false);

        return;
      }

      // result.data is AccountUpdate_Mutation which has structure: { accountUpdate: { user, errors } | null }
      const accountUpdateData = result.data.accountUpdate;
      const errors = accountUpdateData?.errors ?? [];

      if (errors.length > 0) {
        const errorMessage =
          errors
            .map((e: { message?: string | null }) => e.message)
            .filter(Boolean)
            .join(", ") || "Unknown error";

        toast({
          title: "Failed to update account",
          description: errorMessage,
          variant: "destructive",
        });
        setIsPending(false);

        return;
      }

      toast({
        title: "Account updated",
        description: "Account information has been updated successfully.",
      });

      // Store submitted data to check when it appears in user data
      submittedDataRef.current = data;
      setIsEditing(false);
      setIsPending(true);
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to update account",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsPending(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.reset({
      name: vendor?.name || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Account Information</CardTitle>
        {!isEditing && (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            disabled={isLoading || isPending}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <InputField
                    label="Name"
                    name="name"
                    inputProps={{ placeholder: "Vendor name" }}
                  />
                  <InputField
                    label="First Name"
                    name="firstName"
                    inputProps={{ placeholder: "First name" }}
                  />
                  <InputField
                    label="Last Name"
                    name="lastName"
                    inputProps={{ placeholder: "Last name" }}
                  />
                </div>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </FormProvider>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* First Column - Account Info */}
            <div className="flex items-center gap-6">
              {isLoading || isPending ? (
                <>
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="w-1/2 space-y-1.5">
                    <Skeleton className="h-7 w-1/2" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-5 w-1/2" />
                  </div>
                </>
              ) : (
                <>
                  <Avatar className="h-20 w-20 bg-stone-100">
                    <AvatarFallback className="text-2xl font-medium text-stone-600">
                      {vendorName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-xl font-semibold text-gray-900">
                      {vendorName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {vendorUrl}
                    </div>
                    {fullName && (
                      <div className="mt-1 text-sm text-gray-600">
                        {fullName}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Second Column - Email */}
            <div>
              {isLoading || isPending ? (
                <>
                  <Skeleton className="mb-2 h-5 w-1/2" />
                  <Skeleton className="h-5 w-1/2" />
                </>
              ) : (
                <>
                  <label className="text-sm font-medium text-gray-900">
                    Email
                  </label>
                  <div className="mt-1 text-sm text-gray-600">
                    {user?.email || "Not set"}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
