"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@nimara/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nimara/ui/components/select";
import { useToast } from "@nimara/ui/hooks";

import type {
  Channels,
  DraftOrderCreateInput,
} from "@/graphql/generated/client";

import { createDraftOrder } from "../../actions";

type Channel = NonNullable<Channels["channels"]>[number];

interface OrderCreateClientProps {
  channels: Channel[];
}

export function OrderCreateClient({ channels }: OrderCreateClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations();

  const activeChannels = useMemo(
    () => channels.filter((c) => c.isActive),
    [channels],
  );

  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(true);
  const [pendingChannelId, setPendingChannelId] = useState(
    activeChannels[0]?.id ?? "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmChannel = async () => {
    if (!pendingChannelId || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const input: DraftOrderCreateInput = {
        channelId: pendingChannelId,
      };

      const result = await createDraftOrder(input);

      if (!result.ok) {
        toast({
          title: t(
            "marketplace.orders.dialogs.order-create.toast-create-failed",
          ),
          description: result.errors.map((e) => e.message).join(", "),
          variant: "destructive",
        });

        return;
      }

      const payload = result.data.draftOrderCreate;
      const errors = payload?.errors ?? [];

      if (errors.length) {
        toast({
          title: t(
            "marketplace.orders.dialogs.order-create.toast-create-failed-desc",
          ),
          description:
            errors
              .map((e) => e.message)
              .filter(Boolean)
              .join(", ") ||
            t(
              "marketplace.orders.dialogs.order-create.toast-create-failed-desc",
            ),
          variant: "destructive",
        });

        return;
      }

      const orderId = payload?.order?.id;

      if (!orderId) {
        toast({
          title: t(
            "marketplace.orders.dialogs.order-create.toast-create-failed-desc",
          ),
          description: t(
            "marketplace.orders.dialogs.order-create.toast-create-failed-desc",
          ),
          variant: "destructive",
        });

        return;
      }

      toast({
        title: t("marketplace.orders.dialogs.order-create.toast-draft-created"),
        description: t(
          "marketplace.orders.dialogs.order-create.toast-draft-created-desc",
        ),
      });
      setIsChannelDialogOpen(false);
      void router.push(`/orders/${orderId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isChannelDialogOpen} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {t("marketplace.orders.dialogs.order-create.select-channel")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            {t("marketplace.orders.dialogs.order-create.choose-channel-hint")}
          </p>
          <Select value={pendingChannelId} onValueChange={setPendingChannelId}>
            <SelectTrigger>
              <SelectValue
                placeholder={t(
                  "marketplace.orders.dialogs.order-create.select-channel-placeholder",
                )}
              />
            </SelectTrigger>
            <SelectContent>
              {activeChannels.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} ({c.currencyCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => router.push("/orders")}
            disabled={isSubmitting}
          >
            {t("common.cancel")}
          </Button>
          <Button
            className="bg-stone-900 hover:bg-stone-800"
            disabled={!pendingChannelId || isSubmitting}
            onClick={() => void handleConfirmChannel()}
          >
            {isSubmitting
              ? t("marketplace.orders.dialogs.order-create.creating")
              : t("common.continue")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
