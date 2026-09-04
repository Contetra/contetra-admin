"use client";

import { ShadcnTable } from "@/components/ui/ShadcnTable";
import { Input } from "@/components/ui/input";
import {
  CategoryEntry,
  useDeleteCategoryEntryMutation,
  useGetCategoriesAdminQuery,
} from "@/redux/api/postsApi";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AddCategoryDialog } from "./components/addCategoryDialog";
import { categoriesListColumns } from "./components/categoriesListColumns";
import { UpdateCategoryDialog } from "./components/updateCategoryDialog";

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

const getCategoriesFromResponse = (response: unknown): CategoryEntry[] => {
  if (Array.isArray(response)) return response as CategoryEntry[];
  if (!response || typeof response !== "object") return [];

  const value = response as Record<string, unknown>;
  const nestedResponse = value.response;

  if (Array.isArray(nestedResponse)) return nestedResponse as CategoryEntry[];
  if (nestedResponse && typeof nestedResponse === "object") {
    const responseData = (nestedResponse as Record<string, unknown>).data;
    if (Array.isArray(responseData)) return responseData as CategoryEntry[];
  }

  return Array.isArray(value.data) ? (value.data as CategoryEntry[]) : [];
};

export default function CategoriesPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryEntry>();
  const { data, isLoading, isFetching, refetch } = useGetCategoriesAdminQuery(
    search ? { search } : undefined,
  );
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryEntryMutation();
  const [deletingId, setDeletingId] = useState<string>();

  useEffect(() => {
    const timeoutId = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const categories = useMemo(
    () => getCategoriesFromResponse(data),
    [data],
  );
  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;

    return categories.filter((category) =>
      [category.name, category.slug, category.description].some((value) =>
        String(value ?? "").toLowerCase().includes(term),
      ),
    );
  }, [categories, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCategories.length / PAGE_SIZE),
  );
  const visiblePage = Math.min(currentPage, totalPages);
  const pageData = filteredCategories.slice(
    (visiblePage - 1) * PAGE_SIZE,
    visiblePage * PAGE_SIZE,
  );

  const handleDelete = async (category: CategoryEntry) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`,
    );
    if (!confirmed) return;

    setDeletingId(category.id);
    try {
      const response = await deleteCategory(category.id).unwrap();
      toast.success(response.message);
      await refetch();
    } catch (error: unknown) {
      toast.error(getApiMessage(error, "Unable to delete the category."));
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
          placeholder="Search categories..."
          value={searchInput}
          onChange={(event) => {
            setSearchInput(event.target.value);
            setCurrentPage(1);
          }}
        />
        <Button onClick={() => setAddDialogOpen(true)}>Add Category</Button>
      </div>

      <ShadcnTable
        pagination={{
          currentPage: visiblePage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        isLoading={isLoading || isFetching}
        columns={categoriesListColumns(
          setEditingCategory,
          handleDelete,
          isDeleting ? deletingId : undefined,
        )}
        data={pageData}
      />

      <AddCategoryDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={refetch}
      />

      {editingCategory ? (
        <UpdateCategoryDialog
          category={editingCategory}
          open
          onOpenChange={(open) => {
            if (!open) setEditingCategory(undefined);
          }}
          onUpdated={refetch}
        />
      ) : null}
    </div>
  );
}
