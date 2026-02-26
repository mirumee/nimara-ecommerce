"use client";

import { useRouter } from "next/navigation";
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
          title: "Failed to create draft order",
          description: result.errors.map((e) => e.message).join(", "),
          variant: "destructive",
        });

        return;
      }

      const payload = result.data.draftOrderCreate;
      const errors = payload?.errors ?? [];

      if (errors.length) {
        toast({
          title: "Draft order creation failed",
          description:
            errors
              .map((e) => e.message)
              .filter(Boolean)
              .join(", ") || "Unknown error",
          variant: "destructive",
        });

        return;
      }

      const orderId = payload?.order?.id;

      if (!orderId) {
        toast({
          title: "Draft order creation failed",
          description: "No order returned",
          variant: "destructive",
        });

        return;
      }

      toast({
        title: "Draft created",
        description: "Opening draft order…",
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
          <DialogTitle>Select channel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Choose a channel to start creating the order.
          </p>
          <Select value={pendingChannelId} onValueChange={setPendingChannelId}>
            <SelectTrigger>
              <SelectValue placeholder="Select channel" />
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
            Cancel
          </Button>
          <Button
            className="bg-stone-900 hover:bg-stone-800"
            disabled={!pendingChannelId || isSubmitting}
            onClick={() => void handleConfirmChannel()}
          >
            {isSubmitting ? "Creating..." : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
