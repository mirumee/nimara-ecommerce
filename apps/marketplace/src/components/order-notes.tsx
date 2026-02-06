import { useEffect, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@nimara/ui/components/card";
import { Skeleton } from "@nimara/ui/components/skeleton";
import { useToast } from "@nimara/ui/hooks";

import { addOrderNote } from "@/app/(authenticated)/orders/[id]/actions";
import { Textarea } from "@/components/ui/textarea";
import {
  type Order_order_Order_events_OrderEvent as OrderEvent,
  type OrderNoteAdd_Mutation,
} from "@/graphql/generated/client";

import { getOrderNotes } from "../lib/order-events-utils";
import { formatDateTime } from "../lib/time";

type OrderNoteEvent = OrderEvent;

interface OrderNotesProps {
  events: OrderNoteEvent[];
  isLoading?: boolean;
  onNoteAdded?: () => void;
  orderId: string;
}

export function OrderNotes({
  orderId,
  events,
  isLoading = false,
  onNoteAdded,
}: OrderNotesProps) {
  const notes = getOrderNotes(events);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  const { toast } = useToast();

  // Hide skeleton once refreshed notes include the new note (we keep newNote until then)
  useEffect(() => {
    const trimmed = newNote.trim();

    if (
      isAddingNote &&
      trimmed &&
      notes.some((n) => n.message === trimmed)
    ) {
      setIsAddingNote(false);
      setNewNote("");
    }
  }, [isAddingNote, notes, newNote]);

  const handleAddNote = async () => {
    const message = newNote.trim();

    if (!message) {
      return;
    }

    setIsAddingNote(true);
    setIsEditingNotes(false);

    try {
      const result = await addOrderNote(
        {
          order: orderId,
          input: { message },
        },
        orderId
      );

      if (!result.ok) {
        const errorMessage = result.errors
          .map((e: { message?: string | null }) => e.message || "Unknown error")
          .join(", ");

        toast({
          title: "Failed to add note",
          description: errorMessage,
          variant: "destructive",
        });
        setIsAddingNote(false);
        setNewNote("");

        return;
      }

      const addNoteData = result.data as unknown as OrderNoteAdd_Mutation;
      const payload = addNoteData?.orderNoteAdd;
      const errors = payload?.errors ?? [];

      if (errors.length > 0) {
        const errorMessage =
          errors
            .map((e: { message: string | null }) => e.message)
            .filter(Boolean)
            .join(", ") || "Unknown error";

        toast({
          title: "Failed to add note",
          description: errorMessage,
          variant: "destructive",
        });
        setIsAddingNote(false);
        setNewNote("");

        return;
      }

      toast({
        title: "Note added",
        description: "The note was added to the order.",
      });

      onNoteAdded?.();
    } catch (error) {
      toast({
        title: "Failed to add note",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsAddingNote(false);
      setNewNote("");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Order notes</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (!isEditingNotes) {
              console.log("Edit order notes");
            }
            setIsEditingNotes(!isEditingNotes);
          }}
        >
          {isEditingNotes ? "Cancel" : "Edit"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading || isAddingNote ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col gap-2 border-l-2 border-muted pl-4"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-full max-w-sm" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {isEditingNotes && (
              <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                <Textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-20"
                />
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                >
                  Add note
                </Button>
              </div>
            )}

            {!isEditingNotes &&
              (notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No notes from customer
                </p>
              ) : (
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="mb-1 flex flex-col gap-1 border-l-2 border-muted pl-4"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {note.user?.email ?? "Customer"}
                        </span>
                        {note.date && (
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(new Date(note.date))}
                          </span>
                        )}
                      </div>
                      {note.message && (
                        <p className="text-sm">{note.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}
