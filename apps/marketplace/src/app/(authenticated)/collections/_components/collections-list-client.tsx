"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import { Card, CardContent } from "@nimara/ui/components/card";
import { Input } from "@nimara/ui/components/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";

type Collection = {
  backgroundImage: { alt: string | null; url: string } | null;
  channelListings: Array<{
    channel: { id: string; name: string };
    isPublished: boolean;
  }> | null;
  id: string;
  name: string;
  products: {
    totalCount: number | null;
  } | null;
  slug: string;
};

function getChannelBadgeProps(collection: Collection): {
  label: string;
  variant: "published" | "hidden" | "none";
} {
  const listings = collection.channelListings ?? [];
  const total = listings.length;
  const publishedCount = listings.filter((l) => l.isPublished).length;

  if (total === 0) {
    return { label: "No channels", variant: "none" };
  }

  if (publishedCount === 0) {
    return {
      label: `${total} ${total === 1 ? "Channel" : "Channels"}`,
      variant: "hidden",
    };
  }

  return {
    label: `${total} ${total === 1 ? "Channel" : "Channels"}`,
    variant: "published",
  };
}

interface CollectionsListClientProps {
  collections: Collection[];
}

export function CollectionsListClient({
  collections,
}: CollectionsListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || "",
  );
  const debouncedSearch = useDebounce(searchValue, 300);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedSearch, pathname, router, searchParams]);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Collections</h2>
        <Button asChild>
          <Link href="/collections/new">
            <Plus className="mr-2 h-4 w-4" />
            Add collection
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search collections"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-64 pl-9"
              />
            </div>
          </div>

          {collections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No collections found</p>
              <Button asChild variant="link" className="mt-2">
                <Link href="/collections/new">
                  Create your first collection
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-t px-6 py-4">
                  <TableHead>Collection Name</TableHead>
                  <TableHead>No. of Products</TableHead>
                  <TableHead>Availability</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collections.map((collection) => {
                  const productCount = collection.products?.totalCount ?? 0;
                  const { label, variant } = getChannelBadgeProps(collection);

                  return (
                    <TableRow
                      key={collection.id}
                      className="cursor-pointer hover:bg-muted"
                      onClick={() =>
                        router.push(`/collections/${collection.id}`)
                      }
                    >
                      <TableCell className="font-medium">
                        {collection.name}
                      </TableCell>
                      <TableCell>{productCount}</TableCell>
                      <TableCell>
                        {variant === "none" && (
                          <span className="inline-flex items-center rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-medium text-pink-800">
                            {label}
                          </span>
                        )}
                        {variant === "hidden" && (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            {label}
                          </span>
                        )}
                        {variant === "published" && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            {label}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
