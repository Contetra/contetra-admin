"use client";

import { Button } from "@/components/ui/button";
import { truncateLabelTable } from "@/lib/utils";
import type { AppUser } from "@/redux/api/userApi";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

const sortableHeader = (label: string) =>
  function SortableHeader({ column }: HeaderContext<AppUser, unknown>) {
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

export const usersListColumns = (
  onView: (user: AppUser) => void,
  onUpdate: (user: AppUser) => void,
  onDelete: (user: AppUser) => void,
  deletingId?: string,
): ColumnDef<AppUser>[] => [
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
    accessorKey: "user_name",
    header: sortableHeader("Username"),
    cell: ({ row }) => (
      <span>{truncateLabelTable(row.original.user_name)}</span>
    ),
  },
  {
    accessorKey: "department",
    header: sortableHeader("Department"),
    cell: ({ row }) => <span>{row.original.department ?? "—"}</span>,
  },
  {
    accessorKey: "designation",
    header: sortableHeader("Designation"),
    cell: ({ row }) => <span>{row.original.designation ?? "—"}</span>,
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
            onClick={() => onView(row.original)}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            disabled={Boolean(deletingId)}
            onClick={() => onUpdate(row.original)}
          >
            Edit
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
