"use client";

import * as React from "react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import ContetraLogo from "@/public/logos/contetra-logo.png";
import Image from "next/image";

export function TeamSwitcher() {
  const { state } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="p-0 bg-transparent hover:bg-transparent focus-visible:ring-0"
        >
          {state === "collapsed" ? (
            <span className="font-bold text-lg w-full flex items-center justify-center">
              CL
            </span>
          ) : (
            <div className="w-full flex items-center justify-center">
              <Image
                src={ContetraLogo}
                alt="Contetra Logo"
                className="w-[70%]"
              />
            </div>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}