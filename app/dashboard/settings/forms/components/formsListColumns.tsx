"use client";

import { Button } from "@/components/ui/button";
import { convertUTCtoIST, truncateLabelTable } from "@/lib/utils";
import type { Form } from "@/redux/api/settingsApi";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

const sortableHeader = (label: string) =>
  function SortableHeader({ column }: HeaderContext<Form, unknown>) {
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

export const formsListColumns = (
  onUpdate: (form: Form) => void,
  onDelete: (form: Form) => void,
): ColumnDef<Form>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <span>{truncateLabelTable(row.original.id)}</span>,
  },
  {
    accessorKey: "form_name",
    header: sortableHeader("Form Name"),
    cell: ({ row }) => (
      <span>{truncateLabelTable(row.original.form_name)}</span>
    ),
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
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={() => onUpdate(row.original)}
        >
          Update
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="cursor-pointer"
          onClick={() => onDelete(row.original)}
        >
          Delete
        </Button>
      </div>
    ),
  },
];
