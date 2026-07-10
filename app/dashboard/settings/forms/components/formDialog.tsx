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
  Form as ShadcnForm,
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
  Form,
  FormType,
  useCreateFormMutation,
  useGetFormTypesQuery,
  useUpdateFormMutation,
} from "@/redux/api/settingsApi";

const formSchema = z.object({
  form_name: z.string().trim().min(1, "Form name is required."),
  form_type_id: z.string().min(1, "Form type is required."),
});

type FormDialogProps = {
  formData?: Form;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void | Promise<unknown>;
};

const getApiMessage = (value: unknown, fallback: string) => {
  if (!value || typeof value !== "object") return fallback;
  const record = value as Record<string, unknown>;
  const data = record.data;
  if (data && typeof data === "object") {
    const message = (data as Record<string, unknown>).message;
    if (typeof message === "string") return message;
  }
  return typeof record.message === "string" ? record.message : fallback;
};

const getFormTypes = (response: unknown): FormType[] => {
  if (Array.isArray(response)) return response as FormType[];
  if (!response || typeof response !== "object") return [];
  const value = response as Record<string, unknown>;
  if (Array.isArray(value.response)) return value.response as FormType[];
  if (value.response && typeof value.response === "object") {
    const data = (value.response as Record<string, unknown>).data;
    if (Array.isArray(data)) return data as FormType[];
  }
  return Array.isArray(value.data) ? (value.data as FormType[]) : [];
};

export function FormDialog({
  formData,
  open,
  onOpenChange,
  onSaved,
}: FormDialogProps) {
  const isEditing = Boolean(formData);
  const { data: formTypesResponse, isLoading: formTypesLoading } =
    useGetFormTypesQuery();
  const formTypes = useMemo(
    () => getFormTypes(formTypesResponse),
    [formTypesResponse],
  );
  const [createForm, { isLoading: isCreating }] = useCreateFormMutation();
  const [updateForm, { isLoading: isUpdating }] = useUpdateFormMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      form_name: formData?.form_name ?? "",
      form_type_id: formData?.form_type_id ?? "",
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isSaving) return;
    if (!nextOpen) form.reset();
    onOpenChange(nextOpen);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = formData
        ? await updateForm({ id: formData.id, ...values }).unwrap()
        : await createForm(values).unwrap();
      toast.success(response.message);
      await onSaved();
      form.reset();
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(getApiMessage(error, `Unable to ${isEditing ? "update" : "create"} the form.`));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Update Form" : "Add Form"}</DialogTitle>
        </DialogHeader>
        <ShadcnForm {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="form_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Form Name</FormLabel>
                  <FormControl>
                    <Input disabled={isSaving} placeholder="Enter form name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="form_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Form Type</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSaving || formTypesLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a form type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formTypes.map((formType) => (
                        <SelectItem key={formType.id} value={formType.id}>
                          {formType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" disabled={isSaving} onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || formTypesLoading}>
                {isSaving ? "Saving..." : isEditing ? "Update Form" : "Add Form"}
              </Button>
            </DialogFooter>
          </form>
        </ShadcnForm>
      </DialogContent>
    </Dialog>
  );
}
