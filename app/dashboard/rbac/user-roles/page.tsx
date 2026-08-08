"use client";

import { ShadcnTable } from "@/components/ui/ShadcnTable";
import { Input } from "@/components/ui/input";
import {
  UserRole,
  useDeleteUserRoleMutation,
  useGetUserRolesQuery,
} from "@/redux/api/rbacApi";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AddUserRoleDialog } from "./components/addUserRoleDialog";
import { userRolesListColumns } from "./components/userRolesListColumns";

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

const getUserRolesFromResponse = (response: unknown): UserRole[] => {
  if (Array.isArray(response)) return response as UserRole[];
  if (!response || typeof response !== "object") return [];

  const value = response as Record<string, unknown>;
  const nestedResponse = value.response;

  if (Array.isArray(nestedResponse)) return nestedResponse as UserRole[];
  if (nestedResponse && typeof nestedResponse === "object") {
    const responseData = (nestedResponse as Record<string, unknown>).data;
    if (Array.isArray(responseData)) return responseData as UserRole[];
  }

  return Array.isArray(value.data) ? (value.data as UserRole[]) : [];
};

export default function UserRolesPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { data, isLoading, isFetching, refetch } = useGetUserRolesQuery();
  const [deleteUserRole, { isLoading: isDeleting }] =
    useDeleteUserRoleMutation();
  const [deletingId, setDeletingId] = useState<string>();

  useEffect(() => {
    const timeoutId = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const userRoles = useMemo(() => getUserRolesFromResponse(data), [data]);
  const filteredUserRoles = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return userRoles;

    return userRoles.filter((userRole) =>
      [
        userRole.user_name,
        userRole.user_email,
        userRole.role_name,
        userRole.role_description,
      ].some((value) => String(value ?? "").toLowerCase().includes(term)),
    );
  }, [userRoles, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUserRoles.length / PAGE_SIZE),
  );
  const visiblePage = Math.min(currentPage, totalPages);
  const pageData = filteredUserRoles.slice(
    (visiblePage - 1) * PAGE_SIZE,
    visiblePage * PAGE_SIZE,
  );

  const handleDelete = async (userRole: UserRole) => {
    const confirmed = window.confirm(
      `Remove "${userRole.role_name}" from "${userRole.user_name}"?`,
    );
    if (!confirmed) return;

    const rowId = `${userRole.user_id}:${userRole.role_id}`;
    setDeletingId(rowId);
    try {
      const response = await deleteUserRole({
        userId: userRole.user_id,
        roleId: userRole.role_id,
      }).unwrap();
      toast.success(response.message);
      await refetch();
    } catch (error: unknown) {
      toast.error(getApiMessage(error, "Unable to remove the role."));
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
          placeholder="Search user roles..."
          value={searchInput}
          onChange={(event) => {
            setSearchInput(event.target.value);
            setCurrentPage(1);
          }}
        />
        <Button onClick={() => setAddDialogOpen(true)}>Assign Role</Button>
      </div>

      <ShadcnTable
        pagination={{
          currentPage: visiblePage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        isLoading={isLoading || isFetching}
        columns={userRolesListColumns(
          handleDelete,
          isDeleting ? deletingId : undefined,
        )}
        data={pageData}
      />

      <AddUserRoleDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={refetch}
      />
    </div>
  );
}
