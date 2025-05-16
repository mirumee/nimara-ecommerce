"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { type User } from "@nimara/domain/objects/User";
import { Button } from "@nimara/ui/components/button";
import { DialogFooter } from "@nimara/ui/components/dialog";
import { Form } from "@nimara/ui/components/form";
import { useToast } from "@nimara/ui/hooks";

import { TextFormField } from "@/components/form/text-form-field";

import { updateUserName } from "./actions";
import { type UpdateNameFormSchema, updateNameFormSchema } from "./schema";

export function UpdateNameForm({
  user,
  onModalClose,
}: {
  onModalClose: () => void;
  user: User | null;
}) {
  const t = useTranslations();
  const { toast } = useToast();

  const form = useForm<UpdateNameFormSchema>({
    resolver: zodResolver(updateNameFormSchema({ t })),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
    },
  });

  async function handleSubmit(values: UpdateNameFormSchema) {
    const result = await updateUserName(values);

    if (result && !result.ok) {
      form.setError("firstName", { message: "" });
      form.setError("lastName", { message: "" });
    }

    toast({
      description: t("account.name-updated"),
      position: "center",
    });

    onModalClose();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-y-3 py-2"
        id="update-user-name-form"
        noValidate
      >
        <div className="w-full">
          <TextFormField name="firstName" label={t("common.first-name")} />
        </div>
        <div className="w-full">
          <TextFormField name="lastName" label={t("common.last-name")} />
        </div>

        <DialogFooter>
          <Button
            className="mt-4"
            type="submit"
            form="update-user-name-form"
            disabled={!form.formState.isDirty || form.formState.isSubmitting}
            loading={form.formState.isSubmitting}
          >
            {t("common.save-changes")}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
