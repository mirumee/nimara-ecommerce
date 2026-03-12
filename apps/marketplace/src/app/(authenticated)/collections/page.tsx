import { getTranslations } from "next-intl/server";

import { getServerAuthToken } from "@/lib/auth/server";
import { productsService } from "@/services";

import { CollectionsListClient } from "./_components/collections-list-client";

type PageProps = {
  searchParams: Promise<{
    search?: string;
  }>;
};

export default async function CollectionsPage({ searchParams }: PageProps) {
  const t = await getTranslations();
  const params = await searchParams;
  const search = params.search?.trim() || undefined;

  const token = await getServerAuthToken();
  const result = await productsService.getCollections(
    {
      first: 100,
      filter: search ? { search } : undefined,
    },
    token,
  );

  if (!result.ok) {
    const errorMessage =
      result.errors
        ?.map(
          (e: { message?: string }) =>
            e.message || t("common.toast-unknown-error"),
        )
        .join(", ") || t("marketplace.collections.list.failed-to-load");

    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">
          {t("marketplace.collections.list.failed-to-load")}
        </p>
        <p className="mt-2 text-sm text-destructive">{errorMessage}</p>
      </div>
    );
  }

  const collections = result.data.collections?.edges?.map((e) => e.node) ?? [];

  return <CollectionsListClient collections={collections} />;
}
