"use client";

import { Button } from "@/components/ui/button";
import type { PolicyBinding } from "@/redux/api/rbacApi";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { describeResourceType } from "../resourceTypeLabel";

const sortableHeader = (label: string) =>
  function SortableHeader({ column }: HeaderContext<PolicyBinding, unknown>) {
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

export const policyBindingsListColumns = (
  onDelete: (binding: PolicyBinding) => void,
  deletingId?: string,
): ColumnDef<PolicyBinding>[] => [
  {
    id: "tab",
    header: sortableHeader("Tab"),
    cell: ({ row }) => {
      const { group } = describeResourceType(
        row.original.resource_type,
        row.original.action,
      );
      return <span>{group}</span>;
    },
  },
  {
    accessorKey: "policy_name",
    header: sortableHeader("Permission"),
    cell: ({ row }) => {
      const { label } = describeResourceType(
        row.original.resource_type,
        row.original.action,
      );
      return <span title={row.original.policy_name}>{label}</span>;
    },
  },
  {
    id: "grantee",
    header: "Granted to",
    cell: ({ row }) => {
      const { role_name, user_email } = row.original;
      if (role_name) return <span>Role: {role_name}</span>;
      if (user_email) return <span>User: {user_email}</span>;
      return <span className="text-muted-foreground">—</span>;
    },
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
            variant="destructive"
            size="sm"
            className="cursor-pointer"
            disabled={Boolean(deletingId)}
            onClick={() => onDelete(row.original)}
          >
            {isDeleting ? "Revoking..." : "Revoke"}
          </Button>
        </div>
      );
    },
  },
];
