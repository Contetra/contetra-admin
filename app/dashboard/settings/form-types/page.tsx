"use client";

import { ShadcnTable } from "@/components/ui/ShadcnTable";
import { Input } from "@/components/ui/input";
import {
  FormType,
  useDeleteFormTypeMutation,
  useGetFormTypesQuery,
} from "@/redux/api/settingsApi";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AddFormTypeDialog } from "./components/addFormTypeDialog";
import { formTypesListColumns } from "./components/formTypesListColumns";
import { UpdateFormTypeDialog } from "./components/updateFormTypeDialog";

const PAGE_SIZE = 10;

const getApiMessage = (value: unknown, fallback: string) => {
  if (!value || typeof value !== "object") return fallback;

  const record = value as Record<string, unknown>;
  if (typeof record.message === "string") return record.message;

  for (const key of ["response", "data"]) {
    const nested = record[key];
    if (nested && typeof nested === "object") {
      const message = (nested as Record<string, unknown>).message;
      if (typeof message === "string") return message;
    }
  }

  return fallback;
};

const getFormTypesFromResponse = (response: unknown): FormType[] => {
  if (Array.isArray(response)) return response as FormType[];
  if (!response || typeof response !== "object") return [];

  const value = response as Record<string, unknown>;
  const nestedResponse = value.response;

  if (Array.isArray(nestedResponse)) return nestedResponse as FormType[];
  if (nestedResponse && typeof nestedResponse === "object") {
    const responseData = (nestedResponse as Record<string, unknown>).data;
    if (Array.isArray(responseData)) return responseData as FormType[];
  }

  return Array.isArray(value.data) ? (value.data as FormType[]) : [];
};

export default function FormTypesPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingFormType, setEditingFormType] = useState<FormType>();
  const { data, isLoading, isFetching, refetch } = useGetFormTypesQuery(
    search ? { search } : undefined,
  );
  const [deleteFormType, { isLoading: isDeleting }] =
    useDeleteFormTypeMutation();
  const [deletingId, setDeletingId] = useState<string>();

  useEffect(() => {
    const timeoutId = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const formTypes = useMemo(() => getFormTypesFromResponse(data), [data]);
  const filteredFormTypes = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return formTypes;

    return formTypes.filter((formType) =>
      [formType.id, formType.name].some((value) =>
        String(value ?? "").toLowerCase().includes(term),
      ),
    );
  }, [formTypes, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredFormTypes.length / PAGE_SIZE),
  );
  const visiblePage = Math.min(currentPage, totalPages);
  const pageData = filteredFormTypes.slice(
    (visiblePage - 1) * PAGE_SIZE,
    visiblePage * PAGE_SIZE,
  );

  const handleDelete = async (formType: FormType) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${formType.name}"?`,
    );
    if (!confirmed) return;

    setDeletingId(formType.id);
    try {
      const response = await deleteFormType(formType.id).unwrap();
      toast.success(response.message);
      await refetch();
    } catch (error: unknown) {
      toast.error(getApiMessage(error, "Unable to delete the form type."));
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
          placeholder="Search form types..."
          value={searchInput}
          onChange={(event) => {
            setSearchInput(event.target.value);
            setCurrentPage(1);
          }}
        />
        <Button onClick={() => setAddDialogOpen(true)}>Add Form Type</Button>
      </div>

      <ShadcnTable
        pagination={{
          currentPage: visiblePage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        isLoading={isLoading || isFetching}
        columns={formTypesListColumns(
          setEditingFormType,
          handleDelete,
          isDeleting ? deletingId : undefined,
        )}
        data={pageData}
      />

      <AddFormTypeDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={refetch}
      />

      {editingFormType ? (
        <UpdateFormTypeDialog
          formType={editingFormType}
          open
          onOpenChange={(open) => {
            if (!open) setEditingFormType(undefined);
          }}
          onUpdated={refetch}
        />
      ) : null}
    </div>
  );
}
