"use client"

import { useMemo } from "react"
import Cookies from "js-cookie"
import { ChevronsUpDown, LogOut } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { performLogout } from "@/lib/logout"
import { decodeJwtPayload } from "@/lib/jwt"
import { useGetUsersQuery } from "@/redux/api/userApi"

const TOKEN_COOKIE = "pghlasdetg"

type MinimalUser = {
  name: string
  email: string | null
  profile_picture_url: string | null
}

const getUsersFromResponse = (response: unknown): MinimalUser[] => {
  if (Array.isArray(response)) return response as MinimalUser[];
  if (!response || typeof response !== "object") return [];

  const value = response as Record<string, unknown>;
  const nestedResponse = value.response;

  if (Array.isArray(nestedResponse)) return nestedResponse as MinimalUser[];
  if (nestedResponse && typeof nestedResponse === "object") {
    const responseData = (nestedResponse as Record<string, unknown>).data;
    if (Array.isArray(responseData)) return responseData as MinimalUser[];
  }

  return Array.isArray(value.data) ? (value.data as MinimalUser[]) : [];
};

const getInitials = (label: string) => {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0] + parts[1]![0]).toUpperCase();
};

export function NavUser() {
  const { isMobile } = useSidebar()
  const { data: usersResponse, isLoading } = useGetUsersQuery()
  const users = useMemo(() => getUsersFromResponse(usersResponse), [usersResponse])

  const email = useMemo(() => {
    const token = Cookies.get(TOKEN_COOKIE)
    if (!token) return undefined
    return decodeJwtPayload<{ email?: string }>(token)?.email
  }, [])

  const currentUser = useMemo(
    () =>
      users.find(
        (u) => u.email && email && u.email.toLowerCase() === email.toLowerCase(),
      ),
    [users, email],
  )

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const displayName = currentUser?.name || email || "Account"
  const avatarUrl = currentUser?.profile_picture_url ?? undefined

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="rounded-lg">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                {currentUser?.name && email && (
                  <span className="truncate text-xs">{email}</span>
                )}
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="rounded-lg">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  {currentUser?.name && email && (
                    <span className="truncate text-xs">{email}</span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={performLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
