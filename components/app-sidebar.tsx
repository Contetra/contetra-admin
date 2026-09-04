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
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
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
    },
    {
      title: "Blog",
      url: "dashboard/blog/all-blogs",
      icon: SquareTerminal,
      isActive: false,
      items: [
        {
          title: "All Blogs",
          url: "/dashboard/blog/all-blogs",
        },
        {
          title: "Add a new blog",
          url: "/dashboard/blog/add-a-new-blog",
        },
        {
          title: "Authors",
          url: "/dashboard/blog/authors",
        },
        {
          title: "Categories",
          url: "/dashboard/blog/categories",
        },
      ],
    },
    {
      title: "Emails",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "All Emails",
          url: "/dashboard/emails/all-emails",
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
      items: [
        {
          title: "Forms",
          url: "/dashboard/settings/forms",
        },
        {
          title: "Form Types",
          url: "/dashboard/settings/form-types",
        },
        {
          title: "Team",
          url: "/dashboard/settings/team",
        },
        {
          title: "Departments",
          url: "/dashboard/settings/departments",
        },
        {
          title: "Designations",
          url: "/dashboard/settings/designations",
        },
      ],
    },
    {
      title: "RBAC",
      url: "#",
      icon: ShieldCheck,
      items: [
        {
          title: "Roles",
          url: "/dashboard/rbac/roles",
        },
        {
          title: "User Roles",
          url: "/dashboard/rbac/user-roles",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
