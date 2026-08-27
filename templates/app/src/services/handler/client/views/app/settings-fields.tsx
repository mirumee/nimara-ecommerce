import { zodResolver } from "@hookform/resolvers/zod";
import { use } from "react";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";

import { type SettingsFormData } from "@nimara/infrastructure/use-cases/apps/saleor/settings-form";
import { useDashboardSession } from "@nimara/lib/client/dashboard-session/context";
import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";
import { TextFormField } from "@nimara/ui/components/textFormField";
import { useToast } from "@nimara/ui/hooks";

import { type AppSettings } from "@/domain/app-config";
import {
  settingsFormSchema,
  type SettingsFormValues,
} from "@/services/handler/api/rest/app/schema";

import { saveSettings } from "./api";

/**
 * The secret starts blank whatever is stored: it arrives masked, and seeding
 * the field would save the mask over the real key.
 */
const toFormValues = (
  settings: SettingsFormData<AppSettings>,
): SettingsFormValues => ({
  publicKey: settings.publicKey,
  secretKey: "",
});

export const SettingsFields = ({
  getSettings,
  reload,
}: {
  getSettings: Promise<SettingsFormData<AppSettings>>;
  reload: () => void;
}) => {
  const { accessToken, saleorApiUrl } = useDashboardSession();
  const { toast } = useToast();
  const settings = use(getSettings);

  const form = useForm<SettingsFormValues>({
    defaultValues: toFormValues(settings),
    resolver: zodResolver(settingsFormSchema),
  });

  const handleSubmit: SubmitHandler<SettingsFormValues> = async (values) => {
    const error = await saveSettings({
      accessToken,
      data: values,
      saleorApiUrl,
    });

    if (error) {
      toast({ description: error, variant: "destructive" });

      return;
    }

    toast({ description: "Settings saved." });
    reload();
  };

  const { isSubmitting } = form.formState;

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Credentials</CardTitle>
            <CardDescription>
              Replace these with whatever this app stores per Saleor. The shape
              is declared in <code>src/domain/app-config.ts</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <TextFormField
              autoComplete="off"
              disabled={isSubmitting}
              label="Public key"
              name="publicKey"
            />
            <TextFormField
              autoComplete="off"
              disabled={isSubmitting}
              label="Secret key"
              name="secretKey"
              placeholder={
                settings.secretKey
                  ? "Leave blank to keep the current key"
                  : undefined
              }
            />
            <Button className="self-end" disabled={isSubmitting} type="submit">
              Save
            </Button>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
};
