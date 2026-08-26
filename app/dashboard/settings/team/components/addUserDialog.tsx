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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Department,
  Designation,
  useGetDepartmentsQuery,
  useGetDesignationsQuery,
} from "@/redux/api/settingsApi";
import { useCreateUserMutation } from "@/redux/api/userApi";
import { ProfilePhotoField } from "./profilePhotoField";

const NO_DEPARTMENT = "none";
const NO_DESIGNATION = "none";

const formSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  user_name: z.string().trim().min(1, "Username is required."),
  email: z.string().trim().email("Enter a valid email address."),
  profile_picture_url: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || value.startsWith("/"), {
      message: "The CDN image path must start with /.",
    }),
  password: z.string().min(8, "Password must be at least 8 characters."),
  department_id: z.string().optional(),
  designation_id: z
    .string()
    .refine((value) => value.length > 0 && value !== NO_DESIGNATION, {
      message: "Designation is required.",
    }),
});

type AddUserDialogProps = {
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

export function AddUserDialog({
  open,
  onOpenChange,
  onCreated,
}: AddUserDialogProps) {
  const { data: departmentsResponse, isLoading: departmentsLoading } =
    useGetDepartmentsQuery();
  const departments = useMemo(
    () => getDepartmentsFromResponse(departmentsResponse),
    [departmentsResponse],
  );
  const { data: designationsResponse, isLoading: designationsLoading } =
    useGetDesignationsQuery();
  const designations = useMemo(
    () => getDesignationsFromResponse(designationsResponse),
    [designationsResponse],
  );
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      user_name: "",
      email: "",
      profile_picture_url: "",
      password: "",
      department_id: NO_DEPARTMENT,
      designation_id: NO_DESIGNATION,
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isCreating) return;
    if (!nextOpen) form.reset();
    onOpenChange(nextOpen);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await createUser({
        name: values.name,
        user_name: values.user_name,
        email: values.email,
        password: values.password,
        ...(values.profile_picture_url
          ? { profile_picture_url: values.profile_picture_url }
          : {}),
        ...(values.department_id && values.department_id !== NO_DEPARTMENT
          ? { department_id: values.department_id }
          : {}),
        designation_id: values.designation_id,
      }).unwrap();
      toast.success(response.message);
      await onCreated();
      form.reset();
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(getApiMessage(error, "Unable to create the user."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isCreating}
                      placeholder="Enter full name"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="user_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isCreating}
                      placeholder="Enter username"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      disabled={isCreating}
                      placeholder="Enter email address"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profile_picture_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile photo</FormLabel>
                  <FormControl>
                    <ProfilePhotoField
                      value={field.value}
                      memberName={form.watch("name")}
                      onChange={field.onChange}
                      disabled={isCreating}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      disabled={isCreating}
                      placeholder="Enter a strong password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isCreating || departmentsLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NO_DEPARTMENT}>None</SelectItem>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
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
              name="designation_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isCreating || designationsLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a designation" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NO_DESIGNATION}>None</SelectItem>
                      {designations.map((designation) => (
                        <SelectItem
                          key={designation.id}
                          value={designation.id}
                        >
                          {designation.name}
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
              <Button
                type="submit"
                disabled={isCreating || departmentsLoading || designationsLoading}
              >
                {isCreating ? "Creating..." : "Add User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
