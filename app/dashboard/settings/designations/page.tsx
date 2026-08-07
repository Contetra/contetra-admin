"use client";

import { ShadcnTable } from "@/components/ui/ShadcnTable";
import { Input } from "@/components/ui/input";
import {
  Designation,
  useDeleteDesignationMutation,
  useGetDesignationsQuery,
} from "@/redux/api/settingsApi";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AddDesignationDialog } from "./components/addDesignationDialog";
import { designationsListColumns } from "./components/designationsListColumns";
import { UpdateDesignationDialog } from "./components/updateDesignationDialog";

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

const getDesignationsFromResponse = (response: unknown): Designation[] => {
  if (Array.isArray(response)) return response as Designation[];
  if (!response || typeof response !== "object") return [];

  const value = response as Record<string, unknown>;
  const nestedResponse = value.response;

  if (Array.isArray(nestedResponse)) return nestedResponse as Designation[];
  if (nestedResponse && typeof nestedResponse === "object") {
    const responseData = (nestedResponse as Record<string, unknown>).data;
    if (Array.isArray(responseData)) return responseData as Designation[];
  }

  return Array.isArray(value.data) ? (value.data as Designation[]) : [];
};

export default function DesignationsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<Designation>();
  const { data, isLoading, isFetching, refetch } = useGetDesignationsQuery(
    search ? { search } : undefined,
  );
  const [deleteDesignation, { isLoading: isDeleting }] =
    useDeleteDesignationMutation();
  const [deletingId, setDeletingId] = useState<string>();

  useEffect(() => {
    const timeoutId = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const designations = useMemo(
    () => getDesignationsFromResponse(data),
    [data],
  );
  const filteredDesignations = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return designations;

    return designations.filter((designation) =>
      [designation.id, designation.name].some((value) =>
        String(value ?? "").toLowerCase().includes(term),
      ),
    );
  }, [designations, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDesignations.length / PAGE_SIZE),
  );
  const visiblePage = Math.min(currentPage, totalPages);
  const pageData = filteredDesignations.slice(
    (visiblePage - 1) * PAGE_SIZE,
    visiblePage * PAGE_SIZE,
  );

  const handleDelete = async (designation: Designation) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${designation.name}"?`,
    );
    if (!confirmed) return;

    setDeletingId(designation.id);
    try {
      const response = await deleteDesignation(designation.id).unwrap();
      toast.success(response.message);
      await refetch();
    } catch (error: unknown) {
      toast.error(getApiMessage(error, "Unable to delete the designation."));
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
          placeholder="Search designations..."
          value={searchInput}
          onChange={(event) => {
            setSearchInput(event.target.value);
            setCurrentPage(1);
          }}
        />
        <Button onClick={() => setAddDialogOpen(true)}>Add Designation</Button>
      </div>

      <ShadcnTable
        pagination={{
          currentPage: visiblePage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        isLoading={isLoading || isFetching}
        columns={designationsListColumns(
          setEditingDesignation,
          handleDelete,
          isDeleting ? deletingId : undefined,
        )}
        data={pageData}
      />

      <AddDesignationDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={refetch}
      />

      {editingDesignation ? (
        <UpdateDesignationDialog
          designation={editingDesignation}
          open
          onOpenChange={(open) => {
            if (!open) setEditingDesignation(undefined);
          }}
          onUpdated={refetch}
        />
      ) : null}
    </div>
  );
}
