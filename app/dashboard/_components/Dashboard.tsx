"use client"

import * as React from "react"

import { getSkills } from "@/lib/api/skills"
import { getWeeklyGoals } from "@/lib/api/weekly-goals"
import type { Skill, WeeklyGoal } from "@/lib/types/sadhana"
import { Button } from "@/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { toast } from "@/components/ui/toast"
import { AppSidebar } from "./AppSidebar"
import { CreateGoalDialog } from "./CreateGoalDialog"
import { GoalsList } from "./GoalsList"

export function Dashboard() {
  const [goals, setGoals] = React.useState<WeeklyGoal[]>([])
  const [skills, setSkills] = React.useState<Skill[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)

  async function loadDashboard() {
    try {
      const [nextGoals, nextSkills] = await Promise.all([
        getWeeklyGoals(),
        getSkills(),
      ])
      setGoals(nextGoals)
      setSkills(nextSkills)
    } catch (error) {
      toast.add({
        title: "Could not load dashboard",
        description: error instanceof Error ? error.message : "Try again",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    let active = true

    Promise.all([getWeeklyGoals(), getSkills()])
      .then(([nextGoals, nextSkills]) => {
        if (!active) return
        setGoals(nextGoals)
        setSkills(nextSkills)
      })
      .catch((error) => {
        if (!active) return
        toast.add({
          title: "Could not load dashboard",
          description: error instanceof Error ? error.message : "Try again",
          type: "error",
        })
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

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
          <GoalsList goals={goals} isLoading={isLoading} />
        </main>
      </SidebarInset>
      <CreateGoalDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        skills={skills}
        onSkillCreated={(skill) => {
          setSkills((current) =>
            current.some((item) => item.id === skill.id)
              ? current
              : [...current, skill],
          )
        }}
        onCreated={() => void loadDashboard()}
      />
    </SidebarProvider>
  )
}
