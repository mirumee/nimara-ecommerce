"use client";

import { Loader2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WarehousesDocument } from "@/graphql/queries/generated";
import { useGraphQLQuery } from "@/hooks/use-graphql-query";

export default function WarehousesPage() {
  const { data, isLoading } = useGraphQLQuery(WarehousesDocument);

  const warehouses = data?.warehouses?.edges?.map((e) => e.node) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!warehouses.length) {
    return <div>No warehouses found</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Warehouses</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {warehouses.map((warehouse) => (
            <TableRow key={warehouse.id}>
              <TableCell>{warehouse.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
