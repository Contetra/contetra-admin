"use client";

import { Button } from "@/components/ui/button";
import { convertUTCtoIST, truncateLabelTable } from "@/lib/utils";
import type { CategoryEntry } from "@/redux/api/postsApi";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

const sortableHeader = (label: string) =>
  function SortableHeader({ column }: HeaderContext<CategoryEntry, unknown>) {
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

export const categoriesListColumns = (
  onUpdate: (category: CategoryEntry) => void,
  onDelete: (category: CategoryEntry) => void,
  deletingId?: string,
): ColumnDef<CategoryEntry>[] => [
  {
    accessorKey: "name",
    header: sortableHeader("Name"),
    cell: ({ row }) => <span>{truncateLabelTable(row.original.name)}</span>,
  },
  {
    accessorKey: "slug",
    header: sortableHeader("Slug"),
    cell: ({ row }) => <span>{truncateLabelTable(row.original.slug)}</span>,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span>{truncateLabelTable(row.original.description ?? "—")}</span>
    ),
  },
  {
    accessorKey: "status",
    header: sortableHeader("Status"),
    cell: ({ row }) => {
      const isPublished = row.original.status === "Published";
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isPublished
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {row.original.status}
        </span>
      );
    },
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
