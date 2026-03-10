import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Button } from "@nimara/ui/components/button";
import { Card, CardContent } from "@nimara/ui/components/card";

import { getServerAuthToken } from "@/lib/auth/server";
import { configurationService, ordersService } from "@/services";

import { OrderDetailClient } from "./_components/order-detail-client";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: PageProps) {
  const t = await getTranslations();
  const { id: orderId } = await params;
  const token = await getServerAuthToken();

  const [result, warehousesResult] = await Promise.all([
    ordersService.getOrder({ id: orderId }, token),
    configurationService.getWarehouses(token),
  ]);

  if (!result.ok) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost">
          <Link href="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("marketplace.orders.detail.back-to-orders-link")}
          </Link>
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {t("marketplace.orders.detail.failed-to-load")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!result.data.order) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost">
          <Link href="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("marketplace.orders.detail.back-to-orders-link")}
          </Link>
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {t("marketplace.orders.detail.not-found")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const warehouses =
    warehousesResult.ok && warehousesResult.data.warehouses?.edges
      ? warehousesResult.data.warehouses.edges.map((edge) => edge.node)
      : [];

  return (
    <OrderDetailClient order={result.data.order} warehouses={warehouses} />
  );
}
