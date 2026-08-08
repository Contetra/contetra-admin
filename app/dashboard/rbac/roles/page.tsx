"use client";

import { ShadcnTable } from "@/components/ui/ShadcnTable";
import { Input } from "@/components/ui/input";
import {
  Role,
  useDeleteRoleMutation,
  useGetRolesQuery,
} from "@/redux/api/rbacApi";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AddRoleDialog } from "./components/addRoleDialog";
import { rolesListColumns } from "./components/rolesListColumns";
import { UpdateRoleDialog } from "./components/updateRoleDialog";

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

const getRolesFromResponse = (response: unknown): Role[] => {
  if (Array.isArray(response)) return response as Role[];
  if (!response || typeof response !== "object") return [];

  const value = response as Record<string, unknown>;
  const nestedResponse = value.response;

  if (Array.isArray(nestedResponse)) return nestedResponse as Role[];
  if (nestedResponse && typeof nestedResponse === "object") {
    const responseData = (nestedResponse as Record<string, unknown>).data;
    if (Array.isArray(responseData)) return responseData as Role[];
  }

  return Array.isArray(value.data) ? (value.data as Role[]) : [];
};

export default function RolesPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role>();
  const { data, isLoading, isFetching, refetch } = useGetRolesQuery(
    search ? { search } : undefined,
  );
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();
  const [deletingId, setDeletingId] = useState<string>();

  useEffect(() => {
    const timeoutId = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const roles = useMemo(() => getRolesFromResponse(data), [data]);
  const filteredRoles = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return roles;

    return roles.filter((role) =>
      [role.id, role.name, role.description].some((value) =>
        String(value ?? "").toLowerCase().includes(term),
      ),
    );
  }, [roles, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / PAGE_SIZE));
  const visiblePage = Math.min(currentPage, totalPages);
  const pageData = filteredRoles.slice(
    (visiblePage - 1) * PAGE_SIZE,
    visiblePage * PAGE_SIZE,
  );

  const handleDelete = async (role: Role) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${role.name}"?`,
    );
    if (!confirmed) return;

    setDeletingId(role.id);
    try {
      const response = await deleteRole(role.id).unwrap();
      toast.success(response.message);
      await refetch();
    } catch (error: unknown) {
      toast.error(getApiMessage(error, "Unable to delete the role."));
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
          placeholder="Search roles..."
          value={searchInput}
          onChange={(event) => {
            setSearchInput(event.target.value);
            setCurrentPage(1);
          }}
        />
        <Button onClick={() => setAddDialogOpen(true)}>Add Role</Button>
      </div>

      <ShadcnTable
        pagination={{
          currentPage: visiblePage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        isLoading={isLoading || isFetching}
        columns={rolesListColumns(
          setEditingRole,
          handleDelete,
          isDeleting ? deletingId : undefined,
        )}
        data={pageData}
      />

      <AddRoleDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={refetch}
      />

      {editingRole ? (
        <UpdateRoleDialog
          role={editingRole}
          open
          onOpenChange={(open) => {
            if (!open) setEditingRole(undefined);
          }}
          onUpdated={refetch}
        />
      ) : null}
    </div>
  );
}
