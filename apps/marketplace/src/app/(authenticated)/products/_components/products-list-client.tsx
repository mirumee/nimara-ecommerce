"use client";

import { Filter, Plus, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import { Card, CardContent } from "@nimara/ui/components/card";
import { Checkbox } from "@nimara/ui/components/checkbox";
import { Input } from "@nimara/ui/components/input";
import { Label } from "@nimara/ui/components/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nimara/ui/components/popover";

import { ColorBadge } from "@/components/ui/color-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";

const PUBLISHED_FILTER_OPTIONS = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
] as const;

type Product = {
  category: { name: string } | null;
  channelListings: Array<{ isPublished: boolean }> | null;
  id: string;
  name: string;
  pricing: {
    priceRange: {
      start: {
        gross: {
          amount: number;
          currency: string;
        };
      } | null;
    } | null;
  } | null;
  productType: { name: string } | null;
  slug: string;
  thumbnail: { alt: string | null; url: string } | null;
};

interface ProductsListClientProps {
  products: Product[];
}

export function ProductsListClient({ products }: ProductsListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || ""
  );
  const debouncedSearch = useDebounce(searchValue, 300);

  const publishedFilter = searchParams.getAll("status");

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedSearch, pathname, router, searchParams]);

  const togglePublishedFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentValues = params.getAll("status");

    params.delete("status");

    if (currentValues.includes(value)) {
      // Remove value
      currentValues.filter((v) => v !== value).forEach((v) => params.append("status", v));
    } else {
      // Add value
      [...currentValues, value].forEach((v) => params.append("status", v));
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(pathname);
    setSearchValue("");
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Products</h2>
        <Button asChild>
          <Link href="/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add product
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex p-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-64 pl-9"
              />
            </div>
            <div className="flex grow" />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  Filter
                  {publishedFilter.length > 0 && (
                    <span className="text-muted-foreground">
                      ({publishedFilter.length})
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="min-w-[240px]" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Filter</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-auto py-1 text-xs"
                    >
                      Clear all
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Status</h4>
                    <div className="space-y-2">
                      {PUBLISHED_FILTER_OPTIONS.map((opt) => (
                        <div
                          key={opt.value}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`product-${opt.value}`}
                            checked={publishedFilter.includes(opt.value)}
                            onCheckedChange={() =>
                              togglePublishedFilter(opt.value)
                            }
                          />
                          <Label
                            htmlFor={`product-${opt.value}`}
                            className="cursor-pointer text-sm font-normal"
                          >
                            {opt.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No products found</p>
              <Button asChild variant="link" className="mt-2">
                <Link href="/products/new">Create your first product</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-t px-6 py-4">
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.thumbnail?.url ? (
                        <Image
                          width={40}
                          height={40}
                          src={product.thumbnail.url}
                          alt={product.thumbnail.alt || product.name}
                          className="h-10 w-10 rounded object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/products/${product.id}`}
                        className="font-medium hover:underline"
                      >
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.productType?.name || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.category?.name || "-"}
                    </TableCell>
                    <TableCell>
                      {product.pricing?.priceRange?.start?.gross ? (
                        <span>
                          {product.pricing.priceRange.start.gross.currency}{" "}
                          {product.pricing.priceRange.start.gross.amount.toFixed(2)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <ColorBadge
                        label={
                          product.channelListings?.some((l) => l.isPublished)
                            ? "Published"
                            : "Draft"
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
