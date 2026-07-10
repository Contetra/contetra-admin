"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { useCreateFormTypeMutation } from "@/redux/api/settingsApi";

const formSchema = z.object({
  name: z.string().trim().min(1, "Form type name is required."),
});

type AddFormTypeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void | Promise<unknown>;
};

const getApiMessage = (value: unknown, fallback: string) => {
  if (!value || typeof value !== "object") return fallback;

  const record = value as Record<string, unknown>;
  if (typeof record.message === "string") return record.message;

  for (const key of ["response", "data"]) {
    const nested = record[key];
    if (nested && typeof nested === "object") {
      const message = (nested as Record<string, unknown>).message;
      if (typeof message === "string") return message;
    }
  }

  return fallback;
};

export function AddFormTypeDialog({
  open,
  onOpenChange,
  onCreated,
}: AddFormTypeDialogProps) {
  const [createFormType, { isLoading }] = useCreateFormTypeMutation();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isLoading) return;
    if (!nextOpen && !isLoading) form.reset();
    onOpenChange(nextOpen);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await createFormType({ name: values.name }).unwrap();
      toast.success(response.message);
      await onCreated();
      form.reset();
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(getApiMessage(error, "Unable to add the form type."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Form Type</DialogTitle>
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
                      placeholder="Enter form type name"
                      autoComplete="off"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Form Type"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
