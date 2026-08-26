"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AppUser,
  useReorderUsersMutation,
} from "@/redux/api/userApi";

type ArrangeUsersDialogProps = {
  users: AppUser[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void | Promise<unknown>;
};

const getApiMessage = (value: unknown, fallback: string) => {
  let current: unknown = value;

  for (
    let depth = 0;
    depth < 4 && current && typeof current === "object";
    depth++
  ) {
    const record = current as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (Array.isArray(record.message)) return record.message.join(", ");
    current = record.data ?? record.response;
  }

  return fallback;
};

export function ArrangeUsersDialog({
  users,
  open,
  onOpenChange,
  onSaved,
}: ArrangeUsersDialogProps) {
  const [orderedUsers, setOrderedUsers] = useState<AppUser[]>([]);
  const [reorderUsers, { isLoading }] = useReorderUsersMutation();

  useEffect(() => {
    if (!open) return;

    setOrderedUsers(
      [...users]
        .filter((user) => user.designation_id)
        .sort((left, right) => {
          const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER;
          const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER;
          if (leftOrder !== rightOrder) return leftOrder - rightOrder;
          return left.name.localeCompare(right.name);
        }),
    );
  }, [open, users]);

  const moveUser = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= orderedUsers.length) return;

    setOrderedUsers((current) => {
      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(nextIndex, 0, moved);
      return next;
    });
  };

  const handleSave = async () => {
    if (orderedUsers.length === 0) {
      toast.error(
        "Assign designations before arranging team members.",
      );
      return;
    }

    try {
      const response = await reorderUsers(
        orderedUsers.map((user) => user.id),
      ).unwrap();
      toast.success(response.message);
      onOpenChange(false);
      await onSaved();
    } catch (error: unknown) {
      toast.error(getApiMessage(error, "Unable to save team order."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Arrange Team</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Only members with a designation can be ordered. This is the
          sequence rendered on the website.
        </p>

        <div className="max-h-[50vh] space-y-2 overflow-y-auto">
          {orderedUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No members with a designation yet.
            </p>
          ) : (
            orderedUsers.map((user, index) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {index + 1}. {user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.designation ?? "No designation"}
                    {user.department ? ` · ${user.department}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={isLoading || index === 0}
                    onClick={() => moveUser(index, -1)}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={isLoading || index === orderedUsers.length - 1}
                    onClick={() => moveUser(index, 1)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isLoading || orderedUsers.length === 0}
            onClick={handleSave}
          >
            {isLoading ? "Saving..." : "Save order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
