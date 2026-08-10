"use client"

import * as React from "react"

import { getSkills } from "@/lib/api/skills"
import type { Skill } from "@/lib/types/sadhana"
import { Button } from "@/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { toast } from "@/components/ui/toast"
import { AppSidebar } from "./AppSidebar"
import { CreateGoalDialog } from "./CreateGoalDialog"

export function Dashboard() {
  const [skills, setSkills] = React.useState<Skill[]>([])
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)

  React.useEffect(() => {
    let active = true

    getSkills()
      .then((nextSkills) => {
        if (active) setSkills(nextSkills)
      })
      .catch((error) => {
        if (!active) return
        toast.add({
          title: "Could not load skills",
          description: error instanceof Error ? error.message : "Try again",
          type: "error",
        })
      })

    return () => {
      active = false
    }
  }, [])

  function handleSkillCreated(skill: Skill) {
    setSkills((current) =>
      current.some((item) => item.id === skill.id)
        ? current
        : [...current, skill],
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-20 items-center border-b px-6">
          <div className="flex items-center gap-5">
            <SidebarTrigger />
            <span className="text-[1vw]">Dashboard</span>
          </div>
        </header>
        <main className="flex-1 p-6">
          <div className="mb-6 flex justify-end">
            <Button
              className="cursor-pointer"
              onClick={() => setIsCreateOpen(true)}
            >
              Create
            </Button>
          </div>
        </main>
      </SidebarInset>
      <CreateGoalDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        skills={skills}
        onSkillCreated={handleSkillCreated}
      />
    </SidebarProvider>
  )
}
