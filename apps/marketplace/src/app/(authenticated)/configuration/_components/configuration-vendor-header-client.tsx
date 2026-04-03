"use client";

import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ConfigurationVendorHeaderClientProps {
  vendorName: string;
  vendorUrl: string;
}

export function ConfigurationVendorHeaderClient({
  vendorName,
  vendorUrl,
}: ConfigurationVendorHeaderClientProps) {
  const t = useTranslations();

  return (
    <div className="flex-shrink-0 border-b bg-white p-6">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 bg-stone-100">
          <AvatarFallback className="font-medium text-stone-600">
            {vendorName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900">
            {vendorName}
          </div>
          <a
            className="text-xs text-primary hover:underline"
            href={vendorUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t("marketplace.configuration.general.storefront-vendor-page-link")}
          </a>
        </div>
      </div>
    </div>
  );
}
