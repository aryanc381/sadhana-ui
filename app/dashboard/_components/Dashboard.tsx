"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"

import { getSkills } from "@/lib/api/skills"
import { getWeeklyGoals } from "@/lib/api/weekly-goals"
import type { Skill, WeeklyGoal } from "@/lib/types/sadhana"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { toast } from "@/components/ui/toast"
import { AppSidebar } from "./AppSidebar"
import { ChartAreaInteractive } from "./ChartAreaInteractive"
import { CreateGoalDialog } from "./CreateGoalDialog"
import { DatePickerWithRange } from "./DatePickerWithRange"
import { WeeklyGoalCards } from "./WeeklyGoalCards"

export function Dashboard() {
  const [skills, setSkills] = React.useState<Skill[]>([])
  const [goals, setGoals] = React.useState<WeeklyGoal[]>([])
  const [dateRange, setDateRange] = React.useState<DateRange>()
  const [selectedGoalId, setSelectedGoalId] = React.useState("")
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)

  React.useEffect(() => {
    let active = true

    Promise.all([getSkills(), getWeeklyGoals()])
      .then(([nextSkills, nextGoals]) => {
        if (!active) return
        setSkills(nextSkills)
        setGoals(nextGoals)
      })
      .catch((error) => {
        if (!active) return
        toast.add({
          title: "Could not load dashboard filters",
          description: error instanceof Error ? error.message : "Try again",
          type: "error",
        })
      })

    return () => {
      active = false
    }
  }, [])

  const selectedGoal = goals.find((goal) => goal.id === selectedGoalId)

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
        <header className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-5">
            <SidebarTrigger />
            <span className="text-[1vw]">Dashboard</span>
          </div>
        </header>
        <main className="flex-1 p-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <DatePickerWithRange
                value={dateRange}
                onChange={setDateRange}
              />
              <Field className="w-52">
                <FieldLabel htmlFor="goal-select">Goal</FieldLabel>
                <Select
                  value={selectedGoalId}
                  onValueChange={(value) => setSelectedGoalId(value ?? "")}
                  disabled={!goals.length}
                >
                  <SelectTrigger id="goal-select" className="cursor-pointer">
                    <SelectValue placeholder={goals.length ? "Choose a goal" : "No goals"} />
                  </SelectTrigger>
                  <SelectContent>
                    {goals.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={() => setIsCreateOpen(true)}
            >
              Create
            </Button>
          </div>
          <ChartAreaInteractive
            dateRange={dateRange}
            goalName={selectedGoal?.name}
          />
          <WeeklyGoalCards goals={goals} />
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
