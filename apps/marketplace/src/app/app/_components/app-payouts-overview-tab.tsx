"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Fragment, useCallback, useEffect, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import { Input } from "@nimara/ui/components/input";
import { Label } from "@nimara/ui/components/label";
import { Separator } from "@nimara/ui/components/separator";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatDateTime } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

type Props = {
  isAuthenticated: boolean;
  isLoading: boolean;
};

type PayoutBatchRow = {
  created_at: string;
  currency: string;
  executed_at: string | null;
  id: string;
  period_end: string;
  period_start: string;
  status: string;
  transfer_initiated_at: string | null;
};

type LedgerLineRow = {
  amount_minor: string;
  available_on: string | null;
  consumed_in_batch_id: string | null;
  currency: string;
  funds_status: string;
  id: string;
  occurred_at: string;
  order_id: string | null;
  stripe_charge_id: string | null;
  vendor_id: string;
};

type OverviewSuccess = {
  batches: PayoutBatchRow[];
  configured: true;
  ledgerLines: LedgerLineRow[];
  saleorDashboardBaseUrl: string | null;
  vendorSummary: {
    available_minor: string;
    currency: string | null;
    pending_minor: string;
  } | null;
  vendorTitleById: Record<string, string>;
};

type OverviewNotConfigured = {
  batches: [];
  configured: false;
  ledgerLines: [];
  vendorSummary: null;
};

type OverviewResponse = OverviewNotConfigured | OverviewSuccess;

type BatchDetailResponse = {
  batch: {
    created_at: string;
    currency: string;
    executed_at: string | null;
    id: string;
    period_end: string;
    period_start: string;
    status: string;
  } | null;
  items: Array<{
    fees_minor: string;
    gross_minor: string;
    id: string;
    net_minor: string;
    status: string;
    stripe_transfer_created_at: string | null;
    vendor_id: string;
  }>;
  saleorDashboardBaseUrl: string | null;
  vendorTitleById: Record<string, string>;
};

function formatMinorAmount(amountMinorStr: string, currency: string): string {
  try {
    const minor = BigInt(amountMinorStr);
    const major = Number(minor) / 100;

    return new Intl.NumberFormat(undefined, {
      currency: currency.toUpperCase(),
      style: "currency",
    }).format(major);
  } catch {
    return amountMinorStr;
  }
}

function fundsStatusClassName(status: string): string {
  switch (status) {
    case "available":
      return "text-green-600";
    case "held":
      return "text-orange-600";
    case "pending_stripe":
      return "text-amber-600";
    case "refunded":
    case "reversed":
      return "text-muted-foreground";
    default:
      return "";
  }
}

function formatUtcDateTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** `period_*` from API are YYYY-MM-DD (no timezone shift). */
function formatPeriodRange(periodStart: string, periodEnd: string): string {
  const parseYmd = (s: string) => {
    const [y, m, d] = s.split("-").map((x) => Number.parseInt(x, 10));

    return new Date(y, m - 1, d);
  };

  const fmt = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

  return `${fmt.format(parseYmd(periodStart))} – ${fmt.format(parseYmd(periodEnd))}`;
}

function dashboardModelHref(
  base: string | null,
  vendorId: string,
): string | null {
  if (!base) {
    return null;
  }

  return `${base}/models/${encodeURIComponent(vendorId)}`;
}

function dashboardOrderHref(
  base: string | null,
  orderId: string | null,
): string | null {
  if (!base || !orderId) {
    return null;
  }

  return `${base}/orders/${encodeURIComponent(orderId)}`;
}

