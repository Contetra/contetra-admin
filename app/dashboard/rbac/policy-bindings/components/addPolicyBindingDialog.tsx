"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Policy,
  Role,
  useCreatePolicyBindingMutation,
  useGetPoliciesQuery,
  useGetRolesQuery,
} from "@/redux/api/rbacApi";
import { AppUser, useGetUsersQuery } from "@/redux/api/userApi";
import { describeResourceType } from "../resourceTypeLabel";

const formSchema = z
  .object({
    policy_ids: z.array(z.string()).min(1, "Select at least one permission."),
    grantType: z.enum(["role", "user"]),
    role_ids: z.array(z.string()).optional(),
    user_ids: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.grantType === "role" && !(data.role_ids?.length)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one role.",
        path: ["role_ids"],
      });
    }
    if (data.grantType === "user" && !(data.user_ids?.length)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one user.",
        path: ["user_ids"],
      });
    }
  });

type AddPolicyBindingDialogProps = {
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

const getArrayFromResponse = <T,>(response: unknown): T[] => {
  if (Array.isArray(response)) return response as T[];
  if (!response || typeof response !== "object") return [];

  const value = response as Record<string, unknown>;
  const nestedResponse = value.response;

  if (Array.isArray(nestedResponse)) return nestedResponse as T[];
  if (nestedResponse && typeof nestedResponse === "object") {
    const responseData = (nestedResponse as Record<string, unknown>).data;
    if (Array.isArray(responseData)) return responseData as T[];
  }

  return Array.isArray(value.data) ? (value.data as T[]) : [];
};

export function AddPolicyBindingDialog({
  open,
  onOpenChange,
  onCreated,
}: AddPolicyBindingDialogProps) {
  const { data: policiesResponse, isLoading: policiesLoading } =
    useGetPoliciesQuery();
  const policies = useMemo(
    () => getArrayFromResponse<Policy>(policiesResponse),
    [policiesResponse],
  );
  const { data: rolesResponse, isLoading: rolesLoading } = useGetRolesQuery();
  const roles = useMemo(
    () => getArrayFromResponse<Role>(rolesResponse),
    [rolesResponse],
  );
  const { data: usersResponse, isLoading: usersLoading } = useGetUsersQuery();
  const users = useMemo(
    () => getArrayFromResponse<AppUser>(usersResponse),
    [usersResponse],
  );
  const [createPolicyBinding, { isLoading: isCreating }] =
    useCreatePolicyBindingMutation();

  const policyOptions: MultiSelectOption[] = useMemo(
    () =>
      policies.map((policy) => {
        const { group, label } = describeResourceType(
          policy.resource_type,
          policy.action,
        );
        return { value: policy.id, label, group };
      }),
    [policies],
  );
  const roleOptions: MultiSelectOption[] = useMemo(
    () => roles.map((role) => ({ value: role.id, label: role.name })),
    [roles],
  );
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
    defaultValues: {
      policy_ids: [],
      grantType: "role",
      role_ids: [],
      user_ids: [],
    },
  });

  const grantType = form.watch("grantType");

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isCreating) return;
    if (!nextOpen) form.reset();
    onOpenChange(nextOpen);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const targetIds =
      values.grantType === "role" ? values.role_ids! : values.user_ids!;

    const results = await Promise.allSettled(
      values.policy_ids.flatMap((policy_id) =>
        targetIds.map((targetId) =>
          createPolicyBinding({
            policy_id,
            ...(values.grantType === "role"
              ? { role_id: targetId }
              : { user_id: targetId }),
          }).unwrap(),
        ),
      ),
    );

    const failed = results.filter((r) => r.status === "rejected");
    const succeeded = results.length - failed.length;

    if (succeeded > 0) {
      toast.success(
        `Granted ${succeeded} permission${succeeded === 1 ? "" : "s"}.`,
      );
    }
    if (failed.length > 0) {
      const firstError =
        failed[0].status === "rejected" ? failed[0].reason : undefined;
      toast.error(
        `${failed.length} grant${failed.length === 1 ? "" : "s"} failed: ${getApiMessage(
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

  const isLoading = isCreating || policiesLoading || rolesLoading || usersLoading;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Grant Access</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="policy_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permissions</FormLabel>
                  <MultiSelect
                    options={policyOptions}
                    selected={field.value}
                    onChange={field.onChange}
                    placeholder="Select permissions"
                    searchPlaceholder="Search permissions..."
                    showSelectAll
                    disabled={isCreating || policiesLoading}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grantType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grant to</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("role_ids", []);
                      form.setValue("user_ids", []);
                    }}
                    disabled={isCreating}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="role">Roles</SelectItem>
                      <SelectItem value="user">Specific users</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {grantType === "role" ? (
              <FormField
                control={form.control}
                name="role_ids"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roles</FormLabel>
                    <MultiSelect
                      options={roleOptions}
                      selected={field.value ?? []}
                      onChange={field.onChange}
                      placeholder="Select roles"
                      searchPlaceholder="Search roles..."
                      disabled={isCreating || rolesLoading}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="user_ids"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Users</FormLabel>
                    <MultiSelect
                      options={userOptions}
                      selected={field.value ?? []}
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
            )}

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
                {isCreating ? "Granting..." : "Grant Access"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
