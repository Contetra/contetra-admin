"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { convertUTCtoIST } from "@/lib/utils";
import type { AppUser } from "@/redux/api/userApi";
import { teamPhotoSrc } from "./profilePhotoField";

type UserDetailsDialogProps = {
  user: AppUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-4 py-2">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium">{value}</span>
  </div>
);

export function UserDetailsDialog({
  user,
  open,
  onOpenChange,
}: UserDetailsDialogProps) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3">
          <Avatar className="aspect-498/562 size-auto w-16 rounded-md">
            <AvatarImage
              src={teamPhotoSrc(user.profile_picture_url)}
              alt={user.name}
              className="aspect-auto object-cover object-top"
            />
            <AvatarFallback className="rounded-md">
              {initials || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="divide-y">
          <DetailRow label="ID" value={user.id} />
          <DetailRow label="Username" value={user.user_name} />
          <DetailRow label="Department" value={user.department ?? "—"} />
          <DetailRow label="Designation" value={user.designation ?? "—"} />
          <DetailRow label="Order" value={user.order ?? "—"} />
          <DetailRow
            label="Profile Picture URL"
            value={
              user.profile_picture_url ? (
                <a
                  href={teamPhotoSrc(user.profile_picture_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-blue-600 hover:underline"
                >
                  {user.profile_picture_url}
                </a>
              ) : (
                "—"
              )
            }
          />
          <DetailRow
            label="2FA Status"
            value={
              <span className="capitalize">
                {user.two_fa_status.replace("_", " ")}
              </span>
            }
          />
          <DetailRow
            label="Last Login"
            value={convertUTCtoIST(user.last_login)}
          />
          <DetailRow
            label="Created At"
            value={convertUTCtoIST(user.created_at)}
          />
          <DetailRow
            label="Updated At"
            value={convertUTCtoIST(user.updated_at)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
