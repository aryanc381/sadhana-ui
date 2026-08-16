"use client"

import * as React from "react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
  teams,
}: {
  teams: { name: string; logo: React.ReactNode; plan: string }[]
}) {
  const team = teams[0]
  if (!team) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg">
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-[family-name:var(--font-aldrich)] text-lg font-normal lowercase tracking-wide">
              {team.name}
            </span>
            <span className="truncate text-xs">{team.plan}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
