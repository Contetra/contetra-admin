"use client";

import { Button } from "@/components/ui/button";
import { convertUTCtoIST, truncateLabelTable } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";

// Dashboard Deposit History
export type blogListColumnsTypes = {
  id: string;
  title: string;
  authors: string[];
  created_at: string;
  updated_at: string;
  market_status: boolean;
};

export type blogListColumnsTableSetTypes = {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
  search: string;
};

export const blogListColumns = (
  setUserDataData: React.Dispatch<
    React.SetStateAction<blogListColumnsTableSetTypes>
  >,
  onEdit?: (blog: any) => void,
): ColumnDef<blogListColumnsTypes>[] => [
  {
    accessorKey: "title",
    header: "Blog Title",
    cell: ({ row }) => {
      const title = row.getValue("title") as string;

      return <span > {truncateLabelTable(title)}</span>;
    },
  },
  {
    accessorKey: "authors",
    header: "Authors",
    cell: ({ row }) => {
      const author = row.getValue("authors") as string[];

      return <span className={` rounded-full  `}>{author.join(", ")}</span>;
    },
  },
  {
    accessorKey: "categories",
    header: "Category",
    cell: ({ row }) => {
      const author = row.getValue("categories") as string[];

      return <span className={` rounded-full  `}>{author.join(", ")}</span>;
    },
  },

  {
    accessorKey: "created_at",
    header: () => (
      <Button
        variant="ghost"
        onClick={() => {
          setUserDataData((prev) => ({
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
    cell: ({ row }) => {
      const postId = row.original.id as string;

      return (
        <div className="flex items-center justify-start gap-4">
          <Button
            className=" cursor-pointer"
            onClick={() => onEdit && onEdit(row.original)}
          >
            Edit Details
          </Button>
          <Link href={`/dashboard/blog/edit-blog/${postId}`}>
            <Button className=" cursor-pointer">Edit Blog</Button>
          </Link>
        </div>
      );
    },
  },
];
