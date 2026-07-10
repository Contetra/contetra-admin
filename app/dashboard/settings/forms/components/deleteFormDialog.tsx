"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, useDeleteFormMutation } from "@/redux/api/settingsApi";

type DeleteFormDialogProps = {
  formData: Form;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void | Promise<unknown>;
};

export function DeleteFormDialog({ formData, open, onOpenChange, onDeleted }: DeleteFormDialogProps) {
  const [deleteForm, { isLoading }] = useDeleteFormMutation();

  const handleDelete = async () => {
    try {
      const response = await deleteForm(formData.id).unwrap();
      toast.success(response.message);
      await onDeleted();
      onOpenChange(false);
    } catch {
      toast.error("Unable to delete the form.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isLoading && onOpenChange(nextOpen)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Form</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{formData.form_name}&quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" disabled={isLoading} onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" disabled={isLoading} onClick={handleDelete}>
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
