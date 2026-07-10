"use client";

import { ShadcnTable } from "@/components/ui/ShadcnTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, useGetFormsQuery } from "@/redux/api/settingsApi";
import { useEffect, useMemo, useState } from "react";
import { formsListColumns } from "./components/formsListColumns";
import { DeleteFormDialog } from "./components/deleteFormDialog";
import { FormDialog } from "./components/formDialog";

const PAGE_SIZE = 10;

const getFormsFromResponse = (response: unknown): Form[] => {
  if (Array.isArray(response)) return response as Form[];
  if (!response || typeof response !== "object") return [];

  const value = response as Record<string, unknown>;
  const nestedResponse = value.response;

  if (Array.isArray(nestedResponse)) return nestedResponse as Form[];
  if (nestedResponse && typeof nestedResponse === "object") {
    const responseData = (nestedResponse as Record<string, unknown>).data;
    if (Array.isArray(responseData)) return responseData as Form[];
  }

  return Array.isArray(value.data) ? (value.data as Form[]) : [];
};

export default function FormsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<Form>();
  const [deletingForm, setDeletingForm] = useState<Form>();
  const { data, isLoading, isFetching, refetch } = useGetFormsQuery(
    search ? { search } : undefined,
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const forms = useMemo(() => getFormsFromResponse(data), [data]);
  const filteredForms = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return forms;

    return forms.filter((form) =>
      [form.id, form.form_name, form.form_type_id].some((value) =>
        String(value ?? "").toLowerCase().includes(term),
      ),
    );
  }, [forms, search]);

  const totalPages = Math.max(1, Math.ceil(filteredForms.length / PAGE_SIZE));
  const visiblePage = Math.min(currentPage, totalPages);
  const pageData = filteredForms.slice(
    (visiblePage - 1) * PAGE_SIZE,
    visiblePage * PAGE_SIZE,
  );

  return (
    <div className="min-h-[90vh] w-full rounded-xl bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <Input
          className="max-w-sm"
          type="text"
          placeholder="Search forms..."
          value={searchInput}
          onChange={(event) => {
            setSearchInput(event.target.value);
            setCurrentPage(1);
          }}
        />
        <Button onClick={() => setAddDialogOpen(true)}>Add Form</Button>
      </div>

      <ShadcnTable
        pagination={{
          currentPage: visiblePage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        isLoading={isLoading || isFetching}
        columns={formsListColumns(setEditingForm, setDeletingForm)}
        data={pageData}
      />

      <FormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSaved={refetch}
      />

      {editingForm ? (
        <FormDialog
          formData={editingForm}
          open
          onOpenChange={(open) => {
            if (!open) setEditingForm(undefined);
          }}
          onSaved={refetch}
        />
      ) : null}

      {deletingForm ? (
        <DeleteFormDialog
          formData={deletingForm}
          open
          onOpenChange={(open) => {
            if (!open) setDeletingForm(undefined);
          }}
          onDeleted={refetch}
        />
      ) : null}
    </div>
  );
}
