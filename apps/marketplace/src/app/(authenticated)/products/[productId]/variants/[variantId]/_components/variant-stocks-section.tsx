"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckboxField } from "@/components/fields/checkbox-field";
import { InputField } from "@/components/fields/input-field";
import { cn } from "@/lib/utils";

import type { VariantUpdateFormValues } from "../schema";

export function VariantStocksSection() {
  const form = useFormContext<VariantUpdateFormValues>();
  const stocks = form.watch("stocks") ?? {};

  const sorted = useMemo(() => {
    return Object.entries(stocks).sort((a, b) => {
      const aAssigned = a[1].isAssigned ? 0 : 1;
      const bAssigned = b[1].isAssigned ? 0 : 1;
      if (aAssigned !== bAssigned) return aAssigned - bAssigned;
      return (a[1].warehouseName ?? "").localeCompare(b[1].warehouseName ?? "");
    });
  }, [stocks]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Inventory & Stocks</h3>

      <div className="grid gap-4">
        <InputField name="sku" label="SKU" />
        <CheckboxField
          name="trackInventory"
          label="Track inventory"
          description="Active inventory tracking will automatically calculate changes of stock"
        />
      </div>

      <div className="border-t" />

      <h4 className="text-muted-foreground text-sm font-medium">
        Assigned warehouses
      </h4>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12" />
            <TableHead>Warehouse</TableHead>
            <TableHead className="w-48 text-center">Allocated</TableHead>
            <TableHead className="w-56 text-right">Quantity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map(([warehouseId, stock]) => {
            const isAssigned = stock.isAssigned ?? false;

            return (
              <TableRow
                key={warehouseId}
                className={cn(!isAssigned && "text-muted-foreground")}
              >
                <TableCell>
                  <CheckboxField
                    name={`stocks.${warehouseId}.isAssigned`}
                    label=""
                  />
                </TableCell>
                <TableCell>{stock.warehouseName}</TableCell>
                <TableCell className="text-center">
                  {stock.quantityAllocated ?? "0"}
                </TableCell>
                <TableCell className="text-right">
                  <input
                    type="number"
                    className={cn(
                      "border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                      !isAssigned && "opacity-50",
                    )}
                    disabled={!isAssigned}
                    {...form.register(`stocks.${warehouseId}.quantity`)}
                    aria-label={`${stock.warehouseName} quantity`}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

