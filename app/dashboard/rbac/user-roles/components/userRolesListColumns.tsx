"use client";

import { Button } from "@/components/ui/button";
import { truncateLabelTable } from "@/lib/utils";
import type { UserRole } from "@/redux/api/rbacApi";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

const sortableHeader = (label: string) =>
  function SortableHeader({ column }: HeaderContext<UserRole, unknown>) {
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

export const userRolesListColumns = (
  onDelete: (userRole: UserRole) => void,
  deletingId?: string,
): ColumnDef<UserRole>[] => [
  {
    accessorKey: "user_name",
    header: sortableHeader("User"),
    cell: ({ row }) => (
      <span>{truncateLabelTable(row.original.user_name)}</span>
    ),
  },
  {
    accessorKey: "user_email",
    header: sortableHeader("Email"),
    cell: ({ row }) => (
      <span>{truncateLabelTable(row.original.user_email)}</span>
    ),
  },
  {
    accessorKey: "role_name",
    header: sortableHeader("Role"),
    cell: ({ row }) => (
      <span>{truncateLabelTable(row.original.role_name)}</span>
    ),
  },
  {
    accessorKey: "role_description",
    header: sortableHeader("Description"),
    cell: ({ row }) => (
      <span>{truncateLabelTable(row.original.role_description)}</span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      const rowId = `${row.original.user_id}:${row.original.role_id}`;
      const isDeleting = deletingId === rowId;

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
