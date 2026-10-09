"use client"

import * as React from "react"
import {
  AudioWaveform,
  Bot,
  Command,
  GalleryVerticalEnd,
  Settings2,
  ShieldCheck,
  SquareTerminal,
  type LucideIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetMyPermissionsQuery } from "@/redux/api/rbacApi"

type NavSubItem = {
  title: string
  url: string
  permissionKey?: string
}

type NavMainItem = {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  permissionKey?: string
  items?: NavSubItem[]
}

// This is sample data.
const data: {
  teams: { name: string; logo: LucideIcon; plan: string }[]
  navMain: NavMainItem[]
} = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
      permissionKey: "admin_tab:dashboard",
    },
    {
      title: "Blog",
      url: "dashboard/blog/all-blogs",
      icon: SquareTerminal,
      isActive: false,
      permissionKey: "admin_tab:blog",
      items: [
        {
          title: "All Blogs",
          url: "/dashboard/blog/all-blogs",
          permissionKey: "admin_tab:blog:all-blogs",
        },
        {
          title: "Add a new blog",
          url: "/dashboard/blog/add-a-new-blog",
          permissionKey: "admin_tab:blog:add-a-new-blog",
        },
        {
          title: "Authors",
          url: "/dashboard/blog/authors",
          permissionKey: "admin_tab:blog:authors",
        },
        {
          title: "Categories",
          url: "/dashboard/blog/categories",
          permissionKey: "admin_tab:blog:categories",
        },
      ],
    },
    {
      title: "Emails",
      url: "#",
      icon: Bot,
      permissionKey: "admin_tab:emails",
      items: [
        {
          title: "All Emails",
          url: "/dashboard/emails/all-emails",
          permissionKey: "admin_tab:emails:all-emails",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      permissionKey: "admin_tab:settings",
      items: [
        {
          title: "Forms",
          url: "/dashboard/settings/forms",
          permissionKey: "admin_tab:settings:forms",
        },
        {
          title: "Form Types",
          url: "/dashboard/settings/form-types",
          permissionKey: "admin_tab:settings:form-types",
        },
        {
          title: "Team",
          url: "/dashboard/settings/team",
          permissionKey: "admin_tab:settings:team",
        },
        {
          title: "Departments",
          url: "/dashboard/settings/departments",
          permissionKey: "admin_tab:settings:departments",
        },
        {
          title: "Designations",
          url: "/dashboard/settings/designations",
          permissionKey: "admin_tab:settings:designations",
        },
      ],
    },
    {
      title: "RBAC",
      url: "#",
      icon: ShieldCheck,
      // Intentionally no permissionKey: this is where access gets granted,
      // including recovering a locked-out admin's own access, so it can't
      // itself require a grant to be visible.
      items: [
        {
          title: "Roles",
          url: "/dashboard/rbac/roles",
        },
        {
          title: "User Roles",
          url: "/dashboard/rbac/user-roles",
        },
        {
          title: "Policy Bindings",
          url: "/dashboard/rbac/policy-bindings",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: permissions, isLoading, isError } = useGetMyPermissionsQuery()

  // Items without a permissionKey are always visible (fail-open — a tab
  // added later but not wired into the permissions map stays visible and
  // noticeable, rather than silently disappearing for everyone). Sub-items
  // are filtered the same way, independently of their parent's own gate.
  const isVisible = (permissionKey?: string) =>
    !permissionKey || Boolean(permissions?.[permissionKey])

  const visibleNavMain = data.navMain
    .filter((item) => isVisible(item.permissionKey))
    .map((item) => ({
      ...item,
      items: item.items?.filter((subItem) => isVisible(subItem.permissionKey)),
    }))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
      </SidebarHeader>
      <SidebarContent>
        {isLoading ? (
          <SidebarMenu className="gap-2 px-2 py-1.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <SidebarMenuItem key={index} className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 shrink-0 rounded" />
                <Skeleton className="h-4 flex-1" />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        ) : isError ? (
          <SidebarMenu>
            <SidebarMenuItem className="px-2 py-1.5 text-sm text-destructive">
              Couldn&apos;t load menu permissions.
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <NavMain items={visibleNavMain} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
