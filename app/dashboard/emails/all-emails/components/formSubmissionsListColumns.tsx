"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { convertUTCtoIST, truncateLabelTable } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export type FormSubmissionPayloadItem = Record<string, string>;

export type formSubmissionsListColumnsTypes = {
  id: string;
  form_name: string;
  form_type: string;
  payload: FormSubmissionPayloadItem[];
  created_at: string;
};

export type formSubmissionsListColumnsTableSetTypes = {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
  search: string;
};

const formatFieldLabel = (key: string) =>
  key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const getPayloadFields = (payload: FormSubmissionPayloadItem[]) =>
  payload.flatMap((item, index) =>
    Object.entries(item).map(([key, value]) => ({
      id: `${index}-${key}`,
      label: formatFieldLabel(key),
      value: String(value ?? ""),
    })),
  );

function FormSubmissionDetailsDialog({
  formName,
  formType,
  payload,
}: {
  formName: string;
  formType: string;
  payload: FormSubmissionPayloadItem[];
}) {
  const fields = getPayloadFields(Array.isArray(payload) ? payload : []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="cursor-pointer">
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submission Details</DialogTitle>
          <DialogDescription>
            {formName} · {formType}
          </DialogDescription>
        </DialogHeader>
        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payload data available.</p>
        ) : (
          <dl className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
            {fields.map((field) => (
              <div key={field.id} className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">
                  {field.label}
                </dt>
                <dd className="text-sm break-words">{field.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </DialogContent>
    </Dialog>
  );
}

export const formSubmissionsListColumns = (
  setPaginationData: React.Dispatch<
    React.SetStateAction<formSubmissionsListColumnsTableSetTypes>
  >,
): ColumnDef<formSubmissionsListColumnsTypes>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      return <span>{truncateLabelTable(id)}</span>;
    },
  },
  {
    accessorKey: "form_name",
    header: "Form Name",
    cell: ({ row }) => {
      const formName = row.getValue("form_name") as string;
      return <span>{truncateLabelTable(formName)}</span>;
    },
  },
  {
    accessorKey: "form_type",
    header: "Form Type",
    cell: ({ row }) => {
      const formType = row.getValue("form_type") as string;
      return <span>{formType}</span>;
    },
  },
  {
    accessorKey: "created_at",
    header: () => (
      <Button
        variant="ghost"
        onClick={() => {
          setPaginationData((prev) => ({
            ...prev,
            sortBy: "created_at",
            sortOrder: prev?.sortOrder === "asc" ? "desc" : "asc",
          }));
        }}
        className="p-0 m-0"
      >
        Created At
        <ArrowUpDown className="h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const formattedDate = convertUTCtoIST(row.original.created_at);
      return <span>{formattedDate}</span>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => (
      <FormSubmissionDetailsDialog
        formName={row.original.form_name}
        formType={row.original.form_type}
        payload={row.original.payload}
      />
    ),
  },
];
