"use client"

import * as React from "react"
import { MoreHorizontal, Trash2 } from "lucide-react"
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
const statusOrder: Record<TaskStatus, number> = { pending: 0, missed: 1, completed: 2 }

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

  const startTask = React.useCallback(() => {
    setName(""); setDescription(""); setSkillId(""); setOpen(true)
  }, [])

  React.useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((!event.metaKey && !event.ctrlKey) || event.key.toLowerCase() !== "d") return
      event.preventDefault()
      startTask()
    }

    document.addEventListener("keydown", handleShortcut, true)
    return () => document.removeEventListener("keydown", handleShortcut, true)
  }, [startTask])

  async function addTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      onChange(await createTask(ticket.id, { task_name: name, task_description: description, skill_id: skillId }))
      setOpen(false)
      toast.add({ title: "Task created", type: "success" })
    } catch (error) { toast.add({ title: "Could not create task", description: error instanceof Error ? error.message : "Try again", type: "error" }) }
  }

  return (
    <Card className="h-full min-h-0 min-w-0 flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Today’s tasks</CardTitle><Button variant="outline" onClick={startTask} className="cursor-pointer">Add task <span className="text-muted-foreground">⌘ D</span></Button></CardHeader>
      <CardContent className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-auto">
        {ticket.tasks.length ? <Table><TableHeader><TableRow><TableHead>Task</TableHead><TableHead>Skill</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader><TableBody>{[...ticket.tasks].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]).map((task) => <TaskRow key={task.id} task={task} ticketId={ticket.id} skills={skills} onChange={onChange} />)}</TableBody></Table> : <p className="text-sm text-muted-foreground">No tasks today.</p>}
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}><DialogContent><form onSubmit={addTask}><DialogHeader><DialogTitle>Add task</DialogTitle></DialogHeader><div className="space-y-4 py-4"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Task name" required /><Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" /><Select value={skillId} onValueChange={(value) => setSkillId(value ?? "")} required><SelectTrigger><Badge>{skills.find((skill) => skill.id === skillId)?.name ?? "Select skill"}</Badge></SelectTrigger><SelectContent>{skills.map((skill) => <SelectItem key={skill.id} value={skill.id}>{skill.name}</SelectItem>)}</SelectContent></Select></div><DialogFooter><Button type="submit" className="cursor-pointer">Create task</Button></DialogFooter></form></DialogContent></Dialog>
    </Card>
  )
}

