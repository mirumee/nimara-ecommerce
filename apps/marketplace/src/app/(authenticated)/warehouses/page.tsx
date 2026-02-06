import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getServerAuthToken } from "@/lib/auth/server";
import { configurationService } from "@/services/configuration";

export default async function WarehousesPage() {
  const token = await getServerAuthToken();
  const result = await configurationService.getWarehouses(token);

  if (!result.ok) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Failed to load warehouses</p>
      </div>
    );
  }

  const warehouses = result.data.warehouses?.edges?.map((e) => e.node) || [];

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
