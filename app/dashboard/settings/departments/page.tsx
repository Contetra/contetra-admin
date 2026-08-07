"use client";

import { ShadcnTable } from "@/components/ui/ShadcnTable";
import { Input } from "@/components/ui/input";
import {
  Department,
  useDeleteDepartmentMutation,
  useGetDepartmentsQuery,
} from "@/redux/api/settingsApi";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AddDepartmentDialog } from "./components/addDepartmentDialog";
import { departmentsListColumns } from "./components/departmentsListColumns";
import { UpdateDepartmentDialog } from "./components/updateDepartmentDialog";

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

const getDepartmentsFromResponse = (response: unknown): Department[] => {
  if (Array.isArray(response)) return response as Department[];
  if (!response || typeof response !== "object") return [];

  const value = response as Record<string, unknown>;
  const nestedResponse = value.response;

  if (Array.isArray(nestedResponse)) return nestedResponse as Department[];
  if (nestedResponse && typeof nestedResponse === "object") {
    const responseData = (nestedResponse as Record<string, unknown>).data;
    if (Array.isArray(responseData)) return responseData as Department[];
  }

  return Array.isArray(value.data) ? (value.data as Department[]) : [];
};

export default function DepartmentsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department>();
  const { data, isLoading, isFetching, refetch } = useGetDepartmentsQuery(
    search ? { search } : undefined,
  );
  const [deleteDepartment, { isLoading: isDeleting }] =
    useDeleteDepartmentMutation();
  const [deletingId, setDeletingId] = useState<string>();

  useEffect(() => {
    const timeoutId = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const departments = useMemo(
    () => getDepartmentsFromResponse(data),
    [data],
  );
  const filteredDepartments = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return departments;

    return departments.filter((department) =>
      [department.id, department.name].some((value) =>
        String(value ?? "").toLowerCase().includes(term),
      ),
    );
  }, [departments, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDepartments.length / PAGE_SIZE),
  );
  const visiblePage = Math.min(currentPage, totalPages);
  const pageData = filteredDepartments.slice(
    (visiblePage - 1) * PAGE_SIZE,
    visiblePage * PAGE_SIZE,
  );

  const handleDelete = async (department: Department) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${department.name}"?`,
    );
    if (!confirmed) return;

    setDeletingId(department.id);
    try {
      const response = await deleteDepartment(department.id).unwrap();
      toast.success(response.message);
      await refetch();
    } catch (error: unknown) {
      toast.error(getApiMessage(error, "Unable to delete the department."));
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
          placeholder="Search departments..."
          value={searchInput}
          onChange={(event) => {
            setSearchInput(event.target.value);
            setCurrentPage(1);
          }}
        />
        <Button onClick={() => setAddDialogOpen(true)}>Add Department</Button>
      </div>

      <ShadcnTable
        pagination={{
          currentPage: visiblePage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        isLoading={isLoading || isFetching}
        columns={departmentsListColumns(
          setEditingDepartment,
          handleDelete,
          isDeleting ? deletingId : undefined,
        )}
        data={pageData}
      />

      <AddDepartmentDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={refetch}
      />

      {editingDepartment ? (
        <UpdateDepartmentDialog
          department={editingDepartment}
          open
          onOpenChange={(open) => {
            if (!open) setEditingDepartment(undefined);
          }}
          onUpdated={refetch}
        />
      ) : null}
    </div>
  );
}
