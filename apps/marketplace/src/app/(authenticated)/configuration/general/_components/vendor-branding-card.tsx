"use client";

import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";
import { Separator } from "@nimara/ui/components/separator";
import { Skeleton } from "@nimara/ui/components/skeleton";
import { useToast } from "@nimara/ui/hooks";

import {
  uploadVendorBrandingImage,
  type VendorBrandingKind,
} from "../branding-actions";

type VendorBrandingCardProps = {
  backgroundUrl: string | null;
  logoUrl: string | null;
};

export function VendorBrandingCard({
  backgroundUrl: initialBackgroundUrl,
  logoUrl: initialLogoUrl,
}: VendorBrandingCardProps) {
  const t = useTranslations();
  const router = useRouter();
  const { toast } = useToast();
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [backgroundUrl, setBackgroundUrl] = useState(initialBackgroundUrl);
  const [uploadingKind, setUploadingKind] = useState<VendorBrandingKind | null>(
    null,
  );

  const isBusy = uploadingKind !== null;

  useEffect(() => {
    setLogoUrl(initialLogoUrl);
    setBackgroundUrl(initialBackgroundUrl);
  }, [initialBackgroundUrl, initialLogoUrl]);

  const validateAndUpload = async (kind: VendorBrandingKind, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: t("marketplace.shared.media.toast-invalid-file"),
        description: t("marketplace.shared.media.toast-invalid-file-desc"),
        variant: "destructive",
      });

      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      toast({
        title: t("marketplace.shared.media.toast-file-too-large"),
        description: t("marketplace.shared.media.toast-file-too-large-desc"),
        variant: "destructive",
      });

      return;
    }

    setUploadingKind(kind);

    try {
      const result = await uploadVendorBrandingImage(kind, file);

      if (!result.ok) {
        toast({
          title: t(
            "marketplace.configuration.general.branding.toast-upload-failed",
          ),
          description:
            result.errors
              .map((e) => e.message)
              .filter(Boolean)
              .join(", ") ||
            t("marketplace.configuration.general.branding.toast-upload-failed"),
          variant: "destructive",
        });

        return;
      }

      if (kind === "logo") {
        setLogoUrl(result.data.imageUrl);
      } else {
        setBackgroundUrl(result.data.imageUrl);
      }

      toast({
        title: t("marketplace.shared.media.toast-upload-success"),
        description:
          kind === "logo"
            ? t(
                "marketplace.configuration.general.branding.toast-logo-success-desc",
              )
            : t(
                "marketplace.configuration.general.branding.toast-background-success-desc",
              ),
      });
      router.refresh();
    } catch (error) {
      toast({
        title: t(
          "marketplace.configuration.general.branding.toast-upload-failed",
        ),
        description:
          error instanceof Error
            ? error.message
            : t("common.toast-unknown-error"),
        variant: "destructive",
      });
    } finally {
      setUploadingKind(null);
    }
  };

  const onFileChange =
    (kind: VendorBrandingKind) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      e.target.value = "";

      if (!file) {
        return;
      }

      void validateAndUpload(kind, file);
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t(
            "marketplace.configuration.general.branding.appearance-settings-title",
          )}
        </CardTitle>
        <CardDescription className="text-pretty">
          {t("marketplace.configuration.general.branding.appearance-intro")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <section className="space-y-3">
          <h3 className="text-base font-semibold leading-none">
            {t("marketplace.configuration.general.branding.logo-label")}
          </h3>
          {uploadingKind === "logo" ? (
            <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-lg border">
              <Skeleton className="h-full w-full" />
            </div>
          ) : logoUrl ? (
            <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-lg border bg-muted">
              <Image
                src={logoUrl}
                alt=""
                fill
                className="object-contain p-2"
                unoptimized
              />
              <div className="absolute right-2 top-2 flex gap-2">
                <label htmlFor="vendor-logo-upload">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer bg-background/90 backdrop-blur-sm hover:bg-background"
                    disabled={isBusy}
                    asChild
                  >
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4" />
                      {t("marketplace.collections.detail.replace-button")}
                    </span>
                  </Button>
                </label>
                <input
                  id="vendor-logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  multiple={false}
                  onChange={onFileChange("logo")}
                  disabled={isBusy}
                />
              </div>
            </div>
          ) : (
            <div className="flex w-full max-w-md flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 py-12">
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                {t("marketplace.collections.detail.drop-upload")}
              </p>
              <label htmlFor="vendor-logo-upload-empty">
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 cursor-pointer"
                  disabled={isBusy}
                  asChild
                >
                  <span>
                    {t("marketplace.collections.detail.upload-button")}
                  </span>
                </Button>
              </label>
              <input
                id="vendor-logo-upload-empty"
                type="file"
                accept="image/*"
                className="hidden"
                multiple={false}
                onChange={onFileChange("logo")}
                disabled={isBusy}
              />
            </div>
          )}
        </section>

        <Separator />

        <section className="space-y-3">
          <div className="space-y-1.5">
            <h3 className="text-base font-semibold leading-none">
              {t("marketplace.collections.detail.background-image-title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t(
                "marketplace.configuration.general.branding.background-dimensions-help",
              )}
            </p>
          </div>
          {uploadingKind === "background" ? (
            <div className="relative aspect-[1920/512] w-full max-w-4xl overflow-hidden rounded-lg border">
              <Skeleton className="h-full w-full" />
            </div>
          ) : backgroundUrl ? (
            <div className="relative aspect-[1920/512] w-full max-w-4xl overflow-hidden rounded-lg border bg-muted/10">
              <Image
                src={backgroundUrl}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute right-2 top-2 flex gap-2">
                <label htmlFor="vendor-background-upload">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer bg-background/90 backdrop-blur-sm hover:bg-background"
                    disabled={isBusy}
                    asChild
                  >
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4" />
                      {t("marketplace.collections.detail.replace-button")}
                    </span>
                  </Button>
                </label>
                <input
                  id="vendor-background-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  multiple={false}
                  onChange={onFileChange("background")}
                  disabled={isBusy}
                />
              </div>
            </div>
          ) : (
            <div className="flex w-full max-w-4xl flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 py-12">
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                {t("marketplace.collections.detail.drop-upload")}
              </p>
              <label htmlFor="vendor-background-upload-empty">
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 cursor-pointer"
                  disabled={isBusy}
                  asChild
                >
                  <span>
                    {t("marketplace.collections.detail.upload-button")}
                  </span>
                </Button>
              </label>
              <input
                id="vendor-background-upload-empty"
                type="file"
                accept="image/*"
                className="hidden"
                multiple={false}
                onChange={onFileChange("background")}
                disabled={isBusy}
              />
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