function TaskRow({ task, ticketId, skills, onChange }: { task: DailyTask; ticketId: string; skills: Skill[]; onChange: (ticket: DailyTicket) => void }) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState(task.task_name)
  const [description, setDescription] = React.useState(task.task_description)
  const [skillId, setSkillId] = React.useState(task.skill_id)
  const [status, setStatus] = React.useState(task.status)
  const [editingName, setEditingName] = React.useState(false)
  const [editingDescription, setEditingDescription] = React.useState(false)
  const [editingSkill, setEditingSkill] = React.useState(false)
  const [editingStatus, setEditingStatus] = React.useState(false)

  function openTask() {
    setName(task.task_name); setDescription(task.task_description); setSkillId(task.skill_id); setStatus(task.status)
    setEditingName(false); setEditingDescription(false); setEditingSkill(false); setEditingStatus(false); setOpen(true)
  }
  async function saveChanges() {
    try {
      let nextTicket = await updateTaskText(ticketId, task.id, name, description)
      if (skillId !== task.skill_id) nextTicket = await updateTaskSkill(ticketId, task.id, skillId)
      if (status !== task.status) nextTicket = await updateTaskStatus(ticketId, task.id, status)
      onChange(nextTicket); setOpen(false); toast.add({ title: "Task updated", type: "success" })
    } catch (error) { toast.add({ title: "Could not update task", description: error instanceof Error ? error.message : "Try again", type: "error" }) }
  }
  async function changeStatus(status: TaskStatus) { try { onChange(await updateTaskStatus(ticketId, task.id, status)) } catch (error) { toast.add({ title: "Could not update status", description: error instanceof Error ? error.message : "Try again", type: "error" }) } }
  async function remove() { try { onChange(await deleteTask(ticketId, task.id)); setOpen(false); toast.add({ title: "Task deleted", type: "success" }) } catch (error) { toast.add({ title: "Could not delete task", description: error instanceof Error ? error.message : "Try again", type: "error" }) } }

  return <><TableRow onClick={openTask} className="cursor-pointer"><TableCell>{task.task_name}</TableCell><TableCell><Badge>{skills.find((skill) => skill.id === task.skill_id)?.name ?? "Unknown"}</Badge></TableCell><TableCell><Select value={task.status} onValueChange={(value) => value && changeStatus(value as TaskStatus)}><SelectTrigger onPointerDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()} className="h-auto w-fit border-0 bg-transparent p-0 shadow-none hover:bg-transparent [&>svg]:hidden"><Badge className={`pointer-events-none ${statusColors[task.status]}`}>{task.status}</Badge></SelectTrigger><SelectContent onPointerDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>{statuses.map((status) => <SelectItem key={status} value={status} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}><Badge className={`pointer-events-none ${statusColors[status]}`}>{status}</Badge></SelectItem>)}</SelectContent></Select></TableCell><TableCell><Button variant="ghost" size="icon" aria-label="Task actions" onClick={(event) => { event.stopPropagation(); openTask() }} className="cursor-pointer text-muted-foreground"><MoreHorizontal /></Button></TableCell></TableRow><Dialog open={open} onOpenChange={setOpen}><DialogContent onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && event.target instanceof HTMLElement && event.target.tagName !== "BUTTON") { event.preventDefault(); void saveChanges() } }}><DialogHeader><DialogTitle>Task</DialogTitle></DialogHeader><div className="space-y-5 py-4"><div className="space-y-2"><p className="text-sm font-medium">Task name</p><div onDoubleClick={() => setEditingName(true)}>{editingName ? <Input autoFocus value={name} onChange={(event) => setName(event.target.value)} /> : <p className="cursor-text">{name}</p>}</div></div><div className="space-y-2"><p className="text-sm font-medium">Description</p><div onDoubleClick={() => setEditingDescription(true)} className="rounded-md border px-3 py-2">{editingDescription ? <Textarea autoFocus value={description} onChange={(event) => setDescription(event.target.value)} /> : <p className="min-h-20 cursor-text whitespace-pre-wrap text-sm text-muted-foreground">{description || "No description"}</p>}</div></div><div className="space-y-2"><p className="text-sm font-medium">Skill</p><div onDoubleClick={() => setEditingSkill(true)}>{editingSkill ? <Select value={skillId} onValueChange={(value) => { if (value) { setSkillId(value); setEditingSkill(false) } }}><SelectTrigger><Badge className="pointer-events-none">{skills.find((skill) => skill.id === skillId)?.name ?? "Unknown"}</Badge></SelectTrigger><SelectContent>{skills.map((skill) => <SelectItem key={skill.id} value={skill.id}>{skill.name}</SelectItem>)}</SelectContent></Select> : <Badge className="cursor-text">{skills.find((skill) => skill.id === skillId)?.name ?? "Unknown"}</Badge>}</div></div><div className="space-y-2"><p className="text-sm font-medium">Status</p><div onDoubleClick={() => setEditingStatus(true)}>{editingStatus ? <Select value={status} onValueChange={(value) => { if (value) { setStatus(value as TaskStatus); setEditingStatus(false) } }}><SelectTrigger><Badge className={`pointer-events-none ${statusColors[status]}`}>{status}</Badge></SelectTrigger><SelectContent>{statuses.map((value) => <SelectItem key={value} value={value}><Badge className={`pointer-events-none ${statusColors[value]}`}>{value}</Badge></SelectItem>)}</SelectContent></Select> : <Badge className={`pointer-events-none ${statusColors[status]}`}>{status}</Badge>}</div></div></div><DialogFooter className="justify-between"><Button variant="ghost" size="icon" aria-label="Delete task" onClick={remove} className="cursor-pointer text-muted-foreground"><Trash2 /></Button></DialogFooter></DialogContent></Dialog></>
}
