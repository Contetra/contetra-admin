"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useDeleteUserPhotoMutation,
  useUploadUserPhotoMutation,
} from "@/redux/api/userApi";
import { ImageCropDialog } from "./imageCropDialog";

const MAX_PHOTO_BYTES = 1 * 1024 * 1024;
const MAX_SOURCE_BYTES = 20 * 1024 * 1024;

const CDN_BASE = (
  process.env.NEXT_PUBLIC_CDN_URL ?? "https://contetra.b-cdn.net"
).replace(/\/+$/, "");

const getApiMessage = (value: unknown, fallback: string) => {
  let current: unknown = value;

  for (
    let depth = 0;
    depth < 4 && current && typeof current === "object";
    depth++
  ) {
    const record = current as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (Array.isArray(record.message)) return record.message.join(", ");
    current = record.data ?? record.response;
  }

  return fallback;
};

export function teamPhotoSrc(path: string | null | undefined) {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${CDN_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

type ProfilePhotoFieldProps = {
  value: string;
  memberName: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function ProfilePhotoField({
  value,
  memberName,
  onChange,
  disabled,
}: ProfilePhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadPhoto] = useUploadUserPhotoMutation();
  const [deletePhoto] = useDeleteUserPhotoMutation();
  const [isBusy, setIsBusy] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [pendingImageSrc, setPendingImageSrc] = useState<string | null>(null);
  const [pendingFileName, setPendingFileName] = useState("");

  // Selected-file previews are object URLs, so they have to be revoked
  // once they are replaced or the dialog unmounts.
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  useEffect(() => {
    return () => {
      if (pendingImageSrc) URL.revokeObjectURL(pendingImageSrc);
    };
  }, [pendingImageSrc]);

  const preview = localPreview ?? teamPhotoSrc(value);

  useEffect(() => {
    setPreviewFailed(false);
  }, [preview]);

  const clearLocalPreview = () => {
    setLocalPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  };

  const handleFileSelected = (file: File) => {
    if (!memberName.trim()) {
      toast.error("Enter the team member's name before uploading a photo.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (file.size > MAX_SOURCE_BYTES) {
      toast.error("The photo must be 20MB or smaller.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPendingImageSrc((current) => {
      if (current) URL.revokeObjectURL(current);
      return objectUrl;
    });
    setPendingFileName(file.name);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleCropCancel = () => {
    setPendingImageSrc((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setPendingFileName("");
  };

  const handleCropped = (file: File) => {
    setPendingImageSrc((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setPendingFileName("");
    void handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error("The photo must be 1MB or smaller.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return objectUrl;
    });
    setIsBusy(true);

    try {
      const response = await uploadPhoto({
        file,
        name: memberName,
      }).unwrap();
      if (!response.url) {
        throw new Error("Upload response missing image URL");
      }
      if (value && value !== response.url) {
        await deletePhoto(value)
          .unwrap()
          .catch(() => undefined);
      }
      onChange(response.url);
      toast.success("Photo uploaded.");
    } catch (error: unknown) {
      clearLocalPreview();
      toast.error(getApiMessage(error, "Unable to upload the photo."));
    } finally {
      setIsBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (!value) return;
    setIsBusy(true);
    try {
      await deletePhoto(value).unwrap();
      clearLocalPreview();
      onChange("");
      toast.success("Photo removed.");
    } catch (error: unknown) {
      toast.error(getApiMessage(error, "Unable to remove the photo."));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative aspect-498/562 w-28 shrink-0 overflow-hidden rounded-md border bg-muted">
          {preview && !previewFailed ? (
            <img
              src={preview}
              alt="Team member"
              className="size-full object-cover object-top"
              onError={() => setPreviewFailed(true)}
            />
          ) : (
            <span className="flex size-full items-center justify-center px-2 text-center text-xs text-muted-foreground">
              {previewFailed ? "Preview unavailable" : "No photo"}
            </span>
          )}
          {isBusy ? (
            <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-[10px] font-medium text-white">
              Uploading…
            </span>
          ) : null}
        </div>

        {value ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || isBusy}
            onClick={() => void handleRemove()}
          >
            Remove
          </Button>
        ) : null}
      </div>

      <Input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        disabled={disabled || isBusy}
        className="cursor-pointer"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleFileSelected(file);
        }}
      />
      <p className="text-xs text-muted-foreground">
        JPEG, PNG, WebP or GIF up to 20MB. You&apos;ll crop it to 498×562
        before it&apos;s uploaded, matching how it appears on the website.
      </p>

      <Input
        readOnly
        value={value}
        placeholder="Uploaded path appears here"
        className="bg-muted"
      />

      {pendingImageSrc ? (
        <ImageCropDialog
          open
          imageSrc={pendingImageSrc}
          fileName={pendingFileName}
          onCancel={handleCropCancel}
          onCropped={handleCropped}
        />
      ) : null}
    </div>
  );
}
