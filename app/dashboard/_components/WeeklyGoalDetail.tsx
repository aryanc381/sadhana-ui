"use client"

import * as React from "react"
import { format } from "date-fns"
import { ArrowLeft, Bold, Italic, List, ListOrdered, MoreHorizontal, Plus } from "lucide-react"
import Link from "next/link"

import { getSkills } from "@/lib/api/skills"
import {
  createTask,
  deleteTask,
  getDailyTickets,
  updateRoughIdea,
  updateTaskSkill,
  updateTaskStatus,
} from "@/lib/api/daily-tickets"
import { getWeeklyGoals } from "@/lib/api/weekly-goals"
import type {
  DailyTicket,
  Skill,
  TaskStatus,
  WeeklyGoal,
} from "@/lib/types/sadhana"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"

const taskStatuses: TaskStatus[] = ["pending", "completed", "missed"]

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  completed: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  missed: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
}

export function WeeklyGoalDetail({ goalId }: { goalId: string }) {
  const [goal, setGoal] = React.useState<WeeklyGoal>()
  const [tickets, setTickets] = React.useState<DailyTicket[]>([])
  const [skills, setSkills] = React.useState<Skill[]>([])
  const [roughIdea, setRoughIdea] = React.useState("")
  const [openTicketId, setOpenTicketId] = React.useState<string>()
  const [taskTicketId, setTaskTicketId] = React.useState<string>()
  const [isTaskOpen, setIsTaskOpen] = React.useState(false)
  const [taskName, setTaskName] = React.useState("")
  const [taskDescription, setTaskDescription] = React.useState("")
  const [taskSkillId, setTaskSkillId] = React.useState("")

  React.useEffect(() => {
    let active = true
    Promise.all([getWeeklyGoals(), getDailyTickets(goalId), getSkills()])
      .then(([goals, nextTickets, nextSkills]) => {
        if (!active) return
        setGoal(goals.find((item) => item.id === goalId))
        setTickets(nextTickets)
        setSkills(nextSkills)
        setOpenTicketId(nextTickets[0]?.id)
      })
      .catch((error) => toast.add({
        title: "Could not load goal",
        description: error instanceof Error ? error.message : "Try again",
        type: "error",
      }))
    return () => { active = false }
  }, [goalId])

  function replaceTicket(nextTicket: DailyTicket) {
    setTickets((current) => current.map((ticket) => ticket.id === nextTicket.id ? nextTicket : ticket))
  }

  async function saveRoughIdea() {
    try {
      await updateRoughIdea(goalId, roughIdea)
      toast.add({ title: "Rough idea saved", type: "success" })
    } catch (error) {
      toast.add({ title: "Could not save rough idea", description: error instanceof Error ? error.message : "Try again", type: "error" })
    }
  }

  function openTaskDialog(ticketId: string) {
    setTaskTicketId(ticketId)
    setTaskName("")
    setTaskDescription("")
    setTaskSkillId("")
    setIsTaskOpen(true)
  }

  async function submitTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!taskTicketId || !taskSkillId) return
    try {
      replaceTicket(await createTask(taskTicketId, { skill_id: taskSkillId, task_name: taskName, task_description: taskDescription }))
      setIsTaskOpen(false)
      toast.add({ title: "Task created", type: "success" })
    } catch (error) {
      toast.add({ title: "Could not create task", description: error instanceof Error ? error.message : "Try again", type: "error" })
    }
  }

  function skillName(skillId: string) {
    return skills.find((skill) => skill.id === skillId)?.name ?? "Unknown skill"
  }

  if (!goal) return <div className="p-6 text-sm text-muted-foreground">Loading goal...</div>

  return (
    <main className="min-h-screen p-6">
      <div className="mb-6 flex items-center gap-3">
        <Button
          render={<Link href="/dashboard" aria-label="Back to dashboard" />}
          variant="ghost"
          size="icon"
          className="cursor-pointer"
        >
          <ArrowLeft />
        </Button>
        <div>
          <p className="text-sm text-muted-foreground">Week {goal.week_number}</p>
          <h1 className="text-2xl font-semibold">{goal.name}</h1>
        </div>
      </div>
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="min-w-0">
          <CardHeader><CardTitle>Rough idea</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-1 border-b pb-3">
              <Button type="button" variant="ghost" size="icon" onClick={() => setRoughIdea((value) => `**${value}**`)}><Bold /></Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => setRoughIdea((value) => `*${value}*`)}><Italic /></Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => setRoughIdea((value) => `${value}\n- `)}><List /></Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => setRoughIdea((value) => `${value}\n1. `)}><ListOrdered /></Button>
            </div>
            <Textarea value={roughIdea} onChange={(event) => setRoughIdea(event.target.value)} placeholder="Write your thoughts..." className="min-h-80 resize-none border-0 p-0 shadow-none focus-visible:ring-0" />
            <Button onClick={saveRoughIdea} className="cursor-pointer">Save notes</Button>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader><CardTitle>Daily tickets</CardTitle></CardHeader>
          <CardContent className="min-w-0 p-0">
            <ScrollArea className="h-[32rem] px-6">
              <div className="space-y-2 pb-6">
                {tickets.map((ticket) => (
                  <DailyTicketSection
                    key={ticket.id}
                    ticket={ticket}
                    skills={skills}
                    skillName={skillName}
                    open={openTicketId === ticket.id}
                    onOpenChange={(open) => setOpenTicketId(open ? ticket.id : undefined)}
                    onAddTask={() => openTaskDialog(ticket.id)}
                    onTicketChange={replaceTicket}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      <Dialog open={isTaskOpen} onOpenChange={setIsTaskOpen}>
        <DialogContent>
          <form onSubmit={submitTask}>
            <DialogHeader>
              <DialogTitle>New task</DialogTitle>
              <DialogDescription>Add a task and assign it to a skill.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input value={taskName} onChange={(event) => setTaskName(event.target.value)} placeholder="Task name" required />
              <Textarea value={taskDescription} onChange={(event) => setTaskDescription(event.target.value)} placeholder="Description" />
              <Select value={taskSkillId} onValueChange={(value) => setTaskSkillId(value ?? "")} required>
                <SelectTrigger><SelectValue placeholder="Select a skill" /></SelectTrigger>
                <SelectContent>{skills.map((skill) => <SelectItem key={skill.id} value={skill.id}>{skill.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <DialogFooter><Button type="submit" className="cursor-pointer">Create task</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}

function DailyTicketSection({
  ticket,
  skills,
  skillName,
  open,
  onOpenChange,
  onAddTask,
  onTicketChange,
}: {
  ticket: DailyTicket
  skills: Skill[]
  skillName: (skillId: string) => string
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTask: () => void
  onTicketChange: (ticket: DailyTicket) => void
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange} onKeyDown={(event) => {
      if (event.metaKey && event.key.toLowerCase() === "d") {
        event.preventDefault()
        onAddTask()
      }
    }}>
      <CollapsibleTrigger
        render={<Button variant="ghost" className="w-full cursor-pointer justify-between px-2" />}
      >
          {format(new Date(ticket.date), "EEEE, MMM dd")}
          <Badge className={statusColors[ticket.status] ?? "bg-muted text-muted-foreground"}>{ticket.status}</Badge>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 px-2 pt-2">
        <Separator />
        {ticket.tasks.length ? <TaskTable ticket={ticket} skills={skills} skillName={skillName} onTicketChange={onTicketChange} /> : <p className="py-3 text-sm text-muted-foreground">No tasks yet.</p>}
        <Button variant="outline" size="sm" className="cursor-pointer" onClick={onAddTask}><Plus /> Add task <span className="text-muted-foreground">⌘ D</span></Button>
      </CollapsibleContent>
    </Collapsible>
  )
}

function TaskTable({ ticket, skills, skillName, onTicketChange }: { ticket: DailyTicket; skills: Skill[]; skillName: (skillId: string) => string; onTicketChange: (ticket: DailyTicket) => void }) {
  async function changeStatus(taskId: string, status: TaskStatus) {
    try { onTicketChange(await updateTaskStatus(ticket.id, taskId, status)) } catch (error) { toast.add({ title: "Could not update status", description: error instanceof Error ? error.message : "Try again", type: "error" }) }
  }
  async function changeSkill(taskId: string, skillId: string) {
    try { onTicketChange(await updateTaskSkill(ticket.id, taskId, skillId)) } catch (error) { toast.add({ title: "Could not update skill", description: error instanceof Error ? error.message : "Try again", type: "error" }) }
  }
  async function removeTask(taskId: string) {
    try { onTicketChange(await deleteTask(ticket.id, taskId)); toast.add({ title: "Task deleted", type: "success" }) } catch (error) { toast.add({ title: "Could not delete task", description: error instanceof Error ? error.message : "Try again", type: "error" }) }
  }

  return <div className="overflow-x-auto rounded-md border"><Table><TableHeader><TableRow><TableHead>Task</TableHead><TableHead>Description</TableHead><TableHead>Status</TableHead><TableHead>Skill</TableHead><TableHead className="w-10" /></TableRow></TableHeader><TableBody>{ticket.tasks.map((task) => <TableRow key={task.id}><TableCell className="font-medium">{task.task_name}</TableCell><TableCell className="max-w-48 truncate">{task.task_description || "—"}</TableCell><TableCell><Select value={task.status} onValueChange={(value) => value && changeStatus(task.id, value as TaskStatus)}><SelectTrigger className="w-28"><Badge className={statusColors[task.status]}>{task.status}</Badge></SelectTrigger><SelectContent>{taskStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></TableCell><TableCell><Select value={task.skill_id} onValueChange={(value) => value && changeSkill(task.id, value)}><SelectTrigger className="w-32"><Badge>{skillName(task.skill_id)}</Badge></SelectTrigger><SelectContent>{skills.map((skill) => <SelectItem key={skill.id} value={skill.id}>{skill.name}</SelectItem>)}</SelectContent></Select></TableCell><TableCell><DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="cursor-pointer" />}><MoreHorizontal /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem variant="destructive" onClick={() => removeTask(task.id)}>Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>)}</TableBody></Table></div>
}