export function AppPayoutsOverviewTab({ isAuthenticated, isLoading }: Props) {
  const t = useTranslations();
  const { apiAccessToken, dashboardContext } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [batchDetail, setBatchDetail] = useState<
    Record<string, BatchDetailResponse | "loading" | "error">
  >({});
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [closeCurrency, setCloseCurrency] = useState("usd");
  const [closing, setClosing] = useState(false);
  const [closeMessage, setCloseMessage] = useState<{
    text: string;
    type: "error" | "success";
  } | null>(null);
  const [executingBatchId, setExecutingBatchId] = useState<string | null>(null);
  const [executeMessage, setExecuteMessage] = useState<{
    batchId: string;
    text: string;
    type: "error" | "success";
  } | null>(null);
  const [syncingStripe, setSyncingStripe] = useState(false);
  const [syncStripeMessage, setSyncStripeMessage] = useState<{
    text: string;
    type: "error" | "success" | "warning";
  } | null>(null);

  const fetchOverview = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    if (!apiAccessToken) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payouts/overview", {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${apiAccessToken}`,
        },
      });

      if (res.status === 401) {
        setError(t("marketplace.payouts.unauthorized"));

        return;
      }

      if (!res.ok) {
        setError(t("marketplace.payouts.failed-to-load"));

        return;
      }

      const data = (await res.json()) as OverviewResponse;

      setOverview(data);
    } catch {
      setError(t("marketplace.payouts.failed-to-load"));
    } finally {
      setLoading(false);
    }
  }, [apiAccessToken, isAuthenticated, t]);

  useEffect(() => {
    void fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    const d = new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const fmt = (x: Date) => x.toISOString().slice(0, 10);

    setPeriodStart(fmt(start));
    setPeriodEnd(fmt(end));
  }, []);

  const loadBatchDetail = useCallback(
    async (batchId: string) => {
      if (!apiAccessToken) {
        return;
      }

      let shouldFetch = true;

      setBatchDetail((prev) => {
        const existing = prev[batchId];

        if (
          existing &&
          existing !== "error" &&
          existing !== "loading" &&
          typeof existing === "object"
        ) {
          shouldFetch = false;

          return prev;
        }

        return { ...prev, [batchId]: "loading" };
      });

      if (!shouldFetch) {
        return;
      }

      try {
        const res = await fetch(`/api/payouts/batches/${batchId}`, {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${apiAccessToken}`,
          },
        });

        if (!res.ok) {
          setBatchDetail((prev) => ({ ...prev, [batchId]: "error" }));

          return;
        }

        const data = (await res.json()) as BatchDetailResponse;

        setBatchDetail((prev) => ({ ...prev, [batchId]: data }));
      } catch {
        setBatchDetail((prev) => ({ ...prev, [batchId]: "error" }));
      }
    },
    [apiAccessToken],
  );

  const handleClosePeriod = async () => {
    if (!apiAccessToken) {
      return;
    }

    setClosing(true);
    setCloseMessage(null);

    try {
      const res = await fetch("/api/payouts/batches/close", {
        body: JSON.stringify({
          createdBy: "saleor-dashboard",
          currency: closeCurrency.trim(),
          periodEnd,
          periodStart,
        }),
        credentials: "include",
        headers: {
          Authorization: `Bearer ${apiAccessToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (res.status === 422) {
        setCloseMessage({
          text: t("marketplace.payouts.close-period.error-422"),
          type: "error",
        });

        return;
      }

      if (!res.ok) {
        setCloseMessage({
          text: t("marketplace.payouts.close-period.error"),
          type: "error",
        });

        return;
      }

      setCloseMessage({
        text: t("marketplace.payouts.close-period.success"),
        type: "success",
      });
      await fetchOverview();
    } catch {
      setCloseMessage({
        text: t("marketplace.payouts.close-period.error"),
        type: "error",
      });
    } finally {
      setClosing(false);
    }
  };

  const handleSyncStripe = async () => {
    if (!apiAccessToken) {
      return;
    }

    setSyncingStripe(true);
    setSyncStripeMessage(null);

    try {
      const res = await fetch("/api/payouts/ledger/sync-stripe", {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${apiAccessToken}`,
        },
        method: "POST",
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;

        setSyncStripeMessage({
          text: body?.error ?? t("marketplace.payouts.sync-stripe.error"),
          type: "error",
        });

        return;
      }

      const data = (await res.json()) as {
        chargeErrors?: Array<{ chargeId: string; message: string }>;
        chargeIdsAttempted: number;
        chargesSynced: number;
        promotedByDateCount: number;
      };

      const errCount = data.chargeErrors?.length ?? 0;
      const base = t("marketplace.payouts.sync-stripe.success", {
        charges: data.chargesSynced,
        promoted: data.promotedByDateCount,
      });
      const extra =
        errCount > 0
          ? ` ${t("marketplace.payouts.sync-stripe.partial", { count: errCount })}`
          : "";

      setSyncStripeMessage({
        text: `${base}${extra}`,
        type: errCount > 0 ? "warning" : "success",
      });
      await fetchOverview();
    } catch {
      setSyncStripeMessage({
        text: t("marketplace.payouts.sync-stripe.error"),
        type: "error",
      });
    } finally {
      setSyncingStripe(false);
    }
  };

  const handleExecuteBatch = async (batchId: string) => {
    if (!apiAccessToken) {
      return;
    }

    setExecutingBatchId(batchId);
    setExecuteMessage(null);

    try {
      const res = await fetch(`/api/payouts/batches/${batchId}/execute`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${apiAccessToken}`,
        },
        method: "POST",
      });

      const data = (await res.json().catch(() => null)) as {
        batchStatus?: string;
        error?: string;
        processed?: number;
      } | null;

      if (!res.ok) {
        setExecuteMessage({
          batchId,
          text: data?.error ?? t("marketplace.payouts.execute.error"),
          type: "error",
        });

        return;
      }

      setExecuteMessage({
        batchId,
        text: `${t("marketplace.payouts.execute.success")} (${data?.processed ?? 0} transfers, status: ${data?.batchStatus ?? "—"})`,
        type: "success",
      });
      setBatchDetail((prev) => {
        const next = { ...prev };

        delete next[batchId];

        return next;
      });
      await fetchOverview();
      await loadBatchDetail(batchId);
    } catch {
      setExecuteMessage({
        batchId,
        text: t("marketplace.payouts.execute.error"),
        type: "error",
      });
    } finally {
      setExecutingBatchId(null);
    }
  };

  const toggleExpand = async (batchId: string) => {
    if (expandedId === batchId) {
      setExpandedId(null);

      return;
    }

    setExpandedId(batchId);
    await loadBatchDetail(batchId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <p className="text-muted-foreground">
          {t("marketplace.payouts.sign-in-to-view")}
        </p>
        <Button asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (!dashboardContext) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <p className="text-muted-foreground">
          {t("marketplace.payouts.open-from-dashboard")}
        </p>
      </div>
    );
  }

  if (isAuthenticated && !apiAccessToken) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (loading || overview === null) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!overview.configured) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          {t("marketplace.payouts.not-configured")}
        </p>
      </div>
    );
  }

  const vendorSummary = overview.vendorSummary;
  const dashBase = overview.saleorDashboardBaseUrl;
  const vendorTitleById = overview.vendorTitleById;
  const pendingBatches = overview.batches.filter((b) => b.status !== "paid");
  const paidBatches = overview.batches.filter((b) => b.status === "paid");

  const renderBatchRows = (rows: PayoutBatchRow[]) =>
    rows.map((row) => {
      const isOpen = expandedId === row.id;
      const detail = batchDetail[row.id];

      return (
        <Fragment key={row.id}>
          <TableRow>
            <TableCell>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => void toggleExpand(row.id)}
                aria-expanded={isOpen}
                aria-label={t("marketplace.payouts.toggle-details")}
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </TableCell>
            <TableCell className="font-mono text-xs">{row.id}</TableCell>
            <TableCell className="text-muted-foreground">
              {formatPeriodRange(row.period_start, row.period_end)}
            </TableCell>
            <TableCell>{row.currency.toUpperCase()}</TableCell>
            <TableCell
              className={cn(
                row.status === "paid" && "text-green-600",
                row.status === "failed" && "text-destructive",
              )}
            >
              {row.status}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDateTime(row.created_at)}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {row.transfer_initiated_at
                ? formatUtcDateTime(row.transfer_initiated_at)
                : "—"}
            </TableCell>
          </TableRow>
          {isOpen ? (
            <TableRow>
              <TableCell colSpan={7} className="bg-muted/20 p-0">
                <div className="p-4">
                  {detail === "loading" || detail === undefined ? (
                    <div className="flex justify-center py-6">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : detail === "error" ? (
                    <p className="text-center text-sm text-muted-foreground">
                      {t("marketplace.payouts.failed-to-load-batch")}
                    </p>
                  ) : !detail.batch ? (
                    <p className="text-center text-sm text-muted-foreground">
                      {t("marketplace.payouts.failed-to-load-batch")}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {executeMessage && executeMessage.batchId === row.id ? (
                        <p
                          className={
                            executeMessage.type === "success"
                              ? "text-sm text-green-600"
                              : "text-sm text-destructive"
                          }
                        >
                          {executeMessage.text}
                        </p>
                      ) : null}
                      {detail.batch &&
                      ["locked", "partially_paid", "executing"].includes(
                        detail.batch.status,
                      ) ? (
                        <div className="flex flex-wrap items-center gap-3">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => void handleExecuteBatch(row.id)}
                            disabled={executingBatchId === row.id}
                          >
                            {executingBatchId === row.id ? (
                              <span className="inline-flex items-center gap-2">
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                {t("marketplace.payouts.execute.busy")}
                              </span>
                            ) : (
                              t("marketplace.payouts.execute.button")
                            )}
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            {t("marketplace.payouts.execute.hint")}
                          </span>
                        </div>
                      ) : null}
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>
                                {t("marketplace.payouts.ledgerLines.colVendor")}
                              </TableHead>
                              <TableHead>
                                {t("marketplace.payouts.batch.gross")}
                              </TableHead>
                              <TableHead>
                                {t("marketplace.payouts.batch.fees")}
                              </TableHead>
                              <TableHead>
                                {t("marketplace.payouts.batch.net")}
                              </TableHead>
                              <TableHead>
                                {t(
                                  "marketplace.payouts.batch.transfer-initiated",
                                )}
                              </TableHead>
                              <TableHead>{t("common.status")}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {detail.items.map((item) => {
                              const itemDash =
                                detail.saleorDashboardBaseUrl ?? dashBase;
                              const vName =
                                detail.vendorTitleById[item.vendor_id] ??
                                vendorTitleById[item.vendor_id] ??
                                item.vendor_id;
                              const vHref = dashboardModelHref(
                                itemDash,
                                item.vendor_id,
                              );

                              return (
                                <TableRow key={item.id}>
                                  <TableCell className="max-w-[200px]">
                                    {vHref ? (
                                      <a
                                        href={vHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary underline-offset-4 hover:underline"
                                        title={item.vendor_id}
                                      >
                                        {vName}
                                      </a>
                                    ) : (
                                      <span
                                        className="font-mono text-xs"
                                        title={item.vendor_id}
                                      >
                                        {vName}
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {formatMinorAmount(
                                      item.gross_minor,
                                      detail.batch!.currency,
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {formatMinorAmount(
                                      item.fees_minor,
                                      detail.batch!.currency,
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {formatMinorAmount(
                                      item.net_minor,
                                      detail.batch!.currency,
                                    )}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                    {item.stripe_transfer_created_at
                                      ? formatUtcDateTime(
                                          item.stripe_transfer_created_at,
                                        )
                                      : "—"}
                                  </TableCell>
                                  <TableCell>{item.status}</TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : null}
        </Fragment>
      );
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-3 rounded-md border bg-card p-4">
        <div>
          <h2 className="text-base font-semibold">
            {t("marketplace.payouts.sync-stripe.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("marketplace.payouts.sync-stripe.description")}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => void handleSyncStripe()}
          disabled={syncingStripe}
        >
          {syncingStripe ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              {t("marketplace.payouts.sync-stripe.busy")}
            </span>
          ) : (
            t("marketplace.payouts.sync-stripe.submit")
          )}
        </Button>
        {syncStripeMessage ? (
          <p
            className={cn(
              "text-sm",
              syncStripeMessage.type === "success" && "text-green-600",
              syncStripeMessage.type === "warning" && "text-amber-600",
              syncStripeMessage.type === "error" && "text-destructive",
            )}
          >
            {syncStripeMessage.text}
          </p>
        ) : null}
      </div>

      <div className="rounded-md border">
        <div className="border-b bg-muted/30 px-4 py-3">
          <h2 className="text-base font-semibold">
            {t("marketplace.payouts.ledgerLines.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("marketplace.payouts.ledgerLines.description")}
          </p>
        </div>
        {overview.ledgerLines.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            {t("marketplace.payouts.ledgerLines.empty")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t("marketplace.payouts.ledgerLines.colVendor")}
                  </TableHead>
                  <TableHead>
                    {t("marketplace.payouts.ledgerLines.colOrder")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("marketplace.payouts.ledgerLines.colAmount")}
                  </TableHead>
                  <TableHead>
                    {t("marketplace.payouts.ledgerLines.colStatus")}
                  </TableHead>
                  <TableHead>
                    {t("marketplace.payouts.ledgerLines.colAvailable")}
                  </TableHead>
                  <TableHead>
                    {t("marketplace.payouts.ledgerLines.colCharge")}
                  </TableHead>
                  <TableHead>
                    {t("marketplace.payouts.ledgerLines.colOrderPlaced")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overview.ledgerLines.map((line) => {
                  const vName =
                    vendorTitleById[line.vendor_id] ?? line.vendor_id;
                  const vHref = dashboardModelHref(dashBase, line.vendor_id);
                  const orderHref = dashboardOrderHref(dashBase, line.order_id);

                  return (
                    <TableRow key={line.id}>
                      <TableCell className="max-w-[200px]">
                        {vHref ? (
                          <a
                            href={vHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline-offset-4 hover:underline"
                            title={line.vendor_id}
                          >
                            {vName}
                          </a>
                        ) : (
                          <span
                            className="font-mono text-xs"
                            title={line.vendor_id}
                          >
                            {vName}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[180px]">
                        {line.order_id ? (
                          orderHref ? (
                            <a
                              href={orderHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs text-primary underline-offset-4 hover:underline"
                            >
                              {line.order_id}
                            </a>
                          ) : (
                            <span
                              className="font-mono text-xs"
                              title={line.order_id}
                            >
                              {line.order_id}
                            </span>
                          )
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatMinorAmount(line.amount_minor, line.currency)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "whitespace-nowrap text-sm",
                          fundsStatusClassName(line.funds_status),
                        )}
                      >
                        {line.funds_status}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {line.available_on
                          ? formatUtcDateTime(line.available_on)
                          : t(
                              "marketplace.payouts.ledgerLines.availableUnknown",
                            )}
                      </TableCell>
                      <TableCell
                        className="max-w-[120px] truncate font-mono text-xs"
                        title={line.stripe_charge_id ?? undefined}
                      >
                        {line.stripe_charge_id ?? "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDateTime(line.occurred_at)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-md border bg-card p-4">
        <div>
          <h2 className="text-base font-semibold">
            {t("marketplace.payouts.close-period.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("marketplace.payouts.close-period.description")}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="payout-period-start">
              {t("marketplace.payouts.close-period.start-label")}
            </Label>
            <Input
              id="payout-period-start"
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payout-period-end">
              {t("marketplace.payouts.close-period.end-label")}
            </Label>
            <Input
              id="payout-period-end"
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payout-currency">
              {t("marketplace.payouts.close-period.currency-label")}
            </Label>
            <Input
              id="payout-currency"
              value={closeCurrency}
              onChange={(e) => setCloseCurrency(e.target.value)}
              className="lowercase"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={() => void handleClosePeriod()}
            disabled={closing || !periodStart || !periodEnd || !closeCurrency}
          >
            {closing ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                …
              </span>
            ) : (
              t("marketplace.payouts.close-period.submit")
            )}
          </Button>
        </div>
        {closeMessage ? (
          <p
            className={
              closeMessage.type === "success"
                ? "text-sm text-green-600"
                : "text-sm text-destructive"
            }
          >
            {closeMessage.text}
          </p>
        ) : null}
      </div>

      {vendorSummary ? (
        <div className="rounded-md border bg-muted/30 p-4 text-sm">
          <p className="mb-2 font-medium">
            {t("marketplace.payouts.vendor-summary-title")}
          </p>
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <span>
              {t("marketplace.payouts.vendor-available")}:{" "}
              <span className="font-mono text-foreground">
                {formatMinorAmount(
                  vendorSummary.available_minor,
                  vendorSummary.currency ?? "USD",
                )}
              </span>
            </span>
            <span>
              {t("marketplace.payouts.vendor-pending")}:{" "}
              <span className="font-mono text-foreground">
                {formatMinorAmount(
                  vendorSummary.pending_minor,
                  vendorSummary.currency ?? "USD",
                )}
              </span>
            </span>
          </div>
        </div>
      ) : null}

      {overview.batches.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">
            {t("marketplace.payouts.no-batches")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {pendingBatches.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">
                {t("marketplace.payouts.batches-pending-title")}
              </h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10" />
                      <TableHead>{t("marketplace.payouts.table.id")}</TableHead>
                      <TableHead>
                        {t("marketplace.payouts.table.period")}
                      </TableHead>
                      <TableHead>
                        {t("marketplace.payouts.table.currency")}
                      </TableHead>
                      <TableHead>
                        {t("marketplace.payouts.table.status")}
                      </TableHead>
                      <TableHead>
                        {t("marketplace.payouts.table.created")}
                      </TableHead>
                      <TableHead>
                        {t("marketplace.payouts.table.transferInitiated")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{renderBatchRows(pendingBatches)}</TableBody>
                </Table>
              </div>
            </div>
          ) : null}

          {pendingBatches.length > 0 && paidBatches.length > 0 ? (
            <Separator />
          ) : null}

          {paidBatches.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">
                {t("marketplace.payouts.batches-paid-title")}
              </h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10" />
                      <TableHead>{t("marketplace.payouts.table.id")}</TableHead>
                      <TableHead>
                        {t("marketplace.payouts.table.period")}
                      </TableHead>
                      <TableHead>
                        {t("marketplace.payouts.table.currency")}
                      </TableHead>
                      <TableHead>
                        {t("marketplace.payouts.table.status")}
                      </TableHead>
                      <TableHead>
                        {t("marketplace.payouts.table.created")}
                      </TableHead>
                      <TableHead>
                        {t("marketplace.payouts.table.transferInitiated")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{renderBatchRows(paidBatches)}</TableBody>
                </Table>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
