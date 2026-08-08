"use client";

import { Button } from "@/components/ui/button";
import { truncateLabelTable } from "@/lib/utils";
import type { Role } from "@/redux/api/rbacApi";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

const sortableHeader = (label: string) =>
  function SortableHeader({ column }: HeaderContext<Role, unknown>) {
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

export const rolesListColumns = (
  onUpdate: (role: Role) => void,
  onDelete: (role: Role) => void,
  deletingId?: string,
): ColumnDef<Role>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <span>{truncateLabelTable(row.original.id)}</span>,
  },
  {
    accessorKey: "name",
    header: sortableHeader("Name"),
    cell: ({ row }) => <span>{truncateLabelTable(row.original.name)}</span>,
  },
  {
    accessorKey: "description",
    header: sortableHeader("Description"),
    cell: ({ row }) => (
      <span>{truncateLabelTable(row.original.description)}</span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      const isDeleting = deletingId === row.original.id;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            disabled={Boolean(deletingId)}
            onClick={() => onUpdate(row.original)}
          >
            Update
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="cursor-pointer"
            disabled={Boolean(deletingId)}
            onClick={() => onDelete(row.original)}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      );
    },
  },
];
