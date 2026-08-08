"use client";

import { Button } from "@/components/ui/button";
import { truncateLabelTable } from "@/lib/utils";
import type { AuthorEntry } from "@/redux/api/postsApi";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

const sortableHeader = (label: string) =>
  function SortableHeader({ column }: HeaderContext<AuthorEntry, unknown>) {
    return (
      <Button
        variant="ghost"
        className="m-0 p-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {label}
        <ArrowUpDown className="h-4 w-4" />
      </Button>
    );
  };

export const authorsListColumns = (
  onDelete: (author: AuthorEntry) => void,
  deletingId?: string,
): ColumnDef<AuthorEntry>[] => [
  {
    accessorKey: "name",
    header: sortableHeader("Name"),
    cell: ({ row }) => <span>{truncateLabelTable(row.original.name)}</span>,
  },
  {
    accessorKey: "email",
    header: sortableHeader("Email"),
    cell: ({ row }) => <span>{truncateLabelTable(row.original.email)}</span>,
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      const isDeleting = deletingId === row.original.user_id;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            className="cursor-pointer"
            disabled={Boolean(deletingId)}
            onClick={() => onDelete(row.original)}
          >
            {isDeleting ? "Removing..." : "Remove"}
          </Button>
        </div>
      );
    },
  },
];
