"use client"

import * as React from "react"

import { createSkill } from "@/lib/api/skills"
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
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"

type CreateSkillDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (skill: Skill) => void
}

export function CreateSkillDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateSkillDialogProps) {
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const skill = await createSkill({ name, description })
      onCreated(skill)
      setName("")
      setDescription("")
      onOpenChange(false)
      toast.add({
        title: "Skill created",
        description: skill.name,
        type: "success",
      })
    } catch (error) {
      toast.add({
        title: "Could not create skill",
        description: error instanceof Error ? error.message : "Try again",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create skill</DialogTitle>
          <DialogDescription>Add a skill you want to practice.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <Field>
            <FieldLabel htmlFor="skill-name">Name</FieldLabel>
            <Input
              id="skill-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="skill-description">Description</FieldLabel>
            <Textarea
              id="skill-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create skill"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
