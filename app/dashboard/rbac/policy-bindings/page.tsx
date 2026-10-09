"use client";

import { ShadcnTable } from "@/components/ui/ShadcnTable";
import { Input } from "@/components/ui/input";
import {
  PolicyBinding,
  useDeletePolicyBindingMutation,
  useGetPolicyBindingsQuery,
} from "@/redux/api/rbacApi";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AddPolicyBindingDialog } from "./components/addPolicyBindingDialog";
import { policyBindingsListColumns } from "./components/policyBindingsListColumns";

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

const getPolicyBindingsFromResponse = (response: unknown): PolicyBinding[] => {
  if (Array.isArray(response)) return response as PolicyBinding[];
  if (!response || typeof response !== "object") return [];

  const value = response as Record<string, unknown>;
  const nestedResponse = value.response;

  if (Array.isArray(nestedResponse)) return nestedResponse as PolicyBinding[];
  if (nestedResponse && typeof nestedResponse === "object") {
    const responseData = (nestedResponse as Record<string, unknown>).data;
    if (Array.isArray(responseData)) return responseData as PolicyBinding[];
  }

  return Array.isArray(value.data) ? (value.data as PolicyBinding[]) : [];
};

export default function PolicyBindingsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { data, isLoading, isFetching, refetch } = useGetPolicyBindingsQuery();
  const [deletePolicyBinding, { isLoading: isDeleting }] =
    useDeletePolicyBindingMutation();
  const [deletingId, setDeletingId] = useState<string>();

  useEffect(() => {
    const timeoutId = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const bindings = useMemo(() => getPolicyBindingsFromResponse(data), [data]);
  const filteredBindings = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return bindings;

    return bindings.filter((binding) =>
      [
        binding.policy_name,
        binding.action,
        binding.resource_type,
        binding.role_name,
        binding.user_email,
      ].some((value) => String(value ?? "").toLowerCase().includes(term)),
    );
  }, [bindings, search]);

  const totalPages = Math.max(1, Math.ceil(filteredBindings.length / PAGE_SIZE));
  const visiblePage = Math.min(currentPage, totalPages);
  const pageData = filteredBindings.slice(
    (visiblePage - 1) * PAGE_SIZE,
    visiblePage * PAGE_SIZE,
  );

  const handleDelete = async (binding: PolicyBinding) => {
    const granteeLabel = binding.role_name
      ? `role "${binding.role_name}"`
      : `user "${binding.user_email}"`;
    const confirmed = window.confirm(
      `Revoke "${binding.policy_name}" from ${granteeLabel}?`,
    );
    if (!confirmed) return;

    setDeletingId(binding.id);
    try {
      const response = await deletePolicyBinding(binding.id).unwrap();
      toast.success(response.message);
      await refetch();
    } catch (error: unknown) {
      toast.error(getApiMessage(error, "Unable to revoke this permission."));
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
          placeholder="Search permissions..."
          value={searchInput}
          onChange={(event) => {
            setSearchInput(event.target.value);
            setCurrentPage(1);
          }}
        />
        <Button onClick={() => setAddDialogOpen(true)}>Grant Access</Button>
      </div>

      <ShadcnTable
        pagination={{
          currentPage: visiblePage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        isLoading={isLoading || isFetching}
        columns={policyBindingsListColumns(
          handleDelete,
          isDeleting ? deletingId : undefined,
        )}
        data={pageData}
      />

      <AddPolicyBindingDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={refetch}
      />
    </div>
  );
}
