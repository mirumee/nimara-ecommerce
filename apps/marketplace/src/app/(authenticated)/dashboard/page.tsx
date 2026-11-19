import Link from "next/link";
import { getTranslations } from "next-intl/server";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";

import { ColorBadge } from "@/components/ui/color-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getServerAuthToken } from "@/lib/auth/server";
import { formatDateTime, formatPrice } from "@/lib/utils";
import {
  ordersService,
  productsService,
  vendorCustomersService,
} from "@/services";

const RECENT_ORDERS_COUNT = 5;

function StatCard({ label, value }: { label: string; value: number | null }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value ?? "—"}</p>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const t = await getTranslations();
  const token = await getServerAuthToken();

  const [ordersResult, unfulfilledResult, productsResult, customerIds] =
    await Promise.all([
      ordersService.getOrders(
        {
          first: RECENT_ORDERS_COUNT,
          sortBy: { field: "CREATION_DATE", direction: "DESC" },
        },
        token,
      ),
      ordersService.getOrders(
        { first: 1, filter: { status: ["UNFULFILLED"] } },
        token,
      ),
      productsService.getProducts({ first: 1 }, token),
      vendorCustomersService.getVendorCustomerIds(token),
    ]);

  const ordersCount = ordersResult.ok
    ? (ordersResult.data.orders?.totalCount ?? 0)
    : null;
  const unfulfilledCount = unfulfilledResult.ok
    ? (unfulfilledResult.data.orders?.totalCount ?? 0)
    : null;
  const productsCount = productsResult.ok
    ? (productsResult.data.products?.totalCount ?? 0)
    : null;
  const recentOrders = ordersResult.ok
    ? (ordersResult.data.orders?.edges.map((edge) => edge.node) ?? [])
    : [];

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-semibold">
        {t("marketplace.navigation.dashboard")}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("marketplace.dashboard.orders")}
          value={ordersCount}
        />
        <StatCard
          label={t("marketplace.dashboard.unfulfilled-orders")}
          value={unfulfilledCount}
        />
        <StatCard
          label={t("marketplace.dashboard.products")}
          value={productsCount}
        />
        <StatCard
          label={t("marketplace.dashboard.customers")}
          value={customerIds.length}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">
            {t("marketplace.dashboard.recent-orders")}
          </CardTitle>
          <Link
            href="/orders"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            {t("marketplace.dashboard.view-all")}
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {!ordersResult.ok ? (
            <p className="p-6 text-sm text-muted-foreground">
              {t("marketplace.dashboard.failed-to-load")}
            </p>
          ) : recentOrders.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              {t("marketplace.dashboard.no-orders")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.order")}</TableHead>
                  <TableHead>{t("common.date")}</TableHead>
                  <TableHead>{t("common.customer")}</TableHead>
                  <TableHead>{t("common.total")}</TableHead>
                  <TableHead>
                    {t("marketplace.orders.list.table-payment-status")}
                  </TableHead>
                  <TableHead>
                    {t("marketplace.orders.list.table-fulfillment-status")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        #{order.number}
                      </Link>
                    </TableCell>
                    <TableCell>{formatDateTime(order.created)}</TableCell>
                    <TableCell>
                      {order.user
                        ? `${order.user.firstName} ${order.user.lastName}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {formatPrice(
                        order.total.gross.amount,
                        order.total.gross.currency,
                      )}
                    </TableCell>
                    <TableCell>
                      <ColorBadge label={order.paymentStatus} />
                    </TableCell>
                    <TableCell>
                      <ColorBadge label={order.status} />
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
