"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Search, Filter, Loader2 } from "lucide-react";

import { Button } from "@nimara/ui/components/button";
import { Input } from "@nimara/ui/components/input";
import { Card, CardContent } from "@nimara/ui/components/card";
import { Checkbox } from "@nimara/ui/components/checkbox";
import { Label } from "@nimara/ui/components/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nimara/ui/components/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductsDocument } from "@/graphql/queries/generated";
import { useGraphQLQuery } from "@/hooks/use-graphql-query";
import { useDebounce } from "@/hooks/use-debounce";

const PUBLISHED_FILTER_OPTIONS = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
] as const;

export default function ProductsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [publishedFilter, setPublishedFilter] = useState<string[]>([]);
  const debouncedSearch = useDebounce(searchValue, 300);

  const productFilter =
    publishedFilter.length === 0
      ? undefined
      : publishedFilter.length === 2
        ? undefined
        : { isPublished: publishedFilter.includes("published") };

  const { data, isLoading } = useGraphQLQuery(ProductsDocument, {
    variables: {
      first: 20,
      search: debouncedSearch || undefined,
      filter: productFilter,
    },
  });

  const products = data?.products?.edges?.map((e) => e.node) || [];

  const togglePublishedFilter = (value: string) => {
    setPublishedFilter((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const clearFilters = () => setPublishedFilter([]);

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

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : products.length === 0 ? (
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
                        <img
                          src={product.thumbnail.url}
                          alt={product.thumbnail.alt || product.name}
                          className="h-10 w-10 rounded object-cover"
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
                      {product.channelListings?.some((l) => l.isPublished) ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                          Draft
                        </span>
                      )}
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
