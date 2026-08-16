"use client"

import * as React from "react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"

import { createWeeklyGoal } from "@/lib/api/weekly-goals"
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  const [description, setDescription] = React.useState("")
  const [skillIds, setSkillIds] = React.useState<string[]>([])
  const [dateRange, setDateRange] = React.useState<DateRange>()
  const [skillDialogOpen, setSkillDialogOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const selectedSkills = skills.filter((skill) => skillIds.includes(skill.id))

  function handleSkillCreated(skill: Skill) {
    onSkillCreated(skill)
    setSkillIds((current) => [...current, skill.id])
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
      await createWeeklyGoal({
        name,
        description,
        start_date: format(dateRange.from, "yyyy-MM-dd"),
        end_date: format(dateRange.to, "yyyy-MM-dd"),
        skill_ids: skillIds,
      })

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
              Set a goal and connect it to one or more skills.
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
              <FieldLabel htmlFor="goal-description">Description</FieldLabel>
              <Textarea
                id="goal-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
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
                  {selectedSkills.length
                    ? selectedSkills.map((skill) => skill.name).join(", ")
                    : "Choose skills"}
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" sideOffset={8} align="start">
                  {skills.map((skill) => (
                    <DropdownMenuCheckboxItem
                      key={skill.id}
                      checked={skillIds.includes(skill.id)}
                      onClick={() => setSkillIds((current) => current.includes(skill.id)
                        ? current.filter((id) => id !== skill.id)
                        : [...current, skill.id])}
                    >
                      {skill.name}
                    </DropdownMenuCheckboxItem>
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
