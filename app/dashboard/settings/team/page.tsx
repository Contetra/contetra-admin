"use client";

import { ShadcnTable } from "@/components/ui/ShadcnTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AppUser,
  useDeleteUserMutation,
  useGetUsersQuery,
} from "@/redux/api/userApi";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { usersListColumns } from "./components/usersListColumns";
import { UserDetailsDialog } from "./components/userDetailsDialog";
import { AddUserDialog } from "./components/addUserDialog";
import { UpdateUserDialog } from "./components/updateUserDialog";
import { ArrangeUsersDialog } from "./components/arrangeUsersDialog";

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

const getUsersFromResponse = (response: unknown): AppUser[] => {
  if (Array.isArray(response)) return response as AppUser[];
  if (!response || typeof response !== "object") return [];

  const value = response as Record<string, unknown>;
  const nestedResponse = value.response;

  if (Array.isArray(nestedResponse)) return nestedResponse as AppUser[];
  if (nestedResponse && typeof nestedResponse === "object") {
    const responseData = (nestedResponse as Record<string, unknown>).data;
    if (Array.isArray(responseData)) return responseData as AppUser[];
  }

  return Array.isArray(value.data) ? (value.data as AppUser[]) : [];
};

export default function TeamPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingUser, setViewingUser] = useState<AppUser>();
  const [editingUser, setEditingUser] = useState<AppUser>();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [arrangeDialogOpen, setArrangeDialogOpen] = useState(false);
  const { data, isLoading, isFetching, refetch } = useGetUsersQuery(
    search ? { search } : undefined,
  );
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [deletingId, setDeletingId] = useState<string>();

  useEffect(() => {
    const timeoutId = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const users = useMemo(() => getUsersFromResponse(data), [data]);

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const visiblePage = Math.min(currentPage, totalPages);
  const pageData = users.slice(
    (visiblePage - 1) * PAGE_SIZE,
    visiblePage * PAGE_SIZE,
  );

  const handleDelete = async (user: AppUser) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${user.name}"?`,
    );
    if (!confirmed) return;

    setDeletingId(user.id);
    try {
      const response = await deleteUser(user.id).unwrap();
      toast.success(response.message);
      await refetch();
    } catch (error: unknown) {
      toast.error(getApiMessage(error, "Unable to delete the user."));
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
          placeholder="Search users..."
          value={searchInput}
          onChange={(event) => {
            setSearchInput(event.target.value);
            setCurrentPage(1);
          }}
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setArrangeDialogOpen(true)}
          >
            Arrange
          </Button>
          <Button onClick={() => setAddDialogOpen(true)}>Add User</Button>
        </div>
      </div>

      <ShadcnTable
        pagination={{
          currentPage: visiblePage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        isLoading={isLoading || isFetching}
        columns={usersListColumns(
          setViewingUser,
          setEditingUser,
          handleDelete,
          isDeleting ? deletingId : undefined,
        )}
        data={pageData}
      />

      {viewingUser ? (
        <UserDetailsDialog
          user={viewingUser}
          open
          onOpenChange={(open) => {
            if (!open) setViewingUser(undefined);
          }}
        />
      ) : null}

      {editingUser ? (
        <UpdateUserDialog
          user={editingUser}
          open
          onOpenChange={(open) => {
            if (!open) setEditingUser(undefined);
          }}
          onUpdated={refetch}
        />
      ) : null}

      <AddUserDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={refetch}
      />

      <ArrangeUsersDialog
        users={users}
        open={arrangeDialogOpen}
        onOpenChange={setArrangeDialogOpen}
        onSaved={refetch}
      />
    </div>
  );
}
