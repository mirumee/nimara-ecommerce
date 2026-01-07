"use client";

import { useLocale, useTranslations } from "next-intl";

import type { PageInfo } from "@nimara/infrastructure/use-cases/search/types";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@nimara/ui/components/pagination";
import type { SupportedLocale } from "@nimara/foundation/regions/types.js";
import { cn } from "@nimara/ui/lib/utils";

type Props = {
    baseUrl: string;
    pageInfo: PageInfo;
    searchParams: Record<string, string>;
    localePrefixes: Record<Exclude<SupportedLocale, "en-US">, string>;
    defaultLocale: SupportedLocale;
};

export const SearchPagination = ({
    pageInfo,
    searchParams,
    baseUrl,
    localePrefixes,
    defaultLocale,
}: Props) => {
    const t = useTranslations("common");
    const locale = useLocale();

    const getPathName = (direction: "next" | "previous") => {
        const params = new URLSearchParams(searchParams);

        // Delete all the pagination-related params
        params.delete("before");
        params.delete("after");
        params.delete("page");

        if (pageInfo.type === "cursor") {
            if (direction === "next") {
                params.set("after", pageInfo.after ?? "");
            } else {
                params.set("before", pageInfo.before ?? "");
            }
        } else {
            const page =
                direction === "next"
                    ? pageInfo.currentPage + 1
                    : pageInfo.currentPage - 1;

            params.set("page", page.toString());
        }

        // Shadcn use simple <a> tag instead of next-intl <Link> so we need to pass locale explicitly
        const isLocaleDifferent = locale !== defaultLocale;
        const localePrefix = isLocaleDifferent
            ? localePrefixes[
            locale as Exclude<SupportedLocale, typeof defaultLocale>
            ]
            : "";
        const baseUrlWithParams = `${baseUrl}?${params.toString()}`;

        return `${localePrefix}${baseUrlWithParams}`;
    };

    return (
        <div className="flex justify-center gap-4">
            <Pagination aria-label={t("pagination")}>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            label={t("previous")}
                            aria-label={t("go-to-next-page")}
                            className={cn({
                                "pointer-events-none text-neutral-400":
                                    !pageInfo.hasPreviousPage,
                            })}
                            href={getPathName("previous")}
                        />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext
                            label={t("next")}
                            aria-label={t("go-to-previous-page")}
                            className={cn({
                                "pointer-events-none text-neutral-400": !pageInfo.hasNextPage,
                            })}
                            href={getPathName("next")}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};

