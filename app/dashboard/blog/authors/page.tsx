"use client";

import { ShadcnTable } from "@/components/ui/ShadcnTable";
import { Input } from "@/components/ui/input";
import {
  AuthorEntry,
  useDeleteAuthorEntryMutation,
  useGetAuthorsAdminQuery,
} from "@/redux/api/postsApi";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AddAuthorDialog } from "./components/addAuthorDialog";
import { authorsListColumns } from "./components/authorsListColumns";

const PAGE_SIZE = 10;

const getApiMessage = (value: unknown, fallback: string) => {
  let current: unknown = value;

  for (let depth = 0; depth < 4 && current && typeof current === "object"; depth++) {
    const record = current as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (Array.isArray(record.message)) return record.message.join(", ");
    current = record.data ?? record.response;
  }

  return fallback;
};

const getAuthorsFromResponse = (response: unknown): AuthorEntry[] => {
  if (Array.isArray(response)) return response as AuthorEntry[];
  if (!response || typeof response !== "object") return [];

  const value = response as Record<string, unknown>;
  const nestedResponse = value.response;

  if (Array.isArray(nestedResponse)) return nestedResponse as AuthorEntry[];
  if (nestedResponse && typeof nestedResponse === "object") {
    const responseData = (nestedResponse as Record<string, unknown>).data;
    if (Array.isArray(responseData)) return responseData as AuthorEntry[];
  }

  return Array.isArray(value.data) ? (value.data as AuthorEntry[]) : [];
};

export default function AuthorsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { data, isLoading, isFetching, refetch } = useGetAuthorsAdminQuery(
    search ? { search } : undefined,
  );
  const [deleteAuthor, { isLoading: isDeleting }] =
    useDeleteAuthorEntryMutation();
  const [deletingId, setDeletingId] = useState<string>();

  useEffect(() => {
    const timeoutId = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const authors = useMemo(() => getAuthorsFromResponse(data), [data]);
  const filteredAuthors = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return authors;

    return authors.filter((author) =>
      [author.user_id, author.name, author.email].some((value) =>
        String(value ?? "").toLowerCase().includes(term),
      ),
    );
  }, [authors, search]);

  const totalPages = Math.max(1, Math.ceil(filteredAuthors.length / PAGE_SIZE));
  const visiblePage = Math.min(currentPage, totalPages);
  const pageData = filteredAuthors.slice(
    (visiblePage - 1) * PAGE_SIZE,
    visiblePage * PAGE_SIZE,
  );

  const handleDelete = async (author: AuthorEntry) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${author.name}" as an author?`,
    );
    if (!confirmed) return;

    setDeletingId(author.user_id);
    try {
      const response = await deleteAuthor(author.user_id).unwrap();
      toast.success(response.message);
      await refetch();
    } catch (error: unknown) {
      toast.error(getApiMessage(error, "Unable to delete the author."));
    } finally {
      setDeletingId(undefined);
    }
  };

  return (
    <div className="min-h-[90vh] w-full rounded-xl bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <Input
          className="max-w-sm"
          type="text"
          placeholder="Search authors..."
          value={searchInput}
          onChange={(event) => {
            setSearchInput(event.target.value);
            setCurrentPage(1);
          }}
        />
        <Button onClick={() => setAddDialogOpen(true)}>Add Author</Button>
      </div>

      <ShadcnTable
        pagination={{
          currentPage: visiblePage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        isLoading={isLoading || isFetching}
        columns={authorsListColumns(
          handleDelete,
          isDeleting ? deletingId : undefined,
        )}
        data={pageData}
      />

      <AddAuthorDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={refetch}
      />
    </div>
  );
}
