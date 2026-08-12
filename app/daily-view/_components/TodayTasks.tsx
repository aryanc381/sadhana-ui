"use client"

import * as React from "react"
import { createTask, deleteTask, updateTaskSkill, updateTaskStatus, updateTaskText } from "@/lib/api/daily-tickets"
import type { DailyTask, DailyTicket, Skill, TaskStatus } from "@/lib/types/sadhana"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"

const statuses: TaskStatus[] = ["pending", "completed", "missed"]

const statusColors: Record<TaskStatus, string> = {
  pending: "bg-amber-50 text-amber-700 hover:bg-amber-50 hover:text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  completed: "bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700 dark:bg-green-950 dark:text-green-300",
  missed: "bg-red-50 text-red-700 hover:bg-red-50 hover:text-red-700 dark:bg-red-950 dark:text-red-300",
}

export function TodayTasks({ ticket, skills, onChange }: { ticket: DailyTicket; skills: Skill[]; onChange: (ticket: DailyTicket) => void }) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [skillId, setSkillId] = React.useState("")

  function startTask() {
    setName(""); setDescription(""); setSkillId(""); setOpen(true)
  }

  async function addTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      onChange(await createTask(ticket.id, { task_name: name, task_description: description, skill_id: skillId }))
      setOpen(false)
      toast.add({ title: "Task created", type: "success" })
    } catch (error) { toast.add({ title: "Could not create task", description: error instanceof Error ? error.message : "Try again", type: "error" }) }
  }

  return (
    <Card className="min-w-0">
      <CardHeader className="flex-row items-center justify-between"><CardTitle>Today’s tasks</CardTitle><Button variant="outline" onClick={startTask} className="cursor-pointer">Add task</Button></CardHeader>
      <CardContent className="min-w-0 overflow-x-auto">
        {ticket.tasks.length ? <Table><TableHeader><TableRow><TableHead>Task</TableHead><TableHead>Description</TableHead><TableHead>Skill</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader><TableBody>{ticket.tasks.map((task) => <TaskRow key={task.id} task={task} ticketId={ticket.id} skills={skills} onChange={onChange} />)}</TableBody></Table> : <p className="text-sm text-muted-foreground">No tasks today.</p>}
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}><DialogContent><form onSubmit={addTask}><DialogHeader><DialogTitle>Add task</DialogTitle></DialogHeader><div className="space-y-4 py-4"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Task name" required /><Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" /><Select value={skillId} onValueChange={(value) => setSkillId(value ?? "")} required><SelectTrigger><Badge>{skills.find((skill) => skill.id === skillId)?.name ?? "Select skill"}</Badge></SelectTrigger><SelectContent>{skills.map((skill) => <SelectItem key={skill.id} value={skill.id}>{skill.name}</SelectItem>)}</SelectContent></Select></div><DialogFooter><Button type="submit" className="cursor-pointer">Create task</Button></DialogFooter></form></DialogContent></Dialog>
    </Card>
  )
}

function TaskRow({ task, ticketId, skills, onChange }: { task: DailyTask; ticketId: string; skills: Skill[]; onChange: (ticket: DailyTicket) => void }) {
  const [name, setName] = React.useState(task.task_name)
  const [description, setDescription] = React.useState(task.task_description)

  async function saveText() {
    try { onChange(await updateTaskText(ticketId, task.id, name, description)) } catch (error) { toast.add({ title: "Could not update task", description: error instanceof Error ? error.message : "Try again", type: "error" }) }
  }
  async function changeStatus(status: TaskStatus) { try { onChange(await updateTaskStatus(ticketId, task.id, status)) } catch (error) { toast.add({ title: "Could not update status", description: error instanceof Error ? error.message : "Try again", type: "error" }) } }
  async function changeSkill(skillId: string) { try { onChange(await updateTaskSkill(ticketId, task.id, skillId)) } catch (error) { toast.add({ title: "Could not update skill", description: error instanceof Error ? error.message : "Try again", type: "error" }) } }
  async function remove() { try { onChange(await deleteTask(ticketId, task.id)); toast.add({ title: "Task deleted", type: "success" }) } catch (error) { toast.add({ title: "Could not delete task", description: error instanceof Error ? error.message : "Try again", type: "error" }) } }

  return <TableRow><TableCell><Input value={name} onChange={(event) => setName(event.target.value)} onBlur={saveText} /></TableCell><TableCell><Input value={description} onChange={(event) => setDescription(event.target.value)} onBlur={saveText} /></TableCell><TableCell><Select value={task.skill_id} onValueChange={(value) => value && changeSkill(value)}><SelectTrigger className="h-auto w-fit border-0 bg-transparent p-0 shadow-none hover:bg-transparent [&>svg]:hidden"><Badge>{skills.find((skill) => skill.id === task.skill_id)?.name ?? "Unknown"}</Badge></SelectTrigger><SelectContent>{skills.map((skill) => <SelectItem key={skill.id} value={skill.id}>{skill.name}</SelectItem>)}</SelectContent></Select></TableCell><TableCell><Select value={task.status} onValueChange={(value) => value && changeStatus(value as TaskStatus)}><SelectTrigger className="h-auto w-fit border-0 bg-transparent p-0 shadow-none hover:bg-transparent [&>svg]:hidden"><Badge className={statusColors[task.status]}>{task.status}</Badge></SelectTrigger><SelectContent>{statuses.map((status) => <SelectItem key={status} value={status}><Badge className={statusColors[status]}>{status}</Badge></SelectItem>)}</SelectContent></Select></TableCell><TableCell><Button variant="ghost" onClick={remove} className="cursor-pointer">Delete</Button></TableCell></TableRow>
}
