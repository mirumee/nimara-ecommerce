"use client";
import { useSearchParams } from "next/navigation";

import { Button, type ButtonProps } from "@nimara/ui/components/button";

import { useRouter } from "@/i18n/routing";
import { paths } from "@/lib/paths";

export const ClearFiltersButton = ({ children, ...props }: ButtonProps) => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q");

  return (
    <Button
      type="button"
      variant="outline"
      name="clear"
      onClick={() =>
        router.push(
          paths.search.asPath(
            searchQuery ? { query: { q: searchQuery } } : undefined,
          ),
        )
      }
      {...props}
    >
      {children}
    </Button>
  );
};
