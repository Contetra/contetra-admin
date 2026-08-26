"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCroppedImageBlob } from "@/lib/cropImage";

export const TEAM_PHOTO_OUTPUT_WIDTH = 498;
export const TEAM_PHOTO_OUTPUT_HEIGHT = 562;
const ASPECT_RATIO = TEAM_PHOTO_OUTPUT_WIDTH / TEAM_PHOTO_OUTPUT_HEIGHT;

type ImageCropDialogProps = {
  open: boolean;
  imageSrc: string;
  fileName: string;
  onCancel: () => void;
  onCropped: (file: File) => void;
};

export function ImageCropDialog({
  open,
  imageSrc,
  fileName,
  onCancel,
  onCropped,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isProcessing) onCancel();
  };

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const blob = await getCroppedImageBlob(
        imageSrc,
        croppedAreaPixels,
        TEAM_PHOTO_OUTPUT_WIDTH,
        TEAM_PHOTO_OUTPUT_HEIGHT,
      );
      const croppedName = fileName.replace(/\.[^./\\]+$/, "") + ".jpg";
      onCropped(new File([blob], croppedName, { type: "image/jpeg" }));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crop photo</DialogTitle>
        </DialogHeader>

        <div className="relative h-80 w-full overflow-hidden rounded-md bg-muted">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={ASPECT_RATIO}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="w-full"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Drag to reposition and use the slider to zoom. The photo is cropped
          to {TEAM_PHOTO_OUTPUT_WIDTH}×{TEAM_PHOTO_OUTPUT_HEIGHT}, the same
          size used on the website&apos;s About Us page.
        </p>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isProcessing}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isProcessing || !croppedAreaPixels}
            onClick={() => void handleConfirm()}
          >
            {isProcessing ? "Processing..." : "Crop & Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
