"use client"

import * as React from "react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"

import { assignSkillToGoal, createWeeklyGoal } from "@/lib/api/weekly-goals"
import type { Skill } from "@/lib/types/sadhana"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { DatePickerWithRange } from "./DatePickerWithRange"
import { CreateSkillDialog } from "./CreateSkillDialog"

type CreateGoalDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  skills: Skill[]
  onSkillCreated: (skill: Skill) => void
}

export function CreateGoalDialog({
  open,
  onOpenChange,
  skills,
  onSkillCreated,
}: CreateGoalDialogProps) {
  const [name, setName] = React.useState("")
  const [skillId, setSkillId] = React.useState("")
  const [dateRange, setDateRange] = React.useState<DateRange>()
  const [skillDialogOpen, setSkillDialogOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const selectedSkill = skills.find((skill) => skill.id === skillId)

  function handleSkillCreated(skill: Skill) {
    onSkillCreated(skill)
    setSkillId(skill.id)
    setSkillDialogOpen(false)
    onOpenChange(true)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!dateRange?.from || !dateRange.to) {
      toast.add({
        title: "Choose a date range",
        description: "A start and end date are required.",
        type: "error",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const goal = await createWeeklyGoal({
        name,
        start_date: format(dateRange.from, "yyyy-MM-dd"),
        end_date: format(dateRange.to, "yyyy-MM-dd"),
      })

      if (skillId) {
        await assignSkillToGoal(goal.id, skillId)
      }

      onOpenChange(false)
      toast.add({
        title: "Goal created",
        description: name,
        type: "success",
      })
    } catch (error) {
      toast.add({
        title: "Could not create goal",
        description: error instanceof Error ? error.message : "Try again",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create weekly goal</DialogTitle>
            <DialogDescription>
              Set a goal and connect it to a skill.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <Field>
              <FieldLabel htmlFor="goal-name">Goal name</FieldLabel>
              <Input
                id="goal-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel>Skill</FieldLabel>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="justify-between"
                    />
                  }
                >
                  {selectedSkill?.name ?? "Choose a skill"}
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {skills.map((skill) => (
                    <DropdownMenuItem
                      key={skill.id}
                      onClick={() => setSkillId(skill.id)}
                    >
                      {skill.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem
                    onClick={() => {
                      onOpenChange(false)
                      setSkillDialogOpen(true)
                    }}
                  >
                    + Create new skill
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Field>
            <DatePickerWithRange value={dateRange} onChange={setDateRange} />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create goal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <CreateSkillDialog
        open={skillDialogOpen}
        onOpenChange={setSkillDialogOpen}
        onCreated={handleSkillCreated}
      />
    </>
  )
}
