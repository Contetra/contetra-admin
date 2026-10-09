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
import {
  Policy,
  Role,
  useCreatePolicyBindingMutation,
  useGetPoliciesQuery,
  useGetRolesQuery,
} from "@/redux/api/rbacApi";
import { AppUser, useGetUsersQuery } from "@/redux/api/userApi";

const formSchema = z
  .object({
    policy_id: z.string().min(1, "Select a permission."),
    grantType: z.enum(["role", "user"]),
    role_id: z.string().optional(),
    user_id: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.grantType === "role" && !data.role_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a role.",
        path: ["role_id"],
      });
    }
    if (data.grantType === "user" && !data.user_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a user.",
        path: ["user_id"],
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      policy_id: "",
      grantType: "role",
      role_id: "",
      user_id: "",
    },
  });

  const grantType = form.watch("grantType");

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isCreating) return;
    if (!nextOpen) form.reset();
    onOpenChange(nextOpen);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await createPolicyBinding({
        policy_id: values.policy_id,
        ...(values.grantType === "role"
          ? { role_id: values.role_id }
          : { user_id: values.user_id }),
      }).unwrap();
      toast.success(response.message);
      await onCreated();
      form.reset();
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(getApiMessage(error, "Unable to grant this permission."));
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
              name="policy_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permission</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isCreating || policiesLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a permission" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {policies.map((policy) => (
                        <SelectItem key={policy.id} value={policy.id}>
                          {policy.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      form.setValue("role_id", "");
                      form.setValue("user_id", "");
                    }}
                    disabled={isCreating}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="role">A role</SelectItem>
                      <SelectItem value="user">A specific user</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {grantType === "role" ? (
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
            ) : (
              <FormField
                control={form.control}
                name="user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isCreating || usersLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
