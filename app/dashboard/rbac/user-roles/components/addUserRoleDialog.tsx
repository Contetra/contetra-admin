"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";
import { Role, useCreateUserRoleMutation, useGetRolesQuery } from "@/redux/api/rbacApi";
import { AppUser, useGetUsersQuery } from "@/redux/api/userApi";

const formSchema = z.object({
  user_ids: z.array(z.string()).min(1, "Select at least one user."),
  role_id: z.string().min(1, "Select a role."),
});

type AddUserRoleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void | Promise<unknown>;
};

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

export function AddUserRoleDialog({
  open,
  onOpenChange,
  onCreated,
}: AddUserRoleDialogProps) {
  const { data: usersResponse, isLoading: usersLoading } = useGetUsersQuery();
  const users = useMemo(() => getUsersFromResponse(usersResponse), [usersResponse]);
  const { data: rolesResponse, isLoading: rolesLoading } = useGetRolesQuery();
  const roles = useMemo(() => getRolesFromResponse(rolesResponse), [rolesResponse]);
  const [createUserRole, { isLoading: isCreating }] = useCreateUserRoleMutation();

  const userOptions: MultiSelectOption[] = useMemo(
    () =>
      users.map((user) => ({
        value: user.id,
        label: `${user.name} (${user.email})`,
      })),
    [users],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { user_ids: [], role_id: "" },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isCreating) return;
    if (!nextOpen) form.reset();
    onOpenChange(nextOpen);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const results = await Promise.allSettled(
      values.user_ids.map((user_id) =>
        createUserRole({ user_id, role_id: values.role_id }).unwrap(),
      ),
    );

    const failed = results.filter((r) => r.status === "rejected");
    const succeeded = results.length - failed.length;

    if (succeeded > 0) {
      toast.success(
        `Assigned the role to ${succeeded} user${succeeded === 1 ? "" : "s"}.`,
      );
    }
    if (failed.length > 0) {
      const firstError =
        failed[0].status === "rejected" ? failed[0].reason : undefined;
      toast.error(
        `${failed.length} assignment${failed.length === 1 ? "" : "s"} failed: ${getApiMessage(
          firstError,
          "unknown error",
        )}`,
      );
    }

    await onCreated();
    if (failed.length === 0) {
      form.reset();
      onOpenChange(false);
    }
  };

  const isLoading = isCreating || usersLoading || rolesLoading;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Role</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Users</FormLabel>
                  <MultiSelect
                    options={userOptions}
                    selected={field.value}
                    onChange={field.onChange}
                    placeholder="Select users"
                    searchPlaceholder="Search users..."
                    disabled={isCreating || usersLoading}
                    listClassName="max-h-[220px]"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isCreating || rolesLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isCreating}
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isCreating ? "Assigning..." : "Assign Role"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
