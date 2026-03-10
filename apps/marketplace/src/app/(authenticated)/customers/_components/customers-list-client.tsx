"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@nimara/ui/components/accordion";
import { Input } from "@nimara/ui/components/input";

import type { VendorCustomerWithOrders } from "@/services/vendor-customers";

function getCustomerName(customer: VendorCustomerWithOrders): string {
  const name = `${customer.firstName} ${customer.lastName}`.trim();

  return name || customer.email;
}

function formatMoney(
  money: VendorCustomerWithOrders["orders"][number]["total"],
): string {
  if (!money) {
    return "-";
  }

  return `${money.amount.toFixed(2)} ${money.currency}`;
}

function formatDate(dateRaw: string | null): string {
  if (!dateRaw) {
    return "-";
  }

  return new Date(dateRaw).toLocaleString();
}

export function CustomersListClient({
  customers,
}: {
  customers: VendorCustomerWithOrders[];
}) {
  const t = useTranslations();
  const [searchValue, setSearchValue] = useState("");
  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredCustomers = useMemo(() => {
    if (!normalizedSearch) {
      return customers;
    }

    return customers.filter((customer) => {
      const fullName = `${customer.firstName} ${customer.lastName}`
        .trim()
        .toLowerCase();
      const email = customer.email.toLowerCase();

      return (
        fullName.includes(normalizedSearch) || email.includes(normalizedSearch)
      );
    });
  }, [customers, normalizedSearch]);

  if (customers.length === 0) {
    return <p>{t("marketplace.customers.no-customers-found")}</p>;
  }

  return (
    <div className="grid gap-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("marketplace.customers.search-placeholder")}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("marketplace.customers.no-matching")}
        </p>
      ) : (
        <Accordion type="multiple" className="w-full">
          {filteredCustomers.map((customer) => (
            <AccordionItem
              key={customer.id}
              value={customer.id}
              className="mb-2 rounded-lg border px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex w-full flex-col items-start gap-1 text-left md:pr-4">
                  <p className="font-medium">{getCustomerName(customer)}</p>
                  <p className="text-sm text-muted-foreground">
                    {customer.email}
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {customer.orders.length > 0 && (
                  <div className="overflow-x-auto pb-2">
                    <table className="min-w-full text-sm">
                      <thead className="text-left text-muted-foreground">
                        <tr className="border-b">
                          <th className="py-2 pr-4">{t("common.order")}</th>
                          <th className="py-2 pr-4">{t("common.created")}</th>
                          <th className="py-2 pr-4">{t("common.status")}</th>
                          <th className="py-2 pr-4">{t("common.payment")}</th>
                          <th className="py-2">{t("common.total")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customer.orders.map((order) => (
                          <tr key={order.id} className="border-b last:border-0">
                            <td className="py-2 pr-4">
                              <Link
                                href={`/orders/${order.id}`}
                                className="text-primary hover:underline"
                              >
                                #{order.number ?? "-"}
                              </Link>
                            </td>
                            <td className="py-2 pr-4">
                              {formatDate(order.created)}
                            </td>
                            <td className="py-2 pr-4">
                              {order.statusDisplay ?? "-"}
                            </td>
                            <td className="py-2 pr-4">
                              {order.paymentStatusDisplay ?? "-"}
                            </td>
                            <td className="py-2">{formatMoney(order.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
