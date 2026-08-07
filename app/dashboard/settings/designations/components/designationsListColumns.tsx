"use client";

import { Button } from "@/components/ui/button";
import { convertUTCtoIST, truncateLabelTable } from "@/lib/utils";
import type { Designation } from "@/redux/api/settingsApi";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

const sortableHeader = (label: string) =>
  function SortableHeader({ column }: HeaderContext<Designation, unknown>) {
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

export const designationsListColumns = (
  onUpdate: (designation: Designation) => void,
  onDelete: (designation: Designation) => void,
  deletingId?: string,
): ColumnDef<Designation>[] => [
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
    accessorKey: "created_at",
    header: sortableHeader("Created At"),
    cell: ({ row }) => <span>{convertUTCtoIST(row.original.created_at)}</span>,
  },
  {
    accessorKey: "updated_at",
    header: sortableHeader("Updated At"),
    cell: ({ row }) => <span>{convertUTCtoIST(row.original.updated_at)}</span>,
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
